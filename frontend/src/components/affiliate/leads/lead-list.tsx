"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLeads } from "@/hooks/affiliate";
import {
    GenericTable,
    Column,
    ListSkeleton,
    RequestError,
    ItemStatusBadge,
    ButtonOnlyAction,
    FilterBar,
    Icon,
} from "@workspace/ui";
import { Lead, LeadStatus } from "@workspace/types/affiliate";
import { formatDate } from "@workspace/utils";
import { useModalStore } from "@workspace/hooks";
import { MobileCard } from "@/components/shared/mobile-card";
import { LeadFormModal } from "./lead-form-modal";

export function LeadList() {
    const [status, setStatus] = useState<LeadStatus | undefined>();
    const router = useRouter();

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useLeads({ status });
    
    const { openModal } = useModalStore();

    const columns: Column<Lead>[] = [
        {
            key: "client_nome",
            header: "Cliente",
            render: (_, item) => (
                <div className="font-medium text-foreground">{item.client_nome}</div>
            ),
        },
        {
            key: "client_telefone",
            header: "Contato",
            render: (_, item) => (
                <div className="text-sm text-foreground">{item.client_telefone}</div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (_, item) => (
                <ItemStatusBadge status={item.status} />
            ),
        },
        {
            key: "createdAt",
            header: "Criado em",
            render: (_, item) => (
                <div className="text-sm text-muted-foreground">
                    {formatDate(item.created_at)}
                </div>
            ),
        },
        {
            key: "action",
            header: "Ações",
            render: (_, item) => (
                <ButtonOnlyAction
                    data={item}
                    actions={[
                        {
                            label: "Ver Detalhes",
                            icon: "Info",
                            onClick: (data) => openModal("view-lead-details", data),
                        },
                    ]}
                />
            ),
        },
    ];

    if (isLoading) return <ListSkeleton />;

    if (isError) {
        return <RequestError refetch={refetch} message="Erro ao carregar leads" />;
    }

    return (
        <div className="space-y-4">
            <FilterBar 
                label="Filtrar por Status"
                value={status || ""}
                onValueChange={(val) => setStatus(val as LeadStatus)}
                options={[
                    { label: "Novo", value: LeadStatus.NEW },
                    { label: "Contatado", value: LeadStatus.CONTACTED },
                    { label: "Convertido", value: LeadStatus.CONVERTED },
                    { label: "Perdido", value: LeadStatus.LOST },
                ]}
            />

            {/* Mobile View: Dedicated MobileCard Component & Page Navigation */}
            <div className="block sm:hidden space-y-3">
                {!data || data.length === 0 ? (
                    <div className="text-center py-8 px-4 border rounded-2xl bg-card text-muted-foreground text-xs">
                        Não existem leads registrados com este status.
                    </div>
                ) : (
                    data.map((item) => (
                        <MobileCard
                            key={item.id}
                            title={item.client_nome}
                            subtitle={item.client_telefone}
                            icon="User"
                            badge={<ItemStatusBadge status={item.status} />}
                            fields={[
                                { label: "Criado em", value: formatDate(item.created_at) },
                            ]}
                            footerAction={
                                <Link
                                    href={`/leads/${item.id}`}
                                    className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Ver Detalhes <Icon name="ChevronRight" className="size-3.5" />
                                </Link>
                            }
                            onClick={() => router.push(`/leads/${item.id}`)}
                        />
                    ))
                )}
            </div>

            {/* Desktop View: Generic Table */}
            <div className="hidden sm:block">
                <GenericTable<Lead>
                    data={data || []}
                    columns={columns}
                    emptyTitle="Nenhum lead encontrado"
                    emptyDescription="Não existem leads registrados com este status."
                    emptyIcon="UserPlus"
                />
            </div>

            <LeadFormModal />
        </div>
    );
}
