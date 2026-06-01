import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({
    example: 'Fix login bug',
    description: 'Task title',
    type: 'string',
    minLength: 3,
    maxLength: 100,
  })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @ApiProperty({
    example: 'Investigate why users can\'t log in and fix the root cause.',
    description: 'Task description',
    type: 'string',
    maxLength: 500,
    required: false
  })
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
