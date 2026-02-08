import { TaskStatus } from './task_status.enum';

export interface Task {
  id: string;
  epic_id?: string;
  project_id: string;
  title: string;
  instruction: string;
  status: TaskStatus;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}
