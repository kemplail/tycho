import time
from pybit import usdt_perpetual
import pymongo
import json
import base64
import datetime
from bson.objectid import ObjectId
from multiprocessing import Process
import pytz

# Obtention de la DB
MONGO_URL = ''

symbols_infos = {
    "BTCUSDT": {"qty": 0.001, "round": 2},
    "ETHUSDT": {"qty": 0.01, "round": 2},
    "XRPUSDT": {"qty": 1, "round": 4},
    "LTCUSDT": {"qty": 0.1, "round": 2},
    "LINKUSDT": {"qty": 0.1, "round": 4},
    "ADAUSDT": {"qty": 1, "round": 4},
    "MATICUSDT": {"qty": 1, "round": 4},
    "BNBUSDT": {"qty": 0.01, "round": 2},
    "SOLUSDT": {"qty": 0.1, "round": 2},
    "AXSUSDT": {"qty": 0.1, "round": 2},
    "SANDUSDT": {"qty": 1, "round": 4},
    "ATOMUSDT": {"qty": 0.1, "round": 2},
    "AVAXUSDT": {"qty": 0.1, "round": 2},
    "FTMUSDT": {"qty": 1, "round": 4},
    "NEARUSDT": {"qty": 0.1, "round": 4},
    "FTTUSDT": {"qty": 0.1, "round": 2},
    "BITUSDT": {"qty": 0.1, "round": 3},
    "DOTUSDT": {"qty": 0.1, "round": 3},
    "EOSUSDT": {"qty": 0.1, "round": 3},
    "UNIUSDT": {"qty": 0.1, "round": 3},
    "SUSHIUSDT": {"qty": 0.1, "round": 3},
    "AAVEUSDT": {"qty": 0.01, "round": 2},
    "DOGEUSDT": {"qty": 1, "round": 5},
    "ETCUSDT": {"qty": 0.1, "round": 3},
    "CHZUSDT": {"qty": 1, "round": 5},
    "CRVUSDT": {"qty": 0.1, "round": 3},
    "SHIB1000USDT": {"qty": 10, "round": 6},
    "DYDXUSDT": {"qty": 0.1, "round": 3},
    "GALAUSDT": {"qty": 1, "round": 5},
    "MKRUSDT": {"qty": 0.001, "round": 1},
    "ENSUSDT": {"qty": 0.1, "round": 2},
    "ANKRUSDT": {"qty": 1, "round": 5},
    "MASKUSDT": {"qty": 0.1, "round": 3},
    "REEFUSDT": {"qty": 10, "round": 6},
    "APEUSDT": {"qty": 0.1, "round": 3},
    "GMTUSDT": {"qty": 1, "round": 4},
    "LUNA2USDT": {"qty": 0.1, "round": 3},
    "OPUSDT": {"qty": 0.1, "round": 4},
    "LDOUSDT": {"qty": 0.1, "round": 4},
    "APTUSDT": {"qty": 0.01, "round": 3},
    "GMXUSDT": {"qty": 0.01, "round":  3}
}

not_available_pairs = ["ATOMUSDT", "FTTUSDT"]
endpoint = "https://api-testnet.bybit.com"

params = {'start_perc_long': 101.56, 'start_perc_short': 98.44, 'start_perc_capital': 0.149,
          'perc_capital_multiplier': 1.725, 'perc_price_multiplier_long': 1.001, 'perc_price_multiplier_short': 0.999}


def get_number_open_trades(trade, user_trades_collection):

    pipeline = [{
        "$match": {
            "symbol": ObjectId(trade["symbol"]),
            "isOpen": True,
            "side": trade["side"]
        }
    }]

    res = list(user_trades_collection.aggregate(pipeline))

    return len(res)


def multiply(number, coeff, nb):
    if (nb == 0):
        return number
    else:
        return multiply(number*coeff, coeff, nb-1)


def get_conditional_orders(symbol, session, order_saved):

    tp = None
    sl = None

    while (not tp or not sl):

        slice_object = slice(4)
        orders = session.get_conditional_order(
            symbol=symbol)

        if (orders['result']['data'] is not None):
            orders = orders['result']['data'][slice_object]

            i = 0

            while ((not tp or not sl) and i < len(orders)):

                if (orders[i]["trigger_price"] == order_saved["takeProfitPrice"] and orders[i]["symbol"] == symbol and orders[i]["qty"] >= order_saved["size"] and not tp):
                    tp = {
                        "price": orders[i]["trigger_price"],
                        "order_id": orders[i]["stop_order_id"]
                    }
                elif (orders[i]["trigger_price"] == order_saved["stopLossPrice"] and orders[i]["symbol"] == symbol and orders[i]["qty"] >= order_saved["size"] and not sl):
                    sl = {
                        "price": orders[i]["trigger_price"],
                        "order_id": orders[i]["stop_order_id"]
                    }

                i += 1

        time.sleep(1)

    return {
        "tp": tp,
        "sl": sl
    }


def getTPFirstTrade(trade, user_trades_collection):

    sort = None

    if (trade["side"] == "Sell"):
        sort = 1
    else:
        sort = -1

    pipeline = [
        {
            "$match": {
                "symbol": ObjectId(trade["symbol"]),
                "isOpen": True,
                "side": trade["side"]
            }},
        {"$sort": {"entryPrice": sort}},
        {"$limit": 1}
    ]

    res = list(user_trades_collection.aggregate(pipeline))

    if (len(res) > 0):
        return res[0]["takeProfitPrice"]

    return


def trades_price_condition(trade, user_trades_collection, infos):

    symbolPrice = infos[trade["symbol"]]["price"]

    number_open_trades = get_number_open_trades(trade, user_trades_collection)

    if (number_open_trades > 0):

        percentage_long = params["start_perc_long"]
        percentage_short = params["start_perc_short"]

        if (number_open_trades > 1):
            percentage_long = multiply(
                percentage_long, params["perc_price_multiplier_long"], number_open_trades-1)
            percentage_short = multiply(
                percentage_short, params["perc_price_multiplier_short"], number_open_trades-1)

        pipeline = [
            {
                "$match": {
                    "symbol": ObjectId(
                        trade["symbol"]),
                    "isOpen": True,
                    "side": trade["side"]
                }
            },
            {
                "$sort": {
                    "startedDate": -1
                }
            },
            {
                "$limit": 1
            }
        ]

        cond = None
        if (trade["side"] == "Buy"):
            cond = {
                "$cond": {
                    "if":
                    {
                        "$gt":
                        [{
                            "$multiply": [
                                {
                                    "$divide": [
                                        "$entryPrice", symbolPrice
                                    ]
                                },
                                100
                            ]
                        },  percentage_long]
                    },
                    "then":
                    True,
                    "else":
                    False
                }
            }
        else:
            cond = {
                "$cond": {
                    "if":
                    {
                        "$lt":
                        [{
                            "$multiply": [
                                {
                                    "$divide": [
                                        "$entryPrice", symbolPrice
                                    ]
                                },
                                100
                            ]
                        },  percentage_short]
                    },
                    "then":
                    True,
                    "else":
                    False
                }
            }

        pipeline.append({
            "$addFields": {
                "priceCond": cond
            }
        })
        pipeline.append({
            "$match": {
                "priceCond": True
            }
        })

        trades = list(user_trades_collection.aggregate(pipeline))

        if (len(trades) == 1):
            return True

        return False

    else:

        return True


def capital_exposure_condition(session):

    return ((session.get_wallet_balance()['result']['USDT']['available_balance'] / session.get_wallet_balance()['result']['USDT']['equity']) * 100) > 0


def get_trades_of_right_traders(trades, user):
    filtered_trades = []
    for trade in trades:
        if (ObjectId(trade["trader"]) in user["traders"]):
            filtered_trades.append(trade)

    return filtered_trades


def get_infos_of_symbols(trades, symbols_collection, session, without_prices):
    infos = {}

    for trade in trades:
        if (not trade["symbol"] in infos):

            symbol = symbols_collection.find_one({
                "_id": ObjectId(trade["symbol"])
            })

            if (not symbol):
                print(
                    "ERROR - Symbol {} not found in database").format(trade["symbol"])

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


def entry_point(event, context):

    try:
        pmessage = event['data']
        pubsub_message = base64.b64decode(pmessage).decode('utf-8')
        pubsub_modified = pubsub_message.replace("\'", "\"")
        data = json.loads(pubsub_modified)

    except:
        print("ERROR - Impossible to decode the pubsub content")
        return

    try:

        client = pymongo.MongoClient(MONGO_URL)
        db = client.get_database("tycho")

        user_collection = db['users']
        symbols_collection = db['pairs']
        user_trades_collection = db['user_trades']

        username = "Fayzy"
        user = user_collection.find_one({"username": username})

    except:
        print("ERROR - Impossible to connect to the database or to get the infos of the user {}").format(username)
        return

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

        # Si il existe des trades à ouvrir
        if (len(data["trades_to_open"]) > 0):

            # On récupère seulement les trades des traders suivis par user
            trades_to_open = get_trades_of_right_traders(
                data["trades_to_open"], user)

            if (len(trades_to_open) > 0):
                start_trades(trades_to_open, session,
                             symbols_collection, user_trades_collection, user)

        # Si il existe des trades à fermer
        if (len(data["trades_to_close"]) > 0):
            trades_to_close = get_trades_of_right_traders(
                data["trades_to_close"], user)

            print(trades_to_close)

            if (len(trades_to_close) > 0):
                close_trades(trades_to_close, session,
                             symbols_collection, user_trades_collection)

    return


def start_trades(trades, session, symbols_collection, user_trades_collection, user):

    proc = []

    # Pour chaque trade à ouvrir
    for trade in trades:

        # Récupère les prix associés aux symbols des trades
        infos = get_infos_of_symbols(
            [trade], symbols_collection, session, False)

        if (infos[trade["symbol"]]["title"] not in not_available_pairs):

            cap_condition = capital_exposure_condition(session)

            if (cap_condition):

                price_condition = (trade["side"] == 'Sell' and ((infos[trade["symbol"]]["price"] - trade["entryPrice"]) / trade["entryPrice"])*100 > -0.5) or (
                    trade["side"] == 'Buy' and ((infos[trade["symbol"]]["price"] - trade["entryPrice"]) / trade["entryPrice"])*100 < 0.5)

                if (price_condition):
                    v_trades_price_condition = trades_price_condition(
                        trade, user_trades_collection, infos)

                    if (v_trades_price_condition):

                        v_qty_to_allocate = get_number_open_trades(
                            trade, user_trades_collection)

                        if (trade["leverage"] > 3):
                            leverage = 3
                        else:
                            leverage = trade["leverage"]

                        try:
                            session.set_leverage(
                                symbol=infos[trade["symbol"]]["title"], buy_leverage=leverage, sell_leverage=leverage)
                        except:
                            pass

                        if (v_qty_to_allocate > 0):
                            tp = getTPFirstTrade(trade, user_trades_collection)
                        else:
                            if ("takeProfitPrice" in trade):
                                tp = trade["takeProfitPrice"]
                            else:
                                if (trade["side"] == "Buy"):
                                    tp = round(infos[trade["symbol"]]["price"] + (infos[trade["symbol"]]
                                                                                  ["price"]*0.33), symbols_infos[infos[trade["symbol"]]["title"]]["round"])
                                else:
                                    tp = round(infos[trade["symbol"]]["price"] - (infos[trade["symbol"]]
                                                                                  ["price"]*0.33), symbols_infos[infos[trade["symbol"]]["title"]]["round"])

                        if ("stopLossPrice" in trade):
                            sl = trade["stopLossPrice"]
                        else:
                            if (trade["side"] == "Buy"):
                                sl = round(infos[trade["symbol"]]["price"] - (infos[trade["symbol"]]
                                                                              ["price"]*0.33), symbols_infos[infos[trade["symbol"]]["title"]]["round"])
                            else:
                                sl = round(infos[trade["symbol"]]["price"] + (infos[trade["symbol"]]
                                                                              ["price"]*0.33), symbols_infos[infos[trade["symbol"]]["title"]]["round"])

                        qty = multiply(
                            params["start_perc_capital"], params["perc_capital_multiplier"], v_qty_to_allocate)

                        amount = (session.get_wallet_balance()[
                            'result']['USDT']['equity']*qty)

                        if (amount <= session.get_wallet_balance()['result']['USDT']['available_balance']):
                            amount = amount*leverage

                            def_qty = amount/infos[trade["symbol"]]["price"]
                            def_qty = round(def_qty, 5)

                            if (def_qty < symbols_infos[infos[trade["symbol"]]["title"]]["qty"]):
                                def_qty = symbols_infos[infos[trade["symbol"]]
                                                        ["title"]]["qty"]

                            order = session.place_active_order(
                                side=trade["side"], symbol=infos[trade["symbol"]]["title"], order_type="Market", qty=def_qty, reduce_only=False, time_in_force="FillOrKill", close_on_trigger=False, take_profit=tp, stop_loss=sl)

                            if ((order and order["ret_msg"] == "OK")):

                                time.sleep(1)

                                recorded_order = session.query_active_order(
                                    order_id=order['result']['order_id'], symbol=infos[trade["symbol"]]["title"])

                                if ((recorded_order and recorded_order['ret_msg'] == "OK" and recorded_order['result']['order_status'] != 'Canceled')):

                                    startedDate = datetime.datetime.now(
                                        tz=pytz.utc)

                                    entryPrice = recorded_order['result']["cum_exec_value"] / \
                                        recorded_order['result']["cum_exec_qty"]

                                    order_to_save = {'associatedTrade': ObjectId(trade["_id"]), 'user': user["_id"], 'symbol': ObjectId(
                                        trade["symbol"]), 'isOpen': True, 'entryPrice': entryPrice, "leverage": leverage, "size": recorded_order['result']["cum_exec_qty"], "side": trade["side"], "takeProfitPrice": recorded_order['result']["take_profit"], "stopLossPrice": recorded_order['result']["stop_loss"], "startedDate": startedDate}

                                    order_saved = user_trades_collection.insert_one(
                                        order_to_save)

                                    order_saved = user_trades_collection.find_one(
                                        {"_id": order_saved.inserted_id})

                                    p = Process(target=apply_conditionnal_orders, args=(
                                        infos, trade, user, order_saved, user_trades_collection))
                                    p.start()
                                    proc.append(p)

                                else:
                                    print(
                                        "ERROR - (recorded_order) Impossible to fulfill the bybit trade with id {}".format(trade["_id"]))

                            else:
                                print(
                                    "ERROR - (order) Impossible to fulfill the bybit trade with id {}".format(trade["_id"]))

                        else:
                            print(
                                "INFO - Impossible to fullfill the trade with id {} because of insufficient balance".format(trade["_id"]))

                    else:
                        print("INFO - Trade associated with the trade {} can't be fullfilled because of number of trades already opened".format(
                            trade["_id"]))

                else:
                    print(
                        "INFO - Trade associated with the trade {} can't be fullfilled because of price difference".format(trade["_id"]))

            else:
                print("INFO - Trade associated with the trade {} can't be fullfilled because of capital exposure condition".format(
                    trade["_id"]))

        else:
            print("ERROR - Symbol {} not available".format(trade["symbol"]))

    for p in proc:
        p.join()

    return


def apply_conditionnal_orders(infos, trade, user, order_saved, user_trades_collection):

    try:
        session = usdt_perpetual.HTTP(
            endpoint=endpoint,
            api_key=user["apiKey"],
            api_secret=user["apiSecret"]
        )
    except:
        print("ERROR - Impossible to establish the bybit session at the endpoint : {}").format(endpoint)
        return

    client = pymongo.MongoClient(MONGO_URL)
    db = client.get_database("tycho")

    user_trades_collection = db['user_trades']

    cond_orders = get_conditional_orders(
        infos[trade["symbol"]]["title"], session, order_saved)

    order_saved["cond_orders"] = [cond_orders["tp"]
                                  ["order_id"], cond_orders["sl"]["order_id"]]

    user_trades_collection.find_one_and_update(
        {"_id": ObjectId(str(order_saved["_id"]))}, {"$set": order_saved}, upsert=True)

    client.close()

    return


def close_trades(trades, session, symbols_collection, user_trades_collection):

    for trade in trades:

        if (trade["symbol"] not in not_available_pairs):

            associated_trade = user_trades_collection.find_one(
                {"associatedTrade": ObjectId(trade["_id"]), "isOpen": True})

            if (associated_trade):

                infos = get_infos_of_symbols(
                    [trade], symbols_collection, session, False)

                newSide = None
                if (associated_trade["side"] == "Buy"):
                    newSide = "Sell"
                else:
                    newSide = "Buy"

                order = session.place_active_order(
                    side=newSide, symbol=infos[str(associated_trade["symbol"])]["title"], order_type="Market", qty=associated_trade["size"], reduce_only=True, time_in_force="FillOrKill", close_on_trigger=False, take_profit=associated_trade["takeProfitPrice"], stop_loss=associated_trade["stopLossPrice"])

                if ((order and order["ret_msg"] == "OK")):

                    time.sleep(1)

                    recorded_order = session.query_active_order(
                        order_id=order['result']['order_id'], symbol=infos[str(associated_trade["symbol"])]["title"])

                    if ((recorded_order and recorded_order['ret_msg'] == "OK" and recorded_order['result']['order_status'] != 'Canceled')):

                        associated_trade["isOpen"] = False
                        associated_trade["closedDate"] = datetime.datetime.now(
                            tz=pytz.utc)

                        closedPrice = recorded_order['result']["cum_exec_value"] / \
                            recorded_order['result']["cum_exec_qty"]

                        associated_trade["closedPrice"] = closedPrice

                        user_trades_collection.find_one_and_update(
                            {"_id": ObjectId(str(associated_trade["_id"]))}, {"$set": associated_trade}, upsert=True)

                    else:
                        print(
                            "ERROR - (recorded_order) Impossible to close the bybit trade with id ".format(trade["_id"]))

                else:
                    print(
                        "ERROR - (order) Impossible to close the bybit trade with id ".format(trade["_id"]))

            else:
                print(
                    "INFO - No trade found associated with trade {} to close".format(trade["_id"]))

        else:
            print("ERROR - Symbol {} not available".format(trade["symbol"]))

    return


def numberConverter(number, modifier):
    return number/pow(10, modifier)
