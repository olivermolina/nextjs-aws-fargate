import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';

import AddIcon from '@mui/icons-material/Add';
import { useDialog } from '../../../hooks/use-dialog';
import { trpc } from '../../../app/_trpc/client';
import { Skeleton } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import React, { useMemo } from 'react';
import { VitalInput } from '../../../utils/zod-schemas/vital';
import StraightenIcon from '@mui/icons-material/Straighten';
import ScaleIcon from '@mui/icons-material/Scale';
import ListItemIcon from '@mui/material/ListItemIcon';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ActivityHeart from '@untitled-ui/icons-react/build/esm/ActivityHeart';
import Activity from '@untitled-ui/icons-react/build/esm/Activity';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import {
  mapBMIUnit,
  mapHeightCountryUnit,
  mapTemperatureCountryUnit,
  mapWeightCountryUnit,
} from '../../../utils/vitals-utils';
import { CustomerProfileVitalModal } from './customer-profile-vital-modal';
import {
  CustomerProfileVitalGraphModal,
  VitalFilterGraph,
} from './customer-profile-vital-graph-modal';
import { ConfigureClinicalProfile, Prisma, Vital } from '@prisma/client';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import OxygenSaturationIcon from '../../../icons/untitled-ui/duocolor/oxygen-saturation';

type Props = {
  id: string;
  country?: string | null;
  settings?: ConfigureClinicalProfile;
  readOnly?: boolean;
  vital?: Vital;
};

function CustomerProfileVitals(props: Props) {
  const { id, country, settings, readOnly } = props;
  const dialog = useDialog<VitalInput>();
  const viewVitalGraphDialog = useDialog<VitalFilterGraph>();
  const { data, isLoading, refetch } = trpc.vitals.current.useQuery(
    {
      userId: id,
    },
    {
      refetchOnWindowFocus: false,
      enabled: !props.vital, // if we have a vital, we don't need to fetch it again
    }
  );

  const handleNewVital = () => {
    dialog.handleOpen({
      id: 'new',
      user_id: id,
      date: new Date(),
      height_unit: mapHeightCountryUnit(country),
      weight_unit: mapWeightCountryUnit(country),
      temperature_unit: mapTemperatureCountryUnit(country),
      bmi: 0,
      height: 0,
      weight: 0,
      temperature: 0,
      systolic: 0,
      diastolic: 0,
      respiratory_rate: 0,
      heart_rate: 0,
      oxygen_saturation: 0,
    });
  };

  const vital = useMemo(() => props.vital || data, [data]);

  const items = useMemo(() => {
    return [
      {
        key: 'height' as Prisma.VitalScalarFieldEnum,
        primaryText: `Height`,
        secondaryText: `${vital?.height || ''} ${mapHeightCountryUnit(country)}`,
        icon: (
          <StraightenIcon
            sx={{
              transform: 'rotate(90deg)',
              color: 'secondary.main',
            }}
          />
        ),
        units: mapHeightCountryUnit(country),
        show: settings ? settings.vitals_subsections.includes('height') : true,
      },
      {
        key: 'weight' as Prisma.VitalScalarFieldEnum,
        primaryText: `Weight`,
        secondaryText: `${vital?.weight || ''} ${mapWeightCountryUnit(country)}`,
        icon: (
          <ScaleIcon
            sx={{
              color: 'primary.main',
            }}
          />
        ),
        units: mapWeightCountryUnit(country),
        show: settings ? settings.vitals_subsections.includes('weight') : true,
      },
      {
        key: 'bmi' as Prisma.VitalScalarFieldEnum,
        primaryText: `BMI`,
        secondaryText: `${vital?.bmi || ''} ${mapBMIUnit(country)} `,
        icon: (
          <MonitorWeightOutlinedIcon
            sx={{
              color: 'info.main',
            }}
          />
        ),
        units: mapBMIUnit(country),
        show: settings ? settings.vitals_subsections.includes('bmi') : true,
      },
      {
        key: 'temperature' as Prisma.VitalScalarFieldEnum,
        primaryText: `Temperature`,
        secondaryText: `${vital?.temperature || ''} ${mapTemperatureCountryUnit(country)}`,
        icon: (
          <ThermostatIcon
            sx={{
              color: 'success.main',
            }}
          />
        ),
        units: mapTemperatureCountryUnit(country),
        show: settings ? settings.vitals_subsections.includes('temperature') : true,
      },
      {
        key: 'respiratory_rate' as Prisma.VitalScalarFieldEnum,
        primaryText: `Respiratory Rate`,
        secondaryText: `${vital?.respiratory_rate || ''} bpm`,
        icon: (
          <SvgIcon
            sx={{
              color: 'warning.main',
            }}
          >
            <MonitorHeartOutlinedIcon />
          </SvgIcon>
        ),
        units: 'bpm',
        show: settings ? settings.vitals_subsections.includes('respiratory_rate') : true,
      },
      {
        key: 'systolic' as Prisma.VitalScalarFieldEnum,
        primaryText: `Blood Pressure`,
        secondaryText: `${vital?.systolic || ''} / ${vital?.diastolic || ''} mm Hg`,
        icon: (
          <SvgIcon
            sx={{
              color: 'error.main',
            }}
          >
            <Activity />
          </SvgIcon>
        ),
        units: 'mm Hg',
        show: settings ? settings.vitals_subsections.includes('blood_pressure') : true,
      },
      {
        key: 'heart_rate' as Prisma.VitalScalarFieldEnum,
        primaryText: `Heart Rate`,
        secondaryText: `${vital?.heart_rate || ''} bpm`,
        icon: (
          <SvgIcon
            sx={{
              color: 'error.main',
            }}
          >
            <ActivityHeart />
          </SvgIcon>
        ),
        units: 'bpm',
        show: settings ? settings.vitals_subsections.includes('heart_rate') : true,
      },
      {
        key: 'oxygen_saturation' as Prisma.VitalScalarFieldEnum,
        primaryText: `Oxygen Saturation`,
        secondaryText: `${vital?.oxygen_saturation || ''}%`,
        icon: (
          <SvgIcon color={'error'}>
            <OxygenSaturationIcon color={'inherit'} />
          </SvgIcon>
        ),
        units: '%',
        show: settings ? settings.vitals_subsections.includes('oxygen_saturation') : true,
      },
    ];
  }, [vital, settings, country]);

  if (isLoading && !vital) {
    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {Array.from({ length: 3 }).map((i, index) => (
          <ListItem
            key={index}
            disableGutters
          >
            <Typography
              variant="caption"
              sx={{ color: 'error.main' }}
            >
              <Skeleton width={150} />
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <>
      <List
        sx={{ width: '100%', bgcolor: 'background.paper', p: 0, maxWidth: readOnly ? 300 : 'md' }}
      >
        {items
          .filter((item) => item.show)
          .map((item) => (
            <ListItem
              key={item.key}
              sx={{
                p: 0,
                '& .MuiListItemSecondaryAction-root': {},
                '& .MuiListItemSecondaryAction-root .MuiStack-root .MuiButtonBase-root': {
                  visibility: 'hidden',
                },
                '&:hover': {
                  '& .MuiListItemSecondaryAction-root .MuiStack-root .MuiButtonBase-root': {
                    visibility: readOnly ? 'hidden' : 'visible',
                  },
                },
              }}
              secondaryAction={
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  justifyContent={'flex-end'}
                >
                  <Typography
                    variant={'caption'}
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {item.secondaryText}
                  </Typography>
                  {data && !readOnly && (
                    <IconButton
                      color={'primary'}
                      size={'small'}
                      onClick={() =>
                        dialog.handleOpen({
                          ...data,
                          height: data.height || 0,
                          height_unit: data.height_unit || mapHeightCountryUnit(country),
                          weight: data.weight || 0,
                          weight_unit: data.weight_unit || mapWeightCountryUnit(country),
                          bmi: data.oxygen_saturation || 0,
                          temperature: data.temperature || 0,
                          temperature_unit:
                            data.temperature_unit || mapTemperatureCountryUnit(country),
                          systolic: data.systolic || 0,
                          diastolic: data.diastolic || 0,
                          respiratory_rate: data.respiratory_rate || 0,
                          heart_rate: data.heart_rate || 0,
                          oxygen_saturation: data.oxygen_saturation || 0,
                        })
                      }
                    >
                      <SvgIcon fontSize={'small'}>
                        <Edit02Icon />
                      </SvgIcon>
                    </IconButton>
                  )}
                </Stack>
              }
            >
              <ListItemButton
                sx={{
                  pr: 0,
                }}
                onClick={() =>
                  data
                    ? viewVitalGraphDialog.handleOpen({
                      userId: id,
                      name: item.key as Prisma.VitalScalarFieldEnum,
                      primaryText: item.primaryText,
                      secondaryText: item.secondaryText,
                      icon: item.icon,
                      units: item.units,
                    })
                    : handleNewVital()
                }
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.primaryText} />
              </ListItemButton>
            </ListItem>
          ))}

        {!readOnly && (
          <ListItem disableGutters>
            <Button
              variant={'outlined'}
              startIcon={
                <SvgIcon fontSize={'small'}>
                  <AddIcon />
                </SvgIcon>
              }
              color={'primary'}
              size={'small'}
              onClick={handleNewVital}
            >
              <Typography variant={'caption'}>Add Vital</Typography>
            </Button>
          </ListItem>
        )}
      </List>
      {!readOnly && (
        <CustomerProfileVitalModal
          userId={id}
          defaultValues={dialog.data}
          open={dialog.open}
          handleClose={dialog.handleClose}
          handleNew={handleNewVital}
          country={country}
          refetchCurrentVitals={refetch}
        />
      )}
      <CustomerProfileVitalGraphModal
        open={viewVitalGraphDialog.open}
        handleClose={viewVitalGraphDialog.handleClose}
        filterGraph={viewVitalGraphDialog.data}
      />
    </>
  );
}

export default React.memo(CustomerProfileVitals);
