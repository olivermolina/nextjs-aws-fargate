import { t } from 'src/server/trpc';
import listUsers from './listUsers';
import getUser from './getUser';
import createUser from './createUser';
import inviteUser from './inviteUser';
import updateUser from './updateUser';
import createStytchMember from './createStytchMember';
import inviteStaff from './inviteStaff';
import deleteUser from './deleteUser';
import uploadFile from './uploadFile';
import listFiles from './listFiles';
import deleteFile from './deleteFile';
import getSignedUrlFile from './getSignedUrlFile';
import shareFile from './shareFile';
import availability from './availability';
import saveAvailability from './saveAvailability';
import getUserByUsername from './getUserByUsername';
import isUniqueSlug from './isUniqueSlug';
import createScheduleUser from './createScheduleUser';
import savePatientPaymentMethod from './save-patient-payment-method';
import getPatientPaymentMethod from './get-patient-payment-method';
import payAppointment from './pay-appointment';
import saveStaffRolePermissions from './save-staff-role-permissions';
import assignStaff from './assign-staff';
import patientOnboard from './patientOnboard';
import getUserByToken from './getUserByToken';
import listSubFiles from './list-sub-files';
import patientFeeds from './patient-feeds';
import saveUserAvatar from './save-user-avatar';
import getUserAvatar from './get-user-avatar';
import saveQuickNotes from './save-quick-notes';
import saveLanguage from './save-language';
import patientListOptions from './patient-list-options';
import importPatients from './import-patients';
import getUserStaff from './getUserStaff';
import getUserRole from './getUserRole';

/**
 * User router containing all the user api endpoints
 */
const userRouter = t.router({
  list: listUsers,
  get: getUser,
  getUserByUsername,
  create: createUser,
  update: updateUser,
  invite: inviteUser,
  inviteStaff: inviteStaff,
  createStytchMember,
  delete: deleteUser,
  saveUserAvatar,
  getUserAvatar,
  saveQuickNotes,
  saveLanguage,
  getUserStaff,
  getUserRole,
  /**
   * File related endpoints
   */
  uploadFile,
  listFiles,
  deleteFile,
  getSignedUrlFile,
  shareFile,
  listSubFiles,
  /**
   * Availability related endpoints
   */
  availability,
  saveAvailability,
  isUniqueSlug,
  createScheduleUser,
  savePatientPaymentMethod,
  getPatientPaymentMethod,
  payAppointment,
  saveStaffRolePermissions,
  assignStaff,
  patientOnboard,
  getUserByToken,
  /**
   * Feeds
   */
  patientFeeds,
  patientListOptions,
  importPatients,
});

export default userRouter;
