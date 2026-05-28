"use client";

import { 
    LeadDetailsModal,
    RequestWithdrawalModal,
    RankingModal,
    NotificationDetailsModal
} from "./";

export function AffiliateModalProvider() {
    return (
        <>
            <RequestWithdrawalModal />
            <LeadDetailsModal />
            <RankingModal />
            <NotificationDetailsModal />
        </>
    );
}
