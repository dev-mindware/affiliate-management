"use client";

import { 
    LeadDetailsModal,
    RequestWithdrawalModal,
    RankingModal,
    NotificationDetailsModal,
    SimulatorModal
} from "./";

export function AffiliateModalProvider() {
    return (
        <>
            <RequestWithdrawalModal />
            <LeadDetailsModal />
            <RankingModal />
            <NotificationDetailsModal />
            <SimulatorModal />
        </>
    );
}
