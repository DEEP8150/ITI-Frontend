import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/pages/auth/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, Table, Bell, CreditCard, BookOpen, LogIn, UserPlus, X, Notebook, PersonStandingIcon, PersonStanding, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   title: "Tables",
  //   href: "/tables",
  //   icon: Table,
  // },
  // {
  //   title: "Add New User",
  //   href: "/addnewUser",
  //   icon: Plus,
  // },
  {
    title: "Instructors",
    href: "/instructors",
    icon: PersonStanding,
  },
  {
    title: "Students",
    href: "/students",
    icon: GraduationCap,
  },
  {
    title: "Courses",
    href: "/courses",
    icon: Notebook,
  },
  {
    title: "Performance",
    href: "/performance",
    icon: Notebook,
  },
  // {
  //   title: "Notifications",
  //   href: "/notifications",
  //   icon: Bell,
  // },
  // {
  //   title: "Subscriptions",
  //   href: "/subscriptions",
  //   icon: CreditCard,
  // },

];

const authItems = [
  // {
  //   title: "LogIn",
  //   href: "/auth/login-in",
  //   icon: LogIn,
  // },
  // {
  //   title: "Register",
  //   href: "/auth/registration",
  //   icon: UserPlus,
  // },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Logout",
    href: "/auth/logout",
    icon: LogIn,
  },
];




export function Sidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  console.log("auth user:", user)
  const userRole = user?.role || "Guest";


  const filteredNavItems = navItems.filter((item) => {
  if (userRole === "student") {
    // Students can see Performance but not Instructors or Students pages
    return item.href !== "/instructors" && item.href !== "/students";
  }

  if (["instructor", "admin", "superAdmin"].includes(userRole)) {
    // Hide Performance for instructor, admin, and superAdmin
    return item.href !== "/performance";
  }
  return true;
});

  console.log("User Role in Sidebar:", userRole);

  return (
    <aside className="w-60 bg-white lg:bg-transparent flex flex-col relative z-10 h-full border-r border-stone-200 lg:border-0">
      {/* Brand Header */}
      <div className="p-6 pb-0 relative z-10 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">
          {userRole.toUpperCase()}
        </h1>
        {/* Close button for mobile */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink key={item.href} to={item.href}>
              <div
                className={cn(
                  "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                  isActive
                    ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                    : "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent"
                )}
              >
                <Icon className="mr-3 w-4 h-4" />
                {item.title}
              </div>
            </NavLink>
          );
        })}

        {/* Auth Section */}
        <div className="pt-4 border-t border-stone-200 mt-4">
          {/* <p className="px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            AUTH PAGES
          </p> */}
          {authItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <NavLink key={item.href} to={item.href}>
                <div
                  className={cn(
                    "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                    isActive
                      ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                      : "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200 border border-transparent"
                  )}
                >
                  <Icon className="mr-3 w-4 h-4" />
                  {item.title}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Documentation Link */}
        {/* <div className="mt-auto pt-4 border-t border-stone-200">
          <NavLink to="/documentation">
            <div
              className={cn(
                "flex items-center text-sm font-normal rounded-lg cursor-pointer",
                location.pathname === "/documentation"
                  ? "px-3 py-2 shadow-sm hover:shadow-md bg-stone-800 hover:bg-stone-700 relative bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-900 text-stone-50 hover:bg-gradient-to-b hover:from-stone-800 hover:to-stone-800 hover:border-stone-900 after:absolute after:inset-0 after:rounded-[inherit] after:box-shadow after:shadow-[inset_0_1px_0px_rgba(255,255,255,0.25),inset_0_-2px_0px_rgba(0,0,0,0.35)] after:pointer-events-none duration-300 ease-in align-middle select-none font-sans text-center antialiased"
                  : "px-3 py-2 text-stone-700 hover:bg-stone-100 transition-colors duration-200"
              )}
            >
              <BookOpen className="mr-3 w-4 h-4" />
              Documentation
            </div>
          </NavLink>
        </div> */}

      </nav>

    </aside>
  );
}
