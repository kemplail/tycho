import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { TradeService } from '../services/trade.service'
import { GeneralFiltersDto } from '../models/trades/get-general-filters.dto'
import { GetTradesDetailsDto } from '../models/trades/get-trades-details.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards'

@Controller('trades')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('general-feeling')
  @ApiOperation({ summary: 'Get the general feeling of the market' })
  async getGeneralFeeling(@Body() getGeneralFeelingDto: GeneralFiltersDto) {
    return this.tradeService.getGeneralFeeling(getGeneralFeelingDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('statistics')
  @ApiOperation({ summary: 'Get the trades statistics' })
  async getStatistics(@Body() getStatisticsDto: GeneralFiltersDto) {
    return this.tradeService.getStatistics(getStatisticsDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('trades-details')
  @ApiOperation({ summary: 'Get details about a list of trades' })
  async getTradesDetails(@Body() getTradesDetailsDto: GetTradesDetailsDto) {
    return this.tradeService.getTradesDetails(getTradesDetailsDto)
  }
}
