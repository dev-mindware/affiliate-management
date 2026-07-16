import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ["dashboard", "kpis"],
        queryFn: async () => {
            const response = await dashboardService.getKPIs();
            return response.data;
        },
    });
}
export function useRanking() {
    return useQuery({
        queryKey: ["dashboard", "ranking"],
        queryFn: async () => {
            const response = await dashboardService.getRanking();
            return response.data;
        },
    });
}
export function useDashboardChart(period: "monthly" | "annual" = "monthly") {
    return useQuery({
        queryKey: ["dashboard", "chart", period],
        queryFn: async () => {
            const response = await dashboardService.getChartData(period);
            return response.data;
        },
    });
}
