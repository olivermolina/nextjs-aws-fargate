import { publicProcedure } from '../../trpc';
import z from 'zod';
import dailyCoApiClient from '../../../libs/daily-co';
import { qstashRequest } from '../../../libs/qstash';
import axios from 'axios';
import prisma from 'src/libs/prisma';
import { ChartType, Consultation, ConsultationStaff } from '@prisma/client';

const addTranscriptToChart = async (
  transcriptLink: string,
  consultation: Consultation & {
    staffs: ConsultationStaff[];
  },
  daily_recording_id: string,
) => {
  try {
    const isExist = await prisma.chart.findFirst({
      where: {
        daily_recording_id,
        daily_preset: 'transcript',
      },
    });

    // Check if the transcript chart already exists for the consultation and return if it does exist
    if (isExist) return;

    const count = await prisma.chart.count({
      where: {
        consultation_id: consultation.id,
        daily_preset: 'transcript',
      },
    });
    const name = count > 0 ? `Transcription ${count + 1}` : 'Transcription';

    const response = await axios.get(transcriptLink);
    const transcriptText =
      response.data.results.channels?.[0].alternatives?.[0].paragraphs?.transcript;

    // Create a Transcript chart
    await prisma.chart.create({
      data: {
        name,
        free_text: transcriptText,
        type: ChartType.FREE_TEXT,
        user: {
          connect: {
            id: consultation.user_id,
          },
        },
        created_by: {
          connect: {
            id: consultation.staffs?.[0]!.staff_id!,
          },
        },
        assigned_to: {
          connect: {
            id: consultation.staffs?.[0]!.staff_id!,
          },
        },
        consultation: {
          connect: {
            id: consultation.id,
          },
        },
        service_datetime: consultation.start_time,
        daily_recording_id,
        daily_preset: 'transcript',
      },
    });
  } catch (e) {
    console.error(e.message);
  }
};

const addSoapToChart = async (
  soapNoteLink: string,
  consultation: Consultation & {
    staffs: ConsultationStaff[];
  },
  daily_recording_id: string,
) => {
  try {
    const isExist = await prisma.chart.findFirst({
      where: {
        daily_recording_id,
        daily_preset: 'soap-notes',
      },
    });

    // Check if the SOAP chart already exists for the consultation and return if it does exist
    if (isExist) return;

    const count = await prisma.chart.count({
      where: {
        consultation_id: consultation.id,
        daily_preset: 'soap-notes',
      },
    });

    const name = count > 0 ? `Generated SOAP ${count + 1}` : 'Generated SOAP';

    const response = await axios.get(soapNoteLink);

    // Create a Transcript chart
    await prisma.chart.create({
      data: {
        name,
        subjective_text: response.data.Subjective,
        objective_text: response.data.Objective,
        assessment_text: response.data.Assessment,
        plan_text: response.data.Plan,
        type: ChartType.SOAP,
        user: {
          connect: {
            id: consultation.user_id,
          },
        },
        created_by: {
          connect: {
            id: consultation.staffs?.[0]!.staff_id!,
          },
        },
        assigned_to: {
          connect: {
            id: consultation.staffs?.[0]!.staff_id!,
          },
        },
        consultation: {
          connect: {
            id: consultation.id,
          },
        },
        service_datetime: consultation.start_time,
        daily_recording_id,
        daily_preset: 'soap-notes',
      },
    });
  } catch (e) {
    console.error(e.message);
  }
};

export const dailyProcessedJob = publicProcedure
  .input(
    z.object({
      jobId: z.string(),
      scheduleId: z.string(),
      consultationId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const response = await dailyCoApiClient.get(`/batch-processor/${input.jobId}`);

      if (response.data.status === 'finished' && response.data.input.sourceType === 'recordingId') {
        const recordingId = response.data.input.recordingId;

        try {
          // Remove the schedule from qstash
          await qstashRequest({
            url: `v2/schedules/${input.scheduleId}`,
            method: 'DELETE',
          });
        } catch (e) {
          console.log(e.message);
        }

        // Get the access link to the transcript and soap notes
        const accessLink = await dailyCoApiClient.get(
          `/batch-processor/${input.jobId}/access-link`,
        );
        if (accessLink.data) {
          const transcriptLink = accessLink.data.transcription?.find(
            (transcript: any) => transcript.format === 'json',
          )?.link;
          const soapLink = accessLink.data.soap.link;
          const consultation = await prisma.consultation.findUniqueOrThrow({
            where: {
              id: input.consultationId,
            },
            include: {
              staffs: true,
            },
          });

          if (consultation) {
            await Promise.all([
              addTranscriptToChart(transcriptLink, consultation, recordingId),
              addSoapToChart(soapLink, consultation, recordingId),
            ]);
          }
        }
      }
    } catch (error) {
      console.error(error.message);
    }

    return 'success';
  });
