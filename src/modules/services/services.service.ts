import { prisma } from "../../lib/prisma";
import { ICreateService } from "./services.interface";

const createServiceInToDB = async (payload: ICreateService, userId: string) => {
  const { category, price, name, description } = payload;

  const categoryDB = await prisma.category.findFirst({
    where: {
      name: {
        equals: category,
        mode: "insensitive",
      },
    },
  });

  if (!categoryDB) {
    throw new Error("Category not found!");
  }

  const loggedInTechnician = await prisma.technicianProfile.findUniqueOrThrow({
    where: {
      userId: userId,
    },
  });

  const service = await prisma.service.create({
    data: {
      name,
      price,
      description,
      categoryId: categoryDB.id,
      technicianId: loggedInTechnician.id,
    },
  });

  return service;
};

export const serviceOfServices = {
  createServiceInToDB,
};
