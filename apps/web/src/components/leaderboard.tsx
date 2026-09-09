import Link from "next/link";
import { InvertExceptRed } from "./invert-except-red";

interface LeaderboardEntry {
  userId: string;
  username: string;
  streak: number;
}

// Placeholder data until the journaling system exists and can supply real streaks.
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "mock-1", username: "User 1", streak: 14 },
  { userId: "mock-2", username: "User 2", streak: 11 },
  { userId: "mock-3", username: "User 3", streak: 9 },
  { userId: "mock-4", username: "User 4", streak: 7 },
  { userId: "mock-5", username: "User 5", streak: 5 },
];

export function Leaderboard({ entries = MOCK_LEADERBOARD }: { entries?: LeaderboardEntry[] }) {
  return (
    <div
      className="flex w-full flex-col gap-3"
      style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}
    >
      <h2 className="mb-1 text-xs font-bold uppercase tracking-widest opacity-60">
        Top Streaks
      </h2>

      {entries.slice(0, 5).map((entry, index) => (
        <div key={entry.userId} className="flex items-stretch">
          {/* chip-title: username, links to their public profile */}
          <Link
            data-dashboard-tile
            href={`/dashboard/profile/${entry.userId}`}
            className="relative block shrink-0 focus:outline-none"
            title={entry.username}
          >
            <InvertExceptRed
              src="/homescreen-assets/chip-title.png"
              alt=""
              width={350}
              height={105}
              className="block h-[105px] w-[350px] select-none"
              draggable={false}
            />
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-normal"
              style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}
            >
              {index + 1}
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center text-lg font-normal"
              style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}
            >
              {entry.username}
            </span>
          </Link>

          {/* chip-day: streak count, sits directly to the right of chip-title */}
          <div className="relative shrink-0" style={{ marginLeft: "8px", marginTop: "16px" }}>
            <InvertExceptRed
              src="/homescreen-assets/chip-day.png"
              alt=""
              width={78}
              height={71}
              className="block h-[71px] w-[78px] select-none"
              draggable={false}
            />
            <span
              className="absolute inset-x-0 top-1/2 flex -translate-y-[calc(50%+4px)] items-center justify-center text-lg font-normal"
              style={{ fontFamily: "'Ubuntu Sans Mono', monospace" }}
            >
              {entry.streak}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}