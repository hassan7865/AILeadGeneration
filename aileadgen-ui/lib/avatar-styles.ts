import { cn } from "@/lib/utils";

/** Tailwind classes: saturated backgrounds + white text for small avatars. */
const AVATAR_PALETTE = [
  "bg-indigo-600 text-white",
  "bg-violet-600 text-white",
  "bg-fuchsia-600 text-white",
  "bg-rose-600 text-white",
  "bg-orange-600 text-white",
  "bg-amber-600 text-white",
  "bg-emerald-600 text-white",
  "bg-teal-600 text-white",
  "bg-cyan-600 text-white",
  "bg-sky-600 text-white",
  "bg-blue-600 text-white",
  "bg-slate-600 text-white",
] as const;

function fnv1aHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic “random” color from a string (same input → same classes). */
export function stringToAvatarClass(key: string): string {
  if (!key.trim()) return cn("bg-slate-500 text-white");
  const idx = fnv1aHash(key.toLowerCase()) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
