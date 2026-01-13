export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  ownerId: string; 
  status: 'open' | 'assigned' | 'completed';
  createdAt: string;
}

export interface Bid {
  _id: string;
  gigId: string;
  freelancerId: string; 
  message: string;
  price: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiError {
  message: string;
}
