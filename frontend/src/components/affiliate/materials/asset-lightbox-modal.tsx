import Image from "next/image";
import { Badge, Icon } from "@workspace/ui";
import { MarketingAsset } from "@/constants/marketing-materials";

interface AssetLightboxModalProps {
  asset: MarketingAsset | null;
  onClose: () => void;
}

export function AssetLightboxModal({
  asset,
  onClose,
}: AssetLightboxModalProps) {
  if (!asset) return null;

  const assetUrl = `/marketing-assets/${encodeURIComponent(asset.filename)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full rounded-2xl bg-card border border-border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
          <div>
            <h4 className="text-sm font-bold text-foreground">{asset.title}</h4>
            <p className="text-xs text-muted-foreground">
              {asset.size} • {asset.dimensions}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="relative aspect-square w-full bg-black/5 flex items-center justify-center">
          <Image
            src={assetUrl}
            alt={asset.title}
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border bg-card">
          <Badge variant="outline" className="text-xs">
            {asset.categoryLabel}
          </Badge>
          <a
            href={assetUrl}
            download={`Mindgest-${asset.category}-${asset.id}.${
              asset.filename.split(".").pop() || "jpg"
            }`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Icon name="Download" size={14} />
            Descarregar Imagem Original
          </a>
        </div>
      </div>
    </div>
  );
}
