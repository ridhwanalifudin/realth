"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, User, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/activities", label: "Activities", icon: Activity },
  { href: "/dashboard/add-activity", label: "Add", icon: Plus, highlight: true },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isHighlight = item.highlight

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
                isHighlight && "scale-110"
              )}
            >
              {isHighlight ? (
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary shadow-lg"
                >
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </motion.div>
              ) : (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-x-2 top-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
                  <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
