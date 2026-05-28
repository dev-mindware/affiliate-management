"use client";

import { useAuthStore } from "@/stores/auth/auth-store";
import { useProfile, useUpdateProfile } from "@/hooks/affiliate";
import { 
    Button, 
    Input, 
    Field, 
    FieldLabel, 
    FieldContent,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Skeleton
} from "@workspace/ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function ProfileContent() {
    const { data: profile, isLoading } = useProfile();
    const { mutate: update, isPending } = useUpdateProfile();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState({
        nome_completo: "",
        telefone: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                nome_completo: profile.nome_completo || "",
                telefone: profile.telefone || "",
            });
        }
    }, [profile]);

    const handleSave = async () => {
        update(formData, {
            onSuccess: () => {
                toast.success("Perfil atualizado com sucesso!");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao atualizar perfil.");
            }
        });
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-[400px] w-full rounded-lg" />
                <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Gerencie suas informações de contato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field>
                        <FieldLabel>Nome Completo</FieldLabel>
                        <FieldContent>
                            <Input 
                                value={formData.nome_completo}
                                onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                            />
                        </FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel>E-mail</FieldLabel>
                        <FieldContent>
                            <Input 
                                value={profile?.email || user?.email || ""}
                                disabled
                            />
                        </FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel>Telefone</FieldLabel>
                        <FieldContent>
                            <Input 
                                value={formData.telefone}
                                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                            />
                        </FieldContent>
                    </Field>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                    <Button onClick={handleSave} loading={isPending}>
                        Salvar Alterações
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Alterar sua senha de acesso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field>
                        <FieldLabel>Nova Senha</FieldLabel>
                        <FieldContent>
                            <Input type="password" placeholder="••••••••" />
                        </FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel>Confirmar Nova Senha</FieldLabel>
                        <FieldContent>
                            <Input type="password" placeholder="••••••••" />
                        </FieldContent>
                    </Field>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                    <Button variant="outline">Alterar Senha</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
