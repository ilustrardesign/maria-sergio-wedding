"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { lookupInvite, normalizeInviteCode, type InviteLookupResponse, type RsvpSubmissionPayload } from "@/lib/invite";
import { submitRsvp } from "@/lib/rsvp";
import type { RsvpMode, WeddingContent } from "@/types/wedding";

import styles from "./RsvpSection.module.css";

type RsvpSectionProps = {
  content: WeddingContent;
};

type FieldName = "attendance" | "email" | "inviteCode" | "phone";
type FieldErrors = Partial<Record<FieldName, string>>;
type SubmissionState = "idle" | "loading" | "demo" | "success" | "error";
type InviteState = "idle" | "loading" | "valid" | "invalid";

const validationOrder: FieldName[] = ["inviteCode", "attendance", "phone", "email"];

const fieldErrorId = (field: FieldName) => `rsvp-${field}-error`;

function FieldError({ field, message }: { field: FieldName; message?: string }) {
  if (!message) return null;

  return (
    <p className={styles.fieldError} id={fieldErrorId(field)}>
      {message}
    </p>
  );
}

function resolveMode(defaultMode: RsvpMode): RsvpMode {
  const configuredMode = process.env.NEXT_PUBLIC_RSVP_MODE;
  return configuredMode === "demo" || configuredMode === "endpoint" ? configuredMode : defaultMode;
}

function firstName(displayName: string) {
  return displayName.split(/\s+/).filter(Boolean)[0] || displayName;
}

export function RsvpSection({ content }: RsvpSectionProps) {
  const { rsvp } = content;
  const formRef = useRef<HTMLFormElement>(null);
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const [inviteCode, setInviteCode] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("convite") ?? params.get("invite") ?? "";
  });
  const [validatedInviteCode, setValidatedInviteCode] = useState("");
  const [inviteRecord, setInviteRecord] = useState<InviteLookupResponse | null>(null);
  const [inviteState, setInviteState] = useState<InviteState>("idle");
  const [attendance, setAttendance] = useState<RsvpSubmissionPayload["attendance"] | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const didAutoLookupRef = useRef(false);

  const mode = resolveMode(rsvp.defaultMode);
  const isLoading = submissionState === "loading";
  const normalizedInviteCode = useMemo(() => normalizeInviteCode(inviteCode), [inviteCode]);
  const activeInvite = inviteRecord?.valid && validatedInviteCode === normalizedInviteCode ? inviteRecord : null;
  const inviteName = activeInvite?.valid ? firstName(activeInvite.displayName) : "";

  const clearSubmissionMessage = useCallback(() => {
    if (!isLoading && submissionState !== "idle") {
      setSubmissionState("idle");
      setStatusMessage("");
    }
  }, [isLoading, submissionState]);

  const performInviteLookup = useCallback(async (rawCode: string) => {
    const code = normalizeInviteCode(rawCode);
    setInviteState("loading");

    if (!code) {
      setInviteRecord(null);
      setValidatedInviteCode("");
      setInviteState("invalid");
      setStatusMessage(rsvp.messages.inviteRequired);
      return null;
    }

    if (!/^[A-Za-z0-9_-]{12,128}$/.test(code)) {
      setInviteRecord(null);
      setValidatedInviteCode("");
      setInviteState("invalid");
      setStatusMessage(rsvp.messages.invalidInvite);
      return null;
    }

    const result = await lookupInvite(code, "/api/invite/lookup");
    if (!result.valid) {
      setInviteRecord(null);
      setValidatedInviteCode("");
      setInviteState("invalid");
      setStatusMessage(result.message || rsvp.messages.invalidInvite);
      return null;
    }

    setInviteRecord(result);
    setValidatedInviteCode(code);
    setInviteState("valid");
    setStatusMessage(result.rsvpRequired ? `${firstName(result.displayName)}, ${rsvp.messages.inviteResolved}` : "Este convite não precisa de confirmação.");
    return result;
  }, [rsvp.messages.invalidInvite, rsvp.messages.inviteRequired, rsvp.messages.inviteResolved]);

  useEffect(() => {
    if (didAutoLookupRef.current || !inviteCode) return;
    didAutoLookupRef.current = true;
    void performInviteLookup(inviteCode);
  }, [inviteCode, performInviteLookup]);

  function validateForm(
    form: HTMLFormElement,
    invite: Extract<InviteLookupResponse, { valid: true }>,
  ) {
    const formData = new FormData(form);
    const inviteCodeValue = normalizeInviteCode(String(formData.get("inviteCode") ?? inviteCode));
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const attendanceValue = formData.get("attendance");
    const nextErrors: FieldErrors = {};

    if (!invite.valid) {
      nextErrors.inviteCode = inviteCodeValue ? rsvp.messages.invalidInvite : rsvp.messages.inviteRequired;
    } else if (!invite.rsvpRequired) {
      nextErrors.inviteCode = "Este convite não exige confirmação.";
    }

    const phoneDigits = phone.replace(/\D/g, "");
    const phoneHasValidShape = /^[+\d][\d\s().-]*$/.test(phone);
    if (!phone) {
      nextErrors.phone = rsvp.messages.required;
    } else if (!phoneHasValidShape || phoneDigits.length < 8 || phoneDigits.length > 15) {
      nextErrors.phone = rsvp.messages.invalidPhone;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = rsvp.messages.invalidEmail;
    }

    if (attendanceValue !== "yes" && attendanceValue !== "no") {
      nextErrors.attendance = rsvp.messages.required;
    }

    if (Object.keys(nextErrors).length > 0) {
      return { errors: nextErrors, payload: null };
    }

    return {
      errors: nextErrors,
      payload: {
        attendance: attendanceValue as RsvpSubmissionPayload["attendance"],
        email,
        guestId: invite.guestId,
        inviteCode: inviteCodeValue,
        message: String(formData.get("message") ?? "").trim(),
        phone,
      } satisfies RsvpSubmissionPayload,
    };
  }

  function focusFirstInvalidField(nextErrors: FieldErrors) {
    const firstInvalidField = validationOrder.find((field) => nextErrors[field]);
    if (!firstInvalidField) return;

    window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
        ?.focus();
    });
  }

  async function handleInviteValidation() {
    if (isLoading) return;
    await performInviteLookup(inviteCode);
    inviteInputRef.current?.focus();
  }

  function handleInviteCodeChange(value: string) {
    setInviteCode(value);
    if (validatedInviteCode && normalizeInviteCode(value) !== validatedInviteCode) {
      setInviteRecord(null);
      setValidatedInviteCode("");
      setInviteState("idle");
    }
    setErrors((current) => {
      if (!current.inviteCode) return current;
      const next = { ...current };
      delete next.inviteCode;
      return next;
    });
    clearSubmissionMessage();
  }

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const field = target.name as FieldName;

    if (field) {
      setErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    if (target.name === "attendance" && target.value) {
      setErrors((current) => {
        if (!current.attendance) return current;
        const next = { ...current };
        delete next.attendance;
        return next;
      });
    }

    clearSubmissionMessage();
  }

  async function ensureInviteReady(): Promise<Extract<InviteLookupResponse, { valid: true }> | null> {
    if (activeInvite) return activeInvite;
    if (!inviteCode.trim()) return null;
    const result = await performInviteLookup(inviteCode);
    return result && result.valid ? result : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const readyInvite = await ensureInviteReady();
    if (!readyInvite || !readyInvite.valid || !readyInvite.rsvpRequired) {
      setErrors({ inviteCode: readyInvite ? "Este convite não exige confirmação." : inviteCode.trim() ? rsvp.messages.invalidInvite : rsvp.messages.inviteRequired });
      setSubmissionState("error");
      setStatusMessage(readyInvite ? "Este convite não exige confirmação." : inviteCode.trim() ? rsvp.messages.invalidInvite : rsvp.messages.inviteRequired);
      focusFirstInvalidField({ inviteCode: readyInvite ? "Este convite não exige confirmação." : rsvp.messages.invalidInvite });
      return;
    }

    const result = validateForm(event.currentTarget, readyInvite);
    setErrors(result.errors);

    if (!result.payload) {
      const firstMessage = validationOrder.map((field) => result.errors[field]).find(Boolean);
      setSubmissionState("error");
      setStatusMessage(firstMessage ?? rsvp.messages.genericError);
      focusFirstInvalidField(result.errors);
      return;
    }

    setSubmissionState("loading");
    setStatusMessage(rsvp.labels.submitting);

    try {
      const submission = await submitRsvp(result.payload, mode === "endpoint" ? "/api/rsvp" : "");

      if (submission.mode === "demo") {
        setSubmissionState("demo");
        setStatusMessage(rsvp.messages.demo);
        return;
      }

      setSubmissionState("success");
      setStatusMessage(rsvp.messages.success);
      formRef.current?.reset();
      setInviteCode(normalizeInviteCode(inviteCode));
      setValidatedInviteCode(normalizeInviteCode(inviteCode));
      setInviteRecord(readyInvite);
      setAttendance("");
    } catch {
      setSubmissionState("error");
      setStatusMessage(rsvp.messages.genericError);
    }
  }

  const statusClassName = [
    styles.status,
    submissionState !== "idle" ? styles[submissionState] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inviteClassName = [
    styles.inviteStatus,
    inviteState !== "idle" ? styles[inviteState] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby="rsvp-title" className={styles.section} id="rsvp">
      <span aria-hidden="true" className={styles.backdropWord}>
        RSVP
      </span>

      <div className={styles.inner}>
        <header className={styles.introduction} data-reveal>
          <p className={styles.eyebrow}>{rsvp.eyebrow}</p>
          <h2 id="rsvp-title">{rsvp.title}</h2>
          <span aria-hidden="true" className={styles.introRule} />
          <p className={styles.introCopy}>{rsvp.introduction}</p>
        </header>

        <div className={styles.formFrame} data-reveal>
          <form
            aria-busy={isLoading}
            className={styles.form}
            noValidate
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div aria-hidden="true" className={styles.formOrnament}>
              <span />
            </div>

            <div className={styles.inviteLookup}>
              <div className={styles.field}>
                <label htmlFor="rsvp-invite-code">
                  {rsvp.labels.inviteCode}
                  <span aria-hidden="true" className={styles.requiredMark}>*</span>
                </label>
                <input
                  aria-describedby={errors.inviteCode ? fieldErrorId("inviteCode") : "rsvp-invite-code-help"}
                  aria-invalid={Boolean(errors.inviteCode)}
                  autoComplete="off"
                  id="rsvp-invite-code"
                  maxLength={128}
                  name="inviteCode"
                  onChange={(event) => handleInviteCodeChange(event.target.value)}
                  ref={inviteInputRef}
                  required
                  spellCheck={false}
                  type="text"
                  value={inviteCode}
                />
                <p className={styles.fieldHint} id="rsvp-invite-code-help">{rsvp.labels.inviteCodeHelp}</p>
                <FieldError field="inviteCode" message={errors.inviteCode} />
              </div>

              <button className={styles.validateButton} disabled={isLoading || inviteState === "loading"} onClick={handleInviteValidation} type="button">
                <span className={styles.buttonMark} aria-hidden="true" />
                <span>Validar convite</span>
              </button>

              <div className={inviteClassName} aria-live="polite">
                {inviteState === "valid" && activeInvite ? (
                  <>
                    <p className={styles.inviteEyebrow}>{inviteName ? `Olá, ${inviteName}.` : "Olá."}</p>
                    <p>{activeInvite.rsvpRequired ? rsvp.messages.inviteResolved : "Este convite não precisa de confirmação."}</p>
                  </>
                ) : (
                  <p>{statusMessage}</p>
                )}
              </div>
            </div>

            {activeInvite ? (
              <>
                <div className={styles.readOnlyCard}>
                  <label htmlFor="rsvp-canonical-name">
                    {rsvp.labels.canonicalName}
                  </label>
                  <input
                    id="rsvp-canonical-name"
                    readOnly
                    value={activeInvite.displayName}
                  />
                  <p className={styles.fieldHint}>{rsvp.labels.canonicalNameHelp}</p>
                </div>

                {activeInvite.dependents.length > 0 ? (
                  <div className={styles.readOnlyCard}>
                    <p className={styles.cardLabel}>Este convite também inclui:</p>
                    <ul className={styles.dependentsList}>
                      {activeInvite.dependents.map((dependent) => (
                        <li key={dependent.guestId}>{dependent.displayName}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="rsvp-phone">
                  {rsvp.labels.phone}
                  <span aria-hidden="true" className={styles.requiredMark}>*</span>
                </label>
                <input
                  aria-describedby={errors.phone ? fieldErrorId("phone") : undefined}
                  aria-invalid={Boolean(errors.phone)}
                  autoComplete="tel"
                  id="rsvp-phone"
                  inputMode="tel"
                  maxLength={25}
                  name="phone"
                  required
                  type="tel"
                />
                <FieldError field="phone" message={errors.phone} />
              </div>

              <div className={styles.field}>
                <label htmlFor="rsvp-email">{rsvp.labels.email}</label>
                <input
                  aria-describedby={errors.email ? fieldErrorId("email") : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  id="rsvp-email"
                  maxLength={160}
                  name="email"
                  type="email"
                />
                <FieldError field="email" message={errors.email} />
              </div>
            </div>

            <fieldset
              aria-describedby={errors.attendance ? fieldErrorId("attendance") : undefined}
              className={styles.attendanceFieldset}
              disabled={!activeInvite?.rsvpRequired}
            >
              <legend>
                {rsvp.labels.attendance}
                <span aria-hidden="true" className={styles.requiredMark}>*</span>
              </legend>
              <div className={styles.attendanceOptions}>
                <label className={styles.radioOption}>
                  <input
                    checked={attendance === "yes"}
                    disabled={!activeInvite?.rsvpRequired}
                    name="attendance"
                    onChange={() => setAttendance("yes")}
                    required
                    type="radio"
                    value="yes"
                  />
                  <span>{rsvp.labels.attendanceYes}</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    checked={attendance === "no"}
                    disabled={!activeInvite?.rsvpRequired}
                    name="attendance"
                    onChange={() => setAttendance("no")}
                    required
                    type="radio"
                    value="no"
                  />
                  <span>{rsvp.labels.attendanceNo}</span>
                </label>
              </div>
              <FieldError field="attendance" message={errors.attendance} />
            </fieldset>

            <div className={[styles.field, styles.messageField].join(" ")}>
              <label htmlFor="rsvp-message">{rsvp.labels.message}</label>
              <textarea id="rsvp-message" maxLength={800} name="message" rows={4} />
            </div>

            <div className={styles.actionRow}>
              <button className={styles.submitButton} disabled={isLoading || !activeInvite?.rsvpRequired} type="submit">
                <span aria-hidden="true" className={styles.buttonMark} />
                <span>{isLoading ? rsvp.labels.submitting : rsvp.labels.submit}</span>
              </button>

              <div
                aria-atomic="true"
                aria-live={submissionState === "error" ? "assertive" : "polite"}
                className={statusClassName}
                id="rsvp-status"
                role={submissionState === "error" ? "alert" : "status"}
              >
                {statusMessage}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
