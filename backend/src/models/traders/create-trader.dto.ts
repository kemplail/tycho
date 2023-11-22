import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateTraderDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  leaderMark: string

  @ApiProperty()
  @IsString()
  note: string
}
