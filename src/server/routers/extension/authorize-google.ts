import z from 'zod';
import axios from 'axios';
import { TRPCError } from '@trpc/server';
import { ObjectId } from 'bson';
import { isAuthenticated } from '../middleware/isAuthenticated';
import prisma from '../../../libs/prisma';
import { google } from 'googleapis';
import { getBaseUrl } from '../../../utils/get-base-url';

export const authorizeGoogle = isAuthenticated
  .input(
    z.object({
      code: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const oauth2Client = new google.auth.OAuth2(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, getBaseUrl());
      const { tokens } = await oauth2Client.getToken(input.code);
      const response = await axios('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invalid account',
        });
      }

      const userInfo = response.data;

      const user = await prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Staff not found!',
        });
      }

      const data = {
        email: userInfo.email,
        ...tokens,
      };

      const googleCalendarSetting = await prisma.googleCalendarSetting.upsert({
        where: {
          id: user.google_calendar_setting_id || new ObjectId().toString('hex'),
        },
        create: data,
        update: data,
      });

      await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          google_calendar_setting_id: googleCalendarSetting.id,
        },
      });
      return userInfo;
    } catch (error) {
      throw error;
    }
  });
