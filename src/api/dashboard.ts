import api from './axiosInstance';
import type { DashboardStats, Task } from '../types';

export const fetchDashboardStats = () =>
  api.get<DashboardStats>('/dashboard/stats').then((r) => r.data);

export const fetchOverdueTasks = () =>
  api.get<Task[]>('/dashboard/overdue').then((r) => r.data);
