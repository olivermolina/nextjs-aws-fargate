import { AppAccess } from '@prisma/client';
import { useDispatch, useSelector } from '../store';
import { slice } from 'src/slices/app';
import { useEffect } from 'react';
import { useOrganizationStore } from './use-organization';

export const useAppAccess = () => {
  const { data: organization, refetch } = useOrganizationStore();
  const dispatch = useDispatch();
  const isRefetch = useSelector((state) => state.app.refetch);
  const checkAppAccess = () => {
    if (organization?.access === AppAccess.Block) {
      dispatch(slice.actions.setShowBlockMessage(true));
    }
  };

  useEffect(() => {
    if (isRefetch) {
      refetch();
      dispatch(slice.actions.setRefetch(false));
    }
  }, [isRefetch]);

  return {
    checkAppAccess,
  };
};
