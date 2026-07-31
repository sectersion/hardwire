"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditableProjectHeader({
  projectId,
  initialName,
  initialDescription,
  initialRepoUrl,
}: {
  projectId: string;
  initialName: string;
  initialDescription: string | null;
  initialRepoUrl: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, repoUrl }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">{name}</h1>
          {description && (
            <p className="text-[var(--muted)] mt-2">{description}</p>
          )}
          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm mt-3 border-2 px-3 py-1.5"
              style={{ borderColor: "var(--fg)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {repoUrl.replace("https://github.com/", "")}
            </a>
          ) : (
            <p className="text-xs text-[var(--muted)] mt-3 italic">
              No repository linked
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-sm font-bold uppercase tracking-widest border-2 px-4 py-2 shrink-0"
          style={{ borderColor: "var(--fg)" }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 p-6 mb-8" style={{ borderColor: "var(--fg)" }}>
      <label className="block text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
        Project name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-transparent border-2 px-3 py-2 font-display font-bold text-xl mb-4 outline-none"
        style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
      />

      <label className="block text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
        Description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full bg-transparent border-2 px-3 py-2 outline-none resize-none mb-4"
        style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
      />

      <label className="block text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
        Repository URL
      </label>
      <input
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="https://github.com/you/hardwire-project"
        className="w-full bg-transparent border-2 px-3 py-2 outline-none"
        style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
      />

      {error && <p className="text-sm mt-3 text-red-500">{error}</p>}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-bold uppercase tracking-widest px-5 py-2 disabled:opacity-50"
          style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setName(initialName);
            setDescription(initialDescription ?? "");
            setRepoUrl(initialRepoUrl ?? "");
            setEditing(false);
          }}
          className="text-sm font-bold uppercase tracking-widest border-2 px-5 py-2"
          style={{ borderColor: "var(--fg)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}