import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { AccountStatus, UserRoles } from 'src/constants/enum';

export class UserResponseDto {
  @IsInt()
  id: number;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  address: string;
  @IsPhoneNumber('VN')
  phoneNumber: string;
  @IsString()
  gender: string;
  @IsDateString()
  dateOfBirth: Date;
  @IsUrl()
  image: string | null;
  @IsEmail()
  email: string;
  @IsEnum(AccountStatus)
  status: string;
  @IsEnum(UserRoles)
  role: string;
}
