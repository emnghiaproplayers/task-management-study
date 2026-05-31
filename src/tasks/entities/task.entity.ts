// task.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TaskStatus } from '../task-status.enum';

@Entity('tasks') // Tên bảng trong database sẽ là 'tasks'
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string; // Tự động tạo chuỗi UUID ngẫu nhiên khi insert

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.OPEN, // Mặc định khi tạo mới sẽ là 'open'
    })
    status: TaskStatus;
}