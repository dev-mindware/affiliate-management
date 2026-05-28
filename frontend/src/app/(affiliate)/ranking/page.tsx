import { AffiliateRanking } from "@/components/affiliate/ranking/affiliate-ranking";

export default function RankingPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Ranking de Afiliados</h2>
            </div>
            
            <AffiliateRanking />
        </div>
    );
}
