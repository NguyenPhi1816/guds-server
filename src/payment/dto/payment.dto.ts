import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDate()
  @ValidateIf((object, value) => value !== null)
  paymentDate: Date | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  transactionId: string | null;
}
