import { getAuthUser } from "@/lib/auth/get-auth-user"
import { redirect } from "next/navigation"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  try {
    await getAuthUser()
  } catch {
    redirect("/")
  }

  return <>{children}</>
}
