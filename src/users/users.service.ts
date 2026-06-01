import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users: any[] = [];

  create(createUserDto: CreateUserDto) {
    const emailExists = this.users.some(
      (user) => user.email.toLowerCase() === createUserDto.email.toLowerCase(),
    );
    if (emailExists) {
      throw new ConflictException(`Email ${createUserDto.email} is already registered`);
    }

    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }
}

