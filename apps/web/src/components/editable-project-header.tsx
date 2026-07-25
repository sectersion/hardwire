"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditableProjectHeader({
  projectId,
  initialName,
  initialDescription,
}: {
  projectId: string;
  initialName: string;
  initialDescription: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
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
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Couldn't save — try again.");
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
        className="w-full bg-transparent border-2 px-3 py-2 outline-none resize-none"
        style={{ borderColor: "var(--fg)", color: "var(--fg)" }}
      />

      {error && <p className="text-sm mt-2 text-red-500">{error}</p>}

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