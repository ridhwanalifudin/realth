"use client"

import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-12 h-12 text-foreground/40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
          />
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-foreground mb-3">You're offline</h1>
      <p className="text-foreground/60 max-w-xs mb-2">
        No internet connection. Your cached activities are still available below.
      </p>
      <p className="text-foreground/40 text-sm mb-8">
        Any changes you make will sync automatically when you reconnect.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
