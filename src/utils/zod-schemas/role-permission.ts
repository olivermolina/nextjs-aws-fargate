import z from 'zod';
import { RolePermissionLevel } from '@prisma/client';

export const RolePermissionValidationSchema = z.object({
  roleId: z.string(),
  resourceId: z.string(),
  resourceName: z.string(),
  viewRolePermissionId: z.string(),
  viewAccessId: z.string(),
  viewAccessName: z.string(),
  viewAccessLevel: z.nativeEnum(RolePermissionLevel),
  editRolePermissionId: z.string(),
  editAccessId: z.string(),
  editAccessName: z.string(),
  editAccessLevel: z.nativeEnum(RolePermissionLevel),
});
export type RolePermissionInput = z.infer<typeof RolePermissionValidationSchema>;

export const RolePermissionsValidationSchema = z.object({
  userId: z.string(),
  permissions: z.array(RolePermissionValidationSchema),
});
export type RolePermissionsInput = z.infer<typeof RolePermissionsValidationSchema>;
