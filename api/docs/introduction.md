# Mindgest Partners API

Esta API foi migrada para NestJS com TypeScript e expõe a documentação interativa em Scalar.

- API base: `http://localhost:3333/api`
- Scalar Docs embarcado: `http://localhost:3333/api/reference`
- OpenAPI JSON: `http://localhost:3333/api/openapi.json`
- Swagger UI: `http://localhost:3333/api/swagger`

Use `npm run seed` para criar o admin inicial, os serviços comerciais existentes e os planos BASE, SMART e PRO do Mindgest Partners Program.

## Regras de Negócio Importantes

- **Níveis e Comissões Recorrentes:**
  - Base (None): 15% recorrente (bónus de 0%)
  - Prata (Silver): 20% recorrente (bónus de 5%, $\ge 15$ clientes)
  - Ouro (Gold): 27% recorrente (bónus de 12%, $\ge 40$ clientes)
  - Platina (Platinum): 33% recorrente (bónus de 18%, $\ge 100$ clientes)
  - Elite: 38% recorrente (bónus de 23%, $\ge 250$ clientes)
- **Saque Mínimo:** O valor mínimo para solicitação de levantamento da carteira de afiliados é de **8.000 Kz**.
- **Segurança de Webhooks:**
  - Validação `timingSafeEqual` para comparação do secret do webhook.
  - Replay protection utilizando o cabeçalho `x-webhook-timestamp` (limite de tolerância de 5 minutos / 300s).
  - Idempotência para webhooks de conversão via `external_event_id` e webhooks de subscrição via `external_payment_id`.
  - Registo automático de logs de auditoria na tabela `webhook_audit_logs`.

