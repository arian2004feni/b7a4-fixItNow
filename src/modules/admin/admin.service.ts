import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./admin.interface";

const createCategoryInToDB = async (payload: ICreateCategory) => {
  const { name, description } = payload;

  const isCategoryExists = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (isCategoryExists) {
    throw new Error("Category Already Exists!");
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};

export const adminServices = {
  createCategoryInToDB,
};
