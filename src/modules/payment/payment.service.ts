import { BookingStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { ICreatePaymentPayload } from "./payment.interface";

const createPayment = async (userId: string, payload: ICreatePaymentPayload) => {
  const { bookingId } = payload;

  const customer = await prisma.customerProfile.findUniqueOrThrow({
    where: {
      userId,
    },
  });

  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
    },
    include: {
      payments: true,
      service: true,
    },
  });

  if (booking.customerId !== customer.id) {
    throw new Error("unauthorized");
  }

  if (booking.status === BookingStatus.REQUESTED) {
    throw new Error("Booking is requested, waiting for technician to review");
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error(`Booking is already ${booking.status.toLowerCase()}`);
  }

  if (booking.payments) {
    throw new Error("Payment already initiated");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    metadata: { bookingId },
    success_url: "http://localhost:3000/api/payments/success",
    cancel_url: "http://localhost:3000/api/payments/cancel",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(booking.service.price * 100),
          product_data: {
            name: booking.service.name,
            description: booking.service.description ?? "",
          },
        },
      },
    ],
  });

  await prisma.payment.upsert({
    where: {
      bookingId,
    },
    create: {
      transactionId: session.id,
      bookingId: booking.id,
    },
    update: {
      transactionId: session.id,
      status: "PENDING",
    },
  });

  return { checkOutUrl: session.url };
};

export const paymentService = {
  createPayment,
};
