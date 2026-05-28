import { PageWrapper } from "@/components";
import { WalletContent } from "@/components/affiliate/wallet/wallet-content";
import { Suspense } from "react";

export const metadata = {
  title: "Carteira | Mindware Affiliate",
  description: "Gerencie seu saldo e solicitações de saque.",
};

export default function WalletPage() {
  return (
    <PageWrapper subRoute="Carteira">
      <Suspense fallback={<div>Carregando carteira...</div>}>
        <WalletContent />
      </Suspense>
    </PageWrapper>
  );
}
