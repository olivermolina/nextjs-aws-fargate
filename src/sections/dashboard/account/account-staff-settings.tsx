import Grid from '@mui/material/Grid';
import AccountStaffPermissionsCard from './account-staff-permissions-card';
import AccountStaffPersonalInformationCard from './account-staff-personal-information-card';

interface AccountStaffSettingsProps {
  staffId: string;
  refetchMembers: () => Promise<void>;
}
export default function AccountStaffSettings(props: AccountStaffSettingsProps) {
  return (
    <Grid
      container
      spacing={{
        xs: 3,
        lg: 4,
      }}
    >
      <Grid
        item
        xs={12}
        md={6}
      >
        <AccountStaffPermissionsCard {...props}/>
      </Grid>

      <Grid
        item
        xs={12}
        md={6}
      >
        <AccountStaffPersonalInformationCard {...props}/>
      </Grid>
    </Grid>
  );
}
