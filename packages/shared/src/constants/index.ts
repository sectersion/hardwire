import { Tier, SubmissionType } from "../types"

export const TIER_CONFIG: Record<
  string,
  { label: string; description: string; reward: string; submissionType: SubmissionType }
> = {
  [Tier.T1]: {
    label: "T1: Digital Logic",
    description: "Design and simulate a digital logic circuit",
    reward: "iCE40 FPGA Board",
    submissionType: SubmissionType.DESIGN,
  },
  [Tier.T2]: {
    label: "T2: ASIC Tapeout",
    description: "Complete synthesis and DRC pass for ASIC fabrication",
    reward: "ASIC Shuttle Slot",
    submissionType: SubmissionType.GDS,
  },
  [Tier.T3]: {
    label: "T3: Custom Carrier Board",
    description: "Design a custom PCB to carry your ASIC",
    reward: "PCB Fab & Test Components",
    submissionType: SubmissionType.PCB,
  },
}

export const TIER_ORDER: Tier[] = [Tier.T1, Tier.T2, Tier.T3]
