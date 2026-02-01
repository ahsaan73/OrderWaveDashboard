import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
}

export function StatCard({ title, value, icon, change }: StatCardProps) {
  const isPositive = change ? change.startsWith('+') : false;

  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-headline">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(
                "font-semibold",
                isPositive ? "text-green-600" : "text-destructive"
            )}>
              {change}
            </span> vs last 24h
          </p>
        )}
      </CardContent>
    </Card>
  );
}
