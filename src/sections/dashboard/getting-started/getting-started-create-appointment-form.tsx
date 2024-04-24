import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { Controller, useFormContext } from 'react-hook-form';
import { ServicesInput } from '../../../utils/zod-schemas/service';
import InputAdornment from '@mui/material/InputAdornment';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import SvgIcon from '@mui/material/SvgIcon';
import InfoCircleIcon from '@mui/icons-material/InfoRounded';

type Props = {
  currency: string;
  index: number;
};

export default function GettingStartedCreateAppointmentForm({ currency, index }: Props) {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<ServicesInput>();

  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        xs={12}
        lg={6}
      >
        <FormControl
          error={!!errors.services?.[index]?.name}
          variant="standard"
          fullWidth
        >
          <FormLabel sx={{ mb: 1 }}>Service Name*</FormLabel>
          <OutlinedInput
            fullWidth
            {...register(`services.${index}.name`)}
            aria-describedby="component-error-text"
          />
          <FormHelperText>{errors?.services?.[index]?.name?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid
        item
        xs={12}
        lg={6}
      >
        <FormControl
          error={!!errors?.services?.[index]?.code}
          variant="standard"
          fullWidth
        >
          <FormLabel sx={{ mb: 1 }}>Code</FormLabel>
          <OutlinedInput
            fullWidth
            {...register(`services.${index}.code`)}
            aria-describedby="component-error-text"
          />
          <FormHelperText>{errors?.services?.[index]?.code?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid
        item
        xs={12}
        lg={6}
      >
        <FormControl
          error={!!errors?.services?.[index]?.duration}
          variant="standard"
          fullWidth
        >
          <FormLabel sx={{ mb: 1 }}>Duration</FormLabel>
          <OutlinedInput
            fullWidth
            rows={10}
            {...register(`services.${index}.duration`)}
            type={'number'}
            inputProps={{
              min: 0,
            }}
            endAdornment={<InputAdornment position="end">mins</InputAdornment>}
          />
          <FormHelperText>{errors?.services?.[index]?.duration?.message}</FormHelperText>
        </FormControl>
      </Grid>

      <Grid
        item
        xs={12}
        lg={6}
      >
        <FormControl
          error={!!errors?.services?.[index]?.price}
          variant="standard"
          fullWidth
        >
          <FormLabel sx={{ mb: 1 }}>Price</FormLabel>
          <OutlinedInput
            fullWidth
            rows={10}
            {...register(`services.${index}.price`)}
            type={'number'}
            inputProps={{
              min: 0,
              step: 1,
            }}
            startAdornment={<InputAdornment position="start">{currency}</InputAdornment>}
          />
          <FormHelperText>{errors?.services?.[index]?.price?.message}</FormHelperText>
        </FormControl>
      </Grid>
      <Grid item>
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{ ml: 1.5 }}
        >
          <Controller
            control={control}
            name={`services.${index}.taxable`}
            render={({ field }) => {
              return (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value || false}
                      color="primary"
                      edge="start"
                      onChange={(event, val) => {
                        return field.onChange(val);
                      }}
                    />
                  }
                  label="Taxable"
                />
              );
            }}
          />
          <Tooltip
            title="The service rate includes sales tax, it will be included in the generated invoice.">
            <SvgIcon>
              <InfoCircleIcon color={'disabled'} />
            </SvgIcon>
          </Tooltip>
        </Stack>
      </Grid>
    </Grid>
  );
}
