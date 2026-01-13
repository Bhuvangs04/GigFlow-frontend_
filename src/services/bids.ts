import api from './api';
import type { Bid } from '@/types';

interface CreateBidData {
  gigId: string;
  message: string;
  price: number;
}

export const bidsService = {
  async getByGig(gigId: string): Promise<Bid[]> {
    const response = await api.get<Bid[]>(`/api/bids/${gigId}`);
    return response.data;
  },

  async create(data: CreateBidData): Promise<Bid> {
    const response = await api.post<Bid>(`/api/bids`, data);
    return response.data;
  },

  async hire(bidId: string): Promise<Bid> {
    const response = await api.patch<Bid>(`/api/bids/${bidId}/hire`);
    return response.data;
  },
};
