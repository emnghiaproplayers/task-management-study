import { IsEmail, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';
import { IsCorporateEmail } from '../validators/is-corporate-email.validator';

export class CreateUserDto {
  @IsEmail()
  @IsCorporateEmail()
  email: string;

  @IsDefined({ message: 'address is required' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
