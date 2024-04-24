import { useDispatch, useSelector } from '../store';
import { useRouter } from './use-router';
import { useParams } from 'next/navigation';
import { useTimezone } from './use-timezone';
import { usePatientPaymentMethod } from './use-patient-payment-method';
import { trpc } from '../app/_trpc/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { slice } from '../slices/schedule';
import dayjs, { Dayjs } from 'dayjs';
import { PatientInput } from '../types/patient';
import toast from 'react-hot-toast';
import { Address, Organization, Service, Status, UserType } from '@prisma/client';
import { getUserFullName } from '../utils/get-user-full-name';
import { paths } from '../paths';
import { Consultation } from '../types/consultation';
import { User } from '../types/user';
import { AvailabilityWithSlots } from '../sections/schedule/appointment-create-form';
import { SelectChangeEvent } from '@mui/material/Select';

export type OrganizationType = Organization & {
  Services: Service[];
  users: User[];
  Availabilities: AvailabilityWithSlots[];
  address: Address | null;
};

export const useScheduleStore = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const scheduleSlug = params['slug'] as string;
  const serviceSlug = params['service-slug'] as string;
  const {
    selectedStaffId,
    selectedServiceId,
    scheduleDate,
    isScheduleSubmitting,
    scheduleActiveStep,
    scheduleTimeSlot,
    user,
    selectedLocationId,
  } = useSelector((state) => state.schedule);

  const timezone = useTimezone();
  const paymentMethod = usePatientPaymentMethod(user?.id, user?.organization_id);
  const [triggerSubmit, setTriggerSubmit] = useState(false);

  const mutation = trpc.consultation.create.useMutation();

  const createUserMutation = trpc.user.create.useMutation();
  const payAppointmentMutation = trpc.user.payAppointment.useMutation();

  const { data: providerData, isLoading: providerIsLoading } = trpc.user.getUserByUsername.useQuery(
    {
      username: scheduleSlug,
    },
    {
      enabled: !!scheduleSlug,
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const stopTriggerSubmit = async (paymentMethodId?: string) => {
    if (paymentMethodId) {
      await submitPaymentAndAppointment(paymentMethodId);
    } else {
      setTriggerSubmit(false);
    }
  };

  const { data: organizationData, isLoading: organizationIsLoading } =
    trpc.organization.getOrganizationBySlug.useQuery(
      {
        slug: scheduleSlug,
      },
      {
        enabled: !!scheduleSlug,
        refetchOnWindowFocus: false,
        retry: 1,
      }
    );

  const setSelectedStaff = useCallback(
    (staffId: string) => {
      dispatch(slice.actions.setSelectedStaff(staffId));
    },
    [dispatch],
  );

  const setSelectedService = useCallback(
    (serviceId: string) => {
      dispatch(slice.actions.setSelectedService(serviceId));
    },
    [dispatch],
  );

  const setSelectedDate = useCallback(
    (date: Dayjs) => {
      dispatch(slice.actions.setScheduleDate(date.toDate()));
    },
    [dispatch],
  );

  const setScheduleTimeSlot = useCallback(
    (scheduleTimeSlot: { start: Dayjs; end: Dayjs }) => {
      dispatch(
        slice.actions.setScheduleTimeSlot({
          start: scheduleTimeSlot.start.toDate(),
          end: scheduleTimeSlot.end.toDate(),
        })
      );
    },
    [dispatch],
  );

  const setScheduleActiveStep = useCallback(
    (activeStep: number) => {
      dispatch(slice.actions.setScheduleActiveStep(activeStep));
    },
    [dispatch],
  );

  const organization = useMemo(
    () => (providerData?.organization || organizationData) as unknown as OrganizationType,
    [providerData, organizationData],
  );

  const { data: logoUrl } = trpc.user.getSignedUrlFile.useQuery(
    {
      key: organization?.logo || '',
    },
    {
      enabled: !!organization?.logo,
      refetchOnWindowFocus: false,
    }
  );

  const serviceOptions = useMemo(() => {
    if (selectedLocationId === 'telemedicine') {
      return organization?.Services.filter((service) => service.telemedicine) || [];
    }

    if (selectedLocationId) {
      return organization?.Services.filter((service) => !service.telemedicine) || [];
    }

    return organization?.Services || [];
  }, [organization?.Services, selectedLocationId]);

  const handleLocationChange = (event: SelectChangeEvent) => {
    dispatch(slice.actions.setSelectedLocationId(event.target.value as string));
    dispatch(slice.actions.setScheduleActiveStep(0));
  };

  const { data: locations } = trpc.location.getLocationByOrganizationId.useQuery(
    {
      organization_id: organization?.id!,
    },
    {
      keepPreviousData: true,
      enabled: !!organization?.id,
    }
  );

  const chargeAmount = useMemo(() => {
    const service = selectedServiceId
      ? organization?.Services.find((service) => service.id === selectedServiceId)
      : organization?.Services.find((service) => service.slug === serviceSlug);
    return Number(service?.price) || 0;
  }, [selectedServiceId, serviceSlug, organization]);

  const isNewPatient = useMemo(() => {
    if (user) {
      const dayDiff = dayjs().diff(dayjs(user.created_at), 'day');
      return dayDiff < 1; // If the user was created today, it's a new patient
    }
    return false;
  }, [user]);

  const createConsultation = useCallback(
    async (patient?: PatientInput | null, invoiceId?: string) => {
      dispatch(slice.actions.setScheduleSubmitting(true));
      try {
        if ((user || patient) && organization && scheduleTimeSlot && selectedStaffId) {
          const service = organization.Services.find((service) => service.id === selectedServiceId);
          const staff = organization.users.find((user) => user.id === selectedStaffId);

          if (!service) {
            toast.error('Service is required to create an appointment');
            return;
          }
          await mutation.mutateAsync({
            user_id: user?.id,
            ...(patient && {
              user: {
                ...patient,
                timezone: timezone.value,
              },
            }),
            organization_id: organization.id,
            staffs_ids: [selectedStaffId],
            status: organization.appointment_request_enabled ? Status.PENDING : Status.CONFIRMED,
            description: service?.name || '',
            start_time: dayjs(scheduleTimeSlot.start).format('YYYY-MM-DD HH:mm:ss'),
            end_time: dayjs(scheduleTimeSlot.end).format('YYYY-MM-DD HH:mm:ss'),
            telemedicine:
              selectedLocationId && selectedLocationId !== 'telemedicine'
                ? false
                : service.telemedicine,
            service_id: service.id,
            title: `${service.name} with ${getUserFullName(staff)}`,
            creator: 'patient',
            ...(invoiceId && {
              invoice_id: invoiceId,
            }),
            ...(selectedLocationId &&
              selectedLocationId !== 'telemedicine' && {
                location_id: selectedLocationId,
              }),
          });
          dispatch(slice.actions.resetScheduleState());
          toast.success('Appointment created successfully');
        }
      } catch (e) {
        toast.error(e.message);
      }
      dispatch(slice.actions.setScheduleSubmitting(false));
    },
    [
      user,
      selectedStaffId,
      selectedServiceId,
      scheduleTimeSlot,
      organization,
      scheduleDate,
      selectedLocationId,
    ]
  );

  const submitAppointment = useCallback(
    async (patient: PatientInput, paymentRequired: boolean, callback?: () => void) => {
      if (!organization) {
        toast.error('Unable to load clinic details. Please try again later.');
        return;
      }

      if (paymentRequired) {
        // Create patient only and then use the user id to pay
        try {
          const user = await createUserMutation.mutateAsync({
            ...patient,
            organization_id: organization.id,
            type: UserType.PATIENT,
            timezone: timezone.value,
          });
          dispatch(slice.actions.setUser(user));
          dispatch(slice.actions.setScheduleActiveStep(3));
          callback?.();
        } catch (e) {
          toast.error(e.message);
        }
      } else {
        // Create consultation with the patient data
        await createConsultation(patient);
      }
    },
    [user, selectedStaffId, selectedServiceId, scheduleTimeSlot, organization, scheduleDate],
  );

  const submitPaymentAndAppointment = useCallback(
    async (paymentMethodId: string) => {
      if (!organization) {
        toast.error('Unable to load clinic details. Please try again later.');
        return;
      }

      if (!user) {
        toast.error('Please login to continue');
        return;
      }

      if (!paymentMethodId && isNewPatient && organization.appointment_payment_required) {
        // trigger submit payment method
        setTriggerSubmit(true);
        return;
      }

      if (!paymentMethodId && !isNewPatient) {
        toast.error('Please add a payment method');
        return;
      }

      // Charge the patient
      if (!selectedServiceId) {
        toast.error('Appointment type is required to create an appointment');
        return;
      }

      if (!selectedStaffId) {
        toast.error('Staff is required to create an appointment');
        return;
      }

      try {
        const receipt = await payAppointmentMutation.mutateAsync({
          staffId: selectedStaffId,
          patientId: user.id,
          serviceId: selectedServiceId,
        });

        // Create consultation with the patient data
        await createConsultation(null, receipt.id);
        setTriggerSubmit(false);
      } catch (e) {
        toast.error(e.message);
      }
    },
    [organization, user, selectedServiceId, selectedStaffId, triggerSubmit, isNewPatient],
  );

  const redirect = useCallback(() => {
    if (!scheduleSlug) {
      router.push(paths.login);
    }
  }, [scheduleSlug]);

  useEffect(() => {
    redirect();
  }, []);

  useEffect(() => {
    if (organization) {
      const staff = organization.users.find((user) => user.username === scheduleSlug);
      setSelectedStaff(
        staff?.id || organization?.Availabilities?.[0]?.user_id || organization.users[0].id,
      );

      const service = selectedServiceId
        ? organization.Services.find((service) => service.id === selectedServiceId)
        : organization.Services.find((service) => service.slug === serviceSlug);
      setSelectedService(service?.id || '');
      dispatch(slice.actions.setScheduleActiveStep(service ? 1 : 0));
    }
  }, [organization, scheduleSlug, serviceSlug, selectedServiceId]);

  useEffect(() => {
    // If the user is logged in and the schedule step is 2 and advance payment not required, create the consultation
    if (
      user &&
      user.type === UserType.PATIENT &&
      scheduleActiveStep === 2 &&
      !isScheduleSubmitting &&
      !mutation.data &&
      !organization?.appointment_payment_required
    ) {
      createConsultation();
    }

    // If the user is logged in and the schedule step is 2 and advance payment is required, proceed to payment
    if (
      user &&
      user.type === UserType.PATIENT &&
      scheduleActiveStep === 2 &&
      !isScheduleSubmitting &&
      !mutation.data &&
      organization?.appointment_payment_required
    ) {
      dispatch(slice.actions.setScheduleActiveStep(3));
    }
  }, [providerData, organization, user, scheduleActiveStep, isScheduleSubmitting, mutation.data]);

  return {
    organization,
    isLoading: providerIsLoading || organizationIsLoading,
    selectedStaff: selectedStaffId,
    setSelectedStaff,
    selectedService: selectedServiceId,
    setSelectedService,
    selectedDate: dayjs(scheduleDate),
    setSelectedDate,
    consultation: mutation.data as Consultation | null,
    submitAppointment,
    setScheduleTimeSlot,
    scheduleTimeSlot: scheduleTimeSlot
      ? {
        start: dayjs(scheduleTimeSlot?.start),
        end: dayjs(scheduleTimeSlot?.end),
      }
      : null,
    scheduleActiveStep: scheduleActiveStep || 0,
    setScheduleActiveStep,
    paymentMethod,
    submitPaymentAndAppointment,
    user,
    payAppointmentMutation,
    createUserMutation,
    createConsultationMutation: mutation,
    chargeAmount,
    isNewPatient,
    triggerSubmit,
    stopTriggerSubmit,
    locations,
    selectedLocationId,
    handleLocationChange,
    logoUrl,
    serviceOptions,
  };
};
