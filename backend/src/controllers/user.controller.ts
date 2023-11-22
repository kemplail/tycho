import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common'
import { CreateUserDto } from '../models/users/dto/create-user.dto'
import { UserService } from '../services/user.service'
import { User } from '../models/users/user.schema'
import { IdParam } from 'src/models/IdParams'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards'
import { SetTradersDto } from 'src/models/users/dto/set-traders.dto'
import { GetTraderInfosOutput } from 'src/models/traders/get-trader-infos-output'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { GetTraderInfosDto } from 'src/models/traders/get-trader-infos.dto'
import { CloseTradeDto } from 'src/models/users/dto/close-trade.dto'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDTO: CreateUserDto): Promise<User> {
    return this.userService.create(createPostDTO)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param() param: IdParam) {
    return this.userService.findOne(param)
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-traders')
  async setTraders(@Request() req, @Body() setTradersDto: SetTradersDto) {
    return this.userService.setTraders(setTradersDto, req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Post('bybit-informations')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get bybit informations about a user' })
  async getUserBybitInfos(@Request() req) {
    return this.userService.getUserBybitInfos(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Post('user-informations')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get informations about a user' })
  async getUserInfos(
    @Request() req,
    @Body() getTraderInfosDto: GetTraderInfosDto
  ) {
    return this.userService.getUserInfos(req.user, getTraderInfosDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('last-trades-details')
  @ApiOperation({ summary: 'Get last trades in details of an user' })
  async getLastUserTradesDetails(@Request() req) {
    return this.userService.getLastUserTradesDetails(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Post('close-trade')
  @ApiOperation({ summary: 'Close open trade of an user' })
  async closeUserTrade(@Request() req, @Body() closeTradeDto: CloseTradeDto) {
    return this.userService.closeUserTrade(req.user, closeTradeDto)
  }
}
