import loadStytch from 'src/libs/stytch';
import { Member } from 'stytch/types/lib/b2b/organizations';
import { getBaseUrl } from 'src/utils/get-base-url';
import { paths } from '../../../paths';

/**
 *  Create or invite a member to stytch organization
 *
 *  @param {string} input.email - email of the member
 *  @param {string} input.stytch_organization_id - stytch organization id
 *  @param {string} input.first_name - first name of the member
 *  @param {string} input.last_name - last name of the member
 *  @param {string} input.action - action to perform, either invite or create
 *  @param {string} input.invited_by_member_id - member id of the user who invited the member
 *  @param {string} input.type - type of the user
 *  @returns {Member} stytch member
 **/

export const createOrInviteStytchMember = async (input: {
  email: string;
  stytch_organization_id: string;
  first_name?: string;
  last_name?: string;
  action: 'invite' | 'create';
  invited_by_member_id?: string;
}) => {
  const stytchClient = loadStytch();

  const stytchExistingMember = await stytchClient.organizations.members.search({
    query: {
      operator: 'OR',
      operands: [{ filter_name: 'member_emails', filter_value: [input.email] }],
    },
    organization_ids: [input.stytch_organization_id],
    limit: 1,
  });
  let stytchMember: Member | null = null;

  if (stytchExistingMember.members.length === 0) {
    if (input.action === 'create') {
      const newStytchMember = await stytchClient.organizations.members.create({
        organization_id: input.stytch_organization_id,
        name: `${input.first_name} ${input.last_name}`,
        email_address: input.email,
      });
      stytchMember = newStytchMember.member;
    }

    if (input.action === 'invite') {
      const inviteResponse = await stytchClient.magicLinks.email.invite({
        organization_id: input.stytch_organization_id,
        email_address: input.email,
        invite_redirect_url: getBaseUrl() + paths.authenticate,
        invited_by_member_id: input.invited_by_member_id,
      });
      stytchMember = inviteResponse.member;
    }
  } else {
    stytchMember = stytchExistingMember.members[0];
  }
  return stytchMember;
};
