import { trpc } from '../app/_trpc/client';
import { useState } from 'react';
import { CustomerWelcomeEmailInput } from 'src/sections/dashboard/customer/customer-welcome-email-dialog';
import toast from 'react-hot-toast';

export const useInvite = () => {
  const mutationInvite = trpc.user.invite.useMutation();
  const [openInvite, setOpenInvite] = useState(false);
  const handleOpenInvite = () => setOpenInvite(true);
  const handleCloseInvite = () => setOpenInvite(false);

  const handleSendInvite = async (input: CustomerWelcomeEmailInput) => {
    try {
      await mutationInvite.mutateAsync(input);
      toast.success('Email sent!');
      handleCloseInvite();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    open: openInvite,
    handleClose: handleCloseInvite,
    handleOpenInvite,
    handleSendInvite,
    onSubmit: handleSendInvite,
    isLoading: mutationInvite.isLoading,
  };
};
