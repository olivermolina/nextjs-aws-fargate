import prisma from '../libs/prisma';

/**
 * Create a unique username
 *
 * @param input - The user input
 * @returns The unique username
 */
export const createUniqueUsername = async (input: {
  first_name?: string | null;
  last_name?: string | null;
  email: string;
}) => {
  const fullName = `${input.first_name} ${input.last_name}`.trim().toLowerCase();
  const username =
    input.first_name && input.last_name
      ? fullName.replace(/\s+/g, '-').replace(/['"]/g, '')
      : input.email.split('@')[0];

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    return username;
  }

  return `${username}-${Date.now()}`;
};
