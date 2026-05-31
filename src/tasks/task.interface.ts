export class Task {
  id: string;
  title: string;
  description?: string;
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