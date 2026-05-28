"use client";

import { useState } from "react";
import { 
    GlobalModal, 
    Input, 
    Button,
    Field,
    FieldLabel,
    FieldContent,
} from "@workspace/ui";
import { useModalStore } from "@workspace/hooks";
import { useRequestWithdrawal } from "@/hooks/affiliate";
import { toast } from "sonner";

const WITHDRAWAL_MINIMUM = 25000;

export function RequestWithdrawalModal() {
    const { closeModal } = useModalStore();
    const { mutate: request, isPending } = useRequestWithdrawal();

    const [valor, setValor] = useState("");
    const [contaBancaria, setContaBancaria] = useState("");
    const [banco, setBanco] = useState("");

    const handleSubmit = () => {
        const amount = Number(valor);
        if (isNaN(amount) || amount < WITHDRAWAL_MINIMUM) {
            toast.error("O valor mínimo para saque é de 25.000 Kz");
            return;
        }

        if (!contaBancaria || !banco) {
            toast.error("Por favor, preencha os dados bancários.");
            return;
        }

        request({ valor: amount, conta_bancaria: contaBancaria, banco }, {
            onSuccess: () => {
                toast.success("Solicitação de saque enviada com sucesso!");
                closeModal("request-withdrawal");
                setValor("");
                setContaBancaria("");
                setBanco("");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.detail || "Erro ao solicitar saque.");
            }
        });
    };

    return (
        <GlobalModal
            id="request-withdrawal"
            title="Solicitar Saque"
            description="Informe o valor e seus dados bancários para processarmos o pagamento."
        >
            <div className="space-y-6">
                <Field>
                    <FieldLabel>Valor (Kz)</FieldLabel>
                    <FieldContent>
                        <Input 
                            id="amount" 
                            type="number" 
                            placeholder="Ex: 25000"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel>Banco</FieldLabel>
                    <FieldContent>
                        <Input 
                            id="bank" 
                            placeholder="Ex: BAI, BFA, etc."
                            value={banco}
                            onChange={(e) => setBanco(e.target.value)}
                        />
                    </FieldContent>
                </Field>
                <Field>
                    <FieldLabel>Conta Bancária / IBAN</FieldLabel>
                    <FieldContent>
                        <Input 
                            id="account" 
                            placeholder="Número da conta ou IBAN"
                            value={contaBancaria}
                            onChange={(e) => setContaBancaria(e.target.value)}
                        />
                    </FieldContent>
                </Field>
                <div className="flex justify-end gap-3 pt-2 border-t">
                    <Button 
                        loading={isPending} 
                        onClick={handleSubmit}
                        className="w-full"
                    >
                        Enviar Solicitação
                    </Button>
                </div>
            </div>
        </GlobalModal>
    );
}
