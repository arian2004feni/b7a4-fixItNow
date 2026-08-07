import { ServiceWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateService, IGetServicesQuery } from "./services.interface";

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

const getAllService = async (query: IGetServicesQuery) => {
  const {
    limit = 10,
    location,
    maxPrice,
    minPrice,
    page = 1,
    searchTerm,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // const category = query.category ? JSON.parse(query.category as string) : null;
  // const categoryArray = Array.isArray(category) ? category : [];

  const andConditions: ServiceWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: String(searchTerm),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: String(searchTerm),
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (location) {
    andConditions.push({
      technician: {
        location: {
          contains: String(location),
          mode: "insensitive",
        },
      },
    });
  }

  if (minPrice || maxPrice) {
    if (minPrice) {
      andConditions.push({ price: { gte: Number(minPrice) } });
    }
    if (maxPrice) {
      andConditions.push({ price: { lte: Number(maxPrice) } });
    }
  }

  const services = await prisma.service.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      technician: true,
      category: true,
    },
    orderBy: {
      [String(sortBy)]: sortOrder,
    },
    skip,
    take: Number(limit),
  });

  const totalPostCount = await prisma.service.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: services,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: totalPostCount,
      totalPages: Math.ceil(totalPostCount / Number(limit)),
    },
  };
};

export const serviceOfServices = {
  createServiceInToDB,
  getAllService,
};
