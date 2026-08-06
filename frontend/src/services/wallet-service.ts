import { api } from "./api";

export interface Wallet {
  id: string;
  affiliate_id: string;
  saldo_disponivel: number;
  saldo_pendente: number;
  total_ganho: number;
  total_levantado: number;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  affiliate_id: string;
  valor: number;
  status: string;
  conta_bancaria: string;
  banco: string;
  created_at: string;
  processed_at?: string;
  comprovativo_url?: string;
}

export interface WalletChartPoint {
  month: string;
  earned: number;
  withdrawn: number;
}

export const walletService = {
  getWallet: async () => {
    return api.get<Wallet>("/affiliate/wallet");
  },
  requestWithdrawal: async (data: { valor: number; conta_bancaria: string; banco: string }) => {
    return api.post<WithdrawalRequest>("/affiliate/wallet/withdraw", data);
  },
  getChart: async () => {
    return api.get<{ data: WalletChartPoint[] }>("/affiliate/wallet/chart");
  },
};

