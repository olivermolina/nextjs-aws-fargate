import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { History } from '@prisma/client';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemText from '@mui/material/ListItemText';
import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemIcon from '@mui/material/ListItemIcon';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import { HistoryInput, HistoryValidationSchema } from '../../../utils/zod-schemas/history';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSaveHistory } from '../../../hooks/use-save-history';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import { useDeleteHistory } from '../../../hooks/use-delete-history';

type Props = {
  userId: string;
  history: History;
  onEdit?: (history: HistoryInput | null) => void;
  editHistory?: HistoryInput | null;
  placeholder?: string;
};

function CustomerProfileHistoryItem(props: Props) {
  const { history, editHistory, onEdit, placeholder, userId } = props;
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    register,
    reset,
    watch,
  } = useForm<HistoryInput>({
    resolver: zodResolver(HistoryValidationSchema),
  });

  const saveHistory = useSaveHistory(userId);
  const onSubmit = async (input: HistoryInput) => {
    onEdit?.(null);
    await saveHistory.onSubmit(input);
  };
  const watchCondition = watch('condition');

  const deleteHistory = useDeleteHistory(userId);

  useEffect(() => {
    reset(history);
  }, [history]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ListItem
        key={history.id}
        sx={{
          p: 0,
          '& .MuiListItemSecondaryAction-root': {
            visibility: 'hidden',
          },
          '&:hover': {
            '& .MuiListItemSecondaryAction-root': {
              visibility: 'visible',
            },
          },
        }}
        secondaryAction={
          <Stack
            direction={'row'}
            alignItems={'center'}
            spacing={0.2}
          >
            {editHistory?.id === history.id && history.id !== 'new' && (
              <>
                <IconButton
                  edge="end"
                  aria-label="save"
                  color={'primary'}
                  type={'submit'}
                  disabled={saveHistory.mutation.isLoading}
                >
                  <SvgIcon>
                    <SaveIcon />
                  </SvgIcon>
                </IconButton>

                <IconButton
                  edge="end"
                  aria-label="cancel"
                  onClick={() => {
                    onEdit?.(null);
                  }}
                  disabled={saveHistory.mutation.isLoading}
                >
                  <SvgIcon>
                    <CloseIcon />
                  </SvgIcon>
                </IconButton>
              </>
            )}

            {editHistory?.id !== history.id && history.id !== 'new' && (
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  color={'primary'}
                  onClick={() => onEdit?.(history)}
                >
                  <SvgIcon>
                    <Edit02Icon />
                  </SvgIcon>
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color={'error'}
                  onClick={() => deleteHistory.onDiscard(history.id, () => onEdit?.(null))}
                >
                  <SvgIcon>
                    <DeleteIcon />
                  </SvgIcon>
                </IconButton>
              </>
            )}
          </Stack>
        }
      >
        <ListItemIcon>
          <SvgIcon fontSize={'small'}>
            <ChevronRightIcon fontSize={'inherit'} />
          </SvgIcon>
        </ListItemIcon>
        <ListItemText
          onDoubleClick={() => onEdit?.(history)}
          primary={
            <Stack
              direction={'row'}
              spacing={1}
              justifyContent={'justify-start'}
              alignItems={'center'}
              sx={{
                width: '100%',
              }}
            >
              {(history.id === editHistory?.id || (history.id === 'new' && !isSubmitting)) && (
                <Stack
                  direction={'row'}
                  spacing={1}
                  justifyContent={'justify-start'}
                  alignItems={'center'}
                  sx={{
                    width: '90%',
                  }}
                >
                  <TextField
                    placeholder={placeholder}
                    {...register('condition')}
                    helperText={errors?.condition?.message}
                    error={Boolean(errors?.condition)}
                    disabled={isSubmitting}
                    size={'small'}
                    fullWidth
                    variant={'outlined'}
                    autoFocus
                    InputProps={{
                      endAdornment: isSubmitting ? (
                        <InputAdornment position="end">
                          <CircularProgress
                            sx={{ ml: 1 }}
                            size={20}
                          />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                  <input
                    type="submit"
                    style={{ visibility: 'hidden' }}
                  />
                </Stack>
              )}

              {history.id !== editHistory?.id && (history.id !== 'new' || isSubmitting) && (
                <Typography variant="body2">{history.condition || watchCondition}</Typography>
              )}
            </Stack>
          }
        />
      </ListItem>
    </form>
  );
}

export default React.memo(CustomerProfileHistoryItem);
