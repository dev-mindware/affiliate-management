import { enumOut } from "./enum-mappers";

export function page<T>(items: T[], total: number, pageNumber: number, limit: number) {
  return { items, total, page: pageNumber, limit, pages: Math.ceil(total / limit) };
}

export function affiliateDto(a: any) {
  return {
    id: a.id,
    user_id: a.userId,
    nome_completo: a.nomeCompleto,
    email: a.email,
    telefone: a.telefone,
    conta_bancaria: a.contaBancaria,
    banco: a.banco,
    codigo_afiliado: a.codigoAfiliado,
    status: enumOut(a.status),
    partner_type: enumOut(a.partnerType),
    partner_level: enumOut(a.partnerLevel),
    certification_status: enumOut(a.certificationStatus),
    total_earned: Number(a.totalEarned || 0),
    total_paid: Number(a.totalPaid || 0),
    approved_at: a.approvedAt,
    approved_by: a.approvedBy,
    created_at: a.createdAt,
  };
}

export function serviceDto(s: any) {
  const preco = Number(s.preco || 0);
  const comissao = Number(s.comissao || 0);
  return {
    id: s.id,
    nome: s.nome,
    descricao: s.descricao,
    preco,
    comissao,
    ativo: s.ativo,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
    percentagem_comissao: preco > 0 ? (comissao / preco) * 100 : 0,
  };
}

export function leadDto(l: any) {
  return {
    id: l.id,
    affiliate_id: l.affiliateId,
    affiliate_nome: l.affiliate?.nomeCompleto,
    service_id: l.serviceId,
    client_nome: l.clientNome,
    client_telefone: l.clientTelefone,
    notas: l.notas,
    status: enumOut(l.status),
    created_at: l.createdAt,
    updated_at: l.updatedAt,
  };
}

export function commissionDto(c: any) {
  return {
    id: c.id,
    affiliate_id: c.affiliateId,
    affiliate_nome: c.affiliate?.nomeCompleto,
    service_id: c.serviceId,
    lead_notification_id: c.leadNotificationId,
    partner_subscription_id: c.partnerSubscriptionId,
    client_nome: c.clientNome,
    client_telefone: c.clientTelefone,
    valor_servico: Number(c.valorServico || 0),
    valor_comissao: Number(c.valorComissao || 0),
    status: enumOut(c.status),
    notas: c.notas,
    comprovativo_url: c.comprovativoUrl,
    comprovativo_filename: c.comprovativoFilename,
    source: c.source,
    available_at: c.availableAt,
    validation_days: c.validationDays,
    created_at: c.createdAt,
    approved_at: c.approvedAt,
    paid_at: c.paidAt,
  };
}

export function walletDto(w: any) {
  return {
    id: w.id,
    affiliate_id: w.affiliateId,
    saldo_disponivel: Number(w.saldoDisponivel || 0),
    saldo_pendente: Number(w.saldoPendente || 0),
    total_ganho: Number(w.totalGanho || 0),
    total_levantado: Number(w.totalLevantado || 0),
    updated_at: w.updatedAt,
  };
}

export function withdrawalDto(w: any) {
  return {
    id: w.id,
    affiliate_id: w.affiliateId,
    affiliate_nome: w.affiliate?.nomeCompleto,
    valor: Number(w.valor || 0),
    conta_bancaria: w.contaBancaria,
    banco: w.banco,
    status: enumOut(w.status),
    notas_admin: w.notasAdmin,
    comprovativo_url: w.comprovativoUrl,
    created_at: w.createdAt,
    processed_at: w.processedAt,
  };
}

export function planDto(p: any) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    price: Number(p.price || 0),
    first_monthly_percent: Number(p.firstMonthlyPercent || 0),
    recurring_monthly_percent: Number(p.recurringMonthlyPercent || 0),
    annual_first_percent: Number(p.annualFirstPercent || 0),
    minimum_custom_price: p.minimumCustomPrice == null ? null : Number(p.minimumCustomPrice),
    mindware_minimum_net: p.mindwareMinimumNet == null ? null : Number(p.mindwareMinimumNet),
    certified_only: p.certifiedOnly,
    active: p.active,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function subscriptionDto(s: any) {
  return {
    id: s.id,
    affiliate_id: s.affiliateId,
    plan_id: s.planId,
    external_payment_id: s.externalPaymentId,
    client_name: s.clientName,
    client_identifier: s.clientIdentifier,
    amount_paid: Number(s.amountPaid || 0),
    paid_at: s.paidAt,
    billing_period: enumOut(s.billingPeriod),
    status: enumOut(s.status),
    source: enumOut(s.source),
    notes: s.notes,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}
