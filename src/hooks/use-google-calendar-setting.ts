import { useAuth } from './use-auth';
import type { AuthContextType } from '../contexts/auth/jwt';
import React, { useCallback, useState } from 'react';
import { useDialog } from './use-dialog';
import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { getBaseUrl } from '../utils/get-base-url';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

export const useGoogleCalendarSetting = (showSuccess?: boolean, redirectUri?: string) => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(trpc.organization.gettingStarted, undefined, 'query');

  const { user } = useAuth<AuthContextType>();
  const [checked, setChecked] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const dialog = useDialog();
  const syncDialog = useDialog();

  const [state, setState] = useState({
    push_calendar: false,
    pull_calendar: false,
  });

  const mutation = trpc.extension.authorizeGoogle.useMutation();
  const { data, refetch, isLoading } = trpc.extension.getGoogleCalendarSetting.useQuery(undefined, {
    onSettled: (data) => {
      if (data) {
        setChecked(true);
        setState({
          push_calendar: data.push_calendar || false,
          pull_calendar: data.pull_calendar || false,
        });
      }
    },
    refetchOnWindowFocus: true,
  });
  const disconnectMutation = trpc.extension.disconnectGoogleCalendar.useMutation();
  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      setChecked(false);
      await refetch();
      dialog.handleClose();
      toast('You\'ve disconnected your Google Calendar from Luna');
      await queryClient.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateMutation = trpc.extension.updateGoogleCalendarSetting.useMutation();

  const updateCalendarSetting = useCallback(
    async (id: string, newState: Record<string, boolean>) => {
      try {
        await updateMutation.mutateAsync({
          id,
          ...newState,
        });
        if (showSuccess) {
          toast('Success!');
        }
        await refetch();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [data],
  );

  const onChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      setState((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.checked,
      }));

      if (!data) return;

      updateCalendarSetting(data.id, { [event.target.name]: event.target.checked });
    },
    [data],
  );

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      try {
        console.log(response);
        await mutation.mutateAsync({
          code: response.code,
        });
        const { data } = await refetch();

        if (data) {
          await updateCalendarSetting(data.id, {
            push_calendar: false,
            pull_calendar: true,
          });
        }
        setConnectLoading(false);
        syncDialog.handleOpen();
        setChecked(true);
        toast('You\'ve connected your Google Calendar to Luna');
        await queryClient.invalidateQueries({ queryKey });
      } catch (e) {
        setConnectLoading(false);
        toast.error(e.message);
      }
    },
    onError: (errorResponse) => {
      setConnectLoading(false);
      setChecked(false);
      console.error(errorResponse);
      if (errorResponse?.error_description) {
        toast.error(errorResponse.error_description);
      }
    },
    // @ts-ignore
    redirect_uri: redirectUri || getBaseUrl(),
    scope: 'https://www.googleapis.com/auth/calendar',
    hint: user?.email,
    onNonOAuthError: () => {
      setConnectLoading(false);
      setChecked(false);
      toast.error('Couldn\'t connect to Google Calendar');
    },
  });

  return {
    state,
    checked,
    connectLoading,
    dialog,
    syncDialog,
    onChange,
    googleLogin,
    handleDisconnect,
    isLoading,
    disconnectMutation,
    data,
    updateCalendarSetting,
    updateMutation,
    mutation,
    setConnectLoading,
  };
};
