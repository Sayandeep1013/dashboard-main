"use client";
import "@tabler/core/dist/css/tabler.min.css";
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import NumberFlow from "@number-flow/react";
import React from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
// import Sidebar from '../../sidebar';
import { Sidebar } from "@/components/ui/sidebar";
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconUserFilled,
  IconUserExclamation,
  IconUser,
  IconUserScan,
  IconMapPin,
  IconSchool,
  IconTrophy,
  IconDeviceAnalytics,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import ReactECharts from "echarts-for-react";
import {
  BarChart3,
  ChevronDown,
  Download,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import error from "next/error";
const groupings = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "lifetime",
];
interface SearchableDropdownProps {
  options: string[];
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  isLoading?: boolean;
  maxDisplayItems?: number;
}

import dynamic from "next/dynamic";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

// Add CSS styles for the new features
const tableStyles = `
  <style>
    .table-container {
      position: relative;
    }
    
    .scroll-hint-left, .scroll-hint-right {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(111, 66, 193, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 10%;
      cursor: pointer;
      z-index: 5;
      transition: opacity 0.3s;
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .scroll-hint-left {
      left: 15px;
    }
    
    .scroll-hint-right {
      right: 15px;
    }
    
    .scroll-hint-hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    /* Sticky table header */
    .table-sticky-header thead th {
      position: sticky;
      top: 0;
      background: #f8f9fa;
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    /* Smooth scrolling */
    .smooth-scroll {
      scroll-behavior: smooth;
    }
  </style>
`;

// import Highcharts from 'highcharts/highmaps';
// const Highcharts = dynamic(() => import('highcharts/highmaps'), { ssr: false });

interface DemographData {
  state: string;
  count: string;
}

interface DemographChartdata {
  code: string;
  value: number;
}

interface StudentsByGrade {
  grade: number | null;
  count: number;
}

interface challengesCompletedData {
  count: number;
  la_mission_id: number | null;
  title: string;
  description: string;
}

interface MissionStatusData {
  period: string;
  "Mission Requested"?: number;
  "Mission Rejected"?: number;
  "Mission Approved"?: number;
  [key: string]: string | number | undefined; // Allow dynamic keys
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

function SearchableDropdown({
  options,
  placeholder,
  value,
  onChange,
  isLoading = false,
  maxDisplayItems = 100,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [displayedItems, setDisplayedItems] = useState(maxDisplayItems);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Implement debounce for search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset displayed items when search changes
      setDisplayedItems(maxDisplayItems);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, maxDisplayItems]);

  // Get filtered options based on search term
  const filteredOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return options;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();

    return options.filter(
      (option) =>
        typeof option === "string" && option.toLowerCase().includes(searchLower)
    );
  }, [options, debouncedSearchTerm]);

  // Handle scroll event to implement infinite scrolling
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const scrollPosition = scrollTop + clientHeight;

    // If user has scrolled to near bottom, load more items
    if (
      scrollHeight - scrollPosition < 50 &&
      displayedItems < filteredOptions.length
    ) {
      setDisplayedItems((prev) =>
        Math.min(prev + maxDisplayItems, filteredOptions.length)
      );
    }
  }, [displayedItems, filteredOptions.length, maxDisplayItems]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    const newValues = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(newValues);
    setIsOpen(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setDisplayedItems(maxDisplayItems);
  };

  // The options to display - limited by displayedItems count
  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, displayedItems);
  }, [filteredOptions, displayedItems]);

  // Calculate if there are more items to load
  const hasMoreItems = filteredOptions.length > displayedItems;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {isLoading
            ? "Loading..."
            : value.length
            ? `${value.length} selected`
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:outline-none"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-auto" ref={scrollContainerRef}>
            {isLoading ? (
              <div className="px-3 py-2 text-gray-500">Loading options...</div>
            ) : (
              <>
                {visibleOptions.length > 0 ? (
                  visibleOptions.map((option, index) => (
                    <div
                      key={index}
                      className="cursor-pointer px-3 py-2 text-gray-900 hover:bg-purple-50"
                      onClick={() => handleSelect(option)}
                    >
                      <input
                        type="checkbox"
                        checked={value.includes(option)}
                        readOnly
                        className="mr-2 h-4 w-4 text-sky-900 rounded border-gray-300 focus:ring-purple-500"
                      />
                      {option}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No results found
                  </div>
                )}

                {/* Show loading more indicator */}
                {hasMoreItems && (
                  <div className="flex items-center justify-center px-3 py-2 text-gray-500 border-t border-gray-100 bg-gray-50">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500"></div>
                    <span>
                      Loading more... ({visibleOptions.length} of{" "}
                      {filteredOptions.length})
                    </span>
                  </div>
                )}

                {/* Show total count if filtered */}
                {debouncedSearchTerm && filteredOptions.length > 0 && (
                  <div className="px-3 py-2 text-xs text-center text-gray-500 bg-gray-50 border-t border-gray-100">
                    Found {filteredOptions.length} matching results
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function StudentDashboard() {
  const [selectedVisionAcceptance, setSelectedVisionAcceptance] = useState("");
  const [selectedVisionRequestedNo, setSelectedVisionRequestedNo] =
    useState("");
  const [selectedVisionAcceptedNo, setSelectedVisionAcceptedNo] = useState("");
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  useEffect(() => {
    async function fetchStudentCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/total-student-count`);
        const data = await res.json();
        if (data && data.length > 0) {
          setTotalStudents(data[0].count);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }

    fetchStudentCount();
  }, []);

  const [states, setStates] = useState<string[]>([]);
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  useEffect(() => {
    async function fetchStates() {
      // Check cache first
      const cachedStates = sessionStorage.getItem("stateList");
      if (cachedStates) {
        setStates(JSON.parse(cachedStates));
        return;
      }

      setIsStatesLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/state_list`);
        const data: { state: string }[] = await res.json();

        if (Array.isArray(data)) {
          const stateList = data
            .map((item) => (item.state ? item.state.trim() : ""))
            .filter((state) => state !== ""); // Filter out empty states

          setStates(stateList);
          // Cache the results
          sessionStorage.setItem("stateList", JSON.stringify(stateList));
        } else {
          console.error("Unexpected API response format:", data);
          setStates([]);
        }
      } catch (error) {
        console.error("Error fetching state list:", error);
        setStates([]);
      } finally {
        setIsStatesLoading(false);
      }
    }

    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Adjust the URL and pagination parameters as needed for your campaigns API
        const response = await fetch(
          `${api_startpoint}/api/campaigns?page=1&per_page=1000`
        );
        const data = await response.json();
        if (data && data.data) {
          setCampaigns(data.data);
        } else {
          console.error("Unexpected API response format for campaigns:", data);
          setCampaigns([]);
        }
      } catch (error) {
        console.error("❌ Error fetching Campaign list:", error);
        setCampaigns([]);
      }
    };

    fetchCampaigns();
  }, []);

  // For city fetching - optimized but independent of state
  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const fetchCities = async (state: string) => {
    if (!state) return;

    console.log("Fetching cities for state:", state);

    setIsCitiesLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/city_list_teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: state }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Raw API Response:", data); // ✅ Check if cities are being received

      if (Array.isArray(data) && data.length > 0) {
        const cityList: string[] = data
          .map((city) =>
            typeof city === "string"
              ? city.trim()
              : city.city
              ? city.city.trim()
              : ""
          )
          .filter((city) => city !== "");

        setCities(cityList);
        sessionStorage.setItem(`cityList_${state}`, JSON.stringify(cityList));

        console.log(`✅ Loaded ${cityList.length} cities for ${state}`);
      } else {
        console.warn("⚠ No cities found for state:", state);
        setCities([]); // Clear cities if none found
      }
    } catch (error) {
      console.error("❌ Error fetching city list:", error);
      setCities([]);
    } finally {
      setIsCitiesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedState) {
      console.log("🟢 State changed to:", selectedState);
      setCities([]); // Reset cities when state changes
      setSelectedCity(""); // Reset selected city
      fetchCities(selectedState);
    }
  }, [selectedState]);

  // above your existing fetchCities...
  const [addCities, setAddCities] = useState<string[]>([]);
  const [isAddCitiesLoading, setIsAddCitiesLoading] = useState(false);
  const fetchAddCities = async (state: string) => {
    if (!state) return;

    console.log("Fetching cities for state:", state);

    setIsAddCitiesLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/city_list_teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: state }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Raw API Response:", data); // ✅ Check if cities are being received

      if (Array.isArray(data) && data.length > 0) {
        const cityList: string[] = data
          .map((city) =>
            typeof city === "string"
              ? city.trim()
              : city.city
              ? city.city.trim()
              : ""
          )
          .filter((city) => city !== "");

        setAddCities(cityList);
        sessionStorage.setItem(`cityList_${state}`, JSON.stringify(cityList));

        console.log(`✅ Loaded ${cityList.length} cities for ${state}`);
      } else {
        console.warn("⚠ No cities found for state:", state);
        setAddCities([]); // Clear cities if none found
      }
    } catch (error) {
      console.error("❌ Error fetching city list:", error);
      setAddCities([]);
    } finally {
      setIsAddCitiesLoading(false);
    }
  };

  const [editCities, setEditCities] = useState<string[]>([]);
  const [isEditCitiesLoading, setIsEditCitiesLoading] = useState(false);
  const fetchEditCities = async (state: string) => {
    if (!state) return;

    console.log("Fetching cities for state:", state);

    setIsEditCitiesLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/city_list_teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: state }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      console.log("Raw API Response:", data); // ✅ Check if cities are being received

      if (Array.isArray(data) && data.length > 0) {
        const cityList: string[] = data
          .map((city) =>
            typeof city === "string"
              ? city.trim()
              : city.city
              ? city.city.trim()
              : ""
          )
          .filter((city) => city !== "");

        setEditCities(cityList);
        sessionStorage.setItem(`cityList_${state}`, JSON.stringify(cityList));

        console.log(`✅ Loaded ${cityList.length} cities for ${state}`);
      } else {
        console.warn("⚠ No cities found for state:", state);
        setEditCities([]); // Clear cities if none found
      }
    } catch (error) {
      console.error("❌ Error fetching city list:", error);
      setEditCities([]);
    } finally {
      setIsEditCitiesLoading(false);
    }
  };

  // For city fetching - optimized but independent of state
  const [schools, setSchools] = useState<string[]>([]);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => {
    // Key improvement: UseEffect to trigger data fetch when state or city changes
    // Also fetch initially when component loads
    console.log(
      "🔄 Triggering school fetch based on state/city change or initial load"
    );

    // Function to fetch schools based on current filters
    async function fetchFilteredSchools() {
      setIsSchoolsLoading(true);
      try {
        // Prepare filters for the API call
        const filters: { state?: string; city?: string } = {};
        if (selectedState) {
          filters.state = selectedState;
        }
        if (selectedCity) {
          filters.city = selectedCity;
        }

        // Decide which endpoint to call
        let apiUrl = `${api_startpoint}/api/school_list`; // Default: all schools
        let fetchOptions: RequestInit = { method: "GET" };

        // If any filter is active, use the new filtered endpoint
        if (selectedState || selectedCity) {
          apiUrl = `${api_startpoint}/api/schools_by_filters`;
          fetchOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(filters),
          };
        }

        console.log(`Fetching schools from: ${apiUrl}`, filters); // Debug log

        const res = await fetch(apiUrl, fetchOptions);
        const data: { name: string }[] = await res.json();

        if (Array.isArray(data)) {
          // Process data: extract names and filter out empties
          // Using the simpler direct processing as the chunked version was for the large unfiltered list
          const schoolList = data
            .map((item) => (item.name ? item.name.trim() : ""))
            .filter((name) => name !== "");

          setSchools(schoolList);
          console.log(`✅ Loaded ${schoolList.length} schools`);
          // Note: Removed caching for simplicity with filtered results.
          // You could implement a more complex cache key system if needed later.
        } else {
          console.error("Unexpected API response format for schools:", data);
          setSchools([]);
        }
      } catch (error) {
        console.error("❌ Error fetching School list:", error);
        setSchools([]);
      } finally {
        setIsSchoolsLoading(false);
      }
    }

    // Call the fetch function
    fetchFilteredSchools();

    // Dependency array: re-run this effect when selectedState or selectedCity changes
  }, [selectedState, selectedCity]);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedMissionType, setSelectedMissionType] = useState("");
  const [selectedMissionAcceptance, setSelectedMissionAcceptance] =
    useState("");
  const [selectedMissionRequestedNo, setSelectedMissionRequestedNo] =
    useState("");
  const [selectedMissionAcceptedNo, setSelectedMissionAcceptedNo] =
    useState("");
  const [selectedEarnCoins, setSelectedEarnCoins] = useState("");
  const [selectedFromDate, setSelectedFromDate] = useState(""); // New state for From Date
  const [selectedToDate, setSelectedToDate] = useState(""); // New state for To Date
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedMobileNo, setSelectedMobileNo] = useState("");
  const [inputCode, setInputCode] = useState("");
  // Update existing state declaration
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);
  const rowsPerPage = 15;
  const [isTableLoading, setIsTableLoading] = useState(false);
  // Handler for search button
  const handleSearch = async () => {
    const filters = {
      state: selectedState,
      school: selectedSchools.length > 0 ? selectedSchools : undefined,
      city: selectedCity,
      grade: selectedGrade,
      mission_acceptance: selectedMissionAcceptance,
      mission_requested_no: selectedMissionRequestedNo,
      mission_accepted_no: selectedMissionAcceptedNo,
      vision_acceptance: selectedVisionAcceptance, // Add this
      vision_requested_no: selectedVisionRequestedNo, // Add this
      vision_accepted_no: selectedVisionAcceptedNo, // Add this
      earn_coins: selectedEarnCoins,
      from_date: selectedFromDate,
      to_date: selectedToDate,
      mobile_no: selectedMobileNo,
      schoolCode:
        selectedSchoolCode.length > 0 ? selectedSchoolCode : undefined,
      campaign_id: selectedCampaignId || undefined,
    };
    setIsTableLoading(true); // Set loading to true when search starts

    try {
      const res = await fetch(
        `${api_startpoint}/api/student_dashboard_search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        }
      );
      const data = await res.json();
      setTableData(data);
      setCurrentPage(0); // Reset to first page on new search
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsTableLoading(false); // Set loading to false when search completes (success or error)
    }
  };

  // Refs for table scrolling functionality
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(true);

  // Update scroll hints based on current scroll position
  const updateScrollHints = () => {
    const container = tableContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftHint(scrollLeft > 10);
      setShowRightHint(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Handle scroll events to show/hide scroll hints
  const handleTableScroll = () => {
    updateScrollHints();
  };

  // Scroll table horizontally with larger increments and smooth behavior
  const scrollTableHorizontally = (direction: "left" | "right") => {
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of viewport width

      container.scrollTo({
        left:
          direction === "left"
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });

      // Update hints after scroll
      setTimeout(updateScrollHints, 300);
    }
  };

  // Update scroll hints when data changes
  useEffect(() => {
    setTimeout(() => {
      updateScrollHints();
    }, 100);
  }, [tableData]);

  // Update scroll hints on window resize
  useEffect(() => {
    window.addEventListener("resize", updateScrollHints);
    return () => {
      window.removeEventListener("resize", updateScrollHints);
    };
  }, []);
  // Determine paginated data
  const paginatedData = tableData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleClear = () => {
    setSelectedState("");
    setSelectedCity("");
    setSelectedSchools([]);
    setSelectedGrade("");
    // setSelectedMissionType("");
    setSelectedMissionAcceptance("");
    setSelectedMissionAcceptedNo("");
    setSelectedMissionRequestedNo("");
    setSelectedEarnCoins("");
    setSelectedFromDate(""); // Clear the From Date
    setSelectedToDate(""); // Clear the To Date
    setSelectedVisionAcceptance("");
    setSelectedVisionRequestedNo("");
    setSelectedVisionAcceptedNo("");
    setSelectedMobileNo("");
    setInputCode("");
    setSelectedSchoolCode([]);
    setSelectedCampaignId("");
    setTableData([]);
  };

  // Add this function in your schoolDashboard component before the return statement

  const exportToCSV = () => {
    // Return early if there's no data to export
    if (tableData.length === 0) {
      alert("No data to export. Please perform a search first.");
      return;
    }

    try {
      // Get all the headers (keys) from the first data row
      const headers = Object.keys(tableData[0]);

      // Create CSV header row
      let csvContent = headers.join(",") + "\n";

      // Add data rows
      tableData.forEach((row) => {
        const values = headers.map((header) => {
          const cellValue =
            row[header] === null || row[header] === undefined
              ? ""
              : row[header];

          // Handle values that contain commas, quotes, or newlines
          const escapedValue = String(cellValue).replace(/"/g, '""');

          // Wrap in quotes to handle special characters
          return `"${escapedValue}"`;
        });

        csvContent += values.join(",") + "\n";
      });

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger the download
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `student_data_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("An error occurred while exporting data. Please try again.");
    }
  };

  // ````````````````` ADD MODAL ``````````````````````````````````````````
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    guardian_name: "",
    email: "",
    username: "",
    mobile_no: "",
    dob: "",
    grade: "",
    city: "",
    state: "",
    school_id: "",
    school_code: "",
    school_name: "",
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Handler for form field changes
  const handleNewChange = (field: string, value: string) => {
    setNewStudent((s) => ({ ...s, [field]: value }));
  };

  // Submit “Add Student”
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch(`${api_startpoint}/api/add_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setIsAddOpen(false);
      handleSearch(); // refresh table
      // clear form
      setNewStudent({
        name: "",
        guardian_name: "",
        email: "",
        username: "",
        mobile_no: "",
        dob: "",
        grade: "",
        city: "",
        state: "",
        school_id: "",
        school_code: "",
        school_name: "",
      });
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (newStudent.state) {
      // clear out any previously selected city in the modal:
      setNewStudent((s) => ({ ...s, city: "" }));
      fetchAddCities(newStudent.state);
    }
  }, [newStudent.state]);

  // inside your modal component:
  // Inside Add Student Modal section
  const [schoolOptions, setSchoolOptions] = useState<
    { id: string; name: string; code: string }[]
  >([]); // Already exists
  const [isSchoolsAddLoading, setIsSchoolsAddLoading] = useState(false); // Already exists

  // Modify this useEffect for Add Student Modal
  useEffect(() => {
    // fetch schools based on selected state and city in the Add modal
    async function loadSchoolsForAdd() {
      setIsSchoolsAddLoading(true);
      try {
        // Determine query parameters based on current selections in the Add modal
        let url = `${api_startpoint}/api/schools_by_state_city`;
        const params = new URLSearchParams();
        if (newStudent.state) {
          params.append("state", newStudent.state);
        }
        if (newStudent.city) {
          // Only add city filter if city is selected
          params.append("city", newStudent.city);
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        // Expect data = [{ id, name, code }, …]
        setSchoolOptions(data);
      } catch (err) {
        console.error("Error fetching schools for Add modal:", err);
        setSchoolOptions([]); // Clear options on error or show error state
      } finally {
        setIsSchoolsAddLoading(false);
      }
    }

    // Load schools when modal opens AND whenever state or city changes in the Add modal
    if (isAddOpen) {
      loadSchoolsForAdd();
    }
  }, [isAddOpen, newStudent.state, newStudent.city]); // Add newStudent.state and newStudent.city as dependencies

  useEffect(() => {
    if (newStudent.state || newStudent.city) {
      // Clear school if state or city changes
      setNewStudent((s) => ({
        ...s,
        city: newStudent.state ? s.city : "", // Clear city only if state is cleared
        school_name: "", // Clear selected school name
        school_id: "",
        school_code: "",
      }));
    }
  }, [newStudent.state, newStudent.city]); // Depend on both state and city changes

  // ````````````````` EDIT MODAL ``````````````````````````````````````````
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Open the modal, prefill form
  const openEdit = (row: any) => {
    setEditingStudent({
      id: row.id,
      name: row.name,
      guardian_name: row.guardian_name,
      email: row.email,
      username: row.username,
      mobile_no: row.mobile_no,
      dob: row.dob?.split(" ")[0] || "",
      grade: String(row.grade || ""),
      state: row.state || "",
      city: row.city || "",
      school_id: String(row.school_id || ""),
      school_name: row.school_name || "",
      school_code: row.school_code || "",
    });
    setIsEditOpen(true);
  };

  // Handle field changes
  const handleEditChange = (field: string, value: string) => {
    setEditingStudent((s: any) => ({ ...s, [field]: value }));
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(true);
    setEditError(null);
    try {
      const { id, ...payload } = editingStudent;
      const res = await fetch(`${api_startpoint}/api/edit_student/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to edit");
      setIsEditOpen(false);
      handleSearch(); // refresh table
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditing(false);
    }
  };

  useEffect(() => {
    // Only fire when we actually have an editingStudent with a state
    if (editingStudent?.state) {
      // reset any previously-selected city
      setEditingStudent((s: any) => ({ ...s, city: "" }));
      // fetch the new list
      fetchEditCities(editingStudent.state);
    }
  }, [editingStudent?.state]);

  // Inside Edit Student Modal section
  const [schoolEditOptions, setSchoolEditOptions] = useState<
    { id: string; name: string; code: string }[]
  >([]); // Already exists
  const [isSchoolsEditLoading, setIsSchoolsEditLoading] = useState(false); // Already exists

  // Modify this useEffect for Edit Student Modal
  useEffect(() => {
    // fetch schools based on selected state and city in the Edit modal
    async function loadSchoolsForEdit() {
      setIsSchoolsEditLoading(true);
      try {
        // Determine query parameters based on current selections in the Edit modal
        let url = `${api_startpoint}/api/schools_by_state_city`;
        const params = new URLSearchParams();
        if (editingStudent?.state) {
          // Use optional chaining
          params.append("state", editingStudent.state);
        }
        if (editingStudent?.city) {
          // Use optional chaining, only add city filter if city is selected
          params.append("city", editingStudent.city);
        }
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        // Expect data = [{ id, name, code }, …]
        setSchoolEditOptions(data);
      } catch (err) {
        console.error("Error fetching schools for Edit modal:", err);
        setSchoolEditOptions([]); // Clear options on error or show error state
      } finally {
        setIsSchoolsEditLoading(false);
      }
    }

    // Load schools when modal opens AND whenever state or city changes in the Edit modal
    if (isEditOpen) {
      loadSchoolsForEdit();
    }
  }, [isEditOpen, editingStudent?.state, editingStudent?.city]); // Add editingStudent?.state and editingStudent?.city as dependencies

  // Ensure school fields are cleared when state or city changes in Edit modal
  // You might already have a useEffect for state changing city, modify it or add:
  useEffect(() => {
    if (editingStudent?.state || editingStudent?.city) {
      // Clear school if state or city changes
      setEditingStudent((s: any) => ({
        ...s,
        city: editingStudent?.state ? s.city : "", // Clear city only if state is cleared
        school_name: "", // Clear selected school name
        school_id: "",
        school_code: "",
      }));
      // Note: Changing editingStudent.city here might trigger the above useEffect.
      // The fetch will happen due to the dependency array [isEditOpen, editingStudent?.state, editingStudent?.city]
      // Reset the selected school name in the dropdown
      // This might be handled by the onChange logic resetting school_name, but clearing it here ensures consistency.
    }
  }, [editingStudent?.state, editingStudent?.city]); // Depend on both state and city changes

  // ````````````````` DELETE MODAL ``````````````````````````````````````````
  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Open the delete modal
  const openDelete = (row: any) => {
    setDeletingStudent({ id: row.id, name: row.name });
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  // Perform the delete
  const handleDelete = async () => {
    if (!deletingStudent) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${api_startpoint}/api/delete_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingStudent.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setIsDeleteOpen(false);
      handleSearch(); // refresh table
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const [chartOptions, setChartOptions] = useState<any>(null);
  const [geoData, setGeoData] = useState<DemographData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [HighchartsLib, setHighchartsLib] = useState<any>(null);
  useEffect(() => {
    // Load Highcharts on client-side only
    // const HighchartsLoaded = require('highcharts/highmaps');

    const fetchData = async () => {
      const HighchartsLoaded = await import("highcharts/highmaps");

      setHighchartsLib(HighchartsLoaded);
      try {
        // Fetch India TopoJSON map
        const topoResponse = await fetch(
          // "https://code.highcharts.com/mapdata/countries/in/custom/in-all-andaman-and-nicobar.topo.json"
          "https://code.highcharts.com/mapdata/countries/in/custom/in-all-disputed.topo.json"
        );

        const topology = await topoResponse.json();

        // Fetch state-wise student count from API
        const apiResponse = await fetch(
          `${api_startpoint}/api/demograph-students-dashboard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );
        const apiData: { count: string; state: string }[] =
          await apiResponse.json();

        setGeoData(apiData); // Store API data for debugging or future use

        // Map API state names to Highcharts' region keys
        const stateMappings: Record<string, string> = {
          "Tamil Nadu": "tamil nadu", // Tamil Nadu gets "in-tn"
          Telangana: "telangana", // Telangana gets "in-tg" (instead of "in-tn")
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
          // "Pondicherry": "in-py",
          Puducherry: "puducherry",
          Rajasthan: "rajasthan",
          Goa: "goa",
          Kerala: "kerala",
          Uttarakhand: "uttarakhand",
          "Himachal Pradesh": "himachal pradesh",
          // "Ladakh": "in-la",
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

        // Transform API data into Highcharts format
        const chartData: DemographChartdata[] = apiData
          .map((item) => ({
            code: stateMappings[item.state] || "", // Use empty string if no mapping found
            value: Math.max(parseInt(item.count, 10), 1), // Ensure a minimum value of 1
          }))
          .filter((item) => item.code);

        // Set up the chart options
        const options = {
          chart: {
            map: topology,
            height: 700,
            width: 700,
          },
          title: {
            text: "Student Distribution Across India",
          },
          subtitle: {
            text: "Data sourced from lifeapp.users",
          },
          mapNavigation: {
            enabled: true,
            buttonOptions: {
              verticalAlign: "bottom",
            },
          },
          colorAxis: {
            min: 1,
            minColor: "#E6F2FF",
            maxColor: "#0077BE",
            type: "logarithmic", // This helps differentiate states with vastly different counts
          },
          series: [
            {
              data: chartData.map((item) => [item.code, item.value]),
              name: "Student Count",
              states: {
                hover: {
                  color: "#BADA55",
                },
              },
              dataLabels: {
                enabled: true,
                format: "{point.name} {point.value}", // Name and value with line break
                style: {
                  fontSize: "10px",
                  color: "#2d2d2d", // Dark gray for better readability
                  textOutline: "1px white", // White outline for contrast
                  fontWeight: "bold",
                  textAlign: "center",
                  whiteSpace: "normal", // Allow text wrappin
                },
                backgroundColor: "rgba(255,255,255,0.7)",
                padding: 4,
                borderRadius: 4,
                verticalAlign: "middle",
                shape: "rect",
              },
            },
          ],
        };

        setChartOptions(options);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("An error occurred while loading the chart.");
      }
    };

    fetchData();
  }, []);

  const [studentsByGrade, setStudentsByGrade] = useState<StudentsByGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchStudentsByGrade = async () => {
      try {
        const response = await fetch(
          `${api_startpoint}/api/students-by-grade`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch students by grade");
        }
        const data: StudentsByGrade[] = await response.json();

        // Sort the data by grade, handling null last
        const sortedData = data.sort((a, b) => {
          if (a.grade === null) return 1;
          if (b.grade === null) return -1;
          return (a.grade as number) - (b.grade as number);
        });

        setStudentsByGrade(sortedData);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setIsLoading(false);
      }
    };

    fetchStudentsByGrade();
  }, []);

  // State for modals
  const [showDemographicsModal, setShowDemographicsModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);

  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [challengesData, setChallengesData] = useState<
    challengesCompletedData[]
  >([]);
  const [isChallengesLoading, setIsChallengesLoading] = useState(false);
  useEffect(() => {
    const fetchChallengesData = async () => {
      try {
        const response = await fetch(
          `${api_startpoint}/api/challenges-completed-per-mission`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch challenges-completed-per-mission ");
        }
        const data: challengesCompletedData[] = await response.json();
        setChallengesData(data);
        setIsChallengesLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setIsLoading(false);
      }
    };
    fetchChallengesData();
  }, []);

  const [totalPointsEarned, setTotalPointsEarned] = useState<number>(0);
  useEffect(() => {
    async function fetchTotalPointsEarned() {
      try {
        const res = await fetch(`${api_startpoint}/api/total-points-earned-in-students-dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Access the total_points directly from the response object
        if (data && typeof data.total_points === "string") {
          setTotalPointsEarned(parseInt(data.total_points));
        }
      } catch (error) {
        console.error("Error fetching total points:", error);
      }
    }

    fetchTotalPointsEarned();
  }, []);

  const [totalPointsRedeemed, setTotalPointsRedeemed] = useState<number>(0);
  useEffect(() => {
    async function fetchTotalPointsRedeemed() {
      try {
        const res = await fetch(`${api_startpoint}/api/total-points-redeemed-in-students-dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data && data.length > 0) {
          setTotalPointsRedeemed(data[0].total_coins_redeemed);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchTotalPointsRedeemed();
  }, []);

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSessions(data);
        // console.log(sessions)
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const [sessionParticipantTotal, setSessionParticipantTotal] =
    useState<number>(0);
  useEffect(() => {
    async function fetchSessionParticipantTotal() {
      try {
        const res = await fetch(
          `${api_startpoint}/api/session_participants_total`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setSessionParticipantTotal(data[0].count);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchSessionParticipantTotal();
  }, []);

  const [
    mentorsParticipatedSessionsTotal,
    setMentorsParticipatedSessionsTotal,
  ] = useState<number>(0);
  useEffect(() => {
    async function fetchMentorsParticipatedSessionsTotal() {
      try {
        const res = await fetch(
          `${api_startpoint}/api/mentor_participated_in_sessions_total`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setMentorsParticipatedSessionsTotal(data[0].count);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchMentorsParticipatedSessionsTotal();
  }, []);

  const [tmcAssignedByTeacher, setTmcAssignedByTeacher] = useState<number>(0);
  useEffect(() => {
    async function fetchTmcAssignedByTeacher() {
      try {
        const res = await fetch(
          `${api_startpoint}/api/total-missions-completed-assigned-by-teacher-in-students-dashboard`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setTmcAssignedByTeacher(data[0].count);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchTmcAssignedByTeacher();
  }, []);

  const [currentChallengesPage, setCurrentChallengesPage] = useState(0);
  const rowsPerPageChallenges = 10; // Number of rows per page

  const [missionStatusData, setMissionStatusData] = useState<
    MissionStatusData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [missionStatusError, setMissionStatusError] = useState<string | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [grouping, setGrouping] = useState<string>("monthly"); // Default grouping
  const [missionLevel, setMissionLevel] = useState<"all" | "level1" | "level2" | "level3" | "level4">("all");

  // Key improvement: UseEffect to trigger data fetch when grouping changes
  useEffect(() => {
    if (modalOpen) {
      fetchMissionStatusData(grouping, missionLevel);
    }
  }, [grouping, missionLevel, modalOpen]);

  const fetchMissionStatusData = (selectedGrouping: string, selectedLevel: string) => {
    setLoading(true);
    setMissionStatusError(null);

    fetch(`${api_startpoint}/api/mission-status-graph`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grouping: selectedGrouping,
        level: selectedLevel === "all" ? undefined : selectedLevel,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const groupedData: Record<string, MissionStatusData> = {};

        data.data.forEach((entry: any) => {
          const period = entry.period;
          if (!groupedData[period]) {
            groupedData[period] = {
              period: period,
              "Mission Requested": 0,
              "Mission Rejected": 0,
              "Mission Approved": 0,
            };
          }

          switch (entry.mission_status) {
            case "Mission Requested":
              groupedData[period]["Mission Requested"] = entry.count;
              break;
            case "Mission Rejected":
              groupedData[period]["Mission Rejected"] = entry.count;
              break;
            case "Mission Approved":
              groupedData[period]["Mission Approved"] = entry.count;
              break;
          }
        });

        const sortedData = Object.values(groupedData).sort((a, b) => {
          // Handle 'Lifetime' or non-split periods safely
          if (a.period === "Lifetime") return -1;
          if (b.period === "Lifetime") return 1;
          const partsA = a.period.split("-").map(Number);
          const partsB = b.period.split("-").map(Number);
          for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
            if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i];
          }
          return partsA.length - partsB.length;
        });

        setMissionStatusData(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        setMissionStatusError(err.message);
        setLoading(false);
      });
  };


  const MissionStatusChartOptions = {
    title: {
      text: "Mission Status Over Time",
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
      data: missionStatusData.map((item) => item.period),
      boundaryGap: grouping === "lifetime" ? true : false,
      axisLabel: {
        // Rotate labels for better readability
        rotate: grouping === "daily" ? 45 : 0,
        interval: 0, // Show all labels
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
    series: [
      {
        name: "Mission Requested",
        type: "bar",
        stack: "total",
        data: missionStatusData.map((item) => item["Mission Requested"] || 0),
        itemStyle: { color: "#FFD700" }, // Yellow
      },
      {
        name: "Mission Rejected",
        type: "bar",
        stack: "total",
        data: missionStatusData.map((item) => item["Mission Rejected"] || 0),
        itemStyle: { color: "#FF4500" }, // Red
      },
      {
        name: "Mission Approved",
        type: "bar",
        stack: "total",
        data: missionStatusData.map((item) => item["Mission Approved"] || 0),
        itemStyle: { color: "#32CD32" }, // Green
      },
    ],
  };

  const handleModalOpen = () => {
    fetchMissionStatusData(grouping, missionLevel);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  // State for the quiz data, loading indicator, modal visibility and pagination
  const [quizData, setQuizData] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState<boolean>(false);
  const [openQuizTopicLevelModal, setOpenQuizTopicLevelModal] =
    useState<boolean>(false);
  const [currentQuizPage, setCurrentQuizPage] = useState<number>(0);
  const rowsPerPageQuiz = 10;

  // Fetch quiz data (with count, subject_title, level_title) from API
  useEffect(() => {
    async function fetchQuizData() {
      setIsQuizLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/histogram_topic_level_subject_quizgames`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const raw = await res.json();
        setQuizData(raw);
      } catch (err) {
        console.error("Error fetching quiz data:", err);
      }
      setIsQuizLoading(false);
    }
    fetchQuizData();
  }, [api_startpoint]);

  // Function to calculate the total count of quizzes
  const totalQuiz = quizData.reduce((sum, row) => sum + Number(row.count), 0);

  // Paginate the quiz data
  const paginatedQuizData = quizData.slice(
    currentQuizPage * rowsPerPageQuiz,
    (currentQuizPage + 1) * rowsPerPageQuiz
  );
  const [modalOpenLevel, setModalOpenLevel] = useState(false);
  const [MissionCoinModal, setMissionCoinModal] = useState(false);
  const [JigyasaCoinModal, setJigyasaCoinModal] = useState(false);
  const [PragyaCoinModal, setPragyaCoinModal] = useState(false);
  const [CouponRedeemsModal, setCouponRedeemsModal] = useState(false);
  // const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>("science");
  const [EchartDataLevel, setEchartDataLevel] = useState<LevelCountEntry[]>([]);
  const [groupingLevel, setGroupingLevel] = useState("monthly");
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [errorLevel, setErrorLevel] = useState<string | null>(null);
  // 1) Define the exact keys:
  type Level = "level1" | "level2" | "level3" | "level4";
  type FilterLevel = Level | "all";

  // 2) Keep a single selectedLevel in state
  const [selectedLevel, setSelectedLevel] = useState<FilterLevel>("all");

  // 3) Derive the array you’ll actually send & chart from it
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
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        // spread-fix from before
        const transformed = data.map((item: any) => ({
          ...item,
          period: item.period || "Unknown",
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
    level1: "#1E3A8A",
    level2: "#3B82F6",
    level3: "#60A5FA",
    level4: "#93C5FD",
  };
  interface LevelCountEntry {
    period: string | null;
    level1_count: number;
    level2_count: number;
    level3_count: number;
    level4_count: number;
  }

  const seriesData = levelsToFetch.map((level) => ({
    name:
      level === "level1"
        ? "Level 1: Grade 1–5"
        : level === "level2"
        ? "Level 2: Grade 6+"
        : level === "level3"
        ? "Level 3: Grade 7+"
        : "Level 4: Grade 8+",
    type: "bar" as const,
    stack: "total" as const,
    data: EchartDataLevel.map((item) => item[`${level}_count`] || 0),
    itemStyle: { color: levelColors[level] },
  }));

  // 2) Generate the legend labels from your series names:
  const legendData = seriesData.map((s) => s.name);

  // 1) After you’ve built `seriesData`, compute the total for each period:
  const totalCountsLevel = EchartDataLevel.map((item) =>
    [item.level1_count, item.level2_count, item.level3_count, item.level4_count]
      .map((v) => Number(v))
      .reduce((sum, val) => sum + val, 0)
  );

  const totalSeriesCountLevel = {
    name: "Total",
    type: "bar",
    // ← NO `stack` here, so it draws from 0 up to the total
    data: totalCountsLevel,
    barGap: "-100%", // overlap exactly on top of the stacks
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1, // render behind your colored stacks
  };

  // ECharts option configuration.
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
      orient: "horizontal", // lay items out in a row
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
      axisLabel: { rotate: groupingLevel === "daily" ? 45 : 0 },
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
  const formatPeriod = (period: string, grouping: string) => {
    if (grouping === "daily") {
      try {
        const date = new Date(period);
        return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
        // or for DD-MM-YYYY:
        // return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      } catch {
        return period;
      }
    }
    return period;
  };
  const [pointsMissionGrouping, setPointsMissionGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [pointsMissionData, setPointsMissionData] = useState<
    { period: string; points: number }[]
  >([]);
  const [pointsMissionLoading, setPointsMissionLoading] =
    useState<boolean>(true);

  // 2. Fetch mission‐points over time whenever grouping changes
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsMissionLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/mission-points-over-time`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grouping: pointsMissionGrouping }),
          }
        );
        const json = await res.json();
        // assume json.data is [{ period, points }, …]
        setPointsMissionData(json.data);
      } catch (err) {
        console.error("Error loading points data", err);
      } finally {
        setPointsMissionLoading(false);
      }
    };
    fetchPoints();
  }, [pointsMissionGrouping]);

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
    // no stack, so it draws from 0→value just like a normal bar
    data: pointsMissionData.map((d) => d.points),
    barGap: "-100%", // sit exactly under the colored bar
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      // verticalAlign: 'middle',
      // offset: [-25, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1, // draw behind your real bars
  };
  // 3. Build your ECharts option
  const pointsMissionChartOption = {
    title: { text: "Mission Points Over Time", left: "center" },
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
        rotate: pointsMissionGrouping === "daily" ? 45 : 0,
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

  const [pointsJigyasaGrouping, setPointsJigyasaGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [pointsJigyasaData, setPointsJigyasaData] = useState<
    { period: string; points: number }[]
  >([]);
  const [pointsJigyasaLoading, setPointsJigyasaLoading] =
    useState<boolean>(true);

  // 2. Fetch mission‐points over time whenever grouping changes
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsJigyasaLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/jigyasa-points-over-time`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grouping: pointsJigyasaGrouping }),
          }
        );
        const json = await res.json();
        // assume json.data is [{ period, points }, …]
        setPointsJigyasaData(json.data);
      } catch (err) {
        console.error("Error loading points data", err);
      } finally {
        setPointsJigyasaLoading(false);
      }
    };
    fetchPoints();
  }, [pointsJigyasaGrouping]);

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
    // no stack, so it draws from 0→value just like a normal bar
    data: pointsJigyasaData.map((d) => d.points),
    barGap: "-100%", // sit exactly under the colored bar
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      // verticalAlign: 'middle',
      // offset: [-25, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1, // draw behind your real bars
  };
  // 3. Build your ECharts option
  const pointsJigyasaChartOption = {
    title: { text: "Jigyasa Points Over Time", left: "center" },
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
        rotate: pointsJigyasaGrouping === "daily" ? 45 : 0,
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

  // 2. Fetch mission‐points over time whenever grouping changes
  useEffect(() => {
    const fetchPoints = async () => {
      setPointsPragyaLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/pragya-points-over-time`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grouping: pointsPragyaGrouping }),
          }
        );
        const json = await res.json();
        // assume json.data is [{ period, points }, …]
        setPointsPragyaData(json.data);
      } catch (err) {
        console.error("Error loading points data", err);
      } finally {
        setPointsPragyaLoading(false);
      }
    };
    fetchPoints();
  }, [pointsPragyaGrouping]);

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
    // no stack, so it draws from 0→value just like a normal bar
    data: pointsPragyaData.map((d) => d.points),
    barGap: "-100%", // sit exactly under the colored bar
    itemStyle: { color: "transparent" },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      // verticalAlign: 'middle',
      // offset: [-25, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: { show: false },
    emphasis: { disabled: true },
    z: -1, // draw behind your real bars
  };
  // 3. Build your ECharts option
  const pointsPragyaChartOption = {
    title: { text: "Pragya Points Over Time", left: "center" },
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
        rotate: pointsPragyaGrouping === "daily" ? 45 : 0,
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
  // ----------------------------- Coupon Redeems over Time ----------------------------------------
  // 1. State/hooks for mission‐points chart
  const [couponRedeemsGrouping, setCouponRedeemsGrouping] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("monthly");
  const [couponRedeemsData, setCouponRedeemsData] = useState<
    { period: string; coins: number }[]
  >([]);
  const [couponRedeemsLoading, setCouponRedeemsLoading] =
    useState<boolean>(true);

  // Fetch data on grouping change
  useEffect(() => {
    setCouponRedeemsLoading(true);
    fetch(`${api_startpoint}/api/coupon-redeems-over-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grouping: couponRedeemsGrouping }),
    })
      .then((res) => res.json())
      .then((json) => setCouponRedeemsData(json.data))
      .catch(console.error)
      .finally(() => setCouponRedeemsLoading(false));
  }, [couponRedeemsGrouping]);

  // Main bar series
  const CouponRedeemsSeries = {
    name: "Coins",
    type: "bar" as const,
    data: couponRedeemsData.map((d) => d.coins),
    barMaxWidth: "50%",
    itemStyle: { color: "#FF8C42" },
  };

  // Invisible total series for labels
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

  // Format daily labels
  // const formatPeriod = (period: string) => {
  //   if (couponRedeemsGrouping === 'daily') {
  //     const date = new Date(period);
  //     return date.toISOString().split('T')[0]; // YYYY-MM-DD
  //   }
  //   return period;
  // };
  const couponRedeemsSeriesOptions = {
    title: { text: "Coupon Redeems Over Time", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "category",
      data: couponRedeemsData.map((d) =>
        formatPeriod(d.period, couponRedeemsGrouping)
      ),
      axisLabel: {
        rotate: couponRedeemsGrouping === "daily" ? 45 : 0,
        // 👇 Custom formatter for WEEKLY labels
        formatter: (value: string) => {
          if (couponRedeemsGrouping !== "weekly") {
            return value; // fallback for daily/monthly/etc.
          }

          // Parse "2024-32" → year=2024, week=32
          const [yearStr, weekStr] = value.split('-');
          const year = parseInt(yearStr, 10);
          const week = parseInt(weekStr, 10);

          // Get Jan 1 of the year
          const jan1 = new Date(year, 0, 1);
          // Adjust to Monday of week 1 (ISO week: Monday start)
          const daysOffset = (week - 1) * 7 - (jan1.getDay() + 6) % 7;
          const weekStart = new Date(jan1.getTime() + daysOffset * 86400000);
          const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

          // Format as "Jul 29 – Aug 4"
          const format = (d: Date) =>
            d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

          return `${format(weekStart)} – ${format(weekEnd)}`;
        },
      },
    },
    yAxis: { type: "value", name: "Coins" },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [CouponRedeemsSeries, totalCouponRedeemsSeries],
  };

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
  const [selectedQuizSubject, setSelectedQuizSubject] = useState<string>("all");
  const [quizSubjects, setQuizSubjects] = useState<
    Array<{ id: number; title: string }>
  >([]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/subjects_list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 1 }),
        });
        const data = await res.json();
        const parsedSubjects = data.map((subject: any) => ({
          id: subject.id,
          title: JSON.parse(subject.title).en,
        }));
        setQuizSubjects(parsedSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // --------------------- missions completed over time ------------------------------------------
  const [missionGrouping, setMissionGrouping] = useState<string>("daily");
  const [missionData, setMissionData] = useState<any[]>([]);
  const [missionLoading, setMissionLoading] = useState<boolean>(true);
  const [missionStatus, setMissionStatus] = useState<string>("all");
  const [selectedMissionSubject, setSelectedMissionSubject] =
    useState<string>("all");
  const [missionCompleteModal, setMissionCompleteModal] =
    useState<boolean>(false);

  const missionStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "submitted", label: "Submitted" },
    { value: "rejected", label: "Rejected" },
    { value: "approved", label: "Approved" },
  ];
  // Fetch mission completed data whenever the grouping changes
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
            }),
          }
        );
        const data = await response.json();
        // Log raw data for debugging
        // console.log('Mission data:', data);
        setMissionData(data);
      } catch (error) {
        console.error("Error fetching mission data:", error);
      } finally {
        setMissionLoading(false);
      }
    };

    fetchMissionData();
  }, [missionGrouping, missionStatus, selectedMissionSubject]);
  // Robust parser for JSON text fields.
  const getParsedField = (raw: any): string => {
    if (typeof raw === "object" && raw !== null) {
      return raw.en || "";
    }
    if (typeof raw === "string") {
      // Check if the string looks like JSON (starts with {)
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
    new Set(missionData.map((item) => getParsedField(item.level_title)))
  );

  // Build series data: for each unique level, for each period, use the count (or 0 if missing)
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

  // Configure the ECharts option for the mission completed chart.
  // Configure the chart options.
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
        rotate: missionGrouping === "daily" ? 45 : 0,
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
      // Use a fallback if period is null.
      const period = row.period || "Unknown";
      if (!result[period]) {
        result[period] = { period, __breakdown: {} };
      }
      // Use the level title directly as key (or format it if needed).
      const level = getParsedField(row.level_title) || "Unknown";
      const subject = getParsedField(row.subject_title);
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

  const missionDataTransformed = transformData(missionData);
  const periodsMissionTransformed = missionDataTransformed.map(
    (item) => item.period
  );
  const seriesMissionTransformed = uniqueLevels.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: missionDataTransformed.map((item) => item[level] || 0),
    // Customize item color as desired.
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));

  // 1) First compute the total for each period:
  const totalCountsMissions = periodsMissionTransformed.map((period) =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriod[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeries = {
    name: "Total", // you can omit this from your legend.data if you want
    type: "bar",
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsMissions,
    barGap: "-100%", // overlap exactly on top
    itemStyle: {
      // make the bar itself invisible
      color: "transparent",
    },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      // hide its tooltip, since it's just labels
      show: false,
    },
    emphasis: {
      // make sure it never highlights
      disabled: true,
    },
  };

  // ECharts option with custom tooltip:
  const optionMissionTransformed = {
    title: {
      text: "Mission Submitted Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
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
    },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: [
      ...seriesMissionTransformed, // your original level‑by‑level stacks
      totalSeries, // the invisible total bar on top
    ],
  };

  // -------------------- Jigyasa completed over time ------------------------------
  const [jigyasaGrouping, setJigyasaGrouping] = useState<string>("daily");
  const [jigyasaData, setJigyasaData] = useState<any[]>([]);
  const [jigyasaLoading, setJigyasaLoading] = useState<boolean>(true);
  const [jigyasaStatus, setJigyasaStatus] = useState<string>("all");
  // Add state for jigyasa subject filter
  const [selectedJigyasaSubject, setSelectedJigyasaSubject] =
    useState<string>("all");
  const [jigyasaCompleteModal, setJigyasaCompleteModal] =
    useState<boolean>(false);
  // Fetch Jigyasa completed data whenever the grouping changes
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
            }),
          }
        );
        const data = await response.json();
        // Log raw data for debugging
        // console.log('jigyasa data:', data);
        setJigyasaData(data);
      } catch (error) {
        console.error("Error fetching jigyasa data:", error);
      } finally {
        setJigyasaLoading(false);
      }
    };

    fetchJigyasaData();
  }, [jigyasaGrouping, jigyasaStatus, selectedJigyasaSubject]);

  const groupedByPeriodJigyasa: Record<string, Record<string, number>> = {};
  jigyasaData.forEach((item) => {
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
    new Set(jigyasaData.map((item) => getParsedField(item.level_title)))
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
      text: "Jigyasa Completed Over Time",
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
        rotate: jigyasaGrouping === "daily" ? 45 : 0,
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
  const periodsJigyasaTransformed = jigyasaDataTransformed.map(
    (item) => item.period
  );
  const seriesJigyasaTransformed = uniqueLevelsJigyasa.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: jigyasaDataTransformed.map((item) => item[level] || 0),
    // Customize item color as desired.
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));

  // 1) First compute the total for each period:
  const totalCountsJigyasa = periodsJigyasaTransformed.map((period) =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodJigyasa[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesJigyasa = {
    name: "Total", // you can omit this from your legend.data if you want
    type: "bar",
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsJigyasa,
    barGap: "-100%", // overlap exactly on top
    itemStyle: {
      // make the bar itself invisible
      color: "transparent",
    },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      // hide its tooltip, since it's just labels
      show: false,
    },
    emphasis: {
      // make sure it never highlights
      disabled: true,
    },
  };
  // ECharts option with custom tooltip:
  const optionJigyasaTransformed = {
    title: {
      text: "Jigyasa Completed Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
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
  // -------------------------------------------------------------------------------

  // -------------------- Pragya completed over time ------------------------------

  const [pragyaGrouping, setPragyaGrouping] = useState<string>("daily");
  const [pragyaData, setPragyaData] = useState<any[]>([]);
  const [pragyaLoading, setPragyaLoading] = useState<boolean>(true);
  const [pragyaStatus, setPragyaStatus] = useState<string>("all");
  // Add state for pragya subject filter
  const [selectedPragyaSubject, setSelectedPragyaSubject] =
    useState<string>("all");
  const [pragyaCompleteModal, setPragyaCompleteModal] =
    useState<boolean>(false);
  // Fetch pragya completed data whenever the grouping changes
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
            }),
          }
        );
        const data = await response.json();
        // Log raw data for debugging
        // console.log('pragya data:', data);
        setPragyaData(data);
      } catch (error) {
        console.error("Error fetching pragya data:", error);
      } finally {
        setPragyaLoading(false);
      }
    };

    fetchPragyaData();
  }, [pragyaGrouping, pragyaStatus, selectedPragyaSubject]);

  const groupedByPeriodPragya: Record<string, Record<string, number>> = {};
  pragyaData.forEach((item) => {
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
    new Set(pragyaData.map((item) => getParsedField(item.level_title)))
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
        rotate: pragyaGrouping === "daily" ? 45 : 0,
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
  const periodsPragyaTransformed = pragyaDataTransformed.map(
    (item) => item.period
  );
  const seriesPragyaTransformed = uniqueLevelsPragya.map((level, idx) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: pragyaDataTransformed.map((item) => item[level] || 0),
    // Customize item color as desired.
    itemStyle: {
      color: ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"][
        idx % 6
      ],
    },
  }));

  // 1) First compute the total for each period:
  const totalCountsPragya = periodsPragyaTransformed.map((period) =>
    // groupedByPeriod is your { [period]: { [level]: count }} from before
    Object.values(groupedByPeriodPragya[period]).reduce((sum, v) => sum + v, 0)
  );

  // 2) Build your stacked‑bar series as before, then append this “total” series:
  const totalSeriesPragya = {
    name: "Total", // you can omit this from your legend.data if you want
    type: "bar",
    // stack: 'total',           // same stack so it sits on top
    data: totalCountsPragya,
    barGap: "-100%", // overlap exactly on top
    itemStyle: {
      // make the bar itself invisible
      color: "transparent",
    },
    label: {
      show: true,
      position: "top", // outside left of the full bar
      distance: 5, // padding from the edge
      formatter: "{c}", // show the numeric total
      verticalAlign: "middle",
      offset: [0, 0],
      fontWeight: "bold",
      color: "#333",
    },
    tooltip: {
      // hide its tooltip, since it's just labels
      show: false,
    },
    emphasis: {
      // make sure it never highlights
      disabled: true,
    },
  };

  // ECharts option with custom tooltip:
  const optionPragyaTransformed = {
    title: {
      text: "Pragya Completed Over Time",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
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

  // -----------------------------------------------------------------------------------------------
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
  const chartRef19 = useRef<ReactECharts | null>(null);
  const chartRef20 = useRef<ReactECharts | null>(null);
  // Fetch data when modal opens or when the selected level changes

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
  // Prepare chart options for the bar chart.
  // Note: Adjust to use the correct keys according to your API output.

  // ################################ VISIONS ##############################
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
  interface Campaign {
    id: number;
    campaign_title: string;
    game_type_title: string;
  }

  const [statsVision, setStatsVision] = useState<PeriodDataVision[]>([]);
  const [groupingVision, setGroupingVision] = useState("daily");
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [assignedBy, setAssignedBy] = useState<"all" | "teacher" | "self">(
    "all"
  );
  const [visionStatus, setVisionStatus] = useState<"all" | "requested" | "approved" | "rejected">("all");
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionCompleteModal, setVisionCompleteModal] = useState(false);
  // Fetch subjects
  useEffect(() => {
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 1 }),
    })
      .then((res) => res.json())
      .then((data) => setSubjectList(data));
  }, []);


  // Fetch vision completion statistics whenever filters change
  useEffect(() => {
    setVisionLoading(true);

    // Build query parameters safely
    const params = new URLSearchParams();
    params.append('grouping', groupingVision);
    if (assignedBy !== 'all') params.append('assigned_by', assignedBy);
    if (subjectId !== null) params.append('subject_id', subjectId.toString());
    if (visionStatus !== 'all') params.append('status', visionStatus);

    const url = `${api_startpoint}/api/vision-completion-stats-student-dashboard?${params.toString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((json) => {
        // Validate response structure
        if (!Array.isArray(json?.data)) {
          console.warn('Unexpected vision stats response format:', json);
          setStatsVision([]);
        } else {
          setStatsVision(json.data);
        }
        setVisionLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch vision stats:', err);
        setStatsVision([]); // ensure chart doesn't break
        setVisionLoading(false);
      });
  }, [groupingVision, subjectId, assignedBy, visionStatus]);

  const periodsVision = statsVision.map((d) => d.period);
  const levelsVision = Array.from(
    new Set(statsVision.flatMap((d) => d.levels.map((l) => l.level)))
  );
  // series per level
  const seriesVision: any[] = levelsVision.map((level) => ({
    name: level,
    type: "bar",
    stack: "total",
    data: statsVision.map((d) => {
      const lvl = d.levels.find((l) => l.level === level);
      return lvl ? lvl.count : 0;
    }),
  }));

  // compute totals per period
  const totalsVision = statsVision.map((d) =>
    d.levels.reduce((sum, lvl) => sum + lvl.count, 0)
  );

  // invisible series for total labels
  seriesVision.push({
    name: "Total",
    type: "bar",
    stack: "total",
    data: totalsVision,
    itemStyle: { opacity: 0 },
    emphasis: { itemStyle: { opacity: 0 } },
    label: {
      show: true,
      position: "top",
      formatter: "{c}",
    },
  });
  // tooltip formatter
  const tooltipVision = {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: any[]) => {
      const idx = params[0].dataIndex;
      const pd = statsVision[idx];
      let txt = `${pd.period}<br/>`;
      pd.levels.forEach((lvl) => {
        txt += `<b>${lvl.level} :</b> ${lvl.count}<br/>`;
        lvl.subjects.forEach((sub) => {
          txt += `&nbsp;&nbsp;* ${sub.subject} : ${sub.count}<br/>`;
        });
      });
      return txt;
    },
  };
  // Prepare chart option with invisible bar for labels
  const optionVision = {
    title: { text: "Vision Submitted Over Time", left: "center" },
    tooltip: tooltipVision,
    legend: { data: levelsVision, bottom: 0 },
    xAxis: {
      type: "category",
      data: periodsVision,
      axisLabel: { rotate: groupingVision === "daily" ? 45 : 0 },
    },
    yAxis: { type: "value", name: "Users Completed" },
    dataZoom: [
      { type: "inside", start: 0, end: 100 },
      { type: "slider", start: 0, end: 100 },
    ],
    series: seriesVision,
  };

  // ----------------- vision score ------------------
  interface ScoreRow {
    period: string;
    total_score: number;
  }
  const [groupingVisionScore, setGroupingVisionScore] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "lifetime"
  >("daily");
  const [VisionScore, setVisionScore] = useState<ScoreRow[]>([]);
  const [VisionScoreLoading, setVisionScoreLoading] = useState(false);
  const [visionScoreModal, setVisionScoreModal] = useState(false);
  useEffect(() => {
    setVisionScoreLoading(true);
    const params = new URLSearchParams({ grouping: groupingVisionScore });
    fetch(`${api_startpoint}/api/vision-score-stats-student-dashboard?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setVisionScore(json.data);
        setVisionScoreLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch vision scores stats:", err);
        setVisionScoreLoading(false);
      });
  }, [groupingVisionScore]);

  const periodsVisionScore = VisionScore.map((d) => d.period);
  const scoresVisionScore = VisionScore.map((d) => d.total_score);

  const optionVisionScore = {
    title: { text: "Vision Score Over Time", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "line" } },
    xAxis: {
      type: "category",
      data: periodsVisionScore,
      axisLabel: { rotate: groupingVisionScore === "daily" ? 45 : 0 },
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
  //----------------------- vision count card ----------------------
  const [totalVisionScore, setTotalVisionScore] = useState<number>(0);
  const [totalVisionSubmitted, setTotalVisionSubmitted] = useState<number>(0);
  useEffect(() => {
    fetch(`${api_startpoint}/api/vision-answer-summary`)
      .then((res) => res.json())
      .then((json) => {
        setTotalVisionScore(json.total_score);
        setTotalVisionSubmitted(json.total_vision_answers);
      });
  }, []);
  const [
    totalTeacherAssignedVisionCompletes,
    setTotalTeacherAssignedVisionCompletes,
  ] = useState<number>(0);
  useEffect(() => {
    fetch(`${api_startpoint}/api/vision-teacher-completions-summary`)
      .then((res) => res.json())
      .then((json) =>
        setTotalTeacherAssignedVisionCompletes(
          json.total_teacher_assigned_completions
        )
      );
  }, []);

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      {/* Inject CSS styles */}
      <div dangerouslySetInnerHTML={{ __html: tableStyles }} />

      <Sidebar />

      {/* Main Content */}
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        {/* Top Navigation */}
        {/* <header className="navbar navbar-expand-md navbar-light bg-white shadow-sm border-bottom mb-3">
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
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
          {/* Combined Metrics Grid */}
          <div className="row g-4 mb-4">
            {[
              {
                title: "Total Students",
                value: totalStudents,
                icon: <IconUser />,
                color: "bg-purple",
              },
              // {
              //   title: "Active Students",
              //   value: 0,
              //   icon: <IconUserFilled />,
              //   color: "bg-teal",
              // },
              // {
              //   title: "Inactive Students",
              //   value: 0,
              //   icon: <IconUserExclamation />,
              //   color: "bg-orange",
              // },
              // {
              //   title: "Highest Online User Count",
              //   value: 0,
              //   icon: <IconUserScan />,
              //   color: "bg-blue",
              // },
              {
                title: "Total Points Earned",
                value: totalPointsEarned,
                icon: <IconUser />,
                color: "bg-purple",
              },
              {
                title: "Total Points Redeemed",
                value: totalPointsRedeemed,
                icon: <IconUserFilled />,
                color: "bg-teal",
              },
              {
                title: "Total Vision Completes",
                value: totalVisionSubmitted,
                icon: <IconUser />,
                color: "bg-sky-900",
              },
              {
                title: "Total Vision Score Earned",
                value: totalVisionScore,
                icon: <IconUser />,
                color: "bg-sky-900",
              },
              {
                title: "Total Participants Joined Mentor Sessions",
                value: sessionParticipantTotal,
                icon: <IconUser />,
                color: "bg-sky-900",
              },
              {
                title: "Total Mentors Participated for Mentor Connect Sessions",
                value: mentorsParticipatedSessionsTotal,
                icon: <IconUser />,
                color: "bg-sky-900",
              },
              {
                title: "Teacher Assign Mission Completes",
                value: tmcAssignedByTeacher,
                icon: <IconUserExclamation />,
                color: "bg-orange",
              },
              {
                title: "Total Sessions Created by Mentors",
                value: sessions.length,
                icon: <IconUser />,
                color: "bg-blue",
              },
              {
                title: "Total Teacher Assigned Vision Completes",
                value: totalTeacherAssignedVisionCompletes,
                icon: <IconUser />,
                color: "bg-blue",
              },
            ]
              // Optional: filter out any null/undefined if you use conditional logic later
              .filter(Boolean)
              .map((metric, index) => (
                <div className="col-sm-6 col-lg-3" key={index}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="subheader">{metric.title}</div>
                          <div className="h1 mb-3">
                            <NumberFlow
                              value={metric.value}
                              // suffix={metric.suffix || ""}
                              className="fw-semi-bold text-dark"
                              transformTiming={{
                                endDelay: 6,
                                duration: 750,
                                easing: "cubic-bezier(0.42, 0, 0.58, 1)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
            {/* New Cards for Modal Triggers */}
            <div className="row g-4 mb-4">
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setShowGradeModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-purple rounded-circle p-3 text-white me-3">
                        <IconSchool size={24} />
                      </div>
                      <div>
                        <div className="subheader">View Students by Grade</div>
                        <div className="text-muted">
                          Click to expand detailed grade distribution
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setShowDemographicsModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-teal rounded-circle p-3 text-white me-3">
                        <IconMapPin size={24} />
                      </div>
                      <div>
                        <div className="subheader">
                          View Student Demographics Map
                        </div>
                        <div className="text-muted">
                          Click to explore student distribution across India
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setShowChallengesModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-info rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">
                          View Challenges Completed per Mission
                        </div>
                        <div className="text-muted">
                          Click to see mission completion details
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-4 col-lg-4" onClick={handleModalOpen}>
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-orange rounded-circle p-3 text-white me-3">
                        <IconDeviceAnalytics size={24} />
                      </div>
                      <div>
                        <div className="subheader">
                          View Mission Status Analytics
                        </div>
                        <div className="text-muted">
                          Click to see mission status details
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setOpenQuizTopicLevelModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-yellow-900 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">View Quiz Completions</div>
                        <div className="text-muted">
                          Click to see Quiz completion details by students
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setModalOpenLevel(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-purple rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">
                          View Student-level distribution
                        </div>
                        <div className="text-muted">
                          Click to see Student-level distribution
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setMissionCompleteModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-cyan-950 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Mission Completes</div>
                        <div className="text-muted">
                          Click to see Mission Completes Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setJigyasaCompleteModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-red-700 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Jigyasa Completes </div>
                        <div className="text-muted">
                          Click to see Jigyasa Completes Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setPragyaCompleteModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-zinc-800 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Pragya Completes </div>
                        <div className="text-muted">
                          Click to see Pragya Completes Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setMissionCoinModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-pink-400 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Mission Coins Earned</div>
                        <div className="text-muted">
                          Click to see Mission Coins Earned Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setJigyasaCoinModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-red-400 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Jigyasa Coins Earned</div>
                        <div className="text-muted">
                          Click to see Jigyasa Coins Earned Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setPragyaCoinModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-yellow-500 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Pragya Coins Earned</div>
                        <div className="text-muted">
                          Click to see Pragya Coins Earned Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setCouponRedeemsModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-green-900 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Coupon Redeems</div>
                        <div className="text-muted">
                          Click to see Coupon Redeems Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setVisionCompleteModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-gray-950 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Vision Completes</div>
                        <div className="text-muted">
                          Click to see Vision Completes Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="col-sm-4 col-lg-4"
                onClick={() => setVisionScoreModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-gray-950 rounded-circle p-3 text-white me-3">
                        <IconTrophy size={24} />
                      </div>
                      <div>
                        <div className="subheader">Vision Scores</div>
                        <div className="text-muted">
                          Click to see Vision Scores Earned Over Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modals */}
            {/* Mission Status Modal */}
            {modalOpen && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative overflow-auto">
                  <h2 className="text-lg font-bold mb-4">
                    Mission Status Analytics
                  </h2>

                  {/* Grouping Dropdown */}
                  <select
                    value={grouping}
                    onChange={(e) => setGrouping(e.target.value)}
                    className="mb-2 p-2 border rounded"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                  <select
                    value={missionLevel}
                    onChange={(e) => setMissionLevel(e.target.value as any)}
                    className="mb-4 p-2 border rounded"
                  >
                    <option value="all">All Levels</option>
                    <option value="level1">Level 1 (Grades 1–5)</option>
                    <option value="level2">Level 2 (Grade 6+)</option>
                    <option value="level3">Level 3 (Grade 7+)</option>
                    <option value="level4">Level 4 (Grade 8+)</option>
                  </select>

                  {/* Loading and Error States */}
                  {loading && (
                    <div className="text-center py-4">Loading data...</div>
                  )}

                  {missionStatusError && (
                    <div className="text-red-500 text-center py-4">
                      {missionStatusError}
                    </div>
                  )}

                  {/* Chart */}
                  {!loading && !missionStatusError && (
                    <ReactECharts
                      option={MissionStatusChartOptions}
                      style={{ height: "400px", width: "100%" }}
                    />
                  )}

                  {/* Close button */}
                  <button
                    onClick={handleModalClose}
                    className="mt-4 p-2 bg-red-500 text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {/* Grade Distribution Modal */}
            {showGradeModal && (
              <div
                className="modal fade show"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Students by Grade Distribution
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowGradeModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {isLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading students by grade...</p>
                        </div>
                      ) : error ? (
                        <div className="text-center text-danger">
                          <p>Error: {error}</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead>
                              <tr>
                                <th>Grade</th>
                                <th>Number of Students</th>
                                <th>Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsByGrade.map((gradeData, index) => (
                                <tr key={index}>
                                  <td>
                                    {gradeData.grade === null
                                      ? "Unspecified"
                                      : `Grade ${gradeData.grade}`}
                                  </td>
                                  <td>{gradeData.count.toLocaleString()}</td>
                                  <td>
                                    {(
                                      (gradeData.count / totalStudents) *
                                      100
                                    ).toFixed(2)}
                                    %
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="table-active">
                                <td>
                                  <strong>Total</strong>
                                </td>
                                <td>
                                  <strong>
                                    {totalStudents.toLocaleString()}
                                  </strong>
                                </td>
                                <td>
                                  <strong>100%</strong>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowGradeModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Demographics Map Modal */}
            {showDemographicsModal && (
              <div
                className="modal fade show"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-xl">
                  <div className="modal-content flex items-center">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Student Distribution Across India
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDemographicsModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body d-flex items-center">
                      {!HighchartsLib || !chartOptions ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : errorMessage ? (
                        <div>Error: {errorMessage}</div>
                      ) : (
                        <HighchartsReact
                          highcharts={HighchartsLib}
                          constructorType="mapChart"
                          options={chartOptions}
                        />
                      )}
                    </div>
                    <div className="modal-footer w-full">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowDemographicsModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/*Total number of challenges submitted by students  in each level for each subject in the Life app*/}
            {showChallengesModal && (
              <div
                className="modal fade show"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Challenges Completed per Mission
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowChallengesModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {isChallengesLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-info"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading challenges data...</p>
                        </div>
                      ) : challengesData.length === 0 ? (
                        <div className="text-center text-muted">
                          <p>No challenges data available.</p>
                        </div>
                      ) : (
                        (() => {
                          const totalChallenges = challengesData.reduce(
                            (sum, row) => sum + row.count,
                            0
                          );

                          // Paginate the data
                          const paginatedChallengesData = challengesData.slice(
                            currentChallengesPage * rowsPerPageChallenges,
                            (currentChallengesPage + 1) * rowsPerPageChallenges
                          );

                          return (
                            <div className="table-responsive">
                              <table className="table table-striped table-hover">
                                <thead>
                                  <tr>
                                    <th>Mission ID</th>
                                    <th>Title</th>
                                    <th>Level</th>
                                    <th>Student Count</th>
                                    <th>Percentage</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paginatedChallengesData.map((row, index) => {
                                    let title = "";
                                    try {
                                      const parsedTitle = JSON.parse(row.title);
                                      title = parsedTitle.en || "";
                                    } catch (error) {
                                      title = row.title;
                                    }
                                    let level = "";
                                    try {
                                      const parsedTitle = JSON.parse(
                                        row.description
                                      );
                                      level = parsedTitle.en || "";
                                    } catch (error) {
                                      level = row.description;
                                    }

                                    const percentage =
                                      totalChallenges > 0
                                        ? (
                                            (row.count / totalChallenges) *
                                            100
                                          ).toFixed(3)
                                        : "0.00";

                                    return (
                                      <tr key={index}>
                                        <td>{row.la_mission_id}</td>
                                        <td>{title}</td>
                                        <td>{level}</td>
                                        <td>{row.count.toLocaleString()}</td>
                                        <td>{percentage}%</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="table-active">
                                    <td colSpan={2}>
                                      <strong>Total</strong>
                                    </td>
                                    <td>
                                      <strong />
                                    </td>
                                    <td>
                                      <strong>
                                        {totalChallenges.toLocaleString()}
                                      </strong>
                                    </td>

                                    <td>
                                      <strong>100%</strong>
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>

                              {/* Pagination Controls */}
                              <div className="d-flex justify-content-between mt-3">
                                <button
                                  className="btn btn-secondary"
                                  onClick={() =>
                                    setCurrentChallengesPage((prev) =>
                                      Math.max(prev - 1, 0)
                                    )
                                  }
                                  disabled={currentChallengesPage === 0}
                                >
                                  Previous
                                </button>
                                <div className="d-flex align-items-center">
                                  <span className="mx-2">
                                    Page {currentChallengesPage + 1} of{" "}
                                    {Math.ceil(
                                      challengesData.length /
                                        rowsPerPageChallenges
                                    ) || 1}
                                  </span>
                                </div>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() =>
                                    setCurrentChallengesPage((prev) =>
                                      (prev + 1) * rowsPerPageChallenges <
                                      challengesData.length
                                        ? prev + 1
                                        : prev
                                    )
                                  }
                                  disabled={
                                    (currentChallengesPage + 1) *
                                      rowsPerPageChallenges >=
                                    challengesData.length
                                  }
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowChallengesModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/*Total number of quiz submitted by students  in each level for each subject in the Life app*/}
            {/* Modal for Quiz Data */}
            {openQuizTopicLevelModal && (
              <div
                className="modal fade show"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Quiz Statistics by Subject and Level
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setOpenQuizTopicLevelModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {isQuizLoading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-info"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading quiz data...</p>
                        </div>
                      ) : quizData.length === 0 ? (
                        <div className="text-center text-muted">
                          <p>No quiz data available.</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Level</th>
                                <th>Count</th>
                                <th>Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedQuizData.map((row, index) => {
                                let subject = "";
                                try {
                                  const parsedSubject = JSON.parse(
                                    row.subject_title
                                  );
                                  subject = parsedSubject.en || "";
                                } catch (error) {
                                  subject = row.subject_title;
                                }
                                let level = "";
                                try {
                                  const parsedLevel = JSON.parse(
                                    row.level_title
                                  );
                                  level = parsedLevel.en || "";
                                } catch (error) {
                                  level = row.level_title;
                                }
                                const percentage =
                                  totalQuiz > 0
                                    ? (
                                        (Number(row.count) / totalQuiz) *
                                        100
                                      ).toFixed(3)
                                    : "0.00";

                                return (
                                  <tr key={index}>
                                    <td>{subject}</td>
                                    <td>{level}</td>
                                    <td>
                                      {Number(row.count).toLocaleString()}
                                    </td>
                                    <td>{percentage}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="table-active">
                                <td colSpan={2}>
                                  <strong>Total</strong>
                                </td>
                                <td>
                                  <strong>{totalQuiz.toLocaleString()}</strong>
                                </td>
                                <td>
                                  <strong>100%</strong>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                          {/* Pagination Controls */}
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              className="btn btn-secondary"
                              onClick={() =>
                                setCurrentQuizPage((prev) =>
                                  Math.max(prev - 1, 0)
                                )
                              }
                              disabled={currentQuizPage === 0}
                            >
                              Previous
                            </button>
                            <div className="d-flex align-items-center">
                              <span className="mx-2">
                                Page {currentQuizPage + 1} of{" "}
                                {Math.ceil(quizData.length / rowsPerPageQuiz) ||
                                  1}
                              </span>
                            </div>
                            <button
                              className="btn btn-secondary"
                              onClick={() =>
                                setCurrentQuizPage((prev) =>
                                  (prev + 1) * rowsPerPageQuiz < quizData.length
                                    ? prev + 1
                                    : prev
                                )
                              }
                              disabled={
                                (currentQuizPage + 1) * rowsPerPageQuiz >=
                                quizData.length
                              }
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setOpenQuizTopicLevelModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modalOpenLevel && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalOpenLevel(false)}
                  ></button>
                  <h2 className="text-lg font-bold mb-4">
                    Student Count by Level
                  </h2>
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
                    <label className="mr-2 font-semibold">
                      Select Subject:
                    </label>
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
                    <label className="mr-2 font-semibold">Select Level:</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) =>
                        setSelectedLevel(e.target.value as FilterLevel)
                      }
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
                    <ReactECharts
                      ref={chartRef11}
                      option={EchartLevelOption}
                      style={{ height: "400px", width: "100%" }}
                    />
                  )}
                </div>
              </div>
            )}
            {missionCompleteModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMissionCompleteModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
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
                        <ReactECharts
                          ref={chartRef3}
                          option={optionMissionTransformed}
                          style={{ height: "400px", width: "100%" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {jigyasaCompleteModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setJigyasaCompleteModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Jigyasa Completed
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
                        <ReactECharts
                          ref={chartRef5}
                          option={optionJigyasaTransformed}
                          style={{ height: "400px", width: "100%" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {pragyaCompleteModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setPragyaCompleteModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Pragya Completed
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
                        <ReactECharts
                          ref={chartRef6}
                          option={optionPragyaTransformed}
                          style={{ height: "400px", width: "100%" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {MissionCoinModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMissionCoinModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Mission Coins Earned Over Time
                        </h3>
                        {/* Download button */}
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
                          <ReactECharts
                            ref={chartRef12}
                            option={pointsMissionChartOption}
                            style={{ height: 400 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {JigyasaCoinModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setJigyasaCoinModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Jigyasa Coins Earned Over Time
                        </h3>
                        {/* Download button */}
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="points-jigyasa-grouping">
                          Group by:
                        </label>
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
                          <ReactECharts
                            ref={chartRef13}
                            option={pointsJigyasaChartOption}
                            style={{ height: 400 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {PragyaCoinModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setPragyaCoinModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Pragya Coins Earned Over Time
                        </h3>
                        {/* Download button */}
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="points-pragya-grouping">
                          Group by:
                        </label>
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
                          <ReactECharts
                            ref={chartRef14}
                            option={pointsPragyaChartOption}
                            style={{ height: 400 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {CouponRedeemsModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setCouponRedeemsModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Coupon Redeems Over Time
                        </h3>
                        {/* Download button */}
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
                          <ReactECharts
                            ref={chartRef15}
                            option={couponRedeemsSeriesOptions}
                            style={{ height: 400 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {visionCompleteModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setVisionCompleteModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Vision Completes Over Time
                        </h3>
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        {/* Grouping Selector */}
                        <label htmlFor="vision-grouping" className="me-2">
                          Group by:
                        </label>
                        <select
                          id="vision-grouping"
                          value={groupingVision}
                          onChange={(e) => setGroupingVision(e.target.value)}
                          className="border rounded p-1 me-3"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>

                        {/* Subject Filter */}
                        <label htmlFor="vision-subject" className="me-2">
                          Subject:
                        </label>
                        <select
                          id="vision-subject"
                          value={subjectId ?? ""}
                          onChange={(e) =>
                            setSubjectId(e.target.value ? Number(e.target.value) : null)
                          }
                          className="border rounded p-1 me-3"
                        >
                          <option value="">All Subjects</option>
                          {subjectList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {typeof s.title === 'string'
                                ? JSON.parse(s.title).en
                                : s.title.en}
                            </option>
                          ))}
                        </select>

                        {/* Assignment Type Filter */}
                        <label htmlFor="vision-assigned-by" className="me-2">
                          Assigned by:
                        </label>
                        <select
                          id="vision-assigned-by"
                          value={assignedBy}
                          onChange={(e) => setAssignedBy(e.target.value as any)}
                          className="border rounded p-1 me-3"
                        >
                          <option value="all">All Assignments</option>
                          <option value="self">Self Assigned</option>
                          <option value="teacher">By Teacher</option>
                        </select>

                        {/* Status Filter */}
                        <label htmlFor="vision-status" className="me-2">
                          Status:
                        </label>
                        <select
                          id="vision-status"
                          value={visionStatus}
                          onChange={(e) => setVisionStatus(e.target.value as any)}
                          className="border rounded p-1"
                        >
                          <option value="all">All Statuses</option>
                          <option value="requested">Requested</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Loading, Error, or Chart Rendering */}
                      {visionLoading ? (
                        <div className="text-center py-4">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "3rem", height: "3rem" }}
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 text-muted">Loading vision data...</p>
                        </div>
                      ) : statsVision.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          No vision completion data available for the selected filters.
                        </div>
                      ) : (
                        <ReactECharts
                          ref={chartRef19}
                          option={optionVision}
                          style={{ height: "400px", width: "100%" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {visionScoreModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setVisionScoreModal(false)}
                  ></button>
                  <div className="col-12 col-xl-12">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-header bg-transparent py-3">
                        <h3 className="card-title mb-0 fw-semibold">
                          Vision Scores Over Time
                        </h3>
                        {/* Download button */}
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
                          <ReactECharts
                            ref={chartRef20}
                            option={optionVisionScore}
                            style={{ height: 400 }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Search & Filter</h5>
                <div className="row g-3">
                  {/* Dropdowns Row 1 */}
                  {/* <div className="col-12 col-md-6 col-lg-3">
                                        <select className="form-select" value={selectedMissionType} onChange={(e) => setSelectedMissionType(e.target.value)}>
                                            <option value="">All Missions Types</option>
                                            <option value="Mission">Mission</option>
                                            <option value="Jigyasa">Jigyasa</option>
                                            <option value="Pragya">Pragya</option>
                                        </select>
                                    </div> */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedMissionAcceptance}
                      onChange={(e) =>
                        setSelectedMissionAcceptance(e.target.value)
                      }
                      required
                    >
                      <option value="">All Missions</option>
                      <option value="accepted">Missions Approved</option>
                      <option value="rejected">Mission Rejected</option>
                    </select>
                  </div>
                  {/* Vision Acceptance Filter */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedVisionAcceptance}
                      onChange={(e) =>
                        setSelectedVisionAcceptance(e.target.value)
                      }
                    >
                      <option value="">All Visions</option>
                      <option value="accepted">Vision Approved</option>
                      <option value="rejected">Vision Rejected</option>
                    </select>
                  </div>

                  {/* Vision Requested Count */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedVisionRequestedNo}
                      onChange={(e) =>
                        setSelectedVisionRequestedNo(e.target.value)
                      }
                    >
                      <option value="">Select Vision Requested</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (requesteds) => (
                          <option
                            key={requesteds}
                            value={requesteds.toString()}
                          >
                            Requests made - {requesteds}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Vision Accepted Count */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedVisionAcceptedNo}
                      onChange={(e) =>
                        setSelectedVisionAcceptedNo(e.target.value)
                      }
                    >
                      <option value="">Select Vision Approved</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (approves) => (
                          <option key={approves} value={approves.toString()}>
                            Approves made - {approves}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <select
                      id="campaignSelect"
                      className="form-select"
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                    >
                      <option value="">All Campaigns</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {/* Display campaign title and type for clarity */}
                          {campaign.campaign_title} ({campaign.game_type_title})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={states}
                      placeholder="Select State"
                      value={selectedState ? [selectedState] : []} // Convert to array
                      onChange={(vals) => setSelectedState(vals[0] || "")} // Take first value
                      isLoading={isStatesLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={cities}
                      placeholder="Select city"
                      value={selectedCity ? [selectedCity] : []} // Convert to array
                      onChange={(vals) => setSelectedCity(vals[0] || "")} // Take first value
                      isLoading={isCitiesLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={schools}
                      placeholder="Select School"
                      value={selectedSchools}
                      onChange={setSelectedSchools}
                      isLoading={isSchoolsLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3 text-gray-500">
                    <select
                      className="form-select"
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (grade) => (
                          <option key={grade} value={grade.toString()}>
                            Grade {grade}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedMissionRequestedNo}
                      onChange={(e) =>
                        setSelectedMissionRequestedNo(e.target.value)
                      }
                    >
                      <option value="">Select Mission Requested</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (requesteds) => (
                          <option
                            key={requesteds}
                            value={requesteds.toString()}
                          >
                            Requests made - {requesteds}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedMissionAcceptedNo}
                      onChange={(e) =>
                        setSelectedMissionAcceptedNo(e.target.value)
                      }
                    >
                      <option value="">Select Mission Approved</option>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(
                        (approves) => (
                          <option key={approves} value={approves.toString()}>
                            Approves made - {approves}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedEarnCoins}
                      onChange={(e) => setSelectedEarnCoins(e.target.value)}
                    >
                      <option value="">Select Earn Coins</option>
                      <option value="0-1000">0-1000 Coins</option>
                      <option value="1001-5000">1001-5000 Coins</option>
                      <option value="5001-10000">5001-10000 Coins</option>
                      <option value="10000+">10000+ Coins</option>
                    </select>
                  </div>

                  {/* Dropdowns & Inputs Row 3 */}
                  {/* <div className="col-12 col-md-6 col-lg-3">
                                        <select className="form-select">
                                            <option value="">Select User Type</option>
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div> */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="date"
                      placeholder="From Date"
                      className="form-control"
                      value={selectedFromDate}
                      onChange={(e) => setSelectedFromDate(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="date"
                      placeholder="To Date"
                      className="form-control"
                      value={selectedToDate}
                      onChange={(e) => setSelectedToDate(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="tel"
                      placeholder="Search With Mobile Number"
                      className="form-control"
                      value={selectedMobileNo}
                      onChange={(e) => setSelectedMobileNo(e.target.value)}
                    />
                  </div>

                  {/* Inputs Row 4 */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      placeholder="Search With District Name"
                      className="form-control"
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      placeholder="Search With Block Name"
                      className="form-control"
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      placeholder="Search With Cluster Name"
                      className="form-control"
                    />
                  </div>
                  <div className="col-16 col-md-6 col-lg-4">
                    <div className="border rounded p-2 bg-white">
                      <input
                        type="text"
                        placeholder="Search School code (press enter or comma before search)"
                        className="form-control border-0 p-0"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (["Enter", ",", " "].includes(e.key)) {
                            e.preventDefault();
                            const code = inputCode.trim();
                            if (code && !selectedSchoolCode.includes(code)) {
                              setSelectedSchoolCode((prev) => [...prev, code]);
                            }
                            setInputCode("");
                          }
                        }}
                      />
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedSchoolCode.map((code) => (
                          <span
                            key={code}
                            className="badge bg-purple text-white d-flex align-items-center"
                          >
                            {code}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              onClick={() =>
                                setSelectedSchoolCode((prev) =>
                                  prev.filter((c) => c !== code)
                                )
                              }
                              aria-label="Remove"
                            ></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button
                    className="btn btn-success d-inline-flex align-items-center"
                    onClick={handleSearch}
                  >
                    <Search className="me-2" size={16} />
                    Search
                  </button>

                  <button
                    className="btn btn-warning d-inline-flex align-items-center text-dark"
                    onClick={handleClear}
                  >
                    <XCircle className="me-2" size={16} />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-purple d-inline-flex align-items-center text-white"
                style={{ backgroundColor: "#6f42c1" }}
                onClick={exportToCSV}
              >
                <Download className="me-2" size={16} />
                Export
              </button>

              <button
                className="btn btn-success d-inline-flex align-items-center"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="me-2" size={16} />
                Add Student
              </button>

              {/* <button className="btn btn-purple d-inline-flex align-items-center text-white" style={{ backgroundColor: '#6f42c1' }}>
                                <BarChart3 className="me-2" size={16} />
                                View Graph
                            </button> */}
            </div>

            {/* Paginated Results Table */}
            <div className="card shadow-sm border-0 mt-2">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  Results- {tableData.length} students found
                </h5>
                {isTableLoading ? (
                  <div className="text-center p-5">
                    <div
                      className="spinner-border text-purple"
                      role="status"
                      style={{ width: "3rem", height: "3rem" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">
                      Loading data, please wait...
                    </p>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="text-center p-5">
                    <div className="text-muted justify-items-center">
                      <IconSearch size={48} className="mb-3 opacity-50 " />
                      <p>
                        No data to display. Please use the search filters above
                        and click Search.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="table-container">
                    {/* Scroll hints for visual indication */}
                    <button
                      className={`scroll-hint-left ${
                        !showLeftHint ? "scroll-hint-hidden" : ""
                      }`}
                      onClick={() => scrollTableHorizontally("left")}
                      aria-label="Scroll left"
                    >
                      <IconChevronLeft size={24} />
                    </button>
                    <button
                      className={`scroll-hint-right ${
                        !showRightHint ? "scroll-hint-hidden" : ""
                      }`}
                      onClick={() => scrollTableHorizontally("right")}
                      aria-label="Scroll right"
                    >
                      <IconChevronRight size={24} />
                    </button>

                    {/* Table with sticky headers and smooth scrolling */}
                    <div
                      ref={tableContainerRef}
                      className="overflow-x-scroll smooth-scroll"
                      onScroll={handleTableScroll}
                      style={{ maxHeight: "70vh", overflowY: "auto" }}
                    >
                      <table className="table table-striped table-sticky-header">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>School</th>
                            <th>Guardian</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Mobile</th>
                            <th>DOB</th>
                            <th>User Type</th>
                            <th>Grade</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Address</th>
                            <th>Earn Coins</th>
                            <th>Heart Coins</th>
                            <th>Brain Coins</th>
                            <th>School ID</th>
                            <th>School Code</th>
                            <th>Registered At</th>
                            <th>Mission Requested</th>
                            <th>Mission Approved</th>
                            <th>Vision Requested</th>
                            <th>Vision Approved</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((row, index) => (
                            <tr key={index}>
                              <td>{row.id}</td>
                              <td>{row.name}</td>
                              <td>{row.school_name}</td>
                              <td>{row.guardian_name}</td>
                              <td>{row.email}</td>
                              <td>{row.username}</td>
                              <td>{row.mobile_no}</td>
                              <td>{row.dob}</td>
                              <td>{row.user_type}</td>
                              <td>{row.grade}</td>
                              <td>{row.city}</td>
                              <td>{row.state}</td>
                              <td>{row.address}</td>
                              <td>{row.earn_coins}</td>
                              <td>{row.heart_coins}</td>
                              <td>{row.brain_coins}</td>
                              <td>{row.school_id}</td>
                              <td>{row.school_code}</td>
                              <td>{row.registered_at}</td>
                              <td>{row.total_missions_requested || 0}</td>
                              <td>{row.total_missions_accepted || 0}</td>
                              <td>{row.total_visions_requested || 0}</td>
                              <td>{row.total_visions_accepted || 0}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary me-2 "
                                  onClick={() => openEdit(row)}
                                >
                                  <IconEdit size={16} />
                                </button>
                                <button
                                  className="btn btn-sm btn-danger "
                                  onClick={() => openDelete(row)}
                                >
                                  <IconTrash size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 0))
                        }
                        disabled={currentPage === 0}
                      >
                        Previous
                      </button>
                      <div className="d-flex align-items-center">
                        <span className="mx-2">
                          Page {currentPage + 1} of{" "}
                          {Math.ceil(tableData.length / rowsPerPage) || 1}
                        </span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            (prev + 1) * rowsPerPage < tableData.length
                              ? prev + 1
                              : prev
                          )
                        }
                        disabled={
                          (currentPage + 1) * rowsPerPage >= tableData.length
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ───── Add Student Modal ───── */}
            {isAddOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <form
                  onSubmit={handleAddStudent}
                  className="bg-white rounded-lg p-6 w-full max-w-lg space-y-2 overflow-auto max-h-[90vh]"
                >
                  <h2 className="text-xl font-semibold">Add Student</h2>
                  {addError && <div className="text-red-600">{addError}</div>}
                  <div className="d-flex flex-col gap-3">
                    <input
                      name="name"
                      placeholder="Name"
                      value={newStudent.name}
                      onChange={(e) => handleNewChange("name", e.target.value)}
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      name="guardian_name"
                      placeholder="Guardian Name"
                      value={newStudent.guardian_name}
                      onChange={(e) =>
                        handleNewChange("guardian_name", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={newStudent.email}
                      onChange={(e) => handleNewChange("email", e.target.value)}
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      name="username"
                      placeholder="Username"
                      value={newStudent.username}
                      onChange={(e) =>
                        handleNewChange("username", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      name="mobile_no"
                      placeholder="Mobile No."
                      value={newStudent.mobile_no}
                      onChange={(e) =>
                        handleNewChange("mobile_no", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                      required
                    />
                    <div className="">
                      <label className="block text-sm mb-1 ">
                        Date of Birth
                      </label>
                      <input
                        name="dob"
                        type="date"
                        placeholder="DOB"
                        value={newStudent.dob}
                        onChange={(e) => handleNewChange("dob", e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                      />
                    </div>
                  </div>

                  {/* Dropdowns: Grade, State, City, School */}
                  <div className="d-flex flex-col gap-2">
                    <div>
                      <label className="block text-sm mb-1">Grade</label>
                      <select
                        className="form-select w-full border p-2 rounded"
                        value={newStudent.grade}
                        onChange={(e) =>
                          handleNewChange("grade", e.target.value)
                        }
                        required
                      >
                        <option value="">Select Grade</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (g) => (
                            <option key={g} value={String(g)}>
                              Grade {g}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">State</label>
                      <SearchableDropdown
                        options={states}
                        placeholder="Select State"
                        value={newStudent.state ? [newStudent.state] : []}
                        onChange={(vals) =>
                          handleNewChange("state", vals[0] || "")
                        }
                        isLoading={isStatesLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">City</label>
                      <SearchableDropdown
                        options={addCities}
                        placeholder="Select City"
                        value={newStudent.city ? [newStudent.city] : []}
                        onChange={(vals) =>
                          handleNewChange("city", vals[0] || "")
                        }
                        isLoading={isAddCitiesLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">School</label>
                      <SearchableDropdown
                        options={schoolOptions.map((s) => s.name)}
                        placeholder="Select School"
                        value={
                          newStudent.school_name ? [newStudent.school_name] : []
                        }
                        isLoading={isSchoolsAddLoading}
                        onChange={(vals) => {
                          const selectedName = vals[0] || "";
                          // find the full record:
                          const found = schoolOptions.find(
                            (s) => s.name === selectedName
                          );
                          setNewStudent((s) => ({
                            ...s,
                            school_name: selectedName,
                            school_id: found?.id ?? "",
                            school_code: found?.code ?? "",
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="d-flex flex-row gap-4 w-[90%]">
                    <input
                      name="school_id"
                      placeholder="School ID"
                      value={newStudent.school_id ?? ""}
                      // onChange={e => handleNewChange('school_id', e.target.value)}
                      className="w-full border p-2 rounded"
                      disabled
                    />
                    <input
                      name="school_code"
                      placeholder="School Code"
                      value={newStudent.school_code ?? ""}
                      // onChange={e => handleNewChange('school_code', e.target.value)}
                      className="w-full border p-2 rounded"
                      disabled
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      disabled={adding}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      {adding ? "Adding…" : "Add Student"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ───── Edit Student Modal ───── */}
            {isEditOpen && editingStudent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <form
                  onSubmit={handleEditSubmit}
                  className="bg-white rounded-lg p-6 w-full max-w-lg space-y-2 overflow-auto max-h-[90vh]"
                >
                  <h2 className="text-xl font-semibold">Edit Student</h2>
                  {editError && <div className="text-red-600">{editError}</div>}
                  <div className="d-flex flex-col gap-3">
                    <input
                      placeholder="Name"
                      value={editingStudent.name ?? ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      placeholder="Guardian Name"
                      value={editingStudent.guardian_name ?? ""}
                      onChange={(e) =>
                        handleEditChange("guardian_name", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editingStudent.email ?? ""}
                      onChange={(e) =>
                        handleEditChange("email", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      placeholder="Username"
                      value={editingStudent.username ?? ""}
                      onChange={(e) =>
                        handleEditChange("username", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                      required
                    />
                    <input
                      placeholder="Mobile No."
                      value={editingStudent.mobile_no ?? ""}
                      onChange={(e) =>
                        handleEditChange("mobile_no", e.target.value)
                      }
                      className="w-full border p-2 rounded"
                      required
                    />
                    <div className="">
                      <label className="block text-sm mb-1 ">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        placeholder="DOB"
                        value={editingStudent.dob ?? ""}
                        onChange={(e) =>
                          handleEditChange("dob", e.target.value)
                        }
                        className="w-full border p-2 rounded"
                      />
                    </div>
                  </div>
                  {/* Grade, State, City, School dropdowns */}
                  <div className="d-flex flex-col gap-2">
                    <div>
                      <label className="block text-sm mb-1">Grade</label>
                      <select
                        className="form-select w-full border p-2 rounded"
                        value={editingStudent.grade ?? ""}
                        onChange={(e) =>
                          handleEditChange("grade", e.target.value)
                        }
                        required
                      >
                        <option value="">Select Grade</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (g) => (
                            <option key={g} value={String(g)}>
                              Grade {g}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">State</label>
                      <SearchableDropdown
                        options={states}
                        placeholder="Select State"
                        value={
                          editingStudent.state ? [editingStudent.state] : []
                        }
                        onChange={(vals) =>
                          handleEditChange("state", vals[0] || "")
                        }
                        isLoading={isStatesLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">City</label>
                      <SearchableDropdown
                        options={editCities}
                        placeholder="Select City"
                        value={editingStudent.city ? [editingStudent.city] : []}
                        onChange={(vals) =>
                          handleEditChange("city", vals[0] || "")
                        }
                        isLoading={isEditCitiesLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">School</label>
                      <SearchableDropdown
                        options={schoolEditOptions.map((s) => s.name)}
                        placeholder="Select School"
                        value={
                          editingStudent.school_name
                            ? [editingStudent.school_name]
                            : []
                        }
                        isLoading={isSchoolsEditLoading}
                        onChange={(vals) => {
                          const selectedName = vals[0] || "";
                          const found = schoolEditOptions.find(
                            (s) => s.name === selectedName
                          );
                          setEditingStudent(
                            (e: { school_id: any; school_code: any }) => ({
                              ...e,
                              school_name: selectedName,
                              school_id: found?.id ?? e.school_id,
                              school_code: found?.code ?? e.school_code,
                            })
                          );
                        }}
                      />
                    </div>
                  </div>

                  {/* Optional overrides */}
                  <div className="d-flex flex-row gap-2">
                    <input
                      placeholder="School ID"
                      value={editingStudent.school_id ?? ""}
                      // onChange={e => handleEditChange('school_id', e.target.value)}
                      className="w-full border p-2 rounded"
                      disabled
                    />
                    <input
                      placeholder="School Code"
                      value={editingStudent.school_code ?? ""}
                      // onChange={e => handleEditChange('school_code', e.target.value)}
                      className="w-full border p-2 rounded"
                      disabled
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      disabled={editing}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editing}
                      className="px-4 py-2 bg-sky-600 text-white rounded"
                    >
                      {editing ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ───── Delete Student Modal ───── */}
            {isDeleteOpen && deletingStudent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
                  <h2 className="text-lg font-semibold">Confirm Delete</h2>
                  <p>
                    Are you sure you want to delete{" "}
                    <span className="font-medium">{deletingStudent.name}</span>?
                  </p>
                  {deleteError && <p className="text-red-600">{deleteError}</p>}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setIsDeleteOpen(false)}
                      disabled={deleting}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function useDebounce(arg0: () => void, arg1: number, arg2: string[]) {
  throw new Error("Function not implemented.");
}

