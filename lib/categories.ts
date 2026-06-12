import type { Category } from "./types";

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "arts-crafts", label: "Arts & Crafts", color: "bg-rose-100 text-rose-700" },
  { value: "photography", label: "Photography", color: "bg-violet-100 text-violet-700" },
  { value: "literature", label: "Literature", color: "bg-amber-100 text-amber-700" },
  { value: "poetry", label: "Poetry", color: "bg-pink-100 text-pink-700" },
  { value: "music", label: "Music", color: "bg-blue-100 text-blue-700" },
  { value: "tech-digital-skills", label: "Tech & Digital Skills", color: "bg-cyan-100 text-cyan-700" },
  { value: "test-prep-education", label: "Test Prep", color: "bg-orange-100 text-orange-700" },
  { value: "fitness", label: "Fitness", color: "bg-green-100 text-green-700" },
  { value: "kids-teens", label: "Kids & Teens", color: "bg-yellow-100 text-yellow-700" },
  { value: "careers", label: "Careers", color: "bg-indigo-100 text-indigo-700" },
];

export function getCategoryMeta(value: Category) {
  return CATEGORIES.find((c) => c.value === value);
}
