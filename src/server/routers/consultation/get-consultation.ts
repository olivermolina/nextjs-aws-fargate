import { publicProcedure } from '../../trpc';
import z from 'zod';
import prisma from 'src/libs/prisma';
import { ConsultationSelect, ConsultationTrpcResponse } from './index';
import dailyCoApiClient from '../../../libs/daily-co';
import { isOwnedByOrganization } from '../../../utils/is-owned-by-organization';

export const getConsultation = publicProcedure
  .input(
    z.object({
      id: z.string(),
      organization_id: z.string().optional().nullable(),
    })
  )
  .query(async ({ input }) => {
    const consultation = (await prisma.consultation.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      select: ConsultationSelect,
    })) as ConsultationTrpcResponse;

    if (!consultation.video_room_id && consultation.telemedicine) {
      try {
        const response = await dailyCoApiClient.post('/rooms', {
          name: input.id,
          properties: {
            enable_recording: 'cloud',
            enable_chat: true,
          },
        });

        if (response.data.id) {
          await prisma.consultation.update({
            where: {
              id: input.id,
            },
            data: {
              video_room_id: response.data.id,
            },
          });
        }
      } catch (error) {
        console.error(error.message);
      }
    }

    if (input.organization_id) {
      isOwnedByOrganization(input.organization_id, consultation.user);
    }

    return consultation;
  });
