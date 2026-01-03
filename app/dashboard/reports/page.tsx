// File: app/dashboard/reports/page.tsx
import { ReportsDashboard } from "@/components/ReportsDashboard"

export default function ReportsPage() {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#E0E5EC' }}>
      <div className="max-w-6xl mx-auto">
        <ReportsDashboard />
      </div>
    </div>
  );
}