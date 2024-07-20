import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { AccountStatus } from 'src/constants/enum';

export class UpdateUserStatusRequestDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;
}
