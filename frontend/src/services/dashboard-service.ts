import { api } from "./api";
import { PartnerProgramSummary } from "@workspace/types/affiliate";

export interface AffiliateKPIs {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  active_leads: number;
  rank_info: {
    rank: number;
    total_earned: number;
    active_clients: number;
    distance_to_next: number;
  };
  partner_program: PartnerProgramSummary;
}

export const dashboardService = {
  getKPIs: async () => {
    return api.get<AffiliateKPIs>("/affiliate/dashboard/kpis");
  },

  getRanking: async () => {
    return api.get<any[]>("/affiliate/dashboard/ranking");
  },

  getChartData: async (period: "monthly" | "annual" = "monthly") => {
    return api.get<any[]>("/affiliate/dashboard/chart", { params: { period } });
  },
};
