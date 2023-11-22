import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TradeController } from './controllers/trade.controller'
import { TraderController } from './controllers/trader.controller'
import { Pair, PairSchema } from './models/pairs/pair.schema'
import { Trader, TraderSchema } from './models/traders/trader.schema'
import { Trade, TradeSchema } from './models/trades/trade.schema'
import { AggregationService } from './services/aggregation.service'
import { TradeService } from './services/trade.service'
import { TraderService } from './services/trader.service'
import { CcxtModule } from 'nestjs-ccxt'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { TraderDeletedListener } from './listeners/TraderDeletedListener'
import { UserService } from './services/user.service'
import { AuthService } from './auth/auth.service'
import { UserController } from './controllers/user.controller'
import { User, UserSchema } from './models/users/user.schema'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './auth/constants'
import { LocalStrategy } from './auth/local.strategy'
import { JwtStrategy } from './auth/jwt.strategy'
import { TradeUser, TradeUserSchema } from './models/trades/trade-user.schema'

@Module({
  imports: [
    MongooseModule.forRoot(''),
    // MongooseModule.forRoot(process.env.SECRET_DB_LINK),
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: Trader.name, schema: TraderSchema },
      { name: Trade.name, schema: TradeSchema },
      { name: Pair.name, schema: PairSchema },
      { name: User.name, schema: UserSchema },
      { name: TradeUser.name, schema: TradeUserSchema }
    ]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '100000s' }
    }),
    CcxtModule.forRoot({
      sandboxMode: true
    })
  ],
  controllers: [
    AppController,
    TraderController,
    TradeController,
    UserController
  ],
  providers: [
    LocalStrategy,
    JwtStrategy,
    AppService,
    TraderService,
    TradeService,
    UserService,
    AuthService,
    TraderDeletedListener,
    AggregationService
  ]
})
export class AppModule {}
