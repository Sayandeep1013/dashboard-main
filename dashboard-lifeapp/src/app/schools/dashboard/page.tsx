'use client'
import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import NumberFlow from '@number-flow/react';

//const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'
// const api_startpoint = 'http://152.42.239.141:5000'

const inter = Inter({ subsets: ['latin'] });
import dynamic from 'next/dynamic'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });
import ReactECharts from 'echarts-for-react';

// import type Highcharts from 'highcharts';
// import Highcharts from 'highcharts/highmaps';
// const Highcharts = dynamic(() => import('highcharts/highmaps'), { ssr: false });

interface DemographData {
    state: string;
    count: number;
}

interface DemographChartdata {
    code: string;
    value: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface FilterState {
  startDate: string;
  endDate: string;
  District: string;
  BlockName: string;
  ClusterName: string;
  SchoolCode: string;
}

interface TableData {
  SrNo: number;
  name: string;
  State: string;
  City: string;
  District: string;
  AppVisible: string;
  LifeLab: string;
  Code: string;
  Status: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 w-[200px]">
    <div className="flex items-center justify-between mb-2">
      <h6 className="subheader">{title}</h6>
      {icon && <div className="text-blue-500 bg-blue-50 p-2 rounded-full">{icon}</div>}
    </div>
    <div className="mt-1">
      <NumberFlow
        value={typeof value === 'string' ? parseInt(value) || 0 : value}
        className="text-2xl font-bold text-gray-800"
        transformTiming={{ endDelay: 6, duration: 750, easing: 'cubic-bezier(0.42, 0, 0.58, 1)' }}
      />
    </div>
  </div>
);

export default function SchoolsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    District: '',
    BlockName: '',
    ClusterName: '',
    SchoolCode: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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

  const stats = [
    { title: 'TOTAL SCHOOLS', value: schoolCount },
    { title: 'TOTAL USERS', value: '-' },
    { title: 'ACTIVE SCHOOLS', value: '-' },
    { title: 'INACTIVE SCHOOLS', value: '-' }
  ];

  // const tableData: TableData[] = [
  //   {
  //     SrNo: 132470,
  //     name: 'Live Teacher',
  //     State: 'Delhi',
  //     City: 'Delhi',
  //     District: 'Central Delhi',
  //     AppVisible: 'Yes',
  //     LifeLab: 'Active',
  //     Code: 'SCH001',
  //     Status: 'Active'
  //   },
  //   // Add more sample rows for better visualization
  //   {
  //     SrNo: 132471,
  //     name: 'Modern School',
  //     State: 'Delhi',
  //     City: 'Delhi',
  //     District: 'South Delhi',
  //     AppVisible: 'Yes',
  //     LifeLab: 'Active',
  //     Code: 'SCH002',
  //     Status: 'Active'
  //   },
  //   {
  //     SrNo: 132472,
  //     name: 'Delhi Public School',
  //     State: 'Delhi',
  //     City: 'Delhi',
  //     District: 'East Delhi',
  //     AppVisible: 'No',
  //     LifeLab: 'Inactive',
  //     Code: 'SCH003',
  //     Status: 'Inactive'
  //   }
  // ];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    setFilters({
      startDate: '',
      endDate: '',
      District: '',
      BlockName: '',
      ClusterName: '',
      SchoolCode: '',
    });
  };

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };


  const [viewMode, setViewMode] = useState<'map' | 'graph'>('map')
  // const [barData, setBarData] = useState<any[]>([])
  const [chartOptions, setChartOptions] = useState<any>(null);
  // const [barChartOptions, setBarChartOptions] = useState<any>(null);
  const [geoData, setGeoData] = useState<DemographData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true)
  const [HighchartsLib, setHighchartsLib] = useState<any>(null);
  useEffect(() => {
      // Load Highcharts on client-side only
      // const HighchartsLoaded = require('highcharts/highmaps');
      
      const fetchDataDemographics = async () => {
          const HighchartsLoaded = await import("highcharts/highmaps");
          setHighchartsLib(HighchartsLoaded);
          try {
              // Fetch India TopoJSON map
              setLoading(true)
              const topoResponse = await fetch(
                  // "https://code.highcharts.com/mapdata/countries/in/custom/in-all-andaman-and-nicobar.topo.json"
                  "https://code.highcharts.com/mapdata/countries/in/custom/in-all-disputed.topo.json"
              );
              
              const topology = await topoResponse.json();

              // Fetch state-wise student count from API
              const apiResponse = await fetch(`${api_startpoint}/api/count_school_state_dashboard`,{
                  method: 'POST'
              });

              const apiData: { count: number; state: string }[] = await apiResponse.json();

              setGeoData(apiData); // Store API data for debugging or future use
              // setBarData(apiData)
              // Map API state names to Highcharts' region keys
              const stateMappings: Record<string, string> = {
                  "Tamil Nadu": "tamil nadu",     // Tamil Nadu gets "in-tn"
                  "Telangana": "telangana",       // Telangana gets "in-tg" (instead of "in-tn")
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
                  // "Pondicherry": "in-py",
                  "Puducherry": "puducherry",
                  "Rajasthan": "rajasthan",
                  "Goa": "goa",
                  "Kerala": "kerala",
                  "Uttarakhand": "uttarakhand",
                  "Himachal Pradesh": "himachal pradesh",
                  // "Ladakh": "in-la",
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

              // Transform API data into Highcharts format
              const chartData: DemographChartdata[] = apiData
              .map((item) => ({
                  code: stateMappings[item.state] || '', // Use empty string if no mapping found
                  value: Math.max(item.count, 1) // Ensure a minimum value of 1
              }))
              .filter((item) => item.code);
              
              // const mapData = apiData.map(item => {
              //   return { 
              //     'hc-key': stateMappings[item.state] || item.state.toLowerCase(), 
              //     value: item.count 
              //   }
              // })
              // console.log(chartData)
              // Set up the chart options
              const options = {
                  chart: {
                      map: topology,
                  },
                  title: {
                      text: "Schools Distribution Across India",
                  },
                  subtitle: {
                      text: "Data sourced from lifeapp.schools",
                  },
                  mapNavigation: {
                      enabled: true,
                      buttonOptions: {
                          verticalAlign: "bottom",
                      },
                  },
                  colorAxis: {
                      min: 1,
                      minColor: '#E6F2FF',
                      maxColor: '#0077BE',
                      type: 'logarithmic' // This helps differentiate states with vastly different counts
                  },
                  series: [
                      {
                          data: chartData.map((item) => [item.code, item.value]),
                          name: "School Count",
                          states: {
                              hover: {
                                  color: "#BADA55",
                              },
                          },
                          dataLabels: {
                              enabled: true,
                              format: '{point.name}',
                              style: {
                                  fontSize: '8px'
                              }
                          },
                      },
                  ],
              };
              
              // Sort data for bar chart
            // const sortedBarData = [...apiData].sort((a, b) => b.count - a.count);
            // const defaultColors = HighchartsCore.default.getOptions().colors || [];
            // // Set up the bar chart options using Highcharts
            // const barOptions = {
            //     chart: {
            //         type: 'bar',
            //         height: 500
            //     },
            //     title: {
            //         text: 'Schools Distribution by State'
            //     },
            //     subtitle: {
            //         text: 'Data sourced from lifeapp.schools'
            //     },
            //     xAxis: {
            //         categories: sortedBarData.map(item => item.state),
            //         title: {
            //             text: 'State'
            //         }
            //     },
            //     yAxis: {
            //         title: {
            //             text: 'Number of Schools'
            //         },
            //         min: 0
            //     },
            //     legend: {
            //         enabled: false
            //     },
            //     tooltip: {
            //       formatter: function(this: Highcharts.TooltipFormatterContextObject): string {
            //           return `<b>${this.x}</b>: ${this.y} schools`;
            //       }
            //   },
            //     plotOptions: {
            //         bar: {
            //             dataLabels: {
            //                 enabled: true
            //             },
            //             colorByPoint: true,
            //             colors: sortedBarData.map((_, i) => 
            //               defaultColors[i % defaultColors.length] )
            //         }
            //     },
            //     series: [{
            //         name: 'Schools',
            //         data: sortedBarData.map(item => item.count)
            //     }],
            //     credits: {
            //         enabled: false
            //     }
            // };
              setChartOptions(options);
              // setBarChartOptions(barOptions);
              setLoading(false)
          } catch (error) {
              console.error("Error fetching data:", error);
              setErrorMessage("An error occurred while loading the chart.");
              setLoading(false)
          }
      };

      fetchDataDemographics();
  }, []);


  // Grouping state (daily, weekly, monthly, quarterly, yearly, lifetime)
  const [grouping, setGrouping] = useState<string>('monthly');
  // Store the raw API data. Each row has period, state, and count.
  const [schoolData, setSchoolData] = useState<{ period: string; state: string; count: string }[]>([]);
  const [loadingBar, setLoadingBar] = useState<boolean>(true);
  const [errorMessageBar, setErrorMessageBar] = useState<string | null>(null);
  // Chart options for ECharts
  const [chartOptionsBar, setChartOptionsBar] = useState<any>(null);

  // Fetch raw school data from API endpoint whenever grouping changes.
  useEffect(() => {
    const fetchSchoolData = async () => {
      setLoadingBar(true);
      try {
        const response = await fetch(`${api_startpoint}/api/demograph-schools`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grouping })
        });
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw school data:', data);
        setSchoolData(data);
      } catch (error: any) {
        console.error("Error fetching school data:", error);
        setErrorMessageBar(error.message);
      } finally {
        setLoadingBar(false);
      }
    };

    fetchSchoolData();
  }, [grouping]);

  // Process the raw data into chart data:
  // 1. Collect a sorted list of unique periods.
  // 2. Collect a sorted list of unique states.
  // 3. For each unique state, build a series where each item corresponds to the count
  //    for that state in that period (or 0 if no record is found).
  useEffect(() => {
    if (schoolData.length === 0) return;
    // Use a Set for the periods and states.
    const periodSet = new Set<string>();
    const stateSet = new Set<string>();

    schoolData.forEach((item) => {
      periodSet.add(item.period);
      stateSet.add(item.state);
    });

    const periods = Array.from(periodSet).sort();
    const uniqueStates = Array.from(stateSet).sort();

    // Build series: one series per state.
    const series = uniqueStates.map(state => {
      const dataForState = periods.map(period => {
        // Find the matching record for the given period and state.
        const record = schoolData.find(item => item.period === period && item.state === state);
        return record ? Number(record.count) : 0;
      });
      return {
        name: state,
        type: 'bar',
        stack: 'total', // use stack if you want a stacked bar chart; remove if you want grouped bars
        data: dataForState,
        // Use a fixed palette (or let ECharts pick automatically)
        itemStyle: { color: '#'+((1<<24)*Math.random()|0).toString(16) }
      };
    });

    // Build the ECharts options.
    const options = {
      title: {
        text: 'Schools Distribution by State Over Time',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        type: 'scroll', // Allows legend to scroll if there are many states.
        orient: 'horizontal',
        bottom: 0,
        data: uniqueStates
      },
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          rotate: grouping === 'daily' ? 45 : 0,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Schools'
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100 }
      ],
      series: series
    };

    setChartOptionsBar(options);
  }, [schoolData, grouping]);


  
  return (
    <div className={`page bg-gray-50 ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className="page-body">
          <div className="container-xl p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Schools Dashboard</h1>
              <p className="text-gray-500 mt-1">Monitor and manage school data</p>
            </div>

            {/* Main Dashboard Content - Two Column Layout */}
            <div className="flex gap-4">
              {/* Left Column - Stats Cards */}
              <div>
                <div className="flex flex-row flex-wrap gap-4">
                  {stats.map((stat, index) => (
                    <StatCard key={index} title={stat.title} value={stat.value} />
                  ))}
                </div>
              </div>
              
              {/* Right Column - Map Chart */}
              <div className="bg-white rounded-lg shadow-sm p-4 w-full h-[700px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Geographic Distribution</h2>
                <div className="mb-1">
                  <button
                    className={`px-4 py-2 mr-2 border rounded ${viewMode === 'map' ? 'bg-sky-900 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setViewMode('map')}
                  >
                    Map View
                  </button>
                  <button
                    className={`px-4 py-2 border rounded ${viewMode === 'graph' ? 'bg-sky-900 text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setViewMode('graph')}
                  >
                    Graph View
                  </button>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
                    {errorMessage}
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center items-center h-80 w-full bg-gray-50 rounded-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : viewMode === 'map' && chartOptions && HighchartsLib ? (
                  <div className="h-[600px] w-full">
                    <HighchartsReact
                      highcharts={HighchartsLib}
                      options={chartOptions}
                      constructorType={'mapChart'}
                    />
                  </div>
                ) : (
                  // Graph view section
                  <div style={{ height: '500px', width: '100%' }}>
                    <div className="mb-4 flex items-center gap-2">
                      <label className="font-semibold">Select Period:</label>
                      <select 
                        className="form-select w-auto inline-block"
                        value={grouping}
                        onChange={(e) => setGrouping(e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </div>
                    {loadingBar ? (
                      <div className="flex justify-center items-center h-80">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
                    ) : errorMessageBar ? (
                      <div className="text-center text-red-500">{errorMessageBar}</div>
                    ) : (
                      <div style={{ width: '100%', height: '500px' }}>
                        <ReactECharts 
                          option={chartOptionsBar}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>


            
            </div>
            {/* Search & Filter Section */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Search & Filter</h2>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add School Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.District}
                    onChange={(e) => handleFilterChange('District', e.target.value)}
                  >
                    <option value="">All Districts</option>
                    <option value="Central Delhi">Central Delhi</option>
                    <option value="South Delhi">South Delhi</option>
                    <option value="East Delhi">East Delhi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Name</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.BlockName}
                    onChange={(e) => handleFilterChange('BlockName', e.target.value)}
                  >
                    <option value="">All Blocks</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.SchoolCode}
                    onChange={(e) => handleFilterChange('SchoolCode', e.target.value)}
                  >
                    <option value="">All Schools</option>
                    <option value="SCH001">SCH001</option>
                    <option value="SCH002">SCH002</option>
                    <option value="SCH003">SCH003</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cluster Name</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.ClusterName}
                    onChange={(e) => handleFilterChange('ClusterName', e.target.value)}
                  >
                    <option value="">All Clusters</option>
                    <option value="Cluster 1">Cluster 1</option>
                    <option value="Cluster 2">Cluster 2</option>
                    <option value="Cluster 3">Cluster 3</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div> */}

            {/* Table Section
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Schools Data</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search schools..."
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="p-2 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Visible</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LifeLab</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((row) => (
                      <tr key={row.SrNo} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.SrNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.State}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.City}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.District}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.AppVisible}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.LifeLab}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.Code}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            row.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="text-red-600 hover:text-red-800 bg-red-50 p-1 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {tableData.length === 0 && (
                  <div className="text-center py-10 px-6">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{tableData.length}</span> of <span className="font-medium">{tableData.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50">Previous</button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Modal for adding school data */}
      {/* {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add School Data</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  {file ? file.name : 'Drag and drop your file here, or click to select file'}
                </p>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">Accepts Excel or CSV files only</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Upload and Process
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}