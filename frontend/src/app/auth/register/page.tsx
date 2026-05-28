import { HeroImageSide, RegisterForm } from "@/components/auth";

export const metadata = {
  title: "Cadastro | Mindware Affiliate",
  description: "Crie sua conta de parceiro de afiliados.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:block">
        <HeroImageSide source="/login.svg" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
