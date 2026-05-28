import { api } from "./api";
import { PaginatedResponse } from "@workspace/types";
import { WithdrawalRequest, WithdrawalStatus } from "@workspace/types/affiliate";

export const withdrawalService = {
  listWithdrawals: async (status?: WithdrawalStatus, page = 1, size = 10) => {
    return api.get<PaginatedResponse<WithdrawalRequest>>("/affiliate/withdrawals", {
      params: { status, page, limit: size }
    });
  },
};
