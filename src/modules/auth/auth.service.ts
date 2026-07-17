import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { LoginUserPayload, RegisterUserPayload } from "./auth.interface";
import { Prisma } from "../../../generated/prisma/client";
import jwt, { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";

const signInUser = async (payload: RegisterUserPayload) => {
  const { name, email, password, role } = payload;

  if (role && !Object.values(Role).includes(role)) {
    throw new Error("Invalid User Role");
  }

  if (role === Role.ADMIN) {
    throw new Error("No new admin account is allowed");
  }

  // const role =
  //   payload.role === Role.TECHNICIAN ? Role.TECHNICIAN : Role.CUSTOMER;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const data: Prisma.UserCreateInput = {
    name,
    email,
    password: hashedPassword,
    role,
  };

  if (role === Role.CUSTOMER) {
    data.customerProfile = {
      create: {},
    };
  }

  if (role === Role.TECHNICIAN) {
    data.technicianProfile = {
      create: {},
    };
  }

  const user = await prisma.user.create({
    data,
    omit: {
      password: true,
    },
    include: {
      customerProfile: true,
      technicianProfile: true,
    },
  });

  return user;
};

const loginUser = async (payload: LoginUserPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password is Incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiration as SignOptions,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiration as SignOptions,
  );

  return { accessToken, refreshToken };
};

export const authService = { signInUser, loginUser };
