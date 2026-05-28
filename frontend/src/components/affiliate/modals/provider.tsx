"use client";

import { 
    LeadDetailsModal,
    RequestWithdrawalModal,
    RankingModal
} from "./";

export function AffiliateModalProvider() {
    return (
        <>
            <RequestWithdrawalModal />
            <LeadDetailsModal />
            <RankingModal />
        </>
    );
}
