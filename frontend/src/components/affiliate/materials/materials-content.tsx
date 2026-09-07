"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MARKETING_ASSETS,
  MarketingAsset,
} from "@/constants/marketing-materials";
import { MaterialsHeaderBanner } from "./materials-header-banner";
import { AssetCard } from "./asset-card";
import { AssetLightboxModal } from "./asset-lightbox-modal";
import { SalesCopiesSection } from "./sales-copies-section";
import { MarketingTipsCard } from "./marketing-tips-card";

export function MaterialsContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activePreview, setActivePreview] = useState<MarketingAsset | null>(null);

  const filteredAssets =
    selectedCategory === "all"
      ? MARKETING_ASSETS
      : MARKETING_ASSETS.filter((item) => item.category === selectedCategory);

  function copyToClipboard(text: string, title: string) {
    navigator.clipboard.writeText(text);
    toast.success(`Texto "${title}" copiado com sucesso!`);
  }

  return (
    <div className="flex flex-col gap-8">
      <MaterialsHeaderBanner
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* GRID DE ARTES */}
      <div
        data-tour="art-cards-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPreview={setActivePreview}
          />
        ))}
      </div>

      <SalesCopiesSection onCopy={copyToClipboard} />

      <MarketingTipsCard />

      <AssetLightboxModal
        asset={activePreview}
        onClose={() => setActivePreview(null)}
      />
    </div>
  );
}
