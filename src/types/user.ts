import {
  Address,
  CustomRolePermission,
  Organization,
  Permission,
  Resource,
  Role,
  RolePermission,
  Tax,
  User as PrismaUser,
} from '@prisma/client';
import { Invoice } from './invoice';

export type FileWithUser = {
  id: string;
  type: string;
  name: string;
  size: number;
  file_id?: string; // subfile folder id
  created_at: Date;
  shared_with_patient?: boolean;
  user: PrismaUser
};

export type StaffUserDetails = {
  staff: PrismaUser & {
    organization: {
      address?: Address;
      Tax?: Tax;
      billing_address?: Address;
    };
  };
};

export type PatientUserDetails = {
  user: PrismaUser & {
    address?: Address;
    billing_address?: Address;
    Tax?: Tax;
  };
};

export type User = PrismaUser & {
  address?: Address;
  billing_address?: Address;
  staffs: StaffUserDetails[];
  patients: PatientUserDetails[];
  organization: Organization & {
    Tax?: Tax;
    address?: Address;
    billing_address?: Address;
  };
  Tax?: Tax;
  PatientInvoices: Invoice[];
  role: Role & {
    role_permissions: (RolePermission & {
      resource: Resource;
      permission: Permission
    })[];
  } | null
  CustomRolePermissions: (CustomRolePermission & {
    role_permission: RolePermission & {
      resource: Resource;
      permission: Permission
    }
  })[];
};
