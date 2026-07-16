import { api } from "./api";

export interface ReferredClient {
  id: string;
  name: string;
  tax_number: string;
  email: string;
  phone: string;
  affiliate_code: string;
  company_name: string;
  company_tax_number: string;
  company_email: string;
  subscription_status: string;
  current_plan: string;
}

export interface ReferredClientsResponse {
  data: ReferredClient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const clientService = {
  listClients: async (filters?: {
    search?: string;
    createdAfter?: string;
    createdBefore?: string;
    status?: string;
    plan?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get<ReferredClientsResponse>("/affiliate/my-clients", {
      params: filters,
    });
  },
};
