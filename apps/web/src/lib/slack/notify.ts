const webhookUrl = process.env.SLACK_WEBHOOK_URL

interface SlackMessage {
  text: string
  blocks?: unknown[]
}

async function sendSlackMessage(message: SlackMessage) {
  if (!webhookUrl) return
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
  } catch {
    // silently fail - slack is non-critical
  }
}

export async function notifyNewSubmission(submission: { title: string; tier: string; user: { firstName: string; lastName: string } }) {
  await sendSlackMessage({
    text: `New submission: ${submission.title}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*New Submission*\n*Project:* ${submission.title}\n*Tier:* ${submission.tier}\n*By:* ${submission.user.firstName} ${submission.user.lastName}`,
        },
      },
    ],
  })
}

export async function notifySubmissionReviewed(submission: { title: string; status: string }) {
  await sendSlackMessage({
    text: `Submission ${submission.title} reviewed: ${submission.status}`,
  })
}

export async function notifyShipmentUpdate(shipment: { id: string; status: string }) {
  await sendSlackMessage({
    text: `Shipment ${shipment.id} updated: ${shipment.status}`,
  })
}
