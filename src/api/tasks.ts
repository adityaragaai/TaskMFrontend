import api from './axiosInstance';
import type { Task } from '../types';

export interface TaskPayload {
  title: string;
  description: string;
  status?: 'Todo' | 'In Progress' | 'Done';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignedTo: string;
  projectId: string;
}

export const fetchTasks = () => api.get<Task[]>('/tasks').then((r) => r.data);

export const fetchTaskById = (id: string) =>
  api.get<Task>(`/tasks/${id}`).then((r) => r.data);

export const createTask = (data: TaskPayload) =>
  api.post<Task>('/tasks', data).then((r) => r.data);

export const updateTask = (id: string, data: Partial<TaskPayload>) =>
  api.put<Task>(`/tasks/${id}`, data).then((r) => r.data);

export const deleteTask = (id: string) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);
