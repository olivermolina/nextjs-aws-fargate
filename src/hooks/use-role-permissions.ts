import { trpc } from 'src/app/_trpc/client';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  RolePermissionInput,
  RolePermissionsInput,
  RolePermissionsValidationSchema,
} from '../utils/zod-schemas/role-permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PermissionAction } from '@prisma/client';
import toast from 'react-hot-toast';

export enum PermissionResourceEnum {
  ORGANIZATION = 'Organization settings',
  INVOICING_AND_PAYMENT = 'Invoicing and Payments',
  SCHEDULING = 'Scheduling',
  PATIENT_INFORMATION = 'Patient information',
  REPORTS = 'Reports',
  CHAT = 'Chat',
}

export const useRolePermission = (staffId: string, permissionResource?: PermissionResourceEnum) => {
  const mutation = trpc.user.saveStaffRolePermissions.useMutation();
  const {
    formState: { isSubmitting },
    register,
    handleSubmit,
    reset,
    control,
    setValue,
  } = useForm<RolePermissionsInput>({
    mode: 'onChange',
    resetOptions: {
      keepIsSubmitted: false,
    },
    reValidateMode: 'onSubmit',
    resolver: zodResolver(RolePermissionsValidationSchema),
  });

  const [edit, setEdit] = useState(false);

  const toggleEdit = () => {
    setEdit((prevState) => !prevState);
  };

  const {
    data: staff,
    isLoading,
    refetch,
  } = trpc.user.get.useQuery({
    id: staffId,
  }, {
    refetchOnWindowFocus: false,
  });

  const permissions = useMemo(() => {
    if (!staff) return [];

    const staffPermissions =
      staff?.CustomRolePermissions?.length > 0
        ? staff?.CustomRolePermissions.map(
            (customRolePermission) => customRolePermission.role_permission
          )
        : staff?.role?.role_permissions;

    const groupedPermissions = staffPermissions?.reduce(
      (acc, rolePermission) => {
        const resource = rolePermission.resource;
        const permissionAction = rolePermission.permission;
        const permissionRow = {
          roleId: rolePermission.role_id,
          resourceId: resource.id,
          resourceName: resource.name,
          viewRolePermissionId:
            permissionAction.action === PermissionAction.VIEW ? rolePermission.id : '',
          viewAccessId:
            permissionAction.action === PermissionAction.VIEW ? permissionAction.id : '',
          viewAccessName:
            permissionAction.action === PermissionAction.VIEW ? permissionAction.action : '',
          viewAccessLevel:
            permissionAction.action === PermissionAction.VIEW ? rolePermission.level : '',
          editRolePermissionId:
            permissionAction.action === PermissionAction.EDIT ? rolePermission.id : '',
          editAccessId:
            permissionAction.action === PermissionAction.EDIT ? permissionAction.id : '',
          editAccessName:
            permissionAction.action == PermissionAction.EDIT ? permissionAction.action : '',
          editAccessLevel:
            permissionAction.action == PermissionAction.EDIT ? rolePermission.level : '',
        } as RolePermissionInput;

        // if permissionResource is set, only return permissions for that resource
        if (permissionResource && permissionResource !== resource?.name) return acc;

        if (!acc[resource.id]) {
          acc[resource.id] = permissionRow;
        } else {
          if (permissionAction.action === PermissionAction.VIEW) {
            acc[resource.id].viewRolePermissionId = rolePermission.id;
            acc[resource.id].viewAccessId = permissionAction.id;
            acc[resource.id].viewAccessName = permissionAction.action;
            acc[resource.id].viewAccessLevel = rolePermission.level;
          } else {
            acc[resource.id].editRolePermissionId = rolePermission.id;
            acc[resource.id].editAccessId = permissionAction.id;
            acc[resource.id].editAccessName = permissionAction.action;
            acc[resource.id].editAccessLevel = rolePermission.level;
          }
        }

        return acc;
      },
      {} as Record<string, RolePermissionInput>
    );

    // Insert missing resource

    if (!groupedPermissions) return [] as RolePermissionInput[];

    return Object.values(groupedPermissions) as RolePermissionInput[];
  }, [staff, permissionResource]);

  const { fields } = useFieldArray({
    control,
    name: 'permissions',
  });

  const onSubmit = useCallback(
    async (data: RolePermissionsInput) => {
      try {
        await mutation.mutateAsync(data);
        await refetch();
        toast.success('Permissions updated successfully');
        toggleEdit();
      } catch (e) {
        toast.error(e.message);
      }
    },
    [staffId, staff]
  );

  useEffect(() => {
    reset({
      userId: staff?.id || '',
      permissions,
    });
  }, [permissions, staff, staffId]);

  return {
    edit,
    toggleEdit,
    staff,
    isLoading,
    permissions,
    register,
    handleSubmit,
    isSubmitting,
    control,
    fields,
    onSubmit,
    setValue,
  };
};
