"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { searchGuests, type GuestSelection, type GuestAttendance, type RsvpSubmissionPayload } from "@/lib/guests";
import { submitRsvp } from "@/lib/rsvp";
import type { WeddingContent } from "@/types/wedding";

import styles from "./RsvpSection.module.css";

type RsvpSectionProps = {
  content: WeddingContent;
};

type FieldName = "email" | "guests" | "phone";
type FieldErrors = Partial<Record<FieldName, string>>;
type AttendanceErrors = Record<string, string>;
type SelectedGuest = GuestSelection & {
  attendance: GuestAttendance | null;
};
type SubmissionState = "idle" | "loading" | "demo" | "success" | "error";
type SearchState = "idle" | "loading" | "results" | "empty" | "error";
type SearchTone = "neutral" | "loading" | "warning" | "error" | "success";

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

function AttendanceOption({
  checked,
  ariaLabel,
  label,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  ariaLabel: string;
  label: string;
  name: string;
  onChange: (value: GuestAttendance) => void;
  value: GuestAttendance;
}) {
  return (
    <label className={styles.attendanceOption}>
      <input aria-label={ariaLabel} checked={checked} name={name} onChange={() => onChange(value)} type="radio" value={value} />
      <span>{label}</span>
    </label>
  );
}

export function RsvpSection({ content }: RsvpSectionProps) {
  const { rsvp } = content;
  const formRef = useRef<HTMLFormElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<SelectedGuest[]>([]);
  const [options, setOptions] = useState<GuestSelection[]>([]);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchTone, setSearchTone] = useState<SearchTone>("neutral");
  const [searchFeedback, setSearchFeedback] = useState(rsvp.labels.guestSearchHelp);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [attendanceErrors, setAttendanceErrors] = useState<AttendanceErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const queryTrimmed = query.trim();
  const isLoading = submissionState === "loading";

  const visibleSearchMessage = useMemo(() => {
    if (searchTone === "warning" && searchFeedback === "Selecione um nome da lista para adicioná-lo.") return searchFeedback;
    if (searchTone === "success" && searchFeedback !== rsvp.labels.guestSearchHelp) return searchFeedback;
    if (searchState === "loading") return rsvp.labels.guestSearchLoading;
    if (queryTrimmed.length === 0) return "";
    if (queryTrimmed.length < 2) return rsvp.labels.guestSearchMinimum;
    if (searchState === "empty") return `${rsvp.labels.guestSearchEmpty} Confira a escrita ou tente outro sobrenome.`;
    if (searchState === "error") return rsvp.messages.guestSearchFailed;
    return searchFeedback;
  }, [queryTrimmed.length, rsvp.labels.guestSearchEmpty, rsvp.labels.guestSearchHelp, rsvp.labels.guestSearchLoading, rsvp.labels.guestSearchMinimum, rsvp.messages.guestSearchFailed, searchFeedback, searchState, searchTone]);

  const isSearchInvalid = isFocused && queryTrimmed.length >= 2 && (searchState === "empty" || searchState === "error");

  const clearFieldError = useCallback((field: FieldName) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const clearSubmissionMessage = useCallback(() => {
    if (submissionState !== "idle" && !isLoading) {
      setSubmissionState("idle");
      setStatusMessage("");
    }
  }, [isLoading, submissionState]);

  const updateAttendance = useCallback((guestId: string, attendance: GuestAttendance) => {
    setSelectedGuests((current) => current.map((guest) => (guest.guestId === guestId ? { ...guest, attendance } : guest)));
    setAttendanceErrors((current) => {
      if (!current[guestId]) return current;
      const next = { ...current };
      delete next[guestId];
      return next;
    });
    clearFieldError("guests");
    clearSubmissionMessage();
  }, [clearFieldError, clearSubmissionMessage]);

  const removeGuest = useCallback((guestId: string) => {
    setSelectedGuests((current) => current.filter((guest) => guest.guestId !== guestId));
    setAttendanceErrors((current) => {
      if (!current[guestId]) return current;
      const next = { ...current };
      delete next[guestId];
      return next;
    });
    clearFieldError("guests");
    clearSubmissionMessage();
    setSearchFeedback("Convidado removido.");
    setSearchTone("success");
  }, [clearFieldError, clearSubmissionMessage]);

  const addGuest = useCallback((guest: GuestSelection) => {
    let duplicate = false;
    setSelectedGuests((current) => {
      if (current.some((selected) => selected.guestId === guest.guestId)) {
        duplicate = true;
        return current;
      }

      return [...current, { attendance: null, displayName: guest.displayName, guestId: guest.guestId }];
    });

    if (duplicate) {
      setSearchFeedback(rsvp.messages.guestSearchDuplicate);
      setSearchTone("warning");
      return;
    }

    setSearchFeedback(`${guest.displayName} foi adicionado.`);
    setSearchTone("success");

    setQuery("");
    setOptions([]);
    setSearchState("idle");
    setHighlightedIndex(-1);
    clearFieldError("guests");
    clearSubmissionMessage();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [clearFieldError, clearSubmissionMessage, rsvp.messages.guestSearchDuplicate]);

  useEffect(() => {
    const normalized = queryTrimmed;

    if (normalized.length === 0) {
      return;
    }

    if (normalized.length < 2) {
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setSearchState("loading");
      setSearchTone("loading");
      setSearchFeedback(rsvp.labels.guestSearchLoading);
      try {
        const results = await searchGuests("/api/guests/search", normalized);
        if (cancelled) return;

        const filtered = results.filter((guest) => !selectedGuests.some((selected) => selected.guestId === guest.guestId));
        setOptions(filtered);
        if (filtered.length === 0) {
          setSearchState("empty");
          setSearchTone("warning");
          setHighlightedIndex(-1);
          setSearchFeedback(`${rsvp.labels.guestSearchEmpty} Confira a escrita ou tente outro sobrenome.`);
          return;
        }

        setSearchState("results");
        setSearchTone("success");
        setHighlightedIndex(0);
        setSearchFeedback(rsvp.labels.guestSearchHelp);
      } catch {
        if (cancelled) return;
        setOptions([]);
        setSearchState("error");
        setSearchTone("error");
        setHighlightedIndex(-1);
        setSearchFeedback(rsvp.messages.guestSearchFailed);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [queryTrimmed, rsvp.labels.guestSearchEmpty, rsvp.labels.guestSearchHelp, rsvp.labels.guestSearchLoading, rsvp.messages.guestSearchFailed, selectedGuests]);

  const focusedGuest = highlightedIndex >= 0 && highlightedIndex < options.length ? options[highlightedIndex] : null;

  function validateForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const nextFieldErrors: FieldErrors = {};
    const nextAttendanceErrors: AttendanceErrors = {};
    let firstErrorSelector: string | null = null;

    if (selectedGuests.length === 0) {
      nextFieldErrors.guests = "Selecione pelo menos um convidado.";
      firstErrorSelector = `#${guestSearchId}`;
    }

    selectedGuests.forEach((guest) => {
      if (guest.attendance) return;
      nextAttendanceErrors[guest.guestId] = `Informe se ${guest.displayName} estará presente.`;
      if (!firstErrorSelector) {
        firstErrorSelector = `[name="attendance-${guest.guestId}"]`;
      }
    });

    if (!phone) {
      nextFieldErrors.phone = rsvp.messages.required;
      if (!firstErrorSelector) firstErrorSelector = "#rsvp-phone";
    } else {
      const phoneDigits = phone.replace(/\D/g, "");
      const phoneHasValidShape = /^[+\d][\d\s().-]*$/.test(phone);
      if (!phoneHasValidShape || phoneDigits.length < 8 || phoneDigits.length > 15) {
        nextFieldErrors.phone = rsvp.messages.invalidPhone;
        if (!firstErrorSelector) firstErrorSelector = "#rsvp-phone";
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextFieldErrors.email = rsvp.messages.invalidEmail;
      if (!firstErrorSelector) firstErrorSelector = "#rsvp-email";
    }

    if (Object.keys(nextFieldErrors).length > 0 || Object.keys(nextAttendanceErrors).length > 0) {
      return { errors: nextFieldErrors, attendanceErrors: nextAttendanceErrors, firstErrorSelector, payload: null };
    }

    return {
      attendanceErrors: nextAttendanceErrors,
      errors: nextFieldErrors,
      firstErrorSelector,
      payload: {
        email,
        guests: selectedGuests
          .filter((guest): guest is SelectedGuest & { attendance: GuestAttendance } => guest.attendance === "yes" || guest.attendance === "no")
          .map((guest) => ({ attendance: guest.attendance, guestId: guest.guestId })),
        message,
        phone,
      } satisfies RsvpSubmissionPayload,
    };
  }

  function focusFirstInvalidField(selector: string | null) {
    if (!selector) return;
    window.requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(selector)?.focus();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, options.length - 1));
      return;
    }

    if (event.key === "ArrowUp" && options.length > 0) {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (focusedGuest) {
        event.preventDefault();
        addGuest(focusedGuest);
        return;
      }

      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOptions([]);
      setSearchState("idle");
      setHighlightedIndex(-1);
      setSearchTone("neutral");
      return;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const result = validateForm(event.currentTarget);
    setFieldErrors(result.errors);
    setAttendanceErrors(result.attendanceErrors);

    if (!result.payload) {
      setSubmissionState("error");
      setStatusMessage(result.errors.guests || result.errors.phone || result.errors.email || Object.values(result.attendanceErrors)[0] || rsvp.messages.genericError);
      focusFirstInvalidField(result.firstErrorSelector);
      return;
    }

    setSubmissionState("loading");
    setStatusMessage(rsvp.labels.submitting);

    try {
      const submission = await submitRsvp(result.payload, "/api/rsvp");
      if (submission.mode === "demo") {
        setSubmissionState("demo");
        setStatusMessage(rsvp.messages.demo);
        return;
      }

      setSubmissionState("success");
      setStatusMessage(submission.emailNotificationSent && result.payload.email
        ? `${rsvp.messages.success} Enviamos uma confirmação para seu e-mail.`
        : rsvp.messages.success);
      formRef.current?.reset();
      setQuery("");
      setSelectedGuests([]);
      setOptions([]);
      setSearchState("idle");
      setSearchTone("neutral");
      setSearchFeedback(rsvp.labels.guestSearchHelp);
      setHighlightedIndex(-1);
      setAttendanceErrors({});
      setFieldErrors({});
    } catch {
      setSubmissionState("error");
      setStatusMessage(rsvp.messages.genericError);
    }
  }

  const statusClassName = [
    styles.status,
    submissionState !== "idle" ? styles[submissionState] : "",
  ].filter(Boolean).join(" ");

  const searchMessageClassName = [
    styles.searchStatus,
    styles[searchTone],
  ].filter(Boolean).join(" ");

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
          <form aria-busy={isLoading} className={styles.form} noValidate onSubmit={handleSubmit} ref={formRef}>
            <div aria-hidden="true" className={styles.formOrnament}>
              <span />
            </div>

            <div className={styles.searchBlock} ref={searchWrapRef}>
              <label className={styles.searchLabel} htmlFor={guestSearchId}>
                {rsvp.labels.guestSearch}
                <span aria-hidden="true" className={styles.requiredMark}>*</span>
              </label>
              <p className={styles.fieldHint} id="rsvp-guest-search-help">{rsvp.labels.guestSearchHelp}</p>

              <div className={styles.searchInputFrame}>
                <input
                  aria-activedescendant={focusedGuest ? `${guestListboxId}-option-${focusedGuest.guestId}` : undefined}
                  aria-controls={guestListboxId}
                  aria-expanded={options.length > 0 && (searchState === "results" || searchState === "loading")}
                  aria-describedby={[fieldErrors.guests ? fieldErrorId("guests") : null, "rsvp-guest-search-help", "rsvp-guest-search-status"].filter(Boolean).join(" ") || undefined}
                  aria-invalid={isSearchInvalid || Boolean(fieldErrors.guests)}
                  autoComplete="off"
                  id={guestSearchId}
                  maxLength={120}
                  aria-haspopup="listbox"
                  placeholder="Digite seu nome ou sobrenome"
                  role="combobox"
                  onBlur={() => {
                    window.setTimeout(() => {
                      if (searchWrapRef.current && !searchWrapRef.current.contains(document.activeElement)) {
                        setIsFocused(false);
                        if (queryTrimmed.length > 0) {
                          setQuery("");
                          setOptions([]);
                          setSearchState("idle");
                          setHighlightedIndex(-1);
                          setSearchTone("warning");
                          setSearchFeedback("Selecione um nome da lista para adicioná-lo.");
                        }
                      }
                    }, 0);
                  }}
                  onChange={(event) => {
                    setIsFocused(true);
                    const nextValue = event.target.value;
                    setQuery(nextValue);
                    const trimmed = nextValue.trim();
                    if (trimmed.length === 0) {
                      setOptions([]);
                      setSearchState("idle");
                      setHighlightedIndex(-1);
                      setSearchTone("neutral");
                      setSearchFeedback(rsvp.labels.guestSearchHelp);
                    } else if (trimmed.length < 2) {
                      setOptions([]);
                      setSearchState("idle");
                      setHighlightedIndex(-1);
                      setSearchTone("neutral");
                      setSearchFeedback(rsvp.labels.guestSearchMinimum);
                    } else {
                      setSearchTone("neutral");
                      setSearchFeedback(rsvp.labels.guestSearchHelp);
                    }
                    clearFieldError("guests");
                    clearSubmissionMessage();
                  }}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={handleKeyDown}
                  ref={inputRef}
                  spellCheck={false}
                  type="text"
                  value={query}
                />
              </div>

              <p aria-live="polite" className={searchMessageClassName} id="rsvp-guest-search-status" role="status">
                {visibleSearchMessage}
              </p>
              <FieldError field="guests" message={fieldErrors.guests} />

              {queryTrimmed.length >= 2 && options.length > 0 ? (
                <ul className={styles.guestListbox} id={guestListboxId} role="listbox">
                  {options.map((guest, index) => (
                    <li
                      aria-selected={index === highlightedIndex}
                      className={index === highlightedIndex ? styles.guestOptionActive : styles.guestOption}
                      id={`${guestListboxId}-option-${guest.guestId}`}
                      key={guest.guestId}
                      onClick={() => addGuest(guest)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      role="option"
                    >
                      <span className={styles.guestOptionName}>{guest.displayName}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className={styles.selectedGuestsSection}>
              <div className={styles.sectionHeading}>
                <p className={styles.cardLabel}>Pessoas selecionadas</p>
              </div>

              {selectedGuests.length === 0 ? (
                <p className={styles.emptySelection}>
                  Selecione um nome da lista para adicioná-lo.
                </p>
              ) : (
                <div className={styles.selectedGuestsList}>
                  {selectedGuests.map((guest) => (
                    <div className={styles.selectedGuestRow} key={guest.guestId}>
                      <div className={styles.selectedGuestHeader}>
                        <div className={styles.selectedGuestIdentity}>
                          <span aria-hidden="true" className={styles.selectedGuestMark}>✓</span>
                          <div>
                            <p className={styles.selectedGuestName}>{guest.displayName}</p>
                            <p className={styles.selectedGuestMeta}>Convidado confirmado na lista privada</p>
                          </div>
                        </div>
                        <button
                          aria-label={`Remover ${guest.displayName}`}
                          className={styles.removeGuestButton}
                          onClick={() => removeGuest(guest.guestId)}
                          type="button"
                        >
                          Remover
                        </button>
                      </div>

                      <fieldset className={styles.guestAttendanceFieldset}>
                        <legend>Confirme a presença</legend>
                        <div className={styles.guestAttendanceOptions}>
                          <AttendanceOption
                            checked={guest.attendance === "yes"}
                            ariaLabel={`${guest.displayName} - Estará presente`}
                            label="Estará presente"
                            name={`attendance-${guest.guestId}`}
                            onChange={(value) => updateAttendance(guest.guestId, value)}
                            value="yes"
                          />
                          <AttendanceOption
                            checked={guest.attendance === "no"}
                            ariaLabel={`${guest.displayName} - Não poderá comparecer`}
                            label="Não poderá comparecer"
                            name={`attendance-${guest.guestId}`}
                            onChange={(value) => updateAttendance(guest.guestId, value)}
                            value="no"
                          />
                        </div>
                        {attendanceErrors[guest.guestId] ? <p className={styles.fieldError}>{attendanceErrors[guest.guestId]}</p> : null}
                      </fieldset>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="rsvp-phone">
                  {rsvp.labels.phone}
                  <span aria-hidden="true" className={styles.requiredMark}>*</span>
                </label>
                <input
                  aria-describedby={fieldErrors.phone ? fieldErrorId("phone") : undefined}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  autoComplete="tel"
                  id="rsvp-phone"
                  inputMode="tel"
                  maxLength={25}
                  name="phone"
                  required
                  type="tel"
                />
                <FieldError field="phone" message={fieldErrors.phone} />
              </div>

              <div className={styles.field}>
                <label htmlFor="rsvp-email">{rsvp.labels.email}</label>
                <input
                  aria-describedby={fieldErrors.email ? fieldErrorId("email") : undefined}
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  id="rsvp-email"
                  maxLength={160}
                  name="email"
                  type="email"
                />
                <FieldError field="email" message={fieldErrors.email} />
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
