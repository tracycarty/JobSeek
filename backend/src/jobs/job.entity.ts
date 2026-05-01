import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "varchar", length: 255 })
  company: string;

  @Column({ type: "varchar", length: 255 })
  location: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  salary: string | null;

  @Column({ type: "text" })
  description: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
