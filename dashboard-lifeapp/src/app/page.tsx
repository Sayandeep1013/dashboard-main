'use client';

import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS
//import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS (includes Popper.js)
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import NumberFlow from '@number-flow/react'
import LogoutButton from '@/components/logoutButton'
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
  Bar
} from 'recharts'
import {
  IconSettings,
  IconSearch,
  IconBell,
  IconUsers,
  IconUserCheck,
  IconUserPlus,
  IconPercentage,
} from '@tabler/icons-react'
import { Bar as ChartJSBar, Pie as ChartJSPie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend,
  ArcElement
} from 'chart.js'
import React from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartJSTooltip, Legend, ArcElement)

// Define the type for your API data
interface SignupData {
  month: string | null
  count: number
}

import ReactECharts from 'echarts-for-react';

const groupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
const quizGroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
const studentGroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
const teacherGroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];

// import Sidebar from './sidebar';
import { title } from 'process';
import { Sidebar } from '@/components/ui/sidebar';
import { Content, Inter } from 'next/font/google';
// import { headers } from 'next/headers';
const inter = Inter({ subsets: ['latin'] });

//const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'
// const api_startpoint = 'http://152.42.239.141:5000'

interface userTypeChart {
  count:number,
  userType: string | null
}

const userTypes = ['All', 'Admin', 'Student', 'Mentor', 'Teacher', 'Unspecified'];
// interface EchartSignup {
//   period: string | null,
//   count: number,
//   user_type: string,
//   Admin: string,
//   Mentor: string,
//   Student: string,
//   Teacher:string,
//   Unspecified: string
// }
interface EchartSignup {
  period: string;
  // The keys will be user types.
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

// Define a TypeScript interface for teacher grade entries returned by the API.
interface TeacherGradeEntry {
  period: string | null;
  grade: string; // or number, but we'll work with a string for display (e.g., "Grade 4" or "Unspecified")
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
  // For each level, the total count
  [level: string]: any;
  // Optional property to hold the breakdown per level.
  __breakdown?: {
    [level: string]: {
      [subject: string]: number;
    };
  };
}
const missionGroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
const jigyasaGroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
const pragyaGroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];

export default function UserAnalyticsDashboard() {
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [])
  const formatPeriod = (period: string, grouping: string) => {
    if (grouping === 'daily') {
      try {
        const date = new Date(period);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
        // or for DD-MM-YYYY:
        // return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      } catch {
        return period;
      }
    }
    return period;
  };

  const [EchartData, setEChartData] = useState<EchartSignup[]>([]);
  const [grouping, setGrouping] = useState('monthly');
  const [selectedUserType, setSelectedUserType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data from the API based on the selected grouping
  // const fetchDataEcharts = (selectedGrouping: string) => {
  //   setLoading(true);
  //   const params = new URLSearchParams({
  //     grouping: selectedGrouping,
  //     // Uncomment and set these if you want to filter by date:
  //     // start_date: '2023-01-01',
  //     // end_date: '2023-12-31'
  //   });

  //   fetch(`${api_startpoint}/api/signing-user`, {
  //             method: 'POST',
  //               headers: { 'Content-Type': 'application/json' },
  //               body: JSON.stringify({grouping: selectedGrouping})
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //     })
  //     .then(data => {
  //       // Assume API returns data in a { data: [{ period, count }, ...] } format
  //       // setEChartData(data.data);
  //       // setLoading(false);
  //       const groupedData = data.data.reduce((acc: any, entry: any) => {
  //         if (!acc[entry.period]) acc[entry.period] = { period: entry.period };
  //         acc[entry.period][entry.user_type] = entry.count;
  //         return acc;
  //       }, {});
  
  //       setEChartData(Object.values(groupedData));
  //       setLoading(false);
  //     })
  //     .catch(err => {
  //       setError(err.message);
  //       setLoading(false);
  //     });
  // };
  // Fetch data from your API endpoint.
  useEffect(() => {
    setLoading(true);
    fetch(`${api_startpoint}/api/signing-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        grouping: grouping,
        user_type: selectedUserType  // Add this line
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Transform the flat data into a pivot table keyed by period.
        // For each row (with period, user_type, count), accumulate the value.
        const groupedData: { [period: string]: EchartSignup } = {};
        (data.data as ApiSignupData[]).forEach(row => {
          // Use a fallback if period is null.
          const period = row.period || 'Unknown';
          if (!groupedData[period]) {
            groupedData[period] = { period };
          }
          // Set the count for the given user_type.
          groupedData[period][row.user_type] = row.count;
        });
        setEChartData(Object.values(groupedData));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [grouping, selectedUserType]);

  // const [selectedUserType, setSelectedUserType] = useState('All');
   // Build an array of series for each user type.
   const allSeries = [
    {
      name: 'Admin',
      type: 'bar',
      stack: 'total',
      data: EchartData.map(item => item.Admin || 0),
      itemStyle: { color: '#1E3A8A' }
    },
    {
      name: 'Student',
      type: 'bar',
      stack: 'total',
      data: EchartData.map(item => item.Student || 0),
      itemStyle: { color: '#3B82F6' }
    },
    {
      name: 'Mentor',
      type: 'bar',
      stack: 'total',
      data: EchartData.map(item => item.Mentor || 0),
      itemStyle: { color: '#60A5FA' }
    },
    {
      name: 'Teacher',
      type: 'bar',
      stack: 'total',
      data: EchartData.map(item => item.Teacher || 0),
      itemStyle: { color: '#93C5FD' }
    },
    {
      name: 'Unspecified',
      type: 'bar',
      stack: 'total',
      data: EchartData.map(item => item.Unspecified || 0),
      itemStyle: { color: '#0F172A' }
    }
  ];

  // Filter the series if a specific user type is selected.
  const filteredSeries = selectedUserType === 'All'
    ? allSeries
    : allSeries.filter(series => series.name === selectedUserType);

  // Fetch new data whenever the grouping changes
  // useEffect(() => {
  //   fetchDataEcharts(grouping);
  // }, [grouping]);
  // Configure the ECharts option
  const periodsUserSignups = EchartData.map(item => item.period);
  const totalCountsUserSignups = EchartData.map(item =>
    (item.Admin   || 0)
  + (item.Student || 0)
  + (item.Mentor  || 0)
  + (item.Teacher || 0)
  + (item.Unspecified|| 0)
  );

  // 2) Define your invisible total‐bar series (no `stack`):
  const totalSeriesUserSignups = {
    name: 'Total',
    type: 'bar',
    // ← NO stack so it draws from 0 up to the sum rather than stacking
    data: totalCountsUserSignups,
    barGap: '-100%',            // sit exactly on top of the stacked bars
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1                        // draw behind the colored bars
  };
  const EchartOption = {
    title: {
      text: 'User Signups by Type Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      //
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
        top: 'bottom'
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
    },
    xAxis: {
      type: 'category',
      data: EchartData.map(item => formatPeriod(item.period, grouping)),
      boundaryGap: grouping === 'lifetime' ? true : false,
      axisLabel: {
        // Rotate labels for daily grouping for better readability
        rotate: grouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    // Data zoom enables efficient panning and zooming on the chart
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100
      }
    ],
    // series: [
    //   {
    //     name: 'Signups',
    //     type: 'bar',
    //     data: EchartData.map(item => item.count),
    //     barMaxWidth: '50%',
    //     itemStyle: {
    //       color: '#5470C6'
    //     }
    //   }
    // ]
    // series:  [
    //   {
    //     name: 'Admin',
    //     type: 'bar',
    //     stack: 'total',
    //     data: EchartData.map(item => item.Admin || 0),
    //     itemStyle: { color: '#1E3A8A' }
    //   },
    //   {
    //     name: 'Student',
    //     type: 'bar',
    //     stack: 'total',
    //     data: EchartData.map(item => item.Student || 0),
    //     itemStyle: { color: '#3B82F6' }
    //   },
    //   {
    //     name: 'Mentor',
    //     type: 'bar',
    //     stack: 'total',
    //     data: EchartData.map(item => item.Mentor || 0),
    //     itemStyle: { color: '#60A5FA' }
    //   },
    //   {
    //     name: 'Teacher',
    //     type: 'bar',
    //     stack: 'total',
    //     data: EchartData.map(item => item.Teacher || 0),
    //     itemStyle: { color: '#93C5FD' }
    //   },
    //   {
    //     name: 'Unspecified',
    //     type: 'bar',
    //     stack: 'total',
    //     data: EchartData.map(item => item.Unspecified || 0),
    //     itemStyle: { color: '#0F172A' }
    //   }
    // ]
    series: [...filteredSeries, totalSeriesUserSignups]
  };

  // Handle dropdown change to update the grouping
  const handleGroupingChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setGrouping(e.target.value);
  };




  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<SignupData[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user signups data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${api_startpoint}/api/user-signups`)
        const data = (await res.json()) as SignupData[]
        setChartData(data)

        const availableYears: string[] = Array.from(
          new Set(
            data
              .filter((item) => item.month)
              .map((item) => (item.month ? item.month.split('-')[0] : ''))
              .filter((year) => year !== '')
          )
        )

        if (availableYears.length > 0) {
          setSelectedYear(availableYears[0])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const filteredData = selectedYear
    ? chartData.filter((item) => item.month && item.month.startsWith(selectedYear))
    : chartData

  const years: string[] = chartData.length
    ? Array.from(
        new Set(
          chartData
            .filter((item) => item.month)
            .map((item) => (item.month ? item.month.split('-')[0] : ''))
            .filter((year) => year !== '')
        )
      )
    : []

  // Fetch additional metrics (totalUsers, activeUsers, approvalRate)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  useEffect(() => {
    async function fetchUserCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/user-count`)
        const data = await res.json()
        if (data && data.length > 0) {
          setTotalUsers(data[0].count)
        }
      } catch (error) {
        console.error('Error fetching user count:', error)
      }
    }
    fetchUserCount()
  }, [])

  const [activeUsers, setActiveUsers] = useState<number>(0)
  useEffect(() => {
    async function fetchActiveUserCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/active-user-count`)
        const data = await res.json()
        if (data && data.length > 0 && data[0].active_users !== undefined) {
          setActiveUsers(data[0].active_users)
        } else {
          setActiveUsers(0)
        }
      } catch (error) {
        console.error('Error fetching user count:', error)
        setActiveUsers(0)
      }
    }
    fetchActiveUserCount()
  }, [])

  const [newSignups, setNewSignups] = useState<number>(0)
  useEffect(() => {
    async function fetchNewSignups() {
      try {
        const res = await fetch(`${api_startpoint}/api/new-signups`)
        const data = await res.json()
        if (data && data.length > 0 && data[0].count !== undefined) {
          setNewSignups(data[0].count)
        } else {
          setNewSignups(0)
        }
      } catch (error) {
        console.error('Error fetching user count:', error)
        setNewSignups(0)
      }
    }
    fetchNewSignups()
  }, [])

  const [approvalRate, setApprovalRate] = useState<number>(0)
  useEffect(() => {
    async function fetchApprovalRate() {
      try {
        const res = await fetch(`${api_startpoint}/api/approval-rate`)
        const data = await res.json()
        if (data && data.length > 0 && data[0].Approval_Rate !== undefined) {
          setApprovalRate(data[0].Approval_Rate)
        } else {
          setApprovalRate(0)
        }
      } catch (error) {
        console.error('Error fetching approval rate:', error)
        setApprovalRate(0)
      }
    }
    fetchApprovalRate()
  }, [])

  // Coupon redeem chart data
  const [couponRedeemCount, setCouponRedeemCount] = useState<Array<{ amount: string; coupon_count: number }>>([])
  useEffect(() => {
    async function fetchCouponRedeemCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/coupons-used-count`)
        const data = await res.json()
        if (data && Array.isArray(data) && data.length > 0) {
          setCouponRedeemCount(data)
        } else {
          setCouponRedeemCount([])
        }
      } catch (error) {
        console.error('Error fetching coupon counts:', error)
        setCouponRedeemCount([])
      }
    }
    fetchCouponRedeemCount()
  }, [])

  const pieChartData = {
    labels: couponRedeemCount.map((item) => item.amount),
    datasets: [
      {
        data: couponRedeemCount.map((item) => item.coupon_count),
        backgroundColor: ['#6549b9', '#FF8C42', '#1E88E5', '#43A047', '#FDD835', '#D81B60'],
        borderWidth: 0,
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#333' } },
      tooltip: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    cutout: '70%',
    animation: { animateScale: true },
  }

  // Teacher assignment counts and chart data
  const [assignCounts, setAssignCounts] = useState<number[]>([])
  useEffect(() => {
    async function fetchTeacherAssignCounts() {
      try {
        const res = await fetch(`${api_startpoint}/api/teacher-assign-count`)
        const data = await res.json()
        const counts = data.map((item: { assign_count: number }) => item.assign_count)
        setAssignCounts(counts)
      } catch (error) {
        console.error('Error fetching teacher assignment counts:', error)
      }
    }
    fetchTeacherAssignCounts()
  }, [])

  const bins = [0, 5, 10, 15, 20, 25]
  const binLabels = ['1-5', '6-10', '11-15', '16-20', '21-25', '26+']
  const binData = Array(binLabels.length).fill(0)
  assignCounts.forEach((count) => {
    if (count <= 5) binData[0]++
    else if (count <= 10) binData[1]++
    else if (count <= 15) binData[2]++
    else if (count <= 20) binData[3]++
    else if (count <= 25) binData[4]++
    else binData[5]++
  })

  const teacherAssignData = {
    labels: binLabels,
    datasets: [
      {
        label: 'Number of Teachers',
        data: binData,
        backgroundColor: '#4A90E2',
        borderRadius: 5,
      },
    ],
  }

  const teacherAssignOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ChartJSTooltip: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        borderWidth: 1,
      },
      legend: { labels: { color: '#333' } },
    },
    scales: {
      x: { ticks: { color: '#333' }, grid: { color: '#eee' },
        title:{
          display: true,
          text: 'Assignment Count Range',
          color: '#333',
        } },
      y: { ticks: { color: '#333' }, grid: { color: '#eee' },
      title:{
        display: true,
        text: 'Number of Teachers',
        color: '#333',
      } },
    },
  }

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card card-sm">
          <div className="card-body">
            <p className="mb-0">Month: {label}</p>
            <p className="mb-0">Count: {payload[0].value}</p>
          </div>
        </div>
      )
    }
    return null
  }

  // Add this state variable with your existing state declarations
  const [stateCounts, setStateCounts] = useState<Array<{ state: string; count_state: number }>>([]);

  // Add this useEffect block with your existing useEffect hooks
  useEffect(() => {
    async function fetchSchoolStateCounts() {
      try {
        const res = await fetch(`${api_startpoint}/api/count-school-state`);
        const data = await res.json();
        
        // Check if data exists and is an array with valid structure
        if (data && Array.isArray(data) && data.length > 0 && data[0].state !== undefined) {
          setStateCounts(data);
        } else {
          setStateCounts([]);
        }
      } catch (error) {
        console.error('Error fetching school state counts:', error);
        setStateCounts([]);
      }
    }
    fetchSchoolStateCounts();
  }, []);
  const schoolStateData = {
    labels: stateCounts.map((item) => item.state),
    datasets: [
      {
        label: 'No. of Schools',
        data: stateCounts.map((item) => item.count_state),
        backgroundColor: '#4A90E2',
        // Adding border radius to each bar
        borderRadius: 15,
        borderSkipped: false,
      },
    ],
  };
  const schoolChartOptions = {
    indexAxis: "y" as const, // Makes it a horizontal bar chart
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
          color: '#333',
        },
        grid: {
          color: '#eee',
        },
      },
      y: {
        ticks: {
          color: '#333',
        },
        grid: {
          color: '#eee',
        },
      },
    },
  };
  
  const [userTypeData, setUserTypeData] = useState<userTypeChart[]>([])
  useEffect(() => {
    async function fetchUserType() {
      try {
        const res = await fetch(`${api_startpoint}/api/user-type-chart`)
        const data = await res.json()
        if (data && data.length > 0) {
          setUserTypeData(data)
        }
      } catch (error) {
        console.error('Error fetching user type:', error)
      }
    }
    fetchUserType()
  }, [])

  // Prepare chart options
  const deepBlueColors = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#0F172A'];

  const userTypeChartOptions = {
    backgroundColor: 'white',
    title: {
      text: 'User Type',
      left: 'center',
      top: 20,
      textStyle: {
        color: 'black'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: 'Number of',
        type: 'pie',
        radius: '55%', // Creates a donut effect for better label spacing
        center: ['50%', '50%'],
        data: userTypeData.map((item, index) => ({
          value: item.count,
          name: item.userType || 'Unknown',
          itemStyle: { color: deepBlueColors[index % deepBlueColors.length] }
        })),
        label: {
          show: true,
          color: '#000',
          fontSize: 14,
          // formatter: '{b}: {c} ({d}%)' // Show name, count, and percentage
        },
        labelLine: {
          show: true,
          length: 15, // Line before text
          length2: 20, // Line connecting to the label
          lineStyle: {
            color: '#000',
            width: 0.5
          }
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function () {
          return Math.random() * 200;
        }
      }
    ]
  };

  // const [histogramLevelSubjectMissionData, setHistogramLevelSubjectMissionData] = useState<any[]>([]);
  // // Fetch histogram data from the backend
  // useEffect(() => {
  //   async function fetchHistogramLevelSubjectMissionData() {
  //     try {
  //       const res = await fetch(`${api_startpoint}/api/histogram_level_subject_challenges_complete`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' }
  //       });
  //       const data = await res.json();

  //       const getText = (val: any) => {
  //         try {
  //           const parsed = JSON.parse(val);
  //           return parsed.en || val; // fallback to raw if no 'en'
  //         } catch {
  //           return val; // not JSON, return as is
  //         }
  //       };
  //       // Group the data by level_title
  //       // Create an object where each key is a level title and its value is an object containing subject counts.
  //       const grouped: { [level: string]: any } = {};
  //       data.forEach((entry: { count: number; subject_title: string; level_title: string; }) => {
  //         const level = getText(entry.level_title);
  //         const subject = getText(entry.subject_title);
        
  //         if (!grouped[level]) {
  //           grouped[level] = { level };
  //         }
        
  //         grouped[level][subject] = entry.count;
  //       });
  //       // Convert the object into an array
  //       setHistogramLevelSubjectMissionData(Object.values(grouped));
  //     } catch (error) {
  //       console.error("Error fetching histogram data:", error);
  //     }
  //   }
  //   fetchHistogramLevelSubjectMissionData();
  // }, []);

  // Determine unique subject keys (the keys in each grouped object other than "level")
  // const subjectKeys: string[] = Array.from(
  //   new Set(
  //     histogramLevelSubjectMissionData.flatMap(item =>
  //       Object.keys(item).filter((key) => key !== "level")
  //     )
  //   )
  // );
  const LegendComponent = rechartsLegend;

  // const [quizHistogramData, setQuizHistogramData] = useState<QuizHistogramEntry[]>([]);
  // const [formattedData, setFormattedData] = useState<any[]>([]);
  // const [subjectKeysQuiz, setSubjectKeysQuiz] = useState<string[]>([]);
  // useEffect(() => {
  //   async function fetchHistogramDataQuizTopicLevel() {
  //     try {
  //       const res = await fetch(`${api_startpoint}/api/histogram_topic_level_subject_quizgames`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' }
  //       });
  //       const raw = await res.json();

  //       const grouped: { [level: string]: any } = {};
  //       const subjectsSet = new Set<string>();
  
  //       raw.forEach((entry: any) => {
  //         const subject = JSON.parse(entry.subject_title).en;
  //         const level = JSON.parse(entry.level_title).en;
  
  //         subjectsSet.add(subject);
  
  //         if (!grouped[level]) {
  //           grouped[level] = { level };
  //         }
  
  //         grouped[level][subject] = entry.count;
  //       });
  
  //       setFormattedData(Object.values(grouped));
  //       setSubjectKeysQuiz(Array.from(subjectsSet));
  //     } catch (err) {
  //       console.error("Error fetching histogram:", err);
  //     }
  //   }
  //   fetchHistogramDataQuizTopicLevel();
  // }, []);


  const [EchartDataGrade, setEchartDataGrade] = useState<any[]>([]);
  const [groupingGrade, setGroupingGrade] = useState('monthly');
  const [loadingGrade, setLoadingGrade] = useState(true);
  const [errorGrade, setErrorGrade] = useState<string | null>(null);

  const fetchDataGrade = (selectedGrouping: string) => {
    setLoadingGrade(true);
    fetch(`${api_startpoint}/api/students-by-grade-over-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grouping: selectedGrouping })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: GradeEntry[]) => {
        // Transform the data into a pivot structure.
        // We want one record per period with counts for each grade.
        const groupedData: { [period: string]: any } = {};
        data.forEach(entry => {
          // Replace a null period with "Unknown" if desired
          const period = entry.period || 'Unknown';
          // If grade is returned as a number then transform to string display like "Grade 4"
          // Here we assume entry.grade is already a string (or 'Unspecified')
          if (!groupedData[period]) {
            groupedData[period] = { period };
          }
          // If there are multiple entries for the same grade in one period, sum the counts.
          groupedData[period][entry.grade] = 
            (groupedData[period][entry.grade] || 0) + entry.count;
        });
        setEchartDataGrade(Object.values(groupedData));
        setLoadingGrade(false);
      })
      .catch(err => {
        setErrorGrade(err.message);
        setLoadingGrade(false);
      });
  };

  // Fetch whenever groupingGrade changes
  useEffect(() => {
    fetchDataGrade(groupingGrade);
  }, [groupingGrade]);

  // Determine unique grade keys for the legend/series from EchartDataGrade
  const uniqueGrades = Array.from(
    new Set(EchartDataGrade.flatMap(item => Object.keys(item).filter(key => key !== 'period')))
  );

  const sortedStudentGrades = uniqueGrades.sort((a, b) => {
    if (a === 'Unspecified') return 1;     // push "Unspecified" to the end
    if (b === 'Unspecified') return -1;
    return Number(a) - Number(b);
  });
  
  // Build series for each grade (stacked bar)
  const seriesGrade = uniqueGrades.map((grade, index) => ({
    name: grade,
    type: 'bar',
    stack: 'total',
    data: EchartDataGrade.map(item => item[grade] || 0),
    itemStyle: {
      // Use a color palette
      color: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DB2777', '#6B7280'][index % 6]
    }
  }));
  
  const periodsGrade = EchartDataGrade.map(item => item.period);
  const totalCountsStudentGrade = EchartDataGrade.map(item =>
    // sum up every grade key in this item
    Object.keys(item)
      .filter(k => k !== 'period')
      .reduce((sum, gradeKey) => sum + (item[gradeKey] || 0), 0)
  );

  // 2) Define your invisible “total” series (no stack!)
  const totalSeriesStudentGrade = {
    name: 'Total',
    type: 'bar',
    // ← NO `stack` here, so it draws from 0 up to the total
    data: totalCountsStudentGrade,
    barGap: '-100%',            // overlap exactly on top of the stacks
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    //z: -1                        // render behind your colored stacks
  };
  // Configure ECharts option for the grade chart
  const EchartGradeOption = {
    title: {
      text: 'Students by Grade Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      type: 'scroll', // make legend scrollable if there are many items
      orient: 'horizontal',
      top: 'bottom',
      data: sortedStudentGrades  ,
      pageIconColor: '#999',
      pageIconInactiveColor: '#ccc',
      pageIconSize: 12,
      pageTextStyle: { color: '#333' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: EchartDataGrade.map(item => formatPeriod(item.period, groupingGrade)),
      boundaryGap: groupingGrade === 'lifetime' ? true : false,
      axisLabel: {
        rotate: groupingGrade === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [ ...seriesGrade, totalSeriesStudentGrade]
  };

  const [totalStudents, setTotalStudents] = useState<number>(0)
  useEffect(() => {
      async function fetchStudentCount() {
      try {
          const res = await fetch(`${api_startpoint}/api/total-student-count`)
          const data = await res.json()
          if (data && data.length > 0) {
              setTotalStudents(data[0].count)
          }
      } catch (error) {
          console.error('Error fetching user count:', error)
      }
      }
      fetchStudentCount()
  }, [])

  // State variable to hold the transformed chart data.
  const [EchartDataTeacherGrade, setEchartDataTeacherGrade] = useState<any[]>([]);
  const [groupingTeacherGrade, setGroupingTeacherGrade] = useState('monthly');
  const [loadingTeacherGrade, setLoadingTeacherGrade] = useState(true);
  const [errorTeacherGrade, setErrorTeacherGrade] = useState<string | null>(null);

  // Function to fetch teacher grade data over time.
  const fetchDataTeacherGrade = (selectedGrouping: string) => {
    setLoadingTeacherGrade(true);
    fetch(`${api_startpoint}/api/teachers-by-grade-over-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grouping: selectedGrouping })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then((data: TeacherGradeEntry[]) => {
        // Transform the data to pivot the table such that each row represents a period
        // and columns are teacher grades.
        const groupedData: { [period: string]: any } = {};
        data.forEach(entry => {
          const period = entry.period || 'Unknown';
          // Optionally, format the grade—if the grade is a number, you might convert it:
          // const gradeLabel = entry.grade === null ? 'Unspecified' : `Grade ${entry.grade}`;
          const gradeLabel = entry.grade; // We assume grade is already an appropriate string
          if (!groupedData[period]) {
            groupedData[period] = { period };
          }
          groupedData[period][gradeLabel] = (groupedData[period][gradeLabel] || 0) + entry.count;
        });
        setEchartDataTeacherGrade(Object.values(groupedData));
        setLoadingTeacherGrade(false);
      })
      .catch(err => {
        setErrorTeacherGrade(err.message);
        setLoadingTeacherGrade(false);
      });
  };

  // Fetch new data whenever the grouping filter changes.
  useEffect(() => {
    fetchDataTeacherGrade(groupingTeacherGrade);
  }, [groupingTeacherGrade]);

  // Determine the unique teacher grade keys for the legend and series.
  const uniqueGradesTeacher = Array.from(
    new Set(
      EchartDataTeacherGrade.flatMap(item =>
        Object.keys(item).filter(key => key !== 'period')
      )
    )
  );
  // Assume uniqueGrades contains strings like "3", "4", "1", "7", "2"
  const sortedGradesTeacher = uniqueGradesTeacher.sort((a, b) => Number(a) - Number(b));

  // Create series data for each grade (stacked bar chart).
  const seriesTeacherGrade = uniqueGradesTeacher.map((grade, index) => ({
    name: grade,
    type: 'bar',
    stack: 'total',
    data: EchartDataTeacherGrade.map(item => item[grade] || 0),
    itemStyle: { 
      // Set colors as desired.
      color: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DB2777', '#6B7280'][index % 6]
    }
  }));

  const periodsTeacherGrade = EchartDataTeacherGrade.map(item => item.period);
  const totalCountsTeacherGrade = EchartDataTeacherGrade.map(item =>
    // sum up every grade key in this item
    Object.keys(item)
      .filter(k => k !== 'period')
      .reduce((sum, gradeKey) => sum + (item[gradeKey] || 0), 0)
  );

  // 2) Define your invisible “total” series (no stack!)
  const totalSeriesTeacherGrade = {
    name: 'Total',
    type: 'bar',
    // ← NO `stack` here, so it draws from 0 up to the total
    data: totalCountsTeacherGrade,
    barGap: '-100%',            // overlap exactly on top of the stacks
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    //z: -1                        // render behind your colored stacks
  };
  // ECharts option for teacher by grade chart.
  const EchartTeacherGradeOption = {
    title: {
      text: 'Teachers by Grade Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      type: 'scroll', // make legend scrollable if there are many items
      orient: 'horizontal',
      top: 'bottom',
      data: sortedGradesTeacher,
      pageIconColor: '#999',
      pageIconInactiveColor: '#ccc',
      pageIconSize: 12,
      pageTextStyle: { color: '#333' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: EchartDataTeacherGrade.map(item => formatPeriod(item.period, groupingTeacherGrade)),
      boundaryGap: groupingTeacherGrade === 'lifetime' ? true : false,
      axisLabel: {
        rotate: groupingTeacherGrade === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [ ...seriesTeacherGrade, totalSeriesTeacherGrade]
  };

  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  useEffect( () => {
      async function fetchTeacherCount() {
          try {
              const res = await fetch(`${api_startpoint}/api/teacher-count`, {
                  method: 'POST'
              })
              const data = await res.json()
              if (data && data.length > 0) {
                  setTotalTeachers(data[0].total_count)
              }
          } catch (error) {
              console.error('Error fetching user count:', error)
          }
      }
          fetchTeacherCount()
  }, [])


  // Build options for the Students by Grade bar chart
  // const studentsChartOption = {
  //   // title: {
  //   //   text: 'Students Distribution by Grade',
  //   //   left: 'center'
  //   // },
  //   tooltip: {
  //     trigger: 'axis'
  //   },
  //   xAxis: {
  //     type: 'category',
  //     data: studentsByGrade.map(item =>
  //       item.grade === null ? 'Unspecified' : `Grade ${item.grade}`
  //     ),
  //     name: 'Grade',
  //     axisLabel: { rotate: 0 }
  //   },
  //   yAxis: {
  //     type: 'value',
  //     name: 'Number of Students'
  //   },
  //   // Data zoom enables efficient panning and zooming on the chart
  //   dataZoom: [
  //     {
  //       type: 'inside',
  //       start: 0,
  //       end: 100
  //     },
  //     {
  //       type: 'slider',
  //       start: 0,
  //       end: 100
  //     }
  //   ],
  //   series: [
  //     {
  //       name: 'Students',
  //       type: 'bar',
  //       data: studentsByGrade.map(item => item.count),
  //       itemStyle: {
  //         color: '#4CAF50'
  //       },
  //       // Optionally, show labels on bars
  //       label: {
  //         show: true,
  //         position: 'top'
  //       }
  //     }
  //   ]
  // };

  // Build options for the Teachers by Grade bar chart
  // const teachersChartOption = {
  //   // title: {
  //   //   text: 'Teachers Distribution by Grade',
  //   //   left: 'center'
  //   // },
  //   tooltip: {
  //     trigger: 'axis'
  //   },
  //   xAxis: {
  //     type: 'category',
  //     data: teachersByGrade.map(item =>
  //       item.grade === null ? 'Unspecified' : `Grade ${item.grade}`
  //     ),
  //     name: 'Grade'
  //   },
  //   yAxis: {
  //     type: 'value',
  //     name: 'Number of Teachers'
  //   },
  //   // Data zoom enables efficient panning and zooming on the chart
  //   dataZoom: [
  //     {
  //       type: 'inside',
  //       start: 0,
  //       end: 100
  //     },
  //     {
  //       type: 'slider',
  //       start: 0,
  //       end: 100
  //     }
  //   ],
  //   series: [
  //     {
  //       name: 'Teachers',
  //       type: 'bar',
  //       data: teachersByGrade.map(item => item.count),
  //       itemStyle: {
  //         color: '#FF9800'
  //       },
  //       label: {
  //         show: true,
  //         position: 'top'
  //       }
  //     }
  //   ]
  // };


  const [chartStudentsData, setChartStudentsData] = useState<DemographChartdata[]>([]);

  useEffect(() => {
    async function fetchStateData() {
      try {
        // Fetch state-wise student count from API
        const apiResponse = await fetch(`${api_startpoint}/api/demograph-students`, {
          method: 'POST'
        });
        const apiData: { count: string; state: string }[] = await apiResponse.json();

        // Map API state names to your defined region keys
        const stateMappings: Record<string, string> = {
          "Tamil Nadu": "tamil nadu",     
          "Telangana": "telangana",       
          "Maharashtra": "maharashtra",
          "Karnataka": "karnataka",
          "Andhra Pradesh": "andhra pradesh",
          "Gujarat": "gujarat",
          "Madhya Pradesh": "madhya pradesh",
          "Odisha": "odisha",
          "West Bengal": "west bengal",
          "Delhi": "nct of delhi",
          "Uttar Pradesh": "uttar pradesh",
          "Jharkhand": "jharkhand",
          "Assam": "assam",
          "Chhattisgarh": "chhattisgarh",
          "Punjab": "punjab",
          "Bihar": "bihar",
          "Haryana": "haryana",
          "Daman and Diu": "daman and diu",
          "Chandigarh": "chandigarh",
          "Puducherry": "puducherry",
          "Rajasthan": "rajasthan",
          "Goa": "goa",
          "Kerala": "kerala",
          "Uttarakhand": "uttarakhand",
          "Himachal Pradesh": "himachal pradesh",
          "Lakshadweep": "lakshadweep",
          "Sikkim": "nikkim",
          "Nagaland": "nagaland",
          "Dadara and Nagar Haveli": "dadara and nagar havelli",
          "Jammu and Kashmir": "jammu and kashmir",
          "Manipur": "manipur",
          "Arunanchal Pradesh": "arunanchal pradesh",
          "Meghalaya": "meghalaya",
          "Mizoram": "mizoram",
          "Tripura": "tripura",
          "Andaman and Nicobar Islands": "andaman and nicobar",
        };

        // Transform API data into chart data. Use mapping if available,
        // otherwise fallback to the original state name.
        const transformedData: DemographChartdata[] = apiData
          .map((item) => ({
            code: stateMappings[item.state] || item.state,
            value: Math.max(parseInt(item.count, 10), 1) // ensuring a minimum count of 1
          }))
          .filter((item) => item.code);

        setChartStudentsData(transformedData);
      } catch (error) {
        console.error('Error fetching state-wise student count:', error);
      }
    }
    fetchStateData();
  }, [api_startpoint]);

  // Configure ECharts options
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: chartStudentsData.map(item => item.code),
      name: 'States',
      axisLabel: {
        rotate: 45,
        formatter: (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
      }
    },
    yAxis: {
      type: 'value',
      name: 'Student Count'
    },
    // Data zoom enables efficient panning and zooming on the chart
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'Students',
        type: 'bar',
        data: chartStudentsData.map(item => item.value),
        itemStyle: {
          color: '#4a90e2'
        }
      }
    ]
  };

  const [chartTeacherData, setChartTeacherData] = useState<DemographChartdata[]>([]);
  const [geoData, setGeoData] = useState<DemographData[]>([]);

  useEffect(() => {
    async function fetchTeacherData() {
      try {
        // Fetch state-wise teacher count from API
        const apiResponse = await fetch(`${api_startpoint}/api/demograph-teachers`, {
          method: 'POST'
        });
        const apiData: DemographData[] = await apiResponse.json();

        // Store the API data (for debugging or future use)
        setGeoData(apiData);

        // Define the mapping from API state names to your desired region keys
        const stateMappings: Record<string, string> = {
          "Tamil Nadu": "tamil nadu",
          "Telangana": "telangana",
          "Maharashtra": "maharashtra",
          "Karnataka": "karnataka",
          "Andhra Pradesh": "andhra pradesh",
          "Gujarat": "gujarat",
          "Madhya Pradesh": "madhya pradesh",
          "Odisha": "odisha",
          "West Bengal": "west bengal",
          "Delhi": "nct of delhi",
          "Uttar Pradesh": "uttar pradesh",
          "Jharkhand": "jharkhand",
          "Assam": "assam",
          "Chhattisgarh": "chhattisgarh",
          "Punjab": "punjab",
          "Bihar": "bihar",
          "Haryana": "haryana",
          "Daman and Diu": "daman and diu",
          "Chandigarh": "chandigarh",
          "Puducherry": "puducherry",
          "Rajasthan": "rajasthan",
          "Goa": "goa",
          "Kerala": "kerala",
          "Uttarakhand": "uttarakhand",
          "Himachal Pradesh": "himachal pradesh",
          "Lakshadweep": "lakshadweep",
          "Sikkim": "nikkim",
          "Nagaland": "nagaland",
          "Dadara and Nagar Haveli": "dadara and nagar havelli",
          "Jammu and Kashmir": "jammu and kashmir",
          "Manipur": "manipur",
          "Arunanchal Pradesh": "arunanchal pradesh",
          "Meghalaya": "meghalaya",
          "Mizoram": "mizoram",
          "Tripura": "tripura",
          "Andaman and Nicobar Islands": "andaman and nicobar",
        };

        // Transform the API data into chart-friendly format
        const transformedData: DemographChartdata[] = apiData
          .map((item) => ({
            code: stateMappings[item.state] || '', // Map using provided keys or return empty string
            value: Math.max(parseInt(item.count, 10), 1) // Ensure a minimum value of 1
          }))
          .filter((item) => item.code); // Filter out records with no mapping

          setChartTeacherData(transformedData);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    }

    fetchTeacherData();
  }, [api_startpoint]);

  // ECharts configuration options
  const teacherDemographicOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: chartTeacherData.map((item) => item.code),
      name: 'States',
      axisLabel: {
        rotate: 45,
        formatter: (value: string) =>
          value.charAt(0).toUpperCase() + value.slice(1)
      }
    },
    yAxis: {
      type: 'value',
      name: 'Teacher Count'
    },
    // Data zoom enables efficient panning and zooming on the chart
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'Teachers',
        type: 'bar',
        data: chartTeacherData.map((item) => item.value),
        itemStyle: {
          color: '#4a90e2'
        }
      }
    ]
  };

  interface Sessions {
    id: number;
    name: string;
    status: number;
    zoom_link: string;
    zoom_password: string;
    heading: string;
    description?: string; // Add this line
    date_time: string;
  }
  
    // Fetch sessions from the API endpoint.
  const [sessions, setSessions] = useState<Sessions[]>([]);
  const fetchSessions = () => {
      setLoading(true);
      fetch(`${api_startpoint}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSessions(data);
          // console.log(sessions)
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching sessions:', err);
          setLoading(false);
        });
  };

  useEffect(() => {
      fetchSessions();
  }, []);


  // Define the ECharts option for the gender pie chart with dummy data.
  const genderPieOption = {
    title: {
      // text: 'Gender Distribution',
      left: 'center',
      top: 20,
      textStyle: { color: '#333', fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {d}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['Prefer not to disclose', 'Male', 'Female'],
      textStyle: { color: '#333' }
    },
    series: [
      {
        name: 'Gender',
        type: 'pie',
        radius: '55%',
        center: ['50%', '55%'],
        data: [
          { value: 3, name: 'Prefer not to disclose' },
          { value: 50, name: 'Male' },
          { value: 47, name: 'Female' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };


  const [totalPointsEarned, setTotalPointsEarned] = useState<number>(0)
  useEffect(() => {
    async function fetchTotalPointsEarned() {
      try {
        const res = await fetch(`${api_startpoint}/api/total-points-earned`, {
          method: 'POST'
        })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json()
        
        // Access the total_points directly from the response object
        if (data && typeof data.total_points === 'string') {
          setTotalPointsEarned(parseInt(data.total_points))
        }
      } catch (error) {
        console.error('Error fetching total points:', error)
      }
    }
    
    fetchTotalPointsEarned()
  }, [])

  const [totalPointsRedeemed, setTotalPointsRedeemed] = useState<number>(0)
  useEffect(() => {
      async function fetchTotalPointsRedeemed() {
          try {
              const res = await fetch(`${api_startpoint}/api/total-points-redeemed`, {
                  method: 'POST'
              })
              const data = await res.json()
              if (data && data.length > 0) {
                  setTotalPointsRedeemed(data[0].total_coins_redeemed)
              }
          } catch (error) {
              console.error('Error fetching user count:', error)
          }
          }
          fetchTotalPointsRedeemed()
  }, [])


  const [missionGrouping, setMissionGrouping] = useState<string>('daily');
  const [missionData, setMissionData] = useState<any[]>([]);
  const [missionLoading, setMissionLoading] = useState<boolean>(true);
  const [missionStatus, setMissionStatus] = useState<string>('all');
  const [selectedMissionSubject, setSelectedMissionSubject] = useState<string>('all');
  const missionStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'approved', label: 'Approved' }
  ];
  // Fetch mission completed data whenever the grouping changes
  useEffect(() => {
    const fetchMissionData = async () => {
      setMissionLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/histogram_level_subject_challenges_complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            grouping: missionGrouping,
            status: missionStatus,
            subject: selectedMissionSubject === 'all' ? null : selectedMissionSubject
          })
        });
        const data = await response.json();
        // Log raw data for debugging
        // console.log('Mission data:', data);
        setMissionData(data);
      } catch (error) {
        console.error('Error fetching mission data:', error);
      } finally {
        setMissionLoading(false);
      }
    };

    fetchMissionData();
  }, [missionGrouping, missionStatus, selectedMissionSubject]);
  // Robust parser for JSON text fields.
  const getParsedField = (raw: any): string => {
    if (typeof raw === 'object' && raw !== null) {
      return raw.en || '';
    }
    if (typeof raw === 'string') {
      // Check if the string looks like JSON (starts with {)
      if (raw.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(raw);
          return parsed.en || raw;
        } catch {
          return raw;
        }
      }
      return raw;
    }
    return '';
  };


  const groupedByPeriod: Record<string, Record<string, number>> = {};
  missionData.forEach(item => {
    const period = item.period;
    // Use robust parsing for level_title.
    const level = getParsedField(item.level_title);
    if (!groupedByPeriod[period]) {
      groupedByPeriod[period] = {};
    }
    if (!groupedByPeriod[period][level]) {
      groupedByPeriod[period][level] = 0;
    }
    groupedByPeriod[period][level] += Number(item.count);
  });


  // Sorted periods for x-axis
  const periods = Object.keys(groupedByPeriod).sort();
  // Unique levels across data
  const uniqueLevels = Array.from(
    new Set(missionData.map(item => getParsedField(item.level_title)))
  );

  // Build series data: for each unique level, for each period, use the count (or 0 if missing)
  const series = uniqueLevels.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: periods.map(period => groupedByPeriod[period][level] || 0),
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));


  // Configure the ECharts option for the mission completed chart.
  // Configure the chart options.
  const missionChartOption = {
    title: {
      text: 'Mission Completed Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: uniqueLevels,
      top: 'bottom'
    },
    xAxis: {
      type: 'category',
      data: periods,
      boundaryGap: true,
      axisLabel: {
        rotate: missionGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: series
  };

  const transformData = (data: MissionRow[]): TransformedPeriod[] => {
    const result: Record<string, TransformedPeriod> = {};
  
    data.forEach(row => {
      // Use a fallback if period is null.
      const period = row.period || 'Unknown';
      if (!result[period]) {
        result[period] = { period, __breakdown: {} };
      }
      // Use the level title directly as key (or format it if needed).
      const level = getParsedField(row.level_title) || 'Unknown';
      const subject = getParsedField(row.subject_title)
      // Aggregate the total count per level
      result[period][level] = (result[period][level] || 0) + row.count;
      // Also store the subject breakdown.
      if (!result[period].__breakdown![level]) {
        result[period].__breakdown![level] = {};
      }
      result[period].__breakdown![level][subject] =
        (result[period].__breakdown![level][subject] || 0) + row.count;
    });
  
    return Object.values(result);
  };

  const missionDataTransformed = transformData(missionData)
  const periodsMissionTransformed = missionDataTransformed.map(item => item.period);
  const seriesMissionTransformed = uniqueLevels.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: missionDataTransformed.map(item => item[level] || 0),
    // Customize item color as desired.
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));
  
  // 1) First compute the total for each period:
  const totalCountsMissions = periodsMissionTransformed.map(period =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriod[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeries = {
    name: 'Total',            // you can omit this from your legend.data if you want
    type: 'bar',
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsMissions,
    barGap: '-100%',          // overlap exactly on top
    itemStyle: {              // make the bar itself invisible
      color: 'transparent'
    },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: {                // hide its tooltip, since it's just labels
      show: false
    },
    emphasis: {               // make sure it never highlights
      disabled: true
    }
  };

  // ECharts option with custom tooltip:
  const optionMissionTransformed = {
    title: {
      text: 'Mission Submitted Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        // `params` is an array of the series data in the hovered axis.
        // const period = params[0].axisValue; // the period (x-axis value)
        // // Find the breakdown for this period in your transformed data.
        // const periodData = missionDataTransformed.find((d: any) => d.period === period);
        // let tooltipHtml = `<strong>${period}</strong><br/>`;
        // params.forEach((p: any) => {
        //   tooltipHtml += `${p.seriesName}: ${p.data}<br/>`;
        //   // If the breakdown exists, add subject-level breakdown.
        //   if (periodData && periodData.__breakdown && periodData.__breakdown[p.seriesName]) {
        //     tooltipHtml += 'Subjects:<br/>';
        //     Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
        //       tooltipHtml += `&nbsp;&nbsp;${subject}: ${count}<br/>`;
        //     });
        //   }
        // });
        // return tooltipHtml;
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
          
          // Add subject breakdown if available
          const periodData = missionDataTransformed.find((d: any) => d.period === p.axisValue);
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml += '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
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
            });
            tooltipHtml += '</div>';
          }
        });
        return tooltipHtml;
      }
    },
    legend: {
      data: uniqueLevels,
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periodsMissionTransformed.map(p => formatPeriod(p, missionGrouping)),
      boundaryGap: true
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [
      ...seriesMissionTransformed,  // your original level‑by‑level stacks
      totalSeries                   // the invisible total bar on top
    ],
  };

  // -------------------- Jigyasa completed over time ------------------------------
  const [jigyasaGrouping, setJigyasaGrouping] = useState<string>('daily');
  const [jigyasaData, setJigyasaData] = useState<any[]>([]);
  const [jigyasaLoading, setJigyasaLoading] = useState<boolean>(true);
  const [jigyasaStatus, setJigyasaStatus] = useState<string>('all');
  // Add state for jigyasa subject filter
  const [selectedJigyasaSubject, setSelectedJigyasaSubject] = useState<string>('all');
  // Fetch Jigyasa completed data whenever the grouping changes
  useEffect(() => {
    const fetchJigyasaData = async () => {
      setJigyasaLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/histogram_level_subject_jigyasa_complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            grouping: jigyasaGrouping,
            status: jigyasaStatus,
            subject: selectedJigyasaSubject === 'all' ? null : selectedJigyasaSubject
          })
        });
        const data = await response.json();
        // Log raw data for debugging
        // console.log('jigyasa data:', data);
        setJigyasaData(data);
      } catch (error) {
        console.error('Error fetching jigyasa data:', error);
      } finally {
        setJigyasaLoading(false);
      }
    };

    fetchJigyasaData();
  },  [jigyasaGrouping, jigyasaStatus, selectedJigyasaSubject]);

  const groupedByPeriodJigyasa: Record<string, Record<string, number>> = {};
  jigyasaData.forEach(item => {
    const period = item.period;
    // Use robust parsing for level_title.
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
  // Unique levels across data
  const uniqueLevelsJigyasa = Array.from(
    new Set(jigyasaData.map(item => getParsedField(item.level_title)))
  );
  
  const seriesJigyasa = uniqueLevelsJigyasa.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: periodsJigyasa.map(period => groupedByPeriodJigyasa[period][level] || 0),
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  const jigyasaChartOption = {
    title: {
      text: 'Jigyasa Submitted Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: uniqueLevelsJigyasa,
      top: 'bottom'
    },
    xAxis: {
      type: 'category',
      data: periodsJigyasa,
      boundaryGap: true,
      axisLabel: {
        rotate: jigyasaGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: seriesJigyasa
  };

  const jigyasaDataTransformed = transformData(jigyasaData)
  const periodsJigyasaTransformed = jigyasaDataTransformed.map(item => item.period);
  const seriesJigyasaTransformed = uniqueLevelsJigyasa.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: jigyasaDataTransformed.map(item => item[level] || 0),
    // Customize item color as desired.
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  // 1) First compute the total for each period:
  const totalCountsJigyasa = periodsJigyasaTransformed.map(period =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodJigyasa[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesJigyasa = {
    name: 'Total',            // you can omit this from your legend.data if you want
    type: 'bar',
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsJigyasa,
    barGap: '-100%',          // overlap exactly on top
    itemStyle: {              // make the bar itself invisible
      color: 'transparent'
    },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: {                // hide its tooltip, since it's just labels
      show: false
    },
    emphasis: {               // make sure it never highlights
      disabled: true
    }
  };
  // ECharts option with custom tooltip:
  const optionJigyasaTransformed = {
    title: {
      text: 'Jigyasa Submitted Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        // // `params` is an array of the series data in the hovered axis.
        // const period = params[0].axisValue; // the period (x-axis value)
        // // Find the breakdown for this period in your transformed data.
        // const periodData = jigyasaDataTransformed.find((d: any) => d.period === period);
        // let tooltipHtml = `<strong>${period}</strong><br/>`;
        // params.forEach((p: any) => {
        //   tooltipHtml += `${p.seriesName}: ${p.data}<br/>`;
        //   // If the breakdown exists, add subject-level breakdown.
        //   if (periodData && periodData.__breakdown && periodData.__breakdown[p.seriesName]) {
        //     tooltipHtml += 'Subjects:<br/>';
        //     Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
        //       tooltipHtml += `&nbsp;&nbsp;${subject}: ${count}<br/>`;
        //     });
        //   }
        // });
        // return tooltipHtml;
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
          
          // Add subject breakdown if available
          const periodData = jigyasaDataTransformed.find((d: any) => d.period === p.axisValue);
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml += '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
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
            });
            tooltipHtml += '</div>';
          }
        });
        return tooltipHtml;
      }
    },
    legend: {
      data: uniqueLevelsJigyasa,
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periodsJigyasaTransformed.map(p => formatPeriod(p, jigyasaGrouping)),
      boundaryGap: true
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [ ...seriesJigyasaTransformed, totalSeriesJigyasa]
  };
  // -------------------------------------------------------------------------------

  // -------------------- Pragya completed over time ------------------------------

  const [pragyaGrouping, setPragyaGrouping] = useState<string>('daily');
  const [pragyaData, setPragyaData] = useState<any[]>([]);
  const [pragyaLoading, setPragyaLoading] = useState<boolean>(true);
  const [pragyaStatus, setPragyaStatus] = useState<string>('all');
  // Add state for pragya subject filter
  const [selectedPragyaSubject, setSelectedPragyaSubject] = useState<string>('all');
  // Fetch pragya completed data whenever the grouping changes
  useEffect(() => {
    const fetchPragyaData = async () => {
      setPragyaLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/histogram_level_subject_pragya_complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            grouping: pragyaGrouping,
            status: pragyaStatus,
            subject: selectedPragyaSubject === 'all' ? null : selectedPragyaSubject
          })
        });
        const data = await response.json();
        // Log raw data for debugging
        // console.log('pragya data:', data);
        setPragyaData(data);
      } catch (error) {
        console.error('Error fetching pragya data:', error);
      } finally {
        setPragyaLoading(false);
      }
    };

    fetchPragyaData();
  }, [pragyaGrouping, pragyaStatus, selectedPragyaSubject]);

  const groupedByPeriodPragya: Record<string, Record<string, number>> = {};
  pragyaData.forEach(item => {
    const period = item.period;
    // Use robust parsing for level_title.
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
  // Unique levels across data
  const uniqueLevelsPragya = Array.from(
    new Set(pragyaData.map(item => getParsedField(item.level_title)))
  );
  
  const seriesPragya = uniqueLevelsPragya.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: periodsPragya.map(period => groupedByPeriodPragya[period][level] || 0),
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  const pragyaChartOption = {
    title: {
      text: 'Pragya Completed Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: uniqueLevelsPragya,
      top: 'bottom'
    },
    xAxis: {
      type: 'category',
      data: periodsPragya,
      boundaryGap: true,
      axisLabel: {
        rotate: pragyaGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: seriesPragya
  };


  const pragyaDataTransformed = transformData(pragyaData)
  const periodsPragyaTransformed = pragyaDataTransformed.map(item => item.period);
  const seriesPragyaTransformed = uniqueLevelsPragya.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: pragyaDataTransformed.map(item => item[level] || 0),
    // Customize item color as desired.
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  // 1) First compute the total for each period:
  const totalCountsPragya = periodsPragyaTransformed.map(period =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodPragya[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesPragya = {
    name: 'Total',            // you can omit this from your legend.data if you want
    type: 'bar',
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsPragya,
    barGap: '-100%',          // overlap exactly on top
    itemStyle: {              // make the bar itself invisible
      color: 'transparent'
    },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: {                // hide its tooltip, since it's just labels
      show: false
    },
    emphasis: {               // make sure it never highlights
      disabled: true
    }
  };

  // ECharts option with custom tooltip:
  const optionPragyaTransformed = {
    title: {
      text: 'Pragya Submitted Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        // // `params` is an array of the series data in the hovered axis.
        // const period = params[0].axisValue; // the period (x-axis value)
        // // Find the breakdown for this period in your transformed data.
        // const periodData = pragyaDataTransformed.find((d: any) => d.period === period);
        // let tooltipHtml = `<strong>${period}</strong><br/>`;
        // params.forEach((p: any) => {
        //   tooltipHtml += `${p.seriesName}: ${p.data}<br/>`;
        //   // If the breakdown exists, add subject-level breakdown.
        //   if (periodData && periodData.__breakdown && periodData.__breakdown[p.seriesName]) {
        //     tooltipHtml += 'Subjects:<br/>';
        //     Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
        //       tooltipHtml += `&nbsp;&nbsp;${subject}: ${count}<br/>`;
        //     });
        //   }
        // });
        // return tooltipHtml;
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
          
          // Add subject breakdown if available
          const periodData = pragyaDataTransformed.find((d: any) => d.period === p.axisValue);
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml += '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
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
            });
            tooltipHtml += '</div>';
          }
        });
        return tooltipHtml;
      }
    },
    legend: {
      data: uniqueLevelsPragya,
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periodsPragyaTransformed.map(p => formatPeriod(p, pragyaGrouping)),
      boundaryGap: true
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [...seriesPragyaTransformed, totalSeriesPragya]
  };
  // -------------------------------------------------------------------------------

  const [quizGrouping, setQuizGrouping] = useState<string>('daily');
  const [quizData, setQuizData] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(true);

  // Helper function to parse JSON fields (level_title)
  const getParsedFieldQuiz = (raw: any): string => {
    if (typeof raw === 'object' && raw !== null) {
      return raw.en || '';
    }
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.en || raw;
      } catch {
        return raw;
      }
    }
    return raw;
  };

  // Add state for subject filter
  const [selectedQuizSubject, setSelectedQuizSubject] = useState<string>('all');
  const [quizSubjects, setQuizSubjects] = useState<Array<{ id: number; title: string }>>([]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/subjects_list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 1 })
        });
        const data = await res.json();
        const parsedSubjects = data.map((subject: any) => ({
          id: subject.id,
          title: JSON.parse(subject.title).en
        }));
        setQuizSubjects(parsedSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);
  // Fetch quiz complete data whenever quizGrouping changes
  useEffect(() => {
    const fetchQuizData = async () => {
      setQuizLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/histogram_topic_level_subject_quizgames_2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            grouping: quizGrouping,
            subject: selectedQuizSubject === 'all' ? null : selectedQuizSubject
          })
        });
        const data = await response.json();
        // console.log("Quiz data:", data);
        setQuizData(data);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuizData();
  }, [quizGrouping, selectedQuizSubject]);

  // Group quizData by period and level.
  const groupedByPeriodQuiz: Record<string, Record<string, number>> = {};
  quizData.forEach(item => {
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

  // Sorted periods for x-axis
  const periodsQuiz = Object.keys(groupedByPeriodQuiz).sort();
  // Unique levels for legend and series
  const uniqueLevelsQuiz= Array.from(new Set(quizData.map(item => getParsedField(item.level_title))));

  // Build series data: one series per level (stacked bar)
  const seriesQuiz = uniqueLevelsQuiz.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: periodsQuiz.map(period => groupedByPeriodQuiz[period][level] || 0),
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  // Configure the quiz completes chart option
  const quizChartOption = {
    title: {
      text: 'Quiz Completed Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: uniqueLevelsQuiz,
      top: 'bottom'
    },
    xAxis: {
      type: 'category',
      data: periodsQuiz,
      boundaryGap: true,
      axisLabel: {
        rotate: quizGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: seriesQuiz
  };

  const quizDataTransformed = transformData(quizData)
  const periodsQuizTransformed = quizDataTransformed.map(item => item.period);
  const seriesQuizTransformed = uniqueLevelsQuiz.map((level, idx) => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: quizDataTransformed.map(item => item[level] || 0),
    // Customize item color as desired.
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  // 1) First compute the total for each period:
  const totalCountsQuiz = periodsQuizTransformed.map(period =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodQuiz[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesQuiz = {
    name: 'Total',            // you can omit this from your legend.data if you want
    type: 'bar',
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsQuiz,
    barGap: '-100%',          // overlap exactly on top
    itemStyle: {              // make the bar itself invisible
      color: 'transparent'
    },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: {                // hide its tooltip, since it's just labels
      show: false
    },
    emphasis: {               // make sure it never highlights
      disabled: true
    }
  };
  // ECharts option with custom tooltip:
  const optionQuizTransformed = {
    title: {
      text: 'Quiz Completed Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        // // `params` is an array of the series data in the hovered axis.
        // const period = params[0].axisValue; // the period (x-axis value)
        // // Find the breakdown for this period in your transformed data.
        // const periodData = quizDataTransformed.find((d: any) => d.period === period);
        // let tooltipHtml = `<strong>${period}</strong><br/>`;
        // params.forEach((p: any) => {
        //   tooltipHtml += `${p.seriesName}: ${p.data}<br/>`;
        //   // If the breakdown exists, add subject-level breakdown.
        //   if (periodData && periodData.__breakdown && periodData.__breakdown[p.seriesName]) {
        //     tooltipHtml += 'Subjects:<br/>';
        //     Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
        //       tooltipHtml += `&nbsp;&nbsp;${subject}: ${count}<br/>`;
        //     });
        //   }
        // });
        // return tooltipHtml;
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
          
          // Add subject breakdown if available
          const periodData = quizDataTransformed.find((d: any) => d.period === p.axisValue);
          if (periodData?.__breakdown?.[p.seriesName]) {
            tooltipHtml += '<div style="margin-left: 15px; margin-top: 5px;">Subjects:';
            Object.entries(periodData.__breakdown[p.seriesName]).forEach(([subject, count]) => {
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
            });
            tooltipHtml += '</div>';
          }
        });
        return tooltipHtml;
      }
    },
    legend: {
      data: uniqueLevelsQuiz,
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: periodsQuizTransformed.map(p => formatPeriod(p, quizGrouping)),
      boundaryGap: true
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [...seriesQuizTransformed, totalSeriesQuiz]
  };

  // -----------------------------------------------------------------------------------------------
  // ------------------------------------- Mission Coins Earned Over time ---------------------------------

  // 1. State/hooks for mission‐points chart
  const [pointsMissionGrouping, setPointsMissionGrouping] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'lifetime'>('monthly');
  const [pointsMissionData, setPointsMissionData] = useState<{ period: string; points: number }[]>([]);
  const [pointsMissionLoading, setPointsMissionLoading] = useState<boolean>(true);

  // 2. Fetch mission‐points over time whenever grouping changes
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsMissionLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/mission-points-over-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping: pointsMissionGrouping })
        });
        const json = await res.json();
        // assume json.data is [{ period, points }, …]
        setPointsMissionData(json.data);
      } catch (err) {
        console.error('Error loading points data', err);
      } finally {
        setPointsMissionLoading(false);
      }
    };
    fetchPoints();
  }, [pointsMissionGrouping]);

  const pointsMissionCoinSeries = {
    name: 'Points',
    type: 'bar' as const,
    data: pointsMissionData.map(d => d.points),
    barMaxWidth: '50%',
    itemStyle: { color: '#5470C6' }
  };

  const totalMissionCoinSeries = {
    name: 'Total',
    type: 'bar' as const,
    // no stack, so it draws from 0→value just like a normal bar
    data: pointsMissionData.map(d => d.points),
    barGap: '-100%',               // sit exactly under the colored bar
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      // verticalAlign: 'middle',
      // offset: [-25, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1                          // draw behind your real bars
  };
  // 3. Build your ECharts option
  const pointsMissionChartOption = {
    title: { text: 'Mission Points Over Time', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: pointsMissionData.map(d => formatPeriod(d.period, pointsMissionGrouping)),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsMissionGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: 'Points'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    series: [
      pointsMissionCoinSeries,
      totalMissionCoinSeries
    ]
  };

  // ------------------------------------- Quiz Points Earned over Time --------------------------
  // Add to your state declarations
  const [pointsQuizGrouping, setPointsQuizGrouping] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'lifetime'>('monthly');
  const [pointsQuizData, setPointsQuizData] = useState<{ period: string; points: number }[]>([]);
  const [pointsQuizLoading, setPointsQuizLoading] = useState<boolean>(true);

  // Add useEffect for fetching quiz points
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsQuizLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/quiz-points-over-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping: pointsQuizGrouping })
        });
        const json = await res.json();
        setPointsQuizData(json.data);
      } catch (err) {
        console.error('Error loading quiz points data', err);
      } finally {
        setPointsQuizLoading(false);
      }
    };
    fetchPoints();
  }, [pointsQuizGrouping]);

  // Quiz points series configuration
  const pointsQuizCoinSeries = {
    name: 'Points',
    type: 'bar' as const,
    data: pointsQuizData.map(d => d.points),
    barMaxWidth: '50%',
    itemStyle: { color: '#5470C6' }
  };

  const totalQuizCoinSeries = {
    name: 'Total',
    type: 'bar' as const,
    data: pointsQuizData.map(d => d.points),
    barGap: '-100%',
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',
      formatter: '{c}',
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1
  };

  // ECharts options
  const pointsQuizChartOption = {
    title: { text: 'Quiz Points Over Time', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: pointsQuizData.map(d => formatPeriod(d.period, pointsQuizGrouping)),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsQuizGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: 'Points'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    series: [
      pointsQuizCoinSeries,
      totalQuizCoinSeries
    ]
  };
  // ------------------------------------- Jigyasa Points Earned Over Time ------------------------

  // 1. State/hooks for mission‐points chart
  const [pointsJigyasaGrouping, setPointsJigyasaGrouping] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'lifetime'>('monthly');
  const [pointsJigyasaData, setPointsJigyasaData] = useState<{ period: string; points: number }[]>([]);
  const [pointsJigyasaLoading, setPointsJigyasaLoading] = useState<boolean>(true);

  // 2. Fetch mission‐points over time whenever grouping changes
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsJigyasaLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/jigyasa-points-over-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping: pointsJigyasaGrouping })
        });
        const json = await res.json();
        // assume json.data is [{ period, points }, …]
        setPointsJigyasaData(json.data);
      } catch (err) {
        console.error('Error loading points data', err);
      } finally {
        setPointsJigyasaLoading(false);
      }
    };
    fetchPoints();
  }, [pointsJigyasaGrouping]);

  const pointsJigyasaCoinSeries = {
    name: 'Points',
    type: 'bar' as const,
    data: pointsJigyasaData.map(d => d.points),
    barMaxWidth: '50%',
    itemStyle: { color: '#5470C6' }
  };

  const totalJigyasaCoinSeries = {
    name: 'Total',
    type: 'bar' as const,
    // no stack, so it draws from 0→value just like a normal bar
    data: pointsJigyasaData.map(d => d.points),
    barGap: '-100%',               // sit exactly under the colored bar
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      // verticalAlign: 'middle',
      // offset: [-25, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1                          // draw behind your real bars
  };
  // 3. Build your ECharts option
  const pointsJigyasaChartOption = {
    title: { text: 'Jigyasa Points Over Time', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: pointsJigyasaData.map(d => formatPeriod(d.period, pointsJigyasaGrouping)),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsJigyasaGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: 'Points'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    series: [
      pointsJigyasaCoinSeries,
      totalJigyasaCoinSeries
    ]
  };

  // ----------------------------- Pragya Coins Earned Over Time -----------------------------------

  // 1. State/hooks for mission‐points chart
  const [pointsPragyaGrouping, setPointsPragyaGrouping] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'lifetime'>('monthly');
  const [pointsPragyaData, setPointsPragyaData] = useState<{ period: string; points: number }[]>([]);
  const [pointsPragyaLoading, setPointsPragyaLoading] = useState<boolean>(true);

  // 2. Fetch mission‐points over time whenever grouping changes
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsPragyaLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/pragya-points-over-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping: pointsPragyaGrouping })
        });
        const json = await res.json();
        // assume json.data is [{ period, points }, …]
        setPointsPragyaData(json.data);
      } catch (err) {
        console.error('Error loading points data', err);
      } finally {
        setPointsPragyaLoading(false);
      }
    };
    fetchPoints();
  }, [pointsPragyaGrouping]);

  const pointsPragyaCoinSeries = {
    name: 'Points',
    type: 'bar' as const,
    data: pointsPragyaData.map(d => d.points),
    barMaxWidth: '50%',
    itemStyle: { color: '#5470C6' }
  };

  const totalPragyaCoinSeries = {
    name: 'Total',
    type: 'bar' as const,
    // no stack, so it draws from 0→value just like a normal bar
    data: pointsPragyaData.map(d => d.points),
    barGap: '-100%',               // sit exactly under the colored bar
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      // verticalAlign: 'middle',
      // offset: [-25, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1                          // draw behind your real bars
  };
  // 3. Build your ECharts option
  const pointsPragyaChartOption = {
    title: { text: 'Pragya Points Over Time', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: pointsPragyaData.map(d => formatPeriod(d.period, pointsPragyaGrouping)),
      boundaryGap: true,
      axisLabel: {
        rotate: pointsPragyaGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: 'Points'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    series: [
      pointsPragyaCoinSeries,
      totalPragyaCoinSeries
    ]
  };
  // ----------------------------- Coupon Redeems over Time ----------------------------------------
  // 1. State/hooks for mission‐points chart
  const [couponRedeemsGrouping, setCouponRedeemsGrouping] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'lifetime'>('monthly');
  const [couponRedeemsData, setCouponRedeemsData] = useState<{ period: string; coins: number }[]>([]);
  const [couponRedeemsLoading, setCouponRedeemsLoading] = useState<boolean>(true);

  // Fetch data on grouping change
  useEffect(() => {
    setCouponRedeemsLoading(true);
    fetch(`${api_startpoint}/api/coupon-redeems-over-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grouping: couponRedeemsGrouping })
    })
      .then(res => res.json())
      .then(json => setCouponRedeemsData(json.data))
      .catch(console.error)
      .finally(() => setCouponRedeemsLoading(false));
  }, [couponRedeemsGrouping]);

   // Main bar series
  const CouponRedeemsSeries = {
    name: 'Coins',
    type: 'bar' as const,
    data: couponRedeemsData.map(d => d.coins),
    barMaxWidth: '50%',
    itemStyle: { color: '#FF8C42' }
  }

  // Invisible total series for labels
  const totalCouponRedeemsSeries = {
    name: 'Total',
    type: 'bar' as const,
    data: couponRedeemsData.map(d => d.coins),
    barGap: '-100%',
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',
      formatter: '{c}',
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1
  };

  // Format daily labels
  // const formatPeriod = (period: string) => {
  //   if (couponRedeemsGrouping === 'daily') {
  //     const date = new Date(period);
  //     return date.toISOString().split('T')[0]; // YYYY-MM-DD
  //   }
  //   return period;
  // };
  const couponRedeemsSeriesOptions = {
    title: { text: 'Coupon Redeems Over Time', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: couponRedeemsData.map(d => formatPeriod(d.period, couponRedeemsGrouping)),
      axisLabel: { rotate: couponRedeemsGrouping === 'daily' ? 45 : 0 }
    },
    yAxis: { type: 'value', name: 'Coins' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [CouponRedeemsSeries, totalCouponRedeemsSeries]
  };



  //------------------------------------------------------------------------------------------------
  const [studentGrouping, setStudentGrouping] = useState<string>('monthly');
  const [studentData, setStudentData] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState<boolean>(true);

  const [allStates, setAllStates] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${api_startpoint}/api/get-all-states`)
      .then(r => r.json())
      .then(json => setAllStates(json.states || []))
      .catch(console.error);
  }, []);

  const [selectedState, setSelectedState] = useState<string>('');
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
  };

  // Fetch demograph student data using the grouping parameter
  useEffect(() => {
    const fetchStudentData = async () => {
      setStudentLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/demograph-students-2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping: studentGrouping, state: selectedState })
        });
        const data = await response.json();
        // console.log('Student demograph data:', data);  // Debug log
        setStudentData(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setStudentLoading(false);
      }
    };

    fetchStudentData();
  }, [studentGrouping, selectedState]);

  // Transform the data into a format for a stacked bar chart.
  // We expect each row: { period, state, count }
  // We group data by period, then for each period, record counts per state.
  const groupedByPeriodStudent: Record<string, Record<string, number>> = {};
  studentData.forEach(item => {
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

  // Get the unique states present for legend and series creation.
  const uniqueStatesStudent = Array.from(new Set(studentData.map(item => item.state)));

  // 2) generate a matching-length HSL palette
  const generateDarkerContrastingColors = (count: number): string[] => {
    const colors: string[] = [];
    const goldenRatioConjugate = 0.618033988749895;
    let hue = Math.random(); // start from random hue
  
    for (let i = 0; i < count; i++) {
      hue += goldenRatioConjugate;
      hue %= 1;
      const h = Math.round(hue * 360);
      const s = 85;  // slightly reduced saturation for depth
      const l = 35;  // DARKER lightness
      colors.push(`hsl(${h}, ${s}%, ${l}%)`);
    }
    return colors;
  };
  
  const stateColors = generateDarkerContrastingColors(uniqueStatesStudent.length);
  

  // Build series data: one series per state
  const seriesStudent = uniqueStatesStudent.map((state, idx) => ({
    name: state,
    type: 'bar',
    stack: 'total',
    // label: {
    //   show: true,            // turn on labels
    //   position: 'insideTop', // or 'top' if you prefer it above the bar
    //   fontSize: 12,
    //   color: '#fff',         // white text inside dark bars
    //   formatter: '{c}'       // {c} is the raw value
    // },
    data: periodsStudent.map(period => groupedByPeriodStudent[period][state] || 0),
    // itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  // 1) First compute the total for each period:
  const totalCountsStudent = periodsStudent.map(period =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodStudent[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesStudent = {
    name: 'Total',            // you can omit this from your legend.data if you want
    type: 'bar',
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsStudent,
    barGap: '-100%',          // overlap exactly on top
    itemStyle: {              // make the bar itself invisible
      color: 'transparent'
    },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: {                // hide its tooltip, since it's just labels
      show: false
    },
    emphasis: {               // make sure it never highlights
      disabled: true
    }
  };
  // Build chart options
  const chartOptionStudent = {
    color: stateColors,
    title: {
      text: 'Student Demographics Distribution Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      type: 'scroll',         // <-- makes the legend scrollable
    orient: 'horizontal',   // or 'vertical' if you prefer
      data: uniqueStatesStudent,
      top: 'bottom',
      pageIconColor: '#999',
      pageIconInactiveColor: '#ccc',
      pageIconSize: 12,
      pageTextStyle: {
        color: '#333'
      }
    },
    xAxis: {
      type: 'category',
      data: periodsStudent.map(p => formatPeriod(p, studentGrouping)),
      axisLabel: {
        rotate: studentGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [...seriesStudent,totalSeriesStudent]
  };

  

  //--------------------------------------------------------------------------------
  const [teacherGrouping, setTeacherGrouping] = useState<string>('monthly');
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [teacherLoading, setTeacherLoading] = useState<boolean>(true);

  // state‐filter (reuse allStates you already fetch)
  const [selectedTeacherState, setSelectedTeacherState] = useState<string>('');
  useEffect(() => {
    const fetchTeacherData = async () => {
      setTeacherLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/demograph-teachers-2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping: teacherGrouping, state: selectedTeacherState })
        });
        const data = await response.json();
        // console.log('Teacher demograph data:', data); // Debug log
        setTeacherData(data);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setTeacherLoading(false);
      }
    };

    fetchTeacherData();
  }, [teacherGrouping, selectedTeacherState]);

  const groupedByPeriodTeacher: Record<string, Record<string, number>> = {};
  teacherData.forEach(item => {
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

  // Get all periods sorted for the x-axis
  const periodsTeacher = Object.keys(groupedByPeriodTeacher).sort();
  // Extract unique states for legend and series creation
  const uniqueStatesTeacher = Array.from(new Set(teacherData.map(item => item.state)));

  // Build series for each state (for a stacked bar chart)
  const seriesTeacher = uniqueStatesTeacher.map((state, idx) => ({
    name: state,
    type: 'bar',
    stack: 'total',
    data: periodsTeacher.map(period => groupedByPeriodTeacher[period][state] || 0),
    // Colors are defined in a fixed palette; adjust as needed.
    itemStyle: { color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'][idx % 6] }
  }));

  // 1) First compute the total for each period:
  const totalCountsTeacher = periodsTeacher.map(period =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodTeacher[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesTeacher = {
    name: 'Total',            // you can omit this from your legend.data if you want
    type: 'bar',
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsTeacher,
    barGap: '-100%',          // overlap exactly on top
    itemStyle: {              // make the bar itself invisible
      color: 'transparent'
    },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: {                // hide its tooltip, since it's just labels
      show: false
    },
    emphasis: {               // make sure it never highlights
      disabled: true
    }
  };
  // Build the chart option with a scrollable legend
  const chartOptionTeacher = {
    title: {
      text: 'Teacher Demographics Distribution Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      type: 'scroll', // make legend scrollable if there are many items
      orient: 'horizontal',
      top: 'bottom',
      data: uniqueStatesTeacher,
      pageIconColor: '#999',
      pageIconInactiveColor: '#ccc',
      pageIconSize: 12,
      pageTextStyle: { color: '#333' }
    },
    xAxis: {
      type: 'category',
      data: periodsTeacher.map(p => formatPeriod(p, teacherGrouping)),
      axisLabel: {
        rotate: teacherGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [ ...seriesTeacher, totalSeriesTeacher]
  };
  // ---------------------------------------------------------------------------------------------
  // Add to your existing state declarations
  const [schoolGrouping, setSchoolGrouping] = useState<string>('monthly');
  const [schoolData, setSchoolData] = useState<any[]>([]);
  const [schoolLoading, setSchoolLoading] = useState<boolean>(true);
  const [selectedSchoolState, setSelectedSchoolState] = useState<string>('');
  useEffect(() => {
    const fetchSchoolData = async () => {
      setSchoolLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/demograph-schools`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            grouping: schoolGrouping, 
            state: selectedSchoolState 
          })
        });
        const data = await response.json();
        setSchoolData(data);
      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setSchoolLoading(false);
      }
    };
  
    fetchSchoolData();
  }, [schoolGrouping, selectedSchoolState]);
  
  const groupedByPeriodSchool: Record<string, Record<string, number>> = {};
  schoolData.forEach(item => {
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
  const uniqueStatesSchool = Array.from(new Set(schoolData.map(item => item.state)));

  const seriesSchool = uniqueStatesSchool.map((state, idx) => ({
    name: state,
    type: 'bar',
    stack: 'total',
    data: periodsSchool.map(period => groupedByPeriodSchool[period][state] || 0),
    itemStyle: { 
      color: generateDarkerContrastingColors(uniqueStatesSchool.length)[idx]
    }
  }));

  const totalCountsSchool = periodsSchool.map(period =>
    Object.values(groupedByPeriodSchool[period]).reduce((sum, v) => sum + v, 0)
  );

  const totalSeriesSchool = {
    name: 'Total',
    type: 'bar',
    data: totalCountsSchool,
    barGap: '-100%',
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',
      formatter: '{c}',
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true }
  };

  const chartOptionSchool = {
    color: generateDarkerContrastingColors(uniqueStatesSchool.length),
    title: {
      text: 'Schools Demographics Distribution Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      top: 'bottom',
      data: uniqueStatesSchool,
      pageIconColor: '#999',
      pageIconInactiveColor: '#ccc',
      pageIconSize: 12,
      pageTextStyle: { color: '#333' }
    },
    xAxis: {
      type: 'category',
      data: periodsSchool.map(p => formatPeriod(p, schoolGrouping)),
      axisLabel: {
        rotate: schoolGrouping === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [...seriesSchool, totalSeriesSchool]
  };

  // ---------------------------------------------------------------------------------------------
  const [schoolCount, setSchoolCount] = useState<number>(0);
    useEffect( () => {
        async function fetchSchoolCount() {
            try {
                const res = await fetch(`${api_startpoint}/api/school_count`, {
                    method: 'POST'
                })
                const data = await res.json()
                if (data && data.length > 0) {
                    setSchoolCount(data[0].count)
                }
            } catch (error) {
                console.error('Error fetching user count:', error)
            }
        }
        fetchSchoolCount()
  }, [])
  const [quizCompletes, setQuizCompletes] = useState<number>(0);
    useEffect( () => {
        async function fetchQuizCompletes() {
            try {
                const res = await fetch(`${api_startpoint}/api/quiz_completes`, {
                    method: 'POST',
                })
                const data = await res.json()
                if (data && data.length > 0) {
                  setQuizCompletes(data[0].count)
                }
            } catch (error) {
                console.error('Error fetching user count:', error)
            }
        }
        fetchQuizCompletes()
  }, [])

  const [tmcAssignedByTeacher, setTmcAssignedByTeacher] = useState<number>(0)
    useEffect(() => {
        async function fetchTmcAssignedByTeacher() {
            try {
                const res = await fetch(`${api_startpoint}/api/total-missions-completed-assigned-by-teacher`, {
                    method: 'POST'
                })
                const data = await res.json()
                if (data && data.length > 0) {
                    setTmcAssignedByTeacher(data[0].count)
                }
            } catch (error) {
                console.error('Error fetching total-missions-completed-assigned-by-teacher:', error)
            }
            }
            fetchTmcAssignedByTeacher()
  }, [])

  const [tmcTotal, setTmcTotal] = useState<number>(0)
  useEffect(()=> {
    async function fetchTmcTotal() {
      try {
        const res = await fetch(`${api_startpoint}/api/total_missions_completes`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data && data.length > 0) {
          setTmcTotal(data[0].count)
        }
      } catch (error) {
          console.error('Error fetching total_missions_completes:', error)
      }
    }
    fetchTmcTotal()
  },[])

  const [tjcTotal, setTjcTotal] = useState<number>(0)
  useEffect(()=> {
    async function fetchTjcTotal() {
      try {
        const res = await fetch(`${api_startpoint}/api/total_jigyasa_completes`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data && data.length > 0) {
          setTjcTotal(data[0].count)
        }
      } catch (error) {
          console.error('Error fetching total_jigyasa_completes:', error)
      }
    }
    fetchTjcTotal()
  },[])

  const [tpcTotal, setTpcTotal] = useState<number>(0)
  useEffect(()=> {
    async function fetchTpcTotal() {
      try {
        const res = await fetch(`${api_startpoint}/api/total_pragya_completes`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data && data.length > 0) {
          setTpcTotal(data[0].count)
        }
      } catch (error) {
          console.error('Error fetching total_pragya_completes:', error)
      }
    }
    fetchTpcTotal()
  },[])

  const [tqcTotal, setTqcTotal] = useState<number>(0)
  useEffect(()=> {
    async function fetchTqcTotal() {
      try {
        const res = await fetch(`${api_startpoint}/api/total_quiz_completes`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data && data.count !== undefined) {
          setTqcTotal(data.count)
        }
      } catch (error) {
          console.error('Error fetching total_quiz_completes:', error)
      }
    }
    fetchTqcTotal()
  },[])

  const [trcTotal, setTrcTotal] = useState<number>(0)
  useEffect(()=> {
    async function fetchTrcTotal() {
      try {
        const res = await fetch(`${api_startpoint}/api/total_riddle_completes`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data && data.length > 0) {
          setTrcTotal(data[0].count)
        }
      } catch (error) {
          console.error('Error fetching total_riddle_completes:', error)
      }
    }
    fetchTrcTotal()
  },[])

  const [tpzcTotal, setTpzcTotal] = useState<number>(0)
  useEffect(()=> {
    async function fetchTpzcTotal() {
      try {
        const res = await fetch(`${api_startpoint}/api/total_puzzle_completes`, {
            method: 'POST'
        })
        const data = await res.json()
        if (data && data.length > 0) {
          setTpzcTotal(data[0].count)
        }
      } catch (error) {
          console.error('Error fetching total_puzzle_completes:', error)
      }
    }
    fetchTpzcTotal()
  },[])

  const [missionsParticipationRate, setMissionParticipationRate] = useState<number>(0)

  useEffect(() => {
    async function fetchMissionsParticipationRate() {
      try {
        const res = await fetch(`${api_startpoint}/api/mission_participation_rate`, {
          method: 'POST'
        })
        const data = await res.json()
        if (data && data.participation_rate !== undefined) {
          setMissionParticipationRate(data.participation_rate)
        }
      } catch (error) {
        console.error('Error fetching mission_participation_rate:', error)
      }
    }

    fetchMissionsParticipationRate()
  }, [])


  const [jigyasaParticipationRate, setJigyasaParticipationRate] = useState<number>(0)

  useEffect(() => {
    async function fetchJigyasaParticipationRate() {
      try {
        const res = await fetch(`${api_startpoint}/api/jigyasa_participation_rate`, {
          method: 'POST'
        })
        const data = await res.json()
        if (data && data.participation_rate !== undefined) {
          setJigyasaParticipationRate(data.participation_rate)
        }
      } catch (error) {
        console.error('Error fetching jigyasa_participation_rate:', error)
      }
    }

    fetchJigyasaParticipationRate()
  }, [])

  const [pragyaParticipationRate, setPragyaParticipationRate] = useState<number>(0)

  useEffect(() => {
    async function fetchPragyaParticipationRate() {
      try {
        const res = await fetch(`${api_startpoint}/api/pragya_participation_rate`, {
          method: 'POST'
        })
        const data = await res.json()
        if (data && data.participation_rate !== undefined) {
          setPragyaParticipationRate(data.participation_rate)
        }
      } catch (error) {
        console.error('Error fetching pragya_participation_rate:', error)
      }
    }

    fetchPragyaParticipationRate()
  }, [])

  const [quizParticipationRate, setQuizParticipationRate] = useState<number>(0)

  useEffect(() => {
    async function fetchQuizParticipationRate() {
      try {
        const res = await fetch(`${api_startpoint}/api/quiz_participation_rate`, {
          method: 'POST'
        })
        const data = await res.json()
        if (data && data.participation_rate !== undefined) {
          setQuizParticipationRate(data.participation_rate)
        }
      } catch (error) {
        console.error('Error fetching mission_participation_rate:', error)
      }
    }

    fetchQuizParticipationRate()
  }, [])


  const [sessionParticipantTotal, setSessionParticipantTotal] = useState<number>(0)
    useEffect(() => {
        async function fetchSessionParticipantTotal() {
            try {
                const res = await fetch(`${api_startpoint}/api/session_participants_total`, {
                    method: 'POST'
                })
                const data = await res.json()
                if (data && data.length > 0) {
                  setSessionParticipantTotal(data[0].count)
                }
            } catch (error) {
                console.error('Error fetching user count:', error)
            }
            }
            fetchSessionParticipantTotal()
  }, [])

  const [mentorsParticipatedSessionsTotal, setMentorsParticipatedSessionsTotal] = useState<number>(0)
    useEffect(() => {
        async function fetchMentorsParticipatedSessionsTotal() {
            try {
                const res = await fetch(`${api_startpoint}/api/mentor_participated_in_sessions_total`, {
                    method: 'POST'
                })
                const data = await res.json()
                if (data && data.length > 0) {
                  setMentorsParticipatedSessionsTotal(data[0].count)
                }
            } catch (error) {
                console.error('Error fetching user count:', error)
            }
            }
            fetchMentorsParticipatedSessionsTotal()
  }, [])

  const [modalOpenLevel, setModalOpenLevel] = useState(false)
  // const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('science')
  const [EchartDataLevel, setEchartDataLevel] = useState<LevelCountEntry[]>([]);
  const [groupingLevel, setGroupingLevel] = useState('monthly');
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [errorLevel, setErrorLevel] = useState<string | null>(null);
  // 1) Define the exact keys:
  type Level = 'level1'|'level2'|'level3'|'level4';
  type FilterLevel = Level|'all';

  // 2) Keep a single selectedLevel in state
  const [selectedLevel, setSelectedLevel] = useState<FilterLevel>('all');

  // 3) Derive the array you’ll actually send & chart from it
  const allLevels: Level[] = ['level1','level2','level3','level4'];
  const levelsToFetch: Level[] =
    selectedLevel === 'all' ? allLevels : [selectedLevel];

  useEffect(() => {
  setLoadingLevel(true);
  fetch(`${api_startpoint}/api/student-count-by-level-over-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grouping: groupingLevel,
      levels: levelsToFetch
    })
  })
    .then(r => r.json())
    .then(data => {
      // spread-fix from before
      const transformed = data.map((item: any) => ({
        ...item,
        period: item.period || 'Unknown'
      }));
      setEchartDataLevel(transformed);
    })
    .catch(console.error)
    .finally(() => setLoadingLevel(false));
}, [groupingLevel, selectedLevel]);

  // Fetch new data whenever the grouping changes.
  // useEffect(() => {
  //   fetchDataLevelOverTime(groupingLevel);
  // }, [groupingLevel]);

  // Prepare the legend – here fixed order for levels.
  

  // 2) Tell TS that your color map only ever has those keys:
  const levelColors: Record<Level, string> = {
    level1: '#1E3A8A',
    level2: '#3B82F6',
    level3: '#60A5FA',
    level4: '#93C5FD',
  }

  
  const seriesData = levelsToFetch.map(level => ({
    name:
      level === 'level1' ? 'Level 1: Grade 1–5' :
      level === 'level2' ? 'Level 2: Grade 6+' :
      level === 'level3' ? 'Level 3: Grade 7+' :
                           'Level 4: Grade 8+',
    type: 'bar' as const,
    stack: 'total' as const,
    data: EchartDataLevel.map(item => item[`${level}_count`] || 0),
    itemStyle: { color: levelColors[level] }
  }));

  // 2) Generate the legend labels from your series names:
  const legendData = seriesData.map(s => s.name);

  // 1) After you’ve built `seriesData`, compute the total for each period:
  const totalCountsLevel = EchartDataLevel.map(item =>
    [item.level1_count, item.level2_count, item.level3_count, item.level4_count]
      .map(v => Number(v))
      .reduce((sum, val) => sum + val, 0)
  );
  

  const totalSeriesCountLevel = {
    name: 'Total',
    type: 'bar',
    // ← NO `stack` here, so it draws from 0 up to the total
    data: totalCountsLevel,
    barGap: '-100%',            // overlap exactly on top of the stacks
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1                        // render behind your colored stacks
  };

  // ECharts option configuration.
  const EchartLevelOption = {
    title: {
      text: 'Student Count by Level Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      orient: 'horizontal',   // lay items out in a row
      top: 'bottom',
      bottom: 10,
      data: legendData
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: EchartDataLevel.map(item => item.period),
      boundaryGap: groupingLevel === 'lifetime' ? true : false,
      axisLabel: { rotate: groupingLevel === 'daily' ? 45 : 0 }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [...seriesData, totalSeriesCountLevel]
  };

  // useEffect(() => {
  //   if (modalOpenLevel) {
  //     fetchData("all"); // always fetch "all" on modal open
  //     setSelectedLevel("all"); // keep UI in sync
  //   }
  // }, [modalOpenLevel]);
  
  // const chartOptionsLevel = {
  //   title: {
  //     text: 'Student Count by Level',
  //     left: 'center'
  //   },
  //   tooltip: {},
  //   xAxis: {
  //     type: 'category',
  //     data: ['Level 1', 'Level 2', 'Level 3', 'Level 4']
  //   },
  //   yAxis: {
  //     type: 'value'
  //   },
  //   series: [
  //     {
  //       data: [
  //         dataLevel.level1_count ?? 0,
  //         dataLevel.level2_count ?? 0,
  //         dataLevel.level3_count ?? 0,
  //         dataLevel.level4_count ?? 0
  //       ],
  //       type: 'bar',
  //       itemStyle: {
  //         color: '#0077BE'
  //       }
  //     }
  //   ]
  // }
  // console.log("📊 Chart dataLevel:", dataLevel);


  const [EchartDataGender, setEchartDataGender] = useState<any[]>([]);
  const [groupingGender, setGroupingGender] = useState('monthly');
  const [loadingGender, setLoadingGender] = useState(true);
  const [errorGender, setErrorGender] = useState<string | null>(null);
  const [selectedUserTypeGender, setSelectedUserTypeGender]= useState('All');
  // Function to fetch gender-based signup data
  const fetchDataGender = (selectedGrouping: string, selectedUserTypeGender: string) => {
    setLoadingGender(true);
    fetch(`${api_startpoint}/api/signing-user-gender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grouping: selectedGrouping, user_type: selectedUserTypeGender })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Transform data into an array of objects with the desired structure:
        // { period, Male, Female, Unspecified }
        // (Assuming the API output uses these keys.)
        const groupedData = (data.data as GenderSignup[]).reduce((acc: { [key: string]: GenderSignup }, entry: GenderSignup) => {
          // Replace null period with "Unknown" if desired
          const period = entry.period || 'Unknown';
          if (!acc[period]) {
            acc[period] = { period, Male: 0, Female: 0, Unspecified: 0 };
          }
          // Directly use the keys from the API response
          acc[period].Male = entry.Male;
          acc[period].Female = entry.Female;
          acc[period].Unspecified = entry.Unspecified;
          return acc;
        }, {});
        
        setEchartDataGender(Object.values(groupedData));
      
        setLoadingGender(false);
      })
      .catch(err => {
        setErrorGender(err.message);
        setLoadingGender(false);
      });
  };

  // Fetch data whenever the grouping changes
  useEffect(() => {
    fetchDataGender(groupingGender, selectedUserTypeGender);
  }, [groupingGender, selectedUserTypeGender]);  

  const periodsGender = EchartDataGender.map(item => item.period);
  const totalCountsGender = EchartDataGender.map(item =>
    Number(item.Male || 0)
    + Number(item.Female || 0)
    + Number(item.Unspecified || 0)
  );

  // 2) Define an invisible “Total” series (no stack!)
  const totalSeriesGender = {
    name: 'Total',
    type: 'bar',
    // ← NO stack property means it draws from 0 up to the totalCountsGender value
    data: totalCountsGender,
    barGap: '-100%',            // overlap exactly on top of the stacked bars
    itemStyle: { color: 'transparent' },
    label: {
      show: true,
      position: 'top',       // outside left of the full bar
      distance: 5,            // padding from the edge
      formatter: '{c}',       // show the numeric total
      verticalAlign: 'middle',
      offset: [0, 0], 
      fontWeight: 'bold',
      color: '#333'
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1                        // render behind the colored bars
  };
  // ECharts configuration options for the gender chart
  const EchartGenderOption = {
    title: {
      text: 'User Signups by Gender Over Time',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      top: 'bottom',
      data: ['Male', 'Female', 'Unspecified']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: EchartDataGender.map(item => item.period),
      boundaryGap: groupingGender === 'lifetime' ? true : false,
      axisLabel: {
        rotate: groupingGender === 'daily' ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [
      {
        name: 'Male',
        type: 'bar',
        stack: 'total',
        data: EchartDataGender.map(item => item.Male || 0),
        itemStyle: { color: '#1E3A8A' }
      },
      {
        name: 'Female',
        type: 'bar',
        stack: 'total',
        data: EchartDataGender.map(item => item.Female || 0),
        itemStyle: { color: '#DB2777' }
      },
      {
        name: 'Unspecified',
        type: 'bar',
        stack: 'total',
        data: EchartDataGender.map(item => item.Unspecified || 0),
        itemStyle: { color: '#6B7280' }
      },
      totalSeriesGender
    ]
  };
  

  // Create a ref to access the ECharts instance
  
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
  const chartRef19 = useRef<ReactECharts | null> (null);
  const chartRef20 = useRef<ReactECharts | null> (null);
  const handleDownloadChart = (
      chartRef: React.RefObject<ReactECharts | null>,
      filename: string
    ) => {
      if (chartRef.current) {
        const echartsInstance = chartRef.current.getEchartsInstance();
        const imgData = echartsInstance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        });
        const link = document.createElement('a');
        link.href = imgData;
        link.download = filename;
        link.click();
      }
  };
  
  const PBLgroupings = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
  const statusOptionsPBL = ['all', 'submitted', 'approved', 'rejected'];

  interface PBLSubmissionData {
    period: string;
    count: number;
  }
  const [ groupingPBL, setGroupingPBL ] = useState<string>('monthly');
  const [ statusPBL, setStatusPBL ] = useState<string>('all');
  const [ dataPBL, setDataPBL ] = useState<PBLSubmissionData[]>([]);
  const [ loadingPBL, setLoadingPBL ] = useState<boolean>(true);

  useEffect(() => {
    setLoadingPBL(true);
    fetch(`${api_startpoint}/api/PBLsubmissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grouping: groupingPBL, status: statusPBL })
    })
      .then(res => res.json())
      .then(json => {
        setDataPBL(json.data || []);
        setLoadingPBL(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPBL(false);
      });
  }, [groupingPBL, statusPBL]);

  const chartOptionPBL = {
    title: { text: 'PBL Submissions Over Time', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dataPBL.map(p => formatPeriod(p.period, groupingPBL))
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: dataPBL.map(d => d.count),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }

  const [totalCountPBL, setTotalCountPBL] = useState<number>(0);
  // Fetch total count
  useEffect(() => {
    fetch(`${api_startpoint}/api/PBLsubmissions/total`)
      .then(res => res.json())
      .then(json => {
        setTotalCountPBL(json.total ?? 0);
      })
      .catch(err => console.error(err));
  }, []);

  // ################################ VISIONS ##############################
  interface StatRowVision { period: string; count: number; }
  interface LevelDataVision { level: string; count: number; subjects: { subject: string; count: number; }[]; }
  interface PeriodDataVision { period: string; levels: LevelDataVision[]; }
  interface Subject { id: number; title: string; }
  const [statsVision, setStatsVision]           = useState<PeriodDataVision[]>([]);
  const [groupingVision, setGroupingVision]     = useState('daily');
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [subjectId, setSubjectId]   = useState<number | null>(null);
  const [assignedBy, setAssignedBy] = useState<'all' | 'teacher' | 'self'>('all');
  const [visionLoading, setVisionLoading]= useState(false);
  // Fetch subjects
  useEffect(() => {
    fetch(`${api_startpoint}/api/subjects_list`, {method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 1 })})
      .then(res => res.json())
      .then(data => setSubjectList(data));
  }, []);

  // Fetch stats whenever filters change
  useEffect(() => {
    setVisionLoading(true);
    const params = new URLSearchParams({
      grouping: groupingVision,
      assigned_by: assignedBy !== 'all' ? assignedBy : undefined,
      subject_id: subjectId ? subjectId.toString() : undefined,
    } as any);
  
    fetch(`${api_startpoint}/api/vision-completion-stats?${params}`)
      .then(res => res.json())
      .then(json => {
        setStatsVision(json.data);
        setVisionLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch vision stats:", err);
        setVisionLoading(false);
      });
  }, [groupingVision, subjectId, assignedBy]);
  
  const periodsVision = statsVision.map(d => d.period);
  const levelsVision  = Array.from(new Set(statsVision.flatMap(d => d.levels.map(l => l.level))));
  // series per level
  const seriesVision: any[] = levelsVision.map(level => ({
    name: level,
    type: 'bar',
    stack: 'total',
    data: statsVision.map(d => {
      const lvl = d.levels.find(l => l.level===level);
      return lvl ? lvl.count : 0;
    })
  }));

  // compute totals per period
  const totalsVision = statsVision.map(d =>
    d.levels.reduce((sum, lvl) => sum + lvl.count, 0)
  );

  // invisible series for total labels
  seriesVision.push({
    name: 'Total',
    type: 'bar',
    stack: 'total',
    data: totalsVision,
    itemStyle: { opacity: 0 },
    emphasis: { itemStyle: { opacity: 0 } },
    label: {
      show: true,
      position: 'top',
      formatter: '{c}'
    }
  });
  // tooltip formatter
  const tooltipVision = {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any[]) => {
      const idx = params[0].dataIndex;
      const pd = statsVision[idx];
      let txt = `${pd.period}<br/>`;
      pd.levels.forEach(lvl => {
        txt += `<b>${lvl.level} :</b> ${lvl.count}<br/>`;
        lvl.subjects.forEach(sub => {
          txt += `&nbsp;&nbsp;* ${sub.subject} : ${sub.count}<br/>`;
        });
      });
      return txt;
    }
  };
  // Prepare chart option with invisible bar for labels
  const optionVision = {
    title: { text: 'Vision Submitted Over Time', left: 'center' },
    tooltip: tooltipVision,
    legend: { data: levelsVision, bottom: 0 },
    xAxis: {
      type: 'category',
      data: periodsVision,
      axisLabel: { rotate: groupingVision === 'daily' ? 45 : 0 }
    },
    yAxis: { type: 'value', name: 'Users Completed' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: seriesVision
  };

  // ----------------- vision score ------------------
  interface ScoreRow { period: string; total_score: number; }
  const [groupingVisionScore, setGroupingVisionScore] = useState<'daily'|'weekly'|'monthly'|'quarterly'|'yearly'|'lifetime'>('daily');
  const [VisionScore, setVisionScore] = useState<ScoreRow[]>([]);
  const [VisionScoreLoading, setVisionScoreLoading] = useState(false)
  useEffect(() => {
    setVisionScoreLoading(true)
    const params = new URLSearchParams({ grouping: groupingVisionScore });
    fetch(`${api_startpoint}/api/vision-score-stats?${params}`)
      .then(res => res.json())
      .then(json => {setVisionScore(json.data);
        setVisionScoreLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch vision scores stats:", err);
        setVisionScoreLoading(false);
      });
  }, [grouping]);

  const periodsVisionScore = VisionScore.map(d => d.period);
  const scoresVisionScore  = VisionScore.map(d => d.total_score);

  const optionVisionScore = {
    title: { text: 'Vision Score Over Time', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    xAxis: { type: 'category', data: periodsVisionScore, axisLabel: { rotate: groupingVisionScore === 'daily' ? 45 : 0 } },
    yAxis: { type: 'value', name: 'Score' },
    series: [
      { name: 'Score', type: 'line', data: scoresVisionScore, smooth: true, label: { show: true, position: 'top', formatter: '{c}' } }
    ]
  };

  //----------------------- vision count card ----------------------
  const [totalVisionScore, setTotalVisionScore] = useState<number>(0);
  const [totalVisionSubmitted, setTotalVisionSubmitted] = useState<number>(0);
  useEffect(() => {
    fetch(`${api_startpoint}/api/vision-answer-summary`)
      .then(res => res.json())
      .then(json => {setTotalVisionScore(json.total_score); setTotalVisionSubmitted(json.total_vision_answers)});

  },[])
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      {/* Fixed Sidebar */}
      {/* Updated Sidebar Component with strict inline styles */}
      <Sidebar />
      


      {/* Main Content */}
     <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        {/* Top Navigation */}
        {/* <header className="navbar navbar-expand-md navbar-light bg-white shadow-sm border-bottom">
          <div className="container-fluid">
            <div className="d-flex align-items-center w-full">
              <span className='font-bold text-xl text-black '>LifeAppDashBoard</span>
              <div className='w-5/6 h-10'></div>
              <div className="d-flex gap-3 align-items-center">
                <a href="#" className="btn btn-light btn-icon">
                  <IconSearch size={20} className="text-muted"/>
                </a>
                <a href="#" className="btn btn-light btn-icon position-relative">
                  <IconBell size={20} className="text-muted"/>
                  <span className="badge bg-danger position-absolute top-0 end-0">3</span>
                </a>
                <a href="#" className="btn btn-light btn-icon">
                  <IconSettings size={20} className="text-muted"/>
                </a>
              </div>
            </div>
          </div>
        </header> */}

        {/* Main Content Area */}
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            {/* Header */}
            <div className="page-header mb-4 mt-0">
              <div className="row align-items-center">
                <div className="col">
                  <h2 className="page-title mb-1 fw-bold text-dark">Dashboard Overview</h2>
                  <p className="text-muted mb-0">Platform statistics and analytics</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="row g-4 mb-4">
              {[
                { title: 'Total Users', value: totalUsers, icon: <IconUsers />, color: 'bg-purple' },
                { title: 'Active Users', value: activeUsers, icon: <IconUserCheck />, color: 'bg-teal' },
                { title: 'Inactive Users', value: 0, icon: <IconUserPlus />, color: 'bg-orange' },
                // { title: 'New Signups', value: newSignups, icon: <IconUserPlus />, color: 'bg-orange' },
                { title: 'Highest Users Online', value: 0, icon: <IconUserPlus />, color: 'bg-orange', suffix: '' },
                { title: 'Total Downloads', value: 45826, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Coins Earned', value: totalPointsEarned, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Coins Redeemed', value: totalPointsRedeemed, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total No. of Schools', value: schoolCount, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Teacher Assign Mission Completes', value: tmcAssignedByTeacher, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total No. of Quiz Completes', value: quizCompletes, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Sessions Created by Mentors', value: sessions.length, icon: <IconPercentage />, color: 'bg-blue',},
                { title: 'Total Participants Joined Mentor Sessions', value: sessionParticipantTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Mentors Participated for Mentor Connect Sessions', value: mentorsParticipatedSessionsTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Teachers', value: totalTeachers, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Students', value: totalStudents, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Mission Completes', value: tmcTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Jigyasa Completes', value: tjcTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Pragya Completes', value: tpcTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Quiz Completes', value: tqcTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Riddle Completes', value: trcTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total Puzzle Completes', value: tpzcTotal, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Total PBL Mission Completes', value: totalCountPBL, icon: <IconPercentage />, color: 'bg-sky-900',},
                { title: 'Mission Participation Rate', value: missionsParticipationRate, icon: <IconPercentage />, color: 'bg-sky-900', suffix: '%'},
                { title: 'Quiz Participation Rate', value: quizParticipationRate, icon: <IconPercentage />, color: 'bg-sky-900', suffix: '%'},
                { title: 'Jigyasa Participation Rate', value: jigyasaParticipationRate, icon: <IconPercentage />, color: 'bg-sky-900', suffix: '%'},
                { title: 'Pragya Participation Rate', value: pragyaParticipationRate, icon: <IconPercentage />, color: 'bg-sky-900', suffix: '%'},
                { title: 'Total Vision Completes', value: totalVisionSubmitted, icon: <IconPercentage />, color: 'bg-sky-900', },
                { title: 'Total Vision Score Earned', value: totalVisionScore, icon: <IconPercentage />, color: 'bg-sky-900', },

              ].map((metric, index) => (
                <div className="col-sm-6 col-lg-3" key={index}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        {/* <div className={`${metric.color} rounded-circle p-3 text-white`}>
                          {React.cloneElement(metric.icon, { size: 24 })}
                        </div> */}
                        <div>
                          <div className="subheader">{metric.title}</div>
                          <div className="h1 mb-3">
                            <NumberFlow
                              value={metric.value}
                              suffix={metric.suffix || ''}
                              className="fw-semi-bold text-dark"
                              transformTiming={{endDelay:6, duration:750, easing:'cubic-bezier(0.42, 0, 0.58, 1)'}}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            {mounted && (

                
              <div className="row g-4">
                  <div className='w-full h-45'>
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="grouping-select">Select Time Grouping: </label>
                      <select
                        id="grouping-select"
                        value={grouping}
                        onChange={(e) => setGrouping(e.target.value)}
                        className="mr-4"
                      >
                        {groupings.map(g => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      {/* User type filter */}
                      <label htmlFor="user-type-select" className="mr-2">User Type:</label>
                      <select
                        id="user-type-select"
                        value={selectedUserType}
                        onChange={(e) => setSelectedUserType(e.target.value)}
                      >
                        {userTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef1, 'User_signups_by_type_graph')}
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
                      
                      <div className="spinner-border text-purple" role="status" style={{ width: "8rem", height: "8rem" }}></div>
                      </div>
                    ) : error ? (
                      <div>Error: {error}</div>
                    ) : (
                      <ReactECharts ref={chartRef1} option={EchartOption} style={{ height: '400px', width: '100%' }} />
                    )}
                  </div>
                  <div className="w-full h-45">
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="grouping-gender-select">Select Time Grouping: </label>
                        <select
                          id="grouping-gender-select"
                          value={groupingGender}
                          onChange={(e) => setGroupingGender(e.target.value)}
                        >
                          {groupings.map(g => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        {/* User type filter */}
                        <label htmlFor="user-type-select" className="mr-2">User Type:</label>
                        <select
                          id="user-type-select"
                          value={selectedUserTypeGender}
                          onChange={(e) => setSelectedUserTypeGender(e.target.value)}
                        >
                          {userTypes.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef2,'user_signups_by_gender')}
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
                        <div style={{ textAlign: 'center' }}>
                          <div className="spinner-border text-purple" role="status" style={{ width: "8rem", height: "8rem" }}></div>

                        </div>
                      ) : error ? (
                        <div>Error: {errorGender}</div>
                      ) : (
                        <ReactECharts ref={chartRef2} option={EchartGenderOption} style={{ height: '400px', width: '100%' }} />
                      )}
                  </div>
                  
                {/* Histogram Level Subject Challenges completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">Mission Submissions</h3>
                        {/* Download button */}
                        <button
                          onClick={() => handleDownloadChart(chartRef3,'missions_completed_graph')}
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
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="mission-grouping-select" style={{ marginRight: '10px' }}>
                        Select Time Grouping:
                      </label>
                      <select
                        id="mission-grouping-select"
                        value={missionGrouping}
                        onChange={(e) => setMissionGrouping(e.target.value)}
                      >
                        {missionGroupings.map(g => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="mission-status-select" style={{ marginLeft: '20px', marginRight: '10px' }}>
                        Status:
                      </label>
                      <select
                        id="mission-status-select"
                        value={missionStatus}
                        onChange={(e) => setMissionStatus(e.target.value)}
                      >
                        {missionStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="mission-subject-select" style={{ marginLeft: '20px', marginRight: '10px' }}>
                        Subject:
                      </label>
                      <select
                        id="mission-subject-select"
                        value={selectedMissionSubject}
                        onChange={(e) => setSelectedMissionSubject(e.target.value)}
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map(subject => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                      
                    </div>

                    {/* Mission Completed Chart */}
                    {missionLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                      </div>
                    ) : (
                      <ReactECharts ref={chartRef3} option={optionMissionTransformed} style={{ height: '400px', width: '100%' }} />
                    )}
                  </div>
                </div>
                {/* Histogram Level Subject Quiz completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">Quiz Completed</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef4, 'quiz_completed_graph')}
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
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="quiz-grouping-select" style={{ marginRight: '10px' }}>
                          Select Time Grouping:
                        </label>
                        <select
                          id="quiz-grouping-select"
                          value={quizGrouping}
                          onChange={(e) => setQuizGrouping(e.target.value)}
                        >
                          {quizGroupings.map(g => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="quiz-subject-select" style={{ marginLeft: '20px', marginRight: '10px' }}>
                          Subject:
                        </label>
                        <select
                          id="quiz-subject-select"
                          value={selectedQuizSubject}
                          onChange={(e) => setSelectedQuizSubject(e.target.value)}
                        >
                          <option value="all">All Subjects</option>
                          {quizSubjects.map(subject => (
                            <option key={subject.id} value={subject.title}>
                              {subject.title}
                            </option>
                          ))}
                        </select>
                        
                      </div>

                      {quizLoading ? (
                        <div className="text-center">
                          <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                        </div>
                      ) : (
                        <ReactECharts ref={chartRef4} option={optionQuizTransformed} style={{ height: '400px', width: '100%' }} />
                      )}
                  </div>
                </div>
                
                {/* Histogram Level Subject Jigyasa completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">Jigyasa Submitted</h3>
                        {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef5,'jigyasa_completed_graph')}
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
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="jigyasa-grouping-select" style={{ marginRight: '10px' }}>
                        Select Time Grouping:
                      </label>
                      <select
                        id="jigyasa-grouping-select"
                        value={jigyasaGrouping}
                        onChange={(e) => setJigyasaGrouping(e.target.value)}
                      >
                        {jigyasaGroupings.map(g => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="jigyasa-status-select" style={{ marginLeft: '20px' }}>Status:</label>
                      <select
                        id="jigyasa-status-select"
                        value={jigyasaStatus}
                        onChange={(e) => setJigyasaStatus(e.target.value)}
                      >
                        {missionStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <label htmlFor="jigyasa-subject-select" style={{ marginLeft: '20px', marginRight: '10px' }}>
                        Subject:
                      </label>
                      <select
                        id="jigyasa-subject-select"
                        value={selectedJigyasaSubject}
                        onChange={(e) => setSelectedJigyasaSubject(e.target.value)}
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map(subject => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                      
                    </div>

                    {/* Mission Completed Chart */}
                    {jigyasaLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                      </div>
                    ) : (
                      <ReactECharts ref={chartRef5} option={optionJigyasaTransformed} style={{ height: '400px', width: '100%' }} />
                    )}
                  </div>
                </div>
                
                {/* Histogram Level Subject Pragya completed wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">Pragya Submitted</h3>
                        {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef6,'pragya_completed_graph')}
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
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="pragya-grouping-select" style={{ marginRight: '10px' }}>
                        Select Time Grouping:
                      </label>
                      <select
                        id="pragya-grouping-select"
                        value={pragyaGrouping}
                        onChange={(e) => setPragyaGrouping(e.target.value)}
                      >
                        {pragyaGroupings.map(g => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="pragya-status-select" style={{ marginLeft: '20px' }}>Status:</label>
                      <select
                        id="pragya-status-select"
                        value={pragyaStatus}
                        onChange={(e) => setPragyaStatus(e.target.value)}
                      >
                        {missionStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <label htmlFor="pragya-subject-select" style={{ marginLeft: '20px', marginRight: '10px' }}>
                        Subject:
                      </label>
                      <select
                        id="pragya-subject-select"
                        value={selectedPragyaSubject}
                        onChange={(e) => setSelectedPragyaSubject(e.target.value)}
                      >
                        <option value="all">All Subjects</option>
                        {quizSubjects.map(subject => (
                          <option key={subject.id} value={subject.title}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                      
                    </div>

                    {/* Mission Completed Chart */}
                    {pragyaLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                      </div>
                    ) : (
                      <ReactECharts ref={chartRef6} option={optionPragyaTransformed} style={{ height: '400px', width: '100%' }} />
                    )}
                  </div>
                </div>

                {/* Histogram Suject assigned by Vision Cmpleted Wise */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">Vision Submitted</h3>
                        {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef19,'vision_completed_graph')}
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
                    <div style={{ marginBottom: '20px' }}>
                      <select value={groupingVision} onChange={e => setGroupingVision(e.target.value)}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>

                      <select
                        value={subjectId ?? ''}
                        onChange={e => setSubjectId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">All Subjects</option>
                        {subjectList.map(s => (
                          <option key={s.id} value={s.id}>{JSON.parse(s.title).en}</option>
                        ))}
                      </select>

                      <select value={assignedBy} onChange={e => setAssignedBy(e.target.value as any)}>
                        <option value="all">All Assignments</option>
                        <option value="self">Self Assigned</option>
                        <option value="teacher">By Teacher</option>
                      </select>
                      {visionLoading ? (
                        <div className="text-center">
                          <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                        </div>
                      ) : (
                        <ReactECharts ref={chartRef19} option={optionVision} style={{ height: '400px', width: '100%' }} />
                      )}
                    </div> 
                  </div>
                </div>

                {/* Mission Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">Mission Coins Earned Over Time</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef12,'mission_coins_earned_graph')}
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
                      <div style={{ marginBottom: '20px' }}> 
                        <label htmlFor="points-grouping">Group by:</label>
                        <select
                          id="points-grouping"
                          value={pointsMissionGrouping}
                          onChange={e => setPointsMissionGrouping(e.target.value as any)}
                          className="border rounded p-1"
                        >
                          {['daily','weekly','monthly','quarterly','yearly','lifetime'].map(g => (
                            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                          ))}
                        </select>
                        {pointsMissionLoading
                        ? <div className="text-center">
                            <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                          </div>
                        : <ReactECharts ref={chartRef12} option={pointsMissionChartOption} style={{ height: 400 }} />}
                      </div>
                  </div>
                </div>
                {/* Quiz Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">Quiz Points Over Time</h3>
                      <button
                        onClick={() => handleDownloadChart(chartRef18, 'quiz_points_graph')}
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
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="quiz-points-grouping">Time Grouping: </label>
                      <select
                        id="quiz-points-grouping"
                        value={pointsQuizGrouping}
                        onChange={(e) => setPointsQuizGrouping(e.target.value as any)}
                      >
                        {groupings.map(g => (
                          <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    {pointsQuizLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                      </div>
                    ) : (
                      <ReactECharts ref={chartRef18} option={pointsQuizChartOption} style={{ height: '400px', width: '100%' }} />
                    )}
                  </div>
                </div>
                {/* Jigyasa Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">Jigyasa Coins Earned Over Time</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef13,'jigyasa_coins_earned_graph')}
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
                      <div style={{ marginBottom: '20px' }}> 
                        <label htmlFor="points-jigyasa-grouping">Group by:</label>
                        <select
                          id="points-jigyasa-grouping"
                          value={pointsJigyasaGrouping}
                          onChange={e => setPointsJigyasaGrouping(e.target.value as any)}
                          className="border rounded p-1"
                        >
                          {['daily','weekly','monthly','quarterly','yearly','lifetime'].map(g => (
                            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                          ))}
                        </select>
                        {pointsJigyasaLoading
                        ? <div className="text-center">
                            <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                          </div>
                        : <ReactECharts ref={chartRef13} option={pointsJigyasaChartOption} style={{ height: 400 }} />}
                      </div>
                  </div>
                </div>
                {/* Pragya Coins Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">Pragya Coins Earned Over Time</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef14,'pragya_coins_earned_graph')}
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
                      <div style={{ marginBottom: '20px' }}> 
                        <label htmlFor="points-pragya-grouping">Group by:</label>
                        <select
                          id="points-pragya-grouping"
                          value={pointsPragyaGrouping}
                          onChange={e => setPointsPragyaGrouping(e.target.value as any)}
                          className="border rounded p-1"
                        >
                          {['daily','weekly','monthly','quarterly','yearly','lifetime'].map(g => (
                            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                          ))}
                        </select>
                        {pointsPragyaLoading
                        ? <div className="text-center">
                            <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                          </div>
                        : <ReactECharts ref={chartRef14}option={pointsPragyaChartOption} style={{ height: 400 }} />}
                      </div>
                  </div>
                </div>
                {/* Vision Score Earned Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">Vision Score Earned Over Time</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef20,'vision_score_earned_graph')}
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
                      <div style={{ marginBottom: '20px' }}> 
                        <select value={groupingVisionScore} onChange={e => setGroupingVisionScore(e.target.value as any)}>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                        {VisionScoreLoading
                        ? <div className="text-center">
                            <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                          </div>
                        : <ReactECharts ref={chartRef20}option={optionVisionScore} style={{ height: 400 }} />}
                      </div>
                  </div>
                </div>
                
                {/* Coupons Redeemed Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">Coupon Redeems Over Time</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef15,'coupons_redeemed_graph')}
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
                      <div style={{ marginBottom: '20px' }}> 
                        <label htmlFor="points-couponRedeems-grouping">Group by:</label>
                        <select
                          id="points-couponRedeems-grouping"
                          value={couponRedeemsGrouping}
                          onChange={e => setCouponRedeemsGrouping(e.target.value as any)}
                          className="border rounded p-1"
                        >
                          {['daily','weekly','monthly','quarterly','yearly','lifetime'].map(g => (
                            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                          ))}
                        </select>
                        {couponRedeemsLoading
                        ? <div className="text-center">
                            <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                          </div>
                        : <ReactECharts ref={chartRef15} option={couponRedeemsSeriesOptions} style={{ height: 400 }} />}
                      </div>
                  </div>
                </div>

                {/* PBL submissions Over Time */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                          <h3 className="card-title mb-0 fw-semibold">PBL Submissions Over Time</h3>
                          {/* Download button */}
                          <button
                            onClick={() => handleDownloadChart(chartRef17,'PBL_submissions_graph')}
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
                      <div style={{ marginBottom: '20px' }}> 
                        <label className='ml-2'>
                          Grouping:
                          <select value={groupingPBL} onChange={e => setGroupingPBL(e.target.value)}>
                            {PBLgroupings.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </label>
                        <label className="ml-2">
                          Status:
                          <select value={statusPBL} onChange={e => setStatusPBL(e.target.value)}>
                            {statusOptionsPBL.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>
                        {loadingPBL
                        ? <div className="text-center">
                            <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                          </div>
                        : <ReactECharts ref={chartRef17} option={chartOptionPBL} style={{ height: 400 }} />}
                      </div>
                  </div>
                </div>

                {/* Student Grade Distribution table */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">Students by Grade Over Time Distribution</h3>
                        {/* Download button */}
                        <button
                          onClick={() => handleDownloadChart(chartRef7,'students_by_grade_graph')}
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
                      <label htmlFor="grouping-grade-select">Select Time Grouping: </label>
                      <select
                        id="grouping-grade-select"
                        value={groupingGrade}
                        onChange={(e) => setGroupingGrade(e.target.value)}
                      >
                        {groupings.map(g => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                        ))}
                      </select>
                      
                    </div>
                    {loadingGrade ? (
                      <div style={{ textAlign: 'center'}}>
                        <div className="spinner-border text-purple" role="status" style={{ width: "8rem", height: "8rem" }}></div>
                      </div>
                    ) : errorGrade ? (
                      <div>Error: {errorGrade}</div>
                    ) : (
                      <ReactECharts ref={chartRef7} option={EchartGradeOption} style={{ height: '400px', width: '100%' }} />
                    )}
                    </div>
                </div>
                
                
                {/* Teachers by Grade Distribution table */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h5 className="card-title mb-0 fw-semibold">Teachers by Grade over Time Distribution</h5>
                      {/* Download button */}
                      <button
                        onClick={()=>handleDownloadChart(chartRef8, 'teacher_by_grade_graph')}
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
                      <label htmlFor="grouping-teacher-grade-select">Select Time Grouping: </label>
                      <select
                        id="grouping-teacher-grade-select"
                        value={groupingTeacherGrade}
                        onChange={(e) => setGroupingTeacherGrade(e.target.value)}
                      >
                        {groupings.map(g => (
                          <option key={g} value={g}>
                            {g.charAt(0).toUpperCase() + g.slice(1)}
                          </option>
                          ))}
                        </select>
                        
                      </div>
                      {loadingTeacherGrade ? (
                        <div style={{ textAlign: 'center' }}>
                          <div className="spinner-border text-purple" role="status" style={{ width: "8rem", height: "8rem" }}></div>

                        </div>
                      ) : errorTeacherGrade ? (
                        <div>Error: {errorTeacherGrade}</div>
                      ) : (
                        <ReactECharts ref={chartRef8} option={EchartTeacherGradeOption} style={{ height: '400px', width: '100%' }} />
                      )}
                    </div>
                </div>
                
                
                {/* Student Demographics Distribution graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h5 className="card-title mb-0 fw-semibold">Student Demographics Distribution</h5>
                      {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef9, 'Student_demograph_graph')}
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
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="student-grouping-select" style={{ marginRight: '10px' }}>
                          Select Time Grouping:
                        </label>
                        <select
                          id="student-grouping-select"
                          value={studentGrouping}
                          onChange={(e) => setStudentGrouping(e.target.value)}
                        >
                          {studentGroupings.map(g => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        {/* single-state select */}
                        <label htmlFor="student-state-select" style={{ margin: '0 10px' }}>
                          State:
                        </label>
                        <select
                          id = "student-state-select"
                          value={selectedState}
                          onChange={handleStateChange}
                          style={{ minWidth: 200 }}
                        >
                          <option value="">All States</option>
                          {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        
                      </div>
                      
                      {studentLoading ? (
                        <div className="text-center">
                          <div className="spinner-border text-purple" role="status" 
                              style={{ width: '8rem', height: '8rem' }}></div>
                        </div>
                      ) : (
                        <ReactECharts ref={chartRef9} option={chartOptionStudent} style={{ height: '400px', width: '100%' }} />
                      )}
                    
                    </div>
                  </div>
                </div>

                {/* Teacher Demographics Distribution graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h5 className="card-title mb-0 fw-semibold">Teacher Demographics Distribution</h5>
                      {/* Download button */}
                      <button
                          onClick={() => handleDownloadChart(chartRef10, 'Teacher_demograph_graph')}
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
                      <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="teacher-grouping-select" style={{ marginRight: '10px' }}>
                          Select Time Grouping:
                        </label>
                        <select
                          id="teacher-grouping-select"
                          value={teacherGrouping}
                          onChange={(e) => setTeacherGrouping(e.target.value)}
                        >
                          {teacherGroupings.map(g => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                        {/* <-- new state select */}
                        <label htmlFor="teacher-state-select" style={{ margin: '0 10px' }}>
                          State:
                        </label>
                        <select
                          id="teacher-state-select"
                          value={selectedTeacherState}
                          onChange={e => setSelectedTeacherState(e.target.value)}
                        >
                          <option value="">All States</option>
                          {allStates.map(s =>
                            <option key={s} value={s}>{s}</option>
                          )}
                        </select>
                        
                      </div>
                      
                      {teacherLoading ? (
                        <div className="text-center">
                          <div className="spinner-border text-purple" role="status" 
                              style={{ width: '8rem', height: '8rem' }}></div>
                        </div>
                      ) : (
                        <ReactECharts ref={chartRef10} option={chartOptionTeacher} style={{ height: '400px', width: '100%' }} />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* School Demographics Distribution graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">Schools Demographics Distribution</h3>
                      <button
                        onClick={() => handleDownloadChart(chartRef16, 'schools_demographic_graph')}
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
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="school-grouping-select">Grouping:</label>
                      <select
                        id="school-grouping-select"
                        value={schoolGrouping}
                        onChange={(e) => setSchoolGrouping(e.target.value)}
                        className="mr-2"
                      >
                        {groupings.map(g => (
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
                        {allStates.map(state => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {schoolLoading ? (
                      <div className="text-center">
                        <div className="spinner-border text-purple" role="status" style={{ width: '8rem', height: '8rem' }}></div>
                      </div>
                    ) : (
                      <ReactECharts ref={chartRef16} option={chartOptionSchool} style={{ height: '400px', width: '100%' }} />
                    )}
                  </div>
                </div>

                {/* Student Count By Level graph */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">Student Count By Level</h3>
                      {/* Download button */}
                      <button
                        onClick={() => handleDownloadChart(chartRef11, 'Student_count_by_level_graph')}
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
                       {/* <div className="mb-4">
                                <label className="mr-2 font-semibold">Select Level:</label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="border p-1 rounded"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                    <option value="4">Level 4</option>
                                </select>
                                </div> */}
                        <div className="mb-4">
                                <label className="mr-2 font-semibold">Select Subject:</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => {
                                      setSelectedSubject(e.target.value);
                                      // setSelectedLevel("all")
                                    }}
                                    className="border p-1 rounded"
                                >
                                    <option value="science">Science</option>
                                    <option value="maths">Maths</option>
                                </select>
                        </div>
                              <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="grouping-level-select">Select Time Grouping: </label>
                                <select
                                  id="grouping-level-select"
                                  value={groupingLevel}
                                  onChange={e => setGroupingLevel(e.target.value)}
                                >
                                  {groupings.map(g => (
                                    <option key={g} value={g}>
                                      {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <label className="mr-2 font-semibold">Select Level:</label>
                                <select
                                  value={selectedLevel}
                                  onChange={e => setSelectedLevel(e.target.value as FilterLevel)}
                                  className="border p-1 rounded"
                                >
                                  <option value="all">All</option>
                                  <option value="level1">Level 1 (Grade 1–5)</option>
                                  <option value="level2">Level 2 (Grade 6+)</option>
                                  <option value="level3">Level 3 (Grade 7+)</option>
                                  <option value="level4">Level 4 (Grade 8+)</option>
                                </select>
                                

                              </div>
                                {/* Loading, error, or chart */}
                                {loadingLevel ? (
                                  <div style={{ textAlign: 'center' }}>
                                    <div className="spinner-border text-purple" role="status" style={{ width: "8rem", height: "8rem" }}></div>
                                  </div>
                                ) : errorLevel ? (
                                  <div>Error: {errorLevel}</div>
                                ) : (
                                  <ReactECharts ref={chartRef11} option={EchartLevelOption} style={{ height: '400px', width: '100%' }} />
                                )}

                    </div>
                  </div>
                </div>

                {/* Teacher Assignments */}
                <div className="col-12 col-xl-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">Teacher Assignments</h3>
                    </div>
                    <div className="card-body pt-0">
                      <div style={{ height: '300px' }}>
                        <ChartJSBar 
                          data={teacherAssignData} 
                          options={{ ...teacherAssignOptions, plugins: { legend: { display: false }}}}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Redemptions */}
                <div className="col-12 col-xl-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">Coupon Redemptions</h3>
                    </div>
                    <div className="card-body pt-0">
                      <div style={{ height: '300px' }}>
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
                      <ReactECharts option={userTypeChartOptions} style={{ height: '400px', width: '100%' }} />
                    </div>
                  </div>
                  
                </div>
                
                {/* Gender (dummy) Types
                <div className="col-12 col-xl-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-1">
                      <h3 className="card-title mb-0 fw-semibold">Gender Distribution</h3>
                    </div>
                    <div className="card-body pt-1">
                      <ReactECharts 
                        option={genderPieOption} 
                        style={{ height: '400px', width: '100%' }} 
                      />
                    </div>
                  </div>
                </div> */}
                {/* School Distribution */}
                <div className="col-12 col-xl-8">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-transparent py-3">
                      <h3 className="card-title mb-0 fw-semibold">School Distribution (Top 5 States)</h3>
                    </div>
                    <div className="card-body pt-0">
                      <div style={{ height: '300px' }}>
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
                <a href="#" className="text-muted text-decoration-none">Privacy</a>
                <a href="#" className="text-muted text-decoration-none">Terms</a>
                <a href="#" className="text-muted text-decoration-none">Help</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
