import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @Column()
  text: string;

  @Column({ type: 'enum', enum: ['incoming', 'outgoing'] })
  type: 'incoming' | 'outgoing'; // incoming = message sent, outgoing = message received

  @CreateDateColumn()
  createdAt: Date;
}
