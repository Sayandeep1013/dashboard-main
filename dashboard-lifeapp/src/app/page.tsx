"use client";
import "@tabler/core/dist/css/tabler.min.css";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import NumberFlow from "@number-flow/react";
import LogoutButton from "@/components/logoutButton";
import Papa from "papaparse";
import React, { forwardRef } from 'react';
import * as XLSX from "xlsx";
import {
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  TooltipProps,
  BarChart,
  Legend as rechartsLegend,
  Bar,
} from "recharts";
import {
  IconSettings,
  IconSearch,
  IconBell,
  IconUsers,
  IconUserCheck,
  IconUserPlus,
  IconPercentage,
  IconDownload,
} from "@tabler/icons-react";
import { Bar as ChartJSBar, Pie as ChartJSPie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend,
  ChartOptions,
  ArcElement,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartJSTooltip,
  Legend,
  ArcElement
);
// Define the type for your API data
interface SignupData {
  month: string | null;
  count: number;
}
import ReactECharts from "echarts-for-react";
const groupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
const quizGroupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
const studentGroupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
const teacherGroupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
import { Sidebar } from "@/components/ui/sidebar";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });


// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";



import { formatWeeklyXAxisLabel } from '@/components/ui/echartsHelpers';
interface userTypeChart {
  count: number;
  userType: string | null;
}
const userTypes = [
  "All",
  "Admin",
  "Student",
  "Mentor",
  "Teacher",
  "Unspecified",
];
interface EchartSignup {
  period: string;
  [key: string]: any;
}
interface ApiSignupData {
  count: number;
  period: string | null;
  user_type: string;
}
interface QuizHistogramEntry {
  count: number;
  subject: string;
  level: string;
  topic: string;
}
interface StudentsByGrade {
  grade: number | null;
  count: number;
}
interface TeachersByGrade {
  grade: number | null;
  count: number;
}
interface DemographChartdata {
  code: string;
  value: number;
}
interface DemographData {
  count: string;
  state: string;
}
interface GenderSignup {
  period: string | null;
  Male: number;
  Female: number;
  Unspecified: number;
}
interface GradeEntry {
  period: string | null;
  grade: string;
  count: number;
}
interface TeacherGradeEntry {
  period: string | null;
  grade: string;
  count: number;
}
interface LevelCountEntry {
  period: string | null;
  level1_count: number;
  level2_count: number;
  level3_count: number;
  level4_count: number;
}
interface MissionRow {
  period: string | null;
  count: number;
  subject_title: string;
  level_title: string;
}
interface TransformedPeriod {
  period: string;
  [level: string]: any;
  __breakdown?: {
    [level: string]: {
      [subject: string]: number;
    };
  };
}
const missionGroupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
const jigyasaGroupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
const pragyaGroupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
// Skeleton Components for Loading States
const MetricCardSkeleton = () => (
  <div className="card shadow-sm border-0 h-100">
    <div className="card-body text-center">
      <div className="bg-gray-200 rounded-full w-16 h-16 mx-auto mb-3 animate-pulse"></div>
      <div className="bg-gray-200 rounded h-4 w-3/4 mx-auto mb-2 animate-pulse"></div>
      <div className="bg-gray-200 rounded h-6 w-1/2 mx-auto animate-pulse"></div>
    </div>
  </div>
);
const ChartSkeleton = () => (
  <div className="card shadow-sm border-0 h-100">
    <div className="card-header bg-transparent py-3">
      <div className="bg-gray-200 rounded h-5 w-1/2 animate-pulse"></div>
    </div>
    <div className="card-body">
      <div className="bg-gray-200 rounded h-80 w-full animate-pulse"></div>
    </div>
  </div>
);
// Lazy Chart Component with Intersection Observer
// Update the LazyChart component to handle errors better
const LazyChart = forwardRef<ReactECharts, {
  option: any;
  style?: React.CSSProperties;
  loading: boolean;
  id?: string;
}>(({ option, style, loading, id = `chart-${Math.random().toString(36).substr(2, 9)}` }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsVisible(true);
          setHasBeenVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    if (chartRef.current) {
      observer.observe(chartRef.current);
    }
    return () => observer.disconnect();
  }, [hasBeenVisible]);
  // Reset error when option changes
  useEffect(() => {
    setChartError(null);
  }, [option]);
  const onChartReady = (echarts: any) => {
    console.log(`Chart ${id} ready`);
  };
  const onChartError = (error: any) => {
    console.error(`Chart ${id} error:`, error);
    setChartError('Failed to render chart');
  };
  return (
    <div ref={chartRef} id={id}>
      {loading || !isVisible ? (
        <ChartSkeleton />
      ) : chartError ? (
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body d-flex align-items-center justify-content-center">
            <div className="text-center text-muted">
              <div> Error </div>
              <div>Chart failed to load</div>
              <small>{chartError}</small>
            </div>
          </div>
        </div>
      ) : (
        <ReactECharts 
          ref={ref}
          option={option} 
          style={style}
          onChartReady={onChartReady}
          onEvents={{
            'error': onChartError
          }}
        />
      )}
    </div>
  );
});
LazyChart.displayName = 'LazyChart';
// Helper to safely build query string
const toQueryString = (obj: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
};
export default function UserAnalyticsDashboard() {
  const router = useRouter();
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);
  const formatPeriod = (period: string, grouping: string) => {
    if (grouping === "daily") {
      try {
        const date = new Date(period);
        return date.toLocaleDateString("en-GB");
      } catch {
        return period;
      }
    }
    return period;
  };
  // Global filter states (UI only)
  const [globalFilters, setGlobalFilters] = useState({
    state: "All",
    city: "All",
    schoolCode: "",
    userType: "All",
    dateRange: "All",
    startDate: "",
    endDate: "",
    grade: "All",
    gender: "All",
  });
  // Applied filters are used for API calls
  const [appliedFilters, setAppliedFilters] = useState({ ...globalFilters });
  const [availableStates, setAvailableStates] = useState<string[]>(["All"]);
  const [availableCities, setAvailableCities] = useState<string[]>(["All"]);
  const [availableGrades, setAvailableGrades] = useState<string[]>(["All"]);
  const [availableSchoolCodes, setAvailableSchoolCodes] = useState<string[]>([
    "All",
  ]);
  // Loading states
  const [loadingPhase1, setLoadingPhase1] = useState(true);
  const [loadingPhase2, setLoadingPhase2] = useState(true);
  const [loadingPhase3, setLoadingPhase3] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [applyingFilters, setApplyingFilters] = useState(false); // For Apply Now button
  // Helper function to build filter parameters using appliedFilters by default
  const buildFilterParams = (filters = appliedFilters) => {
    const filterParams: any = {};
    // Use consistent parameter names that match backend expectations
    if (filters.state !== "All") {
      filterParams.state = filters.state;
    }
    if (filters.city !== "All") {
      filterParams.city = filters.city;
    }
    if (filters.schoolCode && filters.schoolCode.trim() !== "") {
      filterParams.school_code = filters.schoolCode.trim();
    }
    if (filters.userType !== "All") {
      filterParams.user_type = filters.userType; // Make sure this matches backend
    }
    if (filters.grade !== "All") {
      filterParams.grade = filters.grade;
    }
    if (filters.gender !== "All") {
      filterParams.gender = filters.gender;
    }
    // Handle date filters - use either date_range OR start_date/end_date
    if (filters.startDate && filters.endDate) {
      filterParams.start_date = filters.startDate;
      filterParams.end_date = filters.endDate;
    } else if (filters.dateRange !== "All") {
      filterParams.date_range = filters.dateRange;
    }
    return filterParams;
  };
  // Parallel loading functions for better performance
  const loadEssentialMetrics = async (filters = appliedFilters) => {
    setLoadingPhase1(true);
    const filterParams = buildFilterParams(filters);
    try {
      const [
        userCountRes,
        activeUserCountRes,
        schoolCountRes,
        teacherCountRes,
        totalStudentCountRes,
      ] = await Promise.all([
        fetch(`${api_startpoint}/api/user-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/active-user-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/school_count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/teacher-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total-student-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
      ]);
      const [
        userCountData,
        activeUserCountData,
        schoolCountData,
        teacherCountData,
        totalStudentCountData,
      ] = await Promise.all([
        userCountRes.json().catch(() => []),
        activeUserCountRes.json().catch(() => []),
        schoolCountRes.json().catch(() => []),
        teacherCountRes.json().catch(() => []),
        totalStudentCountRes.json().catch(() => []),
      ]);

      // Fix: safely extract count from potentially different response shapes
      setTotalUsers(
        Array.isArray(userCountData)
          ? userCountData[0]?.count ?? 0
          : userCountData?.count ?? 0
      );
      setActiveUsers(
        Array.isArray(activeUserCountData)
          ? activeUserCountData[0]?.active_users ?? 0
          : activeUserCountData?.active_users ?? 0
      );
      setSchoolCount(
        Array.isArray(schoolCountData)
          ? schoolCountData[0]?.count ?? 0
          : schoolCountData?.count ?? 0
      );
      setTotalTeachers(
        Array.isArray(teacherCountData)
          ? teacherCountData[0]?.total_count ?? 0
          : teacherCountData?.total_count ?? 0
      );
      setTotalStudents(
        Array.isArray(totalStudentCountData)
          ? totalStudentCountData[0]?.count ?? 0
          : totalStudentCountData?.count ?? 0
      );
    } catch (error) {
      console.error("Error loading essential metrics:", error);
      setTotalUsers(0);
      setActiveUsers(0);
      setSchoolCount(0);
      setTotalTeachers(0);
      setTotalStudents(0);
    } finally {
      setLoadingPhase1(false);
    }
  };
  const loadPrimaryCharts = async (filters = appliedFilters) => {
    setLoadingPhase2(true);
    const filterParams = buildFilterParams(filters);
    try {
      const [userTypeDataRes, stateCountsRes, couponRedeemRes] =
        await Promise.all([
          fetch(`${api_startpoint}/api/user-type-chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filterParams),
          }),
          fetch(`${api_startpoint}/api/count-school-state`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filterParams),
          }),
          fetch(`${api_startpoint}/api/coupons-used-count`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filterParams),
          }),
        ]);
      const [userTypeData, stateCountsData, couponRedeemData] =
        await Promise.all([
          userTypeDataRes.json().catch(() => []),
          stateCountsRes.json().catch(() => []),
          couponRedeemRes.json().catch(() => []),
        ]);
      // Remove all signupData handling
      setUserTypeData(Array.isArray(userTypeData) ? userTypeData : []);
      setStateCounts(Array.isArray(stateCountsData) ? stateCountsData : []);
      setCouponRedeemCount(
        Array.isArray(couponRedeemData) ? couponRedeemData : []
      );
    } catch (error) {
      console.error("Error loading primary charts:", error);
      setUserTypeData([]);
      setStateCounts([]);
      setCouponRedeemCount([]);
    } finally {
      setLoadingPhase2(false);
    }
  };
  const loadDetailedAnalytics = async (filters = appliedFilters) => {
    setLoadingPhase3(true);
    const filterParams = buildFilterParams(filters);
    try {
      const queryStringNewSignups = toQueryString(filterParams);
      const queryStringApprovalRate = toQueryString(filterParams);
      const [newSignupsRes, approvalRateRes, teacherGradeRes, studentGradeRes] =
        await Promise.all([
          fetch(`${api_startpoint}/api/new-signups?${queryStringNewSignups}`),
          fetch(
            `${api_startpoint}/api/approval-rate?${queryStringApprovalRate}`
          ),
          fetch(`${api_startpoint}/api/teachers-by-grade-over-time`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: groupingTeacherGrade,
              ...filterParams,
            }),
          }),
          fetch(`${api_startpoint}/api/students-by-grade-over-time`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grouping: groupingGrade, ...filterParams }),
          }),
        ]);
      const [
        newSignupsData,
        approvalRateData,
        teacherGradeData,
        studentGradeData,
      ] = await Promise.all([
        newSignupsRes.json().catch(() => []),
        approvalRateRes.json().catch(() => []),
        teacherGradeRes.json().catch(() => []),
        studentGradeRes.json().catch(() => []),
      ]);
      setNewSignups(
        Array.isArray(newSignupsData) ? newSignupsData[0]?.count || 0 : 0
      );
      setApprovalRate(
        Array.isArray(approvalRateData) ? approvalRateData[0]?.rate || 0 : 0
      );
      setEchartDataTeacherGrade(
        Array.isArray(teacherGradeData) ? teacherGradeData : []
      );
      setEchartDataGrade(
        Array.isArray(studentGradeData) ? studentGradeData : []
      );
    } catch (error) {
      console.error("Error loading detailed analytics:", error);
      setNewSignups(0);
      setApprovalRate(0);
      setEchartDataTeacherGrade([]);
      setEchartDataGrade([]);
    } finally {
      setLoadingPhase3(false);
    }
  };
  const loadAdditionalMetrics = async (filters = appliedFilters) => {
    const filterParams = buildFilterParams(filters);
    try {
      const [
        quizCompletesRes,
        tmcTotalRes,
        tjcTotalRes,
        tpcTotalRes,
        tqcTotalRes,
        trcTotalRes,
        tpzcTotalRes,
        sessionParticipantTotalRes,
        mentorsParticipatedSessionsTotalRes,
        totalSessionsCreatedRes,
        totalCountPBLRes,
        visionSummaryRes,
        missionParticipationRateRes,
        jigyasaParticipationRateRes,
        pragyaParticipationRateRes,
        quizParticipationRateRes,
        tmcAssignedByTeacherRes,
        totalPointsEarnedRes,
        totalPointsRedeemedRes,
      ] = await Promise.all([
        fetch(`${api_startpoint}/api/quiz_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total_missions_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total_jigyasa_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total_pragya_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total_quiz_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total_riddle_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total_puzzle_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/session_participants_total_dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(
          `${api_startpoint}/api/mentor_participated_in_sessions_total_dashboard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filterParams),
          }
        ),
        fetch(`${api_startpoint}/api/total_sessions_created`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(
          `${api_startpoint}/api/PBLsubmissions/total?${toQueryString(
            filterParams
          )}`
        ),
        fetch(`${api_startpoint}/api/total_vision_completes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/mission_participation_rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/jigyasa_participation_rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/pragya_participation_rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/quiz_participation_rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(
          `${api_startpoint}/api/total-missions-completed-assigned-by-teacher`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filterParams),
          }
        ),
        fetch(`${api_startpoint}/api/total-points-earned`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
        fetch(`${api_startpoint}/api/total-points-redeemed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        }),
      ]);
      const [
        quizCompletesData,
        tmcTotalData,
        tjcTotalData,
        tpcTotalData,
        tqcTotalData,
        trcTotalData,
        tpzcTotalData,
        sessionParticipantTotalData,
        mentorsParticipatedSessionsTotalData,
        totalSessionsCreatedData,
        totalCountPBLData,
        visionSummaryData,
        missionParticipationRateData,
        jigyasaParticipationRateData,
        pragyaParticipationRateData,
        quizParticipationRateData,
        tmcAssignedByTeacherData,
        totalPointsEarnedData,
        totalPointsRedeemedData,
      ] = await Promise.all([
        quizCompletesRes.json().catch(() => []),
        tmcTotalRes.json().catch(() => []),
        tjcTotalRes.json().catch(() => []),
        tpcTotalRes.json().catch(() => []),
        tqcTotalRes.json().catch(() => []),
        trcTotalRes.json().catch(() => []),
        tpzcTotalRes.json().catch(() => []),
        sessionParticipantTotalRes.json().catch(() => []),
        mentorsParticipatedSessionsTotalRes.json().catch(() => []),
        totalSessionsCreatedRes.json().catch(() => []),
        totalCountPBLRes.json().catch(() => ({ total: 0 })),
        visionSummaryRes
          .json()
          .catch(() => ({ total_score: 0, total_vision_answers: 0 })),
        missionParticipationRateRes
          .json()
          .catch(() => ({ participation_rate: 0 })),
        jigyasaParticipationRateRes
          .json()
          .catch(() => ({ participation_rate: 0 })),
        pragyaParticipationRateRes
          .json()
          .catch(() => ({ participation_rate: 0 })),
        quizParticipationRateRes
          .json()
          .catch(() => ({ participation_rate: 0 })),
        tmcAssignedByTeacherRes.json().catch(() => []),
        totalPointsEarnedRes.json().catch(() => ({ total_points: "0" })),
        totalPointsRedeemedRes.json().catch(() => []),
      ]);

      // Fix: normalize all response shapes for metric cards
      setQuizCompletes(
        Array.isArray(quizCompletesData)
          ? quizCompletesData[0]?.count ?? 0
          : quizCompletesData?.count ?? 0
      );
      setTmcTotal(
        Array.isArray(tmcTotalData)
          ? tmcTotalData[0]?.count ?? 0
          : tmcTotalData?.count ?? 0
      );
      setTjcTotal(
        Array.isArray(tjcTotalData)
          ? tjcTotalData[0]?.count ?? 0
          : tjcTotalData?.count ?? 0
      );
      setTpcTotal(
        Array.isArray(tpcTotalData)
          ? tpcTotalData[0]?.count ?? 0
          : tpcTotalData?.count ?? 0
      );
      setTqcTotal(tqcTotalData?.count ?? 0);
      setTrcTotal(
        Array.isArray(trcTotalData)
          ? trcTotalData[0]?.count ?? 0
          : trcTotalData?.count ?? 0
      );
      setTpzcTotal(
        Array.isArray(tpzcTotalData)
          ? tpzcTotalData[0]?.count ?? 0
          : tpzcTotalData?.count ?? 0
      );
      setSessionParticipantTotal(
        Array.isArray(sessionParticipantTotalData)
          ? sessionParticipantTotalData[0]?.count ?? 0
          : sessionParticipantTotalData?.count ?? 0
      );
      setMentorsParticipatedSessionsTotal(
        Array.isArray(mentorsParticipatedSessionsTotalData)
          ? mentorsParticipatedSessionsTotalData[0]?.count ?? 0
          : mentorsParticipatedSessionsTotalData?.count ?? 0
      );
      setTotalSessionsCreated(
        Array.isArray(totalSessionsCreatedData)
          ? totalSessionsCreatedData[0]?.count ?? 0
          : totalSessionsCreatedData?.count ?? 0
      );
      setTotalCountPBL(totalCountPBLData?.total ?? 0);
      setTotalVisionScore(visionSummaryData?.total_score ?? 0);
      setTotalVisionSubmitted(visionSummaryData?.total_vision_answers ?? 0);
      setMissionParticipationRate(
        missionParticipationRateData?.participation_rate ?? 0
      );
      setJigyasaParticipationRate(
        jigyasaParticipationRateData?.participation_rate ?? 0
      );
      setPragyaParticipationRate(
        pragyaParticipationRateData?.participation_rate ?? 0
      );
      setQuizParticipationRate(
        quizParticipationRateData?.participation_rate ?? 0
      );
      setTmcAssignedByTeacher(
        Array.isArray(tmcAssignedByTeacherData)
          ? tmcAssignedByTeacherData[0]?.count ?? 0
          : tmcAssignedByTeacherData?.count ?? 0
      );

      // Handle totalPointsEarned: could be { total_points: "12345" } or number
      const pointsEarned = totalPointsEarnedData?.total_points;
      if (pointsEarned !== undefined && pointsEarned !== null) {
        setTotalPointsEarned(
          typeof pointsEarned === "string"
            ? parseInt(pointsEarned, 10) || 0
            : pointsEarned
        );
      } else {
        setTotalPointsEarned(0);
      }

      // Handle totalPointsRedeemed: could be [{ total_coins_redeemed: 123 }] or { total_coins_redeemed: 123 }
      let redeemedValue = 0;
      if (
        Array.isArray(totalPointsRedeemedData) &&
        totalPointsRedeemedData.length > 0
      ) {
        redeemedValue = totalPointsRedeemedData[0]?.total_coins_redeemed ?? 0;
      } else if (
        totalPointsRedeemedData &&
        typeof totalPointsRedeemedData === "object"
      ) {
        redeemedValue = totalPointsRedeemedData.total_coins_redeemed ?? 0;
      }
      setTotalPointsRedeemed(Number(redeemedValue) || 0);
    } catch (error) {
      console.error("Error loading additional metrics:", error);
      // Reset to safe defaults
      setQuizCompletes(0);
      setTmcTotal(0);
      setTjcTotal(0);
      setTpcTotal(0);
      setTqcTotal(0);
      setTrcTotal(0);
      setTpzcTotal(0);
      setSessionParticipantTotal(0);
      setMentorsParticipatedSessionsTotal(0);
      setTotalSessionsCreated(0);
      setTotalCountPBL(0);
      setTotalVisionScore(0);
      setTotalVisionSubmitted(0);
      setMissionParticipationRate(0);
      setJigyasaParticipationRate(0);
      setPragyaParticipationRate(0);
      setQuizParticipationRate(0);
      setTmcAssignedByTeacher(0);
      setTotalPointsEarned(0);
      setTotalPointsRedeemed(0);
    }
  };
  // Parallel loading orchestrator
  const loadDashboardData = async () => {
    setGlobalLoading(true);
    try {
      await Promise.all([
        loadEssentialMetrics(),
        loadPrimaryCharts(),
        loadDetailedAnalytics(),
        loadAdditionalMetrics(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setGlobalLoading(false);
    }
  };
  // Export all dashboard data to Excel with multiple sheets
  const exportDashboardData = async () => {
    try {
      const filterParams = buildFilterParams(appliedFilters); // Use appliedFilters
      const exportData: any[] = [];
      const exportTimestamp = new Date().toLocaleString();
      exportData.push({
        "Data Type": "Export Info",
        Metric: "Export Date & Time",
        Value: exportTimestamp,
        "Filters Applied": JSON.stringify(filterParams),
      });
      exportData.push({
        "Data Type": "Export Info",
        Metric: "Dashboard Version",
        Value: "LifeApp Dashboard v1.0",
        "Filters Applied": JSON.stringify(filterParams),
      });
      const summaryMetrics = [
        { name: "Total Users", value: totalUsers || 0 },
        { name: "Active Users", value: activeUsers || 0 },
        { name: "New Signups", value: newSignups || 0 },
        { name: "Approval Rate (%)", value: approvalRate || 0 },
        { name: "Total Downloads", value: 45826 },
        { name: "Total Coins Earned", value: totalPointsEarned || 0 },
        { name: "Total Coins Redeemed", value: totalPointsRedeemed || 0 },
        { name: "Total No. of Schools", value: schoolCount || 0 },
        { name: "Total No. of Quiz Completes", value: quizCompletes || 0 },
        {
          name: "Total Sessions Created by Mentors",
          value: totalSessionsCreated || 0,
        },
        {
          name: "Total Participants Joined Mentor Sessions",
          value: sessionParticipantTotal || 0,
        },
        {
          name: "Total Mentors Participated for Mentor Connect Sessions",
          value: mentorsParticipatedSessionsTotal || 0,
        },
        { name: "Total Teachers", value: totalTeachers || 0 },
        { name: "Total Students", value: totalStudents || 0 },
        { name: "Total Mission Completes", value: tmcTotal || 0 },
        { name: "Total Jigyasa Completes", value: tjcTotal || 0 },
        { name: "Total Pragya Completes", value: tpcTotal || 0 },
        { name: "Total Quiz Completes", value: tqcTotal || 0 },
        { name: "Total Riddle Completes", value: trcTotal || 0 },
        { name: "Total Puzzle Completes", value: tpzcTotal || 0 },
        { name: "Total PBL Mission Completes", value: totalCountPBL || 0 },
        { name: "Total Vision Completes", value: totalVisionSubmitted || 0 },
        { name: "Total Vision Coins Earned", value: totalVisionScore || 0 },
      ];
      summaryMetrics.forEach((metric) => {
        exportData.push({
          "Data Type": "Summary Metrics",
          Metric: metric.name,
          Value: metric.value,
          "Filters Applied": JSON.stringify(filterParams),
        });
      });
      // Add user signups data
      if (Array.isArray(EchartData) && EchartData.length > 0) {
        EchartData.forEach((item) => {
          exportData.push({
            "Data Type": "User Signups",
            Period: item.period,
            Admin: item.Admin || 0,
            Student: item.Student || 0,
            Mentor: item.Mentor || 0,
            Teacher: item.Teacher || 0,
            Unspecified: item.Unspecified || 0,
            Total:
              (item.Admin || 0) +
              (item.Student || 0) +
              (item.Mentor || 0) +
              (item.Teacher || 0) +
              (item.Unspecified || 0),
            "Filters Applied": JSON.stringify(filterParams),
          });
        });
      }
      // Add user type distribution
      if (Array.isArray(userTypeData) && userTypeData.length > 0) {
        userTypeData.forEach((item) => {
          exportData.push({
            "Data Type": "User Type Distribution",
            "User Type": item.userType,
            Count: item.count,
            "Filters Applied": JSON.stringify(filterParams),
          });
        });
      }
      // Add state-wise school counts
      if (Array.isArray(stateCounts) && stateCounts.length > 0) {
        stateCounts.forEach((item) => {
          exportData.push({
            "Data Type": "Schools by State",
            State: item.state,
            "School Count": item.count_state,
            "Filters Applied": JSON.stringify(filterParams),
          });
        });
      }
      // Add coupon redeem data
      if (Array.isArray(couponRedeemCount) && couponRedeemCount.length > 0) {
        couponRedeemCount.forEach((item) => {
          exportData.push({
            "Data Type": "Coupons Redeemed",
            Amount: item.amount,
            "Coupon Count": item.coupon_count,
            "Filters Applied": JSON.stringify(filterParams),
          });
        });
      }
      // Add students by grade data
      if (Array.isArray(EchartDataGrade) && EchartDataGrade.length > 0) {
        EchartDataGrade.forEach((item) => {
          const gradeData: any = {
            "Data Type": "Students by Grade",
            Period: item.period,
            "Filters Applied": JSON.stringify(filterParams),
          };
          Object.keys(item).forEach((key) => {
            if (key !== "period") {
              gradeData[`Grade ${key}`] = item[key] || 0;
            }
          });
          exportData.push(gradeData);
        });
      }
      // Add teachers by grade data
      if (
        Array.isArray(EchartDataTeacherGrade) &&
        EchartDataTeacherGrade.length > 0
      ) {
        EchartDataTeacherGrade.forEach((item) => {
          const teacherGradeData: any = {
            "Data Type": "Teachers by Grade",
            Period: item.period,
            "Filters Applied": JSON.stringify(filterParams),
          };
          Object.keys(item).forEach((key) => {
            if (key !== "period") {
              teacherGradeData[`Grade ${key}`] = item[key] || 0;
            }
          });
          exportData.push(teacherGradeData);
        });
      }
      // Add mission data if available
      if (Array.isArray(missionData) && missionData.length > 0) {
        missionData.forEach((item) => {
          try {
            const levelTitle = item.level_title
              ? typeof item.level_title === "string"
                ? JSON.parse(item.level_title).en
                : item.level_title
              : "Unknown";
            exportData.push({
              "Data Type": "Mission Completed",
              Period: item.period,
              Level: levelTitle,
              Count: item.count,
              "Filters Applied": JSON.stringify(filterParams),
            });
          } catch (e) {
            exportData.push({
              "Data Type": "Mission Completed",
              Period: item.period,
              Level: item.level_title || "Unknown",
              Count: item.count,
              "Filters Applied": JSON.stringify(filterParams),
            });
          }
        });
      }
      // Add jigyasa data if available
      if (Array.isArray(jigyasaData) && jigyasaData.length > 0) {
        jigyasaData.forEach((item) => {
          try {
            const levelTitle = item.level_title
              ? typeof item.level_title === "string"
                ? JSON.parse(item.level_title).en
                : item.level_title
              : "Unknown";
            exportData.push({
              "Data Type": "Jigyasa Completed",
              Period: item.period,
              Level: levelTitle,
              Count: item.count,
              "Filters Applied": JSON.stringify(filterParams),
            });
          } catch (e) {
            exportData.push({
              "Data Type": "Jigyasa Completed",
              Period: item.period,
              Level: item.level_title || "Unknown",
              Count: item.count,
              "Filters Applied": JSON.stringify(filterParams),
            });
          }
        });
      }
      // Add sessions data if available
      if (Array.isArray(sessions) && sessions.length > 0) {
        sessions.forEach((session) => {
          exportData.push({
            "Data Type": "Mentor Sessions",
            "Session ID": session.id,
            "Session Name": session.name,
            Status: session.status,
            Heading: session.heading,
            Description: session.description || "N/A",
            "Date Time": session.date_time,
            "Filters Applied": JSON.stringify(filterParams),
          });
        });
      }
      const workbook = XLSX.utils.book_new();
      const metadataSheet = XLSX.utils.aoa_to_sheet([
        ["LifeApp Dashboard Export Report"],
        ["Export Date:", new Date().toLocaleString()],
        ["Dashboard Version:", "LifeApp Dashboard v1.0"],
        [],
        ["Applied Filters:"],
        ["State:", appliedFilters.state || "All"],
        ["City:", appliedFilters.city || "All"],
        ["School Code:", appliedFilters.schoolCode || "All"],
        ["User Type:", appliedFilters.userType || "All"],
        ["Grade:", appliedFilters.grade || "All"],
        ["Gender:", appliedFilters.gender || "All"],
        ["Date Range:", appliedFilters.dateRange || "All"],
        ["Start Date:", appliedFilters.startDate || "All"],
        ["End Date:", appliedFilters.endDate || "All"],
        [],
        ["Summary Metrics:"],
        ["Total Users:", totalUsers || 0],
        ["Active Users:", activeUsers || 0],
        ["New Signups:", newSignups || 0],
        ["Approval Rate (%):", approvalRate || 0],
        ["Total Downloads:", 45826],
        ["Total Coins Earned:", totalPointsEarned || 0],
        ["Total Coins Redeemed:", totalPointsRedeemed || 0],
        ["Total No. of Schools:", schoolCount || 0],
        ["Total No. of Quiz Completes:", quizCompletes || 0],
        ["Total Sessions Created by Mentors:", totalSessionsCreated || 0],
        [
          "Total Participants Joined Mentor Sessions:",
          sessionParticipantTotal || 0,
        ],
        [
          "Total Mentors Participated for Mentor Connect Sessions:",
          mentorsParticipatedSessionsTotal || 0,
        ],
        ["Total Teachers:", totalTeachers || 0],
        ["Total Students:", totalStudents || 0],
        ["Total Mission Completes:", tmcTotal || 0],
        ["Total Jigyasa Completes:", tjcTotal || 0],
        ["Total Pragya Completes:", tpcTotal || 0],
        ["Total Quiz Completes:", tqcTotal || 0],
        ["Total Riddle Completes:", trcTotal || 0],
        ["Total Puzzle Completes:", tpzcTotal || 0],
        ["Total PBL Mission Completes:", totalCountPBL || 0],
        ["Total Vision Completes:", totalVisionSubmitted || 0],
        ["Total Vision Score Earned:", totalVisionScore || 0],
      ]);
      XLSX.utils.book_append_sheet(
        workbook,
        metadataSheet,
        "Summary & Filters"
      );
      // Export User Signups Over Time to separate sheet
      if (Array.isArray(EchartData) && EchartData.length > 0) {
        const signupData = EchartData.map((item) => ({
          Period: item.period,
          Total_Count: item.count,
          Admin: item.Admin || 0,
          Student: item.Student || 0,
          Mentor: item.Mentor || 0,
          Teacher: item.Teacher || 0,
          Unspecified: item.Unspecified || 0,
        }));
        const signupSheet = XLSX.utils.json_to_sheet(signupData);
        XLSX.utils.book_append_sheet(
          workbook,
          signupSheet,
          "User Signups Over Time"
        );
      }
      // Export User Type Distribution to separate sheet
      if (Array.isArray(userTypeData) && userTypeData.length > 0) {
        const userTypeSheet = XLSX.utils.json_to_sheet(userTypeData);
        XLSX.utils.book_append_sheet(
          workbook,
          userTypeSheet,
          "User Type Distribution"
        );
      }
      // Export Schools by State to separate sheet
      if (Array.isArray(stateCounts) && stateCounts.length > 0) {
        const stateData = stateCounts.map((item) => ({
          State: item.state,
          School_Count: item.count_state,
        }));
        const stateSheet = XLSX.utils.json_to_sheet(stateData);
        XLSX.utils.book_append_sheet(workbook, stateSheet, "Schools by State");
      }
      // Export Coupon Redemptions to separate sheet
      if (Array.isArray(couponRedeemCount) && couponRedeemCount.length > 0) {
        const couponData = couponRedeemCount.map((item) => ({
          Amount: item.amount,
          Coupon_Count: item.coupon_count,
        }));
        const couponSheet = XLSX.utils.json_to_sheet(couponData);
        XLSX.utils.book_append_sheet(
          workbook,
          couponSheet,
          "Coupon Redemptions"
        );
      }
      // Export Students by Grade to separate sheet
      if (Array.isArray(EchartDataGrade) && EchartDataGrade.length > 0) {
        const gradeSheet = XLSX.utils.json_to_sheet(EchartDataGrade);
        XLSX.utils.book_append_sheet(workbook, gradeSheet, "Students by Grade");
      }
      // Export Teachers by Grade to separate sheet
      if (
        Array.isArray(EchartDataTeacherGrade) &&
        EchartDataTeacherGrade.length > 0
      ) {
        const teacherGradeSheet = XLSX.utils.json_to_sheet(
          EchartDataTeacherGrade
        );
        XLSX.utils.book_append_sheet(
          workbook,
          teacherGradeSheet,
          "Teachers by Grade"
        );
      }
      // Export Students by State to separate sheet
      if (Array.isArray(chartStudentsData) && chartStudentsData.length > 0) {
        const studentStateData = chartStudentsData.map((item) => ({
          State: item.code,
          Student_Count: item.value,
        }));
        const studentStateSheet = XLSX.utils.json_to_sheet(studentStateData);
        XLSX.utils.book_append_sheet(
          workbook,
          studentStateSheet,
          "Students by State"
        );
      }
      // Export Teachers by State to separate sheet
      if (Array.isArray(chartTeacherData) && chartTeacherData.length > 0) {
        const teacherStateData = chartTeacherData.map((item) => ({
          State: item.code,
          Teacher_Count: item.value,
        }));
        const teacherStateSheet = XLSX.utils.json_to_sheet(teacherStateData);
        XLSX.utils.book_append_sheet(
          workbook,
          teacherStateSheet,
          "Teachers by State"
        );
      }
      // Export Mission Data to separate sheet
      if (Array.isArray(missionData) && missionData.length > 0) {
        const missionSheet = XLSX.utils.json_to_sheet(missionData);
        XLSX.utils.book_append_sheet(
          workbook,
          missionSheet,
          "Mission Completion Data"
        );
      }
      // Export Jigyasa Data to separate sheet
      if (Array.isArray(jigyasaData) && jigyasaData.length > 0) {
        const jigyasaSheet = XLSX.utils.json_to_sheet(jigyasaData);
        XLSX.utils.book_append_sheet(
          workbook,
          jigyasaSheet,
          "Jigyasa Completion Data"
        );
      }
      // Export Pragya Data to separate sheet
      if (Array.isArray(pragyaData) && pragyaData.length > 0) {
        const pragyaSheet = XLSX.utils.json_to_sheet(pragyaData);
        XLSX.utils.book_append_sheet(
          workbook,
          pragyaSheet,
          "Pragya Completion Data"
        );
      }
      // Export Quiz Data to separate sheet
      if (Array.isArray(quizData) && quizData.length > 0) {
        const quizSheet = XLSX.utils.json_to_sheet(quizData);
        XLSX.utils.book_append_sheet(
          workbook,
          quizSheet,
          "Quiz Completion Data"
        );
      }
      // Export Vision Statistics to separate sheet
      if (Array.isArray(statsVision) && statsVision.length > 0) {
        const visionSheet = XLSX.utils.json_to_sheet(statsVision);
        XLSX.utils.book_append_sheet(
          workbook,
          visionSheet,
          "Vision Statistics"
        );
      }
      // Export Points Data to separate sheets
      if (Array.isArray(pointsMissionData) && pointsMissionData.length > 0) {
        const missionPointsSheet = XLSX.utils.json_to_sheet(pointsMissionData);
        XLSX.utils.book_append_sheet(
          workbook,
          missionPointsSheet,
          "Mission Points Over Time"
        );
      }
      if (Array.isArray(pointsQuizData) && pointsQuizData.length > 0) {
        const quizPointsSheet = XLSX.utils.json_to_sheet(pointsQuizData);
        XLSX.utils.book_append_sheet(
          workbook,
          quizPointsSheet,
          "Quiz Points Over Time"
        );
      }
      if (Array.isArray(pointsJigyasaData) && pointsJigyasaData.length > 0) {
        const jigyasaPointsSheet = XLSX.utils.json_to_sheet(pointsJigyasaData);
        XLSX.utils.book_append_sheet(
          workbook,
          jigyasaPointsSheet,
          "Jigyasa Coins Over Time"
        );
      }
      if (Array.isArray(pointsPragyaData) && pointsPragyaData.length > 0) {
        const pragyaPointsSheet = XLSX.utils.json_to_sheet(pointsPragyaData);
        XLSX.utils.book_append_sheet(
          workbook,
          pragyaPointsSheet,
          "Pragya Points Over Time"
        );
      }
      // Export Coupon Redeems Data Over Time to separate sheet
      if (Array.isArray(couponRedeemsData) && couponRedeemsData.length > 0) {
        const couponRedeemsSheet = XLSX.utils.json_to_sheet(couponRedeemsData);
        XLSX.utils.book_append_sheet(
          workbook,
          couponRedeemsSheet,
          "Coupon Redeems Over Time"
        );
      }
      // Export PBL Submissions Data to separate sheet
      if (Array.isArray(dataPBL) && dataPBL.length > 0) {
        const pblSubmissionsData = dataPBL.map((item) => ({
          Period: item.period,
          Count: item.count,
          Grouping: groupingPBL,
          Status_Filter: statusPBL,
        }));
        const pblSheet = XLSX.utils.json_to_sheet(pblSubmissionsData);
        XLSX.utils.book_append_sheet(
          workbook,
          pblSheet,
          "PBL Submissions Over Time"
        );
      }
      // Export Gender Distribution Data to separate sheet
      if (Array.isArray(EchartDataGender) && EchartDataGender.length > 0) {
        const genderSheet = XLSX.utils.json_to_sheet(EchartDataGender);
        XLSX.utils.book_append_sheet(
          workbook,
          genderSheet,
          "Gender Distribution"
        );
      }
      // Export Pragya Coins Earned Data to separate sheet
      if (Array.isArray(pointsPragyaData) && pointsPragyaData.length > 0) {
        const pragyaCoinsSheet = XLSX.utils.json_to_sheet(pointsPragyaData);
        XLSX.utils.book_append_sheet(
          workbook,
          pragyaCoinsSheet,
          "Pragya Coins Earned Over Time"
        );
      }
      // Export Vision Points Over Time Data to separate sheet
      if (Array.isArray(VisionScore) && VisionScore.length > 0) {
        const visionScoreSheet = XLSX.utils.json_to_sheet(VisionScore);
        XLSX.utils.book_append_sheet(
          workbook,
          visionScoreSheet,
          "Vision Points Over Time"
        );
      }
      // Export Schools Demographics Distribution Over Time to separate sheet
      if (Array.isArray(schoolData) && schoolData.length > 0) {
        const schoolDemographicsSheet = XLSX.utils.json_to_sheet(schoolData);
        XLSX.utils.book_append_sheet(
          workbook,
          schoolDemographicsSheet,
          "Schools Demographics Over Time"
        );
      }
      // Export Student Detailed Data if available
      if (Array.isArray(studentData) && studentData.length > 0) {
        const studentSheet = XLSX.utils.json_to_sheet(studentData);
        XLSX.utils.book_append_sheet(
          workbook,
          studentSheet,
          "Student Detailed Data"
        );
      }
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `LifeApp_Dashboard_Export_${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };
  const [EchartData, setEChartData] = useState<EchartSignup[]>([]);
  const [grouping, setGrouping] = useState("monthly");
  const [selectedUserType, setSelectedUserType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCitiesForState = async (state: string) => {
    try {
      const res = await fetch(`${api_startpoint}/api/city-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: state }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAvailableCities(["All", ...data.map((item: any) => item.city)]);
      } else {
        setAvailableCities(["All"]);
      }
    } catch (error) {
      console.error("Error fetching cities for state:", error);
      setAvailableCities(["All"]);
    }
  };
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/all-states-dropdown`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const states = ["All", ...data];
          setAvailableStates(states);
        } else {
          setAvailableStates(["All"]);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        setAvailableStates(["All"]);
      }
    };
    const fetchCities = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/city-list`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const cities = [
            "All",
            ...data.map((item: { city: string }) => item.city),
          ];
          setAvailableCities(cities);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    const fetchSchoolCodes = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/school-code-list`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const schoolCodes = [
            "All",
            ...data.map((item: { school_code: string }) => item.school_code),
          ];
          setAvailableSchoolCodes(schoolCodes);
        }
      } catch (error) {
        console.error("Error fetching school codes:", error);
      }
    };
    const fetchGrades = async () => {
      try {
        const grades = [
          "All",
          "Grade 1",
          "Grade 2",
          "Grade 3",
          "Grade 4",
          "Grade 5",
          "Grade 6",
          "Grade 7",
          "Grade 8",
          "Grade 9",
          "Grade 10",
          "Grade 11",
          "Grade 12",
        ];
        setAvailableGrades(grades);
      } catch (error) {
        console.error("Error setting grades:", error);
      }
    };
    fetchStates();
    fetchCities();
    fetchSchoolCodes();
    fetchGrades();
  }, []);
  useEffect(() => {
    console.log(" [useEffect] /api/signing-user triggered");
    console.log(" appliedFilters:", JSON.parse(JSON.stringify(appliedFilters)));
    console.log(" grouping:", grouping);
    console.log(" selectedUserType:", selectedUserType);
    setLoading(true);
    // Build filter params correctly
    const filterParams = {
      grouping,
      user_type: selectedUserType,
      ...buildFilterParams(appliedFilters),
    };
    console.log(
      " Fetching with filterParams:",
      JSON.parse(JSON.stringify(filterParams))
    );
    fetch(`${api_startpoint}/api/signing-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filterParams),
    })
      .then((response) => {
        console.log(
          " [fetch] response status:",
          response.status,
          response.statusText
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log(" [fetch] raw data:", JSON.parse(JSON.stringify(data)));
        // Handle both array and object response formats
        const dataArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        console.log(
          " [fetch] normalised array:",
          JSON.parse(JSON.stringify(dataArray))
        );
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
          console.warn(" [fetch] empty or invalid array → clearing chart");
          setEChartData([]);
          setLoading(false);
          return;
        }
        // Transform data for chart
        const grouped: Record<string, EchartSignup> = {};
        (dataArray as ApiSignupData[]).forEach((r) => {
          const period = r.period || "Unknown";
          if (!grouped[period]) grouped[period] = { period };
          grouped[period][r.user_type] = r.count;
        });
        const final = Object.values(grouped);
        console.log(
          " [fetch] final chart data:",
          JSON.parse(JSON.stringify(final))
        );
        setEChartData(final);
        setLoading(false);
      })
      .catch((err) => {
        console.error(" [fetch] error:", err.message);
        setError(err.message);
        setEChartData([]);
        setLoading(false);
      });
  }, [grouping, selectedUserType, appliedFilters]); // Ensure all dependencies are listed
  const allSeries = [
    {
      name: "Admin",
      type: "bar",
      stack: "total",
      data: (EchartData || []).map((item) => item.Admin || 0),
      itemStyle: { color: "#1E3A8A" },
    },
    {
      name: "Student",
      type: "bar",
      stack: "total",
      data: (EchartData || []).map((item) => item.Student || 0),
      itemStyle: { color: "#3B82F6" },
    },
    {
      name: "Mentor",
      type: "bar",
      stack: "total",
      data: (EchartData || []).map((item) => item.Mentor || 0),
      itemStyle: { color: "#60A5FA" },
    },
    {
      name: "Teacher",
      type: "bar",
      stack: "total",
      data: (EchartData || []).map((item) => item.Teacher || 0),
      itemStyle: { color: "#93C5FD" },
    },
    {
      name: "Unspecified",
      type: "bar",
      stack: "total",
      data: (EchartData || []).map((item) => item.Unspecified || 0),
      itemStyle: { color: "#0F172A" },
    },
  ];
  const filteredSeries =
    selectedUserType === "All"
      ? allSeries
      : allSeries.filter((series) => series.name === selectedUserType);
  const periodsUserSignups = (EchartData || []).map((item) => item.period);
  const totalCountsUserSignups = (EchartData || []).map(
    (item) =>
      (item.Admin || 0) +
      (item.Student || 0) +
      (item.Mentor || 0) +
      (item.Teacher || 0) +
      (item.Unspecified || 0)
  );
  const totalSeriesUserSignups = {
    name: "Total",
    type: "bar",
    data: totalCountsUserSignups,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const EchartOption = {
    title: {
      text: "User Signups by Type Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      top: "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: (EchartData || []).map((item) =>
        formatPeriod(item.period, grouping)
      ),
      boundaryGap: grouping === "lifetime" ? true : false,
      axisLabel: {
        rotate: grouping === "daily" ? 45 : 30,
        formatter: (value: string) => formatWeeklyXAxisLabel(value, grouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        start: 0,
        end: 100,
      },
    ],
    series: [...filteredSeries, totalSeriesUserSignups],
  };
  const handleGroupingChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setGrouping(e.target.value);
  };
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<SignupData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    async function fetchData() {
      try {
        const filterParams = buildFilterParams(appliedFilters);
        const queryString = toQueryString(filterParams);
        const res = await fetch(
          `${api_startpoint}/api/user-signups?${queryString}`
        );
        const data = (await res.json()) as SignupData[];
        if (!Array.isArray(data)) {
          setChartData([]);
          return;
        }
        setChartData(data);
        const availableYears: string[] = Array.from(
          new Set(
            data
              .filter((item) => item.month)
              .map((item) => (item.month ? item.month.split("-")[0] : ""))
              .filter((year) => year !== "")
          )
        );
        if (availableYears.length > 0) {
          setSelectedYear(availableYears[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setChartData([]);
      }
    }
    fetchData();
  }, [appliedFilters]);
  const filteredData = selectedYear
    ? chartData.filter(
        (item) => item.month && item.month.startsWith(selectedYear)
      )
    : chartData;
  const years: string[] = chartData.length
    ? Array.from(
        new Set(
          chartData
            .filter((item) => item.month)
            .map((item) => (item.month ? item.month.split("-")[0] : ""))
            .filter((year) => year !== "")
        )
      )
    : [];
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [newSignups, setNewSignups] = useState<number>(0);
  const [approvalRate, setApprovalRate] = useState<number>(0);
  const [schoolCount, setSchoolCount] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  // Load dashboard data only when appliedFilters change
  useEffect(() => {
    loadDashboardData();
  }, [appliedFilters]);
  const [couponRedeemCount, setCouponRedeemCount] = useState<
    Array<{ amount: string; coupon_count: number }>
  >([]);
  useEffect(() => {
    async function fetchCouponRedeemCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/coupons-used-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildFilterParams(appliedFilters)),
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCouponRedeemCount(data);
        } else {
          setCouponRedeemCount([]);
        }
      } catch (error) {
        console.error("Error fetching coupon counts:", error);
        setCouponRedeemCount([]);
      }
    }
    fetchCouponRedeemCount();
  }, [appliedFilters]);
  const pieChartData = {
    labels: (couponRedeemCount || []).map((item) => item.amount),
    datasets: [
      {
        data: (couponRedeemCount || []).map((item) => item.coupon_count),
        backgroundColor: [
          "#6549b9",
          "#FF8C42",
          "#1E88E5",
          "#43A047",
          "#FDD835",
          "#D81B60",
        ],
        borderWidth: 0,
      },
    ],
  };
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#333" } },
      tooltip: {
        backgroundColor: "#1f2937",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    cutout: "70%",
    animation: { animateScale: true },
  };
  const [assignCounts, setAssignCounts] = useState<number[]>([]);
  const [teacherAssignCounts, setTeacherAssignCounts] = useState<number[]>([]);
  const [teacherAssignChartData, setTeacherAssignChartData] = useState<
    { assignmentCount: number; teacherCount: number }[]
  >([]);
  // Local time filter for Teacher Assignments ONLY
  const [teacherAssignDateRange, setTeacherAssignDateRange] =
    useState<string>("lifetime");
  const [teacherAssignStartDate, setTeacherAssignStartDate] =
    useState<string>("");
  const [teacherAssignEndDate, setTeacherAssignEndDate] = useState<string>("");
  useEffect(() => {
    async function fetchTeacherAssignCounts() {
      try {
        // Start with global filters
        const filterParams = buildFilterParams(appliedFilters);
        // Override date filters with LOCAL ones for this chart only
        if (teacherAssignDateRange === "custom") {
          filterParams.start_date = teacherAssignStartDate;
          filterParams.end_date = teacherAssignEndDate;
        } else {
          filterParams.date_range = teacherAssignDateRange;
        }
        const res = await fetch(`${api_startpoint}/api/teacher-assign-count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterParams),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const counts = data.map(
            (item: { assign_count: number }) => item.assign_count
          );
          setTeacherAssignCounts(counts);
          const freqMap: Record<number, number> = {};
          counts.forEach((count) => {
            freqMap[count] = (freqMap[count] || 0) + 1;
          });
          const maxCount = Math.max(...counts, 0);
          const chartData = [];
          for (let i = 1; i <= maxCount; i++) {
            chartData.push({
              assignmentCount: i,
              teacherCount: freqMap[i] || 0,
            });
          }
          setTeacherAssignChartData(chartData);
        } else {
          setTeacherAssignChartData([]);
        }
      } catch (error) {
        console.error("Error fetching teacher assignment counts:", error);
        setTeacherAssignChartData([]);
      }
    }
    fetchTeacherAssignCounts();
  }, [
    appliedFilters,
    teacherAssignDateRange,
    teacherAssignStartDate,
    teacherAssignEndDate,
  ]);
  const bins = [0, 5, 10, 15, 20, 25];
  const binLabels = ["1-5", "6-10", "11-15", "16-20", "21-25", "26+"];
  const binData = Array(binLabels.length).fill(0);
  assignCounts.forEach((count) => {
    if (count <= 5) binData[0]++;
    else if (count <= 10) binData[1]++;
    else if (count <= 15) binData[2]++;
    else if (count <= 20) binData[3]++;
    else if (count <= 25) binData[4]++;
    else binData[5]++;
  });
  const teacherAssignData = {
    labels: teacherAssignChartData.map((item) =>
      item.assignmentCount.toString()
    ),
    datasets: [
      {
        label: "Number of Teachers",
        data: teacherAssignChartData.map((item) => item.teacherCount),
        backgroundColor: "#4A90E2",
        borderRadius: 5,
      },
    ],
  };
  const teacherAssignOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "#1f2937",
        borderColor: "#374151",
        borderWidth: 1,
      },
      legend: { labels: { color: "#333" } },
    },
    scales: {
      x: {
        type: "category" as const,
        title: {
          display: true,
          text: "Number of Assignments",
          color: "#333",
        },
        ticks: { color: "#333" },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Teachers",
          color: "#333",
        },
        ticks: { color: "#333" },
      },
    },
  } satisfies ChartOptions<"bar">;
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card card-sm">
          <div className="card-body">
            <p className="mb-0">Month: {label}</p>
            <p className="mb-0">Count: {payload[0].value}</p>
          </div>
        </div>
      );
    }
    return null;
  };
  const [stateCounts, setStateCounts] = useState<
    Array<{ state: string; count_state: number }>
  >([]);
  useEffect(() => {
    async function fetchSchoolStateCounts() {
      try {
        const res = await fetch(`${api_startpoint}/api/count-school-state`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildFilterParams(appliedFilters)),
        });
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].state !== undefined
        ) {
          setStateCounts(data);
        } else {
          console.warn("Invalid school state data:", data);
          setStateCounts([]);
        }
      } catch (error) {
        console.error("Error fetching school state counts:", error);
        setStateCounts([]);
      }
    }
    fetchSchoolStateCounts();
  }, [appliedFilters]);
  const schoolStateData = {
    labels: (stateCounts || []).map((item) => item.state),
    datasets: [
      {
        label: "No. of Schools",
        data: (stateCounts || []).map((item) => item.count_state),
        backgroundColor: "#4A90E2",
        borderRadius: 15,
        borderSkipped: false,
      },
    ],
  };
  const schoolChartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        font: { size: 16 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#333",
        },
        grid: {
          color: "#eee",
        },
      },
      y: {
        ticks: {
          color: "#333",
        },
        grid: {
          color: "#eee",
        },
      },
    },
  };
  const [userTypeData, setUserTypeData] = useState<userTypeChart[]>([]);
  useEffect(() => {
    async function fetchUserType() {
      try {
        const res = await fetch(`${api_startpoint}/api/user-type-chart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildFilterParams(appliedFilters)),
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUserTypeData(data);
        } else {
          setUserTypeData([]);
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
        setUserTypeData([]);
      }
    }
    fetchUserType();
  }, [appliedFilters]);
  const deepBlueColors = [
    "#1E3A8A",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#0F172A",
  ];
  const userTypeChartOptions = {
    backgroundColor: "white",
    title: {
      text: "User Type",
      left: "center",
      top: 20,
      textStyle: {
        color: "black",
      },
    },
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        name: "Number of",
        type: "pie",
        radius: "55%",
        center: ["50%", "50%"],
        data: (userTypeData || []).map((item, index) => ({
          value: item.count,
          name: item.userType || "Unknown",
          itemStyle: { color: deepBlueColors[index % deepBlueColors.length] },
        })),
        label: {
          show: true,
          color: "#000",
          fontSize: 14,
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 20,
          lineStyle: {
            color: "#000",
            width: 0.5,
          },
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: function () {
          return Math.random() * 200;
        },
      },
    ],
  };
  const LegendComponent = rechartsLegend;
  const [EchartDataGrade, setEchartDataGrade] = useState<any[]>([]);
  const [groupingGrade, setGroupingGrade] = useState("monthly");
  const [loadingGrade, setLoadingGrade] = useState(true);
  const [errorGrade, setErrorGrade] = useState<string | null>(null);
  const fetchDataGrade = (selectedGrouping: string) => {
    setLoadingGrade(true);
    fetch(`${api_startpoint}/api/students-by-grade-over-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: selectedGrouping,
        ...buildFilterParams(appliedFilters),
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network error");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const groupedData: { [period: string]: any } = {};
          data.forEach((entry) => {
            const period = entry.period || "Unknown";
            if (!groupedData[period]) groupedData[period] = { period };
            groupedData[period][entry.grade] =
              (groupedData[period][entry.grade] || 0) + entry.count;
          });
          setEchartDataGrade(Object.values(groupedData));
        } else {
          setEchartDataGrade([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setEchartDataGrade([]);
      })
      .finally(() => {
        setLoadingGrade(false);
      });
  };
  useEffect(() => {
    fetchDataGrade(groupingGrade);
  }, [groupingGrade, appliedFilters]);
  const uniqueGrades = Array.from(
    new Set(
      Array.isArray(EchartDataGrade)
        ? EchartDataGrade.flatMap((item) =>
            Object.keys(item).filter((key) => key !== "period")
          )
        : []
    )
  );
  const sortedStudentGrades = uniqueGrades.sort((a, b) => {
    if (a === "Unspecified") return 1;
    if (b === "Unspecified") return -1;
    return Number(a) - Number(b);
  });
  const seriesGrade = uniqueGrades.map((grade, index) => ({
    name: grade,
    type: "bar",
    stack: "total",
    data: (EchartDataGrade || []).map((item) => item[grade] || 0),
    itemStyle: {
      color: ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD", "#DB2777", "#6B7280"][
        index % 6
      ],
    },
  }));
  const periodsGrade = (EchartDataGrade || []).map((item) => item.period);
  const totalCountsStudentGrade = (EchartDataGrade || []).map((item) =>
    Object.keys(item)
      .filter((k) => k !== "period")
      .reduce((sum, gradeKey) => sum + (item[gradeKey] || 0), 0)
  );
  const totalSeriesStudentGrade = {
    name: "Total",
    type: "bar",
    data: totalCountsStudentGrade,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
  };
  const EchartGradeOption = {
    title: {
      text: "Students by Grade Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      top: "bottom",
      data: sortedStudentGrades,
      pageIconColor: "#999",
      pageIconInactiveColor: "#ccc",
      pageIconSize: 12,
      pageTextStyle: { color: "#333" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: (EchartDataGrade || []).map((item) =>
        formatPeriod(item.period, groupingGrade)
      ),
      boundaryGap: groupingGrade === "lifetime" ? true : false,
      axisLabel: {
        rotate: groupingGrade === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingGrade),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesGrade, totalSeriesStudentGrade],
  };
  const [EchartDataTeacherGrade, setEchartDataTeacherGrade] = useState<any[]>(
    []
  );
  const [groupingTeacherGrade, setGroupingTeacherGrade] = useState("monthly");
  const [loadingTeacherGrade, setLoadingTeacherGrade] = useState(true);
  const [errorTeacherGrade, setErrorTeacherGrade] = useState<string | null>(
    null
  );
  const fetchDataTeacherGrade = (selectedGrouping: string) => {
    setLoadingTeacherGrade(true);
    fetch(`${api_startpoint}/api/teachers-by-grade-over-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: selectedGrouping,
        ...buildFilterParams(appliedFilters),
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network error");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const groupedData: { [period: string]: any } = {};
          data.forEach((entry) => {
            const period = entry.period || "Unknown";
            const gradeLabel = entry.grade;
            if (!groupedData[period]) groupedData[period] = { period };
            groupedData[period][gradeLabel] =
              (groupedData[period][gradeLabel] || 0) + entry.count;
          });
          setEchartDataTeacherGrade(Object.values(groupedData));
        } else {
          console.error("API returned non-array:", data);
          setEchartDataTeacherGrade([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setEchartDataTeacherGrade([]);
      })
      .finally(() => {
        setLoadingTeacherGrade(false);
      });
  };
  useEffect(() => {
    fetchDataTeacherGrade(groupingTeacherGrade);
  }, [groupingTeacherGrade, appliedFilters]);
  const uniqueGradesTeacher = Array.from(
    new Set(
      Array.isArray(EchartDataTeacherGrade)
        ? EchartDataTeacherGrade.flatMap((item) =>
            Object.keys(item).filter((key) => key !== "period")
          )
        : []
    )
  );
  const sortedGradesTeacher = uniqueGradesTeacher.sort(
    (a, b) => Number(a) - Number(b)
  );
  const seriesTeacherGrade = uniqueGradesTeacher.map((grade, index) => ({
    name: grade,
    type: "bar",
    stack: "total",
    data: (EchartDataTeacherGrade || []).map((item) => item[grade] || 0),
    itemStyle: {
      color: ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD", "#DB2777", "#6B7280"][
        index % 6
      ],
    },
  }));
  const periodsTeacherGrade = (EchartDataTeacherGrade || []).map(
    (item) => item.period
  );
  const totalCountsTeacherGrade = (EchartDataTeacherGrade || []).map((item) =>
    Object.keys(item)
      .filter((k) => k !== "period")
      .reduce((sum, gradeKey) => sum + (item[gradeKey] || 0), 0)
  );
  const totalSeriesTeacherGrade = {
    name: "Total",
    type: "bar",
    data: totalCountsTeacherGrade,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
  };
  const EchartTeacherGradeOption = {
    title: {
      text: "Teachers by Grade Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      top: "bottom",
      data: sortedGradesTeacher,
      pageIconColor: "#999",
      pageIconInactiveColor: "#ccc",
      pageIconSize: 12,
      pageTextStyle: { color: "#333" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: (EchartDataTeacherGrade || []).map((item) =>
        formatPeriod(item.period, groupingTeacherGrade)
      ),
      boundaryGap: groupingTeacherGrade === "lifetime" ? true : false,
      axisLabel: {
        rotate: groupingTeacherGrade === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingTeacherGrade),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesTeacherGrade, totalSeriesTeacherGrade],
  };
  const [chartStudentsData, setChartStudentsData] = useState<
    DemographChartdata[]
  >([]);
  useEffect(() => {
    async function fetchStateData() {
      try {
        const apiResponse = await fetch(
          `${api_startpoint}/api/demograph-students`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildFilterParams(appliedFilters)),
          }
        );
        const apiData: { count: string; state: string }[] =
          await apiResponse.json();
        if (!Array.isArray(apiData)) {
          setChartStudentsData([]);
          return;
        }
        const stateMappings: Record<string, string> = {
          "Tamil Nadu": "tamil nadu",
          Telangana: "telangana",
          Maharashtra: "maharashtra",
          Karnataka: "karnataka",
          "Andhra Pradesh": "andhra pradesh",
          Gujarat: "gujarat",
          "Madhya Pradesh": "madhya pradesh",
          Odisha: "odisha",
          "West Bengal": "west bengal",
          Delhi: "nct of delhi",
          "Uttar Pradesh": "uttar pradesh",
          Jharkhand: "jharkhand",
          Assam: "assam",
          Chhattisgarh: "chhattisgarh",
          Punjab: "punjab",
          Bihar: "bihar",
          Haryana: "haryana",
          "Daman and Diu": "daman and diu",
          Chandigarh: "chandigarh",
          Puducherry: "puducherry",
          Rajasthan: "rajasthan",
          Goa: "goa",
          Kerala: "kerala",
          Uttarakhand: "uttarakhand",
          "Himachal Pradesh": "himachal pradesh",
          Lakshadweep: "lakshadweep",
          Sikkim: "nikkim",
          Nagaland: "nagaland",
          "Dadara and Nagar Haveli": "dadara and nagar havelli",
          "Jammu and Kashmir": "jammu and kashmir",
          Manipur: "manipur",
          "Arunanchal Pradesh": "arunanchal pradesh",
          Meghalaya: "meghalaya",
          Mizoram: "mizoram",
          Tripura: "tripura",
          "Andaman and Nicobar Islands": "andaman and nicobar",
        };
        const transformedData: DemographChartdata[] = apiData
          .map((item) => ({
            code: stateMappings[item.state] || item.state,
            value: Math.max(parseInt(item.count, 10), 1),
          }))
          .filter((item) => item.code);
        setChartStudentsData(transformedData);
      } catch (error) {
        console.error("Error fetching state-wise student count:", error);
        setChartStudentsData([]);
      }
    }
    fetchStateData();
  }, [appliedFilters]);
  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "category",
      data: (chartStudentsData || []).map((item) => item.code),
      name: "States",
      axisLabel: {
        rotate: 45,
        formatter: (value: string) =>
          value.charAt(0).toUpperCase() + value.slice(1),
      },
    },
    yAxis: {
      type: "value",
      name: "Student Count",
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: "Students",
        type: "bar",
        data: (chartStudentsData || []).map((item) => item.value),
        itemStyle: {
          color: "#4a90e2",
        },
      },
    ],
  };
  const [chartTeacherData, setChartTeacherData] = useState<
    DemographChartdata[]
  >([]);
  const [geoData, setGeoData] = useState<DemographData[]>([]);
  useEffect(() => {
    async function fetchTeacherData() {
      try {
        const filterParams = buildFilterParams(appliedFilters);
        const apiResponse = await fetch(
          `${api_startpoint}/api/demograph-teachers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filterParams),
          }
        );
        const apiData: DemographData[] = await apiResponse.json();
        if (!Array.isArray(apiData)) {
          setGeoData([]);
          setChartTeacherData([]);
          return;
        }
        setGeoData(apiData);
        const stateMappings: Record<string, string> = {
          "Tamil Nadu": "tamil nadu",
          Telangana: "telangana",
          Maharashtra: "maharashtra",
          Karnataka: "karnataka",
          "Andhra Pradesh": "andhra pradesh",
          Gujarat: "gujarat",
          "Madhya Pradesh": "madhya pradesh",
          Odisha: "odisha",
          "West Bengal": "west bengal",
          Delhi: "nct of delhi",
          "Uttar Pradesh": "uttar pradesh",
          Jharkhand: "jharkhand",
          Assam: "assam",
          Chhattisgarh: "chhattisgarh",
          Punjab: "punjab",
          Bihar: "bihar",
          Haryana: "haryana",
          "Daman and Diu": "daman and diu",
          Chandigarh: "chandigarh",
          Puducherry: "puducherry",
          Rajasthan: "rajasthan",
          Goa: "goa",
          Kerala: "kerala",
          Uttarakhand: "uttarakhand",
          "Himachal Pradesh": "himachal pradesh",
          Lakshadweep: "lakshadweep",
          Sikkim: "nikkim",
          Nagaland: "nagaland",
          "Dadara and Nagar Haveli": "dadara and nagar havelli",
          "Jammu and Kashmir": "jammu and kashmir",
          Manipur: "manipur",
          "Arunanchal Pradesh": "arunanchal pradesh",
          Meghalaya: "meghalaya",
          Mizoram: "mizoram",
          Tripura: "tripura",
          "Andaman and Nicobar Islands": "andaman and nicobar",
        };
        const transformedData: DemographChartdata[] = apiData
          .map((item) => ({
            code: stateMappings[item.state] || "",
            value: Math.max(parseInt(item.count, 10), 1),
          }))
          .filter((item) => item.code);
        setChartTeacherData(transformedData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setGeoData([]);
        setChartTeacherData([]);
      }
    }
    fetchTeacherData();
  }, [appliedFilters]);
  const teacherDemographicOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "category",
      data: (chartTeacherData || []).map((item) => item.code),
      name: "States",
      axisLabel: {
        rotate: 45,
        formatter: (value: string) =>
          value.charAt(0).toUpperCase() + value.slice(1),
      },
    },
    yAxis: {
      type: "value",
      name: "Teacher Count",
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: "Teachers",
        type: "bar",
        data: (chartTeacherData || []).map((item) => item.value),
        itemStyle: {
          color: "#4a90e2",
        },
      },
    ],
  };
  interface Sessions {
    id: number;
    name: string;
    status: number;
    zoom_link: string;
    zoom_password: string;
    heading: string;
    description?: string;
    date_time: string;
  }
  const [sessions, setSessions] = useState<Sessions[]>([]);
  const fetchSessions = () => {
    fetch(`${api_startpoint}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          setSessions([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      });
  };
  useEffect(() => {
    fetchSessions();
  }, []);
  const genderPieOption = {
    title: {
      left: "center",
      top: 20,
      textStyle: { color: "#333", fontSize: 16 },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {d}%",
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: ["Prefer not to disclose", "Male", "Female"],
      textStyle: { color: "#333" },
    },
    series: [
      {
        name: "Gender",
        type: "pie",
        radius: "55%",
        center: ["50%", "55%"],
        data: [
          { value: 3, name: "Prefer not to disclose" },
          { value: 50, name: "Male" },
          { value: 47, name: "Female" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  const [totalPointsEarned, setTotalPointsEarned] = useState<number>(0);
  const [totalPointsRedeemed, setTotalPointsRedeemed] = useState<number>(0);
  const [missionGrouping, setMissionGrouping] = useState<string>("daily");
  const [missionData, setMissionData] = useState<any[]>([]);
  const [missionLoading, setMissionLoading] = useState<boolean>(true);
  const [missionStatus, setMissionStatus] = useState<string>("all");
  const [selectedMissionSubject, setSelectedMissionSubject] =
    useState<string>("all");
  const missionStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "rejected", label: "Rejected" },
    { value: "approved", label: "Approved" },
  ];
  useEffect(() => {
    const fetchMissionData = async () => {
      setMissionLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/histogram_level_subject_challenges_complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: missionGrouping,
              status: missionStatus,
              subject:
                selectedMissionSubject === "all"
                  ? null
                  : selectedMissionSubject,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setMissionData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching mission data:", error);
        setMissionData([]);
      } finally {
        setMissionLoading(false);
      }
    };
    fetchMissionData();
  }, [missionGrouping, missionStatus, selectedMissionSubject, appliedFilters]);
  const getParsedField = (raw: any): string => {
    if (typeof raw === "object" && raw !== null) {
      return raw.en || "";
    }
    if (typeof raw === "string") {
      if (raw.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(raw);
          return parsed.en || raw;
        } catch {
          return raw;
        }
      }
      return raw;
    }
    return "";
  };
  const groupedByPeriod: Record<string, Record<string, number>> = {};
  missionData.forEach((item) => {
    const period = item.period;
    const level = getParsedField(item.level_title);
    if (!groupedByPeriod[period]) {
      groupedByPeriod[period] = {};
    }
    if (!groupedByPeriod[period][level]) {
      groupedByPeriod[period][level] = 0;
    }
    groupedByPeriod[period][level] += Number(item.count);
  });
  const periods = Object.keys(groupedByPeriod).sort();
  const uniqueLevels = Array.from(
    new Set((missionData || []).map((item) => getParsedField(item.level_title)))
  );
  const series = uniqueLevels.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: periods.map((period) => groupedByPeriod[period][level] || 0),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const missionChartOption = {
    title: {
      text: "Mission Completed Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: uniqueLevels,
      top: "bottom",
    },
    xAxis: {
      type: "category",
      data: periods,
      boundaryGap: true,
      axisLabel: {
        rotate: missionGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, missionGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: series,
  };
  const transformData = (data: MissionRow[]): TransformedPeriod[] => {
    const result: Record<string, TransformedPeriod> = {};
    data.forEach((row) => {
      const period = row.period || "Unknown";
      if (!result[period]) {
        result[period] = { period, __breakdown: {} };
      }
      const level = getParsedField(row.level_title) || "Unknown";
      const subject = getParsedField(row.subject_title);
      result[period][level] = (result[period][level] || 0) + row.count;
      if (!result[period].__breakdown![level]) {
        result[period].__breakdown![level] = {};
      }
      result[period].__breakdown![level][subject] =
        (result[period].__breakdown![level][subject] || 0) + row.count;
    });
    return Object.values(result);
  };
  const missionDataTransformed = transformData(missionData);
  const periodsMissionTransformed = (missionDataTransformed || []).map(
    (item) => item.period
  );
  const seriesMissionTransformed = uniqueLevels.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: (missionDataTransformed || []).map((item) => item[level] || 0),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const totalCountsMissions = periodsMissionTransformed.map((period) =>
    Object.values(groupedByPeriod[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeries = {
    name: "Total",
    type: "bar",
    data: totalCountsMissions,
    barGap: "-100%",
    itemStyle: {
      color: "transparent",
    },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      show: false,
    },
    emphasis: {
      disabled: true,
    },
  };
  const optionMissionTransformed = {
    title: {
      text: "Mission Submitted Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p: any) => {
          tooltipHtml += `
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="display: inline-block;
                          width: 10px;
                          height: 10px;
                          background-color: ${p.color};
                          border-radius: 2px;">
              </span>
              ${p.seriesName}: ${p.data}
            </div>
          `;
          const periodData = missionDataTransformed.find(
            (d: any) => d.period === p.axisValue
          );
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml +=
              '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(
              ([subject, count]) => {
                tooltipHtml += `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 3px;">
                  <span style="display: inline-block;
                              width: 8px;
                              height: 8px;
                              background-color: ${p.color};
                              opacity: 0.7;
                              border-radius: 1px;">
                  </span>
                  ${subject}: ${count}
                </div>
              `;
              }
            );
            tooltipHtml += "</div>";
          }
        });
        return tooltipHtml;
      },
    },
    legend: {
      data: uniqueLevels,
      top: "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "15%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: periodsMissionTransformed.map((p) =>
        formatPeriod(p, missionGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: missionGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, missionGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesMissionTransformed, totalSeries],
  };
  const [jigyasaGrouping, setJigyasaGrouping] = useState<string>("daily");
  const [jigyasaData, setJigyasaData] = useState<any[]>([]);
  const [jigyasaLoading, setJigyasaLoading] = useState<boolean>(true);
  const [jigyasaStatus, setJigyasaStatus] = useState<string>("all");
  const [selectedJigyasaSubject, setSelectedJigyasaSubject] =
    useState<string>("all");
  useEffect(() => {
    const fetchJigyasaData = async () => {
      setJigyasaLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/histogram_level_subject_jigyasa_complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: jigyasaGrouping,
              status: jigyasaStatus,
              subject:
                selectedJigyasaSubject === "all"
                  ? null
                  : selectedJigyasaSubject,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setJigyasaData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching jigyasa data:", error);
        setJigyasaData([]);
      } finally {
        setJigyasaLoading(false);
      }
    };
    fetchJigyasaData();
  }, [jigyasaGrouping, jigyasaStatus, selectedJigyasaSubject, appliedFilters]);
  const groupedByPeriodJigyasa: Record<string, Record<string, number>> = {};
  jigyasaData.forEach((item) => {
    const period = item.period;
    const level = getParsedField(item.level_title);
    if (!groupedByPeriodJigyasa[period]) {
      groupedByPeriodJigyasa[period] = {};
    }
    if (!groupedByPeriodJigyasa[period][level]) {
      groupedByPeriodJigyasa[period][level] = 0;
    }
    groupedByPeriodJigyasa[period][level] += Number(item.count);
  });
  const periodsJigyasa = Object.keys(groupedByPeriodJigyasa).sort();
  const uniqueLevelsJigyasa = Array.from(
    new Set((jigyasaData || []).map((item) => getParsedField(item.level_title)))
  );
  const seriesJigyasa = uniqueLevelsJigyasa.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: periodsJigyasa.map(
      (period) => groupedByPeriodJigyasa[period][level] || 0
    ),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const jigyasaChartOption = {
    title: {
      text: "Jigyasa Submitted Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: uniqueLevelsJigyasa,
      top: "bottom",
    },
    xAxis: {
      type: "category",
      data: periodsJigyasa,
      boundaryGap: true,
      axisLabel: {
        rotate: jigyasaGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, jigyasaGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: seriesJigyasa,
  };
  const jigyasaDataTransformed = transformData(jigyasaData);
  const periodsJigyasaTransformed = (jigyasaDataTransformed || []).map(
    (item) => item.period
  );
  const seriesJigyasaTransformed = uniqueLevelsJigyasa.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: (jigyasaDataTransformed || []).map((item) => item[level] || 0),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const totalCountsJigyasa = periodsJigyasaTransformed.map((period) =>
    Object.values(groupedByPeriodJigyasa[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeriesJigyasa = {
    name: "Total",
    type: "bar",
    data: totalCountsJigyasa,
    barGap: "-100%",
    itemStyle: {
      color: "transparent",
    },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      show: false,
    },
    emphasis: {
      disabled: true,
    },
  };
  const optionJigyasaTransformed = {
    title: {
      text: "Jigyasa Submitted Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p: any) => {
          tooltipHtml += `
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="display: inline-block;
                          width: 10px;
                          height: 10px;
                          background-color: ${p.color};
                          border-radius: 2px;">
              </span>
              ${p.seriesName}: ${p.data}
            </div>
          `;
          const periodData = jigyasaDataTransformed.find(
            (d: any) => d.period === p.axisValue
          );
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml +=
              '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(
              ([subject, count]) => {
                tooltipHtml += `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 3px;">
                  <span style="display: inline-block;
                              width: 8px;
                              height: 8px;
                              background-color: ${p.color};
                              opacity: 0.7;
                              border-radius: 1px;">
                  </span>
                  ${subject}: ${count}
                </div>
              `;
              }
            );
            tooltipHtml += "</div>";
          }
        });
        return tooltipHtml;
      },
    },
    legend: {
      data: uniqueLevelsJigyasa,
      top: "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: periodsJigyasaTransformed.map((p) =>
        formatPeriod(p, jigyasaGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: jigyasaGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, jigyasaGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesJigyasaTransformed, totalSeriesJigyasa],
  };
  const [pragyaGrouping, setPragyaGrouping] = useState<string>("daily");
  const [pragyaData, setPragyaData] = useState<any[]>([]);
  const [pragyaLoading, setPragyaLoading] = useState<boolean>(true);
  const [pragyaStatus, setPragyaStatus] = useState<string>("all");
  const [selectedPragyaSubject, setSelectedPragyaSubject] =
    useState<string>("all");
  useEffect(() => {
    const fetchPragyaData = async () => {
      setPragyaLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/histogram_level_subject_pragya_complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: pragyaGrouping,
              status: pragyaStatus,
              subject:
                selectedPragyaSubject === "all" ? null : selectedPragyaSubject,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setPragyaData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching pragya data:", error);
        setPragyaData([]);
      } finally {
        setPragyaLoading(false);
      }
    };
    fetchPragyaData();
  }, [pragyaGrouping, pragyaStatus, selectedPragyaSubject, appliedFilters]);
  const groupedByPeriodPragya: Record<string, Record<string, number>> = {};
  pragyaData.forEach((item) => {
    const period = item.period;
    const level = getParsedField(item.level_title);
    if (!groupedByPeriodPragya[period]) {
      groupedByPeriodPragya[period] = {};
    }
    if (!groupedByPeriodPragya[period][level]) {
      groupedByPeriodPragya[period][level] = 0;
    }
    groupedByPeriodPragya[period][level] += Number(item.count);
  });
  const periodsPragya = Object.keys(groupedByPeriodPragya).sort();
  const uniqueLevelsPragya = Array.from(
    new Set((pragyaData || []).map((item) => getParsedField(item.level_title)))
  );
  const seriesPragya = uniqueLevelsPragya.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: periodsPragya.map(
      (period) => groupedByPeriodPragya[period][level] || 0
    ),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const pragyaChartOption = {
    title: {
      text: "Pragya Completed Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: uniqueLevelsPragya,
      top: "bottom",
    },
    xAxis: {
      type: "category",
      data: periodsPragya,
      boundaryGap: true,
      axisLabel: {
        rotate: pragyaGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, pragyaGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: seriesPragya,
  };
  const pragyaDataTransformed = transformData(pragyaData);
  const periodsPragyaTransformed = (pragyaDataTransformed || []).map(
    (item) => item.period
  );
  const seriesPragyaTransformed = uniqueLevelsPragya.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: (pragyaDataTransformed || []).map((item) => item[level] || 0),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const totalCountsPragya = periodsPragyaTransformed.map((period) =>
    Object.values(groupedByPeriodPragya[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeriesPragya = {
    name: "Total",
    type: "bar",
    data: totalCountsPragya,
    barGap: "-100%",
    itemStyle: {
      color: "transparent",
    },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      show: false,
    },
    emphasis: {
      disabled: true,
    },
  };
  const optionPragyaTransformed = {
    title: {
      text: "Pragya Submitted Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p: any) => {
          tooltipHtml += `
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="display: inline-block;
                          width: 10px;
                          height: 10px;
                          background-color: ${p.color};
                          border-radius: 2px;">
              </span>
              ${p.seriesName}: ${p.data}
            </div>
          `;
          const periodData = pragyaDataTransformed.find(
            (d: any) => d.period === p.axisValue
          );
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml +=
              '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(
              ([subject, count]) => {
                tooltipHtml += `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 3px;">
                  <span style="display: inline-block;
                              width: 8px;
                              height: 8px;
                              background-color: ${p.color};
                              opacity: 0.7;
                              border-radius: 1px;">
                  </span>
                  ${subject}: ${count}
                </div>
              `;
              }
            );
            tooltipHtml += "</div>";
          }
        });
        return tooltipHtml;
      },
    },
    legend: {
      data: uniqueLevelsPragya,
      top: "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: periodsPragyaTransformed.map((p) =>
        formatPeriod(p, pragyaGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: pragyaGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, pragyaGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesPragyaTransformed, totalSeriesPragya],
  };
  const [quizGrouping, setQuizGrouping] = useState<string>("daily");
  const [quizData, setQuizData] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(true);
  const getParsedFieldQuiz = (raw: any): string => {
    if (typeof raw === "object" && raw !== null) {
      return raw.en || "";
    }
    if (typeof raw === "string" && raw.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.en || raw;
      } catch {
        return raw;
      }
    }
    return raw;
  };
  const [selectedQuizSubject, setSelectedQuizSubject] = useState<string>("all");
  const [quizSubjects, setQuizSubjects] = useState<
    Array<{ id: number; title: string }>
  >([]);
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/subjects_list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 1 }),
        });
        const data = await res.json();
        const parsedSubjects = Array.isArray(data)
          ? data.map((subject: any) => ({
              id: subject.id,
              title: JSON.parse(subject.title).en,
            }))
          : [];
        setQuizSubjects(parsedSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setQuizSubjects([]);
      }
    };
    fetchSubjects();
  }, []);
  useEffect(() => {
    const fetchQuizData = async () => {
      setQuizLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/histogram_topic_level_subject_quizgames_2`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: quizGrouping,
              subject:
                selectedQuizSubject === "all" ? null : selectedQuizSubject,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setQuizData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setQuizData([]);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuizData();
  }, [quizGrouping, selectedQuizSubject, appliedFilters]);
  const groupedByPeriodQuiz: Record<string, Record<string, number>> = {};
  quizData.forEach((item) => {
    const period = item.period;
    const level = getParsedFieldQuiz(item.level_title);
    if (!groupedByPeriodQuiz[period]) {
      groupedByPeriodQuiz[period] = {};
    }
    if (!groupedByPeriodQuiz[period][level]) {
      groupedByPeriodQuiz[period][level] = 0;
    }
    groupedByPeriodQuiz[period][level] += Number(item.count);
  });
  const periodsQuiz = Object.keys(groupedByPeriodQuiz).sort();
  const uniqueLevelsQuiz = Array.from(
    new Set((quizData || []).map((item) => getParsedField(item.level_title)))
  );
  const seriesQuiz = uniqueLevelsQuiz.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: periodsQuiz.map((period) => groupedByPeriodQuiz[period][level] || 0),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const quizChartOption = {
    title: {
      text: "Quiz Completed Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: uniqueLevelsQuiz,
      top: "bottom",
    },
    xAxis: {
      type: "category",
      data: periodsQuiz,
      boundaryGap: true,
      axisLabel: {
        rotate: quizGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, quizGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: seriesQuiz,
  };
  const quizDataTransformed = transformData(quizData);
  const periodsQuizTransformed = quizDataTransformed.map((item) => item.period);
  const seriesQuizTransformed = uniqueLevelsQuiz.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: quizDataTransformed.map((item) => item[level] || 0),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const totalCountsQuiz = periodsQuizTransformed.map((period) =>
    Object.values(groupedByPeriodQuiz[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeriesQuiz = {
    name: "Total",
    type: "bar",
    data: totalCountsQuiz,
    barGap: "-100%",
    itemStyle: {
      color: "transparent",
    },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      show: false,
    },
    emphasis: {
      disabled: true,
    },
  };
  const optionQuizTransformed = {
    title: {
      text: "Quiz Completed Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        let tooltipHtml = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((p: any) => {
          tooltipHtml += `
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="display: inline-block;
                          width: 10px;
                          height: 10px;
                          background-color: ${p.color};
                          border-radius: 2px;">
              </span>
              ${p.seriesName}: ${p.data}
            </div>
          `;
          const periodData = quizDataTransformed.find(
            (d: any) => d.period === p.axisValue
          );
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml +=
              '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(
              ([subject, count]) => {
                tooltipHtml += `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 3px;">
                  <span style="display: inline-block;
                              width: 8px;
                              height: 8px;
                              background-color: ${p.color};
                              opacity: 0.7;
                              border-radius: 1px;">
                  </span>
                  ${subject}: ${count}
                </div>
              `;
              }
            );
            tooltipHtml += "</div>";
          }
        });
        return tooltipHtml;
      },
    },
    legend: {
      data: uniqueLevelsQuiz,
      top: "bottom",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: periodsQuizTransformed.map((p) => formatPeriod(p, quizGrouping)),
      boundaryGap: true,
      axisLabel: {
        rotate: quizGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, quizGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesQuizTransformed, totalSeriesQuiz],
  };
  const [pointsMissionGrouping, setPointsMissionGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [pointsMissionData, setPointsMissionData] = useState<
    { period: string; points: number }[]
  >([]);
  const [pointsMissionLoading, setPointsMissionLoading] =
    useState<boolean>(true);
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsMissionLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/mission-points-over-time`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: pointsMissionGrouping,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const json = await res.json();
        setPointsMissionData(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Error loading points data", err);
        setPointsMissionData([]);
      } finally {
        setPointsMissionLoading(false);
      }
    };
    fetchPoints();
  }, [pointsMissionGrouping, appliedFilters]); //  add appliedFilters
  const pointsMissionCoinSeries = {
    name: "Points",
    type: "bar" as const,
    data: pointsMissionData.map((d) => d.points),
    barMaxWidth: "50%",
    itemStyle: { color: "#5470C6" },
  };
  const totalMissionCoinSeries = {
    name: "Total",
    type: "bar" as const,
    data: pointsMissionData.map((d) => d.points),
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const pointsMissionChartOption = {
    title: { text: "Mission Coins Over Time", left: "center" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: pointsMissionData.map((d) =>
        formatPeriod(d.period, pointsMissionGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsMissionGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, pointsMissionGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
      name: "Points",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    series: [pointsMissionCoinSeries, totalMissionCoinSeries],
  };
  const [pointsQuizGrouping, setPointsQuizGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [pointsQuizData, setPointsQuizData] = useState<
    { period: string; points: number }[]
  >([]);
  const [pointsQuizLoading, setPointsQuizLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsQuizLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/quiz-points-over-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grouping: pointsQuizGrouping,
            ...buildFilterParams(appliedFilters),
          }),
        });
        const json = await res.json();
        setPointsQuizData(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Error loading quiz coins data", err);
        setPointsQuizData([]);
      } finally {
        setPointsQuizLoading(false);
      }
    };
    fetchPoints();
  }, [pointsQuizGrouping, appliedFilters]);
  const pointsQuizCoinSeries = {
    name: "Points",
    type: "bar" as const,
    data: pointsQuizData.map((d) => d.points),
    barMaxWidth: "50%",
    itemStyle: { color: "#5470C6" },
  };
  const totalQuizCoinSeries = {
    name: "Total",
    type: "bar" as const,
    data: pointsQuizData.map((d) => d.points),
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const pointsQuizChartOption = {
    title: { text: "Quiz Coins Over Time", left: "center" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: pointsQuizData.map((d) =>
        formatPeriod(d.period, pointsQuizGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsQuizGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, pointsQuizGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
      name: "Points",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    series: [pointsQuizCoinSeries, totalQuizCoinSeries],
  };
  const [pointsJigyasaGrouping, setPointsJigyasaGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [pointsJigyasaData, setPointsJigyasaData] = useState<
    { period: string; points: number }[]
  >([]);
  const [pointsJigyasaLoading, setPointsJigyasaLoading] =
    useState<boolean>(true);
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsJigyasaLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/jigyasa-points-over-time`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: pointsJigyasaGrouping,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const json = await res.json();
        setPointsJigyasaData(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Error loading points data", err);
        setPointsJigyasaData([]);
      } finally {
        setPointsJigyasaLoading(false);
      }
    };
    fetchPoints();
  }, [pointsJigyasaGrouping, appliedFilters]);
  const pointsJigyasaCoinSeries = {
    name: "Points",
    type: "bar" as const,
    data: pointsJigyasaData.map((d) => d.points),
    barMaxWidth: "50%",
    itemStyle: { color: "#5470C6" },
  };
  const totalJigyasaCoinSeries = {
    name: "Total",
    type: "bar" as const,
    data: pointsJigyasaData.map((d) => d.points),
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const pointsJigyasaChartOption = {
    title: { text: "Jigyasa Coins Over Time", left: "center" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: pointsJigyasaData.map((d) =>
        formatPeriod(d.period, pointsJigyasaGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsJigyasaGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, pointsJigyasaGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
      name: "Points",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    series: [pointsJigyasaCoinSeries, totalJigyasaCoinSeries],
  };
  const [pointsPragyaGrouping, setPointsPragyaGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [pointsPragyaData, setPointsPragyaData] = useState<
    { period: string; points: number }[]
  >([]);
  const [pointsPragyaLoading, setPointsPragyaLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsPragyaLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/pragya-points-over-time`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: pointsPragyaGrouping,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const json = await res.json();
        setPointsPragyaData(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Error loading points data", err);
        setPointsPragyaData([]);
      } finally {
        setPointsPragyaLoading(false);
      }
    };
    fetchPoints();
  }, [pointsPragyaGrouping, appliedFilters]);
  const pointsPragyaCoinSeries = {
    name: "Points",
    type: "bar" as const,
    data: pointsPragyaData.map((d) => d.points),
    barMaxWidth: "50%",
    itemStyle: { color: "#5470C6" },
  };
  const totalPragyaCoinSeries = {
    name: "Total",
    type: "bar" as const,
    data: pointsPragyaData.map((d) => d.points),
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const pointsPragyaChartOption = {
    title: { text: "Pragya Coins Over Time", left: "center" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: pointsPragyaData.map((d) =>
        formatPeriod(d.period, pointsPragyaGrouping)
      ),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsPragyaGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, pointsPragyaGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
      name: "Points",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    series: [pointsPragyaCoinSeries, totalPragyaCoinSeries],
  };
  const [couponRedeemsGrouping, setCouponRedeemsGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [couponRedeemsData, setCouponRedeemsData] = useState<
    { period: string; coins: number }[]
  >([]);
  const [couponRedeemsLoading, setCouponRedeemsLoading] =
    useState<boolean>(true);
  useEffect(() => {
    setCouponRedeemsLoading(true);
    fetch(`${api_startpoint}/api/coupon-redeems-over-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: couponRedeemsGrouping,
        ...buildFilterParams(appliedFilters),
      }),
    })
      .then((res) => res.json())
      .then((json) =>
        setCouponRedeemsData(Array.isArray(json.data) ? json.data : [])
      )
      .catch(console.error)
      .finally(() => setCouponRedeemsLoading(false));
  }, [couponRedeemsGrouping, appliedFilters]);
  const CouponRedeemsSeries = {
    name: "Coins",
    type: "bar" as const,
    data: couponRedeemsData.map((d) => d.coins),
    barMaxWidth: "50%",
    itemStyle: { color: "#FF8C42" },
  };
  const totalCouponRedeemsSeries = {
    name: "Total",
    type: "bar" as const,
    data: couponRedeemsData.map((d) => d.coins),
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const couponRedeemsSeriesOptions = {
    title: { text: "Coupon Redeems Over Time", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: couponRedeemsData.map((d) =>
        formatPeriod(d.period, couponRedeemsGrouping)
      ),
      axisLabel: {
        rotate: couponRedeemsGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, couponRedeemsGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: { type: "value", name: "Coins" },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [CouponRedeemsSeries, totalCouponRedeemsSeries],
  };
  const [studentGrouping, setStudentGrouping] = useState<string>("monthly");
  const [studentData, setStudentData] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState<boolean>(true);
  const [allStates, setAllStates] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${api_startpoint}/api/get-all-states`)
      .then((r) => r.json())
      .then((json) =>
        setAllStates(Array.isArray(json.states) ? json.states || [] : [])
      )
      .catch(console.error);
  }, []);
  const [selectedState, setSelectedState] = useState<string>("");
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };
  useEffect(() => {
    const fetchStudentData = async () => {
      setStudentLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/demograph-students-2`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: studentGrouping,
              state: selectedState,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setStudentData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudentData([]);
      } finally {
        setStudentLoading(false);
      }
    };
    fetchStudentData();
  }, [studentGrouping, selectedState, appliedFilters]);
  const groupedByPeriodStudent: Record<string, Record<string, number>> = {};
  studentData.forEach((item) => {
    const period = item.period;
    const state = item.state;
    if (!groupedByPeriodStudent[period]) {
      groupedByPeriodStudent[period] = {};
    }
    if (!groupedByPeriodStudent[period][state]) {
      groupedByPeriodStudent[period][state] = 0;
    }
    groupedByPeriodStudent[period][state] += Number(item.count);
  });
  const periodsStudent = Object.keys(groupedByPeriodStudent).sort();
  const uniqueStatesStudent = Array.from(
    new Set(studentData.map((item) => item.state))
  );
  const generateDarkerContrastingColors = (count: number): string[] => {
    const colors: string[] = [];
    const goldenRatioConjugate = 0.618033988749895;
    let hue = Math.random();
    for (let i = 0; i < count; i++) {
      hue += goldenRatioConjugate;
      hue %= 1;
      const h = Math.round(hue * 360);
      const s = 85;
      const l = 35;
      colors.push(`hsl(${h}, ${s}%, ${l}%)`);
    }
    return colors;
  };
  const stateColors = generateDarkerContrastingColors(
    uniqueStatesStudent.length
  );
  const seriesStudent = uniqueStatesStudent.map((state, idx) => ({
    name: state,
    type: "bar",
    stack: "total",
    data: periodsStudent.map(
      (period) => groupedByPeriodStudent[period][state] || 0
    ),
  }));
  const totalCountsStudent = periodsStudent.map((period) =>
    Object.values(groupedByPeriodStudent[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeriesStudent = {
    name: "Total",
    type: "bar",
    data: totalCountsStudent,
    barGap: "-100%",
    itemStyle: {
      color: "transparent",
    },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      show: false,
    },
    emphasis: {
      disabled: true,
    },
  };
  const chartOptionStudent = {
    color: stateColors,
    title: {
      text: "Student Demographics Distribution Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      data: uniqueStatesStudent,
      top: "bottom",
      pageIconColor: "#999",
      pageIconInactiveColor: "#ccc",
      pageIconSize: 12,
      pageTextStyle: {
        color: "#333",
      },
    },
    xAxis: {
      type: "category",
      data: periodsStudent.map((p) => formatPeriod(p, studentGrouping)),
      axisLabel: {
        rotate: studentGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, studentGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesStudent, totalSeriesStudent],
  };
  const [teacherGrouping, setTeacherGrouping] = useState<string>("monthly");
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(true);
  const [selectedTeacherState, setSelectedTeacherState] = useState<string>("");
  useEffect(() => {
    const fetchTeacherData = async () => {
      setTeacherLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/demograph-teachers-2`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: teacherGrouping,
              state: selectedTeacherState,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setTeacherData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setTeacherData([]);
      } finally {
        setTeacherLoading(false);
      }
    };
    fetchTeacherData();
  }, [teacherGrouping, selectedTeacherState, appliedFilters]);
  const groupedByPeriodTeacher: Record<string, Record<string, number>> = {};
  teacherData.forEach((item) => {
    const period = item.period;
    const state = item.state;
    if (!groupedByPeriodTeacher[period]) {
      groupedByPeriodTeacher[period] = {};
    }
    if (!groupedByPeriodTeacher[period][state]) {
      groupedByPeriodTeacher[period][state] = 0;
    }
    groupedByPeriodTeacher[period][state] += Number(item.count);
  });
  const periodsTeacher = Object.keys(groupedByPeriodTeacher).sort();
  const uniqueStatesTeacher = Array.from(
    new Set(teacherData.map((item) => item.state))
  );
  const seriesTeacher = uniqueStatesTeacher.map((state, idx) => ({
    name: state,
    type: "bar",
    stack: "total",
    data: periodsTeacher.map(
      (period) => groupedByPeriodTeacher[period][state] || 0
    ),
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));
  const totalCountsTeacher = periodsTeacher.map((period) =>
    Object.values(groupedByPeriodTeacher[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeriesTeacher = {
    name: "Total",
    type: "bar",
    data: totalCountsTeacher,
    barGap: "-100%",
    itemStyle: {
      color: "transparent",
    },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      show: false,
    },
    emphasis: {
      disabled: true,
    },
  };
  const chartOptionTeacher = {
    title: {
      text: "Teacher Demographics Distribution Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      top: "bottom",
      data: uniqueStatesTeacher,
      pageIconColor: "#999",
      pageIconInactiveColor: "#ccc",
      pageIconSize: 12,
      pageTextStyle: { color: "#333" },
    },
    xAxis: {
      type: "category",
      data: periodsTeacher.map((p) => formatPeriod(p, teacherGrouping)),
      axisLabel: {
        rotate: teacherGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, teacherGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesTeacher, totalSeriesTeacher],
  };
  const [schoolGrouping, setSchoolGrouping] = useState<string>("monthly");
  const [schoolData, setSchoolData] = useState<any[]>([]);
  const [schoolLoading, setSchoolLoading] = useState<boolean>(true);
  const [selectedSchoolState, setSelectedSchoolState] = useState<string>("");
  useEffect(() => {
    const fetchSchoolData = async () => {
      setSchoolLoading(true);
      try {
        const response = await fetch(
          `${api_startpoint}/api/demograph-schools-main-dashboard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              grouping: schoolGrouping,
              state: selectedSchoolState,
              ...buildFilterParams(appliedFilters),
            }),
          }
        );
        const data = await response.json();
        setSchoolData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching school data:", error);
        setSchoolData([]);
      } finally {
        setSchoolLoading(false);
      }
    };
    fetchSchoolData();
  }, [schoolGrouping, selectedSchoolState, appliedFilters]);
  const groupedByPeriodSchool: Record<string, Record<string, number>> = {};
  schoolData.forEach((item) => {
    const period = item.period;
    const state = item.state;
    if (!groupedByPeriodSchool[period]) {
      groupedByPeriodSchool[period] = {};
    }
    if (!groupedByPeriodSchool[period][state]) {
      groupedByPeriodSchool[period][state] = 0;
    }
    groupedByPeriodSchool[period][state] += Number(item.count);
  });
  const periodsSchool = Object.keys(groupedByPeriodSchool).sort();
  const uniqueStatesSchool = Array.from(
    new Set(schoolData.map((item) => item.state))
  );
  const seriesSchool = uniqueStatesSchool.map((state, idx) => ({
    name: state,
    type: "bar",
    stack: "total",
    data: periodsSchool.map(
      (period) => groupedByPeriodSchool[period][state] || 0
    ),
    itemStyle: {
      color: generateDarkerContrastingColors(uniqueStatesSchool.length)[idx],
    },
  }));
  const totalCountsSchool = periodsSchool.map((period) =>
    Object.values(groupedByPeriodSchool[period]).reduce((sum, v) => sum + v, 0)
  );
  const totalSeriesSchool = {
    name: "Total",
    type: "bar",
    data: totalCountsSchool,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
  };
  const chartOptionSchool = {
    color: generateDarkerContrastingColors(uniqueStatesSchool.length),
    title: {
      text: "Schools Demographics Distribution Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      top: "bottom",
      data: uniqueStatesSchool,
      pageIconColor: "#999",
      pageIconInactiveColor: "#ccc",
      pageIconSize: 12,
      pageTextStyle: { color: "#333" },
    },
    xAxis: {
      type: "category",
      data: periodsSchool.map((p) => formatPeriod(p, schoolGrouping)),
      axisLabel: {
        rotate: schoolGrouping === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, schoolGrouping),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesSchool, totalSeriesSchool],
  };
  const [quizCompletes, setQuizCompletes] = useState<number>(0);
  const [tmcAssignedByTeacher, setTmcAssignedByTeacher] = useState<number>(0);
  const [tmcTotal, setTmcTotal] = useState<number>(0);
  const [tjcTotal, setTjcTotal] = useState<number>(0);
  const [tpcTotal, setTpcTotal] = useState<number>(0);
  const [tqcTotal, setTqcTotal] = useState<number>(0);
  const [trcTotal, setTrcTotal] = useState<number>(0);
  const [tpzcTotal, setTpzcTotal] = useState<number>(0);
  const [missionParticipationRate, setMissionParticipationRate] =
    useState<number>(0);
  const [jigyasaParticipationRate, setJigyasaParticipationRate] =
    useState<number>(0);
  const [pragyaParticipationRate, setPragyaParticipationRate] =
    useState<number>(0);
  const [quizParticipationRate, setQuizParticipationRate] = useState<number>(0);
  const [sessionParticipantTotal, setSessionParticipantTotal] =
    useState<number>(0);
  const [
    mentorsParticipatedSessionsTotal,
    setMentorsParticipatedSessionsTotal,
  ] = useState<number>(0);
  const [totalSessionsCreated, setTotalSessionsCreated] = useState<number>(0);
  const [modalOpenLevel, setModalOpenLevel] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("science");
  const [EchartDataLevel, setEchartDataLevel] = useState<LevelCountEntry[]>([]);
  const [groupingLevel, setGroupingLevel] = useState("monthly");
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [errorLevel, setErrorLevel] = useState<string | null>(null);
  type Level = "level1" | "level2" | "level3" | "level4";
  type FilterLevel = Level | "all";
  const [selectedLevel, setSelectedLevel] = useState<FilterLevel>("all");
  const allLevels: Level[] = ["level1", "level2", "level3", "level4"];
  const levelsToFetch: Level[] =
    selectedLevel === "all" ? allLevels : [selectedLevel];
  useEffect(() => {
    setLoadingLevel(true);
    fetch(`${api_startpoint}/api/student-count-by-level-over-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: groupingLevel,
        levels: levelsToFetch,
        ...buildFilterParams(appliedFilters),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const transformed = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              period: item.period || "Unknown",
            }))
          : [];
        setEchartDataLevel(transformed);
      })
      .catch(console.error)
      .finally(() => setLoadingLevel(false));
  }, [groupingLevel, selectedLevel, appliedFilters]);
  const levelColors: Record<Level, string> = {
    level1: "#1E3A8A",
    level2: "#3B82F6",
    level3: "#60A5FA",
    level4: "#93C5FD",
  };
  const seriesData = levelsToFetch.map((level) => ({
    name:
      level === "level1"
        ? "Level 1: Grade 1 – 5"
        : level === "level2"
        ? "Level 2: Grade 6+"
        : level === "level3"
        ? "Level 3: Grade 7+"
        : "Level 4: Grade 8+",
    type: "bar" as const,
    stack: "total" as const,
    data: EchartDataLevel.map((item) => item[`${level}_count`] || 0),
    itemStyle: { color: levelColors[level] },
  }));
  const legendData = seriesData.map((s) => s.name);
  const totalCountsLevel = EchartDataLevel.map((item) =>
    [item.level1_count, item.level2_count, item.level3_count, item.level4_count]
      .map((v) => Number(v))
      .reduce((sum, val) => sum + val, 0)
  );
  const totalSeriesCountLevel = {
    name: "Total",
    type: "bar",
    data: totalCountsLevel,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const EchartLevelOption = {
    title: {
      text: "Student Count by Level Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      orient: "horizontal",
      top: "bottom",
      bottom: 10,
      data: legendData,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: EchartDataLevel.map((item) => item.period),
      boundaryGap: groupingLevel === "lifetime" ? true : false,
      axisLabel: {
        rotate: groupingLevel === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingLevel),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesData, totalSeriesCountLevel],
  };
  const [EchartDataGender, setEchartDataGender] = useState<any[]>([]);
  const [groupingGender, setGroupingGender] = useState("monthly");
  const [loadingGender, setLoadingGender] = useState(true);
  const [errorGender, setErrorGender] = useState<string | null>(null);
  const [selectedUserTypeGender, setSelectedUserTypeGender] = useState("All");
  const fetchDataGender = (
    selectedGrouping: string,
    selectedUserTypeGender: string
  ) => {
    setLoadingGender(true);
    const filterParams = {
      grouping: selectedGrouping,
      user_type: selectedUserTypeGender,
      ...buildFilterParams(appliedFilters),
    };
    fetch(`${api_startpoint}/api/signing-user-gender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filterParams),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const groupedData = (Array.isArray(data.data) ? data.data : []).reduce(
          (acc: { [key: string]: GenderSignup }, entry: GenderSignup) => {
            const period = entry.period || "Unknown";
            if (!acc[period]) {
              acc[period] = { period, Male: 0, Female: 0, Unspecified: 0 };
            }
            acc[period].Male = entry.Male;
            acc[period].Female = entry.Female;
            acc[period].Unspecified = entry.Unspecified;
            return acc;
          },
          {}
        );
        setEchartDataGender(Object.values(groupedData));
        setLoadingGender(false);
      })
      .catch((err) => {
        setErrorGender(err.message);
        setLoadingGender(false);
        setEchartDataGender([]);
      });
  };
  useEffect(() => {
    fetchDataGender(groupingGender, selectedUserTypeGender);
  }, [groupingGender, selectedUserTypeGender, appliedFilters]);
  const periodsGender = EchartDataGender.map((item) => item.period);
  const totalCountsGender = EchartDataGender.map(
    (item) =>
      Number(item.Male || 0) +
      Number(item.Female || 0) +
      Number(item.Unspecified || 0)
  );
  const totalSeriesGender = {
    name: "Total",
    type: "bar",
    data: totalCountsGender,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      distance: 5,
      formatter: "{c}",
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1,
  };
  const EchartGenderOption = {
    title: {
      text: "User Signups by Gender Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      top: "bottom",
      data: ["Male", "Female", "Unspecified"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: EchartDataGender.map((item) => item.period),
      boundaryGap: groupingGender === "lifetime" ? true : false,
      axisLabel: {
        rotate: groupingGender === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingGender),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [
      {
        name: "Male",
        type: "bar",
        stack: "total",
        data: EchartDataGender.map((item) => item.Male || 0),
        itemStyle: { color: "#1E3A8A" },
      },
      {
        name: "Female",
        type: "bar",
        stack: "total",
        data: EchartDataGender.map((item) => item.Female || 0),
        itemStyle: { color: "#DB2777" },
      },
      {
        name: "Unspecified",
        type: "bar",
        stack: "total",
        data: EchartDataGender.map((item) => item.Unspecified || 0),
        itemStyle: { color: "#6B7280" },
      },
      totalSeriesGender,
    ],
  };
  const chartRef1 = useRef<ReactECharts | null>(null);
  const chartRef2 = useRef<ReactECharts | null>(null);
  const chartRef3 = useRef<ReactECharts | null>(null);
  const chartRef4 = useRef<ReactECharts | null>(null);
  const chartRef5 = useRef<ReactECharts | null>(null);
  const chartRef6 = useRef<ReactECharts | null>(null);
  const chartRef7 = useRef<ReactECharts | null>(null);
  const chartRef8 = useRef<ReactECharts | null>(null);
  const chartRef9 = useRef<ReactECharts | null>(null);
  const chartRef10 = useRef<ReactECharts | null>(null);
  const chartRef11 = useRef<ReactECharts | null>(null);
  const chartRef12 = useRef<ReactECharts | null>(null);
  const chartRef13 = useRef<ReactECharts | null>(null);
  const chartRef14 = useRef<ReactECharts | null>(null);
  const chartRef15 = useRef<ReactECharts | null>(null);
  const chartRef16 = useRef<ReactECharts | null>(null);
  const chartRef17 = useRef<ReactECharts | null>(null);
  const chartRef18 = useRef<ReactECharts | null>(null);
  const chartRef19 = useRef<ReactECharts | null>(null);
  const chartRef20 = useRef<ReactECharts | null>(null);
  const handleDownloadChart = (
    chartRef: React.RefObject<ReactECharts | null>,
    filename: string
  ) => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      const imgData = echartsInstance.getDataURL({
        type: "png",
        pixelRatio: 2,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.href = imgData;
      link.download = filename;
      link.click();
    }
  };
  const PBLgroupings = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
    "lifetime",
  ];
  const statusOptionsPBL = ["all", "submitted", "approved", "rejected"];
  interface PBLSubmissionData {
    period: string;
    count: number;
  }
  const [groupingPBL, setGroupingPBL] = useState<string>("monthly");
  const [statusPBL, setStatusPBL] = useState<string>("all");
  const [dataPBL, setDataPBL] = useState<PBLSubmissionData[]>([]);
  const [loadingPBL, setLoadingPBL] = useState<boolean>(true);
  useEffect(() => {
    setLoadingPBL(true);
    const filterParams = buildFilterParams(appliedFilters);
    fetch(`${api_startpoint}/api/PBLsubmissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: groupingPBL,
        status: statusPBL,
        ...buildFilterParams(appliedFilters),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setDataPBL(Array.isArray(json.data) ? json.data : []);
        setLoadingPBL(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingPBL(false);
        setDataPBL([]);
      });
  }, [groupingPBL, statusPBL, appliedFilters]);
  const chartOptionPBL = {
    title: { text: "PBL Submissions Over Time", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dataPBL.map((p) => formatPeriod(p.period, groupingPBL)),
      axisLabel: {
        rotate: groupingPBL === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingPBL),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [
      {
        name: "Count",
        type: "bar",
        data: dataPBL.map((d) => d.count),
        label: {
          show: true,
          position: "top",
        },
      },
    ],
  };
  const [totalCountPBL, setTotalCountPBL] = useState<number>(0);
  interface StatRowVision {
    period: string;
    count: number;
  }
  interface LevelDataVision {
    level: string;
    count: number;
    subjects: { subject: string; count: number }[];
  }
  interface PeriodDataVision {
    period: string;
    levels: LevelDataVision[];
  }
  interface Subject {
    id: number;
    title: string;
  }
  const [statsVision, setStatsVision] = useState<PeriodDataVision[]>([]);
  const [groupingVision, setGroupingVision] = useState("daily");
  const [visionStatus, setVisionStatus] = useState<string>("all");
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [assignedBy, setAssignedBy] = useState<"all" | "teacher" | "self">(
    "all"
  );
  const [visionLoading, setVisionLoading] = useState(false);
  useEffect(() => {
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 1 }),
    })
      .then((res) => res.json())
      .then((data) => setSubjectList(Array.isArray(data) ? data : []));
  }, []);
  useEffect(() => {
    setVisionLoading(true);
    const requestBody = {
      ...buildFilterParams(appliedFilters),
      grouping: groupingVision,
      assigned_by: assignedBy !== "all" ? assignedBy : undefined,
      subject_id: subjectId ? subjectId.toString() : undefined,
      status: visionStatus !== "all" ? visionStatus : undefined,
    };
    fetch(`${api_startpoint}/api/vision-completion-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((json) => {
        setStatsVision(Array.isArray(json.data) ? json.data : []);
        setVisionLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch vision stats:", err);
        setVisionLoading(false);
        setStatsVision([]);
      });
  }, [groupingVision, subjectId, assignedBy, visionStatus, appliedFilters]);
  const periodsVision = (statsVision || []).map((d) => d.period);
  const levelsVision = Array.from(
    new Set((statsVision || []).flatMap((d) => d.levels.map((l) => l.level)))
  );
  const seriesVision: any[] = levelsVision.map((level) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: (statsVision || []).map((d) => {
      const lvl = d.levels.find((l) => l.level === level);
      return lvl ? lvl.count : 0;
    }),
  }));
  const totalsVision = (statsVision || []).map((d) =>
    d.levels.reduce((sum, lvl) => sum + lvl.count, 0)
  );
  const totalSeriesVision = {
    name: "Total",
    type: "bar",
    data: totalsVision,
    barGap: "-100%",
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top",
      formatter: "{c}",
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
  };
  const tooltipVision = {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: any[]) => {
      const idx = params[0].dataIndex;
      const pd = (statsVision || [])[idx];
      if (!pd) return "";
      let txt = `<strong>${pd.period}</strong><br/>`;
      pd.levels.forEach((lvl: any) => {
        const sb = lvl.status_breakdown || {};
        txt +=
          `<b>${lvl.level}:</b> ${lvl.count} ` +
          `(Approved: ${sb.approved || 0} | Rejected: ${
            sb.rejected || 0
          } | Requested: ${sb.requested || 0})<br/>`;
        lvl.subjects.forEach((sub: any) => {
          const ssb = sub.status_breakdown || {};
          txt +=
            `&nbsp;&nbsp; ${sub.subject}: ${sub.count} ` +
            `(Approved: ${ssb.approved || 0} | Rejected: ${
              ssb.rejected || 0
            } | Requested: ${ssb.requested || 0})<br/>`;
        });
      });
      return txt;
    },
  };
  const optionVision = {
    title: { text: "Vision Submitted Over Time", left: "center" },
    tooltip: tooltipVision,
    legend: { data: levelsVision, bottom: 0 },
    xAxis: {
      type: "category",
      data: periodsVision.map((p) => formatPeriod(p, groupingVision)),
      axisLabel: {
        rotate: groupingVision === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingVision),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: { type: "value", name: "Users Completed" },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [...seriesVision, totalSeriesVision],
  };
  interface ScoreRow {
    period: string;
    total_score: number;
  }
  const [groupingVisionScore, setGroupingVisionScore] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("daily");
  const [VisionScore, setVisionScore] = useState<ScoreRow[]>([]);
  const [VisionScoreLoading, setVisionScoreLoading] = useState(false);
  useEffect(() => {
    setVisionScoreLoading(true);
    const filterParams = buildFilterParams(appliedFilters);
    fetch(`${api_startpoint}/api/vision-score-stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: groupingVisionScore,
        ...buildFilterParams(appliedFilters),
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setVisionScore(Array.isArray(json.data) ? json.data : []);
        setVisionScoreLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch vision scores stats:", err);
        setVisionScoreLoading(false);
        setVisionScore([]);
      });
  }, [groupingVisionScore, appliedFilters]);
  const periodsVisionScore = VisionScore.map((d) => d.period);
  const scoresVisionScore = VisionScore.map((d) => d.total_score);
  const optionVisionScore = {
    title: { text: "Vision Coins Over Time", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "line" } },
    xAxis: {
      type: "category",
      data: periodsVisionScore.map((p) => formatPeriod(p, groupingVisionScore)),
      axisLabel: {
        rotate: groupingVisionScore === "daily" ? 45 : 30,
        formatter: (value: string) =>
          formatWeeklyXAxisLabel(value, groupingVisionScore),
        rich: {
          a: { fontWeight: "bold", fontSize: 11, lineHeight: 16 },
          b: { fontSize: 10, color: "#666", lineHeight: 14 },
        },
        margin: 20,
      },
    },
    yAxis: { type: "value", name: "Score" },
    series: [
      {
        name: "Score",
        type: "line",
        data: scoresVisionScore,
        smooth: true,
        label: { show: true, position: "top", formatter: "{c}" },
      },
    ],
  };
  const [totalVisionScore, setTotalVisionScore] = useState<number>(0);
  const [totalVisionSubmitted, setTotalVisionSubmitted] = useState<number>(0);
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const timestamp = new Date().toISOString();
    const metadataSheet = XLSX.utils.aoa_to_sheet([
      ["Dashboard Export Report"],
      ["Export Date:", new Date().toLocaleString()],
      ["Filters Applied:"],
      ["State:", appliedFilters.state || "All"],
      ["City:", appliedFilters.city || "All"],
      ["School:", appliedFilters.schoolCode || "All"],
      ["User Type:", appliedFilters.userType || "All"],
      ["Grade:", appliedFilters.grade || "All"],
      ["Gender:", appliedFilters.gender || "All"],
      ["Date Range:", appliedFilters.dateRange || "All"],
      [],
      ["Summary Metrics:"],
      ["Total Users:", totalUsers],
      ["Active Users:", activeUsers],
      ["New Signups:", newSignups],
      ["Approval Rate:", approvalRate + "%"],
      ["Total Vision Score:", totalVisionScore],
      ["Total Vision Submitted:", totalVisionSubmitted],
    ]);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, "Summary");
    // Export User Signups Over Time
    if (Array.isArray(EchartData) && EchartData.length > 0) {
      const signupData = EchartData.map((item) => ({
        Period: item.period,
        Count: item.count,
        Admin: item.Admin || 0,
        Student: item.Student || 0,
        Mentor: item.Mentor || 0,
        Teacher: item.Teacher || 0,
        Unspecified: item.Unspecified || 0,
      }));
      const signupSheet = XLSX.utils.json_to_sheet(signupData);
      XLSX.utils.book_append_sheet(workbook, signupSheet, "User Signups");
    }
    // Export Coupon Redemption Data
    if (Array.isArray(couponRedeemCount) && couponRedeemCount.length > 0) {
      const couponData = couponRedeemCount.map((item) => ({
        Amount: item.amount,
        Count: item.coupon_count,
      }));
      const couponSheet = XLSX.utils.json_to_sheet(couponData);
      XLSX.utils.book_append_sheet(workbook, couponSheet, "Coupon Redemptions");
    }
    // Export School State Distribution
    if (Array.isArray(stateCounts) && stateCounts.length > 0) {
      const stateData = stateCounts.map((item) => ({
        State: item.state,
        School_Count: item.count_state,
      }));
      const stateSheet = XLSX.utils.json_to_sheet(stateData);
      XLSX.utils.book_append_sheet(workbook, stateSheet, "Schools by State");
    }
    // Export User Type Distribution
    if (Array.isArray(userTypeData) && userTypeData.length > 0) {
      const userTypeSheet = XLSX.utils.json_to_sheet(userTypeData);
      XLSX.utils.book_append_sheet(workbook, userTypeSheet, "User Types");
    }
    // Export Students by Grade Over Time
    if (Array.isArray(EchartDataGrade) && EchartDataGrade.length > 0) {
      const gradeSheet = XLSX.utils.json_to_sheet(EchartDataGrade);
      XLSX.utils.book_append_sheet(workbook, gradeSheet, "Students by Grade");
    }
    // Export Teachers by Grade Over Time
    if (
      Array.isArray(EchartDataTeacherGrade) &&
      EchartDataTeacherGrade.length > 0
    ) {
      const teacherGradeSheet = XLSX.utils.json_to_sheet(
        EchartDataTeacherGrade
      );
      XLSX.utils.book_append_sheet(
        workbook,
        teacherGradeSheet,
        "Teachers by Grade"
      );
    }
    // Export Students by State
    if (Array.isArray(chartStudentsData) && chartStudentsData.length > 0) {
      const studentStateData = chartStudentsData.map((item) => ({
        State: item.code,
        Student_Count: item.value,
      }));
      const studentStateSheet = XLSX.utils.json_to_sheet(studentStateData);
      XLSX.utils.book_append_sheet(
        workbook,
        studentStateSheet,
        "Students by State"
      );
    }
    // Export Teachers by State
    if (Array.isArray(chartTeacherData) && chartTeacherData.length > 0) {
      const teacherStateData = chartTeacherData.map((item) => ({
        State: item.code,
        Teacher_Count: item.value,
      }));
      const teacherStateSheet = XLSX.utils.json_to_sheet(teacherStateData);
      XLSX.utils.book_append_sheet(
        workbook,
        teacherStateSheet,
        "Teachers by State"
      );
    }
    // Export Mission Data
    if (Array.isArray(missionData) && missionData.length > 0) {
      const missionSheet = XLSX.utils.json_to_sheet(missionData);
      XLSX.utils.book_append_sheet(workbook, missionSheet, "Mission Data");
    }
    // Export Jigyasa Data
    if (Array.isArray(jigyasaData) && jigyasaData.length > 0) {
      const jigyasaSheet = XLSX.utils.json_to_sheet(jigyasaData);
      XLSX.utils.book_append_sheet(workbook, jigyasaSheet, "Jigyasa Data");
    }
    // Export Pragya Data
    if (Array.isArray(pragyaData) && pragyaData.length > 0) {
      const pragyaSheet = XLSX.utils.json_to_sheet(pragyaData);
      XLSX.utils.book_append_sheet(workbook, pragyaSheet, "Pragya Data");
    }
    // Export Quiz Data
    if (Array.isArray(quizData) && quizData.length > 0) {
      const quizSheet = XLSX.utils.json_to_sheet(quizData);
      XLSX.utils.book_append_sheet(workbook, quizSheet, "Quiz Data");
    }
    // Export Vision Statistics
    if (Array.isArray(statsVision) && statsVision.length > 0) {
      const visionSheet = XLSX.utils.json_to_sheet(statsVision);
      XLSX.utils.book_append_sheet(workbook, visionSheet, "Vision Statistics");
    }
    // Export Points Data
    if (Array.isArray(pointsMissionData) && pointsMissionData.length > 0) {
      const missionPointsSheet = XLSX.utils.json_to_sheet(pointsMissionData);
      XLSX.utils.book_append_sheet(
        workbook,
        missionPointsSheet,
        "Mission Points"
      );
    }
    if (Array.isArray(pointsQuizData) && pointsQuizData.length > 0) {
      const quizPointsSheet = XLSX.utils.json_to_sheet(pointsQuizData);
      XLSX.utils.book_append_sheet(workbook, quizPointsSheet, "Quiz Points");
    }
    if (Array.isArray(pointsJigyasaData) && pointsJigyasaData.length > 0) {
      const jigyasaPointsSheet = XLSX.utils.json_to_sheet(pointsJigyasaData);
      XLSX.utils.book_append_sheet(
        workbook,
        jigyasaPointsSheet,
        "Jigyasa Points"
      );
    }
    if (Array.isArray(pointsPragyaData) && pointsPragyaData.length > 0) {
      const pragyaPointsSheet = XLSX.utils.json_to_sheet(pointsPragyaData);
      XLSX.utils.book_append_sheet(
        workbook,
        pragyaPointsSheet,
        "Pragya Points"
      );
    }
    // Export Coupon Redeems Data
    if (Array.isArray(couponRedeemsData) && couponRedeemsData.length > 0) {
      const couponRedeemsSheet = XLSX.utils.json_to_sheet(couponRedeemsData);
      XLSX.utils.book_append_sheet(
        workbook,
        couponRedeemsSheet,
        "Coupon Redeems"
      );
    }
    const filename = `Dashboard_Export_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };
  // Apply filters handler with loading state
  const handleApplyFilters = async () => {
    setApplyingFilters(true);
    setAppliedFilters({ ...globalFilters });
    // Wait for data to reload
    await loadDashboardData();
    setApplyingFilters(false); // Reset after done
  };
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            <div className="page-header mb-4 mt-0">
              <div className="row align-items-center">
                <div className="col">
                  <h2 className="page-title mb-1 fw-bold text-dark">
                    Dashboard Overview
                  </h2>
                  <p className="text-muted mb-0">
                    Platform statistics and analytics
                  </p>
                </div>
              </div>
            </div>
            <div className="card mb-4 shadow-sm border-0">
              <div className="card-body">
                <div className="row align-items-center mb-3">
                  <div className="col">
                    <h5 className="fw-bold mb-0">Dashboard Filters</h5>
                  </div>
                  <div className="col-auto">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={exportDashboardData}
                      >
                        <IconDownload size={16} className="me-1" />
                        Export Data
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleApplyFilters}
                        disabled={
                          applyingFilters ||
                          (globalFilters.state === appliedFilters.state &&
                            globalFilters.city === appliedFilters.city &&
                            globalFilters.schoolCode ===
                              appliedFilters.schoolCode &&
                            globalFilters.userType ===
                              appliedFilters.userType &&
                            globalFilters.grade === appliedFilters.grade &&
                            globalFilters.gender === appliedFilters.gender &&
                            globalFilters.dateRange ===
                              appliedFilters.dateRange &&
                            globalFilters.startDate ===
                              appliedFilters.startDate &&
                            globalFilters.endDate === appliedFilters.endDate)
                        }
                      >
                        {applyingFilters ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Applying...
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={async () => {
                          const clearedFilters = {
                            state: "All",
                            city: "All",
                            schoolCode: "",
                            userType: "All",
                            dateRange: "All",
                            startDate: "",
                            endDate: "",
                            grade: "All",
                            gender: "All",
                          };
                          setGlobalFilters(clearedFilters);
                          setAppliedFilters(clearedFilters); //  Critical!
                          setAvailableCities(["All"]); // optional: reset dependent UI
                          await loadDashboardData(); // Reload with cleared filters
                        }}
                        disabled={
                          globalFilters.state === "All" &&
                          globalFilters.city === "All" &&
                          !globalFilters.schoolCode.trim() &&
                          globalFilters.userType === "All" &&
                          globalFilters.grade === "All" &&
                          globalFilters.dateRange === "All" &&
                          globalFilters.gender === "All" &&
                          !globalFilters.startDate &&
                          !globalFilters.endDate
                        }
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium text-muted">
                      State
                    </label>
                    <select
                      className="form-select border-2"
                      value={globalFilters.state}
                      onChange={(e) => {
                        setGlobalFilters((prev) => ({
                          ...prev,
                          state: e.target.value,
                          city: "All",
                          schoolCode: "",
                        }));
                        if (e.target.value === "All") {
                          setAvailableCities(["All"]);
                        } else {
                          fetchCitiesForState(e.target.value);
                        }
                      }}
                    >
                      {availableStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium text-muted">
                      City
                    </label>
                    <select
                      className="form-select border-2"
                      value={globalFilters.city}
                      onChange={(e) =>
                        setGlobalFilters((prev) => ({
                          ...prev,
                          city: e.target.value,
                          schoolCode: "",
                        }))
                      }
                      disabled={globalFilters.state === "All"}
                    >
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-medium text-muted">
                      School Code
                    </label>
                    <input
                      type="text"
                      className="form-control border-2"
                      value={globalFilters.schoolCode}
                      onChange={(e) =>
                        setGlobalFilters((prev) => ({
                          ...prev,
                          schoolCode: e.target.value,
                        }))
                      }
                      placeholder="Enter school code..."
                    />
                  </div>
                </div>
                <div className="row g-3 mt-2">
                  <div className="col-md-3">
                    <label className="form-label fw-medium text-muted">
                      User Type
                    </label>
                    <select
                      className="form-select border-2"
                      value={globalFilters.userType}
                      onChange={(e) =>
                        setGlobalFilters((prev) => ({
                          ...prev,
                          userType: e.target.value,
                        }))
                      }
                    >
                      {userTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium text-muted">
                      Grade
                    </label>
                    <select
                      className="form-select border-2"
                      value={globalFilters.grade}
                      onChange={(e) =>
                        setGlobalFilters((prev) => ({
                          ...prev,
                          grade: e.target.value,
                        }))
                      }
                    >
                      {availableGrades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium text-muted">
                      Gender
                    </label>
                    <select
                      className="form-select border-2"
                      value={globalFilters.gender}
                      onChange={(e) =>
                        setGlobalFilters((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                    >
                      <option value="All">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-medium text-muted">
                      Date Range
                    </label>
                    <select
                      className="form-select border-2"
                      value={globalFilters.dateRange}
                      onChange={(e) => {
                        const value = e.target.value;
                        setGlobalFilters((prev) => ({
                          ...prev,
                          dateRange: value,
                          startDate: value !== "custom" ? "" : prev.startDate,
                          endDate: value !== "custom" ? "" : prev.endDate,
                        }));
                      }}
                    >
                      <option value="All">All Time</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last3months">Last 3 Months</option>
                      <option value="last6months">Last 6 Months</option>
                      <option value="lastyear">Last Year</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>
                  {globalFilters.dateRange === "custom" && (
                    <>
                      <div className="col-md-2">
                        <label className="form-label fw-medium text-muted">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="form-control border-2"
                          value={globalFilters.startDate}
                          onChange={(e) =>
                            setGlobalFilters((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          max={
                            globalFilters.endDate ||
                            new Date().toISOString().split("T")[0]
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label fw-medium text-muted">
                          End Date
                        </label>
                        <input
                          type="date"
                          className="form-control border-2"
                          value={globalFilters.endDate}
                          onChange={(e) =>
                            setGlobalFilters((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          min={globalFilters.startDate}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted fw-medium">
                    <span className="me-2">Active filters:</span>
                    {appliedFilters.state !== "All" && (
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary me-2">
                        State: {appliedFilters.state}
                      </span>
                    )}
                    {appliedFilters.city !== "All" && (
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary me-2">
                        City: {appliedFilters.city}
                      </span>
                    )}
                    {appliedFilters.schoolCode?.trim() && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary me-2">
                        School Code: {appliedFilters.schoolCode.trim()}
                      </span>
                    )}
                    {appliedFilters.userType !== "All" && (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success me-2">
                        User Type: {appliedFilters.userType}
                      </span>
                    )}
                    {appliedFilters.grade !== "All" && (
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning me-2">
                        Grade: {appliedFilters.grade}
                      </span>
                    )}
                    {appliedFilters.gender !== "All" && (
                      <span className="badge bg-purple bg-opacity-10 text-purple border border-purple me-2">
                        Gender: {appliedFilters.gender}
                      </span>
                    )}
                    {appliedFilters.dateRange !== "All" &&
                      appliedFilters.dateRange !== "custom" && (
                        <span className="badge bg-info bg-opacity-10 text-info border border-info me-2">
                          Date Range: {appliedFilters.dateRange}
                        </span>
                      )}
                    {appliedFilters.startDate && appliedFilters.endDate && (
                      <span className="badge bg-info bg-opacity-10 text-info border border-info me-2">
                        Custom: {appliedFilters.startDate} to{" "}
                        {appliedFilters.endDate}
                      </span>
                    )}
                    {appliedFilters.state === "All" &&
                      appliedFilters.city === "All" &&
                      !appliedFilters.schoolCode?.trim() &&
                      appliedFilters.userType === "All" &&
                      appliedFilters.grade === "All" &&
                      appliedFilters.dateRange === "All" &&
                      appliedFilters.gender === "All" &&
                      !appliedFilters.startDate &&
                      !appliedFilters.endDate && (
                        <span className="text-muted">
                          No filters applied showing all data
                        </span>
                      )}
                  </small>
                </div>
              </div>
            </div>
            <div className="row g-4 mb-4">
              {[
                {
                  title: "Total Users",
                  value: totalUsers,
                  icon: <IconUsers />,
                  color: "bg-purple",
                },
                {
                  title: "Total Coins Earned",
                  value: totalPointsEarned,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Coins Redeemed",
                  value: totalPointsRedeemed,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total No. of Schools",
                  value: schoolCount,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Teacher Assign Mission Completes",
                  value: tmcAssignedByTeacher,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total No. of Quiz Completes",
                  value: quizCompletes,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Sessions Created by Mentors",
                  value: totalSessionsCreated,
                  icon: <IconPercentage />,
                  color: "bg-blue",
                },
                {
                  title: "Total Participants Joined Mentor Sessions",
                  value: sessionParticipantTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title:
                    "Total Mentors Participated for Mentor Connect Sessions",
                  value: mentorsParticipatedSessionsTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Teachers",
                  value: totalTeachers,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Students",
                  value: totalStudents,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Mission Completes",
                  value: tmcTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Jigyasa Completes",
                  value: tjcTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Pragya Completes",
                  value: tpcTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Quiz Completes",
                  value: tqcTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Riddle Completes",
                  value: trcTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Puzzle Completes",
                  value: tpzcTotal,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total PBL Mission Completes",
                  value: totalCountPBL,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Mission Participation Rate",
                  value: missionParticipationRate,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                  suffix: "%",
                },
                {
                  title: "Quiz Participation Rate",
                  value: quizParticipationRate,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                  suffix: "%",
                },
                {
                  title: "Jigyasa Participation Rate",
                  value: jigyasaParticipationRate,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                  suffix: "%",
                },
                {
                  title: "Pragya Participation Rate",
                  value: pragyaParticipationRate,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                  suffix: "%",
                },
                {
                  title: "Total Vision Completes",
                  value: totalVisionSubmitted,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Vision Coins Earned",
                  value: totalVisionScore,
                  icon: <IconPercentage />,
                  color: "bg-sky-900",
                },
              ].map((metric, index) => (
                <div className="col-sm-6 col-lg-3" key={index}>
                  {loadingPhase1 ? (
                    <MetricCardSkeleton />
                  ) : (
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="subheader">{metric.title}</div>
                            <div className="h1 mb-3">
                              <NumberFlow
                                value={Number(metric.value) || 0}
                                suffix={metric.suffix || ""}
                                className="fw-semi-bold text-dark"
                                transformTiming={{
                                  endDelay: 6,
                                  duration: 750,
                                  easing: "cubic-bezier(0.42, 0, 0.58, 1)",
                                }}
                                format={{
                                  notation:
                                    metric.value > 999999
                                      ? "compact"
                                      : "standard",
                                  compactDisplay: "short",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {mounted && (
              <div className="row g-4">
                {/* ... all chart components remain unchanged, but now use appliedFilters */}
                {/* Example: User Signups Chart */}
                <div className="w-full h-45">
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="grouping-select">
                      Select Time Grouping:{" "}
                    </label>
                    <select
                      id="grouping-select"
                      value={grouping}
                      onChange={(e) => setGrouping(e.target.value)}
                      className="mr-4"
                    >
                      {groupings.map((g) => (
                        <option key={g} value={g}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="user-type-select" className="mr-2">
                      User Type:
                    </label>
                    <select
                      id="user-type-select"
                      value={selectedUserType}
                      onChange={(e) => setSelectedUserType(e.target.value)}
                    >
                      {userTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        handleDownloadChart(
                          chartRef1,
                          "User_signups_by_type_graph"
                        )
                      }
                      className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                  {loading ? (
                    <div className="text-center">
                      <div
                        className="spinner-border text-purple"
                        role="status"
                        style={{ width: "8rem", height: "8rem" }}
                      ></div>
                    </div>
                  ) : error ? (
                    <div>Error: {error}</div>
                  ) : (
                    <LazyChart
                      ref={chartRef1}
                      option={EchartOption}
                      style={{ height: "400px", width: "100%" }}
                      loading={loadingPhase2}
                    />
                  )}
                </div>
                {/* ... repeat for all other charts — they already use appliedFilters via useEffect dependencies */}
                {/* Gender Chart */}
                <div className="w-full h-45">
                  <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="grouping-gender-select">
                      Select Time Grouping:{" "}
                    </label>
                    <select
                      id="grouping-gender-select"
                      value={groupingGender}
                      onChange={(e) => setGroupingGender(e.target.value)}
                    >
                      {groupings.map((g) => (
                        <option key={g} value={g}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="user-type-select" className="mr-2">
                      User Type:
                    </label>
                    <select
                      id="user-type-select"
                      value={selectedUserTypeGender}
                      onChange={(e) =>
                        setSelectedUserTypeGender(e.target.value)
                      }
                    >
                      {userTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        handleDownloadChart(chartRef2, "user_signups_by_gender")
                      }
                      className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                  {loadingGender ? (
                    <div style={{ textAlign: "center" }}>
                      <div
                        className="spinner-border text-purple"
                        role="status"
                        style={{ width: "8rem", height: "8rem" }}
                      ></div>
                    </div>
                  ) : error ? (
                    <div>Error: {errorGender}</div>
                  ) : (
                    <LazyChart
                      ref={chartRef2}
                      option={EchartGenderOption}
                      style={{ height: "400px", width: "100%" }}
                      loading={loadingGender || loadingPhase2}
                    />
                  )}
                </div>
                {/* Histogram Level Subject Challenges completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Mission Submissions
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef3,
                            "missions_completed_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    {/* <h2 className="text-2xl font-bold mb-4">Mission Completes Histogram</h2> */}
                    {/* Grouping filter dropdown */}
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="mission-grouping-select"
                        style={{ marginRight: "10px" }}
                      >
                        Select Time Grouping:
                      </label>
                      <select
                        id="mission-grouping-select"
                        value={missionGrouping}
                        onChange={(e) => setMissionGrouping(e.target.value)}
                      >
                        {missionGroupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="mission-status-select"
                        style={{ marginLeft: "20px", marginRight: "10px" }}
                      >
                        Status:
                      </label>
                      <select
                        id="mission-status-select"
                        value={missionStatus}
                        onChange={(e) => setMissionStatus(e.target.value)}
                      >
                        {missionStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="mission-subject-select"
                        style={{ marginLeft: "20px", marginRight: "10px" }}
                      >
                        Subject:
                      </label>
                      <select
                        id="mission-subject-select"
                        value={selectedMissionSubject}
                        onChange={(e) =>
                          setSelectedMissionSubject(e.target.value)
                        }
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map((subject) => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Mission Completed Chart */}
                    {missionLoading ? (
                      <div className="text-center">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef3}
                        option={optionMissionTransformed}
                        style={{ height: "400px", width: "100%" }}
                        loading={missionLoading || loadingPhase3}
                      />
                    )}
                  </div>
                </div>
                {/* Histogram Level Subject Quiz completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Quiz Completed
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(chartRef4, "quiz_completed_graph")
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    {/* Dropdown to change grouping */}
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="quiz-grouping-select"
                        style={{ marginRight: "10px" }}
                      >
                        Select Time Grouping:
                      </label>
                      <select
                        id="quiz-grouping-select"
                        value={quizGrouping}
                        onChange={(e) => setQuizGrouping(e.target.value)}
                      >
                        {quizGroupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="quiz-subject-select"
                        style={{ marginLeft: "20px", marginRight: "10px" }}
                      >
                        Subject:
                      </label>
                      <select
                        id="quiz-subject-select"
                        value={selectedQuizSubject}
                        onChange={(e) => setSelectedQuizSubject(e.target.value)}
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map((subject) => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {quizLoading ? (
                      <div className="text-center">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef4}
                        option={optionQuizTransformed}
                        style={{ height: "400px", width: "100%" }}
                        loading={quizLoading || loadingPhase3}
                      />
                    )}
                  </div>
                </div>
                {/* Histogram Level Subject Jigyasa completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Jigyasa Submitted
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef5,
                            "jigyasa_completed_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    {/* <h2 className="text-2xl font-bold mb-4">Mission Completes Histogram</h2> */}
                    {/* Grouping filter dropdown */}
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="jigyasa-grouping-select"
                        style={{ marginRight: "10px" }}
                      >
                        Select Time Grouping:
                      </label>
                      <select
                        id="jigyasa-grouping-select"
                        value={jigyasaGrouping}
                        onChange={(e) => setJigyasaGrouping(e.target.value)}
                      >
                        {jigyasaGroupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="jigyasa-status-select"
                        style={{ marginLeft: "20px" }}
                      >
                        Status:
                      </label>
                      <select
                        id="jigyasa-status-select"
                        value={jigyasaStatus}
                        onChange={(e) => setJigyasaStatus(e.target.value)}
                      >
                        {missionStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="jigyasa-subject-select"
                        style={{ marginLeft: "20px", marginRight: "10px" }}
                      >
                        Subject:
                      </label>
                      <select
                        id="jigyasa-subject-select"
                        value={selectedJigyasaSubject}
                        onChange={(e) =>
                          setSelectedJigyasaSubject(e.target.value)
                        }
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map((subject) => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Mission Completed Chart */}
                    {jigyasaLoading ? (
                      <div className="text-center">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef5}
                        option={optionJigyasaTransformed}
                        style={{ height: "400px", width: "100%" }}
                        loading={jigyasaLoading || loadingPhase3}
                      />
                    )}
                  </div>
                </div>
                {/* Histogram Level Subject Pragya completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Pragya Submitted
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef6,
                            "pragya_completed_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    {/* <h2 className="text-2xl font-bold mb-4">Mission Completes Histogram</h2> */}
                    {/* Grouping filter dropdown */}
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="pragya-grouping-select"
                        style={{ marginRight: "10px" }}
                      >
                        Select Time Grouping:
                      </label>
                      <select
                        id="pragya-grouping-select"
                        value={pragyaGrouping}
                        onChange={(e) => setPragyaGrouping(e.target.value)}
                      >
                        {pragyaGroupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="pragya-status-select"
                        style={{ marginLeft: "20px" }}
                      >
                        Status:
                      </label>
                      <select
                        id="pragya-status-select"
                        value={pragyaStatus}
                        onChange={(e) => setPragyaStatus(e.target.value)}
                      >
                        {missionStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="pragya-subject-select"
                        style={{ marginLeft: "20px", marginRight: "10px" }}
                      >
                        Subject:
                      </label>
                      <select
                        id="pragya-subject-select"
                        value={selectedPragyaSubject}
                        onChange={(e) =>
                          setSelectedPragyaSubject(e.target.value)
                        }
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map((subject) => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Mission Completed Chart */}
                    {pragyaLoading ? (
                      <div className="text-center">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef6}
                        option={optionPragyaTransformed}
                        style={{ height: "400px", width: "100%" }}
                        loading={pragyaLoading || loadingPhase3}
                      />
                    )}
                  </div>
                </div>
                {/* Histogram Subject assigned by Vision Completed Wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Vision Submitted
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef19,
                            "vision_completed_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px", padding: "0 1.25rem" }}>
                      <label
                        htmlFor="vision-grouping-select"
                        style={{ marginRight: "10px" }}
                      >
                        Grouping:
                      </label>
                      <select
                        id="vision-grouping-select"
                        value={groupingVision}
                        onChange={(e) => setGroupingVision(e.target.value)}
                        className="mr-4"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                      <label
                        htmlFor="vision-subject-select"
                        style={{ marginRight: "10px" }}
                      >
                        Subject:
                      </label>
                      <select
                        id="vision-subject-select"
                        value={subjectId ?? ""}
                        onChange={(e) =>
                          setSubjectId(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="mr-4"
                      >
                        <option value="">All Subjects</option>
                        {subjectList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {JSON.parse(s.title).en}
                          </option>
                        ))}
                      </select>
                      <label
                        htmlFor="vision-assigned-by-select"
                        style={{ marginRight: "10px" }}
                      >
                        Assigned By:
                      </label>
                      <select
                        id="vision-assigned-by-select"
                        value={assignedBy}
                        onChange={(e) => setAssignedBy(e.target.value as any)}
                        className="mr-4"
                      >
                        <option value="all">All Assignments</option>
                        <option value="self">Self Assigned</option>
                        <option value="teacher">By Teacher</option>
                      </select>
                      <label htmlFor="vision-status-select">Status:</label>
                      <select
                        id="vision-status-select"
                        value={visionStatus}
                        onChange={(e) => setVisionStatus(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    {visionLoading ? (
                      <div
                        className="text-center"
                        style={{ padding: "1.25rem" }}
                      >
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef19}
                        option={optionVision}
                        style={{ height: "400px", width: "100%" }}
                        loading={visionLoading || loadingPhase3}
                      />
                    )}
                  </div>
                </div>
                {/* Mission Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Mission Coins Earned Over Time
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef12,
                            "mission_coins_earned_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label htmlFor="points-grouping">Group by:</label>
                      <select
                        id="points-grouping"
                        value={pointsMissionGrouping}
                        onChange={(e) =>
                          setPointsMissionGrouping(e.target.value as any)
                        }
                        className="border rounded p-1"
                      >
                        {[
                          "daily",
                          "weekly",
                          "monthly",
                          "quarterly",
                          "yearly",
                          "lifetime",
                        ].map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      {pointsMissionLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef12}
                          option={pointsMissionChartOption}
                          style={{ height: 400 }}
                          loading={pointsMissionLoading || loadingPhase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Quiz Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Quiz Coins Over Time
                      </h3>
                      <button
                        onClick={() =>
                          handleDownloadChart(chartRef18, "quiz_points_graph")
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label htmlFor="quiz-points-grouping">
                        Time Grouping:{" "}
                      </label>
                      <select
                        id="quiz-points-grouping"
                        value={pointsQuizGrouping}
                        onChange={(e) =>
                          setPointsQuizGrouping(e.target.value as any)
                        }
                      >
                        {groupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {pointsQuizLoading ? (
                      <div className="text-center">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef18}
                        option={pointsQuizChartOption}
                        style={{ height: "400px", width: "100%" }}
                        loading={pointsQuizLoading || loadingPhase3}
                      />
                    )}
                  </div>
                </div>
                {/* Jigyasa Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Jigyasa Coins Earned Over Time
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef13,
                            "jigyasa_coins_earned_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label htmlFor="points-jigyasa-grouping">Group by:</label>
                      <select
                        id="points-jigyasa-grouping"
                        value={pointsJigyasaGrouping}
                        onChange={(e) =>
                          setPointsJigyasaGrouping(e.target.value as any)
                        }
                        className="border rounded p-1"
                      >
                        {[
                          "daily",
                          "weekly",
                          "monthly",
                          "quarterly",
                          "yearly",
                          "lifetime",
                        ].map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      {pointsJigyasaLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef13}
                          option={pointsJigyasaChartOption}
                          style={{ height: 400 }}
                          loading={pointsJigyasaLoading || loadingPhase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Pragya Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Pragya Coins Earned Over Time
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef14,
                            "pragya_coins_earned_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label htmlFor="points-pragya-grouping">Group by:</label>
                      <select
                        id="points-pragya-grouping"
                        value={pointsPragyaGrouping}
                        onChange={(e) =>
                          setPointsPragyaGrouping(e.target.value as any)
                        }
                        className="border rounded p-1"
                      >
                        {[
                          "daily",
                          "weekly",
                          "monthly",
                          "quarterly",
                          "yearly",
                          "lifetime",
                        ].map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      {pointsPragyaLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef14}
                          option={pointsPragyaChartOption}
                          style={{ height: 400 }}
                          loading={pointsPragyaLoading || loadingPhase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Vision Score Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Vision Coins Earned Over Time
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef20,
                            "vision_score_earned_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <select
                        value={groupingVisionScore}
                        onChange={(e) =>
                          setGroupingVisionScore(e.target.value as any)
                        }
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                      {VisionScoreLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef20}
                          option={optionVisionScore}
                          style={{ height: 400 }}
                          loading={VisionScoreLoading || loadingPhase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Coupons Redeemed Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Coupon Redeems Over Time
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef15,
                            "coupons_redeemed_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label htmlFor="points-couponRedeems-grouping">
                        Group by:
                      </label>
                      <select
                        id="points-couponRedeems-grouping"
                        value={couponRedeemsGrouping}
                        onChange={(e) =>
                          setCouponRedeemsGrouping(e.target.value as any)
                        }
                        className="border rounded p-1"
                      >
                        {[
                          "daily",
                          "weekly",
                          "monthly",
                          "quarterly",
                          "yearly",
                          "lifetime",
                        ].map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      {couponRedeemsLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef15}
                          option={couponRedeemsSeriesOptions}
                          style={{ height: 400 }}
                          loading={couponRedeemsLoading || loadingPhase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* PBL submissions Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        PBL Submissions Over Time
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef17,
                            "PBL_submissions_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label className="ml-2">
                        Grouping:
                        <select
                          value={groupingPBL}
                          onChange={(e) => setGroupingPBL(e.target.value)}
                        >
                          {PBLgroupings.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="ml-2">
                        Status:
                        <select
                          value={statusPBL}
                          onChange={(e) => setStatusPBL(e.target.value)}
                        >
                          {statusOptionsPBL.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      {loadingPBL ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef17}
                          option={chartOptionPBL}
                          style={{ height: 400 }}
                          loading={loadingPBL || loadingPhase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Student Grade Distribution table */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Students by Grade Over Time Distribution
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef7,
                            "students_by_grade_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div className="card-body">
                      <label htmlFor="grouping-grade-select">
                        Select Time Grouping:{" "}
                      </label>
                      <select
                        id="grouping-grade-select"
                        value={groupingGrade}
                        onChange={(e) => setGroupingGrade(e.target.value)}
                      >
                        {groupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {loadingGrade ? (
                      <div style={{ textAlign: "center" }}>
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : errorGrade ? (
                      <div>Error: {errorGrade}</div>
                    ) : (
                      <LazyChart
                        ref={chartRef7}
                        option={EchartGradeOption}
                        style={{ height: "400px", width: "100%" }}
                        loading={loadingGrade || loadingPhase2}
                      />
                    )}
                  </div>
                </div>
                {/* Teachers by Grade Distribution table */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h5 className="card-title mb-0 fw-semibold">
                        Teachers by Grade over Time Distribution
                      </h5>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef8,
                            "teacher_by_grade_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div className="card-body">
                      <label htmlFor="grouping-teacher-grade-select">
                        Select Time Grouping:{" "}
                      </label>
                      <select
                        id="grouping-teacher-grade-select"
                        value={groupingTeacherGrade}
                        onChange={(e) =>
                          setGroupingTeacherGrade(e.target.value)
                        }
                      >
                        {groupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {loadingTeacherGrade ? (
                      <div style={{ textAlign: "center" }}>
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : errorTeacherGrade ? (
                      <div>Error: {errorTeacherGrade}</div>
                    ) : (
                      <LazyChart
                        ref={chartRef8}
                        option={EchartTeacherGradeOption}
                        style={{ height: "400px", width: "100%" }}
                        loading={loadingTeacherGrade || loadingPhase2}
                        key={`teacher-grade-${groupingTeacherGrade}`}
                      />
                    )}
                  </div>
                </div>
                {/* Student Demographics Distribution graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h5 className="card-title mb-0 fw-semibold">
                        Student Demographics Distribution
                      </h5>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef9,
                            "Student_demograph_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div className="card-body">
                      {/* Dropdown to select time grouping */}
                      <div style={{ marginBottom: "20px" }}>
                        <label
                          htmlFor="student-grouping-select"
                          style={{ marginRight: "10px" }}
                        >
                          Select Time Grouping:
                        </label>
                        <select
                          id="student-grouping-select"
                          value={studentGrouping}
                          onChange={(e) => setStudentGrouping(e.target.value)}
                        >
                          {studentGroupings.map((g) => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        {/* single-state select */}
                        <label
                          htmlFor="student-state-select"
                          style={{ margin: "0 10px" }}
                        >
                          State:
                        </label>
                        <select
                          id="student-state-select"
                          value={selectedState}
                          onChange={handleStateChange}
                          style={{ minWidth: 200 }}
                        >
                          <option value="">All States</option>
                          {allStates.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      {studentLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef9}
                          option={{
                            ...chartOptionStudent,
                            xAxis: {
                              ...chartOptionStudent.xAxis,
                              axisLabel: {
                                rotate: studentGrouping === "daily" ? 45 : 30,
                                formatter: (value: string) =>
                                  formatWeeklyXAxisLabel(
                                    value,
                                    studentGrouping
                                  ),
                                rich: {
                                  a: {
                                    fontWeight: "bold",
                                    fontSize: 11,
                                    lineHeight: 16,
                                  },
                                  b: {
                                    fontSize: 10,
                                    color: "#666",
                                    lineHeight: 14,
                                  },
                                },
                                margin: 20,
                              },
                            },
                          }}
                          style={{ height: "400px", width: "100%" }}
                          loading={studentLoading || loadingPhase2}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Teacher Demographics Distribution graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h5 className="card-title mb-0 fw-semibold">
                        Teacher Demographics Distribution
                      </h5>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef10,
                            "Teacher_demograph_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div className="card-body">
                      {/* Dropdown for selecting time grouping */}
                      <div style={{ marginBottom: "20px" }}>
                        <label
                          htmlFor="teacher-grouping-select"
                          style={{ marginRight: "10px" }}
                        >
                          Select Time Grouping:
                        </label>
                        <select
                          id="teacher-grouping-select"
                          value={teacherGrouping}
                          onChange={(e) => setTeacherGrouping(e.target.value)}
                        >
                          {teacherGroupings.map((g) => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        <label
                          htmlFor="teacher-state-select"
                          style={{ margin: "0 10px" }}
                        >
                          State:
                        </label>
                        <select
                          id="teacher-state-select"
                          value={selectedTeacherState}
                          onChange={(e) =>
                            setSelectedTeacherState(e.target.value)
                          }
                        >
                          <option value="">All States</option>
                          {allStates.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      {teacherLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        <LazyChart
                          ref={chartRef10}
                          option={{
                            ...chartOptionTeacher,
                            xAxis: {
                              ...chartOptionTeacher.xAxis,
                              axisLabel: {
                                rotate: teacherGrouping === "daily" ? 45 : 30,
                                formatter: (value: string) =>
                                  formatWeeklyXAxisLabel(
                                    value,
                                    teacherGrouping
                                  ),
                                rich: {
                                  a: {
                                    fontWeight: "bold",
                                    fontSize: 11,
                                    lineHeight: 16,
                                  },
                                  b: {
                                    fontSize: 10,
                                    color: "#666",
                                    lineHeight: 14,
                                  },
                                },
                                margin: 20,
                              },
                            },
                          }}
                          style={{ height: "400px", width: "100%" }}
                          loading={teacherLoading || loadingPhase2}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* School Demographics Distribution graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Schools Demographics Distribution
                      </h3>
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef16,
                            "schools_demographic_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label htmlFor="school-grouping-select">Grouping:</label>
                      <select
                        id="school-grouping-select"
                        value={schoolGrouping}
                        onChange={(e) => setSchoolGrouping(e.target.value)}
                        className="mr-2"
                      >
                        {groupings.map((g) => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="school-state-select">State:</label>
                      <select
                        id="school-state-select"
                        value={selectedSchoolState}
                        onChange={(e) => setSelectedSchoolState(e.target.value)}
                      >
                        <option value="">All States</option>
                        {allStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    {schoolLoading ? (
                      <div className="text-center">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "8rem", height: "8rem" }}
                        ></div>
                      </div>
                    ) : (
                      <LazyChart
                        ref={chartRef16}
                        option={{
                          ...chartOptionSchool,
                          xAxis: {
                            ...chartOptionSchool.xAxis,
                            axisLabel: {
                              rotate: schoolGrouping === "daily" ? 45 : 30,
                              formatter: (value: string) =>
                                formatWeeklyXAxisLabel(value, schoolGrouping),
                              rich: {
                                a: {
                                  fontWeight: "bold",
                                  fontSize: 11,
                                  lineHeight: 16,
                                },
                                b: {
                                  fontSize: 10,
                                  color: "#666",
                                  lineHeight: 14,
                                },
                              },
                              margin: 20,
                            },
                          },
                        }}
                        style={{ height: "400px", width: "100%" }}
                        loading={schoolLoading || loadingPhase2}
                      />
                    )}
                  </div>
                </div>

                {/* Student Count By Level graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Student Count By Level
                      </h3>
                      {/* Download button */}
                      <button
                        onClick={() =>
                          handleDownloadChart(
                            chartRef11,
                            "Student_count_by_level_graph"
                          )
                        }
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded-md hover:bg-sky-700 transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div className="card-body pt-0">
                      <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="grouping-level-select">
                          Select Time Grouping:{" "}
                        </label>
                        <select
                          id="grouping-level-select"
                          value={groupingLevel}
                          onChange={(e) => setGroupingLevel(e.target.value)}
                        >
                          {groupings.map((g) => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        <label className="mr-2 font-semibold">
                          Select Level:
                        </label>
                        <select
                          value={selectedLevel}
                          onChange={(e) =>
                            setSelectedLevel(e.target.value as FilterLevel)
                          }
                          className="border p-1 rounded"
                        >
                          <option value="all">All</option>
                          <option value="level1">Level 1 (Grade 1 – 5)</option>
                          <option value="level2">Level 2 (Grade 6+)</option>
                          <option value="level3">Level 3 (Grade 7+)</option>
                          <option value="level4">Level 4 (Grade 8+)</option>
                        </select>
                      </div>
                      {loadingLevel ? (
                        <div style={{ textAlign: "center" }}>
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : errorLevel ? (
                        <div>Error: {errorLevel}</div>
                      ) : (
                        <LazyChart
                          ref={chartRef11}
                          option={{
                            ...EchartLevelOption,
                            xAxis: {
                              ...EchartLevelOption.xAxis,
                              axisLabel: {
                                rotate: groupingLevel === "daily" ? 45 : 30,
                                formatter: (value: string) =>
                                  formatWeeklyXAxisLabel(value, groupingLevel),
                                rich: {
                                  a: {
                                    fontWeight: "bold",
                                    fontSize: 11,
                                    lineHeight: 16,
                                  },
                                  b: {
                                    fontSize: 10,
                                    color: "#666",
                                    lineHeight: 14,
                                  },
                                },
                                margin: 20,
                              },
                            },
                          }}
                          style={{ height: "400px", width: "100%" }}
                          loading={loadingLevel || loadingPhase2}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Teacher Assignments */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Teacher Assignments
                      </h3>
                    </div>
                    <div className="card-body pt-0">
                      {/* Local Time Filter UI — ONLY for this chart */}
                      <div className="mb-3">
                        <label className="form-label">Time Range</label>
                        <select
                          value={teacherAssignDateRange}
                          onChange={(e) =>
                            setTeacherAssignDateRange(e.target.value)
                          }
                          className="form-select"
                        >
                          <option value="lifetime">Lifetime</option>
                          <option value="last7days">Last 7 Days</option>
                          <option value="last30days">Last 30 Days</option>
                          <option value="last6months">Last 6 Months</option>
                          <option value="lastyear">Last Year</option>
                          <option value="custom">Custom Range</option>
                        </select>
                      </div>
                      {teacherAssignDateRange === "custom" && (
                        <div className="row g-2 mb-3">
                          <div className="col">
                            <input
                              type="date"
                              className="form-control"
                              value={teacherAssignStartDate}
                              onChange={(e) =>
                                setTeacherAssignStartDate(e.target.value)
                              }
                            />
                          </div>
                          <div className="col">
                            <input
                              type="date"
                              className="form-control"
                              value={teacherAssignEndDate}
                              onChange={(e) =>
                                setTeacherAssignEndDate(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                      <div style={{ height: "300px" }}>
                        <ChartJSBar
                          data={teacherAssignData}
                          options={teacherAssignOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Redemptions */}
                <div className="col-12 col-xl-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        Coupon Redemptions
                      </h3>
                    </div>
                    <div className="card-body pt-0">
                      <div style={{ height: "300px" }}>
                        <ChartJSPie
                          data={pieChartData}
                          options={pieChartOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Types */}
                <div className="col-12 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <ReactECharts
                        option={userTypeChartOptions}
                        style={{ height: "400px", width: "100%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* School Distribution */}
                <div className="col-12 col-xl-8">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">
                        School Distribution (Top 5 States)
                      </h3>
                    </div>
                    <div className="card-body pt-0">
                      <div style={{ height: "300px" }}>
                        <ChartJSBar
                          data={schoolStateData}
                          options={schoolChartOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <footer className="footer bg-white border-top py-3 mt-auto">
          <div className="container-xl">
            <div className="d-flex justify-content-between align-items-center text-muted">
              <span>© 2025 LifeAppDashboard. All rights reserved.</span>
              <div className="d-flex gap-3">
                <a href="#" className="text-muted text-decoration-none">
                  Privacy
                </a>
                <a href="#" className="text-muted text-decoration-none">
                  Terms
                </a>
                <a href="#" className="text-muted text-decoration-none">
                  Help
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}