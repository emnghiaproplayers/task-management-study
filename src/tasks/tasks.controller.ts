import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.interface';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) { }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Task {
    this.logger.log(`POST /tasks: Creating task "${createTaskDto.title + "__" + createTaskDto.description + "__" + createTaskDto.priority}"`);
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(): Task[] {
    this.logger.log('GET /tasks: Retrieving all tasks');
    return this.tasksService.findAll();
  }

  @Get('crash')
  crash() {
    return this.tasksService.crash();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Task {
    this.logger.log(`GET /tasks/${id}: Retrieving task detail`);
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Task {
    this.logger.log(`PATCH /tasks/${id}: Updating task`);
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.logger.log(`DELETE /tasks/${id}: Removing task`);
    this.tasksService.remove(id);
  }
}
