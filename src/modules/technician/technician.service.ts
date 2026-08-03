import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  IUpdateBookingStatus,
  IUpdateTechnicianAvailabilitySlots,
  IUpdateTechnicianProfile,
} from "./technician.interface";

const updateTechnicianProfileDB = async (
  userId: string,
  payload: IUpdateTechnicianProfile,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId: userId,
    },
  });

  const updatedTechnician = await prisma.technicianProfile.update({
    data: {
      ...payload,
    },
    where: {
      id: technician.id,
    },
    include: {
      availabilitySlots: true,
      services: true,
    },
  });

  return updatedTechnician;
};

const updateTechnicianAvailabilitySlotsDB = async (
  userId: string,
  payload: IUpdateTechnicianAvailabilitySlots,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId: userId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.availabilitySlots.deleteMany({
      where: { technicianId: technician.id },
    });

    await tx.availabilitySlots.createMany({
      data: payload.availability.map((i) => ({
        technicianId: technician.id,
        dayOfWeek: i.dayOfWeek,
        startTime: i.startTime,
        endTime: i.endTime,
      })),
    });
  });

  return prisma.availabilitySlots.findMany({
    where: {
      technicianId: technician.id,
    },
    orderBy: { dayOfWeek: "asc" },
  });
};

const getTechnicianBookings = async (id: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId: id,
    },
  });
  const bookings = await prisma.booking.findMany({
    where: {
      technicianId: technician.id,
    },
    include: {
      service: {
        include: {
          category: true,
        },
      },
      timeSlot: true,
      customerProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  return bookings;
};

const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  payload: IUpdateBookingStatus,
) => {
  const { status } = payload;

  if (status !== BookingStatus.ACCEPTED && status !== BookingStatus.DECLINED) {
    throw new Error("Only ACCEPTED and DECLINED are allowed.");
  }

  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("booking not found");
  }

  if (booking.technicianId !== technician.id) {
    throw new Error("You're not authorized to update this booking.");
  }

  if (booking.status !== BookingStatus.REQUESTED) {
    throw new Error(`Booking is already ${booking.status.toLowerCase()}`);
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status,
    },
    include: {
      customerProfile: true,
      technicianProfile: true,
      service: true,
    },
  });

  return result;
};

export const technicianServices = {
  updateTechnicianProfileDB,
  updateTechnicianAvailabilitySlotsDB,
  getTechnicianBookings,
  updateBookingStatus,
};
