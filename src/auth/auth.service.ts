import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // Use bcryptjs instead of bcrypt
import {
  LoginRequestDto,
  LoginResponseDto,
  ValidateUserDto,
} from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(
    loginRequestDto: LoginRequestDto,
  ): Promise<ValidateUserDto | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginRequestDto.email },
        relations: ['client'],
      });
      if (
        user &&
        (await bcrypt.compare(loginRequestDto.password, user.password))
      ) {
        const userResponse: ValidateUserDto = {
          id: user.id,
          username: user.username,
          email: user.email,
          clientId: user.client.id,
        };
        return userResponse;
      }

      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      throw new Error('User validation failed');
    }
  }
  async login(user: ValidateUserDto): Promise<LoginResponseDto> {
    const payload = {
      email: user.email,
      sub: user.id,
      clientId: user.clientId,
    };
    const response: LoginResponseDto = {
      username: user.username,
      accessToken: this.jwtService.sign(payload),
    };
    return response;
  }
}
