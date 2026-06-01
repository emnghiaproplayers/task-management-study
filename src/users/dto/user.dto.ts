import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from './address.dto';
import { UserRole } from './create-user.dto';

export class UserDto {
  @ApiProperty({
    example: 'mpu88ybs53q',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'The corporate email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The unique username of the user',
  })
  username: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'The system role assigned to the user',
  })
  role: UserRole;

  @ApiProperty({
    type: () => AddressDto,
    description: 'The physical address of the user',
  })
  address: AddressDto;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Optional contact phone number of the user',
  })
  phoneNumber?: string;
}
