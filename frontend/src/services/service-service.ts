import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { PartnerProgramPlan, Service } from "@workspace/types/affiliate";

export const serviceService = {
  getServices: async (page = 1, size = 10) => {
    return api.get<PaginatedResponse<Service>>("/public/services", {
      params: { page, size }
    });
  },
  getPartnerProgramPlans: async () => {
    return api.get<PartnerProgramPlan[]>("/affiliate/partner-program/plans");
  },
};
