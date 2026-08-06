"use client"
import { DinamicBreadcrumb } from "../../custom/dynamic-breadcrumb";
import { Separator, SidebarTrigger, Button } from "../../ui";
import { useQueryState } from "nuqs";
import { Icon } from "../icon";
import { Input } from "../../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useAuth, useModalStore } from "@workspace/hooks";
import { useRouter } from "next/navigation";

type Props = {
  routePath?: string;
  routeLabel?: string;
  subRoute: string;
  showSeparator?: boolean;
  children: React.ReactNode;
  variant?: "default" | "counter";
  rightHeaderActions?: React.ReactNode;
};

export function PageWrapper({
  routePath,
  routeLabel,
  subRoute,
  showSeparator = true,
  children,
  variant = "default",
  rightHeaderActions,
}: Props) {
  const { user } = useAuth();
  const { openModal } = useModalStore();
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
  });

  return (
    <div className="bg-background">
      <header className="flex h-16 sticky top-0 z-50 shrink-0 bg-sidebar border-b items-center gap-2 transition-[width,height] ease-linear justify-between">
        {/* Default Variant Left side */}
        {variant === "default" && (
          <div className="flex items-center gap-2 px-4 text-center">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DinamicBreadcrumb
              routePath={routePath}
              routeLabel={routeLabel}
              subRoute={subRoute}
              showSeparator={showSeparator}
            />
          </div>
        )}

        {/* Counter Variant Header Content */}
        {variant === "counter" && (
          <div className="flex items-center gap-4 w-full justify-between px-4">
            <div className="relative w-96">
              <Icon name="Search" className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar no Menu..."
                className="pl-8 bg-muted/50 border-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center mr-4 space-x-2 md:space-x-4">
          {/* Mobile: navigate to dedicated page */}
          <Button
            variant="outline"
            size="sm"
            className="flex sm:hidden items-center gap-1.5 h-8 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            onClick={() => router.push("/simulador")}
          >
            <Icon name="Calculator" className="size-4 text-primary" />
          </Button>
          {/* Desktop: open modal */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 h-8 border-dashed hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
            onClick={() => openModal("commission-simulator")}
          >
            <Icon name="Calculator" className="size-4 text-primary" />
            <span className="font-semibold">Simulador</span>
          </Button>
          {rightHeaderActions}
          {variant === "counter" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.name} />
                  <AvatarFallback className="text-xs">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-start overflow-hidden">
                  <span
                    className="text-xs font-semibold truncate max-w-[120px]"
                    title={user?.name}
                  >
                    {user?.name}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground truncate"
                    title={user?.role}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className={`flex flex-col flex-1 ${variant === "counter" ? "w-full max-w-[98%]" : "w-full"} mx-auto space-y-4 md:space-y-6`}>
        <div className={`@container/main flex flex-1 ${variant === "counter" ? "p-4" : "px-4 py-8 md:px-10"} flex-col gap-2`}>
          {children}
        </div>
      </div>
    </div>
  );
}

