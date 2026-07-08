import { HeroImageSide, LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block">
        <HeroImageSide />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 shadow-[-8px_0_32px_rgba(0,0,0,0.06)] dark:shadow-[-8px_0_40px_rgba(0,0,0,0.35)]">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
