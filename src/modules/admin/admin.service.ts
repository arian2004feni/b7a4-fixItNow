import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./admin.interface";

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

export const adminServices = {
  createCategoryInToDB,
};
