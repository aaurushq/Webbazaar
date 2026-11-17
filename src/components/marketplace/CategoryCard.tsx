import Link from "next/link";
import { Globe, Code2, Briefcase, Wrench, ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  iconName: "globe" | "code" | "briefcase" | "wrench";
  href: string;
  countLabel: string;
  accentColor: "indigo" | "emerald" | "amber" | "sky";
}

export function CategoryCard({
  title,
  description,
  iconName,
  href,
  countLabel,
  accentColor,
}: CategoryCardProps) {
  const getIcon = () => {
    switch (iconName) {
      case "globe":
        return <Globe className="h-6 w-6 text-indigo-600" />;
      case "code":
        return <Code2 className="h-6 w-6 text-emerald-600" />;
      case "briefcase":
        return <Briefcase className="h-6 w-6 text-amber-600" />;
      case "wrench":
        return <Wrench className="h-6 w-6 text-sky-600" />;
    }
  };

  const getBorderHover = () => {
    switch (accentColor) {
      case "indigo":
        return "hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100";
      case "emerald":
        return "hover:border-emerald-300 hover:ring-2 hover:ring-emerald-100";
      case "amber":
        return "hover:border-amber-300 hover:ring-2 hover:ring-amber-100";
      case "sky":
        return "hover:border-sky-300 hover:ring-2 hover:ring-sky-100";
    }
  };

  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 ${getBorderHover()}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
            {getIcon()}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {countLabel}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
          {title}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="flex items-center text-xs font-semibold text-primary-600 group-hover:translate-x-1 transition-transform">
        <span>Browse Catalog</span>
        <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </div>
    </Link>
  );
}
