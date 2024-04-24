import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';

import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import { PatientWithInvoices } from '../../../types/patient';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { addressToString } from '../../../utils/address-to-string';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Tooltip from '@mui/material/Tooltip';

interface BasicInfoItemProps {
  icon: React.ElementType; // This can be any React component
  value: React.ReactNode;
}

const BasicInfoItem: React.FC<BasicInfoItemProps> = ({ icon: Icon, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Icon sx={{ mr: 1, color: 'grey.600' }} />
    {value}
  </Box>
);

type Props = {
  customer: PatientWithInvoices;
  handleEditAssignedStaff?: () => void;
  hasEditAccess?: boolean;
};

export default function CustomerProfileBasicInformation(props: Props) {
  const { customer, hasEditAccess, handleEditAssignedStaff } = props;

  const basicInformationData = useMemo(
    () => [
      {
        icon: PhoneIcon,
        value: (
          <Typography
            variant="body2"
            sx={{ color: 'grey.600' }}
          >
            {customer.phone
              ? customer.phone.replace(/(\d{3})(\d{3})?(\d{4})?/, (match, p1, p2, p3) => {
                // Only include the parts of the match that are defined
                return [p1, p2, p3].filter(Boolean).join('-');
              })
              : 'N/A'}
          </Typography>
        ),
      },
      {
        icon: PersonIcon,
        value: (
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
          >
            <Typography
              variant="body2"
              sx={{ color: 'grey.600' }}
            >
              {customer.staffs
                ?.map(({ staff }) => `${staff.abbreviation} ${getUserFullName(staff)}`)
                .join(', ')}
            </Typography>

            {hasEditAccess && (
              <Tooltip title="Edit assigned staff">
                <IconButton
                  size={'small'}
                  color={'primary'}
                  onClick={handleEditAssignedStaff}
                >
                  <SvgIcon fontSize={'inherit'}>
                    <Edit02Icon />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
      {
        icon: LocationOnIcon,
        value: (
          <Typography
            variant="body2"
            sx={{ color: 'grey.600' }}
          >
            {addressToString(customer.address)}
          </Typography>
        ),
      },
      {
        icon: EmailIcon,
        value: (
          <Typography
            variant="body2"
            sx={{ color: 'grey.600' }}
          >
            {customer.email}{' '}
          </Typography>
        ),
      },
      {
        icon: AccessTimeIcon,
        value: (
          <Typography
            variant="body2"
            sx={{ color: 'grey.600' }}
          >
            {`Last active: ${dayjs(customer.updated_at).format('MMM DD, YYYY')}`}{' '}
          </Typography>
        ),
      },
    ],
    [customer],
  );

  return (
    <>
      {basicInformationData.map((info, index) => (
        <BasicInfoItem
          key={index}
          icon={info.icon}
          value={info.value}
        />
      ))}
    </>
  );
}
