import { ReactNode, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@mui/material/SvgIcon';
import CalendarIcon from 'src/icons/untitled-ui/duocolor/calendar';
import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import LineChartUp04Icon from 'src/icons/untitled-ui/duocolor/line-chart-up-04';
import MessageChatSquareIcon from 'src/icons/untitled-ui/duocolor/message-chat-square';
import ReceiptCheckIcon from 'src/icons/untitled-ui/duocolor/receipt-check';
import Users03Icon from 'src/icons/untitled-ui/duocolor/users-03';
import File01Icon from 'src/icons/untitled-ui/duocolor/file-04';

//import DashboardIcon from 'src/icons/untitled-ui/duocolor/dashboard'; // Adjust the path as necessary
import { tokens } from 'src/locales/tokens';
import { paths } from 'src/paths';
import { useAuth } from '../../hooks/use-auth';
import { RolePermissionLevel, UserType } from '@prisma/client';
import { useAppAccess } from 'src/hooks/use-app-access';
import { PermissionResourceEnum } from '../../hooks/use-role-permissions';
import { useSelector } from '../../store';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useOrganizationStore } from '../../hooks/use-organization';
import FaxIcon from '@mui/icons-material/Fax';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { useGettingStarted } from '../../hooks/use-getting-started';

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
  onClick?: () => void;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  const { data: organization } = useOrganizationStore();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const appAccess = useAppAccess();
  const permissions = useSelector((state) => state.app.permissions);
  const { isGettingStartedCompleted } = useGettingStarted();

  useEffect(() => {
    const language =
      (user?.language as 'es' | 'en') || (organization?.address?.country === 'MX' ? 'es' : 'en');
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [user, organization]);

  return useMemo(() => {
    if (user?.type === UserType.PATIENT) {
      // TODO add patient sections Chat, Appointments, Documents, Account -> Billing
      return [
        {
          items: [
            {
              title: t(tokens.nav.account),
              path: paths.patient.account,
              icon: (
                <SvgIcon fontSize="small">
                  <HomeSmileIcon />
                </SvgIcon>
              ),
            },
            {
              title: t(tokens.nav.orderList),
              path: paths.patient.consultations,
              icon: (
                <SvgIcon fontSize="small">
                  <CalendarIcon />
                </SvgIcon>
              ),
            },
            {
              title: t(tokens.nav.fileManager),
              path: paths.patient.files,
              icon: (
                <SvgIcon fontSize="small">
                  <File01Icon />
                </SvgIcon>
              ),
            },
            {
              title: t(tokens.nav.chat),
              path: paths.patient.chat,
              icon: (
                <SvgIcon fontSize="small">
                  <MessageChatSquareIcon />
                </SvgIcon>
              ),
            },
          ],
        },
      ];
    }

    const patientInformationPermission = permissions?.find(
      (p) => p.resourceName === PermissionResourceEnum.PATIENT_INFORMATION
    );
    const invoicingPaymentsPermission = permissions?.find(
      (p) => p.resourceName === PermissionResourceEnum.INVOICING_AND_PAYMENT
    );
    const schedulingPermission = permissions?.find(
      (p) => p.resourceName === PermissionResourceEnum.SCHEDULING
    );
    const chatPermission = permissions?.find((p) => p.resourceName === PermissionResourceEnum.CHAT);

    const items = [
      !isGettingStartedCompleted && {
        title: t(tokens.nav.gettingStarted),
        path: paths.dashboard.gettingStarted,
        icon: (
          <SvgIcon fontSize="small">
            <WidgetsIcon />
          </SvgIcon>
        ),
      },
      {
        title: t(tokens.nav.account),
        path: paths.dashboard.account,
        icon: (
          <SvgIcon fontSize="small">
            <HomeSmileIcon />
          </SvgIcon>
        ),
      },
      {
        title: 'Dashboard',
        path: paths.dashboard.index,
        icon: (
          <SvgIcon fontSize="small">
            <HomeSmileIcon />
          </SvgIcon>
        ),
        onClick: () => appAccess.checkAppAccess(),
      },
      patientInformationPermission &&
        patientInformationPermission?.viewAccessLevel !== RolePermissionLevel.NONE && {
          title: t(tokens.nav.customers),
          path: paths.dashboard.customers.index,
          icon: (
            <SvgIcon fontSize="small">
              <Users03Icon />
            </SvgIcon>
          ),
          onClick: () => appAccess.checkAppAccess(),
        },
      {
        title: t(tokens.nav.orderList),
        icon: (
          <SvgIcon fontSize="small">
            <LineChartUp04Icon />
          </SvgIcon>
        ),
        path: paths.dashboard.consultation.index,
        items:
          schedulingPermission?.viewAccessLevel === RolePermissionLevel.NONE
            ? [
                {
                  title: 'List',
                  icon: (
                    <SvgIcon fontSize="small">
                      <LineChartUp04Icon />
                    </SvgIcon>
                  ),
                  path: paths.dashboard.consultation.index,
                  onClick: () => appAccess.checkAppAccess(),
                },
              ]
            : [
                {
                  title: t(tokens.nav.calendar),
                  path: paths.dashboard.calendar,
                  icon: (
                    <SvgIcon fontSize="small">
                      <CalendarIcon />
                    </SvgIcon>
                  ),
                  onClick: () => appAccess.checkAppAccess(),
                },
                {
                  title: 'List',
                  icon: (
                    <SvgIcon fontSize="small">
                      <LineChartUp04Icon />
                    </SvgIcon>
                  ),
                  path: paths.dashboard.consultation.index,
                  onClick: () => appAccess.checkAppAccess(),
                },
              ],
      },
      chatPermission &&
        chatPermission?.viewAccessLevel !== RolePermissionLevel.NONE &&
        chatPermission?.editAccessLevel !== RolePermissionLevel.NONE && {
          title: t(tokens.nav.chat),
          path: paths.dashboard.chat,
          icon: (
            <SvgIcon fontSize="small">
              <MessageChatSquareIcon />
            </SvgIcon>
          ),
          onClick: () => appAccess.checkAppAccess(),
        },
      invoicingPaymentsPermission &&
        invoicingPaymentsPermission?.viewAccessLevel !== RolePermissionLevel.NONE && {
          title: t(tokens.nav.invoiceList),
          path: paths.dashboard.invoices.index,
          icon: (
            <SvgIcon fontSize="small">
              <ReceiptCheckIcon />
            </SvgIcon>
          ),
          onClick: () => appAccess.checkAppAccess(),
        },
      {
        title: t(tokens.nav.template),
        path: paths.dashboard.templates,
        icon: (
          <SvgIcon fontSize="small">
            <DescriptionOutlinedIcon />
          </SvgIcon>
        ),
      },
      {
        title: t(tokens.nav.faxing),
        path: paths.dashboard.faxing,
        icon: (
          <SvgIcon fontSize="small">
            <FaxIcon fontSize={'inherit'} />
          </SvgIcon>
        ),
      },
    ];

    return [
      {
        items: items.filter((item) => !!item) as Item[],
      },
    ];
  }, [t, user, appAccess, permissions, isGettingStartedCompleted]);
};
