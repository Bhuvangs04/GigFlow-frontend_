import api from './api';
import type { Gig } from '@/types';

interface CreateGigData {
  title: string;
  description: string;
  budget: number;
}

export const gigsService = {
  async getAll(query?: string): Promise<Gig[]> {
    const params = query ? { q: query } : {};
    const response = await api.get<Gig[]>('/api/gigs', { params });
    return response.data;
  },

  async getById(id: string): Promise<Gig> {
    const response = await api.get<Gig>(`/api/gigs/${id}`);
    return response.data;
  },

  async create(data: CreateGigData): Promise<Gig> {
    const response = await api.post<Gig>('/api/gigs', data);
    return response.data;
  },
};
