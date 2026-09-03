"use client";

import { useMemo, useState } from "react";
import { conferenceConfig } from "@/config/conference.config";
import { workshops as allWorkshops } from "@/config/pricing.config";
import { computeRegistrationAmount, getCurrentTierKey, tierLabel } from "@/lib/registration";
import { Arrow } from "@/components/site/SiteHeader";

type Values = Record<string, any>;

const inputCls =
  "mt-1.5 w-full border border-[#b3122a]/20 bg-white px-3 py-2.5 text-[14px] text-[#160a0d] outline-none transition-colors placeholder:text-[#a08d92] focus:border-[#b3122a]";
const labelCls = "font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]";

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label} {required ? <span className="text-[#b3122a]">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-4 text-[#7d656c]">{hint}</span> : null}
    </label>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--hair)] pt-7">
      <h2 className="flex items-baseline gap-3 font-mono text-[9px] uppercase tracking-[.2em] text-[#7d656c]">
        <span className="text-[#b3122a]">{n}</span> {title}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
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
    workshop: "",
    accommodationRequired: false,
    roomType: acc.defaultRoomType,
    checkIn: acc.checkInFrom,
    checkOut: acc.checkOutBy,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { registrationId: string; name: string; amount: number }>(null);

  const set = (k: string, val: any) => setV((p) => ({ ...p, [k]: val }));

  const selectedCategory = categories.find((c) => c.key === v.type);
  const price = useMemo(
    () => computeRegistrationAmount({ categoryKey: v.type, workshopSelections: v.workshop ? [v.workshop] : [] }),
    [v.type, v.workshop],
  );

  function validate(): string[] {
    const e: string[] = [];
    if (!v.email?.trim()) e.push("Email is required");
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.push("Email looks invalid");
    if (!v.password || v.password.length < 8) e.push("Password must be at least 8 characters");
    if (v.password !== v.confirmPassword) e.push("Passwords do not match");
    if (!v.firstName?.trim()) e.push("First name is required");
    if (!v.lastName?.trim()) e.push("Last name is required");
    if (!v.phone?.trim()) e.push("Phone number is required");
    if (!v.institution?.trim()) e.push("Institution is required");
    if (!v.designation) e.push("Designation is required");
    if (!v.mciNumber?.trim()) e.push("Medical registration (MCI/NMC) number is required");
    if (selectedCategory?.requiresMembership && !v.membershipNumber?.trim())
      e.push(`${selectedCategory.label} requires a membership number`);
    if (!v.consent) e.push("Please accept the terms to continue");
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (e.length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v.email.trim().toLowerCase(),
          password: v.password,
          profile: {
            title: v.title,
            firstName: v.firstName.trim(),
            lastName: v.lastName.trim(),
            phone: v.phone.trim(),
            age: v.age || undefined,
            designation: v.designation,
            specialization: v.specialization || "",
            institution: v.institution.trim(),
            mciNumber: v.mciNumber.trim(),
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
            workshopSelections: v.workshop ? [v.workshop] : [],
            accommodation: accommodationOffered && v.accommodationRequired
              ? { required: true, roomType: v.roomType, checkIn: v.checkIn, checkOut: v.checkOut }
              : { required: false },
          },
          payment: { method: v.paymentMethod },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors([data.message || "Registration failed. Please try again."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setDone({ registrationId: data.data.registrationId, name: data.data.name, amount: price.total });
    } catch {
      setErrors(["Could not reach the server. Please check your connection and try again."]);
    } finally {
      setBusy(false);
    }
  }

  const bank = conferenceConfig.payment.bankDetails ?? { accountName: '', accountNumber: '', bankName: '', ifscCode: '', branchName: '' };
  const bankReady = Boolean(bank.accountNumber && bank.ifscCode);

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
          <Field label="Email" required><input type="email" autoComplete="email" className={inputCls} value={v.email || ""} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone" required><input type="tel" autoComplete="tel" className={inputCls} value={v.phone || ""} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Password" required hint="At least 8 characters."><input type="password" autoComplete="new-password" className={inputCls} value={v.password || ""} onChange={(e) => set("password", e.target.value)} /></Field>
          <Field label="Confirm password" required><input type="password" autoComplete="new-password" className={inputCls} value={v.confirmPassword || ""} onChange={(e) => set("confirmPassword", e.target.value)} /></Field>
        </Section>

        <Section n="02" title="Personal details">
          <Field label="Title"><select className={inputCls} value={v.title} onChange={(e) => set("title", e.target.value)}>{conferenceConfig.registration.formFields.titles.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <div className="hidden sm:block" />
          <Field label="First name" required><input className={inputCls} value={v.firstName || ""} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field label="Last name" required><input className={inputCls} value={v.lastName || ""} onChange={(e) => set("lastName", e.target.value)} /></Field>
          <Field label="City"><input className={inputCls} value={v.city || ""} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><input className={inputCls} value={v.state || ""} onChange={(e) => set("state", e.target.value)} /></Field>
        </Section>

        <Section n="03" title="Professional details">
          <Field label="Designation" required>
            <select className={inputCls} value={v.designation || ""} onChange={(e) => set("designation", e.target.value)}>
              <option value="">Select…</option>
              {conferenceConfig.registration.formFields.designations.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Specialization"><input className={inputCls} value={v.specialization || ""} onChange={(e) => set("specialization", e.target.value)} /></Field>
          <Field label="Institution / Hospital" required><input className={inputCls} value={v.institution || ""} onChange={(e) => set("institution", e.target.value)} /></Field>
          <Field label="Medical registration no. (MCI/NMC)" required><input className={inputCls} value={v.mciNumber || ""} onChange={(e) => set("mciNumber", e.target.value)} /></Field>
        </Section>

        <Section n="04" title="Registration category">
          <Field label="Category" required>
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
            <Field label={`Pre-conference workshop — ${conferenceConfig.eventDate.start.split("-").reverse().join("/")}`} hint="Five parallel hands-on tracks, limited capacity. Optional.">
              <select className={inputCls} value={v.workshop} onChange={(e) => set("workshop", e.target.value)}>
                <option value="">No workshop</option>
                {allWorkshops.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}{w.amount ? ` — ₹${w.amount.toLocaleString("en-IN")}` : ""}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {accommodationOffered ? (
          <Section n="05" title="Accommodation">
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 border border-[#b3122a]/20 bg-white p-4">
                <input type="checkbox" className="mt-0.5 size-4 accent-[#b3122a]" checked={!!v.accommodationRequired} onChange={(e) => set("accommodationRequired", e.target.checked)} />
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
                <Field label="Room type">
                  <select className={inputCls} value={v.roomType} onChange={(e) => set("roomType", e.target.value)}>
                    {acc.roomTypes.map((r) => (
                      <option key={r} value={r}>{r === "sharing" ? "Twin sharing" : "Single"}{complimentaryStay && r === acc.complimentaryRoomType ? " — complimentary" : ""}</option>
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
                  <span className="mt-1 block text-[12px] leading-[1.6] text-[#614d53]">
                    {bankReady ? "Account details are shown after you submit." : "Account details will be sent to you by the secretariat."} Quote your registration ID as the reference.
                  </span>
                </span>
              </label>
            ) : null}
            <label className="flex cursor-pointer items-start gap-3 border border-[#b3122a]/20 bg-white p-4">
              <input type="radio" name="pm" className="mt-0.5 size-4 accent-[#b3122a]" checked={v.paymentMethod === "cash"} onChange={() => set("paymentMethod", "cash")} />
              <span>
                <span className="block text-[14px] font-semibold text-[#160a0d]">Pay at the registration desk</span>
                <span className="mt-1 block text-[12px] leading-[1.6] text-[#614d53]">Your place is held as pending until payment is received.</span>
              </span>
            </label>
            <label className="mt-2 flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-0.5 size-4 accent-[#b3122a]" checked={!!v.consent} onChange={(e) => set("consent", e.target.checked)} />
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
        <div className="border border-[#b3122a]/15 bg-white p-5">
          <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#7d656c]">Your registration</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#b3122a]">{tier} rate</p>
          <ul className="mt-4 list-none space-y-2 p-0 text-[13px]">
            {price.lines.map((l) => (
              <li key={l.label} className="flex items-baseline justify-between gap-3 border-b border-[var(--hair)] pb-2">
                <span className="text-[#614d53]">{l.label}</span>
                <span className="font-semibold tabular-nums text-[#160a0d]">₹{l.amount.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]">Total</span>
            <span className="text-[clamp(1.5rem,3vw,2rem)] font-black tabular-nums text-[#b3122a]">₹{price.total.toLocaleString("en-IN")}</span>
          </div>
          {complimentaryStay && v.accommodationRequired ? (
            <p className="mt-3 border-t border-[var(--hair)] pt-3 text-[12px] leading-[1.6] text-[#614d53]">
              Includes complimentary twin-sharing accommodation.
            </p>
          ) : null}

          <button type="submit" disabled={busy} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#b3122a] px-6 font-mono text-[9px] font-medium uppercase tracking-[.15em] text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60">
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
