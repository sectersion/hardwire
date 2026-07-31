"use client"

import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react"
import type { SubmissionFileRouter } from "@/lib/upload/uploadthing"

export const UploadButton = generateUploadButton<SubmissionFileRouter>()
export const UploadDropzone = generateUploadDropzone<SubmissionFileRouter>()