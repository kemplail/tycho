import { Injectable } from '@nestjs/common'
import { UserService } from 'src/services/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { IdParam } from 'src/models/IdParams'
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username)

    const isMatch = await bcrypt.compare(pass, user.password)
    if (user && isMatch) {
      const { password, ...result } = user.toObject()
      return result
    } else {
      return null
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id }
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

  async loggedUser(userid: IdParam) {
    return await this.userService.findOne(userid)
  }
}
