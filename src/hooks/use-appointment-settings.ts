import { trpc } from '../app/_trpc/client';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export type AppointmentReminder =
  | 'reminders_day_before'
  | 'reminders_hour_before'
  | 'sms_reminders_day_before'
  | 'sms_reminders_hour_before'
  | 'appointment_payment_auto_capture'
  | 'appointment_auto_send_invoice'
  | 'appointment_payment_required'
  | 'telemedicine_auto_recording'
  | 'appointment_request_enabled';

export const useAppointmentSettings = () => {
  const { data } = trpc.organization.get.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const [state, setState] = useState({
    reminders_day_before: false,
    reminders_hour_before: false,
    sms_reminders_day_before: false,
    sms_reminders_hour_before: false,
    appointment_payment_auto_capture: false,
    appointment_auto_send_invoice: false,
    appointment_payment_required: false,
    telemedicine_auto_recording: false,
    appointment_request_enabled: false,
  });

  const mutation = trpc.organization.update.useMutation();

  const submit = useCallback(
    async (input: Record<AppointmentReminder, boolean>) => {
      if (!data) {
        toast.error('Organization is invalid.');
        return;
      }

      try {
        await mutation.mutateAsync({
          id: data.id,
          name: data.name,
          ...input,
        });
        toast.success('Your organization\'s appointment settings have been updated.');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [data],
  );

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = {
      ...state,
      [event.target.name]: event.target.checked,
    };
    setState(newState);

    submit(newState);
  };

  useEffect(() => {
    if (data) {
      setState({
        reminders_day_before: data.reminders_day_before,
        reminders_hour_before: data.reminders_hour_before,
        sms_reminders_day_before: data.sms_reminders_day_before,
        sms_reminders_hour_before: data.sms_reminders_hour_before,
        appointment_payment_auto_capture: data.appointment_payment_auto_capture,
        appointment_auto_send_invoice: data.appointment_auto_send_invoice,
        appointment_payment_required: data.appointment_payment_required,
        telemedicine_auto_recording: data.telemedicine_auto_recording,
        appointment_request_enabled: data.appointment_request_enabled,
      });
    }
  }, [data]);

  return {
    state,
    onChange,
  };
};
