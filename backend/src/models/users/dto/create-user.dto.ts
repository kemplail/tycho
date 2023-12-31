import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username: string
  @ApiProperty()
  @IsString()
  password: string
  @ApiProperty()
  @IsString()
  apiKey: string
  @ApiProperty()
  @IsString()
  apiSecret: string
}
