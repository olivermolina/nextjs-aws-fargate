import { isAuthenticated } from '../middleware/isAuthenticated';
import z from 'zod';
import { Prisma, UserType } from '@prisma/client';
import prisma from 'src/libs/prisma';
import { User } from 'src/types/user';
import { invoiceSelect } from '../invoice/invoice-select';

/**
 * User include object for prisma queries to include all related data
 * @returns The user include object
 */
export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  stytch_member_id: true,
  email: true,
  username: true,
  first_name: true,
  bill_name: true,
  last_name: true,
  company: true,
  type: true,
  role: {
    include: {
      role_permissions: {
        include: {
          resource: true,
          permission: true,
        },
      },
    },
  },
  active: true,
  avatar: true,
  created_at: true,
  updated_at: true,
  field: true,
  birthdate: true,
  identifier: true,
  gender: true,
  phone: true,
  address_id: true,
  billing_address_id: true,
  organization_id: true,
  password_hash: true,
  avatar_color: true,
  tax_id: true,
  address: true,
  billing_address: true,
  abbreviation: true,
  staffs: {
    include: {
      staff: {
        include: {
          organization: {
            include: {
              address: true,
              Tax: true,
            },
          },
        },
      },
    },
  },
  patients: {
    include: {
      user: {
        include: {
          address: true,
          billing_address: true,
          Tax: true,
        },
      },
    },
  },
  organization: {
    include: {
      address: true,
      billing_address: true,
      Tax: true,
    },
  },
  Tax: true,
  PatientInvoices: {
    select: {
      ...invoiceSelect,
    },
  },
  role_id: true,
  CustomRolePermissions: {
    include: {
      role_permission: {
        include: {
          resource: true,
          permission: true,
        },
      },
    },
  },
  google_calendar_setting_id: true,
  quick_notes: true,
  language: true,
});

/**
 * List users
 * @param active - The user active
 * @param query - The user query
 * @param type - The user type
 * @param rowsPerPage - The user rows per page
 * @param page - The user page
 * @param sortDir - The user sort direction
 * @returns The user list
 */
const listUsers = isAuthenticated
  .input(
    z.object({
      active: z.boolean().optional(),
      query: z.string().optional(),
      type: z.array(z.nativeEnum(UserType)),
      rowsPerPage: z.number().min(5).optional(),
      page: z.number().min(0).optional(),
      sortDir: z.nativeEnum(Prisma.SortOrder),
      assigned: z.boolean().optional(),
      includeEmailQueryFilter: z.boolean().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const searchQuery = input.query?.split(' ') || []; // split the search query into words

    const searchConditions: Prisma.UserWhereInput[] = searchQuery.map((word) => {
      if (input.includeEmailQueryFilter) {
        return {
          OR: [
            { first_name: { contains: word, mode: 'insensitive' } },
            { last_name: { contains: word, mode: 'insensitive' } },
            { email: { contains: word, mode: 'insensitive' } },
          ],
        };
      }

      return {
        OR: [
          { first_name: { contains: word, mode: 'insensitive' } },
          { last_name: { contains: word, mode: 'insensitive' } },
        ],
      };
    });

    const where: Prisma.UserWhereInput = {
      type: { in: input.type },
      ...(input.active !== undefined && { active: input.active }),
      ...(input.query && {
        OR: searchConditions,
      }),
      organization_id: ctx.user.organization_id,
      ...(input.assigned && {
        staffs: {
          some: {
            staffId: ctx.user.id,
          },
        },
      }),
    };

    const totalRowCount = await prisma.user.count({
      where,
    });

    const rowsPerPage = input.rowsPerPage || totalRowCount;
    const page = input.page || 0;

    const users = await prisma.user.findMany({
      skip: page * rowsPerPage,
      take: rowsPerPage,
      where,
      orderBy: {
        updated_at: input.sortDir,
      },
    });

    return {
      items: users as User[],
      meta: {
        totalRowCount,
      },
    };
  });
export default listUsers;
