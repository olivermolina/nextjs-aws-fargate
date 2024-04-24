import { trpc } from '../app/_trpc/client';
import React, { useEffect, useState } from 'react';

export const useServiceStore = () => {
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const { data, isLoading, refetch } = trpc.service.list.useQuery(
    {
      rowsPerPage: 1000,
      page: 0,
    },
    {
      keepPreviousData: true,
    }
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === 'all' && event.target.checked) {
      const services = data?.items.reduce(
        (acc, service) => {
          acc[service.id] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setSelectedServices({
        ...services,
        all: true,
      });
      return;
    }

    if (event.target.name === 'all' && !event.target.checked) {
      setSelectedServices({});
      return;
    }

    setSelectedServices({
      ...selectedServices,
      [event.target.name]: event.target.checked,
    });
  };

  useEffect(() => {
    const services = data?.items || [];
    if (services.length > 0) {
      setSelectedServices(
        services.reduce(
          (acc, service) => {
            acc[service.id] = false;
            return acc;
          },
          {} as Record<string, boolean>,
        )
      );
    }
  }, [data]);

  return { services: data?.items || [], isLoading, refetch, selectedServices, handleChange };
};
