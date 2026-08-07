import { BookingStatus, DayOfWeek } from "../../../generated/prisma/enums";

export interface IUpdateTechnicianProfile {
  profilePhoto: string;
  bio: string;
  location: string;
  mobileNumber: string;
  experienceYears: number;
}

export interface IAvailabilitySlot {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface IGetAllTechnicianQuery {
  page?: number;
  limit?: number;
  name?: string;
  experienceYears?: string;
  location?: string;
  status?: string;
  mobileNumber?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  availabilityDay?: string;
  sortBy?: string;
  sortOrder?: string;
  searchTerm?: string;
}

export interface IUpdateTechnicianAvailabilitySlots {
  availability: IAvailabilitySlot[];
}

export interface IUpdateBookingStatus {
  status: BookingStatus;
}
