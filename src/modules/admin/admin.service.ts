import {
  BookingStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { BookingWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  IAdminBookingQuery,
  IAdminUserQuery,
  ICreateCategory,
} from "./admin.interface";

const getAdminStats = async () => {
  const now = new Date();

  // current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // previous month
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const previousMonthEnd = currentMonthStart;

  // 1. user stats
  const totalUsers = await prisma.user.count();

  const customers = await prisma.user.count({
    where: {
      role: Role.CUSTOMER,
    },
  });

  const technicians = await prisma.user.count({
    where: {
      role: Role.TECHNICIAN,
    },
  });

  const usersThisMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: currentMonthStart,
      },
    },
  });

  const usersPreviousMonth = await prisma.user.count({
    where: {
      createdAt: {
        gte: previousMonthStart,
        lt: previousMonthEnd,
      },
    },
  });

  const customersThisMonth = await prisma.user.count({
    where: {
      role: Role.CUSTOMER,
      createdAt: {
        gte: currentMonthStart,
      },
    },
  });

  const customersPreviousMonth = await prisma.user.count({
    where: {
      role: Role.CUSTOMER,
      createdAt: {
        gte: previousMonthStart,
        lt: previousMonthEnd,
      },
    },
  });

  const techniciansThisMonth = await prisma.user.count({
    where: {
      role: Role.TECHNICIAN,
      createdAt: {
        gte: currentMonthStart,
      },
    },
  });

  const techniciansPreviousMonth = await prisma.user.count({
    where: {
      role: Role.TECHNICIAN,
      createdAt: {
        gte: previousMonthStart,
        lt: previousMonthEnd,
      },
    },
  });

  // 2. booking stats

  const totalBookings = await prisma.booking.count();

  const activeBookings = await prisma.booking.count({
    where: {
      status: {
        in: [
          BookingStatus.REQUESTED,
          BookingStatus.ACCEPTED,
          BookingStatus.PAID,
          BookingStatus.IN_PROGRESS,
        ],
      },
    },
  });

  const completedJobs = await prisma.booking.count({
    where: {
      status: BookingStatus.COMPLETED,
    },
  });

  // 3. other stats

  const completionRate =
    totalBookings > 0
      ? Number(((completedJobs / totalBookings) * 100).toFixed(1))
      : 0;

  const revenueResult = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.SUCCEEDED,
    },
    _sum: {
      amount: true,
    },
  });

  const totalRevenue = revenueResult._sum.amount ?? 0;

  const currentMonthRevenueResult = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.SUCCEEDED,

      paidAt: {
        gte: currentMonthStart,
      },
    },

    _sum: {
      amount: true,
    },
  });

  const currentMonthRevenue = currentMonthRevenueResult._sum.amount ?? 0;

  const previousMonthRevenueResult = await prisma.payment.aggregate({
    where: {
      status: PaymentStatus.SUCCEEDED,

      paidAt: {
        gte: previousMonthStart,
        lt: previousMonthEnd,
      },
    },

    _sum: {
      amount: true,
    },
  });

  const previousMonthRevenue = previousMonthRevenueResult._sum.amount ?? 0;

  // 4. percentage helpers

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  const userGrowth = calculateGrowth(usersThisMonth, usersPreviousMonth);

  const customerGrowth = calculateGrowth(
    customersThisMonth,
    customersPreviousMonth,
  );

  const technicianGrowth = calculateGrowth(
    techniciansThisMonth,
    techniciansPreviousMonth,
  );

  const revenueGrowth = calculateGrowth(
    currentMonthRevenue,
    previousMonthRevenue,
  );

  const customerPercentage =
    totalUsers > 0 ? Number(((customers / totalUsers) * 100).toFixed(1)) : 0;

  const technicianPercentage =
    totalUsers > 0 ? Number(((technicians / totalUsers) * 100).toFixed(1)) : 0;

  // 5. monthly bookings
  const currentYear = now.getFullYear();

  const monthlyBookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },

    select: {
      createdAt: true,
    },
  });

  const bookingChart = Array.from({ length: 12 }, (_, month) => ({
    month: new Date(currentYear, month, 1).toLocaleString("en-US", {
      month: "short",
    }),

    bookings: 0,
  }));

  for (const booking of monthlyBookings) {
    const month = booking.createdAt.getMonth();

    bookingChart[month].bookings++;
  }

  // 6. monthly revenue
  const monthlyPayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.SUCCEEDED,

      paidAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },

    select: {
      amount: true,
      paidAt: true,
    },
  });

  const revenueChart = Array.from({ length: 12 }, (_, month) => ({
    month: new Date(currentYear, month, 1).toLocaleString("en-US", {
      month: "short",
    }),

    revenue: 0,
  }));

  for (const payment of monthlyPayments) {
    if (!payment.paidAt) continue;

    const month = payment.paidAt.getMonth();

    revenueChart[month].revenue += payment.amount;
  }

  // 7. recent activity
  const [recentUsers, recentCompletedBookings, recentPayments, recentReviews] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      prisma.booking.findMany({
        where: {
          status: BookingStatus.COMPLETED,
        },

        orderBy: {
          updatedAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          updatedAt: true,
        },
      }),

      prisma.payment.findMany({
        where: {
          status: PaymentStatus.SUCCEEDED,
        },

        orderBy: {
          paidAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          amount: true,
          paidAt: true,

          bookings: {
            select: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          rating: true,
          createdAt: true,

          customer: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

  // 8. combined recent activities

  const recentActivity = [
    ...recentUsers.map((user) => ({
      type: "NEW_CUSTOMER",
      message: `${user.name} created an account`,
      createdAt: user.createdAt,
    })),

    ...recentCompletedBookings.map((booking) => ({
      type: "BOOKING_COMPLETED",
      message: `${booking.id} was marked completed`,
      createdAt: booking.updatedAt,
    })),

    ...recentPayments.map((payment) => ({
      type: "PAYMENT_RECEIVED",
      message: `$${payment.amount} payment for ${payment.bookings.service.name}`,
      createdAt: payment.paidAt,
    })),

    ...recentReviews.map((review) => ({
      type: "NEW_REVIEW",
      message: `${review.customer.user.name} left a ${review.rating}-star review`,
      createdAt: review.createdAt,
    })),
  ]
    .filter((activity) => activity.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    )
    .slice(0, 10);

  return {
    overview: {
      totalUsers,
      userGrowth,

      customers,
      customersThisMonth,
      customersPreviousMonth,
      customerPercentage,
      customerGrowth,

      technicians,
      techniciansThisMonth,
      techniciansPreviousMonth,
      technicianPercentage,
      technicianGrowth,

      activeBookings,

      completedJobs,
      completionRate,

      totalRevenue,
      revenueGrowth,
    },

    charts: {
      bookingsOverTime: bookingChart,
      revenueOverTime: revenueChart,
    },

    recentActivity,

    platformHealth: {
      api: "OPERATIONAL",
      payments: "OPERATIONAL",

      // Important:
      // This is NOT truly "online".
      activeTechnicians: await prisma.user.count({
        where: {
          role: Role.TECHNICIAN,
          status: "ACTIVE",
        },
      }),
    },
  };
};

const getAllUsers = async (query: IAdminUserQuery) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    role,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const users = await prisma.user.findMany({
    where: {
      AND: [
        searchTerm
          ? {
              OR: [
                {
                  name: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},

        role
          ? {
              role,
            }
          : {},

        status
          ? {
              status,
            }
          : {},
      ],
    },

    include: {
      customerProfile: {
        include: {
          customerBookings: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },

              technicianProfile: {
                include: {
                  user: true,
                },
              },

              timeSlot: true,

              payments: true,

              reviews: true,
            },
          },

          reviewsGiven: true,
        },
      },

      technicianProfile: {
        include: {
          services: {
            include: {
              category: true,
            },
          },

          availabilitySlots: true,

          bookings: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },

              customerProfile: {
                include: {
                  user: true,
                },
              },

              timeSlot: true,

              payments: true,

              reviews: true,
            },
          },

          reviewsReceived: true,
        },
      },
    },

    orderBy: {
      [sortBy]: sortOrder,
    },

    skip,

    take: Number(limit),
  });

  const total = await prisma.user.count({
    where: {
      AND: [
        searchTerm
          ? {
              OR: [
                {
                  name: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},

        role
          ? {
              role,
            }
          : {},

        status
          ? {
              status,
            }
          : {},
      ],
    },
  });

  return {
    data: users,

    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      customerProfile: {
        include: {
          customerBookings: {
            include: {
              timeSlot: true,
              payments: true,
              reviews: true,
            },
          },
        },
      },
      technicianProfile: {
        include: {
          availabilitySlots: true,
          bookings: true,
          reviewsReceived: true,
          services: true,
        },
      },
    },
  });

  return user;
};

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

const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      services: {
        include: {
          technician: {
            include: {
              user: true,
            },
          },

          bookings: {
            include: {
              payments: true,
              reviews: true,
              customerProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },

      _count: {
        select: {
          services: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getAllBookings = async (query: IAdminBookingQuery) => {
  const {
    page = 1,
    limit = 10,
    status,
    searchTerm,
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: BookingWhereInput = {
    AND: [
      status
        ? {
            status,
          }
        : {},

      searchTerm
        ? {
            OR: [
              {
                id: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },

              {
                customerProfile: {
                  user: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },

              {
                technicianProfile: {
                  user: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },

              {
                service: {
                  name: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {},
    ],
  };

  const bookings = await prisma.booking.findMany({
    where,

    include: {
      customerProfile: {
        include: {
          user: true,
        },
      },

      technicianProfile: {
        include: {
          user: true,
        },
      },

      service: {
        include: {
          category: true,
        },
      },

      timeSlot: true,

      payments: true,

      reviews: true,
    },

    orderBy: {
      createdAt: sortOrder,
    },

    skip,

    take: Number(limit),
  });

  const total = await prisma.booking.count({
    where,
  });

  return {
    data: bookings,

    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const adminServices = {
  getAdminStats,
  getAllUsers,
  getUserById,
  createCategoryInToDB,
  getAllCategories,
  getAllBookings,
};
