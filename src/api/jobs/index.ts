import type { Company } from 'src/types/job';
import { deepCopy } from 'src/utils/deep-copy';

import { companies, company } from './data';

type GetCompaniesRequest = object;

type GetCompaniesResponse = Promise<Company[]>;

type GetCompanyRequest = object;

type GetCompanyResponse = Promise<Company>;

class JobsApi {
  getCompanies(request: GetCompaniesRequest = {}): GetCompaniesResponse {
    return Promise.resolve(deepCopy(companies));
  }

  getCompany(request?: GetCompanyRequest): GetCompanyResponse {
    return Promise.resolve(deepCopy(company));
  }
}

export const jobsApi = new JobsApi();
