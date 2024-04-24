import { trpc } from '../app/_trpc/client';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import filter from 'lodash/filter';
import uniqBy from 'lodash/uniqBy';
import dayjs from 'dayjs';
import { PatientFeed } from '../types/patient';
import { SelectChangeEvent } from '@mui/material/Select';
import useDebounce from './use-debounce';

const getUniqueFeeds = (feeds: PatientFeed[]) => {
  return uniqBy(feeds, (feed) => {
    if (feed.Consultation) {
      return feed.Consultation.id;
    }

    if (feed.File) {
      return feed.File.id;
    }
    if (feed.SubFile) {
      return feed.SubFile.id;
    }
    return feed.id;
  });
};

export const usePatientFeeds = (id: string) => {
  const [filters, setFilters] = useState<{
    dateFrom: Date | null;
    dateTo: Date | null;
    query: string | null;
    chartStatus: 'all' | 'signed' | 'unsigned' | null;
  }>({
    dateFrom: null,
    dateTo: null,
    query: null,
    chartStatus: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce<string>(filters.query || '', 500);
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      query: value,
    }));
  };

  const handleDateChangeFrom = (date: Date | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      dateFrom: date,
    }));
  };

  const handleDateChangeTo = (date: Date | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      dateTo: date,
    }));
  };

  const handleChangeChartStatus = (event: SelectChangeEvent) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      chartStatus: event.target.value as 'all' | 'signed' | 'unsigned',
    }));
  };

  const { data, fetchNextPage, isLoading, refetch } = trpc.user.patientFeeds.useInfiniteQuery(
    {
      limit: 100,
      id: id,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      query: searchQuery,
      chartStatus: filters.chartStatus,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: true,
    }
  );

  // Get upcoming appointments
  const upComingAppointments = useMemo(() => {
    if (!data) return [];

    const appointments = data.pages
      .map((page) => page.notifications)
      .flat()
      .filter((notification) => !!notification.consultation_id);

    // Get future appointments
    return getUniqueFeeds(
      filter(appointments, (appointment) => {
        const date = dayjs(appointment.Consultation!.start_time);
        return date.isAfter(dayjs(), 'day');
      })
    );
  }, [data]);

  // Get current week events
  const currentWeekFeeds = useMemo(() => {
    if (!data) return [];

    const feeds = data.pages.map((page) => page.notifications).flat();

    // Get current week events
    return getUniqueFeeds(
      filter(feeds, (feed) => {
        const date = dayjs(feed.Consultation ? feed.Consultation.start_time : feed.created_at);
        return date.isBetween(dayjs().startOf('week'), dayjs().add(1, 'day'), 'd', '[)');
      })
    );
  }, [data]);

  // Get previous week events (last week)
  const previousWeekFeeds = useMemo(() => {
    if (!data) return [];

    const feeds = data.pages
      .map((page) => page.notifications)
      .flat()
      .filter((notification) => !notification.message_id);

    // Get previous week events
    return getUniqueFeeds(
      filter(feeds, (feed) => {
        const date = dayjs(feed.Consultation ? feed.Consultation.start_time : feed.created_at);
        return date.isBetween(
          dayjs().subtract(1, 'week').startOf('week'),
          dayjs().subtract(1, 'week').endOf('week'),
          'd',
          '[)',
        );
      })
    );
  }, [data]);

  // Get past events (more than 1 week ago) grouped by month
  const monthlyFeeds = useMemo(() => {
    if (!data) return null;

    const feeds = data.pages
      .map((page) => page.notifications)
      .flat()
      .filter((notification) => !notification.message_id);

    // Get past events
    const pastEvents = filter(feeds, (feed) => {
      const date = dayjs(feed.Consultation ? feed.Consultation.start_time : feed.created_at);
      return date.isBefore(dayjs().subtract(1, 'week').startOf('week'), 'day');
    });

    // Group by month
    const monthlyFeeds = pastEvents.reduce((acc: Record<string, typeof pastEvents>, curr) => {
      const month = dayjs(
        curr.Consultation ? curr.Consultation.start_time : curr.created_at,
      ).format('MMMM 1, YYYY');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(curr);
      return acc;
    }, {});

    const uniqueMonthlyFeeds: Record<string, typeof pastEvents> = {};
    Object.keys(monthlyFeeds).forEach((key) => {
      uniqueMonthlyFeeds[key] = getUniqueFeeds(monthlyFeeds[key]);
    });
    return uniqueMonthlyFeeds;
  }, [data]);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  return {
    upComingAppointments,
    currentWeekFeeds,
    previousWeekFeeds,
    monthlyFeeds,
    fetchNextPage,
    nextCursor: data ? data.pages[data.pages.length - 1].nextCursor : undefined,
    isLoading,
    refetch,
    filters,
    handleDateChangeFrom,
    handleDateChangeTo,
    handleChangeChartStatus,
    handleSearchInputChange,
  };
};
