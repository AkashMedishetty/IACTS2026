"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../ui/dialog"
import {
  CheckCircle2, Download, Loader2, Search, Undo2, Upload, UserCheck, Users, X,
} from "lucide-react"
import { useToast } from "../ui/use-toast"
import { getCategoryLabel } from "@/config/conference.config"

interface Attendee {
  id: string
  registrationId: string
  name: string
  email: string
  phone: string
  institution: string
  city: string
  type: string
  status: string
  source: string
  checkedIn: boolean
  checkedInAt: string | null
  checkedInBy: string
}

interface CheckInData {
  attendees: Attendee[]
  stats: { total: number; checkedIn: number; byType: Record<string, { total: number; checkedIn: number }> }
  serverTime: string
}

type Filter = "all" | "pending" | "in"

const fetcher = async (url: string): Promise<CheckInData> => {
  const res = await fetch(url, { cache: "no-store" })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to load")
  return json
}

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9@.\s]/g, " ").replace(/\s+/g, " ").trim()

/** Spelling-tolerant form for names typed at a busy desk: Sahir/Shahir,
 *  Sreekanth/Srikanth, Malllikarjuna/Mallikarjuna collapse together.
 *  Exact matches are still listed first. */
const sound = (s: string) => normalise(s)
  .replace(/h/g, "")
  .replace(/ee|ea|y/g, "i").replace(/oo|ou/g, "u").replace(/w/g, "v").replace(/z/g, "j")
  .replace(/ai|ay|ei/g, "e").replace(/au|ow/g, "o")
  .replace(/([a-z])\1+/g, "$1")

const timeIST = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }) : ""

export function CheckInDesk() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "admin"
  const { data, error, isLoading, mutate } = useSWR("/api/admin/checkin", fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [typeFilter, setTypeFilter] = useState("")
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [importOpen, setImportOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const stats = data?.stats

  const results = useMemo(() => {
    const attendees = data?.attendees || []
    const words = normalise(query).split(" ").filter(Boolean)
    const soundWords = sound(query).split(" ").filter((w) => w.length >= 2)
    const digits = query.replace(/\D/g, "")
    const exact: Attendee[] = []
    const close: Attendee[] = []
    for (const a of attendees) {
      if (filter === "in" && !a.checkedIn) continue
      if (filter === "pending" && a.checkedIn) continue
      if (typeFilter && a.type !== typeFilter) continue
      const text = `${a.name} ${a.email} ${a.registrationId} ${a.institution} ${a.city}`
      if (!words.length || words.every((w) => normalise(text).includes(w))) exact.push(a)
      else if (digits.length >= 4 && a.phone.replace(/\D/g, "").includes(digits)) exact.push(a)
      else if (soundWords.length && soundWords.every((w) => sound(text).includes(w))) close.push(a)
    }
    return [...exact, ...close]
  }, [data, query, filter, typeFilter])

  const shown = results.slice(0, 100)

  const setCheckIn = async (a: Attendee, checkedIn: boolean) => {
    setBusy((b) => ({ ...b, [a.id]: true }))
    // Optimistic: flip locally, the next poll confirms.
    mutate((d) => d && {
      ...d,
      attendees: d.attendees.map((x) => x.id === a.id
        ? { ...x, checkedIn, checkedInAt: checkedIn ? new Date().toISOString() : null }
        : x),
      stats: { ...d.stats, checkedIn: d.stats.checkedIn + (checkedIn === a.checkedIn ? 0 : checkedIn ? 1 : -1) },
    }, { revalidate: false })
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, checkedIn }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Failed")
      if (json.alreadyCheckedIn) {
        toast({ title: "Already checked in", description: `${a.name} entered at ${timeIST(json.checkIn?.checkedInAt)}` })
      } else {
        toast({ title: checkedIn ? "Entry marked" : "Entry undone", description: `${a.name} · ${a.registrationId}` })
      }
      if (checkedIn) {
        setQuery("")
        searchRef.current?.focus()
      }
    } catch (e: any) {
      toast({ title: "Could not update", description: e.message, variant: "destructive" })
    } finally {
      setBusy((b) => ({ ...b, [a.id]: false }))
      mutate()
    }
  }

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length === 1 && !results[0].checkedIn) setCheckIn(results[0], true)
    if (e.key === "Escape") setQuery("")
  }

  const pct = stats?.total ? Math.round((stats.checkedIn / stats.total) * 100) : 0
  const types = Object.entries(stats?.byType || {}).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="space-y-4">
      {/* Live count */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`inline-block h-2 w-2 rounded-full ${error ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                {error ? "Offline — retrying" : "Live"}
                {data?.serverTime && <span>· updated {timeIST(data.serverTime)}</span>}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="text-5xl font-bold tabular-nums">{stats?.checkedIn ?? "–"}</span>
                <span className="text-xl text-muted-foreground tabular-nums whitespace-nowrap">/ {stats?.total ?? "–"} checked in</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground tabular-nums">
                {stats ? `${stats.total - stats.checkedIn} yet to arrive · ${pct}%` : "Loading…"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="/api/admin/checkin/export?filter=checked-in"><Download className="h-4 w-4 mr-2" />Export checked in</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/api/admin/checkin/export"><Download className="h-4 w-4 mr-2" />Export all</a>
              </Button>
              {isAdmin && (
                <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />Import spot registrations
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {types.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {types.map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(typeFilter === key ? "" : key)}
                  className={`rounded-full border px-3 py-1 text-xs tabular-nums transition-colors ${
                    typeFilter === key ? "bg-foreground text-background" : "hover:bg-muted"
                  }`}
                >
                  {getCategoryLabel(key) || "Uncategorised"} · {t.checkedIn}/{t.total}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-background/95 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="Search name, phone, email or registration ID…"
            className="h-12 pl-10 pr-10 text-base"
            autoComplete="off"
            inputMode="search"
          />
          {query && (
            <button onClick={() => { setQuery(""); searchRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Clear search">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          {(["all", "pending", "in"] as Filter[]).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "pending" ? "Not arrived" : "Checked in"}
            </Button>
          ))}
          <span className="ml-auto text-muted-foreground tabular-nums">
            {results.length} {results.length === 1 ? "match" : "matches"}
            {results.length === 1 && !results[0].checkedIn && " · press Enter to mark"}
          </span>
        </div>
      </div>

      {/* Results */}
      {isLoading && !data ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : error && !data ? (
        <Card><CardContent className="p-6 text-center text-red-600">{error.message}</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {shown.map((a) => (
            <Card key={a.id} className={a.checkedIn ? "border-green-600/40 bg-green-50/60 dark:bg-green-950/20" : ""}>
              <CardContent className="p-3 md:p-4 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold truncate">{a.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">{a.registrationId}</Badge>
                    <Badge variant="secondary" className="text-xs">{getCategoryLabel(a.type)}</Badge>
                    {a.source === "spot" && <Badge className="text-xs bg-amber-500 hover:bg-amber-500">Spot</Badge>}
                    {a.status !== "confirmed" && a.status !== "paid" && (
                      <Badge variant="destructive" className="text-xs">{a.status}</Badge>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground truncate">
                    {[a.phone !== "N/A" && a.phone, a.email.endsWith(".local") ? "" : a.email, a.institution, a.city]
                      .filter(Boolean).join(" · ")}
                  </div>
                  {a.checkedIn && (
                    <div className="mt-1 text-xs text-green-700 dark:text-green-400">
                      Checked in {timeIST(a.checkedInAt)}{a.checkedInBy ? ` by ${a.checkedInBy}` : ""}
                    </div>
                  )}
                </div>
                {a.checkedIn ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                    <Button size="sm" variant="ghost" disabled={busy[a.id]} onClick={() => setCheckIn(a, false)} title="Undo entry">
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button className="shrink-0 h-11 bg-green-600 hover:bg-green-700 text-white" disabled={busy[a.id]}
                    onClick={() => setCheckIn(a, true)}>
                    {busy[a.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
                    Mark entry
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {results.length > shown.length && (
            <p className="text-center text-sm text-muted-foreground py-2">
              Showing first {shown.length} of {results.length} — keep typing to narrow down
            </p>
          )}
          {results.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No one matches “{query}”.
            </CardContent></Card>
          )}
        </div>
      )}

      {isAdmin && <SpotImportDialog open={importOpen} onOpenChange={setImportOpen} onDone={() => mutate()} />}
    </div>
  )
}

function SpotImportDialog({ open, onOpenChange, onDone }: {
  open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void
}) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [createAll, setCreateAll] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [running, setRunning] = useState(false)

  const reset = () => { setFile(null); setPreview(null) }

  const run = async (dryRun: boolean) => {
    if (!file) return
    setRunning(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("dryRun", dryRun ? "1" : "0")
      fd.append("createAllUnmatched", createAll ? "1" : "0")
      const res = await fetch("/api/admin/checkin/import", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Import failed")
      if (dryRun) {
        setPreview(json)
      } else {
        toast({
          title: "Import complete",
          description: `${json.created.length} spot registrations added`
            + (json.errors.length ? ` · ${json.errors.length} errors` : ""),
          variant: json.errors.length ? "destructive" : "default",
        })
        if (json.errors.length) console.error("Spot import errors", json.errors)
        onDone()
        reset()
        onOpenChange(false)
      }
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message, variant: "destructive" })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import spot registrations</DialogTitle>
          <DialogDescription>
            Upload the badge desk export (.xlsx). Spot (onsite) rows not already in the database are added.
            Everyone added starts as not checked in. You see a preview first — nothing is saved until you confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] || null); setPreview(null) }} />
          <div className="flex items-start gap-2">
            <Checkbox id="all" checked={createAll} onCheckedChange={(v) => { setCreateAll(!!v); setPreview(null) }} />
            <Label htmlFor="all" className="leading-snug font-normal">
              Also add non-spot rows that have no match here (normally leave off)
            </Label>
          </div>

          {preview && (
            <div className="rounded-md border p-3 text-sm space-y-2">
              <p><strong>{preview.rows}</strong> rows in file, <strong>{preview.spotRows}</strong> spot.</p>
              <p><strong>{preview.created.length}</strong> new registrations will be added.</p>
              <p><strong>{preview.matchedSpot.length}</strong> spot rows already exist here (skipped).</p>
              {preview.unmatchedImported.length > 0 && (
                <p className="text-amber-700 dark:text-amber-400">
                  {preview.unmatchedImported.length} non-spot rows have no match here and will be skipped.
                </p>
              )}
              {preview.created.length > 0 && (
                <div className="max-h-48 overflow-y-auto border-t pt-2">
                  {preview.created.map((c: any) => (
                    <div key={c.deskId} className="flex justify-between gap-2 py-0.5">
                      <span className="truncate">{c.name}</span>
                      <span className="text-muted-foreground shrink-0">{c.registrationId} · {getCategoryLabel(c.category)}</span>
                    </div>
                  ))}
                </div>
              )}
              {preview.unmatchedImported.length > 0 && (
                <details className="border-t pt-2">
                  <summary className="cursor-pointer">Unmatched non-spot rows</summary>
                  {preview.unmatchedImported.map((c: any) => (
                    <div key={c.deskId} className="py-0.5 text-muted-foreground">
                      {c.deskId} · {c.name} · {c.email} · {c.category}
                    </div>
                  ))}
                </details>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!preview ? (
            <Button disabled={!file || running} onClick={() => run(true)}>
              {running && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Preview
            </Button>
          ) : (
            <Button disabled={running} onClick={() => run(false)} className="bg-green-600 hover:bg-green-700 text-white">
              {running && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirm import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
