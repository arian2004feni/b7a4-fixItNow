export interface ICreateService {
  name: string;
  description?: string;
  price: number;
  category: string;
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
