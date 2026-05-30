import { AffiliateRanking } from "@/components/affiliate/ranking/affiliate-ranking";
import { TitleList, PageWrapper } from "@/components";

export default function RankingPage() {
    return (
        <PageWrapper subRoute="Ranking de Parceiros">
            <div className="space-y-6">
                <TitleList
                    title="Ranking de Parceiros"
                    suTitle="Acompanhe o desempenho dos melhores parceiros."
                />
                
                <AffiliateRanking />
            </div>
        </PageWrapper>
    );
}
