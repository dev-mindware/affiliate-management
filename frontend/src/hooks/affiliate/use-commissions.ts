import { useQuery } from "@tanstack/react-query";
import { commissionService } from "@/services/commission-service";
import { Commission, CommissionStatus } from "@workspace/types/affiliate";

export function useCommissions(filters?: {
  status?: CommissionStatus;
}) {
  return useQuery({
    queryKey: ["commissions", String(filters?.status || "all")],
    queryFn: async () => {
        const response = await commissionService.listCommissions(filters?.status);
        return response.data;
    }
  });
}
