# Pix research and payment architecture

## Executive decision

The site is prepared for Pix dynamic charges by gift, but production payment creation is intentionally not enabled yet.

The receiver Pix key must be configured securely in the hosting environment. A Pix key alone is not enough to create dynamic charges, receive webhooks, or reconcile status automatically. For that, Maria needs a bank or PSP that exposes the Pix API for her account, plus OAuth/credential setup and webhook configuration.

## What Pix API supports

The Banco Central Pix API specification defines resources for:

- immediate charges (`cob`);
- due-date charges (`cobv`);
- dynamic QR payload/location flow;
- `txid` as the charge transaction identifier;
- `infoAdicionais` for extra payer-visible/reference information;
- webhook configuration for Pix received events;
- retrieval of charge/payment state through PSP endpoints.

For the gift flow, each present should become one Pix charge with:

- `txid`: unique identifier generated from gift id + timestamp;
- amount: fixed present value or custom amount;
- `solicitacaoPagador`: short text such as `Presente: Passeio na lua de mel`;
- `infoAdicionais`: gift id/title and site origin;
- webhook: update payment state when paid.

## What depends on the PSP/bank

Banco Central publishes rules/specification, but the application does not call Banco Central directly for the receiver's charge creation. The receiver's bank/PSP provides the actual API endpoint, credentials, certificates/OAuth model, webhook setup, limits, and operational rules.

Pending production data:

- Maria's final bank/PSP for Pix API;
- Maria's account type at that PSP: PF, PJ, or MEI;
- whether that PSP allows dynamic charge creation for her account type;
- OAuth/client credentials or certificate requirements;
- webhook callback URL requirements;
- homologation/sandbox access;
- whether payer information and reconciliation fields are exposed in the PSP response.

## Current readiness audit

Status: BLOCKED

The local environment does not currently configure:

- `PIX_PROVIDER`
- `PIX_KEY`
- `PIX_KEY_CPF` deprecated fallback only
- `PIX_STATIC_KEY`
- `PIX_MERCHANT_NAME`
- `PIX_MERCHANT_CITY`

The current route therefore cannot create a real dynamic Pix charge and must not mark any gift as paid. A CPF Pix key alone does not prove API access, webhook support, or authorization to create dynamic charges.

## Pix Parcelado

Do not promise installments in the gift UI yet.

Installment Pix offers are not a universal capability that this site can guarantee from the receiver CPF alone. In practice, installment/payment-credit experiences depend on payer institution, receiver PSP, or a PSP/acquirer product that explicitly offers installments/credit. Until the final PSP is known, the site should treat parcelamento as unavailable.

## Current implementation

Implemented now:

- Gift card CTA opens a Pix preparation modal.
- `POST /api/pix/charges` validates gift id, title, and amount.
- The route generates a `txid` and returns a simulation response.
- The response keeps gift/payment traceability without pretending a real QR exists.
- Server env abstraction is in place:

```env
PIX_PROVIDER=simulation
PIX_KEY=<configured server-side only>
PIX_KEY_CPF=<deprecated fallback only>
```

Future production adapter:

```ts
type PixProvider = {
  createCharge(input: {
    txid: string;
    amountCents: number;
    giftId: string;
    giftTitle: string;
    pixKey: string;
  }): Promise<{
    copyPaste: string;
    qrCodeImage: string;
    status: "pending";
    providerChargeId: string;
  }>;
};
```

## Production checklist

1. Choose Maria's bank/PSP.
2. Confirm Pix API access for her receiver account.
3. Configure credentials/certificates securely in hosting env vars.
4. Implement the provider adapter for that PSP.
5. Add a webhook endpoint, for example `POST /api/pix/webhooks/<provider>`.
6. Persist charge/payment state in a database or Google Sheet tab.
7. Show QR/copy-paste only when the PSP returns a real dynamic payload.
8. Test paid, expired, canceled, duplicate, and webhook retry states.

## Plan A: dynamic Pix charge adapter

Use this when Maria's actual bank or PSP confirms API access for the account that owns the receiver Pix key.

Required user/provider data:

- bank/PSP name;
- account type: PF, PJ, or MEI;
- receiver Pix key registered at that provider;
- production API base URL;
- sandbox/homologation API base URL, if available;
- OAuth client credentials or provider-specific credential set;
- certificate/mTLS files if required;
- webhook registration procedure;
- webhook signing secret or mTLS validation requirements;
- public HTTPS production URL for this site;
- persistence destination for a payment ledger.

Implementation shape:

1. Create a provider adapter in `src/lib/pix.ts` or `src/lib/pix/<provider>.ts`.
2. `POST /api/pix/charges` creates one charge per selected gift with fixed amount, `giftId`, `giftTitle`, `txid`, and description metadata.
3. The API returns only real PSP-provided QR/copia-e-cola data.
4. Add `POST /api/pix/webhooks/<provider>` to validate the webhook and update payment state.
5. Persist `paymentId`, `txid`, `giftId`, `amountCents`, `status`, provider payload hash, and timestamps.
6. UI shows `pending`, `paid`, `expired`, and error states based on real provider evidence only.

## Plan B: deploy today without dynamic API

Use this only if the provider is not chosen or credentials are not available today.

Temporary behavior:

- server-side configured static Pix key;
- fixed amount per gift;
- generated Pix copia-e-cola with amount and a best-effort reference/identifier;
- optional QR rendering after a QR generation dependency is approved;
- no automatic paid state;
- UI copy explicitly says payment confirmation is manual.

Required data:

- receiver Pix key;
- receiver/merchant name;
- receiver city;
- acceptance that the site will not know whether payment was completed.

Replacement path:

- Keep `giftId`, `amount`, and `txid/reference` in the API contract so Plan B can be replaced by Plan A without redesigning the gift UI.

## External PSP option

Mercado Pago is a possible quick PSP path, but it creates a Mercado Pago payment infrastructure and is not the same thing as using Maria's current bank account API directly. Official Mercado Pago documentation describes Pix payment creation through `POST /v1/payments` and payment notifications via Webhooks.

Banco do Brasil's official developer portal states its Pix API is for Pessoa Jurídica clients with an active Pix key at BB. Sicredi's public developer documentation describes Pix APIs with mTLS + OAuth2 and webhook support. Banco Central's Pix API repository defines the standardized PSP receiver API, including immediate charges and webhooks, but the site still integrates with the receiver PSP, not directly with DICT or Banco Central.

## Sources

- Banco Central Pix API repository: https://github.com/bacen/pix-api
- Banco Central Pix API OpenAPI specification: https://raw.githubusercontent.com/bacen/pix-api/master/openapi.yaml
- Banco Central Pix official area: https://www.bcb.gov.br/estabilidadefinanceira/pix
- Mercado Pago Pix payment documentation: https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix
- Mercado Pago Webhooks documentation: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- Banco do Brasil API Pix page: https://www.bb.com.br/site/developers/api-pix/
- Sicredi API general information: https://developers.sicredi.com.br/public/docs/general-information
