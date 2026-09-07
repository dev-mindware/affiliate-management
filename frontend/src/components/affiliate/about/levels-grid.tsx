import { Icon } from "@workspace/ui";
import { LevelDefinition, LEVELS } from "./about-constants";
import { LevelCard } from "./level-card";

interface LevelsGridProps {
  currentLevelKey: string;
}

export function LevelsGrid({ currentLevelKey }: LevelsGridProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Icon name="ChartBar" className="size-4.5 text-primary" />
          Tabela de Níveis e Comissões
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          A sua comissão recorrente sobe automaticamente à medida que acumula mais clientes ativos no software Mindgest.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {LEVELS.map((level: LevelDefinition) => (
          <LevelCard
            key={level.key}
            level={level}
            isCurrent={level.key === currentLevelKey}
          />
        ))}
      </div>
    </section>
  );
}
