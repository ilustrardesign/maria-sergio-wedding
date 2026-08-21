# RSVP integration

Este documento registra la integracion real prevista para el RSVP de Maria y Sergio.

## Modelo visible final

El formulario solicita solamente los datos necesarios para confirmar presencia:

- Timestamp
- Nome
- Sobrenome
- Telefone
- Email
- Presença
- Nomes dos convidados
- Recadinho para os noivos

La decision editorial vigente elimina por completo:

- quantidade de convidados
- acompanhantes como modelo de datos separado
- restrições alimentares
- alergias

El dato principal de invitados pasa a ser `guestNames`, mostrado al invitado como `Nomes dos convidados`.

## Payload de la aplicacion

```ts
type RsvpPayload = {
  attendance: "yes" | "no";
  email: string;
  firstName: string;
  guestNames: string;
  lastName: string;
  message: string;
  phone: string;
};
```

Para respuestas afirmativas, `guestNames` debe contener los nombres incluidos en la confirmacion. Para respuestas negativas, el campo puede enviarse vacio.

## Google Sheets

La hoja productiva creada para el proyecto es:

- Title: `RSVP - Casamento Maria e Sérgio - 31-10-2026`
- Spreadsheet ID: `1rAdwZRYdEnw6kGtwmSBFlOOkma6gD2vvYJXLUYjxYZ4`
- URL: `https://docs.google.com/spreadsheets/d/1rAdwZRYdEnw6kGtwmSBFlOOkma6gD2vvYJXLUYjxYZ4/edit?usp=drivesdk`
- Tab: `RSVP`

Encabezados activos:

```text
Timestamp | Nome | Sobrenome | Telefone | Email | Presença | Nomes dos convidados | Recadinho para os noivos
```

## Apps Script

La integracion productiva requiere un Web App con `doPost(e)` que:

- valide `RSVP_SHARED_SECRET`;
- valide el payload;
- abra la Sheet acumulativa;
- agregue una fila;
- envie notificacion con `MailApp`;
- retorne JSON de exito/error.

La implementacion de referencia actual esta en `artifacts/rsvp-production-checklist.md`.

## Variables

- `NEXT_PUBLIC_RSVP_MODE=endpoint`
- `RSVP_APPS_SCRIPT_URL`: endpoint publicado del Apps Script.
- `RSVP_SHARED_SECRET`: secreto compartido con Apps Script.
- `RSVP_NOTIFICATION_EMAIL`: email de notificacion.
