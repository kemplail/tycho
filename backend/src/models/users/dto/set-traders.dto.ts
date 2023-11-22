import { IsMongoId } from 'class-validator'

export class SetTradersDto {
  @IsMongoId({ each: true })
  traders: string[]
}
