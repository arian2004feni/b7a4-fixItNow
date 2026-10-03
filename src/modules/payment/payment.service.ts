import Stripe from "stripe";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { ICreatePaymentPayload } from "./payment.interface";
import { handleCheckoutCompleted } from "./payment.utils";

const createPayment = async (
  userId: string,
  payload: ICreatePaymentPayload,
) => {
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
    success_url: `${config.frontend_url}/payment/success?booking=${booking.id}`,
    cancel_url: `${config.frontend_url}/payment/cancel?booking=${booking.id}`,
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
      amount: booking.service.price,
      provider: "STRIPE",
      status: "PENDING",
    },
    update: {
      transactionId: session.id,
      amount: booking.service.price,
      provider: "STRIPE",
      status: "PENDING",
      paidAt: null,
    },
  });

  return { checkoutUrl: session.url };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );
  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId;

  // if (bookingId) {
  //   if (event.type === "checkout.session.completed") {
  //     await handleCheckoutCompleted(event.data.object);
  //   } else if (
  //     event.type === "checkout.session.expired" ||
  //     event.type === "checkout.session.async_payment_failed"
  //   ) {
  //     await prisma.payment.updateMany({
  //       where: { bookingId, status: PaymentStatus.PENDING },
  //       data: { status: PaymentStatus.FAILED },
  //     });
  //   }
  // }
  if (bookingId) {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await prisma.payment.updateMany({
          where: { bookingId, status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.FAILED },
        });
        break;

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  }

  // always 200 once the signature checks out, otherwise stripe retries forever
  // res.json({ received: true });
};

const getAllUsersPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      bookings: {
        customerProfile: {
          userId,
        },
      },
    },
    include: {
      bookings: {
        include: {
          service: true,
          technicianProfile: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  return payments;
};

const getPaymentDetails = async (id: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: {
      bookingId: id,
    },
    include: {
      bookings: {
        include: {
          timeSlot: true,
          customerProfile: {
            include: {
              user: true,
            },
          },
          service: {
            include: {
              technician: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return payment;
};

export const paymentService = {
  createPayment,
  handleWebhook,
  getAllUsersPayments,
  getPaymentDetails,
};
