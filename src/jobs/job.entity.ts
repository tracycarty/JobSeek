import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  company: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salary: string | null;

  @Column({ type: 'enum', enum: ['Open', 'Closed', 'Review'], default: 'Open' })
  status: 'Open' | 'Closed' | 'Review';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', nullable: true, name: 'employer_id' })
  employer_id: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
