import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <AuthCard title="Authentication Error" subtitle="Something went wrong during authentication">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-900">
              Authentication Failed
            </p>
            <p className="text-sm text-red-700">
              We couldn't complete your authentication request. This might be because:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1 mt-2">
              <li>The authentication link has expired</li>
              <li>The link was already used</li>
              <li>There was a problem with the authentication provider</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  )
}
