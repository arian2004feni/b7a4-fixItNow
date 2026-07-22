import { prisma } from "../../lib/prisma";
import {
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

export const technicianServices = {
  updateTechnicianProfileDB,
  updateTechnicianAvailabilitySlotsDB,
};
