import api from './axiosInstance';
import type { User } from '../types';

export const loginUser = (email: string, password: string) =>
  api.post<User>('/auth/login', { email, password }).then((r) => r.data);

export const registerUser = (name: string, email: string, password: string, role: string) =>
  api.post<User>('/auth/signup', { name, email, password, role }).then((r) => r.data);

export const getMe = () => api.get<User>('/auth/me').then((r) => r.data);

export const fetchAllUsers = () =>
  api.get<{ _id: string; name: string; email: string; role: string }[]>('/auth/users').then((r) => r.data);
