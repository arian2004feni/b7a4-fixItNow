import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/auth.route";
import { adminRouter } from "./modules/admin/admin.route";
import { serviceRouter } from "./modules/services/services.route";
import { technicianRouter } from "./modules/technician/technician.route";
import { bookingRouter } from "./modules/booking/booking.route";
import { paymentRouter } from "./modules/payment/payment.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/services", serviceRouter);
app.use("/api/technician", technicianRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);

export default app;
