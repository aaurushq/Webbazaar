import { AlertCircle } from "lucide-react";

export function DemoNoticeBanner() {
  return (
    <div className="bg-indigo-900 text-indigo-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-indigo-800">
      <AlertCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
      <span>
        <strong>Phase 1 Preview:</strong> WebBazaar Demo Mode. All prices in INR. Real transactions & Supabase auth connect in subsequent phases.
      </span>
    </div>
  );
}
