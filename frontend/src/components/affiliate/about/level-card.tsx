import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Separator,
} from "@workspace/ui";
import { LevelDefinition } from "./about-constants";

interface LevelCardProps {
  level: LevelDefinition;
  isCurrent: boolean;
}

export function LevelCard({ level, isCurrent }: LevelCardProps) {
  return (
    <Card
      className={`relative transition-all border ${
        isCurrent
          ? `${level.borderClass} border-2 ring-2 ring-offset-2 ring-offset-background ring-primary/20 bg-primary/[0.02]`
          : "hover:border-primary/30"
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
          Seu Nível Atual
        </span>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center border shadow-2xs ${level.iconBgClass}`}
            >
              <Icon name={level.iconName} className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {level.label}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {level.sublabel} · {level.range}
              </CardDescription>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${level.badgeClass}`}
          >
            {level.total}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        <Separator />
        <div className="flex justify-between pt-1 text-xs sm:text-sm">
          <span className="text-muted-foreground">1.º Pagamento</span>
          <span className="font-semibold text-foreground">{level.firstPayment}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Bónus de nível</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {level.bonus}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Comissão recorrente</span>
          <span className="font-bold text-primary">{level.total}</span>
        </div>
        <Separator />
        <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
          {level.rationale}
        </p>
      </CardContent>
    </Card>
  );
}
