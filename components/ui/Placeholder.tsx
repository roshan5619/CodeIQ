import type { LucideIcon } from "lucide-react";

export default function Placeholder({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon size={24} />
        </div>
        <h2 className="font-display mb-2 text-lg font-semibold">{title}</h2>
        <p className="text-sm leading-relaxed text-mute">{body}</p>
      </div>
    </div>
  );
}
