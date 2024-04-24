import type { FC } from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import Truck02Icon from '@untitled-ui/icons-react/build/esm/Truck02';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';

import type { Vehicle } from 'src/types/logistics';

interface LogisticsFleetVehicleProps {
  onDeselect?: () => void;
  onSelect?: (vehicleId: string) => void;
  selected?: boolean;
  vehicle: Vehicle;
}

export const LogisticsFleetVehicle: FC<LogisticsFleetVehicleProps> = (props) => {
  const { onDeselect, onSelect, selected, vehicle } = props;

  const handleToggle = useCallback((): void => {
    if (!selected) {
      onSelect?.(vehicle.id);
    } else {
      onDeselect?.();
    }
  }, [onDeselect, onSelect, selected, vehicle]);

  return (
    <Stack component="li">
      <ButtonBase
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 2,
          textAlign: 'left',
          width: '100%',
        }}
        onClick={handleToggle}
      >
        <Avatar sx={{ mr: 2 }}>
          <SvgIcon>
            <Truck02Icon />
          </SvgIcon>
        </Avatar>
        <div>
          <Typography>{vehicle.id}</Typography>
          <Typography
            color="text.secondary"
            variant="body2"
          >
            {vehicle.location}
          </Typography>
        </div>
      </ButtonBase>
      <Collapse in={selected}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              variant="caption"
            >
              Temperature (good)
            </Typography>
            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
            >
              <LinearProgress
                value={8}
                sx={{ flexGrow: 1 }}
                variant="determinate"
              />
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {vehicle.temp}
              </Typography>
            </Stack>
          </Stack>
          <Timeline
            position="right"
            sx={{
              px: 3,
              [`& .${timelineItemClasses.root}:before`]: {
                flex: 0,
                padding: 0,
              },
            }}
          >
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <div>
                  <Typography variant="body2">Tracking Number Created</Typography>
                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    {vehicle.startedAt}
                  </Typography>
                </div>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <div>
                  <Typography variant="body2">Out for Delivery</Typography>
                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    {vehicle.departedAt}
                  </Typography>
                </div>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary" />
              </TimelineSeparator>
              <TimelineContent>
                <div>
                  <Typography variant="body2">Arrived</Typography>
                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    {vehicle.arrivedAt}
                  </Typography>
                </div>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Box>
      </Collapse>
    </Stack>
  );
};

LogisticsFleetVehicle.propTypes = {
  onDeselect: PropTypes.func,
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  // @ts-ignore
  vehicle: PropTypes.object.isRequired,
};
