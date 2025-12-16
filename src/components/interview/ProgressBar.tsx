import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium text-foreground">{current} / {total} Questions</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-300",
              i < current ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
};
