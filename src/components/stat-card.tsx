import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
}

export function StatCard({ title, value, icon, change }: StatCardProps) {
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
            <span className="text-green-600 font-semibold">{change}</span> vs last 24h
          </p>
        )}
      </CardContent>
    </Card>
  );
}
