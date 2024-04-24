import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import UserAvatar from '../../../components/user-avatar';
import React from 'react';
import { trpc } from '../../../app/_trpc/client';
import { Skeleton } from '@mui/material';

type CustomerListStaffCellProps = {
  customerId: string;
};

export default function CustomerListStaffCell(props: CustomerListStaffCellProps) {
  const { data, isLoading } = trpc.user.getUserStaff.useQuery({
    id: props.customerId,
  });

  if (isLoading) {
    return (
      <Skeleton
        variant={'circular'}
        height={25}
        width={25}
      />
    );
  }

  return (
    <Stack
      alignItems="center"
      direction="row"
      spacing={1}
    >
      <AvatarGroup
        total={data?.staffs.length}
        spacing={'small'}
        max={3}
      >
        {data?.staffs?.map(({ staff }) => (
          <UserAvatar
            key={staff.id}
            userId={staff.id}
            height={42}
            width={42}
          />
        ))}
      </AvatarGroup>
    </Stack>
  );
}
