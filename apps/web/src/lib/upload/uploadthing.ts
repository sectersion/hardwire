import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getAuthUser } from "@/lib/auth/get-auth-user"

const f = createUploadthing()

const auth = async () => {
  const user = await getAuthUser()
  return { userId: user.id }
}

// One shared endpoint for all submission files — RTL, testbenches, sim output,
// synthesis/DRC reports, GDS, KiCad sources, gerbers, etc. None of these are
// images, so this uses "blob" (accepts any file type) not "image".
export const submissionFileRouter = {
  submissionFile: f({ blob: { maxFileSize: "64MB", maxFileCount: 10 } })
    .middleware(auth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url, name: file.name }
    }),
} satisfies FileRouter

export type SubmissionFileRouter = typeof submissionFileRouter