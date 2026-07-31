const CACHET_BASE_URL = "https://cachet.dunkirk.sh";

export interface CachetUser {
  id: string;
  userId: string;
  displayName: string;
  pronouns?: string;
  imageUrl: string;
}

/**
 * Looks up a user's cached Slack profile info via Cachet
 * (https://cachet.dunkirk.sh). Returns null if the user has no
 * slackUserId on file, or if the lookup fails for any reason —
 * callers should always fall back to the real name in that case.
 */
export async function getCachetUser(
  slackUserId: string | null | undefined
): Promise<CachetUser | null> {
  if (!slackUserId) return null;

  try {
    const res = await fetch(`${CACHET_BASE_URL}/users/${slackUserId}`, {
      // Cachet itself caches Slack data for 7 days; we don't need to
      // hit it on every single request.
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return (await res.json()) as CachetUser;
  } catch {
    return null;
  }
}

/**
 * Convenience helper: returns the Slack display name if available,
 * otherwise falls back to "First Last".
 */
export function displayNameFor(
  user: { firstName: string; lastName: string },
  cachetUser: CachetUser | null
): string {
  return cachetUser?.displayName || `${user.firstName} ${user.lastName}`;
}