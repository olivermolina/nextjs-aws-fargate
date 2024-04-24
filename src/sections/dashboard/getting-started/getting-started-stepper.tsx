import * as React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
  display: 'flex',
  height: 22,
  alignItems: 'center',
  '& .QontoStepIcon-completedIcon': {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 25,
  },
  '& .QontoStepIcon-circle': {
    width: 25,
    height: 25,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
}));

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot
      ownerState={{ active }}
      className={className}
    >
      {completed ? (
        <CheckCircleIcon className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

type GettingStartedStepperProps = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  steps: {
    label: string;
    completed: boolean;
  }[];
};

export default function GettingStartedStepper({
                                                activeStep,
                                                setActiveStep,
                                                steps,
                                              }: GettingStartedStepperProps) {
  return (
    <Box
      sx={{
        maxHeight: 400,
        maxWidth: 600,
      }}
    >
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        nonLinear
      >
        {steps.map((step, index) => (
          <Step
            key={step.label}
            completed={step.completed}
          >
            <StepLabel
              StepIconComponent={QontoStepIcon}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
              onClick={() => setActiveStep(index)}
            >
              <Button
                color={index === activeStep ? 'primary' : 'inherit'}
                onClick={() => setActiveStep(index)}
                sx={{ justifyContent: 'flex-start', width: { sx: '100%', md: 250 } }}
                fullWidth
              >
                {step.label}
              </Button>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
