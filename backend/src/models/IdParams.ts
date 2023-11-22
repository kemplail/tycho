import { IsMongoId } from 'class-validator'

export class IdParam {
  @IsMongoId()
  id: string
}
