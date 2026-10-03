import { BookingStatus, Role, UserStatus } from "../../../generated/prisma/enums";

export interface ICreateCategory {
  name: string;
  description?: string;
}

export interface IAdminUserQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IAdminBookingQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  searchTerm?: string;
  sortOrder?: "asc" | "desc";
}