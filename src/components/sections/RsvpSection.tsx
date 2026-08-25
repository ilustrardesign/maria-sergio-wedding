"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { searchGuests, type GuestSelection, type RsvpSubmissionPayload } from "@/lib/guests";
import { submitRsvp } from "@/lib/rsvp";
import type { RsvpMode, WeddingContent } from "@/types/wedding";

import styles from "./RsvpSection.module.css";

type RsvpSectionProps = {
  content: WeddingContent;
};

type FieldName = "attendance" | "email" | "guests" | "phone";
type FieldErrors = Partial<Record<FieldName, string>>;
type SubmissionState = "idle" | "loading" | "demo" | "success" | "error";
type SearchState = "idle" | "loading" | "empty" | "error" | "results";

const validationOrder: FieldName[] = ["guests", "attendance", "phone", "email"];

const fieldErrorId = (field: FieldName) => `rsvp-${field}-error`;
const guestSearchId = "rsvp-guest-search";
const guestListboxId = "rsvp-guest-listbox";

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

function uniqueGuests(guests: GuestSelection[]) {
  const seen = new Set<string>();
  return guests.filter((guest) => {
    if (seen.has(guest.guestId)) return false;
    seen.add(guest.guestId);
    return true;
  });
}

export function RsvpSection({ content }: RsvpSectionProps) {
  const { rsvp } = content;
  const formRef = useRef<HTMLFormElement>(null);
  const guestInputRef = useRef<HTMLInputElement>(null);
  const [attendance, setAttendance] = useState<RsvpSubmissionPayload["attendance"] | "">("");
  const [selectedGuests, setSelectedGuests] = useState<GuestSelection[]>([]);
  const [guestQuery, setGuestQuery] = useState("");
  const [guestOptions, setGuestOptions] = useState<GuestSelection[]>([]);
  const [guestSearchState, setGuestSearchState] = useState<SearchState>("idle");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const mode = resolveMode(rsvp.defaultMode);
  const isLoading = submissionState === "loading";

  const guestQueryTrimmed = guestQuery.trim();
  const guestListMessage =
    guestQueryTrimmed.length === 0
      ? ""
      : guestQueryTrimmed.length < 2
        ? rsvp.labels.guestSearchMinimum
        : guestSearchState === "loading"
          ? rsvp.labels.guestSearchLoading
          : guestSearchState === "empty"
            ? rsvp.labels.guestSearchEmpty
            : guestSearchState === "error"
              ? rsvp.messages.guestSearchFailed
              : "";

  const clearSubmissionMessage = useCallback(() => {
    if (!isLoading && submissionState !== "idle") {
      setSubmissionState("idle");
      setStatusMessage("");
    }
  }, [isLoading, submissionState]);

  const clearFieldError = useCallback((field: FieldName) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const removeGuest = useCallback((guestId: string) => {
    setSelectedGuests((current) => current.filter((guest) => guest.guestId !== guestId));
    clearFieldError("guests");
    clearSubmissionMessage();
  }, [clearFieldError, clearSubmissionMessage]);

  const addGuest = useCallback((guest: GuestSelection) => {
    const isDuplicate = selectedGuests.some((selected) => selected.guestId === guest.guestId);
    if (isDuplicate) {
      setErrors((currentErrors) => ({ ...currentErrors, guests: rsvp.messages.guestSearchDuplicate }));
      return;
    }

    setSelectedGuests((current) => uniqueGuests([...current, guest]));
    setGuestQuery("");
    setGuestOptions([]);
    setGuestSearchState("idle");
    setHighlightedIndex(-1);
    clearFieldError("guests");
    clearSubmissionMessage();
    window.requestAnimationFrame(() => guestInputRef.current?.focus());
  }, [clearFieldError, clearSubmissionMessage, rsvp.messages.guestSearchDuplicate, selectedGuests]);

  useEffect(() => {
    const query = guestQueryTrimmed;
    if (query.length < 2) {
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setGuestSearchState("loading");
      try {
        const results = await searchGuests("/api/guests/search", query);
        if (cancelled) return;

        const filtered = results.filter((guest) => !selectedGuests.some((selected) => selected.guestId === guest.guestId));
        setGuestOptions(filtered);
        setGuestSearchState(filtered.length > 0 ? "results" : "empty");
        setHighlightedIndex(filtered.length > 0 ? 0 : -1);
      } catch {
        if (cancelled) return;
        setGuestOptions([]);
        setGuestSearchState("error");
        setHighlightedIndex(-1);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [guestQueryTrimmed, selectedGuests]);

  function validateForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const attendanceValue = formData.get("attendance");
    const message = String(formData.get("message") ?? "").trim();
    const nextErrors: FieldErrors = {};

    if (selectedGuests.length === 0) {
      nextErrors.guests = rsvp.messages.guestsRequired;
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
        message,
        phone,
        selectedGuestIds: selectedGuests.map((guest) => guest.guestId),
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

  function handleGuestKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && guestOptions.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, guestOptions.length - 1));
      return;
    }

    if (event.key === "ArrowUp" && guestOptions.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < guestOptions.length) {
        event.preventDefault();
        addGuest(guestOptions[highlightedIndex]);
        return;
      }

      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setGuestOptions([]);
      setGuestSearchState("idle");
      setHighlightedIndex(-1);
      return;
    }

    if (event.key === "Backspace" && !guestQuery && selectedGuests.length > 0) {
      event.preventDefault();
      removeGuest(selectedGuests[selectedGuests.length - 1].guestId);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const result = validateForm(event.currentTarget);
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
      setAttendance("");
      setSelectedGuests([]);
      setGuestQuery("");
      setGuestOptions([]);
      setGuestSearchState("idle");
      setHighlightedIndex(-1);
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

  const guestStatusClassName = [
    styles.guestStatus,
    guestSearchState !== "idle" ? styles[guestSearchState] : "",
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
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <div aria-hidden="true" className={styles.formOrnament}>
              <span />
            </div>

            <div className={styles.inviteLookup}>
              <div className={styles.guestField}>
                <label htmlFor={guestSearchId}>
                  {rsvp.labels.guestSearch}
                  <span aria-hidden="true" className={styles.requiredMark}>*</span>
                </label>

                <div
                  aria-controls={guestListboxId}
                  aria-expanded={guestSearchState === "results" && guestOptions.length > 0}
                  aria-haspopup="listbox"
                  className={styles.guestCombobox}
                  role="combobox"
                >
                  <div className={styles.selectedGuestWrap}>
                    {selectedGuests.map((guest) => (
                      <span className={styles.guestChip} key={guest.guestId}>
                        <span className={styles.guestChipLabel}>{guest.displayName}</span>
                        <button
                          aria-label={`${rsvp.labels.guestSearchRemove} ${guest.displayName}`}
                          className={styles.guestChipRemove}
                          onClick={() => removeGuest(guest.guestId)}
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    <input
                      aria-activedescendant={highlightedIndex >= 0 && highlightedIndex < guestOptions.length ? `${guestListboxId}-option-${guestOptions[highlightedIndex].guestId}` : undefined}
                      aria-describedby={[errors.guests ? fieldErrorId("guests") : null, "rsvp-guest-search-help", "rsvp-guest-search-status"]
                        .filter(Boolean)
                        .join(" ") || undefined}
                      aria-invalid={Boolean(errors.guests)}
                      autoComplete="off"
                      id={guestSearchId}
                      maxLength={80}
                      name="guestSearch"
                      onBlur={() => {
                        window.setTimeout(() => {
                          if (!document.activeElement || !document.activeElement.closest?.(`.${styles.guestCombobox}`)) {
                            setGuestOptions([]);
                            setGuestSearchState("idle");
                            setHighlightedIndex(-1);
                          }
                        }, 0);
                      }}
                      onChange={(event) => {
                        setGuestQuery(event.target.value);
                        clearFieldError("guests");
                        clearSubmissionMessage();
                      }}
                      onKeyDown={handleGuestKeyDown}
                      ref={guestInputRef}
                      spellCheck={false}
                      type="text"
                      value={guestQuery}
                    />
                  </div>
                </div>

                <p className={styles.fieldHint} id="rsvp-guest-search-help">{rsvp.labels.guestSearchHelp}</p>
                <p className={guestStatusClassName} id="rsvp-guest-search-status" aria-live="polite">
                  {guestListMessage}
                </p>
                <FieldError field="guests" message={errors.guests} />

                {guestQueryTrimmed.length >= 2 && guestSearchState === "results" && guestOptions.length > 0 ? (
                  <ul className={styles.guestListbox} id={guestListboxId} role="listbox">
                    {guestOptions.map((guest, index) => (
                      <li
                        aria-selected={index === highlightedIndex}
                        className={index === highlightedIndex ? styles.guestOptionActive : styles.guestOption}
                        id={`${guestListboxId}-option-${guest.guestId}`}
                        key={guest.guestId}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => addGuest(guest)}
                        role="option"
                      >
                        <span className={styles.guestOptionName}>{guest.displayName}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

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
