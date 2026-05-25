import api from './axiosInstance';
import type { Project } from '../types';

export const fetchProjects = () => api.get<Project[]>('/projects').then((r) => r.data);

export const fetchProjectById = (id: string) =>
  api.get<Project>(`/projects/${id}`).then((r) => r.data);

export const createProject = (data: {
  title: string;
  description: string;
  teamMembers?: string[];
}) => api.post<Project>('/projects', data).then((r) => r.data);

export const updateProject = (
  id: string,
  data: { title?: string; description?: string; teamMembers?: string[] }
) => api.put<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: string) =>
  api.delete(`/projects/${id}`).then((r) => r.data);
