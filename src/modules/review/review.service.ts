import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const createReview = async (userId: string, payload: ICreateReviewPayload) => {
  const { comment, bookingId, rating } = payload;

  const customer = await prisma.customerProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
    },
  });

  if (customer.id !== booking.customerId)
    throw new Error("customer-booking mismatch");

  if (rating !== undefined && rating !== null && (rating < 0 || rating > 10)) {
    throw new Error("rating must be a number between 0 to 10");
  }

  const review = await prisma.review.upsert({
    where: {
      bookingId,
      customerId: customer.id,
    },
    create: {
      comment,
      bookingId,
      customerId: customer.id,
      technicianId: booking.technicianId,
      rating,
    },
    update: {
      comment,
      rating,
    },
  });

  return review;
};

export const reviewService = {
  createReview,
};
