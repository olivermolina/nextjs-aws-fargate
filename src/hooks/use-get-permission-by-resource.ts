import { useSelector } from '../store';
import { useMemo } from 'react';
import { PermissionResourceEnum } from './use-role-permissions';
import { RolePermissionInput } from '../utils/zod-schemas/role-permission';

export const useGetPermissionByResource = (resourceName: PermissionResourceEnum) => {
  const permissions = useSelector((state) => state.app.permissions);
  const permission: RolePermissionInput | undefined = useMemo(() => {
    return permissions?.find((p) => p.resourceName === resourceName);
  }, [permissions, resourceName]);

  return permission;
};
