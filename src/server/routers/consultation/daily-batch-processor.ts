import { publicProcedure } from '../../trpc';
import z from 'zod';
import dailyCoApiClient from '../../../libs/daily-co';
import { qstashRequest } from '../../../libs/qstash';

export const dailyBatchProcessor = publicProcedure
  .input(
    z.object({
      recordingId: z.string(),
      consultationId: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    try {
      const response = await dailyCoApiClient.post('/batch-processor', {
        preset: 'soap-notes',
        inParams: {
          sourceType: 'recordingId',
          recordingId: input.recordingId,
        },
        outParams: {
          s3Config: {
            s3KeyTemplate: 'soap-notes',
          },
        },
      });

      if (response.data.id) {
        await qstashRequest({
          url: `v2/schedules/https://admin.lunahealth.app/api/qstash-daily`,
          method: 'POST',
          headers: {
            'Upstash-Method': 'POST',
            // TODO change to */10 * * * * (10 minutes) in production
            'Upstash-Cron': '* * * * *', // Run every 1 minute
          },
          data: {
            jobId: response.data.id,
            consultationId: input.consultationId,
          },
        });
      }
    } catch (error) {
      console.error(error.message);
    }

    return 'success';
  });
