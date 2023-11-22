from base64 import b64encode
import base64
import multiprocessing
import requests
from pybit import usdt_perpetual
import json
import datetime
import time
import pymongo
from bson.objectid import ObjectId
from multiprocessing import Process, Manager
from google.cloud import pubsub_v1
import os
import pytz
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./application_default_credentials.json"

# Converti la date courante en timestamp
dt = datetime.datetime.now(tz=pytz.utc)
unixtime = int(time.mktime(dt.timetuple()))

# Obtention de la DB
MONGO_URL = ''
endpoint = "https://api-testnet.bybit.com"


def entry_point(data, context):

    try:

        client = pymongo.MongoClient(MONGO_URL)
        db = client.get_database("tycho")

        traders_collection = db['traders']
        user_collection = db['users']
        symbols_collection = db['pairs']
        user_trades_collection = db['user_trades']

        username = "Fayzy"
        user = user_collection.find_one({"username": username})

    except:
        print("ERROR - Impossible to connect to the database or to get the infos of the user {}").format(username)
        return

    traders = list(traders_collection.find())

    client.close()

    manager = multiprocessing.Manager()
    trades_to_open = manager.dict()
    trades_to_close = manager.dict()

    banned_traders = [ObjectId("63c6a463674dd59792067cc3"), ObjectId(
        "63c6a4a5674dd59792067cc7")]

    proc = []
    for trader in traders:

        if (trader["_id"] not in banned_traders):
            p = Process(target=trader_job, args=(
                trader, trades_to_open, trades_to_close))
            proc.append(p)
            p.start()

    for p in proc:
        p.join()

    trades_to_open_official = []
    for v in trades_to_open.keys():
        trades_to_open_official = trades_to_open_official + trades_to_open[v]

    trades_to_close_official = []
    for v in trades_to_close.keys():
        trades_to_close_official = trades_to_close_official + \
            trades_to_close[v]

    if (len(trades_to_open_official) > 0 or len(trades_to_close_official) > 0):
        publish_trades_to_run(trades_to_open_official,
                              trades_to_close_official)

    if (user):

        try:
            session = usdt_perpetual.HTTP(
                endpoint=endpoint,
                api_key=user["apiKey"],
                api_secret=user["apiSecret"]
            )
        except:
            print(
                "ERROR - Impossible to establish the bybit session at the endpoint : {}").format(endpoint)
            return

        client = pymongo.MongoClient(MONGO_URL)
        db = client.get_database("tycho")

        symbols_collection = db['pairs']
        user_trades_collection = db['user_trades']

        closeUnclosedTrades(
            session, user, symbols_collection, user_trades_collection)

    return


def trader_job(trader, trades_to_open, trades_to_close):

    client = pymongo.MongoClient(MONGO_URL)
    db = client.get_database("tycho")

    trades_collection = db['trades']
    symbols_collection = db['pairs']

    current_trades = getCurrentTrades(trader)
    past_trades = getPastTrades(trader)

    insertCurrentTrades(
        current_trades, trader["_id"], trades_collection, symbols_collection, trades_to_open)

    insertPastTrades(
        past_trades, trader["_id"], trades_collection, symbols_collection, trades_to_close)

    client.close()

    return


def numberConverter(number, modifier):
    return number/pow(10, modifier)


def getCurrentTrades(trader):

    request_url = 'https://api2.bybit.com/fapi/beehive/public/v1/common/order/list-detail?timeStamp={}&leaderMark={}'.format(
        unixtime, trader['leaderMark'])

    try:
        response = requests.get(request_url, timeout=15)
        current_trades = json.loads(response.text)["result"]["data"]

        return current_trades

    except Exception as e:
        print('ERROR - Concerns the recovery of the current trades of the trader {} with leaderMark {}'.format(
            trader['name'], trader['leaderMark']))
        print(e)

        return []


def getPastTrades(trader):

    request_url = 'https://api2.bybit.com/fapi/beehive/public/v1/common/leader-history?timeStamp={}&page=1&pageSize=30&leaderMark={}'.format(
        unixtime, trader['leaderMark'])

    try:
        response = requests.get(request_url, timeout=15)
        past_trades = json.loads(response.text)["result"]["data"]

        return past_trades

    except Exception as e:
        print('ERROR - Concerns the recovery of the old trades of the trader {} with the leaderMark {}'.format(
            trader['name'], trader['leaderMark']))
        print(e)

        return []


def insertCurrentTrades(trades, traderId, trades_collection, symbols_collection, trades_to_open):

    trades_to_open_arr = []

    for trade in trades:

        try:

            trade_in_database = trades_collection.find_one(
                {"$and": [{"startedDate": datetime.datetime.fromtimestamp(int(numberConverter(int(trade["transactTimeE3"]), 3)), tz=pytz.utc)}, {'createdAt': trade["createdAtE3"]}, {"entryPrice": float(trade["entryPrice"])}, {"trader": ObjectId(traderId)}, {"isOpen": True}]})

            if (not trade_in_database):

                symbol = symbols_collection.find_one({
                    "title": trade["symbol"]
                })

                if (not symbol):
                    print(
                        "ERROR - Symbol {} not found").format(trade["symbol"])

                trade_to_insert = {
                    "startedDate": datetime.datetime.fromtimestamp(int(numberConverter(int(trade["transactTimeE3"]), 3)), tz=pytz.utc),
                    "createdAt": trade["createdAtE3"],
                    "isOpen": True,
                    "leverage": numberConverter(int(trade["leverageE2"]), 2),
                    "symbol": symbol["_id"],
                    "trader": traderId,
                    "size": numberConverter(int(trade["sizeX"]), 8),
                    "side": trade["side"],
                    "entryPrice": float(trade["entryPrice"])
                }

                if (trade["takeProfitPrice"]):
                    trade_to_insert["takeProfitPrice"] = float(
                        trade["takeProfitPrice"])

                if (trade["stopLossPrice"]):
                    trade_to_insert["stopLossPrice"] = float(
                        trade["stopLossPrice"])

                trade_inserted = trades_collection.insert_one(trade_to_insert)
                trade_inserted_object = trades_collection.find_one(
                    {"_id": ObjectId(trade_inserted.inserted_id)})
                trade_inserted_object["startedDate"] = trade_inserted_object["startedDate"].strftime(
                    "%Y-%m-%dT%H:%M:%S.000Z")

                trade_inserted_object["_id"] = str(
                    trade_inserted_object["_id"])
                trade_inserted_object["trader"] = str(
                    trade_inserted_object["trader"])
                trade_inserted_object["symbol"] = str(
                    trade_inserted_object["symbol"])
                trade_inserted_object["isOpen"] = str(
                    trade_inserted_object["isOpen"])

                trades_to_open_arr.append(trade_inserted_object)

        except:
            print(
                "ERROR - In the insertion of open trades for the trader {}".format(traderId))

    trades_to_open[str(traderId)] = trades_to_open_arr

    return


def insertPastTrades(trades, traderId, trades_collection, symbols_collection, trades_to_close):

    trades_to_close_arr = []

    # A changer pour permettre que si plusieurs trades ajoutés au même moment, au même prix sont fermés, que les 2 puissent être fermés
    # Ajouter un critère de recherche du trade en base : que ce soit bien la bonne crypto, la bonne quantité

    for trade in trades:

        trade_in_database = trades_collection.find_one({
            "$and": [
                {"entryPrice": float(trade["entryPrice"])},
                {"startedDate": datetime.datetime.fromtimestamp(
                    int(numberConverter(int(trade["startedTimeE3"]), 3)), tz=pytz.utc)},
                {"trader": ObjectId(traderId)}
            ]
        })

        if (trade_in_database):

            if (trade_in_database["isOpen"]):

                trade_in_database["isOpen"] = False
                trade_in_database["closedDate"] = datetime.datetime.fromtimestamp(
                    int(numberConverter(int(trade["closedTimeE3"]), 3)), tz=pytz.utc)
                trade_in_database["closedPrice"] = float(trade["closedPrice"])
                trade_in_database["orderId"] = trade["orderId"]
                trade_in_database["orderNetProfit"] = numberConverter(
                    int(trade["orderNetProfitE8"]), 8)

                replaced_trade = trades_collection.find_one_and_update(
                    {"_id": trade_in_database["_id"]}, {"$set": trade_in_database}, upsert=True)

                replaced_trade["startedDate"] = replaced_trade["startedDate"].strftime(
                    "%Y-%m-%dT%H:%M:%S.000Z")

                replaced_trade["_id"] = str(replaced_trade["_id"])
                replaced_trade["trader"] = str(
                    replaced_trade["trader"])
                replaced_trade["symbol"] = str(
                    replaced_trade["symbol"])
                replaced_trade["isOpen"] = str(
                    replaced_trade["isOpen"])

                trades_to_close_arr.append(replaced_trade)

        else:

            symbol = symbols_collection.find_one({
                "title": trade["symbol"]
            })

            if (not symbol):
                print("ERROR - Symbol {} not found").format(trade["symbol"])

            trade_to_insert = {
                "startedDate": datetime.datetime.fromtimestamp(int(numberConverter(int(trade["startedTimeE3"]), 3)), tz=pytz.utc),
                "isOpen": False,
                "leverage": numberConverter(int(trade["leverageE2"]), 2),
                "symbol": symbol["_id"],
                "trader": traderId,
                "size": float(trade["size"]),
                "side": trade["side"],
                "entryPrice": float(trade["entryPrice"]),
                "closedDate": datetime.datetime.fromtimestamp(int(numberConverter(int(trade["closedTimeE3"]), 3)), tz=pytz.utc),
                "closedPrice": float(trade["closedPrice"]),
                "orderId": trade["orderId"],
                "orderNetProfit":
                    numberConverter(int(trade["orderNetProfitE8"]), 8)
            }

            trades_collection.insert_one(trade_to_insert)

    trades_to_close[str(traderId)] = trades_to_close_arr

    return


def publish_trades_to_run(trades_to_open, trades_to_close):

    project_id = "tycho-365206"
    topic_id = "tycho-trades-running"

    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic_id)

    data = {"trades_to_open": trades_to_open,
            "trades_to_close": trades_to_close}
    message_bytes = str(data).encode('utf-8')

    future = publisher.publish(
        topic_path, data=message_bytes, origin="python-sample", username="fayzy"
    )

    return


def get_infos_of_symbols(trades, symbols_collection, session, without_prices):
    infos = {}

    for trade in trades:
        if (not trade["symbol"] in infos):

            symbol = symbols_collection.find_one({
                "_id": ObjectId(trade["symbol"])
            })

            if (not symbol):
                print("ERROR - Symbol {} not found").format(trade["symbol"])

            if (not without_prices):
                infos[trade["symbol"]] = {
                    "title": symbol["title"],
                    "price": float(next(filter(lambda x: x["symbol"] == symbol["title"],
                                               session.latest_information_for_symbol()["result"]), None)["last_price"])
                }
            else:
                infos[trade["symbol"]] = {
                    "title": symbol["title"],
                }

    return infos


def getConditionalOrders(trades):
    conditional_orders = []

    for trade in trades:
        if ("cond_orders" in trade):
            conditional_orders.extend(trade["cond_orders"])

    return conditional_orders


def closeUnclosedTrades(session, user, symbols_collection, user_trades_collection):

    aggregation = [
        {
            '$match': {"user": user["_id"], "isOpen": True}
        },
        {
            '$group': {
                '_id': '$symbol',
                'trades': {
                    '$push': '$$ROOT'
                },
                'minEntryPrice': {'$min': '$entryPrice'
                                  },
                'maxEntryPrice': {'$max': '$entryPrice'
                                  },
                'totalQty': {
                    '$sum': '$size'
                }
            }
        }
    ]

    opened_trades = list(user_trades_collection.aggregate(aggregation))

    for symbol in opened_trades:

        infos = get_infos_of_symbols(
            symbol["trades"], symbols_collection, session, True)

        conditional_orders = getConditionalOrders(symbol["trades"])

        for trade in symbol["trades"]:

            closed_trades = session.closed_profit_and_loss(
                symbol=infos[trade["symbol"]]["title"])

            if (closed_trades['result']['data'] != None):

                slice_object = None
                if (len(closed_trades['result']['data']) >= 50):
                    slice_object = slice(50)
                else:
                    slice_object = slice(
                        len(closed_trades['result']['data']))

                closed_trades = closed_trades['result']['data'][slice_object]

                research_closed_trades_infos = research_closed_trades(
                    trade, closed_trades, infos[trade["symbol"]]["title"], conditional_orders)

                if (research_closed_trades_infos["found"]):
                    trade["isOpen"] = False
                    trade["closedPrice"] = research_closed_trades_infos["closedPrice"]
                    trade["closedDate"] = datetime.datetime.now(tz=pytz.utc)

                    newTradeObject = {
                        **trade, "closeOrderId": research_closed_trades_infos["orderId"]}

                    user_trades_collection.find_one_and_update(
                        {"_id": ObjectId(trade["_id"])}, {"$set": newTradeObject}, upsert=True)

    return


def research_closed_trades(trade, closed_trades, symbol, conditional_orders):
    found = False
    closedPrice = None
    orderId = None

    researched_side = None
    if (trade["side"] == 'Buy'):
        researched_side = 'Sell'
    else:
        researched_side = 'Buy'

    i = 0
    while (found == False and i < len(closed_trades)):

        if (closed_trades[i]["side"] == researched_side and closed_trades[i]["symbol"] == symbol and closed_trades[i]["order_id"] in conditional_orders):
            found = True
            closedPrice = closed_trades[i]["avg_exit_price"]
            orderId = closed_trades[i]["order_id"]

        i += 1

    return {"found": found, "closedPrice": closedPrice, "orderId": orderId}
