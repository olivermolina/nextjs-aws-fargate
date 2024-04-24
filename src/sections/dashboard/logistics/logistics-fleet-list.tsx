import type { FC } from 'react';
import PropTypes from 'prop-types';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import type { Vehicle } from 'src/types/logistics';

import { LogisticsFleetVehicle } from './logistics-fleet-vehicle';

interface LogisticsFleetDetailsProps {
  currentVehicleId?: string;
  onVehicleDeselect?: () => void;
  onVehicleSelect?: (vehicleId: string) => void;
  vehicles?: Vehicle[];
}

export const LogisticsFleetList: FC<LogisticsFleetDetailsProps> = (props) => {
  const { onVehicleDeselect, onVehicleSelect, currentVehicleId, vehicles = [] } = props;

  return (
    <Stack
      component="ul"
      divider={<Divider />}
      sx={{
        borderBottomColor: 'divider',
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
    >
      {vehicles.map((vehicle) => {
        const selected = currentVehicleId ? currentVehicleId === vehicle.id : false;

        return (
          <LogisticsFleetVehicle
            key={vehicle.id}
            onDeselect={onVehicleDeselect}
            onSelect={onVehicleSelect}
            selected={selected}
            vehicle={vehicle}
          />
        );
      })}
    </Stack>
  );
};

LogisticsFleetList.propTypes = {
  currentVehicleId: PropTypes.string,
  onVehicleDeselect: PropTypes.func,
  onVehicleSelect: PropTypes.func,
  vehicles: PropTypes.array,
};
