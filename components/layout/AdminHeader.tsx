import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { Menu, Bell, LogOut } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export default function AdminHeader({ onMenuClick, sidebarCollapsed }: AdminHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = router.pathname;
    const titles: Record<string, string> = {
      "/admin": "Dashboard",
      "/admin/users": "User Management",
      "/admin/companies": "Company Management",
      "/admin/reviews": "Review Management",
      "/admin/flags": "Flag Management",
      "/admin/analytics": "Analytics",
      "/admin/audit-logs": "Audit Logs",
      "/admin/settings": "Platform Settings",
      "/admin/categories": "Categories",
      "/admin/announcements": "Announcements",
      "/admin/invitations": "Invitations",
    };
    return titles[path] || "Admin";
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <Avatar src={user?.image} name={user?.name} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user?.phoneNumber || ""}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
