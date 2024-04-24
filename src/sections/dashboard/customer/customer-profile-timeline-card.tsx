import { PatientFeed } from '../../../types/patient';
import React from 'react';
import CustomerProfileConsultationCard from './customer-profile-consultation-card';
import CustomerProfileFileCard from './customer-profile-file-card';
import CustomerProfileChartCard from './customer-profile-chart-card';
import { Address, Organization } from '@prisma/client';

const CustomerProfileTimeLineCard = (props: {
  feed: PatientFeed;
  refetchFeeds?: any;
  organization?: Organization & {
    address: Address | null;
  };
  logo?: string;
}) => {
  const { feed, refetchFeeds, organization, logo } = props;

  if (feed.Consultation) {
    return (
      <CustomerProfileConsultationCard
        appointment={feed.Consultation}
        createdBy={feed.from_user}
        refetchFeeds={refetchFeeds}
      />
    );
  }

  if (feed.File) {
    return (
      <CustomerProfileFileCard
        file={feed.File}
        createdBy={feed.from_user}
        isSubFiles={false}
      />
    );
  }

  if (feed.SubFile) {
    return (
      <CustomerProfileFileCard
        file={feed.SubFile}
        createdBy={feed.from_user}
        isSubFiles={true}
      />
    );
  }

  // Do not render chart if it is associated with a consultation
  if (feed.Chart && !feed.Chart.consultation_id) {
    return (
      <CustomerProfileChartCard
        chart={feed.Chart}
        organization={organization}
        logo={logo}
      />
    );
  }

  return null;
};

export default CustomerProfileTimeLineCard;
