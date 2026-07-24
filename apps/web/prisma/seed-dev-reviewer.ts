import { PrismaClient, Role } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "dev-reviewer@example.com" },
    update: {},
    create: {
      email: "dev-reviewer@example.com",
      firstName: "Dev",
      lastName: "Reviewer",
      hcaId: "dev-fake-hca-id-001", // fake, only works because this is local seed data
      roles: [Role.REVIEWER, Role.ADMIN],
      onboardComplete: true,
    },
  })

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    },
  })

  console.log("✅ Seeded dev user:", user.email)
  console.log("✅ Session ID (use this as your sessionId cookie value):")
  console.log(session.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())