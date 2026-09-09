"use client";

import { useMemo, useState } from "react";
import { conferenceConfig } from "@/config/conference.config";
import { computeRegistrationAmount, getCurrentTierKey, tierLabel, gstBreakdown } from "@/lib/registration";
import { Arrow } from "@/components/site/SiteHeader";
import {
  validateRegistration,
  EMAIL_RE,
  PHONE_RE,
  NAME_RE,
  MCI_RE,
  PINCODE_RE,
  UTR_RE,
  normalisePhone,
} from "@/lib/validation/registration";

type Values = Record<string, any>;

const inputCls =
  "mt-2 w-full border border-[#b3122a]/25 bg-white px-3.5 py-3 text-[15px] text-[#160a0d] outline-none transition-colors placeholder:text-[#a08d92] focus:border-[#b3122a]";
const labelCls = "text-[13px] font-bold uppercase tracking-[.04em] text-[#5f0717]";

function Field({ label, required, children, hint, error, onBlur }: { label: string; required?: boolean; children: React.ReactNode; hint?: string; error?: string; onBlur?: () => void }) {
  return (
    <label className={`block ${error ? "[&_input]:border-[#b3122a] [&_select]:border-[#b3122a]" : ""}`} onBlur={onBlur}>
      <span className={labelCls}>
        {label} {required ? <span className="text-[#b3122a]">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12.5px] font-semibold leading-5 text-[#b3122a]">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12.5px] leading-5 text-[#7d656c]">{hint}</span>
      ) : null}
    </label>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--hair)] pt-8">
      <h2 className="flex items-baseline gap-3 text-[19px] font-extrabold uppercase tracking-[.01em] text-[#160a0d]">
        <span className="font-mono text-[12px] font-bold text-[#b3122a]">{n}</span> {title}
      </h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function RegisterForm() {
  const tierKey = useMemo(() => getCurrentTierKey(), []);
  const tier = tierLabel(tierKey);
  const acc = conferenceConfig.accommodation;
  const accommodationOffered = acc.enabled && acc.availableForTiers.includes(tierKey);
  const complimentaryStay = acc.complimentaryForTiers.includes(tierKey);

  const categories = conferenceConfig.registration.categories.filter(
    (c) => !["complimentary", "sponsored"].includes(c.key),
  );

  const [v, setV] = useState<Values>({
    title: conferenceConfig.registration.formFields.titles[0],
    country: "India",
    type: categories[0]?.key,
    paymentMethod: "bank-transfer",
    workshopOptIn: false,
    accommodationRequired: false,
    roomType: acc.defaultRoomType,
    checkIn: acc.checkInFrom,
    checkOut: acc.checkOutBy,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screenshot, setScreenshot] = useState<{ url: string; name: string } | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { registrationId: string; name: string; amount: number; emailDelivered: boolean }>(null);

  const set = (k: string, val: any) => setV((p) => ({ ...p, [k]: val }));

  /* Tell people the address is already registered while they are still on the
     field, rather than after they have filled the whole form and submitted. */
  async function checkEmailAvailable(value: string) {
    const email = value.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) { setEmailTaken(false); return; }
    setCheckingEmail(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      // The endpoint reports availability; treat anything unclear as available
      // so a network blip never blocks a legitimate registration.
      const taken = data?.exists === true || data?.available === false || data?.data?.exists === true;
      setEmailTaken(Boolean(taken));
    } catch {
      setEmailTaken(false);
    } finally {
      setCheckingEmail(false);
    }
  }

  async function uploadScreenshot(file: File) {
    setUploading(true);
    setErrors([]);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/payment-screenshot", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors([data.message || "Could not upload that image. Please try again."]);
        return;
      }
      setScreenshot({ url: data.data.url, name: file.name });
    } catch {
      setErrors(["Could not upload the screenshot. Check your connection and try again."]);
    } finally {
      setUploading(false);
    }
  }

  const selectedCategory = categories.find((c) => c.key === v.type);
  const singleRate = acc.singleRoomPerNight || 0;
  const nights = useMemo(() => {
    if (!v.accommodationRequired || !v.checkIn || !v.checkOut) return 0;
    const ms = Date.parse(`${v.checkOut}T00:00:00Z`) - Date.parse(`${v.checkIn}T00:00:00Z`);
    return Math.max(0, Math.round(ms / 86_400_000));
  }, [v.accommodationRequired, v.checkIn, v.checkOut]);

  const roomCharge =
    v.accommodationRequired && v.roomType !== acc.complimentaryRoomType ? nights * singleRate : 0;

  const price = useMemo(
    () => computeRegistrationAmount({ categoryKey: v.type }),
    [v.type],
  );
  const payable = price.total + roomCharge;
  const tax = gstBreakdown(payable);

  function validate(): string[] {
    // Same contract the server enforces, so the two can never disagree.
    const e = validateRegistration({
      email: v.email,
      password: v.password,
      profile: {
        firstName: v.firstName,
        lastName: v.lastName,
        phone: v.phone,
        designation: v.designation,
        specialization: v.specialization,
        institution: v.institution,
        mciNumber: v.mciNumber,
        address: { pincode: v.pincode },
      },
      registration: { type: v.type, membershipNumber: v.membershipNumber },
      payment: {
        method: v.paymentMethod,
        bankTransferUTR: v.utr,
        screenshotUrl: screenshot?.url,
      },
    });
    // Browser-only concerns the API cannot check
    if (v.password && v.password !== v.confirmPassword) e.push("Passwords do not match");
    if (!v.consent) e.push("Please accept the terms to continue");
    if (emailTaken) e.push("That email is already registered — please sign in instead");
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setAttempted(true);
    const e = validate();
    setErrors(e);
    if (e.length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (v.email || "").trim().toLowerCase(),
          password: v.password,
          profile: {
            title: v.title,
            firstName: (v.firstName || "").trim(),
            lastName: (v.lastName || "").trim(),
            phone: (v.phone || "").trim(),
            age: v.age || undefined,
            designation: v.designation,
            specialization: v.specialization || "",
            institution: (v.institution || "").trim(),
            mciNumber: (v.mciNumber || "").trim(),
            address: {
              street: v.street || "",
              city: v.city || "",
              state: v.state || "",
              country: v.country || "India",
              pincode: v.pincode || "",
            },
          },
          registration: {
            type: v.type,
            membershipNumber: v.membershipNumber || "",
            // The committee has not published tracks yet, so this records
            // interest only; allocation happens later.
            workshopSelections: v.workshopOptIn ? ["pre-conference-workshop"] : [],
            accommodation: accommodationOffered && v.accommodationRequired
              ? { required: true, roomType: v.roomType, checkIn: v.checkIn, checkOut: v.checkOut }
              : { required: false },
          },
          payment: {
            method: v.paymentMethod,
            bankTransferUTR: v.paymentMethod === "bank-transfer" ? (v.utr || "").trim() : undefined,
            screenshotUrl: v.paymentMethod === "bank-transfer" ? screenshot?.url : undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors([data.message || "Registration failed. Please try again."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setDone({
        registrationId: data.data.registrationId,
        name: data.data.name,
        amount: payable,
        emailDelivered: data.data.emailDelivered !== false,
      });
    } catch {
      setErrors(["Could not reach the server. Please check your connection and try again."]);
    } finally {
      setBusy(false);
    }
  }

  const bank = conferenceConfig.payment.bankDetails ?? { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branchName: '' };
  const bankReady = Boolean(bank.accountNumber && bank.ifscCode);

  // Per-field validation, evaluated live so each field can show its own message.
  const fieldErrors: Record<string, string> = {
    email: !v.email?.trim()
      ? "Email is required"
      : !EMAIL_RE.test(v.email.trim())
        ? "Enter a valid email address"
        : emailTaken
          ? "This email is already registered — sign in instead."
          : "",
    phone: !v.phone?.trim()
      ? "Phone number is required"
      : !PHONE_RE.test(normalisePhone(v.phone))
        ? "Enter a valid 10-digit Indian mobile number"
        : "",
    password: !v.password
      ? "Password is required"
      : v.password.length < 8
        ? "Password must be at least 8 characters"
        : "",
    confirmPassword: !v.confirmPassword
      ? "Please confirm your password"
      : v.confirmPassword !== v.password
        ? "Passwords do not match"
        : "",
    firstName: !v.firstName?.trim()
      ? "First name is required"
      : !NAME_RE.test(v.firstName.trim())
        ? "Letters only"
        : "",
    lastName: !v.lastName?.trim()
      ? "Last name is required"
      : !NAME_RE.test(v.lastName.trim())
        ? "Letters only"
        : "",
    designation: !v.designation ? "Designation is required" : "",
    specialization: !v.specialization?.trim()
      ? "Specialization is required"
      : v.specialization.trim().length < 2
        ? "Specialization looks too short"
        : "",
    institution: !v.institution?.trim()
      ? "Institution is required"
      : v.institution.trim().length < 3
        ? "Institution name looks too short"
        : "",
    mciNumber: v.mciNumber?.trim() && !MCI_RE.test(v.mciNumber.trim())
      ? "Medical registration number looks invalid"
      : "",
    pincode: v.pincode?.trim() && !PINCODE_RE.test(v.pincode.trim())
      ? "Enter a valid 6-digit PIN code"
      : "",
    type: !v.type ? "Select a registration category" : "",
    utr:
      v.paymentMethod === "bank-transfer"
        ? !v.utr?.trim()
          ? "UTR / transaction reference is required"
          : !UTR_RE.test(v.utr.trim())
            ? "UTR should be 6–30 letters or digits, no spaces"
            : ""
        : "",
    /* The screenshot is validated off the UPLOADED result, not the file input:
       a chosen file that failed to upload must NOT count as satisfied, or the
       secretariat receives a UTR with no proof attached. */
    screenshot:
      v.paymentMethod === "bank-transfer"
        ? uploading
          ? "Wait for the screenshot upload to finish"
          : !screenshot?.url
            ? "Payment screenshot is required"
            : ""
        : "",
  };
  const touch = (name: string) => setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
  const showErr = (name: string) => ((attempted || touched[name]) && fieldErrors[name]) || undefined;

  if (done) {
    return (
      <div className="mx-auto max-w-[720px]">
        <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#b3122a]">Registration received</p>
        <h1 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] font-black uppercase leading-[.95] tracking-[-.04em] text-[#160a0d]">
          Thank you, {done.name}.
        </h1>
        <div className="mt-7 border-l-2 border-[#b3122a] bg-white px-5 py-4">
          <p className={labelCls}>Your registration ID</p>
          <p className="mt-1 text-[clamp(1.3rem,3vw,2rem)] font-black tracking-[-.03em] text-[#b3122a]">{done.registrationId}</p>
          <p className="mt-2 text-[13px] text-[#614d53]">
            Amount payable: <strong className="text-[#160a0d]">₹{done.amount.toLocaleString("en-IN")}</strong> ({tier})
          </p>
        </div>

        {!done.emailDelivered ? (
          <div role="status" className="mt-6 border-l-2 border-[#b3122a] bg-[#f8e9ed] px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#b3122a]">Please save your registration ID</p>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#5f0717]">
              Your registration is <strong>confirmed and saved</strong>, but we could not send your confirmation email
              just now. Note the ID above, and the secretariat will follow up. Nothing further is needed from you.
            </p>
          </div>
        ) : null}

        <div className="mt-6 border border-[#b3122a]/15 bg-white p-5">
          <h2 className="font-mono text-[9px] uppercase tracking-[.2em] text-[#7d656c]">Completing your payment</h2>
          {bankReady ? (
            <dl className="mt-4 grid gap-2 text-[13px] sm:grid-cols-2">
              <div><dt className={labelCls}>Account name</dt><dd className="m-0 text-[#160a0d]">{bank.accountName}</dd></div>
              <div><dt className={labelCls}>Account number</dt><dd className="m-0 text-[#160a0d]">{bank.accountNumber}</dd></div>
              <div><dt className={labelCls}>Bank</dt><dd className="m-0 text-[#160a0d]">{bank.bankName}</dd></div>
              <div><dt className={labelCls}>IFSC</dt><dd className="m-0 text-[#160a0d]">{bank.ifscCode}</dd></div>
            </dl>
          ) : (
            <p className="mt-3 text-[13px] leading-[1.7] text-[#614d53]">
              Bank transfer details will be sent to <strong className="text-[#160a0d]">{v.email}</strong> shortly.
              Quote your registration ID <strong className="text-[#160a0d]">{done.registrationId}</strong> as the payment
              reference so we can match it to your registration.
            </p>
          )}
          <p className="mt-4 text-[12px] leading-[1.7] text-[#7d656c]">
            Your place is confirmed once the secretariat verifies the transfer. Questions:{" "}
            <a href={`mailto:${conferenceConfig.contact.email}`} className="text-[#b3122a]">{conferenceConfig.contact.email}</a>
          </p>
        </div>

        <a href="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#b3122a] px-6 font-mono text-[9px] font-medium uppercase tracking-[.15em] text-white no-underline">
          Back to the conference <Arrow />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="grid gap-8">
        {errors.length ? (
          <div role="alert" className="border-l-2 border-[#b3122a] bg-[#f8e9ed] px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-[#b3122a]">Please fix the following</p>
            <ul className="mt-2 list-disc pl-5 text-[13px] leading-[1.7] text-[#5f0717]">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        ) : null}

        <Section n="01" title="Account">
          <Field
            label="Email"
            required
            error={showErr("email")}
            hint={checkingEmail ? "Checking…" : undefined}
          >
            <input
              type="email"
              autoComplete="email"
              className={inputCls}
              value={v.email || ""}
              onChange={(e) => { set("email", e.target.value); if (emailTaken) setEmailTaken(false); }}
              onBlur={(e) => { touch("email"); checkEmailAvailable(e.target.value); }}
            />
          </Field>
          <Field label="Phone" required error={showErr("phone")} onBlur={() => touch("phone")} hint="10-digit mobile number."><input type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} className={inputCls} value={v.phone || ""} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" /></Field>
          <Field label="Password" required error={showErr("password")} onBlur={() => touch("password")} hint="At least 8 characters."><input type="password" autoComplete="new-password" className={inputCls} value={v.password || ""} onChange={(e) => set("password", e.target.value)} /></Field>
          <Field label="Confirm password" required error={showErr("confirmPassword")} onBlur={() => touch("confirmPassword")}><input type="password" autoComplete="new-password" className={inputCls} value={v.confirmPassword || ""} onChange={(e) => set("confirmPassword", e.target.value)} /></Field>
        </Section>

        <Section n="02" title="Personal details">
          <Field label="Title"><select className={inputCls} value={v.title} onChange={(e) => set("title", e.target.value)}>{conferenceConfig.registration.formFields.titles.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <div className="hidden sm:block" />
          <Field label="First name" required error={showErr("firstName")} onBlur={() => touch("firstName")}><input className={inputCls} value={v.firstName || ""} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field label="Last name" required error={showErr("lastName")} onBlur={() => touch("lastName")}><input className={inputCls} value={v.lastName || ""} onChange={(e) => set("lastName", e.target.value)} /></Field>
          <Field label="City"><input className={inputCls} value={v.city || ""} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><input className={inputCls} value={v.state || ""} onChange={(e) => set("state", e.target.value)} /></Field>
        </Section>

        <Section n="03" title="Professional details">
          <Field label="Designation" required error={showErr("designation")} onBlur={() => touch("designation")}>
            <select className={inputCls} value={v.designation || ""} onChange={(e) => { set("designation", e.target.value); touch("designation"); }}>
              <option value="">Select…</option>
              {conferenceConfig.registration.formFields.designations.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Specialization" required error={showErr("specialization")} onBlur={() => touch("specialization")}>
            <input className={inputCls} value={v.specialization || ""} onChange={(e) => set("specialization", e.target.value)} placeholder="e.g. Cardiothoracic Surgery" />
          </Field>
          <Field label="Institution / Hospital" required error={showErr("institution")} onBlur={() => touch("institution")}><input className={inputCls} value={v.institution || ""} onChange={(e) => set("institution", e.target.value)} /></Field>
          <Field label="Medical registration no. (MCI/NMC)" error={showErr("mciNumber")} onBlur={() => touch("mciNumber")}><input className={inputCls} value={v.mciNumber || ""} onChange={(e) => set("mciNumber", e.target.value)} /></Field>
        </Section>

        <Section n="04" title="Registration category">
          <Field label="Category" required error={showErr("type")} onBlur={() => touch("type")}>
            <select className={inputCls} value={v.type} onChange={(e) => set("type", e.target.value)}>
              {categories.map((c) => {
                const amt = computeRegistrationAmount({ categoryKey: c.key }).base;
                return <option key={c.key} value={c.key}>{c.label} — ₹{amt.toLocaleString("en-IN")}</option>;
              })}
            </select>
          </Field>
          {selectedCategory?.requiresMembership ? (
            <Field label="IACTS membership number" required><input className={inputCls} value={v.membershipNumber || ""} onChange={(e) => set("membershipNumber", e.target.value)} /></Field>
          ) : <div className="hidden sm:block" />}
          <div className="sm:col-span-2">
            {/* The checkbox was size-4 (16px) — far below the ~44px minimum
                touch target, which is why it read as unusably small on a phone.
                It is now 28px on mobile, and the whole 4-corner label row is the
                hit area. */}
            <label className="flex cursor-pointer items-start gap-3 border border-[#b3122a]/25 bg-white p-4 sm:gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-7 shrink-0 accent-[#b3122a] sm:size-5"
                checked={!!v.workshopOptIn}
                onChange={(e) => set("workshopOptIn", e.target.checked)}
              />
              <span>
                <span className="block text-[15px] font-semibold text-[#160a0d]">
                  I want to attend the pre-conference workshop (23 October)
                </span>
                <span className="mt-1 block text-[13px] leading-[1.6] text-[#614d53]">
                  Seats are limited. The programme is being finalised — we will write to you with the tracks and any
                  applicable charge once it is confirmed. You can change this later from your account.
                </span>
              </span>
            </label>
          </div>
        </Section>

        {accommodationOffered ? (
          <Section n="05" title="Accommodation">
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 border border-[#b3122a]/20 bg-white p-4">
                <input type="checkbox" className="mt-0.5 size-6 shrink-0 accent-[#b3122a] sm:size-5" checked={!!v.accommodationRequired} onChange={(e) => set("accommodationRequired", e.target.checked)} />
                <span>
                  <span className="block text-[14px] font-semibold text-[#160a0d]">I require accommodation at the venue</span>
                  <span className="mt-1 block text-[12px] leading-[1.6] text-[#614d53]">{acc.note}</span>
                </span>
              </label>
            </div>
            {v.accommodationRequired ? (
              <>
                <Field label="Check-in" hint={`Not before ${acc.checkInFrom}`}>
                  <input type="date" className={inputCls} min={acc.checkInFrom} max={acc.checkOutBy} value={v.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
                </Field>
                <Field label="Check-out" hint={`Not after ${acc.checkOutBy}`}>
                  <input type="date" className={inputCls} min={acc.checkInFrom} max={acc.checkOutBy} value={v.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
                </Field>
                <Field label="Room type" hint={singleRate ? `Single occupancy is ₹${singleRate.toLocaleString("en-IN")} per night extra.` : undefined}>
                  <select className={inputCls} value={v.roomType} onChange={(e) => set("roomType", e.target.value)}>
                    {acc.roomTypes.map((r) => (
                      <option key={r} value={r}>
                        {r === "sharing" ? "Twin sharing" : "Single"}
                        {complimentaryStay && r === acc.complimentaryRoomType
                          ? " — complimentary"
                          : r !== acc.complimentaryRoomType && singleRate
                            ? ` — ₹${singleRate.toLocaleString("en-IN")}/night`
                            : ""}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : null}
          </Section>
        ) : null}

        <Section n={accommodationOffered ? "06" : "05"} title="Payment">
          <div className="sm:col-span-2 grid gap-3">
            {conferenceConfig.payment.methods.bankTransfer ? (
              <label className="flex cursor-pointer items-start gap-3 border border-[#b3122a]/20 bg-white p-4">
                <input type="radio" name="pm" className="mt-0.5 size-4 accent-[#b3122a]" checked={v.paymentMethod === "bank-transfer"} onChange={() => set("paymentMethod", "bank-transfer")} />
                <span>
                  <span className="block text-[14px] font-semibold text-[#160a0d]">Bank transfer (NEFT / IMPS / UPI)</span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-[#614d53]">
                    {bankReady ? "Transfer the amount to the account below, then enter the reference." : "Account details will be sent to you by the secretariat."} Quote your registration ID / name as the reference.
                  </span>
                </span>
              </label>
            ) : null}
            {v.paymentMethod === "bank-transfer" && bankReady ? (
              <div className="border-l-4 border-[#b3122a] bg-[#f8e9ed] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b3122a]">Pay to this account</p>
                <div className="mt-3 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div><dt className={labelCls}>Account name</dt><dd className="m-0 text-[15px] font-semibold text-[#160a0d]">{bank.accountName}</dd></div>
                    <div><dt className={labelCls}>Account number</dt><dd className="m-0 text-[17px] font-bold tabular-nums tracking-wide text-[#160a0d]">{bank.accountNumber}</dd></div>
                    <div><dt className={labelCls}>Bank</dt><dd className="m-0 text-[15px] font-semibold text-[#160a0d]">{bank.bankName}</dd></div>
                    <div><dt className={labelCls}>IFSC</dt><dd className="m-0 text-[17px] font-bold tracking-wide text-[#160a0d]">{bank.ifscCode}</dd></div>
                    {bank.branchName ? <div className="sm:col-span-2"><dt className={labelCls}>Branch</dt><dd className="m-0 text-[15px] font-semibold text-[#160a0d]">{bank.branchName}</dd></div> : null}
                  </dl>
                  {/* UPI QR, supplied by the committee. Rendered on white at a
                      generous size because a QR shown small or on a tinted
                      background is one a phone camera struggles to lock onto. */}
                  <figure className="m-0 shrink-0 self-start border border-[#b3122a]/20 bg-white p-3">
                    <img
                      src="/payment/qr.png"
                      alt="UPI QR code for paying the registration fee"
                      width={200}
                      height={200}
                      className="block size-[200px] sm:size-[184px]"
                    />
                    <figcaption className="mt-2 max-w-[200px] text-center font-mono text-[9px] uppercase leading-[1.5] tracking-[.14em] text-[#6a545a]">
                      Scan to pay by UPI
                    </figcaption>
                  </figure>
                </div>
              </div>
            ) : null}
            {v.paymentMethod === "bank-transfer" ? (
              <div className="grid gap-4 border border-[#b3122a]/15 bg-white p-4 sm:grid-cols-2">
                <p className="sm:col-span-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#6a545a]">
                  Proof of payment
                </p>
                <Field label="UTR / Transaction reference" required error={showErr("utr")} onBlur={() => touch("utr")} hint="The reference from your NEFT, IMPS or UPI payment.">
                  <input className={inputCls} value={v.utr || ""} onChange={(e) => set("utr", e.target.value)} placeholder="e.g. UTR123456789" />
                </Field>
                <div>
                  <span className={labelCls}>
                    Payment screenshot <span className="text-[#b3122a]">*</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    aria-invalid={showErr("screenshot") ? true : undefined}
                    className="mt-1.5 block w-full text-[12px] text-[#614d53] file:mr-3 file:min-h-11 file:border-0 file:bg-[#b3122a] file:px-4 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-[.14em] file:text-white"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadScreenshot(f); touch("screenshot"); }}
                  />
                  <span className="mt-1 block text-[11px] leading-4 text-[#6a545a]">
                    {uploading ? "Uploading…" : screenshot ? `Attached: ${screenshot.name}` : "JPEG, PNG, GIF or WebP. Max 5 MB."}
                  </span>
                  {showErr("screenshot") ? (
                    <span role="alert" className="mt-1 block text-[11px] font-semibold leading-4 text-[#b3122a]">
                      {showErr("screenshot")}
                    </span>
                  ) : null}
                </div>
                <p className="sm:col-span-2 text-[11px] leading-[1.6] text-[#6a545a]">
                  Complete the transfer first, then enter its reference and attach the screenshot. Both are required so
                  the secretariat can match your payment.
                </p>
              </div>
            ) : null}

            <label className="mt-2 flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-0.5 size-6 shrink-0 accent-[#b3122a] sm:size-5" checked={!!v.consent} onChange={(e) => set("consent", e.target.checked)} />
              <span className="text-[12px] leading-[1.7] text-[#614d53]">
                I confirm the details above are correct and accept the{" "}
                <a href="/terms-conditions" className="text-[#b3122a] underline">terms</a>,{" "}
                <a href="/privacy-policy" className="text-[#b3122a] underline">privacy policy</a> and{" "}
                <a href="/refund-policy" className="text-[#b3122a] underline">refund policy</a>.
              </span>
            </label>
          </div>
        </Section>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-[78px]">
        {tierKey === "earlyBird" ? (
          <div className="mb-4 border-l-4 border-[#b3122a] bg-[#f8e9ed] px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#b3122a]">Early Bird rate active</p>
            <p className="mt-1 text-[clamp(1rem,1.6vw,1.25rem)] font-black uppercase leading-tight tracking-[-.01em] text-[#160a0d]">
              Until 27 September 2026
            </p>
          </div>
        ) : null}
        <div className="border border-[#b3122a]/15 bg-white p-5">
          <p className="text-[13px] font-bold uppercase tracking-[.06em] text-[#5f0717]">Your registration</p>
          <p className="mt-2 text-[15px] font-bold uppercase tracking-[.04em] text-[#b3122a]">{tier} rate</p>
          <ul className="mt-4 list-none space-y-2 p-0 text-[13px]">
            {price.lines.map((l) => (
              <li key={l.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--hair)] pb-2">
                <span className="text-[#614d53]">{l.label}</span>
                <span className="font-semibold tabular-nums text-[#160a0d]">₹{l.amount.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          {roomCharge > 0 ? (
            <div className="mt-2 flex items-baseline justify-between gap-3 border-b border-[var(--hair)] pb-2 text-[13px]">
              <span className="text-[#614d53]">Single room · {nights} night{nights === 1 ? "" : "s"}</span>
              <span className="font-semibold tabular-nums text-[#160a0d]">₹{roomCharge.toLocaleString("en-IN")}</span>
            </div>
          ) : null}

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[13px] font-bold uppercase tracking-[.08em] text-[#5f0717]">Total payable</span>
            <span className="text-[clamp(1.7rem,3.4vw,2.3rem)] font-black tabular-nums text-[#b3122a]">₹{payable.toLocaleString("en-IN")}</span>
          </div>
          {tax.enabled ? (
            <p className="mt-1.5 text-right font-mono text-[10px] uppercase tracking-[.12em] text-[#7d656c]">
              incl. {tax.label.replace(" (included)", "")} · ₹{tax.gst.toLocaleString("en-IN")}
            </p>
          ) : null}
          {complimentaryStay && v.accommodationRequired && v.roomType === acc.complimentaryRoomType ? (
            <p className="mt-3 border-t border-[var(--hair)] pt-3 text-[12px] leading-[1.6] text-[#614d53]">
              Includes complimentary twin-sharing accommodation.
            </p>
          ) : null}

          <button type="submit" disabled={busy} className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#b3122a] px-6 py-3.5 text-[14px] font-bold uppercase tracking-[.08em] text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {busy ? "Submitting…" : <>Complete registration <Arrow /></>}
          </button>
          <p className="mt-3 text-[11px] leading-[1.6] text-[#7d656c]">
            The final amount is confirmed by the secretariat. Prices are per the {tier.toLowerCase()} window.
          </p>
        </div>
      </aside>
    </form>
  );
}
