import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  Get,
  UseGuards
} from '@nestjs/common'
import { IdParam } from '../models/IdParams'
import { UpdateTraderDto } from '../models/traders/update-trader.dto'
import { CreateTraderDto } from '../models/traders/create-trader.dto'
import { GetTraderInfosOutput } from '../models/traders/get-trader-infos-output'
import { TraderService } from '../services/trader.service'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { GetTraderClassementDto } from '../models/traders/get-trader-classement.dto'
import { GetTraderLastTradesDto } from '../models/traders/get-trader-last-trades.dto'
import { GetTraderInfosDto } from '../models/traders/get-trader-infos.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards'

@Controller('traders')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTraderDto: CreateTraderDto) {
    return this.traderService.create(createTraderDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.traderService.getAll()
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async delete(@Param() traderId: IdParam) {
    return this.traderService.delete(traderId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async update(
    @Param() traderId: IdParam,
    @Body() updateTraderDto: UpdateTraderDto
  ) {
    return this.traderService.update(traderId, updateTraderDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('trader-profile/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get a trader' })
  async getATrader(@Param() traderId: IdParam) {
    return this.traderService.getATrader(traderId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('informations/:id')
  @ApiResponse({
    type: GetTraderInfosOutput
  })
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get informations about a trader' })
  async getTraderInfos(
    @Param() traderId: IdParam,
    @Body() getTraderInfosDto: GetTraderInfosDto
  ) {
    return this.traderService.getTraderInfos(traderId, getTraderInfosDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('classement')
  @ApiOperation({ summary: 'Get classement of traders' })
  async getTraderClassement(
    @Body() getTraderClassementDto: GetTraderClassementDto
  ) {
    return this.traderService.getTraderClassement(getTraderClassementDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('last-trades/:id')
  @ApiOperation({ summary: 'Get last trades of a trader' })
  async getLastTrades(
    @Param() traderId: IdParam,
    @Body() getTraderLastTradesDto: GetTraderLastTradesDto
  ) {
    return this.traderService.getLastTrades(traderId, getTraderLastTradesDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('last-trades-details/:id')
  @ApiOperation({ summary: 'Get last trades in details of a trader' })
  async getLastTradesDetails(@Param() traderId: IdParam) {
    return this.traderService.getLastTradesDetails(traderId)
  }
}
