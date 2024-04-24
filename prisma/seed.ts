/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import {
  CustomRolePermission,
  Gender,
  InvoiceStatus,
  Permission,
  PermissionAction,
  Prisma,
  Resource,
  RoleName,
  RolePermission,
  RolePermissionLevel,
  Status,
  UserType,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { padStart, sample } from 'lodash';
import dayjs from 'dayjs';
import { getUserFullName } from '../src/utils/get-user-full-name';
import { getInitials } from '../src/utils/get-initials';
import prisma from '../src/libs/prisma';
import { createUniqueUsername } from '../src/utils/create-unique-username';

// Main function to populate the database
async function main() {
  let organization = await prisma.organization.findFirst();
  if (!organization) {
    const companyName = faker.company.name();
    organization = await prisma.organization.create({
      data: {
        name: faker.company.name(),
        size: '100',
        category: faker.lorem.word(),
        code: '1234',
        stytch_id: 'stytch_id',
        slug: companyName.replace(/\s+/g, '-').toLowerCase(),
      },
    });
  }

  // Update all existing users to have the organization id
  await prisma.user.updateMany({
    where: {
      organization_id: organization.id,
    },
    data: {
      stytch_member_id: faker.string.uuid(),
      organization_id: '655204cc1a24db5244629be3',
      password_hash: faker.string.uuid(),
    },
  });

  const users = Array.from(Array(25).keys()).map(() => {
    const email = faker.internet.email();
    const staffEmail = faker.internet.email();
    const scheduledDate = dayjs(
      faker.date.between({
        from: new Date('2023-11-01'),
        to: new Date('2023-12-31'),
      })
    );

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName({
      firstName,
      lastName,
    });

    const staffFirstName = faker.person.firstName();
    const staffLastName = faker.person.lastName();
    const staffUsername = faker.internet.userName({
      firstName: staffFirstName,
      lastName: staffLastName,
    });
    return {
      user: {
        connectOrCreate: {
          where: {
            email,
          },
          create: {
            email,
            stytch_member_id: faker.string.uuid(),
            organization_id: organization?.id!,
            username,
            first_name: firstName,
            last_name: lastName,
            type: UserType.PATIENT,
            active: sample([true, false]),
            gender: sample([Gender.MALE, Gender.FEMALE]),
            avatar: faker.image.avatar(),
            phone: faker.phone.number(),
            password_hash: faker.string.uuid(),
          },
        },
      },
      staffs: {
        create: {
          staff: {
            connectOrCreate: {
              where: {
                email: staffEmail,
              },
              create: {
                email: staffEmail,
                stytch_member_id: faker.string.uuid(),
                organization_id: organization?.id!,
                first_name: staffFirstName,
                last_name: staffLastName,
                username: staffUsername,
                phone: faker.phone.number(),
                type: UserType.STAFF,
                avatar: faker.image.avatar(),
                gender: sample([Gender.MALE, Gender.FEMALE]),
                password_hash: faker.string.uuid(),
              },
            },
          },
        },
      },
      start_time: scheduledDate
        .set('hour', sample([8, 9, 10, 11, 12]))
        .set('minute', 0)
        .set('second', 0)
        .toDate(),
      end_time: scheduledDate
        .set('hour', sample([13, 14, 15, 16, 17]))
        .set('minute', 0)
        .set('second', 0)
        .toDate(),
      status: sample([Status.CANCELED, Status.COMPLETED, Status.PENDING]),
      description: faker.lorem.sentence(),
    };
  });

  await Promise.all(users.map((user) => prisma.consultation.create({ data: user })));

  const consultations = await prisma.consultation.findMany({
    include: {
      user: true,
      staffs: true,
    },
  });
  // Assign staff to patients from consultations
  await Promise.all(
    consultations.map(async (consultation) =>
      prisma.userStaffs.create({
        data: {
          user: {
            connect: {
              id: consultation.user?.id,
            },
          },
          staff: {
            connect: {
              id: sample(consultation.staffs)?.id,
            },
          },
        },
      })
    )
  );
}

// Uncomment this line to populate the database with seed data
// main()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// This function will populate the consultation table with data for existing users
async function populateConsultation() {
  const allUsers = await prisma.user.findMany();

  await prisma.$transaction([
    ...allUsers.map((user) =>
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatar_color: faker.color.rgb({ format: 'hex', casing: 'lower' }),
        },
      })
    ),
  ]);

  const users = await prisma.user.findMany({
    where: {
      type: UserType.PATIENT,
    },
  });

  const staffs = await prisma.user.findMany({
    where: {
      type: {
        in: [UserType.STAFF],
      },
    },
  });

  if (staffs) {
    await prisma.consultation.createMany({
      data: users.map((user) => ({
        user_id: user.id,
        start_time: dayjs(
          faker.date.between({
            from: new Date('2023-11-01'),
            to: new Date('2023-12-31'),
          })
        ).toDate(),
        end_time: dayjs(
          faker.date.between({
            from: new Date('2023-11-01'),
            to: new Date('2023-12-31'),
          })
        ).toDate(),
        status: sample([Status.CANCELED, Status.COMPLETED, Status.PENDING]),
        telemedicine: sample([true, false]),
        description: faker.lorem.sentence(),
        external_notes: faker.lorem.sentence(),
      })),
    });

    const consultations = await prisma.consultation.findMany();

    // Assign staff to patients from consultations
    await prisma.$transaction([
      ...consultations.map((consultation) =>
        prisma.consultation.update({
          where: {
            id: consultation.id,
          },
          data: {
            ...(sample(staffs.filter((staff) => staff.id === consultation.user_id))?.id && {
              staffs: {
                create: {
                  staff_id: sample(staffs.filter((staff) => staff.id === consultation.user_id))
                    ?.id!,
                },
              },
            }),
          },
        })
      ),
    ]);
  }
}

// Uncomment this line to populate the consultation table with data for existing users
// populateConsultation()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// Seed data for user invoice
async function populateInvoice() {
  const organizations = await prisma.organization.findMany({
    include: {
      users: true,
    },
  });
  for (const organization of organizations) {
    const patients = organization.users.filter((user) => user.type === UserType.PATIENT);
    const staffs = organization.users.filter((user) => user.type === UserType.STAFF);

    const lastInvoice = await prisma.invoice.findMany({
      where: {
        patient: {
          organization_id: organization.id,
        },
      },
      orderBy: {
        assigned_number: Prisma.SortOrder.desc,
      },
    });

    const lastAssignedNumber = lastInvoice[0]?.assigned_number + 1 || 1;

    if (staffs && patients) {
      await prisma.$transaction([
        ...patients.map((patient, i) => {
          const items = Array.from(Array(3).keys()).map((item) => {
            const unit = faker.number.int({ min: 1, max: 100 });
            const quantity = faker.number.int({ min: 1, max: 10 });

            return {
              description: faker.commerce.productName(),
              quantity: quantity,
              unit_amount: unit,
              total_amount: unit * quantity,
            };
          });

          const staff = sample(staffs);
          const initials = getInitials(getUserFullName(staff!));

          return prisma.invoice.create({
            data: {
              patient_id: patient.id,
              staffs: {
                createMany: {
                  data: [
                    {
                      staff_id: sample(staffs)?.id!,
                    },
                  ],
                },
              },
              status: sample([InvoiceStatus.PENDING, InvoiceStatus.PAID, InvoiceStatus.CANCELED]),
              invoice_number:
                'INV-' + padStart((lastAssignedNumber + i).toString(), 4, '0') + '-' + initials,
              assigned_number: lastAssignedNumber + i,
              due_date: faker.date.between({
                from: new Date('2023-11-01'),
                to: new Date('2023-12-31'),
              }),
              created_at: faker.date.between({
                from: new Date('2023-11-01'),
                to: new Date('2023-12-31'),
              }),
              total_amount: items.reduce((acc, item) => acc + item.total_amount, 0),
              subtotal_amount: 0,
              tax_amount: 0,
              InvoiceItems: {
                createMany: {
                  data: items,
                },
              },
            },
          });
        }),
      ]);
    }
  }
}

// Uncomment this line to populate the invoice table with data for existing users
// populateInvoice()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// Seed data for user address
async function populateUserAddress() {
  const organizations = await prisma.organization.findMany({
    include: {
      users: {
        include: {
          address: true,
          billing_address: true,
        },
      },
      address: true,
    },
  });
  for (const organization of organizations) {
    if (!organization.address) {
      await prisma.address.create({
        data: {
          address_line1: faker.location.streetAddress(),
          address_line2: faker.location.secondaryAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postal_code: faker.location.zipCode(),
          country: 'US',
          OrganizationPrimaryAddresses: {
            connect: {
              id: organization.id,
            },
          },
        },
      });
    }

    if (!organization.users) {
      continue;
    }

    const users = organization.users.filter((user) => user.type === UserType.PATIENT);
    const usersNoAddress = users.filter((user) => !user.address);
    const usersNoBillingAddress = users.filter((user) => !user.billing_address);

    if (usersNoAddress.length) {
      await prisma.$transaction([
        // Create primary address for all users
        ...usersNoAddress.map((user) =>
          prisma.address.create({
            data: {
              address_line1: faker.location.streetAddress(),
              address_line2: faker.location.secondaryAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              postal_code: faker.location.zipCode(),
              country: 'US',
              UserPrimaryAddresses: {
                connect: {
                  id: user.id,
                },
              },
            },
          })
        ),
      ]);
    }

    if (usersNoBillingAddress.length) {
      await prisma.$transaction([
        ...usersNoBillingAddress.map((user) =>
          prisma.address.create({
            data: {
              address_line1: faker.location.streetAddress(),
              address_line2: faker.location.secondaryAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              postal_code: faker.location.zipCode(),
              country: 'US',
              UserBillingAddresses: {
                connect: {
                  id: user.id,
                },
              },
            },
          })
        ),
      ]);
    }
  }
}

// Uncomment this line to populate the user address table with data for existing users
// populateUserAddress()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// Seed data for user invoice
async function populateUsername() {
  const users = await prisma.user.findMany();
  await prisma.$transaction(
    async (trx) => {
      return await Promise.all(
        users.map(async (user) => {
          const username = await createUniqueUsername(user);
          console.log({ username });
          return trx.user.update({
            where: {
              id: user.id,
            },
            data: {
              username,
            },
          });
        })
      );
    },
    {
      maxWait: 50000, // default: 2000
      timeout: 100000, // default: 5000
    }
  );
}

// Uncomment this line to populate the invoice table with data for existing users
// populateUsername()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const mapRoleToPermission = (role: RoleName, resource: Resource, permissions: Permission[]) => {
  return permissions.map((permission) => {
    switch (role) {
      case RoleName.ADMIN:
        return {
          level: RolePermissionLevel.EVERYTHING,
          permission_id: permission.id,
          resource_id: resource.id,
        };
      case RoleName.PRACTITIONER:
        // Practitioner can't edit organization settings or reports
        if (resource.name === 'Organization settings' || resource.name === 'Reports') {
          return {
            level: RolePermissionLevel.NONE,
            permission_id: permission.id,
            resource_id: resource.id,
          };
        } else if (resource.name === 'Invoicing and Payments' && permission.action === 'EDIT') {
          return {
            level: RolePermissionLevel.OWN,
            permission_id: permission.id,
            resource_id: resource.id,
          };
        } else if (resource.name === 'Chat') {
          return {
            level: RolePermissionLevel.OWN,
            permission_id: permission.id,
            resource_id: resource.id,
          };
        }
        return {
          level: RolePermissionLevel.EVERYTHING,
          permission_id: permission.id,
          resource_id: resource.id,
        };
      case RoleName.ADMIN_STAFF:
        // Admin staff can only edit scheduling and invoicing and payments
        if (permission.action === PermissionAction.EDIT) {
          return {
            level:
              resource.name === 'Scheduling' || resource.name === 'Invoicing and Payments'
                ? RolePermissionLevel.EVERYTHING
                : RolePermissionLevel.NONE,
            permission_id: permission.id,
            resource_id: resource.id,
          };
        } else if (resource.name === 'Chat') {
          return {
            level: RolePermissionLevel.NONE,
            permission_id: permission.id,
            resource_id: resource.id,
          };
        }

        return {
          level: RolePermissionLevel.EVERYTHING,
          permission_id: permission.id,
          resource_id: resource.id,
        };
      default:
    }
    return {
      level: RolePermissionLevel.NONE,
      permission_id: permission.id,
      resource_id: resource.id,
    };
  });
};

// Seed data for user permissions
async function populateUserPermissions() {
  const permissionsCount = await prisma.permission.count();
  if (permissionsCount === 0) {
    await prisma.permission.createMany({
      data: [
        {
          action: PermissionAction.VIEW,
        },
        {
          action: PermissionAction.EDIT,
        },
      ],
    });
  }

  const permissions = await prisma.permission.findMany();

  const resourceCount = await prisma.permission.count();

  if (resourceCount === 0) {
    await prisma.resource.createMany({
      data: [
        {
          name: 'Patient information',
        },
        {
          name: 'Invoicing and Payments',
        },
        {
          name: 'Scheduling',
        },
        {
          name: 'Organization settings',
        },
        {
          name: 'Reports',
        },
        {
          name: 'Chat',
        },
      ],
    });
  }

  const permissionResource = await prisma.resource.findMany();

  await prisma.rolePermission.deleteMany({
    where: {
      custom_roles: {
        none: {},
      },
    },
  });

  await prisma.$transaction([
    ...[RoleName.ADMIN, RoleName.PRACTITIONER, RoleName.ADMIN_STAFF].map((role) =>
      prisma.role.upsert({
        where: {
          name: role,
        },
        create: {
          name: role,
          role_permissions: {
            createMany: {
              data: permissionResource?.flatMap((resource) =>
                mapRoleToPermission(role, resource, permissions)
              ),
            },
          },
        },
        update: {
          role_permissions: {
            createMany: {
              data: permissionResource?.flatMap((resource) =>
                mapRoleToPermission(role, resource, permissions)
              ),
            },
          },
        },
      })
    ),
  ]);

  const customRolePermissions = await prisma.customRolePermission.findMany({
    include: {
      role_permission: {
        include: {
          resource: true,
        },
      },
    },
  });

  // Group by user id
  const customRolePermissionsByUser = customRolePermissions.reduce(
    (acc, customRolePermission) => {
      if (!acc[customRolePermission.user_id]) {
        acc[customRolePermission.user_id] = [];
      }
      acc[customRolePermission.user_id].push(customRolePermission);
      return acc;
    },
    {} as Record<string, (CustomRolePermission & { role_permission: RolePermission })[]>
  );

  const customRole = await prisma.role.findFirst({
    where: {
      name: RoleName.CUSTOM,
    },
  });

  //Check if resource is missing for user and add it
  for (let [key, value] of Object.entries(customRolePermissionsByUser)) {
    const missingResources = permissionResource?.filter((resource) => {
      return !value.find(
        (customRolePermission) => customRolePermission.role_permission.resource_id === resource.id
      );
    });
    if (missingResources) {
      await prisma.$transaction([
        ...missingResources.flatMap((resource) => {
          return [
            prisma.customRolePermission.create({
              data: {
                user: {
                  connect: {
                    id: key,
                  },
                },
                role_permission: {
                  create: {
                    level: RolePermissionLevel.NONE,
                    role: {
                      connect: {
                        id: customRole?.id!,
                      },
                    },
                    permission: {
                      connect: {
                        id: permissions?.[1]?.id!,
                      },
                    },
                    resource: {
                      connect: {
                        id: resource.id,
                      },
                    },
                  },
                },
              },
            }),
            prisma.customRolePermission.create({
              data: {
                user: {
                  connect: {
                    id: key,
                  },
                },
                role_permission: {
                  create: {
                    level: RolePermissionLevel.NONE,
                    role: {
                      connect: {
                        id: customRole?.id!,
                      },
                    },
                    permission: {
                      connect: {
                        id: permissions?.[0]?.id!,
                      },
                    },
                    resource: {
                      connect: {
                        id: resource.id,
                      },
                    },
                  },
                },
              },
            }),
          ];
        }),
      ]);
    }
  }
}

// Uncomment this line to populate the invoice table with data for existing users
// populateUserPermissions()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


async function resetUserAvatar() {
  await prisma.user.updateMany({
    data: {
      avatar: null,
    },
  })
}

// Uncomment this line to populate the invoice table with data for existing users
// resetUserAvatar()
//   .catch((e) => {
//     console.error(e);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
