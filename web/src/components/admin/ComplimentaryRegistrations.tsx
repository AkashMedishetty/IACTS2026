"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Gift, Upload, Loader2, FileSpreadsheet, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export function ComplimentaryRegistrations() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>("")

  // Re-send state
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCount, setResendCount] = useState<number | null>(null)
  const [resendMsg, setResendMsg] = useState<string>("")

  const previewResend = async () => {
    setResendLoading(true); setResendMsg("")
    try {
      const res = await fetch("/api/admin/registrations/complimentary/resend")
      const data = await res.json()
      if (!res.ok || !data.success) { toast.error(data.message || "Failed to load recipients"); return }
      setResendCount(data.count)
      toast.success(`${data.count} complimentary registrant(s) with an email will be re-sent`)
    } catch {
      toast.error("Failed to load recipients")
    } finally {
      setResendLoading(false)
    }
  }

  const doResend = async () => {
    if (!confirm(`Re-send registration email + QR to all complimentary registrants who have an email address? This uses the corrected website links.`)) return
    setResendLoading(true); setResendMsg("")
    try {
      let startIndex = 0
      let totalSent = 0
      let totalFailed = 0
      let total = 0
      let guard = 0
      while (true) {
        guard++
        if (guard > 200) break
        const res = await fetch("/api/admin/registrations/complimentary/resend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startIndex })
        })
        const data = await res.json()
        if (!res.ok || !data.success) { toast.error(data.message || "Re-send failed"); break }
        totalSent += data.sent || 0
        totalFailed += data.failed || 0
        total = data.total || total
        setResendMsg(`Sent ${totalSent}${totalFailed ? `, ${totalFailed} failed` : ""} of ${total}...`)
        if (data.done || data.nextIndex == null) {
          setResendMsg(`Done — re-sent ${totalSent}${totalFailed ? `, ${totalFailed} failed` : ""} of ${total}`)
          toast.success(`Re-sent ${totalSent} of ${total} complimentary emails`)
          break
        }
        startIndex = data.nextIndex
      }
    } catch {
      toast.error("Re-send failed")
    } finally {
      setResendLoading(false)
    }
  }

  const process = async () => {
    if (!file) { toast.error("Choose an Excel (.xlsx) file first"); return }
    if (!confirm("Create complimentary registrations from this file? Those with an email will be sent their confirmation + QR now.")) return
    setLoading(true); setSummary("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/registrations/complimentary", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.message || `Failed (${res.status})`)
        return
      }
      const total = res.headers.get("X-Total") || "?"
      const emailed = res.headers.get("X-Emailed") || "0"
      const noEmail = res.headers.get("X-No-Email") || "0"
      const errs = res.headers.get("X-Errors") || "0"
      // download the returned zip
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = "complimentary-registrations.zip"; a.click()
      URL.revokeObjectURL(url)
      const msg = `${total} created · ${emailed} emailed · ${noEmail} need WhatsApp${errs !== "0" ? ` · ${errs} errors` : ""}`
      setSummary(msg)
      toast.success("Done — ZIP downloaded. " + msg)
      setFile(null); if (inputRef.current) inputRef.current.value = ""
    } catch {
      toast.error("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-[#b3122a]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#160a0d] dark:text-white">
          <Gift className="w-5 h-5 text-[#b3122a]" />
          Complimentary Registrations (Excel → email + QR ZIP)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Upload an Excel of complimentary registrants (columns like <em>Name, Email, Phone/WhatsApp, Designation</em> — auto-detected).
          Each row gets a registration ID + QR. Rows <strong>with an email</strong> are emailed their confirmation + QR automatically.
          You'll get back a <strong>ZIP</strong> with a summary Excel and a QR image per registrant — use it to send the <strong>no-email</strong> ones over WhatsApp.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#b3122a] file:text-white file:font-semibold hover:file:bg-[#001B3D]"
        />
        {file && <p className="text-xs text-[#160a0d] dark:text-gray-300 flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4" />{file.name}</p>}

        <Button onClick={process} disabled={loading || !file} className="gap-2 bg-[#b3122a] hover:bg-[#c51a38] text-[#160a0d] font-bold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Process &amp; Download ZIP
        </Button>

        {summary && <p className="text-sm font-semibold text-[#160a0d] dark:text-gray-200">{summary}</p>}

        <div className="mt-2 rounded-lg border border-[#b3122a]/15 bg-[#b3122a]/[0.03] p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#160a0d] dark:text-gray-100">
            <RefreshCw className="w-4 h-4 text-[#b3122a]" />
            Re-send confirmation + QR (corrected links)
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Re-sends the registration email with QR to <strong>all complimentary registrants who have a real email</strong>
            (the no-email/WhatsApp ones are skipped). Use this to fix emails that went out with the wrong website link.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={previewResend} disabled={resendLoading} variant="outline" className="gap-2 border-[#b3122a] text-[#160a0d]">
              {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Preview recipients
            </Button>
            <Button onClick={doResend} disabled={resendLoading} className="gap-2 bg-[#b3122a] hover:bg-[#001B3D] text-white font-bold">
              {resendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Re-send now
            </Button>
            {resendCount !== null && <span className="text-xs text-[#160a0d] dark:text-gray-300">{resendCount} recipient(s)</span>}
          </div>
          {resendMsg && <p className="text-sm font-semibold text-green-700 dark:text-green-400">{resendMsg}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
