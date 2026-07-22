import { DayOfWeek } from "../../../generated/prisma/enums";

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

export interface IUpdateTechnicianAvailabilitySlots {
  availability: IAvailabilitySlot[];
}