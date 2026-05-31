import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users: any[] = [];

  create(createUserDto: CreateUserDto) {
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }
}
