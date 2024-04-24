import { useAuth } from './use-auth';
import { AuthContextType } from '../contexts/auth/jwt';
import { useForm } from 'react-hook-form';
import {
  SchedulingLinkInput,
  SchedulingLinkValidationSchema,
} from '../utils/zod-schemas/scheduling-link';
import { zodResolver } from '@hookform/resolvers/zod';
import useDebounce from './use-debounce';
import { trpc } from '../app/_trpc/client';
import { useCallback, useState } from 'react';
import { AuthUser } from '../contexts/auth/jwt/auth-context';
import toast from 'react-hot-toast';

export const useScheduleLinkSettings = () => {
  const { setAuthUser, user } = useAuth<AuthContextType>();
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm<SchedulingLinkInput>({
    mode: 'all',
    resolver: zodResolver(SchedulingLinkValidationSchema),
  });

  const schedulingLink = watch('slug');
  const debouncedSchedulingLink = useDebounce<string>(schedulingLink, 500);
  const mutation = trpc.user.update.useMutation();

  const [schedulingLinkEditMode, setSchedulingLinkEditMode] = useState(false);

  const { data, isLoading } = trpc.user.isUniqueSlug.useQuery(
    {
      slug: debouncedSchedulingLink,
    },
    {
      enabled: !!debouncedSchedulingLink,
    },
  );

  const handleSchedulingLinkSubmit = async (data: SchedulingLinkInput) => {
    // Handle the scheduling link submit logic here
    try {
      const user = await mutation.mutateAsync({
        id: data.id,
        username: data.slug,
      });
      setAuthUser(user as AuthUser);
      toast.success('Scheduling link updated.');

      // Then toggle edit mode off
      toggleSchedulingLinkEditMode();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const toggleSchedulingLinkEditMode = useCallback(() => {
    if (user) {
      reset({
        slug: user.username!,
        id: user.id,
      });
    }

    setSchedulingLinkEditMode((prev) => !prev);
  }, [user]);

  return {
    isAvailable: !!data,
    schedulingLinkEditMode,
    schedulingLink,
    isLoading,
    toggleSchedulingLinkEditMode,
    handleSchedulingLinkSubmit,
    errors,
    isSubmitting,
    register,
    handleSubmit,
    reset,
  };
};
