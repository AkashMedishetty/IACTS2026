"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Mail, Send, QrCode, Loader2, Users } from "lucide-react"
import { toast } from "sonner"

export function ResendRegistrationDetails() {
  const [count, setCount] = useState<number | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState<"" | "count" | "test" | "all">("")
  const [result, setResult] = useState<string>("")

  const call = async (payload: any, kind: "count" | "test" | "all") => {
    setLoading(kind)
    setResult("")
    try {
      const res = await fetch("/api/admin/registrations/resend-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) { toast.error(data.message || "Failed"); return null }
      return data
    } catch {
      toast.error("Request failed")
      return null
    } finally {
      setLoading("")
    }
  }

  const preview = async () => {
    const d = await call({ dryRun: true }, "count")
    if (d) { setCount(d.total); toast.success(`${d.total} registrant(s) will receive the email`) }
  }

  const sendTest = async () => {
    if (!testEmail.includes("@")) { toast.error("Enter a valid test email"); return }
    const d = await call({ testEmail }, "test")
    if (d) { setResult(d.message); toast.success(`Test sent: ${d.message}`) }
  }

  const sendAll = async () => {
    const total = count ?? "all"
    if (!confirm(`Send the registration details + QR + brochure + WhatsApp email to ${total} registrant(s)? This cannot be undone.`)) return
    const d = await call({}, "all")
    if (d) { setResult(d.message + (d.errors ? `\n${d.errors.join("\n")}` : "")); toast.success(d.message) }
  }

  return (
    <Card className="border-2 border-[#C98500]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#002552] dark:text-white">
          <QrCode className="w-5 h-5 text-[#C98500]" />
          Re-send Registration Details to All
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Sends every confirmed registrant their <strong>Registration ID, QR code, brochure link, WhatsApp group link</strong> and
          key event details in one email. Use "Preview" to see how many will receive it, send a test to yourself first, then send to all.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={preview} disabled={!!loading} variant="outline" className="gap-2">
            {loading === "count" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Preview recipients{count !== null ? ` (${count})` : ""}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <Input
            type="email"
            placeholder="test@youremail.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={sendTest} disabled={!!loading} variant="outline" className="gap-2">
            {loading === "test" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send test
          </Button>
        </div>

        <Button onClick={sendAll} disabled={!!loading} className="gap-2 bg-[#002552] hover:bg-[#001B3D] text-white">
          {loading === "all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send to all registrants
        </Button>

        {result && (
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-gray-700 dark:text-gray-200">{result}</pre>
        )}
      </CardContent>
    </Card>
  )
}
