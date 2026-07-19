"use client";

import { useEffect, useMemo, useState } from "react";
import {
    GlobalModal,
    Input,
    Button,
    Checkbox,
    Field,
    FieldLabel,
    FieldContent,
} from "@workspace/ui";
import { formatCurrency } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { useRequestWithdrawal, useWallet, useProfile } from "@/hooks/affiliate";
import { toast } from "sonner";

const WITHDRAWAL_MINIMUM = 5000;

const groupFormatter = new Intl.NumberFormat("pt-AO");

export function RequestWithdrawalModal() {
    const { closeModal } = useModalStore();
    const { mutate: request, isPending } = useRequestWithdrawal();
    const { data: wallet } = useWallet();
    const { data: profile } = useProfile();

    const [valor, setValor] = useState("");
    const [useOther, setUseOther] = useState(false);
    const [contaBancaria, setContaBancaria] = useState("");
    const [banco, setBanco] = useState("");

    const registeredBanco = profile?.banco || "";
    const registeredConta = profile?.conta_bancaria || "";
    const hasRegisteredAccount = Boolean(registeredBanco && registeredConta);
    const available = Number(wallet?.saldo_disponivel || 0);

    // Se o utilizador não tem conta registada, força a introdução de uma alternativa.
    useEffect(() => {
        if (!hasRegisteredAccount) setUseOther(true);
    }, [hasRegisteredAccount]);

    const amount = useMemo(() => Number(valor.replace(/\D/g, "")), [valor]);
    const displayValor = valor ? groupFormatter.format(Number(valor.replace(/\D/g, ""))) : "";

    const handleValorChange = (raw: string) => {
        const digits = raw.replace(/\D/g, "");
        setValor(digits);
    };

    const handleSubmit = () => {
        if (isNaN(amount) || amount < WITHDRAWAL_MINIMUM) {
            toast.error("O valor mínimo para saque é de 5.000 Kz");
            return;
        }
        if (amount > available) {
            toast.error("O valor solicitado excede o seu saldo disponível.");
            return;
        }

        const finalBanco = useOther ? banco.trim() : registeredBanco;
        const finalConta = useOther ? contaBancaria.trim() : registeredConta;

        if (!finalBanco || !finalConta) {
            toast.error("Por favor, preencha os dados bancários.");
            return;
        }

        request(
            { valor: amount, conta_bancaria: finalConta, banco: finalBanco },
            {
                onSuccess: () => {
                    toast.success("Solicitação de saque enviada com sucesso!");
                    closeModal("request-withdrawal");
                    setValor("");
                    setContaBancaria("");
                    setBanco("");
                    setUseOther(!hasRegisteredAccount);
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.detail || error.response?.data?.message || "Erro ao solicitar saque.");
                },
            },
        );
    };

    return (
        <GlobalModal
            id="request-withdrawal"
            title="Solicitar Saque"
            description="Informe o valor e a conta bancária para processarmos o pagamento."
        >
            <div className="space-y-6">
                <Field>
                    <FieldLabel>Valor (Kz)</FieldLabel>
                    <FieldContent>
                        <Input
                            id="amount"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ex: 25.000"
                            value={displayValor}
                            onChange={(e) => handleValorChange(e.target.value)}
                        />
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Mínimo: {formatCurrency(WITHDRAWAL_MINIMUM)}</span>
                            <button
                                type="button"
                                className="font-medium text-primary hover:underline disabled:opacity-50"
                                disabled={available < WITHDRAWAL_MINIMUM}
                                onClick={() => setValor(String(Math.floor(available)))}
                            >
                                Disponível: {formatCurrency(available)}
                            </button>
                        </div>
                    </FieldContent>
                </Field>

                {hasRegisteredAccount && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Conta registada</p>
                                <p className="text-sm font-medium">{registeredBanco}</p>
                                <p className="font-mono text-sm text-muted-foreground">{registeredConta}</p>
                            </div>
                        </div>
                        <label className="mt-3 flex items-center gap-2 text-sm">
                            <Checkbox checked={useOther} onCheckedChange={(v) => setUseOther(Boolean(v))} />
                            <span>Usar outra conta bancária</span>
                        </label>
                    </div>
                )}

                {useOther && (
                    <div className="space-y-4">
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
                    </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-2">
                    <Button loading={isPending} onClick={handleSubmit} className="w-full">
                        Enviar Solicitação
                    </Button>
                </div>
            </div>
        </GlobalModal>
    );
}
