"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useTransition } from "react"

export function UserSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)
  const [, startTransition] = useTransition()

  function handleChange(next: string) {
    setValue(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next) {
      params.set("q", next)
    } else {
      params.delete("q")
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="search name, email, slack, hack club id…"
      className="w-full bg-transparent border-2 px-3 py-2 text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal focus:outline-none"
      style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
    />
  )
}