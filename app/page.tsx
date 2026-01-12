"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, TrendingUp, Heart, Zap, Menu, X } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Realth</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-foreground/70 hover:text-foreground transition">
                Features
              </a>
              <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition">
                How it Works
              </a>
              <a href="#pricing" className="text-foreground/70 hover:text-foreground transition">
                Pricing
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-foreground">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login" className="text-foreground hover:text-primary transition font-medium">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden pb-4 border-t border-border"
            >
              <div className="flex flex-col gap-4 pt-4">
                <a href="#features" className="text-foreground/70">
                  Features
                </a>
                <a href="#how-it-works" className="text-foreground/70">
                  How it Works
                </a>
                <a href="#pricing" className="text-foreground/70">
                  Pricing
                </a>
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Link href="/auth/login" className="text-foreground hover:text-primary">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Track Your
                <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  {" "}
                  Fitness Progress
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
                Combine Strava running data with smartband metrics to get deeper insights into your fitness journey.
                Monitor VO2max, fitness level, and progress all in one place.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition inline-flex items-center justify-center gap-2"
              >
                Start Tracking Free
                <Zap size={20} />
              </Link>
              <a
                href="#how-it-works"
                className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:border-primary hover:text-primary transition"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Powerful Features
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Everything you need to understand and improve your running performance
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: Activity,
                title: "Strava Integration",
                description: "Automatically sync your running activities from Strava for seamless tracking",
              },
              {
                icon: Heart,
                title: "Heart Rate Tracking",
                description: "Input heart rate data from your smartband for complete fitness metrics",
              },
              {
                icon: TrendingUp,
                title: "VO2max Prediction",
                description: "Get AI-powered VO2max estimates based on your running data and biometrics",
              },
              {
                icon: Zap,
                title: "Fitness Level Assessment",
                description: "Understand your current fitness level with detailed analytics and comparisons",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-background border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-16 text-center"
          >
            How It Works
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "1",
                title: "Connect Strava",
                description: "Link your Strava account to automatically import your running activities",
              },
              {
                step: "2",
                title: "Add Health Data",
                description: "Input heart rate, weight, and other metrics from your smartband and scales",
              },
              {
                step: "3",
                title: "Get Insights",
                description: "View comprehensive analytics, predictions, and progress tracking in real-time",
              },
            ].map((item, index) => (
              <motion.div key={index} variants={itemVariants} className="relative text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-foreground/70">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Fitness Journey?
            </h2>
            <p className="text-lg text-foreground/70 mb-8">
              Start tracking your progress today with Realth's powerful fitness analytics
            </p>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition inline-block"
            >
              Get Started for Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-foreground/70">
          <p>&copy; 2026 Realth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
