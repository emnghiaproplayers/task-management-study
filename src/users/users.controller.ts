import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import {
  ApiTags,
  ApiExtraModels,
  ApiBearerAuth,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users')
@ApiExtraModels(UserDto)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new user (Admin Only)' })
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number', example: 201 },
            message: { type: 'string', example: 'SUCCESS' },
            data: { $ref: getSchemaPath(UserDto) },
            timestamp: { type: 'string', example: '2026-06-01T10:02:20.008Z' },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: 400,
        error: 'BadRequestException',
        message: 'email must be a corporate email address (public domains like gmail.com, yahoo.com, hotmail.com, or outlook.com are not allowed)',
        details: [
          'email must be a corporate email address (public domains like gmail.com, yahoo.com, hotmail.com, or outlook.com are not allowed)',
          'password must be longer than or equal to 8 characters'
        ],
        timestamp: '2026-06-01T10:02:20.008Z',
        path: '/users'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
    schema: {
      example: {
        statusCode: 409,
        error: 'ConflictException',
        message: 'Email john.doe@company.com is already registered',
        timestamp: '2026-06-01T10:02:20.008Z',
        path: '/users'
      }
    }
  })
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`POST /users: Creating user "${createUserDto.email}"`);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number', example: 200 },
            message: { type: 'string', example: 'SUCCESS' },
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserDto) },
            },
            timestamp: { type: 'string', example: '2026-06-01T10:02:20.008Z' },
          },
        },
      ],
    },
  })
  findAll() {
    this.logger.log('GET /users: Retrieving all users');
    return this.usersService.findAll();
  }

  @Get('internal/health')
  @ApiSecurity('apiKey')
  @ApiOperation({ summary: 'Internal health check for service-to-service' })
  @ApiOkResponse({
    description: 'Service health check passed',
    schema: {
      example: {
        statusCode: 200,
        message: 'SUCCESS',
        data: { status: 'up' },
        timestamp: '2026-06-01T10:02:20.008Z'
      }
    }
  })
  health() {
    this.logger.log('GET /users/internal/health: Health check triggered');
    return { status: 'up' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiOkResponse({
    description: 'User found successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number', example: 200 },
            message: { type: 'string', example: 'SUCCESS' },
            data: { $ref: getSchemaPath(UserDto) },
            timestamp: { type: 'string', example: '2026-06-01T10:02:20.008Z' },
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        error: 'NotFoundException',
        message: 'User with ID "123" not found',
        timestamp: '2026-06-01T10:02:20.008Z',
        path: '/users/123'
      }
    }
  })
  findOne(@Param('id') id: string) {
    this.logger.log(`GET /users/${id}: Retrieving user detail`);
    return this.usersService.findOne(id);
  }
}

