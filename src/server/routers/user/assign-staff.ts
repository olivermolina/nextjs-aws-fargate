import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from 'src/libs/prisma';
import z from 'zod';

const assignStaff = isAuthenticated
  .input(
    z.object({
      patientIds: z.array(z.string()).nonempty('Patient IDs must be provided'),
      staffIds: z.array(z.string()).nonempty('Staff IDs must be provided'),
      action: z.enum(['add', 'update']),
    })
  )
  .mutation(async ({ input }) => {
    if (input.action === 'update') {
      return prisma.$transaction([
        // Unassign staff from patient if not on the list
        ...input.patientIds.flatMap((patientId) =>
          prisma.userStaffs.deleteMany({
            where: {
              userId: patientId,
              NOT: {
                staffId: {
                  in: input.staffIds,
                },
              },
            },
          }),
        ),
        // Assign staff to patient if not already assigned
        ...input.patientIds.flatMap((patientId) =>
          input.staffIds.map((staffId) =>
            prisma.userStaffs.upsert({
              where: {
                userId_staffId: {
                  userId: patientId,
                  staffId: staffId,
                },
              },
              create: {
                staffId: staffId,
                userId: patientId,
              },
              update: {},
            }),
          ),
        ),
      ]);
    }

    return prisma.$transaction(
      input.patientIds.flatMap((patientId) =>
        input.staffIds.map((staffId) =>
          prisma.userStaffs.upsert({
            where: {
              userId_staffId: {
                userId: patientId,
                staffId: staffId,
              },
            },
            create: {
              staffId: staffId,
              userId: patientId,
            },
            update: {},
          })
        )
      )
    );
  });

export default assignStaff;
