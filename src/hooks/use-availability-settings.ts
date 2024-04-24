import { trpc } from '../app/_trpc/client';
import { useFieldArray, useForm } from 'react-hook-form';
import { AvailabilityInput, AvailabilityValidationSchema } from '../utils/zod-schemas/availability';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { randomId } from '@mui/x-data-grid-generator';
import dayjs from 'dayjs';


export const DAYS_OF_WEEK = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

export const useAvailabilitySettings = () => {
  const { data, refetch } = trpc.user.availability.useQuery();
  const mutation = trpc.user.saveAvailability.useMutation();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
  } = useForm<AvailabilityInput>({
    resolver: zodResolver(AvailabilityValidationSchema),
  });

  const [editMode, setEditMode] = useState(false);
  const [activeDays, setActiveDays] = useState<number[]>([]);

  const toggleEditMode = () => setEditMode((prev) => !prev);

  const onSubmit = useCallback(
    async (data: AvailabilityInput) => {
      try {
        await mutation.mutateAsync(data);
        await refetch();
        toggleEditMode();
        toast.success('Availability updated.');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [activeDays],
  );

  const { append, remove, fields, update } = useFieldArray({
    control,
    name: 'availabilitySlots',
  });

  const toggleActiveDay = useCallback(
    (dayOfWeek: number) => {
      if (activeDays.includes(dayOfWeek)) {
        setActiveDays((prevState) => prevState.filter((d) => d !== dayOfWeek));
        const index = fields.findIndex((field) => field.dayOfWeek === dayOfWeek);
        if (index !== -1) {
          remove(index);
        }
      } else {
        setActiveDays((prevState) => [...prevState, dayOfWeek]);
        append({
          dayOfWeek: dayOfWeek,
          daySlots: [
            {
              id: randomId(),
              start_time: dayjs().set('hour', 9).set('minute', 0).toDate(),
              end_time: dayjs().set('hour', 17).set('minute', 0).toDate(),
            },
          ],
        });
      }
    },
    [activeDays, fields],
  );

  const handleAddDaySlot = useCallback(
    (dayOfWeek: number) => {
      const index = fields.findIndex((field) => field.dayOfWeek === dayOfWeek);

      if (index !== -1) {
        const dayofWeekSlot = fields[index];
        update(index, {
          dayOfWeek: dayOfWeek,
          daySlots: [
            ...dayofWeekSlot?.daySlots,
            {
              id: randomId(),
              start_time: dayjs().set('hour', 9).set('minute', 0).toDate(),
              end_time: dayjs().set('hour', 17).set('minute', 0).toDate(),
            },
          ],
        });
      }
    },
    [fields],
  );

  const handleReset = () => {
    refetch();
    reset();
    toggleEditMode();
  };

  const handleRemoveDaySlot = (dayOfWeek: number, daySlotId: string) => {
    const index = fields.findIndex((field) => field.dayOfWeek === dayOfWeek);
    if (index !== -1) {
      update(index, {
        dayOfWeek: dayOfWeek,
        daySlots: fields[index].daySlots.filter((daySlot) => daySlot.id !== daySlotId),
      });
    }
  };

  const handleTimeChange = (
    dayOfWeek: number,
    daySlot: AvailabilityInput['availabilitySlots'][0]['daySlots'][0],
  ) => {
    const index = fields.findIndex((field) => field.dayOfWeek === dayOfWeek);
    if (index !== -1) {
      const dayOfWeekSlot = fields[index];
      const daySlotIndex = dayOfWeekSlot.daySlots.findIndex((slot) => slot.id === daySlot.id);
      if (daySlotIndex !== -1) {
        update(index, {
          dayOfWeek: dayOfWeek,
          daySlots: [
            ...dayOfWeekSlot.daySlots.slice(0, daySlotIndex),
            daySlot,
            ...dayOfWeekSlot.daySlots.slice(daySlotIndex + 1),
          ],
        });
      }
    }
  };

  return {
    editMode,
    activeDays,
    toggleEditMode,
    toggleActiveDay,
    onSubmit,
    errors,
    register,
    handleSubmit,
    control,
    reset,
    isSubmitting,
    handleAddDaySlot,
    handleRemoveDaySlot,
    fields,
    handleReset,
    setValue,
    availability: data,
    getValues,
    setActiveDays,
    handleTimeChange,
  };
};
