import {
  BookingStatus,
  DayOfWeek,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  IGetAllTechnicianQuery,
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

const getAllTechnicians = async (query: IGetAllTechnicianQuery) => {
  const {
    page = 1,
    limit = 10,
    name,
    experienceYears,
    status,
    location,
    mobileNumber,
    minRating,
    maxPrice,
    minPrice,
    availabilityDay,
    searchTerm,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // const category = query.category ? JSON.parse(query.category as string) : null;
  // const categoryArray = Array.isArray(category) ? category : [];

  const andConditions: TechnicianProfileWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          user: {
            name: {
              contains: String(searchTerm),
              mode: "insensitive",
            },
            role: {
              equals: Role.TECHNICIAN,
            },
          },
        },
        {
          bio: {
            contains: String(searchTerm),
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (name) {
    andConditions.push({
      user: {
        name: {
          equals: String(location),
          mode: "insensitive",
        },
      },
    });
  }

  if (status) {
    andConditions.push({
      user: {
        status: {
          equals: String(status.toUpperCase()) as UserStatus,
        },
      },
    });
  }

  if (experienceYears) {
    andConditions.push({
      experienceYears: {
        equals: Number(experienceYears),
      },
    });
  }

  if (location) {
    andConditions.push({
      location: {
        contains: String(location),
        mode: "insensitive",
      },
    });
  }

  if (mobileNumber) {
    andConditions.push({
      mobileNumber: {
        contains: String(location),
        mode: "insensitive",
      },
    });
  }

  if (minRating) {
    andConditions.push({
      averageRating: {
        gte: Number(minRating),
      },
    });
  }

  if (availabilityDay) {
    andConditions.push({
      availabilitySlots: {
        some: {
          dayOfWeek: {
            equals: String(availabilityDay.toUpperCase()) as DayOfWeek,
          },
        },
      },
    });
  }

  // if (minPrice || maxPrice) {
  //   if (minPrice) {
  //     andConditions.push({ price: { gte: Number(minPrice) } });
  //   }
  //   if (maxPrice) {
  //     andConditions.push({ price: { lte: Number(maxPrice) } });
  //   }
  // }

  const technician = await prisma.technicianProfile.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      user: true,
      availabilitySlots: true,
      reviewsReceived: true,
      services: true,
    },
    orderBy: {
      [String(sortBy)]: sortOrder,
    },
    skip,
    take: Number(limit),
  });

  const totalTechniciansCount = await prisma.technicianProfile.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: technician,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: totalTechniciansCount,
      totalPages: Math.ceil(totalTechniciansCount / Number(limit)),
    },
  };
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
  getAllTechnicians,
  getTechnicianBookings,
  updateBookingStatus,
};
