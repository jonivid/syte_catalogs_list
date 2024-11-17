import { IsEmail, IsString, MinLength } from 'class-validator';

export class ValidateUserDto {
  id: number;
  username: string;
  email: string;
  clientId: number;
}
export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  username: string;
  accessToken: string;
}
