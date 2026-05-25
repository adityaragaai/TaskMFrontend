export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  token: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  createdBy: { _id: string; name: string };
  teamMembers: { _id: string; name: string; email: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignedTo: { _id: string; name: string; email: string };
  projectId: { _id: string; title: string };
  createdBy: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksByStatus: {
    Todo: number;
    'In Progress': number;
    Done: number;
  };
}
