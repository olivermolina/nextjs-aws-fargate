import * as React from 'react';
import { FC, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@untitled-ui/icons-react/build/esm/Check';
import Avatar from '@mui/material/Avatar';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import type { StepIconProps } from '@mui/material/StepIcon';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { JobCategoryStep } from './appointment-category-step';
import { JobDescriptionStep } from './appointment-description-step';
import { JobDetailsStep } from './appointment-details-step';
import { JobPreview } from './appointment-preview';
import { Availability, AvailabilitySlot, Service, User } from '@prisma/client';
import { Dayjs } from 'dayjs';
import { Consultation } from 'src/types/consultation';
import { PatientInput } from 'src/types/patient';
import { usePatientPaymentMethod } from '../../hooks/use-patient-payment-method';
import { AppointmentPaymentForm } from './appointment-payment-form';

const StepIcon: FC<StepIconProps> = (props) => {
  const { active, completed, icon } = props;

  const highlight = active || completed;

  return (
    <Avatar
      sx={{
        height: 40,
        width: 40,
        ...(highlight && {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }),
      }}
      variant="rounded"
    >
      {completed ? (
        <SvgIcon>
          <CheckIcon />
        </SvgIcon>
      ) : (
        icon
      )}
    </Avatar>
  );
};

StepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  icon: PropTypes.node.isRequired,
};

export type AvailabilityWithSlots = Availability & {
  user: User;
  availability_slots: AvailabilitySlot[];
};

export type TimeSlot = {
  start: Dayjs;
  end: Dayjs;
};

interface JobCreateFormProps {
  services: Service[];
  selectedStaff: string | null;
  setSelectedStaff: any;
  selectedService: string | null;
  setSelectedService: any;
  selectedDate: Date | Dayjs;
  setSelectedDate: any;
  availabilities: AvailabilityWithSlots[];
  organizationId: string;
  consultation: Consultation | null;
  submitAppointment: (
    patient: PatientInput,
    paymentRequired: boolean,
    callback?: () => void,
  ) => Promise<void>;
  setScheduleTimeSlot: any;
  scheduleTimeSlot: TimeSlot | null;
  setScheduleActiveStep: any;
  scheduleActiveStep: number;
  paymentRequired: boolean;
  paymentMethod?: ReturnType<typeof usePatientPaymentMethod>;
  submitPaymentAndAppointment: (paymentMethodId: string) => Promise<void>;
  patientId?: string;
  chargeAmount: number;
  isNewPatient: boolean;
  triggerSubmit: boolean;
  stopTriggerSubmit: (paymentMethodId?: string) => Promise<void>;
}

export const JobCreateForm: FC<JobCreateFormProps> = (props) => {
  const handleNext = useCallback(() => {
    props.setScheduleActiveStep(props.scheduleActiveStep + 1);
  }, [props.scheduleActiveStep]);

  const handleBack = useCallback(() => {
    props.setScheduleActiveStep(props.scheduleActiveStep - 1);
  }, [props.scheduleActiveStep]);

  const steps = useMemo(() => {
    const defaultSteps = [
      {
        label: 'Service Type',
        content: (
          <JobCategoryStep
            {...props}
            onBack={handleBack}
            onNext={handleNext}
          />
        ),
      },
      {
        label: 'Time and day',
        content: (
          <JobDetailsStep
            {...props}
            onBack={handleBack}
            onNext={handleNext}
          />
        ),
      },
      {
        label: 'Details',
        content: (
          <JobDescriptionStep
            {...props}
            onBack={handleBack}
            onNext={handleNext}
          />
        ),
      },
    ];

    if (props.paymentRequired) {
      defaultSteps.push({
        label: 'Payment',
        content: (
          <AppointmentPaymentForm
            {...props}
            onBack={() => props.setScheduleActiveStep(1)}
            paymentMethod={props.paymentMethod}
            submitPaymentAndAppointment={props.submitPaymentAndAppointment}
            isSubmitting={false}
          />
        ),
      });
    }

    return defaultSteps;
  }, [handleBack, handleNext, props, props.patientId, props.paymentMethod]);

  if (props.consultation) {
    return (
      <JobPreview
        consultation={props.consultation}
        availabilities={props.availabilities}
        selectedStaff={props.selectedStaff}
      />
    );
  }

  return (
    <Stepper
      activeStep={props.scheduleActiveStep}
      orientation="vertical"
      sx={{
        '& .MuiStepConnector-line': {
          borderLeftColor: 'divider',
          borderLeftWidth: 2,
        },
      }}
    >
      {steps.map((step, index) => {
        const isCurrentStep = props.scheduleActiveStep === index;

        return (
          <Step key={step.label}>
            <StepLabel StepIconComponent={StepIcon}>
              <Typography
                sx={{ ml: 2 }}
                variant="overline"
              >
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent
              sx={{
                borderLeftColor: 'divider',
                borderLeftWidth: 2,
                ...(isCurrentStep && {
                  py: 4,
                  p: 2,
                }),
                width: '100%',
                flexGrow: 1,
              }}
            >
              {step.content}
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );
};
