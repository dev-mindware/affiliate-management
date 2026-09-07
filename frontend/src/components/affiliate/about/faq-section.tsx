import { Card, CardContent, CardHeader, CardTitle, Icon, Separator } from "@workspace/ui";
import { FAQS } from "./about-constants";

export function FaqSection() {
  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Icon name="CircleHelp" className="size-4.5 text-primary" />
          Perguntas Frequentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs sm:text-sm">
        {FAQS.map((item, i) => (
          <div key={i}>
            {i > 0 && <Separator className="mb-4" />}
            <p className="font-bold text-foreground">{item.q}</p>
            <p className="mt-1 leading-relaxed text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
