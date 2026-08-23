"use client";

import { useRef, useState, type FormEvent } from "react";

import { submitRsvp, type RsvpPayload } from "@/lib/rsvp";
import type { RsvpMode, WeddingContent } from "@/types/wedding";

import styles from "./RsvpSection.module.css";

type RsvpSectionProps = {
  content: WeddingContent;
};

type FieldName = keyof RsvpPayload;
type FieldErrors = Partial<Record<FieldName, string>>;
type SubmissionState = "idle" | "loading" | "demo" | "success" | "error";

const validationOrder: FieldName[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "attendance",
  "guestNames",
];

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

export function RsvpSection({ content }: RsvpSectionProps) {
  const { rsvp } = content;
  const formRef = useRef<HTMLFormElement>(null);
  const [attendance, setAttendance] = useState<RsvpPayload["attendance"] | "">("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const mode = resolveMode(rsvp.defaultMode);
  const isLoading = submissionState === "loading";

  function validate(form: HTMLFormElement) {
    const formData = new FormData(form);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const attendanceValue = formData.get("attendance");
    const guestNames = String(formData.get("guestNames") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const nextErrors: FieldErrors = {};

    if (!firstName) nextErrors.firstName = rsvp.messages.required;
    if (!lastName) nextErrors.lastName = rsvp.messages.required;

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

    if (attendanceValue === "yes" && !guestNames) {
      nextErrors.guestNames = rsvp.messages.required;
    }

    if (Object.keys(nextErrors).length > 0) {
      return { errors: nextErrors, payload: null };
    }

    return {
      errors: nextErrors,
      payload: {
        attendance: attendanceValue as RsvpPayload["attendance"],
        email,
        firstName,
        guestNames,
        lastName,
        message,
        phone,
      } satisfies RsvpPayload,
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

    if (target.name === "attendance" && target.value === "no") {
      setErrors((current) => {
        if (!current.guestNames) return current;
        const next = { ...current };
        delete next.guestNames;
        return next;
      });
    }

    if (!isLoading && submissionState !== "idle") {
      setSubmissionState("idle");
      setStatusMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const result = validate(event.currentTarget);
    setErrors(result.errors);

    if (!result.payload) {
      const firstMessage = validationOrder
        .map((field) => result.errors[field])
        .find(Boolean);
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

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="rsvp-first-name">
                  {rsvp.labels.firstName}
                  <span aria-hidden="true" className={styles.requiredMark}>*</span>
                </label>
                <input
                  aria-describedby={errors.firstName ? fieldErrorId("firstName") : undefined}
                  aria-invalid={Boolean(errors.firstName)}
                  autoComplete="given-name"
                  id="rsvp-first-name"
                  maxLength={80}
                  name="firstName"
                  required
                  type="text"
                />
                <FieldError field="firstName" message={errors.firstName} />
              </div>

              <div className={styles.field}>
                <label htmlFor="rsvp-last-name">
                  {rsvp.labels.lastName}
                  <span aria-hidden="true" className={styles.requiredMark}>*</span>
                </label>
                <input
                  aria-describedby={errors.lastName ? fieldErrorId("lastName") : undefined}
                  aria-invalid={Boolean(errors.lastName)}
                  autoComplete="family-name"
                  id="rsvp-last-name"
                  maxLength={80}
                  name="lastName"
                  required
                  type="text"
                />
                <FieldError field="lastName" message={errors.lastName} />
              </div>

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
            >
              <legend>
                {rsvp.labels.attendance}
                <span aria-hidden="true" className={styles.requiredMark}>*</span>
              </legend>
              <div className={styles.attendanceOptions}>
                <label className={styles.radioOption}>
                  <input
                    checked={attendance === "yes"}
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

            <div className={styles.fieldGrid}>
              <div className={[styles.field, styles.messageField, styles.wideField].join(" ")}>
                <label htmlFor="rsvp-guest-names">
                  {rsvp.labels.guestNames}
                  {attendance === "yes" ? (
                    <span aria-hidden="true" className={styles.requiredMark}>*</span>
                  ) : null}
                </label>
                <textarea
                  aria-describedby={errors.guestNames ? fieldErrorId("guestNames") : "rsvp-guest-names-help"}
                  aria-invalid={Boolean(errors.guestNames)}
                  disabled={attendance !== "yes"}
                  id="rsvp-guest-names"
                  maxLength={500}
                  name="guestNames"
                  required={attendance === "yes"}
                  rows={3}
                />
                <p className={styles.fieldHint} id="rsvp-guest-names-help">{rsvp.labels.guestNamesHelp}</p>
                <FieldError field="guestNames" message={errors.guestNames} />
              </div>
            </div>

            <div className={[styles.field, styles.messageField].join(" ")}>
              <label htmlFor="rsvp-message">{rsvp.labels.message}</label>
              <textarea id="rsvp-message" maxLength={800} name="message" rows={4} />
            </div>

            <div className={styles.actionRow}>
              <button className={styles.submitButton} disabled={isLoading} type="submit">
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
