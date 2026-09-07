import { AffiliateRanking } from "@/components/affiliate/ranking/affiliate-ranking";
import { TitleList, PageWrapper } from "@/components";

export default function RankingPage() {
    return (
        <PageWrapper subRoute="Ranking de Parceiros" tourId="ranking">
            <div className="space-y-6">
                <div data-tour="ranking-header">
                    <TitleList
                        title="Ranking de Parceiros"
                        suTitle="Acompanhe o desempenho dos melhores parceiros e acelere a sua subida de escalão."
                    />
                </div>
                
                <AffiliateRanking />
            </div>
        </PageWrapper>
    );
}
