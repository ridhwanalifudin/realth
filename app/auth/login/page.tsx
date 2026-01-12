"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthCard } from "@/components/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any email/password
      if (email && password) {
        localStorage.setItem("user", JSON.stringify({ email, id: "1" }))
        router.push("/dashboard")
      } else {
        setError("Please fill in all fields")
      }
    } catch (err) {
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your Realth account">
      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-foreground/50" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-foreground/50" />
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <Button disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </Button>

        <p className="text-center text-sm text-foreground/70">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.form>
    </AuthCard>
  )
}
