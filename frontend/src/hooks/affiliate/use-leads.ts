import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services/lead-service";
import { Lead, LeadStatus } from "@workspace/types/affiliate";

export function useLeads(filters?: {
  status?: LeadStatus;
}) {
  return useQuery({
    queryKey: ["leads", String(filters?.status || "all")],
    queryFn: async () => {
        const response = await leadService.listLeads(filters?.status);
        return response.data;
    }
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => leadService.registerLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: LeadStatus }) =>
      leadService.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
