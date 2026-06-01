import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Task {
  @ApiProperty({
    example: 'mpu88ybs53q',
    description: 'The unique identifier of the task',
  })
  id: string;

  @ApiProperty({
    example: 'Fix login bug',
    description: 'The title of the task',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Investigate why users cannot log in and fix the root cause.',
    description: 'A detailed description of the task',
  })
  description?: string;


  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    description: 'The current status of the task',
  })
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}
// src/tasks/task.interface.ts

export enum TaskStatus {
  OPEN = 'open',
  DONE = 'done',
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}