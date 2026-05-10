import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Star,
  Flag,
  BarChart3,
  FileText,
  Settings,
  Tag,
  Megaphone,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/admin" },
  { key: "users", label: "Users", icon: <Users className="h-5 w-5" />, href: "/admin/users" },
  { key: "companies", label: "Companies", icon: <Building2 className="h-5 w-5" />, href: "/admin/companies" },
  { key: "reviews", label: "Reviews", icon: <Star className="h-5 w-5" />, href: "/admin/reviews" },
  { key: "flags", label: "Flags", icon: <Flag className="h-5 w-5" />, href: "/admin/flags" },
  { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/admin/analytics" },
  { key: "audit-logs", label: "Audit Logs", icon: <FileText className="h-5 w-5" />, href: "/admin/audit-logs" },
  { key: "settings", label: "Settings", icon: <Settings className="h-5 w-5" />, href: "/admin/settings" },
  { key: "categories", label: "Categories", icon: <Tag className="h-5 w-5" />, href: "/admin/categories" },
  { key: "announcements", label: "Announcements", icon: <Megaphone className="h-5 w-5" />, href: "/admin/announcements" },
  { key: "invitations", label: "Invitations", icon: <Mail className="h-5 w-5" />, href: "/admin/invitations" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (href: string) => {
    if (href === "/admin") return currentPath === "/admin" || currentPath === "/admin/";
    return currentPath.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    if (mobileOpen) onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-gray-900 z-50 flex flex-col transition-all duration-300 dark-scrollbar",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-white truncate">TrustFiti</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive(item.href)
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Collapse Toggle (desktop) */}
        <div className="hidden lg:block border-t border-gray-800 p-3">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
