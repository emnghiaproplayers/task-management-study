import { IsEmail, IsDefined, ValidateNested, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';
import { IsCorporateEmail } from '../validators/is-corporate-email.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'The corporate email address of the user',
  })
  @IsEmail()
  @IsCorporateEmail()
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The unique username of the user',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'P@ssword123',
    description: 'The secure password of the user (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'The system role assigned to the user',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    type: () => AddressDto,
    description: 'The physical address of the user',
  })
  @IsDefined({ message: 'address is required' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Optional contact phone number of the user',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

