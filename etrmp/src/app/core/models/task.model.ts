export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedUserId: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
}
