import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const bookingId = session.metadata?.bookingId;
  const transactionId = session.id;

  if (!bookingId || !transactionId) {
    console.log("Webhook : Missing values For Creating Checkout Session");
    return;
  }

  const payment = await prisma.payment.findUnique({ where: { bookingId } });

  // stripe re-delivers events, so completing twice must be a no-op
  if (!payment || payment.status === PaymentStatus.SUCCEEDED) return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { bookingId },
      data: { status: PaymentStatus.SUCCEEDED, transactionId },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.PAID },
    }),
  ]);
};
