"use client";

import { Card, CardContent } from "@/components/ui/card";

export type ActivityItem = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  iconBg: string;
  iconColor: string;
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Activité récente</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En direct
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-500"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`w-8 h-8 rounded-full grid place-items-center flex-shrink-0 ${item.iconBg} ${item.iconColor}`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.title}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground/70 mt-0.5">
                  {item.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
