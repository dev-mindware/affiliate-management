import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { Commission, CommissionStatus, CommissionCreate } from "@workspace/types/affiliate";

export const commissionService = {
  listCommissions: async (status?: CommissionStatus, page = 1, size = 10) => {
    return api.get<Commission[]>("/affiliate/commissions", {
      params: { status, page, size }
    });
  },
};
