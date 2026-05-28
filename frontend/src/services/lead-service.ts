import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Lead, LeadStatus, LeadAdminCreate, LeadUpdate } from "@workspace/types/affiliate";

export const leadService = {
  listLeads: async (status?: LeadStatus, page = 1, size = 10) => {
    return api.get<Lead[]>("/affiliate/leads", {
      params: { status, page, limit: size }
    });
  },

  registerLead: async (data: any) => {
    return api.post<Lead>("/affiliate/leads", data);
  },

  updateLeadStatus: async (id: string | number, status: LeadStatus) => {
    return api.patch<Lead>(`/affiliate/leads/${id}/status`, { status });
  },
};
