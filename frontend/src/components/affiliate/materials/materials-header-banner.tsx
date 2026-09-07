import { Icon } from "@workspace/ui";
import { CATEGORY_FILTERS } from "@/constants/marketing-materials";

interface MaterialsHeaderBannerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function MaterialsHeaderBanner({
  selectedCategory,
  onSelectCategory,
}: MaterialsHeaderBannerProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* BANNER PRINCIPAL DE DOWNLOAD COMPLETO */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Icon name="Sparkles" size={13} />
              Kit Oficial de Divulgação Mindgest
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Tudo o que precisa para divulgar e fechar novos clientes
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Disponibilizamos <strong>11 artes promocionais em alta definição</strong> e modelos de texto prontos
              para partilhar nas redes sociais e WhatsApp. Descarregue o pacote completo em arquivo compactado (ZIP)
              ou baixe cada imagem individualmente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <a
              data-tour="zip-download-cta"
              href="/mindgest-materiais-parceiros.zip"
              download="mindgest-materiais-parceiros.zip"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.99]"
            >
              <Icon name="Download" size={18} />
              <span>Baixar Pacote Completo (ZIP)</span>
            </a>
          </div>
        </div>
      </div>

      {/* CONTROLO DE FILTROS E CONTAGEM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Icon name="Image" size={20} className="text-primary" />
            Galeria de Artes Oficiais (Feed & Stories)
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Imagens em formato quadrado (1080x1080) preparadas para Instagram, Facebook e WhatsApp.
          </p>
        </div>

        {/* FILTROS DE CATEGORIA */}
        <div
          data-tour="category-filters"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border text-xs"
        >
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
