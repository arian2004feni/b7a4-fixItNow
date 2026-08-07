import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateBooking } from "./booking.interface";

const createBookingDB = async (userId: string, payload: ICreateBooking) => {
  const customer = await prisma.customerProfile.findUniqueOrThrow({
    where: {
      userId: userId,
    },
  });

  const service = await prisma.service.findUniqueOrThrow({
    where: {
      id: payload.serviceId,
    },
  });

  const timeSlot = await prisma.availabilitySlots.findUniqueOrThrow({
    where: {
      id: payload.timeSlotId,
    },
  });

  if (service.technicianId !== timeSlot.technicianId) {
    throw new Error("technician on service and time slot mismatch!");
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      customerId: customer.id,
      serviceId: service.id,
      status: BookingStatus.REQUESTED,
    },
  });

  if (existingBooking) {
    throw new Error("You already have a pending booking for this service.");
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      serviceId: service.id,
      technicianId: service.technicianId,
      timeSlotId: timeSlot.id,
      note: payload.note,
    },
    include: {
      service: true,
      timeSlot: true,
    },
  });

  return booking;
};

const getAllUsersBookings = async (id: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      customerProfile: {
        userId: id,
      },
    },
    include: {
      timeSlot: true,
    },
  });

  return bookings;
};

const getUsersBookingsById = async (userId: string, bookingId: string) => {
  const bookings = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
      customerProfile: {
        userId,
      },
    },
    include: {
      service: {
        include: {
          category: true,
          technician: true,
        },
      },
      reviews: true,
      timeSlot: true,
      payments: true,
    },
  });

  return bookings;
};

export const bookingServices = {
  createBookingDB,
  getAllUsersBookings,
  getUsersBookingsById,
};
