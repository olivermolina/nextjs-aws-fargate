import { publicProcedure, t } from 'src/server/trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import loadStytch from 'src/libs/stytch';
import { RoleName, UserType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { decode } from 'src/utils/jwt';
import { sendStaffWelcomeEmail } from 'src/utils/send-mail';
import { createUniqueUsername } from 'src/utils/create-unique-username';
import dayjs from 'dayjs';
import { isAuthenticated } from './middleware/isAuthenticated';

const authRouter = t.router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            email: input.email,
          },
          include: {
            organization: true,
            role: {
              include: {
                role_permissions: true,
              },
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password.',
          });
        }

        const stytchClient = loadStytch();
        const { member } = await stytchClient.passwords.authenticate({
          organization_id: user.organization.stytch_id,
          email_address: input.email,
          password: input.password,
        });

        if (!member) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password.',
          });
        }

        return user;
      } catch (e) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: e.error_message || e.message,
        });
      }
    }),
  signup: publicProcedure
    .input(
      z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        password: z.string().optional(),
        stytch_member_id: z.string().optional(),
        stytch_organization_id: z.string().optional(),
        timezone: z.string(),
        organization_name: z.string(),
        size: z.string(),
        category: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const stytchB2BClient = loadStytch();
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            email: input.email,
            type: UserType.STAFF,
            role: {
              name: RoleName.ADMIN,
            },
          },
          include: {
            organization: true,
            role: {
              include: {
                role_permissions: true,
              },
            },
          },
        });

        const slugUuid = uuid();
        // remove all special characters and replace space with dash
        const slug = input.organization_name.toLowerCase().replace(/ /g, '-') + '-' + slugUuid;

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already exists. Please login to your account.',
          });
        }

        // Find or create organization in stytch
        let stytchOrganization;
        try {
          if (input.stytch_organization_id) {
            stytchOrganization = await stytchB2BClient.organizations.get({
              organization_id: input.stytch_organization_id,
            });
          } else {
            stytchOrganization = await stytchB2BClient.organizations.create({
              organization_name: input.organization_name,
              organization_slug: slug,
            });
          }
        } catch (e) {
          console.log(e);
          throw new Error('Organization name already exists. Please try another name.');
        }

        const stytchOrganizationId = stytchOrganization.organization.organization_id;

        // Create organization in database
        const organization = await prisma.organization.create({
          data: {
            name: input.organization_name,
            stytch_id: stytchOrganizationId,
            size: input.size,
            category: input.category,
            slug: slug,
            code: '',
          },
        });

        // Find or create user in stytch
        let stytchUser;
        try {
          if (input.stytch_member_id) {
            stytchUser = await stytchB2BClient.organizations.members.get({
              member_id: input.stytch_member_id,
              organization_id: stytchOrganizationId,
            });
          } else {
            stytchUser = await stytchB2BClient.organizations.members.get({
              organization_id: stytchOrganizationId,
              email_address: input.email,
            });
          }
        } catch (e) {
          // Do nothing
        }

        // Create user in stytch if not initialize
        if (!stytchUser) {
          stytchUser = await stytchB2BClient.organizations.members.create({
            organization_id: stytchOrganizationId,
            email_address: input.email,
            create_member_as_pending: true,
          });
        }

        // Create user password if password is provided
        let password_hash = '';
        if (input.password) {
          const saltRounds = 10;
          password_hash = await bcrypt.hash(input.password, saltRounds);
          // Create user password
          await stytchB2BClient.passwords.migrate({
            organization_id: stytchOrganizationId,
            email_address: input.email,
            hash: password_hash,
            hash_type: 'bcrypt',
          });
        }

        const username = await createUniqueUsername(input);

        const adminRole = await prisma.role.findFirst({
          where: {
            name: RoleName.ADMIN,
          },
        });

        if (!adminRole) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Admin role not found.',
          });
        }

        const user = await prisma.user.create({
          data: {
            email: input.email,
            organization_id: organization.id,
            stytch_member_id: stytchUser.member_id,
            first_name: input.first_name,
            last_name: input.last_name,
            type: UserType.STAFF,
            role_id: adminRole.id,
            avatar: '',
            phone: '',
            password_hash,
            active: true,
            username,
          },
          include: {
            organization: true,
            role: {
              include: {
                role_permissions: true,
              },
            },
          },
        });

        if (user) {
          await prisma.availability.create({
            data: {
              user_id: user.id,
              organization_id: user.organization_id,
              name: 'Working Hours',
              timezone: input.timezone,
              availability_slots: {
                createMany: {
                  data: [1, 2, 3, 4, 5].map((day) => ({
                    day_of_week: day,
                    start_time: dayjs().tz(input.timezone).hour(9).minute(0).second(0).toDate(),
                    end_time: dayjs().tz(input.timezone).hour(17).minute(0).second(0).toDate(),
                  })),
                },
              },
            },
          });
        }

        sendStaffWelcomeEmail(user);

        return user;
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message,
        });
      }
    }),
  verify: publicProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const decodedToken = decode(input.token) as any;

        const { userId } = decodedToken as any;

        const user = await prisma.user.findFirst({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User not found.',
          });
        }

        const organization = await prisma.organization.update({
          where: {
            id: user.organization_id,
          },
          data: {
            isVerified: true,
          },
        });
        return {
          ...user,
          organization,
        };
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message,
        });
      }
    }),
  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            email: input.email,
          },
          include: {
            organization: true,
            role: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid email.',
          });
        }

        return {
          id: user.id,
          email: user.email,
          stytch_member_id: user.stytch_member_id,
          organization_stytch_id: user.organization.stytch_id,
        };
      } catch (e) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: e.message,
        });
      }
    }),
  getMember: publicProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        if (!input.memberId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid member id.',
          });
        }

        const user = await prisma.user.findFirst({
          where: {
            stytch_member_id: input.memberId,
          },
          include: {
            organization: true,
            staffs: {
              include: {
                staff: true,
              },
            },
            role: {
              include: {
                role_permissions: true,
              },
            },
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User not found.',
          });
        }

        return user;
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message,
        });
      }
    }),
  resendConfirmation: isAuthenticated.mutation(async ({ ctx }) => {
    const user = await prisma.user.findFirst({
      where: {
        id: ctx.user?.id,
        type: UserType.STAFF,
        role: {
          name: RoleName.ADMIN,
        },
      },
      include: {
        organization: true,
        role: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'You are not authorized to perform this action.',
      });
    }

    const result = await sendStaffWelcomeEmail(user);
    if (result.code === 'failed') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.message,
      });
    }
    return result;
  }),
  activateUser: publicProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.memberId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid member id.',
          });
        }

        const user = await prisma.user.findFirst({
          where: {
            stytch_member_id: input.memberId,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User not found.',
          });
        }

        return await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            active: true,
          },
          include: {
            organization: true
          }
        });
      } catch (e) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: e.message,
        });
      }
    }),
});

export default authRouter;
