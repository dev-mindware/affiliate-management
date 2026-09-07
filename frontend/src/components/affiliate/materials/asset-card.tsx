import Image from "next/image";
import { Badge, Icon } from "@workspace/ui";
import { MarketingAsset } from "@/constants/marketing-materials";

interface AssetCardProps {
  asset: MarketingAsset;
  onPreview: (asset: MarketingAsset) => void;
}

export function AssetCard({ asset, onPreview }: AssetCardProps) {
  const assetUrl = `/marketing-assets/${encodeURIComponent(asset.filename)}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-md">
      {/* ÁREA DA IMAGEM COM HOVER PREVIEW */}
      <div
        data-tour="art-zoom-preview"
        onClick={() => onPreview(asset)}
        className="relative aspect-square w-full bg-muted/30 cursor-pointer overflow-hidden flex items-center justify-center"
      >
        <Image
          src={assetUrl}
          alt={asset.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay no hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-xs">
            <Icon name="Eye" size={13} />
            Ampliar
          </span>
        </div>

        {/* Badge da categoria */}
        <div className="absolute top-2.5 left-2.5">
          <Badge
            variant="secondary"
            className="bg-background/85 text-foreground text-[10px] font-semibold backdrop-blur-xs shadow-2xs border border-border/60"
          >
            {asset.categoryLabel}
          </Badge>
        </div>
      </div>

      {/* METADADOS E AÇÃO DE DOWNLOAD */}
      <div className="flex flex-col justify-between flex-1 p-4 gap-3">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
            {asset.title}
          </h4>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {asset.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
          <span>
            {asset.size} • {asset.dimensions}
          </span>
          <a
            data-tour="art-single-download"
            href={assetUrl}
            download={`Mindgest-${asset.category}-${asset.id}.${
              asset.filename.split(".").pop() || "jpg"
            }`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
            title="Descarregar esta arte"
          >
            <Icon name="Download" size={12} />
            Baixar
          </a>
        </div>
      </div>
    </div>
  );
}
