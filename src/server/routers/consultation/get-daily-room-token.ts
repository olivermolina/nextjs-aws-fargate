import z from 'zod';
import dailyCoApiClient from '../../../libs/daily-co';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';

export const generateDailyRoomToken = async (consultationId: string, isOwner?: boolean) => {
  try {
    const response = await dailyCoApiClient.post('meeting-tokens', {
      properties: {
        room_name: consultationId,
        is_owner: isOwner,
        enable_recording_ui: isOwner,
      },
    });

    return response.data;
  } catch (error) {
    console.log('Error getting daily room token', error.message);
  }
};

export const getDailyRoomToken = publicProcedure
  .input(
    z.object({
      id: z.string(),
      is_owner: z.boolean(),
    })
  )
  .query(async ({ input }) => {
    try {
      await dailyCoApiClient.post(`/rooms/${input.id}`, {
        privacy: 'private',
        properties: {
          enable_recording: 'cloud',
          enable_chat: true,
          owner_only_broadcast: false,
        },
      });

      return await generateDailyRoomToken(input.id, input.is_owner);
    } catch (error) {
      console.log('Error getting daily room token', error);
    }

    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Daily Room not found',
    });
  });
