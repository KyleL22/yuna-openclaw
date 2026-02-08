import { TaskStatus } from './task_status.enum';
import { Priority } from './priority.enum';

export interface Epic {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  thread_id?: string;
  context_snapshot?: any;
}
