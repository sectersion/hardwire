"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const ACCENT = "#FF1500"

const STEPS = [
  {
    kicker: "welcome",
    title: "you're in.",
    body: "hardwire takes you from a digital logic design all the way to real, fabricated silicon. let's show you around before you start.",
  },
  {
    kicker: "explore",
    title: "see what others are building.",
    body: "the explore page shows live activity from the whole community — projects, tiers, and what people are shipping right now.",
  },
  {
    kicker: "docs",
    title: "stuck? docs has you covered.",
    body: "every tier has a full requirements checklist and guides for what a good submission actually looks like.",
  },
  {
    kicker: "shop",
    title: "complete a tier, earn real rewards.",
    body: "finish T1 and unlock an iCE40 FPGA board. keep going and you're on the path to real ASIC fabrication.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [finishing, setFinishing] = useState(false)
  const isLastStep = step === STEPS.length - 1

  function goNext() {
    if (isLastStep) {
      handleFinish()
      return
    }
    setDirection(1)
    setStep((s) => s + 1)
  }

  function goBack() {
    if (step === 0) return
    setDirection(-1)
    setStep((s) => s - 1)
  }

  async function handleFinish() {
    setFinishing(true)
    try {
      const res = await fetch("/api/auth/complete-onboarding", { method: "POST" })
      if (!res.ok) throw new Error()
      router.push("/dashboard/new")
    } catch {
      // even if this fails, don't trap the user — send them forward and let
      // the dashboard's own onboardComplete check catch it on next load
      router.push("/dashboard/new")
    }
  }

  const current = STEPS[step]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#000000", color: "#ffffff" }}
    >
      {/* Progress dots */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 transition-all duration-300"
            style={{
              width: i === step ? "32px" : "8px",
              backgroundColor: i <= step ? ACCENT : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md text-center overflow-hidden">
        <div
          key={step}
          style={{
            animation: `slide-in-${direction === 1 ? "right" : "left"} 0.35s ease`,
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: ACCENT }}
          >
            {current.kicker}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold lowercase mb-4 leading-tight">
            {current.title}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {current.body}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-12 w-full max-w-md">
        {step > 0 && (
          <button
            onClick={goBack}
            className="px-6 py-3 font-bold border-2 transition-colors"
            style={{ borderColor: "#ffffff" }}
          >
            back
          </button>
        )}
        <button
          onClick={goNext}
          disabled={finishing}
          className="flex-1 py-3 font-bold border-2 transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#ffffff", color: "#000000", borderColor: "#ffffff" }}
        >
          {isLastStep ? (finishing ? "starting..." : "start your first project") : "next"}
        </button>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}