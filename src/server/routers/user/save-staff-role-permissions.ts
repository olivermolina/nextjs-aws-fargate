import { publicProcedure } from '../../trpc';
import prisma from 'src/libs/prisma';
import { RolePermissionsValidationSchema } from 'src/utils/zod-schemas/role-permission';
import { TRPCError } from '@trpc/server';
import { RoleName } from '@prisma/client';

const saveStaffRolePermissions = publicProcedure
  .input(RolePermissionsValidationSchema)
  .mutation(async ({ input }) => {

    const user = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const customRole = await prisma.role.findUnique({
      where: {
        name: RoleName.CUSTOM,
      },
    });

    if (!customRole) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Custom role not found',
      });
    }

    // Update user role to custom
    await prisma.user.update({
      where: {
        id: input.userId,
      },
      data: {
        role_id: customRole.id,
      },
    });

    // Map permissions to permission role array
    const rolePermissionsArray = input.permissions.flatMap(permission => [
      {
        roleId: customRole.id,
        resourceId: permission.resourceId,
        rolePermissionId: permission.viewRolePermissionId,
        permissionId: permission.viewAccessId,
        level: permission.viewAccessLevel,
      },
      {
        roleId: customRole.id,
        resourceId: permission.resourceId,
        rolePermissionId: permission.editRolePermissionId,
        permissionId: permission.editAccessId,
        level: permission.editAccessLevel,
      },
    ]);

    const customRolePermissions = await prisma.customRolePermission.count({
      where: {
        user_id: input.userId,
      },
    });

    if (customRolePermissions > 0) {
      // Update existing permissions
      await prisma.$transaction([
        ...rolePermissionsArray.map((customRolePermission) => prisma.rolePermission.update({
          where: {
            id: customRolePermission.rolePermissionId,
          },
          data: {
            role_id: customRolePermission.roleId,
            level: customRolePermission.level,
          },
        })),
      ]);
    } else {
      // Create new permissions
      await prisma.$transaction([
        ...rolePermissionsArray.map((customRolePermission) => prisma.customRolePermission.create({
          data: {
            user: {
              connect: {
                id: input.userId,
              },
            },
            role_permission: {
              create: {
                level: customRolePermission.level,
                role: {
                  connect: {
                    id: customRolePermission.roleId,
                  },
                },
                resource: {
                  connect: {
                    id: customRolePermission.resourceId,
                  },
                },
                permission: {
                  connect: {
                    id: customRolePermission.permissionId,
                  },
                },
              },
            },
          },
        })),
      ]);
    }
  });

export default saveStaffRolePermissions;
