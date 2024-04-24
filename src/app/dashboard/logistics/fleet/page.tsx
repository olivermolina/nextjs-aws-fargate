'use client';

import { useCallback, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { Seo } from 'src/components/seo';
import { LogisticsFleetDrawer } from 'src/sections/dashboard/logistics/logistics-fleet-drawer';
import { LogisticsFleetList } from 'src/sections/dashboard/logistics/logistics-fleet-list';
import { LogisticsFleetMap } from 'src/sections/dashboard/logistics/logistics-fleet-map';
import { LogisticsFleetToolbar } from 'src/sections/dashboard/logistics/logistics-fleet-toolbar';
import type { Vehicle } from 'src/types/logistics';

const useVehicles = (): Vehicle[] => {
  return [
    {
      id: 'VOL-653CD2',
      location: 'New York, NY, USA',
      latitude: 40.74759625348667,
      longitude: -74.00422032706065,
      temp: '8°C',
      startedAt: 'Sep 01, 7:53 AM',
      departedAt: 'Sep 01, 8:02 AM',
      arrivedAt: 'Sep 01, 8:18 AM',
    },
    {
      id: 'VOL-653CD3',
      location: 'New York, NY, USA',
      latitude: 40.75374208987527,
      longitude: -74.02878378307403,
      temp: '6°C',
      startedAt: 'Sep 01, 8:21 AM',
      departedAt: 'Sep 01, 8:36 AM',
      arrivedAt: 'Sep 01, 9:54 AM',
    },
    {
      id: 'VOL-653CD4',
      location: 'New York, NY, USA',
      latitude: 40.765281069832085,
      longitude: -73.96392724511145,
      temp: '8°C',
      startedAt: 'Sep 01, 6:34 AM',
      departedAt: 'Sep 01, 7:41 AM',
      arrivedAt: 'Sep 01, 9:20 AM',
    },
  ];
};

const Page = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const vehicles = useVehicles();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [currentVehicleId, setCurrentVehicleId] = useState<string | undefined>(vehicles[0]?.id);

  const handleVehicleSelect = useCallback((vehicleId: string): void => {
    setCurrentVehicleId(vehicleId);
  }, []);

  const handleVehicleDeselect = useCallback((): void => {
    setCurrentVehicleId(undefined);
  }, []);

  const handleDrawerOpen = useCallback((): void => {
    setOpenDrawer(true);
  }, []);

  const handleDrawerClose = useCallback((): void => {
    setOpenDrawer(false);
  }, []);

  return (
    <>
      <Seo title="Dashboard: Logistics Fleet" />
      <Divider />
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {mdUp && (
          <Box
            sx={{
              borderRightColor: 'divider',
              borderRightStyle: 'solid',
              borderRightWidth: 1,
              flex: '0 0 400px',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Fleet</Typography>
            </Box>
            <LogisticsFleetList
              currentVehicleId={currentVehicleId}
              onVehicleDeselect={handleVehicleDeselect}
              onVehicleSelect={handleVehicleSelect}
              vehicles={vehicles}
            />
          </Box>
        )}
        <Box
          sx={{
            flex: '1 1 auto',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {!mdUp && <LogisticsFleetToolbar onDrawerOpen={handleDrawerOpen} />}
          <LogisticsFleetMap
            currentVehicleId={currentVehicleId}
            onVehicleSelect={handleVehicleSelect}
            vehicles={vehicles}
          />
        </Box>
      </Box>
      {!mdUp && (
        <LogisticsFleetDrawer
          container={rootRef.current}
          onClose={handleDrawerClose}
          open={openDrawer}
        >
          <LogisticsFleetList
            currentVehicleId={currentVehicleId}
            onVehicleDeselect={handleVehicleDeselect}
            onVehicleSelect={handleVehicleSelect}
            vehicles={vehicles}
          />
        </LogisticsFleetDrawer>
      )}
    </>
  );
};

export default Page;
