import { IsMongoId } from 'class-validator'

export class GetTradesDetailsDto {
  @IsMongoId({ each: true })
  trades: string[]
}
