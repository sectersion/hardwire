export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  REVIEWER = "REVIEWER",
  SUPERADMIN = "SUPERADMIN",
}

export enum Tier {
  T1 = "T1",
  T2 = "T2",
  T3 = "T3",
}

export enum TierStatus {
  LOCKED = "LOCKED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export enum SubmissionType {
  DESIGN = "DESIGN",
  SIMULATION = "SIMULATION",
  GDS = "GDS",
  PCB = "PCB",
}

export enum SubStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
  APPROVED = "APPROVED",
}

export enum ShipStatus {
  PREPARING = "PREPARING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  roles: Role[]
  onboardComplete: boolean
}

export interface ProjectData {
  id: string
  name: string
  description: string | null
  repoUrl: string | null
  currentTier: Tier
}

export interface TierProgressData {
  tier: Tier
  status: TierStatus
  startedAt: string | null
  completedAt: string | null
}

export interface SubmissionData {
  id: string
  projectId: string
  tier: Tier
  type: SubmissionType
  title: string
  status: SubStatus
  createdAt: string
}
