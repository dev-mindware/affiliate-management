"use client";

import { GlobalModal } from "@workspace/ui";
import { AffiliateRanking } from "../ranking/affiliate-ranking";

export function RankingModal() {
    return (
        <GlobalModal
            id="view-ranking"
            title="Ranking Global de Afiliados"
            className="sm:max-w-[800px]"
        >
            <div className="py-4">
                <AffiliateRanking />
            </div>
        </GlobalModal>
    );
}
