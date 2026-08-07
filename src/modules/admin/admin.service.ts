import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./admin.interface";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      customerProfile: true,
    },
  });

  return users;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      customerProfile: {
        include: {
          customerBookings: {
            include: {
              timeSlot: true,
              payments: true,
              reviews: true,
            },
          },
        },
      },
      technicianProfile: {
        include: {
          availabilitySlots: true,
          bookings: true,
          reviewsReceived: true,
          services: true,
        },
      },
    },
  });

  return user;
};

const createCategoryInToDB = async (payload: ICreateCategory) => {
  const { name, description } = payload;

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};

const getAllCategories = async () => {
  const category = await prisma.category.findMany({
    include: {
      services: true,
    },
  });

  return category;
};

const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
    include: {
      service: {
        include: {
          category: true,
        },
      },
    },
  });

  return bookings;
};

export const adminServices = {
  getAllUsers,
  getUserById,
  createCategoryInToDB,
  getAllCategories,
  getAllBookings,
};
