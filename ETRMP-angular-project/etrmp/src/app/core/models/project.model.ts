export type ProjectStatus = 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  managerId: string;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
}
