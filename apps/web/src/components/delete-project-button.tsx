"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACCENT = "#FF1500";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || data?.error || `Request failed (${res.status})`);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete — try again.");
      setDeleting(false);
      setConfirming(true);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm font-bold uppercase tracking-widest border-2 px-4 py-2"
        style={{ borderColor: "var(--muted)", color: "var(--muted)" }}
      >
        Delete project
      </button>
    );
  }

  return (
    <div className="border-2 p-4" style={{ borderColor: ACCENT }}>
      <p className="text-sm font-bold mb-3" style={{ color: ACCENT }}>
        Delete this project permanently? This can't be undone.
      </p>
      {error && (
        <p className="text-xs mb-3 font-mono opacity-80" style={{ color: ACCENT }}>
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50"
          style={{ backgroundColor: ACCENT, color: "#ffffff" }}
        >
          {deleting ? "Deleting..." : "Yes, delete it"}
        </button>
        <button
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={deleting}
          className="text-sm font-bold uppercase tracking-widest border-2 px-4 py-2"
          style={{ borderColor: "var(--fg)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}