import { PageWrapper, TitleList } from "@/components";
import { WalletContent } from "@/components/affiliate/wallet/wallet-content";
import { Suspense } from "react";

export default function WalletPage() {
  return (
    <PageWrapper subRoute="Carteira">
      <div className="space-y-6">
        <TitleList
          title="Carteira"
          suTitle="Acompanhe seu saldo e solicite saques."
        />
        <Suspense fallback={<div>Carregando carteira...</div>}>
          <WalletContent />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
