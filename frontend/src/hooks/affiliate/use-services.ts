import { useQuery } from "@tanstack/react-query";
import { serviceService } from "@/services/service-service";
import { PartnerProgramPlan, Service } from "@workspace/types/affiliate";
import { usePagination } from "@workspace/hooks";
import { api } from "@/services/api";

export function useServices() {
  return usePagination<Service>({
    endpoint: "/public/services",
    queryKey: "services",
    api,
  });
}

export function useAllServices() {
  return useQuery<Service[]>({
    queryKey: ["services", "all"],
    queryFn: async () => {
      const response = await serviceService.getServices(1, 100);
      return response.data.items;
    },
  });
}

export function usePartnerProgramPlans() {
  return useQuery<PartnerProgramPlan[]>({
    queryKey: ["partner-program", "plans"],
    queryFn: async () => {
      const response = await serviceService.getPartnerProgramPlans();
      return response.data;
    },
  });
}
