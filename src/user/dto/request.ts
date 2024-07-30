import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { AccountStatus } from 'src/constants/enum';

export class UpdateUserStatusRequestDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;
}

export class UpdateUserInforRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsOptional()
  @IsUrl()
  image: string;
}
