import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/client-service";

export function useMyClients(filters?: {
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["referred-clients", filters],
    queryFn: async () => {
      const response = await clientService.listClients(filters);
      return response.data;
    },
  });
}
