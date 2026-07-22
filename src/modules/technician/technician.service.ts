import { prisma } from "../../lib/prisma";
import { IUpdateTechnicianProfile } from "./technician.interface";

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
    }
  });

  return updatedTechnician;
};

export const technicianServices = {
  updateTechnicianProfileDB,
};
