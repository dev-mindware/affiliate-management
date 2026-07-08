import Image from "next/image";
import PartnershipImg from "@/assets/partnership.jpg";
import Logo from "@/assets/brand.png";
import { Badge } from "@/workspace/ui";

export function HeroImageSide() {
  return (
    <div className="relative hidden w-full h-screen lg:flex flex-col overflow-hidden">
      {/* Background image */}
      <Image
        fill
        src={PartnershipImg}
        alt="Parceria Mindware"
        className="object-cover object-center"
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
      />

      {/* Dark overlay — adapts to light/dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-purple-950/60 dark:from-black/85 dark:via-black/65 dark:to-purple-950/70" />

      {/* Subtle vignette at edges */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10">
        {/* Top: Logo */}
        <div className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="Mindware Logo"
            className="size-10 drop-shadow-[0_2px_8px_rgba(139,92,246,0.7)]"
          />
          <span className="text-white font-semibold text-lg tracking-wide drop-shadow-md">
            Mindware
          </span>
        </div>

        {/* Middle: Main copy */}
        <div className="flex flex-col gap-5 max-w-md">
          <h2 className="text-white text-4xl font-bold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            Ganhe comissões.<br />
            Cresça junto <span className="text-primary">connosco.</span>
          </h2>
          <p className="text-white/80 text-base leading-relaxed drop-shadow-md">
            Uma plataforma simples para gerir as suas referências, acompanhar
            comissões em tempo real e receber os seus ganhos de forma segura.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {["Comissões automáticas", "Ranking de parceiros", "Pagamentos rápidos"].map((label) => (
              <Badge
                key={label}
                variant="outline"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom: Brand footer */}
        <div className="flex items-center gap-2 text-white/50 text-xs tracking-widest uppercase">
          <div className="w-8 h-px bg-white/40" />
          <span>Mindware · Programa de Afiliados</span>
          <div className="w-8 h-px bg-white/40" />
        </div>
      </div>
    </div>
  );
}
