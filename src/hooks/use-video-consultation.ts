import { useUpdateSearchParams } from './use-update-search-params';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from './use-search-params';
import { trpc } from '../app/_trpc/client';
import { ChartType } from '@prisma/client';
import { usePopover } from './use-popover';
import toast from 'react-hot-toast';
import { DailyCall } from '@daily-co/daily-js';

export const useVideoConsultation = () => {
  const { replaceSearchParams } = useUpdateSearchParams();
  const [selectedView, setSelectedView] = useState<'chart' | 'info' | 'all'>('all');
  const [callFrame, setCallFrame] = React.useState<DailyCall | null>(null);
  const searchParams = useSearchParams();
  const [recording, setRecording] = useState(false);
  const videoUrl = searchParams.get('video_url');
  const chartId = searchParams.get('chartId');
  const id = useMemo(() => videoUrl?.replace('https://lunahealth.daily.co/', ''), [videoUrl]);
  const { data, refetch } = trpc.consultation.get.useQuery(
    {
      id: id!,
    },
    {
      enabled: !!id,
    },
  );
  const mutation = trpc.chart.create.useMutation();
  const { data: staffRoomToken } = trpc.consultation.getDailyRoomToken.useQuery(
    {
      id: id!,
      is_owner: true,
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  );

  const { data: patientRoomToken } = trpc.consultation.getDailyRoomToken.useQuery(
    {
      id: id!,
      is_owner: false,
    },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  );

  const addChart = useCallback(async () => {
    if (!data) return;

    if (Number(data.Charts?.length) > 0) {
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        consultationId: data.id,
        userId: data.user_id,
        name: 'Initial Charting Note',
        type: ChartType.FREE_TEXT,
        service_datetime: new Date(),
      });
      refetch();
      replaceSearchParams({
        tab: 'profile',
        chartId: result.id,
        video_url: videoUrl || '',
      });
    } catch (e) {
    }
  }, [data]);
  const popover = usePopover<HTMLButtonElement>();
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(`${videoUrl}?t=${patientRoomToken?.token}` || '')
      .then(() => {
        toast.success('Link copied');
      })
      .catch(() => {
        toast.error('Failed to copy link ');
      });
    popover.handleClose();
  };
  const handleManualRecording = () => {
    popover.handleClose();

    if (!callFrame) {
      return;
    }

    if (recording) {
      callFrame.stopRecording();
    } else {
      callFrame.startRecording();
    }
  };

  useEffect(() => {
    if (!videoUrl) {
      setSelectedView('all');
      return;
    }

    if (Number(data?.Charts?.length) > 0 || chartId) {
      setSelectedView('chart');
    } else {
      setSelectedView('info');
    }
  }, [data, chartId, videoUrl]);

  // Add initial charting note if there are no charts
  useEffect(() => {
    if (!data) return;

    if (Number(data.Charts?.length) > 0) {
      replaceSearchParams({
        tab: 'profile',
        chartId: data.Charts[0].id,
        video_url: videoUrl || '',
      });
      return;
    }

    addChart();
  }, [data, videoUrl]);

  return {
    id,
    data,
    selectedView,
    setSelectedView,
    refetch,
    popover,
    handleCopyLink,
    recording,
    setRecording,
    handleManualRecording,
    callFrame,
    setCallFrame,
    staffRoomToken,
    patientRoomToken,
  };
};
