import { t } from 'src/server/trpc';
import { getOrganization } from './get-organization';
import { getOrganizationById } from './get-organization-by-id';
import { getOrganizationBySlug } from './get-organization-by-slug';
import { updateOrganization } from './update-organization';
import { checkout } from './checkout';
import { plans } from './plans';
import { applyDiscountCode } from './apply-discount-code';
import { currentPlan } from './current-plan';
import { invoices } from './invoices';
import { invoice } from './get-invoice';
import { updateOrganizationAccess } from './update-organization-access';
import { changePlan } from './change-plan';
import { cancelPlan } from './cancel-plan';
import { getPaymentMethod } from './get-payment-method';
import { savePaymentMethod } from './save-payment-method';
import { reactivate } from './reactivate-subscription';
import { stripeConnect } from './stripe-connect';
import { stripeConnectDeauthtorize } from './stripe-connect-deauthtorize';
import createStripeAccount from './create-stripe-account';
import { sendInvoicePaidNotification } from './send-invoice-paid-notification';
import dashboardQuickStats from './dashboard-quick-stats';
import latestMessages from './latestMessages';
import getConfigureClinicalProfile from './get-configure-clinical-profile';
import saveConfigureClinicalProfile from './save-configure-clinical-profile';
import { gettingStarted } from './getting-started';

const organizationRouter = t.router({
  get: getOrganization,
  getOrganizationById,
  getOrganizationBySlug,
  update: updateOrganization,
  checkout,
  plans,
  applyDiscountCode,
  currentPlan,
  invoices,
  invoice,
  updateOrganizationAccess,
  changePlan,
  cancelPlan,
  getPaymentMethod,
  savePaymentMethod,
  reactivate,
  stripeConnect,
  stripeConnectDeauthtorize,
  createStripeAccount,
  sendInvoicePaidNotification,
  dashboardQuickStats,
  latestMessages,
  getConfigureClinicalProfile,
  saveConfigureClinicalProfile,
  gettingStarted,
});

export default organizationRouter;
