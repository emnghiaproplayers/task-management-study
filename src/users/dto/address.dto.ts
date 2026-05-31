import { IsString, MinLength, Matches } from 'class-validator';

export class AddressDto {
  @IsString()
  @MinLength(3)
  street: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @Matches(/^\d{4,10}$/, {
    message: 'zipCode must be a numeric string between 4 and 10 digits',
  })
  zipCode: string;
}
