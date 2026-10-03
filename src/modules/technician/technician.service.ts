import {
  BookingStatus,
  DayOfWeek,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import { TechnicianProfileWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  IAvailabilitySlot,
  IGetAllTechnicianQuery,
  IUpdateBookingStatus,
  ICreateTechnicianAvailabilitySlots,
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
const createAvailabilitySlotsDB = async (
  userId: string,
  payload: ICreateTechnicianAvailabilitySlots,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  // 1. Check for missing dayOfWeek values
  const hasMissingDay = payload.availability.some((item) => !item.dayOfWeek);

  if (hasMissingDay) {
    throw new Error(
      "Validation failed: One or more availability entries are missing 'dayOfWeek'.",
    );
  }

  // 2. Check for duplicate dayOfWeek values
  const days = payload.availability.map((item) => item.dayOfWeek);

  const hasDuplicates = new Set(days).size !== days.length;

  if (hasDuplicates) {
    throw new Error(
      "Validation failed: Duplicate 'dayOfWeek' values detected.",
    );
  }

  // 3. Wait for ALL create/update operations to finish
  await Promise.all(
    payload.availability.map(async (d) => {
      const findSlot = await prisma.availabilitySlots.findUnique({
        where: {
          technicianId_dayOfWeek: {
            technicianId: technician.id,
            dayOfWeek: d.dayOfWeek,
          },
        },
      });

      if (findSlot) {
        return prisma.availabilitySlots.update({
          where: {
            id: findSlot.id,
          },
          data: {
            dayOfWeek: d.dayOfWeek,
            startTime: d.startTime,
            endTime: d.endTime,
          },
        });
      }

      return prisma.availabilitySlots.create({
        data: {
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
          technicianId: technician.id,
        },
      });
    }),
  );

  // 4. Now the database contains the new data
  const result = await prisma.availabilitySlots.findMany({
    where: {
      technicianId: technician.id,
    },
  });

  return result;
};

const updateTechnicianAvailabilitySlotsDB = async (
  id: string,
  userId: string,
  payload: IAvailabilitySlot,
) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId: userId },
  });

  const bookedSlots = await prisma.availabilitySlots.findUniqueOrThrow({
    where: {
      id,
      technicianId: technician.id,
    },
  });

  const result = await prisma.availabilitySlots.update({
    where: {
      id: bookedSlots.id,
    },
    data: {
      startTime: payload.startTime,
      endTime: payload.endTime,
    },
  });

  return result;
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
          equals: String(name),
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

const getSingleTechnician = async (id: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      availabilitySlots: true,
      reviewsReceived: true,
      services: true,
      user: true,
      bookings: true,
    },
  });

  return technician;
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
      technicianId: technician.id,
    },
  });

  if (!booking) {
    throw new Error("booking not found by id and userProfile");
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

const startJob = async (bookingId: string, userId: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      technicianId: technician.id,
    },
  });

  if (!booking) {
    throw new Error("booking not found by id and userProfile");
  }

  if (booking.status !== BookingStatus.PAID) {
    throw new Error("Booking has to be paid to start working");
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: BookingStatus.IN_PROGRESS,
    },
    include: {
      customerProfile: true,
      technicianProfile: true,
      service: true,
    },
  });

  return result;
};

const completeBookingStatus = async (bookingId: string, userId: string) => {
  const technician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      technicianId: technician.id,
    },
  });

  if (!booking) {
    throw new Error("booking not found by id and userProfile");
  }

  if (booking.status !== BookingStatus.IN_PROGRESS) {
    throw new Error(`Booking status is ${booking.status}`);
  }

  const result = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: BookingStatus.COMPLETED,
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
  createAvailabilitySlotsDB,
  updateTechnicianAvailabilitySlotsDB,
  getAllTechnicians,
  getSingleTechnician,
  getTechnicianBookings,
  updateBookingStatus,
  startJob,
  completeBookingStatus,
};
