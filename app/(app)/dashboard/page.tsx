import { BarChart3 } from "lucide-react";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Placeholder
      icon={BarChart3}
      title="Analytics Dashboard"
      body="Quality scores, complexity trends, bug density and weekly reports will appear here once analysis runs start accumulating."
    />
  );
}
