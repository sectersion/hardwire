import { createRouteHandler } from "uploadthing/next"
import { submissionFileRouter } from "@/lib/upload/uploadthing"

export const { GET, POST } = createRouteHandler({
  router: submissionFileRouter,
})