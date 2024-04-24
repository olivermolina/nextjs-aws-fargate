import { Invoice } from '../types/invoice';
import { trpc } from '../app/_trpc/client';
import { useDialog } from './use-dialog';
import { useSearchParams } from './use-search-params';
import { useCallback, useEffect } from 'react';
import { InvoiceStatus } from '@prisma/client';
import { usePatientPaymentMethod } from './use-patient-payment-method';
import toast from 'react-hot-toast';

export const usePayInvoice = (
  invoice?: Invoice,
  refetchInvoice?: any,
) => {
  const { data, refetch } = trpc.user.getPatientPaymentMethod.useQuery({
    id: invoice?.patient_id!,
  }, {
    enabled: !!invoice?.patient_id,
    refetchOnWindowFocus: false,
  });
  const mutation = trpc.invoice.pay.useMutation();

  const dialog = useDialog();
  const searchParams = useSearchParams();
  const pay = searchParams.get('pay');

  useEffect(() => {
    if (pay && invoice?.status === InvoiceStatus.PENDING) {
      dialog.handleOpen();
    }

    if (pay && invoice?.status === InvoiceStatus.PAID) {
      dialog.handleClose();
    }
  }, [pay, invoice]);

  const paymentMethod = usePatientPaymentMethod(invoice?.patient_id);

  const handlePay = useCallback(async () => {
    if (invoice?.status === InvoiceStatus.PAID) {
      toast.error('This invoice has already been paid.');
      return;
    }

    if (invoice?.status === InvoiceStatus.CANCELED) {
      toast.error('This invoice has been canceled. You cannot pay a canceled invoice.');
      return;
    }

    if (data && invoice?.id) {
      try {
        await mutation.mutateAsync({
          id: invoice.id,
        });
        await refetchInvoice?.();
        toast.success('Invoice paid successfully.');
      } catch (e) {
        toast.error(e.message);
      }
    } else {
      dialog.handleOpen();
    }

  }, [data, invoice]);

  const submitPayNow = useCallback(async (stripePaymentMethodId: string, isNew = true) => {
    if (!invoice) {
      toast.error('Unable to pay invoice. Please try again.');
      return;
    }

    // Save as default payment method
    if (isNew) {
      await paymentMethod.handleSubmit(stripePaymentMethodId);
    }
    dialog.handleClose();
    try {
      await mutation.mutateAsync({
        id: invoice.id,
      });
      await refetch();
      await refetchInvoice();
      toast.success('Invoice paid successfully.');
    } catch (e) {
      toast.error(e.message);
    }
  }, [paymentMethod, mutation, refetchInvoice, invoice]);

  return {
    dialog,
    paymentMethod,
    mutation,
    handlePay,
    refetchPaymentMethod: refetch,
    submitPayNow,
    patientPaymentMethod: data,
  };
};
