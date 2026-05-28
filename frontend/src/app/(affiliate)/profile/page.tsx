import { PageWrapper } from "@/components";
import { ProfileContent } from "@/components/affiliate/profile/profile-content";
import { Suspense } from "react";

export const metadata = {
  title: "Perfil | Mindware Affiliate",
  description: "Gerencie seus dados pessoais.",
};

export default function ProfilePage() {
  return (
    <PageWrapper subRoute="Perfil">
      <Suspense fallback={<div>Carregando perfil...</div>}>
        <ProfileContent />
      </Suspense>
    </PageWrapper>
  );
}
