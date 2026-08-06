import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletService } from "@/services/wallet-service";
import { withdrawalService } from "@/services/withdrawal-service";
import { WithdrawalRequest } from "@workspace/types/affiliate";

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const response = await walletService.getWallet();
      return response.data;
    },
  });
}

export function useWalletChart() {
  return useQuery({
    queryKey: ["wallet-chart"],
    queryFn: async () => {
      const response = await walletService.getChart();
      return response.data.data;
    },
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { valor: number; conta_bancaria: string; banco: string }) =>
      walletService.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-chart"] });
    },
  });
}

export function useWithdrawalRequests(status?: any, size = 10) {
  return useQuery({
    queryKey: ["withdrawals", status, size],
    queryFn: async () => {
        const response = await withdrawalService.listWithdrawals(status, 1, size);
        return response.data.items;
    }
  });
}
