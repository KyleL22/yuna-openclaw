export interface RoleReport {
  role_id: string;
  task_id: string;
  summary: string;
  status: 'IN_PROGRESS' | 'DONE';
  logs: string[];
}
