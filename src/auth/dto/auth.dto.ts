import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class AuthDTO {
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
