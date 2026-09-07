import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  Progress,
} from "@workspace/ui";
import { LevelDefinition } from "./about-constants";

interface CurrentStatusCardProps {
  currentLevelData: LevelDefinition;
  activeClients: number;
  recurringBonus: number;
  nextLevelName?: string;
  clientsToNext: number;
  progressValue: number;
}

export function CurrentStatusCard({
  currentLevelData,
  activeClients,
  recurringBonus,
  nextLevelName,
  clientsToNext,
  progressValue,
}: CurrentStatusCardProps) {
  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Icon name="Target" className="size-4.5 text-primary" />
          A Sua Posição Atual no Programa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`size-14 rounded-2xl flex items-center justify-center border shadow-xs ${currentLevelData.iconBgClass}`}
            >
              <Icon name={currentLevelData.iconName} className="size-7" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {currentLevelData.label} Partner
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {activeClients} clientes ativos ·{" "}
                <span className="font-semibold text-primary">
                  {15 + recurringBonus}% comissão recorrente
                </span>
              </p>
            </div>
          </div>

          {nextLevelName ? (
            <div className="w-full lg:max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium">
                  Progresso para {nextLevelName}
                </span>
                <span className="font-semibold text-foreground">
                  {clientsToNext} em falta
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
          ) : (
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start lg:self-center"
            >
              <Icon name="Crown" className="size-4" />
              Nível Máximo Alcançado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
