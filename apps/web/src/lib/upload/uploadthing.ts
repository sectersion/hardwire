import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getAuthUser } from "@/lib/auth/get-auth-user"

const f = createUploadthing()

export const submissionFileRouter = {
  t1Design: f({ image: { maxFileSize: "16MB" } })
    .middleware(async () => {
      const user = await getAuthUser()
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId }
    }),
  t1Simulation: f({ image: { maxFileSize: "16MB" } })
    .middleware(async () => {
      const user = await getAuthUser()
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId }
    }),
  t2Gds: f({ blob: { maxFileSize: "64MB" } })
    .middleware(async () => {
      const user = await getAuthUser()
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId }
    }),
  t3Pcb: f({ blob: { maxFileSize: "32MB" } })
    .middleware(async () => {
      const user = await getAuthUser()
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type SubmissionFileRouter = typeof submissionFileRouter
