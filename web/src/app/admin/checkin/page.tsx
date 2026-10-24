"use client"

import Link from "next/link"
import { ProtectedRoute } from "../../../components/auth/ProtectedRoute"
import { CheckInDesk } from "../../../components/admin/CheckInDesk"

/** Entry desk. Open to admins and managers (operations staff). */
export default function CheckInPage() {
  return (
    <ProtectedRoute requiredRole="manager">
      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-4xl px-4 py-4 md:py-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Entry Check-in</h1>
              <p className="text-sm text-muted-foreground">Search a delegate and mark their entry</p>
            </div>
            <Link href="/admin" className="text-sm text-muted-foreground hover:underline">Admin</Link>
          </div>
          <CheckInDesk />
        </main>
      </div>
    </ProtectedRoute>
  )
}
