type TagType = "cuisine" | "difficulty" | "time" | "diet";

const tagStyles: Record<TagType, string> = {
  cuisine: "bg-orange-50 text-orange-600 border border-orange-100",
  difficulty: "bg-blue-50 text-blue-600 border border-blue-100",
  time: "bg-purple-50 text-purple-600 border border-purple-100",
  diet: "bg-green-50 text-green-600 border border-green-100",
};

type TagBadgeProps = {
  type: TagType;
  value: string;
};

export function TagBadge({ type, value }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${tagStyles[type]}`}
    >
      {value}
    </span>
  );
}
