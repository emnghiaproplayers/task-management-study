import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Map<string, Task> = new Map([
    ['1', { id: '1', title: 'Học NestJS', status: 'PENDING', description: '' }],
  ]);

  create(createTaskDto: CreateTaskDto): Task {
    const task: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      title: createTaskDto.title,
      description: createTaskDto.description || '',
      status: 'PENDING',
    };
    this.tasks.set(task.id, task);
    return task;
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  findOne(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    // Cập nhật object task (vì map lưu tham chiếu nên thay đổi này sẽ ảnh hưởng trực tiếp)
    Object.assign(task, updateTaskDto);
    return task;
  }

  remove(id: string): void {
    if (!this.tasks.has(id)) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    this.tasks.delete(id); // Sử dụng .delete() cho Map
  }
  crash(): void {
    throw new Error('Unexpected');
  }
}
