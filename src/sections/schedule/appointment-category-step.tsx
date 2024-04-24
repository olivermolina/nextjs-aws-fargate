import type { FC } from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Service } from '@prisma/client';

interface JobCategoryStepProps {
  onNext?: () => void;
  onBack?: () => void;
  services: Service[];
  selectedService: string | null;
  setSelectedService: any;
}

export const JobCategoryStep: FC<JobCategoryStepProps> = (props) => {
  const { onNext, services, selectedService, setSelectedService } = props;
  const handleCategoryChange = useCallback((serviceId: string): void => {
    setSelectedService(serviceId);
    onNext?.();
  }, []);

  return (
    <Stack
      spacing={3}
      maxWidth="sm"
    >
      <div>
        <Typography variant="h6"> Select the kind of appointment you would like </Typography>
      </div>
      <Stack spacing={2}>
        {services.length === 0 && <Typography variant={'caption'}>No services found</Typography>}

        {services.map((service) => (
          <Card
            key={service.id}
            sx={{
              alignItems: 'center',
              cursor: 'pointer',
              display: 'flex',
              p: 2,
              ...(selectedService === service.id && {
                backgroundColor: 'primary.alpha12',
                boxShadow: (theme) => `${theme.palette.primary.main} 0 0 0 1px`,
              }),
            }}
            onClick={(): void => handleCategoryChange(service.id)}
            variant="outlined"
          >
            <Stack
              direction="row"
              spacing={2}
            >
              <Radio
                checked={selectedService === service.id}
                color="primary"
              />
              <div>
                <Typography variant="subtitle1">{service.name}</Typography>
              </div>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

JobCategoryStep.propTypes = {
  onBack: PropTypes.func,
  onNext: PropTypes.func,
};
