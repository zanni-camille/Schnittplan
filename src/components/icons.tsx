import type { LucideProps } from "lucide-react";
import { Scissors } from "lucide-react";

export const Icons = {
  Logo: (props: LucideProps) => (
    <div className="flex items-center gap-2" {...props}>
      <div className="bg-primary/20 text-primary rounded-lg p-2">
        <Scissors className="h-5 w-5" />
      </div>
      <span className="font-headline text-lg font-bold text-foreground">
        SchnittPlan
      </span>
    </div>
  ),
};
