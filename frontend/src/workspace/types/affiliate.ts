export enum AffiliateStatus {
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

export enum PartnerLevel {
  NONE = "none",
  SILVER = "silver",
  GOLD = "gold",
  ELITE = "elite",
}

export enum CertificationStatus {
  NOT_ELIGIBLE = "not_eligible",
  ELIGIBLE = "eligible",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum PartnerType {
  AFFILIATE = "affiliate",
  CERTIFIED_COMMERCIAL = "certified_commercial",
}

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  CONVERTED = "converted",
  LOST = "lost",
}

export enum CommissionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  REJECTED = "rejected",
}

export interface Service {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  comissao: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerProgramPlan {
  id: number;
  code: "BASE" | "SMART" | "CUSTOM";
  name: string;
  description?: string;
  price: number;
  first_monthly_percent: number;
  recurring_monthly_percent: number;
  annual_first_percent: number;
  minimum_custom_price?: number;
  mindware_minimum_net?: number;
  certified_only: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerProgramSummary {
  active_clients: number;
  partner_type: PartnerType;
  certification_status: CertificationStatus;
  partner_level: PartnerLevel;
  next_level?: PartnerLevel | null;
  clients_to_next_level: number;
  recurring_bonus_percent: number;
  benefits: string[];
  certified_benefits: string[];
  withdrawal_minimum: number;
}

export interface Affiliate {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  conta_bancaria: string;
  banco: string;
  codigo_afiliado: string;
  status: AffiliateStatus;
  partner_type: PartnerType;
  partner_level: PartnerLevel;
  certification_status: CertificationStatus;
  total_earned: number;
  total_paid: number;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  affiliate_id: string;
  affiliate_nome?: string;
  service_id: number;
  client_nome: string;
  client_telefone: string;
  notas?: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  affiliate_id: string;
  affiliate_nome?: string;
  service_id: number;
  lead_notification_id?: string;
  client_nome: string;
  client_telefone: string;
  valor_servico: number;
  valor_comissao: number;
  status: CommissionStatus;
  notas?: string;
  comprovativo_url?: string;
  comprovativo_filename?: string;
  created_at: string;
  approved_at?: string;
  paid_at?: string;
}

export enum WithdrawalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface WithdrawalRequest {
  id: string;
  affiliate_id: string;
  affiliate_nome?: string;
  valor: number;
  status: WithdrawalStatus;
  requested_at: string;
  processed_at?: string;
  comprovativo_url?: string;
  notas_admin?: string;
}

// DTOs
export interface LeadAdminCreate {
  client_nome: string;
  client_telefone: string;
  service_id: number;
  notas?: string;
  affiliate_code: string;
}

export interface LeadUpdate {
  status: LeadStatus;
}

export interface AffiliateUpdate {
  status?: AffiliateStatus;
  comissao_percentagem?: number;
}

export interface CommissionCreate {
  affiliate_id: string;
  service_id: number;
  lead_notification_id?: string;
  client_nome: string;
  client_telefone: string;
  valor_servico: number;
  valor_comissao: number;
}

