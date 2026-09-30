export interface ICreateService {
  name: string;
  description?: string;
  price: number;
  category?: string;
  thumbnail?: string;
  duration?: number;
}

export interface IUpdateService {
  name?: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  duration?: number;
}

export interface IGetServicesQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  category?: any;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: string;
}
