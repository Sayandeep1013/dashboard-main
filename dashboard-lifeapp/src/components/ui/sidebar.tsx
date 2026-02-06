"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ChevronDown,
  Terminal,
  Database,
  ArrowLeftRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  IconBackpack,
  IconBallpenFilled,
  IconBooks,
  IconCalculator,
  IconFolder,
  IconPencil,
  IconSchool,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";

interface NavItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  isNested?: boolean;
  hasChildren?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const isActive1 = (href: string, pathname: string) => {
  if (href === "/") return pathname === "/";
  if (href !== "" && href !== "#") {
    return pathname === href || pathname.startsWith(href + "/");
  }
  return false;
};

const NavItem = ({
  href,
  label,
  icon,
  badge,
  isNested,
  hasChildren,
  isOpen,
  onClick,
  children,
}: NavItemProps) => {
  const pathname = usePathname();
  const isActive = href !== "#" && isActive1(href, pathname);
  const hasActiveChild = hasChildren && pathname.includes(label.toLowerCase());

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && href === "#") {
      e.preventDefault();
    }
    onClick?.();
  };

  return (
    <>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm transition-colors no-underline",
          isNested ? "pl-11" : "pl-3",
          isActive || hasActiveChild
            ? "bg-gray-800 text-white font-medium"
            : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
        )}
        onClick={handleClick}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500">
            {badge}
          </span>
        )}
        {hasChildren && (
          <span className="w-4 flex justify-center flex-shrink-0 ml-auto">
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
          </span>
        )}
      </Link>
      {children}
    </>
  );
};

/* ----------  NEW: tiny hooks & toggle component  ---------- */
const useDbMode = () => {
  const [mode, setMode] = useState<"prod" | "staging">("prod");
  useEffect(() => {
    fetch("/api/db-mode")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => {});
  }, []);
  return mode;
};

const DbToggle = () => {
  const mode = useDbMode();
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    setLoading(true);
    await fetch("/api/toggle-db", { method: "POST" });
    window.location.reload(); // fresh data from new DB
  };
  return (
    <div className="px-4 pb-3">
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
          "bg-gray-900/50 text-gray-300 ring-1 ring-gray-700 hover:ring-gray-600",
          "backdrop-blur-sm"
        )}
      >
        <span className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span
            className={cn(
              "font-medium",
              mode === "prod" ? "text-emerald-400" : "text-orange-400"
            )}
          >
            {mode === "prod" ? "Production" : "Staging"}
          </span>
        </span>
        <ArrowLeftRight className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};
/* ----------  END NEW  ---------- */

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [openSections, setOpenSections] = useState({
    students: false,
    teachers: false,
    mentors: false,
    schools: false,
    resources: false,
    resources_teachers: false,
    settings: false,
    student_related: false,
  });

  useEffect(() => {
    const newOpenSections = { ...openSections };
    if (pathname.startsWith("/students")) newOpenSections.students = true;
    if (pathname.startsWith("/teachers")) {
      newOpenSections.teachers = true;
      if (
        pathname.includes("/competencies") ||
        pathname.includes("/concept-cartoon") ||
        pathname.includes("/assessment") ||
        pathname.includes("/worksheets") ||
        pathname.includes("/lesson-plan")
      ) {
        newOpenSections.resources = true;
        newOpenSections.resources_teachers = true;
      }
    }
    if (pathname.startsWith("/mentors")) newOpenSections.mentors = true;
    if (pathname.startsWith("/schools")) newOpenSections.schools = true;
    if (pathname.startsWith("/settings")) newOpenSections.settings = true;
    if (pathname.startsWith("/student_related")) {
      newOpenSections.resources = true;
      newOpenSections.student_related = true;
    }
    setOpenSections(newOpenSections);
  }, [pathname]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="w-60 h-screen bg-black text-white fixed left-0 top-0 border-r overflow-y-auto flex flex-col justify-between">
      <div>
        <div className="p-6">
          <div className="flex items-center gap-2">
            {/* <Terminal className="h-6 w-6" /> */}
            <span className="text-2xl font-semibold">LifeApp</span>
          </div>
        </div>

        <nav className="space-y-0.5">
          <NavItem
            href="/"
            label="Dashboard"
            icon={<Home className="h-3 w-3" />}
          />
          <NavItem
            href="#"
            label="Students"
            icon={<IconBackpack className="h-3 w-3" />}
            hasChildren
            isOpen={openSections.students}
            onClick={() => toggleSection("students")}
          />
          {openSections.students && (
            <div className="space-y-0.5 ml-5">
              <NavItem href="/students/dashboard" label="Dashboard" isNested />
              <NavItem href="/students/mission" label="Mission" isNested />
              <NavItem
                href="/students/coupons_redeemed"
                label="Coupon Redeemed"
                isNested
              />
              <NavItem
                href="/students/quiz_sessions"
                label="Quiz Sessions"
                isNested
              />
              <NavItem href="/students/vision" label="Vision" isNested />
            </div>
          )}

          <NavItem
            href="#"
            label="Teachers"
            icon={<IconSchool className="h-3 w-3" />}
            hasChildren
            isOpen={openSections.teachers}
            onClick={() => toggleSection("teachers")}
          />
          {openSections.teachers && (
            <div className="space-y-0.5 ml-5">
              <NavItem href="/teachers/dashboard" label="Dashboard" isNested />
              <NavItem
                href="/teachers/coupons_redeemed"
                label="Coupon Redeemed"
                isNested
              />
            </div>
          )}

          <NavItem
            href="#"
            label="Mentors"
            icon={<IconBallpenFilled className="h-3 w-3" />}
            hasChildren
            isOpen={openSections.mentors}
            onClick={() => toggleSection("mentors")}
          />
          {openSections.mentors && (
            <div className="space-y-0.5 ml-5">
              <NavItem href="/mentors/dashboard" label="Dashboard" isNested />
              <NavItem href="/mentors/sessions" label="Sessions" isNested />
            </div>
          )}

          <NavItem
            href="#"
            label="Schools"
            icon={<IconBooks className="h-3 w-3" />}
            hasChildren
            isOpen={openSections.schools}
            onClick={() => toggleSection("schools")}
          />
          {openSections.schools && (
            <div className="space-y-0.5 ml-5">
              <NavItem href="/schools/dashboard" label="Dashboard" isNested />
              <NavItem
                href="/schools/school-data"
                label="School Data"
                isNested
              />
            </div>
          )}

          <NavItem
            href="#"
            label="Resources"
            icon={<IconFolder className="h-3 w-3" />}
            hasChildren
            isOpen={openSections.resources}
            onClick={() => toggleSection("resources")}
          />
          {openSections.resources && (
            <div className="space-y-0.5 ml-5">
              <NavItem
                href="#"
                label="Student_Related"
                isNested
                hasChildren
                isOpen={openSections.student_related}
                onClick={() => toggleSection("student_related")}
              />
              {openSections.student_related && (
                <div className="!pl-4 space-y-0.5">
                  <NavItem
                    href="/student_related/mission"
                    label="Mission"
                    isNested
                  />
                  <NavItem
                    href="/student_related/jigyasa"
                    label="Jigyasa"
                    isNested
                  />
                  <NavItem
                    href="/student_related/pragya"
                    label="Pragya"
                    isNested
                  />
                  <NavItem href="/student_related/quiz" label="Quiz" isNested />
                  <NavItem
                    href="/student_related/riddle"
                    label="Riddle"
                    isNested
                  />
                  <NavItem
                    href="/student_related/puzzle"
                    label="Puzzle"
                    isNested
                  />
                  <NavItem
                    href="/student_related/vision"
                    label="Vision"
                    isNested
                  />
                </div>
              )}

              <NavItem
                href="#"
                label="Teachers"
                isNested
                hasChildren
                isOpen={openSections.resources_teachers}
                onClick={() => toggleSection("resources_teachers")}
              />
              {openSections.resources_teachers && (
                <div className="!pl-4 space-y-0.5">
                  <NavItem
                    href="/teachers/competencies"
                    label="Competencies"
                    isNested
                  />
                  <NavItem
                    href="/teachers/concept-cartoon-header"
                    label="Concept Cartoon header"
                    isNested
                  />
                  <NavItem
                    href="/teachers/concept-cartoons"
                    label="Concept Cartoon"
                    isNested
                  />
                  <NavItem
                    href="/teachers/assessment"
                    label="Assessment"
                    isNested
                  />
                  <NavItem
                    href="/teachers/worksheets"
                    label="Work Sheets"
                    isNested
                  />
                  <NavItem
                    href="/teachers/lesson-plan-language"
                    label="Lesson Plan Language"
                    isNested
                  />
                  <NavItem
                    href="/teachers/lesson-plans"
                    label="Lesson Plans"
                    isNested
                  />
                  <NavItem
                    href="/teachers/textbook_mappings"
                    label="Textbook Mappings"
                    isNested
                  />
                </div>
              )}
            </div>
          )}

          <NavItem
            href="#"
            label="Settings"
            icon={<IconSettings className="h-3 w-3" />}
            hasChildren
            isOpen={openSections.settings}
            onClick={() => toggleSection("settings")}
          />
          {openSections.settings && (
            <div className="space-y-0.5 ml-5">
              <NavItem href="/settings/subjects" label="Subjects" isNested />
              <NavItem href="/settings/levels" label="Levels" isNested />
              <NavItem href="/settings/languages" label="Languages" isNested />
              <NavItem href="/settings/sections" label="Sections" isNested />
              <NavItem href="/settings/boards" label="Boards" isNested />
              <NavItem href="/settings/topics" label="Topics" isNested />
              <NavItem href="/settings/category" label="Category" isNested />
              <NavItem href="/settings/coupons" label="Coupons" isNested />
              <NavItem href="/settings/faqs" label="FAQs" isNested />
              <NavItem href="/settings/chapters" label="Chapters" isNested />
              <NavItem
                href="/settings/notifications"
                label="Notifications"
                isNested
              />
              <NavItem
                href="/settings/activity_types"
                label="Activity Types"
                isNested
              />
              <NavItem
                href="/settings/game_enrollments"
                label="Game Enrollments"
                isNested
              />
              <NavItem
                href="/settings/game_enrollment_requests"
                label="Game Enrollment Requests"
                isNested
              />
            </div>
          )}

          <NavItem
            href="/campaigns"
            label="Campaigns"
            isNested
            icon={<IconCalculator className="h-3 w-3" />}
          />
        </nav>
      </div>

      {/* ----------   TOGGLE +  LOGOUT  ---------- */}
      <div>
        <DbToggle />
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white w-full text-left"
          >
            <IconLogout className="h-3 w-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
