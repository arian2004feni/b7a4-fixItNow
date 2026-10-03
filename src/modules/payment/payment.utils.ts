import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  console.log("========== CHECKOUT COMPLETED ==========");
  console.log("session.id:", session.id);
  console.log("payment_status:", session.payment_status);
  console.log("payment_intent:", session.payment_intent);
  console.log("metadata:", session.metadata);

  const bookingId = session.metadata?.bookingId;
  const transactionId = session.id;

  console.log("bookingId:", bookingId);
  console.log("transactionId:", transactionId);

  if (!bookingId || !transactionId) {
    console.log("Webhook : Missing values For Creating Checkout Session");
    return;
  }

  const payment = await prisma.payment.findUnique({ where: { bookingId } });

  console.log("DB payment before update:", payment);

  // stripe re-delivers events, so completing twice must be a no-op
  // if (!payment || payment.status === PaymentStatus.SUCCEEDED) return;
  if (!payment) {
    console.log("Payment record not found!");
    return;
  }

  if (payment.status === PaymentStatus.SUCCEEDED) {
    console.log("Payment already succeeded");
    return;
  }

  try {
    await prisma.$transaction([
      prisma.payment.update({
        where: { bookingId },
        data: {
          status: PaymentStatus.SUCCEEDED,
          transactionId: session.id,
          paidAt: new Date(),
        },
      }),

      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.PAID,
        },
      }),
    ]);

    console.log("✅ Payment + Booking updated");
  } catch (error) {
    console.error("❌ Database transaction failed:", error);
    throw error;
  }
};
