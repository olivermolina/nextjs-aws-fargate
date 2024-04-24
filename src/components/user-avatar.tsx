import Avatar from '@mui/material/Avatar';
import { trpc } from '../app/_trpc/client';
import Stack, { StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Props = {
  userId?: string;
  height?: number;
  width?: number;
  defaultSrc?: string;
  justifyContent?: string;
  direction?: StackProps['direction'];
  includeFullName?: boolean;
  spacing?: number;
};

export default function UserAvatar(props: Props) {
  const {
    defaultSrc,
    height = 42,
    width = 42,
    userId,
    includeFullName,
    direction = 'row',
    justifyContent,
    spacing = 1,
  } = props;

  const { data } = trpc.user.getUserAvatar.useQuery(
    {
      id: userId!,
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!userId,
      keepPreviousData: true,
    },
  );

  return (
    <Stack
      direction={direction}
      spacing={spacing}
      alignItems={'center'}
      justifyContent={justifyContent}
    >
      <Avatar
        src={defaultSrc || data?.url}
        sx={{
          height,
          width,
        }}
      >
        {data?.initials}
      </Avatar>
      {includeFullName && <Typography>{data?.full_name}</Typography>}
    </Stack>
  );
}
