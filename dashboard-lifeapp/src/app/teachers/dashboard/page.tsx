"use client";
import "@tabler/core/dist/css/tabler.min.css";
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import NumberFlow from '@number-flow/react'
import React from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Sidebar } from "@/components/ui/sidebar";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
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
  IconEdit,
  IconTrash,
  IconTrophy,
} from "@tabler/icons-react";

import {
  BarChart3,
  ChevronDown,
  Download,
  Pencil,
  Plus,
  Search,
  Trash,
  XCircle,
} from "lucide-react";
import NumberFlow from "@number-flow/react";

import dynamic from "next/dynamic";
import { endpointWriteToDisk } from "next/dist/build/swc/generated-native";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});
import Highcharts from "highcharts";
import { number } from "echarts";
import { json } from "stream/consumers";
import PreviousMap from "postcss/lib/previous-map";
// import Drilldown from 'highcharts/modules/drilldown';
// if (typeof Highcharts === 'object') {
//     Drilldown(Highcharts);
// }

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

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

interface DemographData {
  state: string;
  count: string;
}
interface DemographChartdata {
  code: string;
  value: number;
}
interface TeachersByGrade {
  grade: number | null;
  count: number;
}

type TeacherRow = {
  id: number;
  name: string;
  email?: string;
  mobile_no: string;
  state?: string;
  city?: string;
  school?: string;
  school_id?: string;
  school_code?: string;
  teacher_subject?: string;
  teacher_grade?: string;
  teacher_section?: string;
  teacher_board?: string;
};

interface SearchableDropdownProps {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  maxDisplayItems?: number;
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
    onChange(option);
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
          {isLoading ? "Loading..." : value || placeholder}
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


export default function TeachersDashboard() {
  const [states, setStates] = useState<string[]>([]);
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");

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
        const res = await fetch(`${api_startpoint}/api/state_list_teachers`);
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

  // For city fetching - optimized but independent of state
  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const fetchCities = async (state: string) => {
    if (!state) return;

    console.log("Fetching cities for state:", state);

    setIsCitiesLoading(true);
    try {
      const res = await fetch(
        `${api_startpoint}/api/city_list_teacher_dashboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: state }),
        }
      );

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
      const res = await fetch(
        `${api_startpoint}/api/city_list_teacher_dashboard`,
        {
          // Updated endpoint URL
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: state }),
        }
      );

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
      const res = await fetch(
        `${api_startpoint}/api/city_list_teacher_dashboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: state }),
        }
      );

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

  const [schools, setSchools] = useState<string[]>([]);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState("");
  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await fetch(`${api_startpoint}/api/teacher_schools`, {
          method: "POST",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const schoolList = data
            .map((item) =>
              item.school && typeof item.school === "string"
                ? item.school.trim()
                : ""
            )
            .filter((school) => school !== "");
          setSchools(schoolList);
          sessionStorage.setItem("schoolsList", JSON.stringify(schoolList));
        } else {
          console.error("Unexpected API response format:", data);
          setSchools([]);
        }
      } catch (error) {
        console.error("Error fetching school list:", error);
        setSchools([]);
      } finally {
        setIsSchoolsLoading(false);
      }
    }
    fetchSchools();
  }, []);

  const [inputCode, setInputCode] = useState("");
  // Update existing state declaration
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);
  const [selectedLifeLab, setSelectedLifeLab] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const rowsPerPage = 15;
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(""); // New state for From Date
  const [selectedToDate, setSelectedToDate] = useState(""); // New state for To Date

  // Define state variables for subject filter, grade filter, and subjects list
  const [selectedTeacherSubject, setSelectedTeacherSubject] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("");
  const [subjectsList, setSubjectsList] = useState<
    { id: string; title: string }[]
  >([]);

  // Fetch the subject list from the API endpoint (e.g., /api/subjects_list)
  // Fetch subjects list from the API endpoint
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await fetch(`${api_startpoint}/api/subjects_list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "1" }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter active subjects if needed, then map to an object with id and title.
          // Here, we assume only subjects with status 1 are active.
          const subjects = data
            .filter((item) => item.status === 1)
            .map((item) => {
              let subjectTitle = "";
              try {
                const titleObj = JSON.parse(item.title);
                subjectTitle = titleObj.en;
              } catch (error) {
                subjectTitle = item.title;
              }
              return {
                id: item.id.toString(), // Convert the id to a string
                title: subjectTitle,
              };
            });
          setSubjectsList(subjects);
        } else {
          setSubjectsList([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjectsList([]);
      }
    }
    fetchSubjects();
  }, []);

  // Inside TeachersDashboard component
  const [selectedBoard, setSelectedBoard] = useState("");
  const [boardsList, setBoardsList] = useState<{ id: string; name: string }[]>(
    []
  );

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(true);

  // functions for table scrolling

  const updateScrollHints = () => {
    const container = tableContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftHint(scrollLeft > 10);
      setShowRightHint(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleTableScroll = () => {
    updateScrollHints();
  };

  const scrollTableHorizontally = (direction: "left" | "right") => {
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;

      container.scrollTo({
        left:
          direction === "left"
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });

      setTimeout(updateScrollHints, 300);
    }
  };

  // Fetch boards
  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch(`${api_startpoint}/api/boards`, {
          method: "POST",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setBoardsList(
            data.map((board) => ({
              id: board.id.toString(),
              name: board.name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    }
    fetchBoards();
  }, []);

  const [selectedSection, setSelectedSection] = useState("");
  const [sectionsList, setSectionsList] = useState<
    { id: number; name: string }[]
  >([]);
  //fetch Ative Sections
  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch(`${api_startpoint}/api/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 1 }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSectionsList(
            data.map((section) => ({
              id: section.id,
              name: section.name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    }
    fetchSections();
  }, []);

  const handleSearch = async () => {
    const filters = {
      state: selectedState,
      city: selectedCity,
      school_code:
        selectedSchoolCode.length > 0 ? selectedSchoolCode : undefined,
      is_life_lab: selectedLifeLab,
      school: selectedSchools,
      teacher_subject: selectedTeacherSubject, // Now sends subject ID      // New subject filter
      teacher_grade: selectedGradeFilter ? parseInt(selectedGradeFilter) : "", // New grade filter
      from_date: selectedFromDate, // Include the From Date filter
      to_date: selectedToDate, // Include the To Date filter
      board: selectedBoard,
    };

    setIsTableLoading(true);

    try {
      const res = await fetch(
        `${api_startpoint}/api/teacher_dashboard_search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        }
      );

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }

      const data = await res.json();

      // Debug the response
      console.log("API response:", data);

      // Check if data is an array or can be converted to one
      if (Array.isArray(data)) {
        setTableData(data);
      } else if (data && typeof data === "object") {
        // If it's an object with numeric keys, convert to array
        if (Object.keys(data).some((key) => !isNaN(Number(key)))) {
          const arrayData = Object.values(data);
          setTableData(arrayData);
        } else {
          console.error("API returned non-array data:", data);
          setTableData([]);
        }
      } else {
        console.error("API returned non-array data:", data);
        setTableData([]);
      }

      setCurrentPage(0); // Reset to first page on new search
    } catch (error) {
      console.error("Search error:", error);
      setTableData([]);
    } finally {
      setIsTableLoading(false);
    }
  };
  useEffect(() => {
    // Initial fetch to load the first page of data
    handleSearch();
  }, []);

  const paginatedData = tableData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleClear = () => {
    setSelectedState("");
    setSelectedCity("");
    setSelectedLifeLab("");
    setSelectedSchoolCode([]);
    // Clear other filters...
    setSelectedSchools("");
    setSelectedFromDate(""); // Clear the From Date
    setSelectedToDate(""); // Clear the To Date
    setSelectedTeacherSubject("");
    setSelectedGradeFilter("");
    setSelectedBoard("");
    setTableData([]);
  };

  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  useEffect(() => {
    async function fetchTeacherCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/teacher-count-dashboard`, {
          method: "POST",
        });
        const data = await res.json();
        if (data && data.length > 0) {
          setTotalTeachers(data[0].total_count);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchTeacherCount();
  }, []);

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
          `${api_startpoint}/api/demograph-teachers-dashboard`,
          {
            method: "POST",
          }
        );
        const apiData: DemographData[] = await apiResponse.json();

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
            text: "Teacher Distribution Across India",
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
              name: "Teacher Count",
              states: {
                hover: {
                  color: "#BADA55",
                },
              },
              dataLabels: {
                enabled: true,
                format: "{point.name}  {point.value}",
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

  // State for modals
  const [showDemographicsModal, setShowDemographicsModal] = useState(false);

  const [schoolCount, setSchoolCount] = useState<number>(0);
  useEffect(() => {
    async function fetchSchoolCount() {
      try {
        const res = await fetch(`${api_startpoint}/api/school_count_dashboard`, {
          method: "POST",
        });
        const data = await res.json();
        if (data && data.length > 0) {
          setSchoolCount(data[0].count);
        }
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    }
    fetchSchoolCount();
  }, []);

  const [teachersByGrade, setTeachersByGrade] = useState<TeachersByGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchTeachersByGrade = async () => {
      try {
        const response = await fetch(
          `${api_startpoint}/api/teachers-by-grade`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Teachers by grade");
        }
        const data: TeachersByGrade[] = await response.json();

        // Sort the data by grade, handling null last
        const sortedData = data.sort((a, b) => {
          if (a.grade === null) return 1;
          if (b.grade === null) return -1;
          return (a.grade as number) - (b.grade as number);
        });

        setTeachersByGrade(sortedData);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setIsLoading(false);
      }
    };

    fetchTeachersByGrade();
  }, []);

  const [showGradeModal, setShowGradeModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TeacherRow | null>(null); // or a more specific type if you have one

  // ...
  // ########################### EDIT AND DELETE ACTIONS ##################################
  // Handler for clicking "Edit"
  const handleEdit = (rowData: any) => {
    setSelectedRow(rowData);
    setShowEditModal(true);
  };

  useEffect(() => {
    // Only fire when we actually have an selectedRow with a state
    if (selectedRow?.state) {
      // reset any previously-selected city
      setSelectedRow((s: any) => ({ ...s, city: "" }));
      // fetch the new list
      fetchEditCities(selectedRow.state);
    }
  }, [selectedRow?.state]);

  // Handler for clicking "Delete"
  const handleDelete = (rowData: any) => {
    setSelectedRow(rowData);
    setShowDeleteModal(true);
  };

  // Handler for confirming delete
  const confirmDelete = async () => {
    if (!selectedRow) return;
    try {
      const res = await fetch(`${api_startpoint}/api/teacher_delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRow.id }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete teacher");
      }
      setShowDeleteModal(false);
      await handleSearch();
      setSelectedRow(null);
      // Optionally, refresh table data here.
    } catch (error) {
      console.error("Delete error:", error);
    }
  };
  const [isEditLoading, setIsEditLoading] = useState(false);
  // Handler for saving edited data
  const saveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsEditLoading(true);
      const res = await fetch(`${api_startpoint}/api/teacher_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRow),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update teacher");
      }
      await handleSearch();
      setShowEditModal(false);
      // Optionally, refresh the table data here.
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsEditLoading(false);
    }
  };

  // inside your modal component:
  const [schoolEditOptions, setSchoolEditOptions] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [isSchoolsEditLoading, setIsSchoolsEditLoading] = useState(false);

  useEffect(() => {
    // fetch only when modal opens
    async function loadSchools() {
      setIsSchoolsEditLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/new_school_list`, {
          method: "GET",
        });
        const data = await res.json();
        // expect data = [{ id, name, code }, …]
        setSchoolEditOptions(data);
      } catch (err) {
        console.error(err);
        setSchoolEditOptions([]);
      } finally {
        setIsSchoolsEditLoading(false);
      }
    }

    if (showEditModal) loadSchools();
  }, [showEditModal]);

  const [selectedEditBoard, setSelectedEditBoard] = useState("");
  const [editboardsList, setEditBoardsList] = useState<
    { id: string; name: string }[]
  >([]);

  // Fetch boards
  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch(`${api_startpoint}/api/boards`, {
          method: "POST",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setEditBoardsList(
            data.map((board) => ({
              id: board.id.toString(),
              name: board.name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    }
    if (showEditModal) fetchBoards();
  }, [showEditModal]);

  // New state for the detailed teacher distribution data
  const [detailedData, setDetailedData] = useState<any[]>([]);

  // Fetch the detailed breakdown from the new API endpoint
  useEffect(() => {
    const fetchDetailedData = async () => {
      try {
        const res = await fetch(
          `${api_startpoint}/api/teachers-by-grade-subject-section`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        setDetailedData(data);
      } catch (error) {
        console.error("Error fetching teacher grade-subject data:", error);
      }
    };
    fetchDetailedData();
  }, []);

  const [graphChartOptions, setGraphChartOptions] = useState<any>(null);

  interface DrilldownChartData {
    grade: number | string;
    subject: string;
    section: string;
    board: string;
    count: number;
  }

  type NestedStructure = Record<
    string,
    Record<
      string,
      {
        total: number;
        sections: Record<
          string,
          {
            total: number;
            boards: Record<string, number>;
          }
        >;
      }
    >
  >;

  // Suppose detailedData is fetched from your API endpoint.
  const TeachersDrilldownChart: React.FC<{
    detailedData: DrilldownChartData[];
  }> = ({ detailedData }) => {
    const [drillLevel, setDrillLevel] = useState(0); // 0=grade/subject, 1=sections, 2=boards
    const [nested, setNested] = useState<NestedStructure>({});
    const [mainOption, setMainOption] = useState<any>(null);
    // const [chartOption, setChartOption] = useState<any>(null);
    const [lastDrillInfo, setLastDrillInfo] = useState<any>(null);
    const [chartInstance, setChartInstance] = useState<any>(null);
    const [chartOption, setChartOption] = useState<any>({});
    const [isChartReady, setIsChartReady] = useState(false);
    // Build nested data & main chart
    useEffect(() => {
      if (!detailedData.length) return;
      const build: NestedStructure = {};
      detailedData.forEach(({ grade, subject, section, board, count }) => {
        const g = String(grade);
        build[g] = build[g] || {};
        build[g][subject] = build[g][subject] || { total: 0, sections: {} };
        build[g][subject].total += count;

        const secMap = build[g][subject].sections;
        secMap[section] = secMap[section] || { total: 0, boards: {} };
        secMap[section].total += count;
        secMap[section].boards[board] =
          (secMap[section].boards[board] || 0) + count;
      });
      setNested(build);

      // Prepare grade‑subject aggregate
      const grades = Object.keys(build).sort((a, b) => +a - +b);
      const subjects = Array.from(
        new Set(grades.flatMap((g) => Object.keys(build[g])))
      );

      const series = subjects.map((subj) => ({
        name: subj,
        type: "bar",
        label: { show: true, position: "top" },
        data: grades.map((g) => ({
          value: build[g][subj]?.total || 0,
          drillInfo: { grade: g, subject: subj },
        })),
      }));

      const option = {
        tooltip: { trigger: "axis" },
        legend: { data: subjects },
        xAxis: { type: "category", data: grades, name: "Grade" },
        yAxis: { type: "value", name: "Teacher Count" },
        series,
        graphic: {
          elements: [
            {
              type: "text",
              left: "center",
              bottom: 10,
              style: {
                text: "Note: Click on bars to drill down by Section",
                font: "14px sans-serif",
                fill: "#555",
              },
            },
          ],
        },
      };

      setMainOption(option);
      setChartOption(option);
      setIsChartReady(true); // Mark as ready after data processing
      setDrillLevel(0);
    }, [detailedData]);

    // Handle clicks to drill down
    const onChartClick = (params: any) => {
      const info = params.data?.drillInfo;
      if (!info) return;

      // === Level 0 → 1: show sections for (grade,subject)
      if (drillLevel === 0) {
        const { grade, subject } = info;
        const secsMap = nested[grade][subject].sections;
        const secs = Object.keys(secsMap);

        setChartOption({
          title: { text: `Grade ${grade} — ${subject}` },
          tooltip: { trigger: "axis" },
          xAxis: { type: "category", data: secs, name: "Section" },
          yAxis: { type: "value", name: "Teacher Count" },
          series: [
            {
              type: "bar",
              label: { show: true, position: "top" },
              data: secs.map((sec) => ({
                name: sec,
                value: secsMap[sec].total,
                drillInfo: { grade, subject, section: sec },
              })),
            },
          ],
          graphic: {
            elements: [
              {
                type: "text",
                left: "center",
                bottom: 10,
                style: {
                  text: "Note: Click on bars to drill down by Boards",
                  font: "14px sans-serif",
                  fill: "#555",
                },
              },
            ],
          },
        });
        setLastDrillInfo(info);
        setDrillLevel(1);
      }
      // === Level 1 → 2: show boards for (grade,subject,section)
      else if (drillLevel === 1) {
        const { grade, subject, section } = info;
        const boardsMap = nested[grade][subject].sections[section].boards;
        const boards = Object.keys(boardsMap);

        setChartOption({
          title: { text: `Grade ${grade} — ${subject} / ${section}` },
          tooltip: { trigger: "axis" },
          xAxis: { type: "category", data: boards, name: "Board" },
          yAxis: { type: "value", name: "Teacher Count" },
          series: [
            {
              type: "bar",
              label: { show: true, position: "top" },
              data: boards.map((b) => ({
                name: b,
                value: boardsMap[b],
              })),
            },
          ],
          graphic: {
            elements: [
              {
                type: "text",
                left: "center",
                bottom: 10,
                style: {
                  text: "Note: Use the Back button to return",
                  font: "14px sans-serif",
                  fill: "#555",
                },
              },
            ],
          },
        });
        setLastDrillInfo(info);
        setDrillLevel(2);
      }
    };

    // Download handler
    const handleDownload = () => {
      if (chartInstance) {
        const url = chartInstance.getDataURL({
          type: "png",
          pixelRatio: 2,
          backgroundColor: "#fff",
        });
        const link = document.createElement("a");
        link.href = url;
        link.download = "teachers-chart.png";
        link.click();
      }
    };
    // Back‑button logic
    const handleBack = () => {
      if (drillLevel === 2) {
        // back → sections
        const { grade, subject } = lastDrillInfo;
        const secsMap = nested[grade][subject].sections;
        const secs = Object.keys(secsMap);
        setChartOption({
          title: { text: `Grade ${grade} — ${subject}` },
          tooltip: { trigger: "axis" },
          xAxis: { type: "category", data: secs, name: "Section" },
          yAxis: { type: "value", name: "Teacher Count" },
          series: [
            {
              type: "bar",
              label: { show: true, position: "top" },
              data: secs.map((sec) => ({
                name: sec,
                value: secsMap[sec].total,
                drillInfo: { grade, subject, section: sec },
              })),
            },
          ],
          graphic: {
            elements: [
              {
                type: "text",
                left: "center",
                bottom: 10,
                style: {
                  text: "Note: Click on bars to drill down by Board",
                  font: "14px sans-serif",
                  fill: "#555",
                },
              },
            ],
          },
        });
        setDrillLevel(1);
      } else {
        // back → main
        setChartOption(mainOption);
        setDrillLevel(0);
      }
    };

    // const [isChartReady, setIsChartReady] = useState(false);

    // Add this useEffect to handle initial load
    useEffect(() => {
      if (chartOption && chartInstance) {
        setIsChartReady(true);
      }
    }, [chartOption, chartInstance]);

    // Modify the onChartReady handler
    const handleChartReady = (echartsInstance: any) => {
      setChartInstance(echartsInstance);
      setIsChartReady(true);
    };

    return (
      <div>
        <div className="d-flex gap-2 mb-3">
          {drillLevel > 0 && (
            <button className="btn btn-secondary" onClick={handleBack}>
              {drillLevel === 2 ? "← Back to Sections" : "← Back to Subjects"}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={!isChartReady}
          >
            Download PNG
          </button>
        </div>

        {/* {!isChartReady ? (
                <div className="text-center p-4">
                    <div className="spinner-border text-purple" role="status">
                        <span className="visually-hidden">Loading Chart...</span>
                    </div>
                </div>
            ) : ( */}
        <ReactECharts
          option={chartOption}
          onEvents={{ click: onChartClick }}
          style={{ height: 500, width: "100%" }}
          onChartReady={handleChartReady}
          shouldSetOption={(prevProps, nextProps) =>
            JSON.stringify(prevProps.option) !==
            JSON.stringify(nextProps.option)
          }
        />
        {/* )} */}
      </div>
    );
  };

  const [showGraphSectionModal, setShowGraphSectionModal] = useState(false);
  // Function to export tableData as CSV
  const exportToCSV = () => {
    if (tableData.length === 0) {
      alert("No data to export. Please perform a search first.");
      return;
    }
    // Get headers from the first row's keys
    const headers = Object.keys(tableData[0]);
    let csvContent = headers.join(",") + "\n";

    tableData.forEach((row) => {
      const rowData = headers.map((header) => {
        let cell = row[header];
        if (cell === null || cell === undefined) cell = "";
        cell = cell.toString().replace(/"/g, '""'); // Escape quotes
        return `"${cell}"`;
      });
      csvContent += rowData.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `teacher_data_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // For teacher subject/grade/section in the Add Teacher modal:
  // ----- Add Teacher Modal State & Handlers -----
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    mobile_no: "",
    // Instead of plain inputs, we reuse searchable dropdowns' values for state, city, school.
    state: "",
    city: "",
    school: "", // for school name, as fetched from schools array
    school_id: "",
    school_code: "",
    teacher_subject: "",
    teacher_grade: "",
    teacher_section: "",
    teacher_board: "",
  });
  const [addTeacherError, setAddTeacherError] = useState<string | null>(null);
  const [addingTeacher, setAddingTeacher] = useState(false);

  const handleTeacherFormChange = (field: string, value: string) => {
    setTeacherForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTeacher(true);
    setAddTeacherError(null);
    try {
      const res = await fetch(`${api_startpoint}/api/add_teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to add teacher");
      }
      setShowAddTeacherModal(false);
      await handleSearch();
      setTeacherForm({
        name: "",
        email: "",
        mobile_no: "",
        state: "",
        city: "",
        school: "",
        school_id: "",
        school_code: "",
        teacher_subject: "",
        teacher_grade: "",
        teacher_section: "",
        teacher_board: "",
      });
      // Optionally, refresh table data here.
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAddTeacherError(err.message);
      } else {
        setAddTeacherError("Unknown error occurred");
      }
    } finally {
      setAddingTeacher(false);
    }
  };

  useEffect(() => {
    if (teacherForm.state) {
      // clear out any previously selected city in the modal:
      setTeacherForm((s) => ({ ...s, city: "" }));
      fetchAddCities(teacherForm.state);
    }
  }, [teacherForm.state]);

  // inside your modal component:
  const [schoolAddOptions, setSchoolAddOptions] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [isSchoolsAddLoading, setIsSchoolsAddLoading] = useState(false);

  useEffect(() => {
    // fetch only when modal opens
    async function loadSchools() {
      setIsSchoolsAddLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/new_school_list`, {
          method: "GET",
        });
        const data = await res.json();
        // expect data = [{ id, name, code }, …]
        setSchoolAddOptions(data);
      } catch (err) {
        console.error(err);
        setSchoolAddOptions([]);
      } finally {
        setIsSchoolsAddLoading(false);
      }
    }

    if (showAddTeacherModal) loadSchools();
  }, [showAddTeacherModal]);

  const [selectedAddBoard, setSelectedAddBoard] = useState("");
  const [addboardsList, setAddBoardsList] = useState<
    { id: string; name: string }[]
  >([]);

  // Fetch boards
  useEffect(() => {
    async function fetchBoards() {
      try {
        const res = await fetch(`${api_startpoint}/api/boards`, {
          method: "POST",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setAddBoardsList(
            data.map((board) => ({
              id: board.id.toString(),
              name: board.name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    }
    if (showAddTeacherModal) fetchBoards();
  }, [showAddTeacherModal]);

  const [tmcAssignedByTeacher, setTmcAssignedByTeacher] = useState<number>(0);
  useEffect(() => {
    async function fetchTmcAssignedByTeacher() {
      try {
        const res = await fetch(
          `${api_startpoint}/api/total-missions-completed-assigned-by-teacher-dashboard`,
          {
            method: "POST",
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setTmcAssignedByTeacher(data[0].count);
        }
      } catch (error) {
        console.error(
          "Error fetching total-missions-completed-assigned-by-teacher-dashboard:",
          error
        );
      }
    }
    fetchTmcAssignedByTeacher();
  }, []);

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
  const [statsVision, setStatsVision] = useState<PeriodDataVision[]>([]);
  const [groupingVision, setGroupingVision] = useState("daily");
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [assignedBy, setAssignedBy] = useState<"all" | "teacher" | "self">(
    "teacher"
  );
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

  // Fetch stats whenever filters change
  useEffect(() => {
    setVisionLoading(true);
    const params = new URLSearchParams({
      grouping: groupingVision,
      assigned_by: assignedBy !== "all" ? assignedBy : undefined,
      subject_id: subjectId ? subjectId.toString() : undefined,
    } as any);

    fetch(`${api_startpoint}/api/vision-completion-stats?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setStatsVision(json.data);
        setVisionLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch vision stats:", err);
        setVisionLoading(false);
      });
  }, [groupingVision, subjectId, assignedBy]);

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

  const [
    teacherAssignedVisionCompletesRate,
    setTeacherAssignedVisionCompletesRate,
  ] = useState<number>(0);
  useEffect(() => {
    fetch(`${api_startpoint}/api/vision-teacher-completion-rate`)
      .then((res) => res.json())
      .then((json) => setTeacherAssignedVisionCompletesRate(json.percentage));
  }, []);

  //     const chartRef19 = useRef<reactEc_new | null>(null);
  //   const chartRef20 = useRef<reactEc_new | null>(null);
  //   // Fetch data when modal opens or when the selected level changes

  //     const handleDownloadChart = (
  //         chartRef: React.RefObject<reactEc_new | null>,
  //         filename: string
  //     ) => {
  //         if (chartRef.current) {
  //         const echartsInstance = chartRef.current.getEchartsInstance();
  //         const imgData = echartsInstance.getDataURL({
  //             type: 'png',
  //             pixelRatio: 2,
  //             backgroundColor: '#fff'
  //         });
  //         const link = document.createElement('a');
  //         link.href = imgData;
  //         link.download = filename;
  //         link.click();
  //         }
  //     };
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <div dangerouslySetInnerHTML={{ __html: tableStyles }} />
      <Sidebar />

      {/* Main Content */}
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            {/* Metrics Grid */}
            <div className="row g-4 mb-4">
              {[
                {
                  title: "Total Teachers",
                  value: totalTeachers,
                  icon: <IconUser />,
                  color: "bg-purple",
                },
                // {
                //   title: "Active Teachers",
                //   value: 0,
                //   icon: <IconUserFilled />,
                //   color: "bg-teal",
                // },
                // {
                //   title: "Inactive Teachers",
                //   value: 0,
                //   icon: <IconUserExclamation />,
                //   color: "bg-orange",
                // },
                // {
                //   title: "Highest Online User Count",
                //   value: 0,
                //   icon: <IconUserScan />,
                //   color: "bg-blue",
                //   suffix: "",
                // },
                {
                  title: "Total Number of Schools",
                  value: schoolCount,
                  icon: <IconUserScan />,
                  color: "bg-blue",
                  suffix: "",
                },
                {
                  title: "Total number of resources downloaded",
                  value: 165,
                  icon: <IconUserScan />,
                  color: "bg-blue",
                  suffix: "",
                },
                {
                  title: "Teacher Assign Mission Completes",
                  value: tmcAssignedByTeacher,
                  icon: <IconUserScan />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Teacher Assigned Vision Completes",
                  value: totalTeacherAssignedVisionCompletes,
                  icon: <IconUser />,
                  color: "bg-blue",
                  suffix: "",
                },
                {
                  title: "Total Vision Completes",
                  value: totalVisionSubmitted,
                  icon: <IconUser />,
                  color: "bg-sky-900",
                },
                {
                  title: "Total Vision Coins Earned",
                  value: totalVisionScore,
                  icon: <IconUser />,
                  color: "bg-sky-900",
                  suffix: "",
                },
                {
                  title: "Teacher Assigned Vision Completion Rate",
                  value: teacherAssignedVisionCompletesRate,
                  icon: <IconUser />,
                  color: "bg-sky-900",
                  suffix: "%",
                },
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
                              suffix={metric.suffix || ""}
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

            <div className="row g-4 mb-4">
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
                          View Teacher Demographics Map
                        </div>
                        <div className="text-muted">
                          Click to explore Teacher distribution across India
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                        <div className="subheader">View Teachers by Grade</div>
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
                onClick={() => setShowGraphSectionModal(true)}
              >
                <div className="card cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="bg-purple rounded-circle p-3 text-white me-3">
                        <IconSchool size={24} />
                      </div>
                      <div>
                        <div className="subheader">
                          View Teachers Graph Distribution{" "}
                        </div>
                        <div className="text-muted">
                          Click to expand detailed grade and section and subject
                          distribution
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
                          Click to see Teacher Assigned Vision Completes Over
                          Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="row g-4 mb-4">
                            
                        </div> */}

            {/* Demographics Map Modal */}
            {showDemographicsModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="modal-dialog modal-xl">
                  <div className="modal-content flex items-center">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Teacher Distribution Across India
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDemographicsModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
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
            {/* Grade Distribution Modal */}
            {showGradeModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Teachers by Grade Distribution
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
                          <p className="mt-2">Loading Teachers by grade...</p>
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
                                <th>Number of Teachers</th>
                                <th>Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teachersByGrade.map((gradeData, index) => (
                                <tr key={index}>
                                  <td>
                                    {gradeData.grade === null
                                      ? "Unspecified"
                                      : `Grade ${gradeData.grade}`}
                                  </td>
                                  <td>{gradeData.count.toLocaleString()}</td>
                                  <td>
                                    {(
                                      (gradeData.count / totalTeachers) *
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
                                    {totalTeachers.toLocaleString()}
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
            {/* Graph Section  Distribution Modal */}
            {showGraphSectionModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Teachers Graph Distribution
                      </h5>
                      <button
                        type="button"
                        className="btn btn-close"
                        onClick={() => setShowGraphSectionModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {!detailedData || detailedData.length === 0 ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-purple"
                            role="status"
                            style={{ width: "8rem", height: "8rem" }}
                          ></div>
                        </div>
                      ) : (
                        // <HighchartsReact
                        // highcharts={Highcharts}
                        // options={graphChartOptions}
                        // />
                        <TeachersDrilldownChart detailedData={detailedData} />
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowGraphSectionModal(false)}
                      >
                        Close
                      </button>
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
                        {/* Download button */}
                      </div>
                      <div style={{ marginBottom: "20px" }}>
                        <select
                          value={groupingVision}
                          onChange={(e) => setGroupingVision(e.target.value)}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>

                        <select
                          value={subjectId ?? ""}
                          onChange={(e) =>
                            setSubjectId(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        >
                          <option value="">All Subjects</option>
                          {subjectList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {JSON.parse(s.title).en}
                            </option>
                          ))}
                        </select>

                        <select
                          value={assignedBy}
                          onChange={(e) => setAssignedBy(e.target.value as any)}
                        >
                          <option value="all">All Assignments</option>
                          <option value="self">Self Assigned</option>
                          <option value="teacher">By Teacher</option>
                        </select>
                        {visionLoading ? (
                          <div className="text-center">
                            <div
                              className="spinner-border text-purple"
                              role="status"
                              style={{ width: "8rem", height: "8rem" }}
                            ></div>
                          </div>
                        ) : (
                          <ReactECharts
                            option={optionVision}
                            style={{ height: "400px", width: "100%" }}
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
                <h5 className="card-title mb-4">Teacher Search & Filter</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={states}
                      placeholder="Select State"
                      value={selectedState}
                      onChange={(val) => setSelectedState(val)}
                      isLoading={isStatesLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={cities}
                      placeholder="Select City"
                      value={selectedCity}
                      onChange={(val) => setSelectedCity(val)}
                      isLoading={isCitiesLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={schools}
                      placeholder="Select School"
                      value={selectedSchools}
                      onChange={(val) => setSelectedSchools(val)}
                      isLoading={isSchoolsLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedTeacherSubject}
                      onChange={(e) =>
                        setSelectedTeacherSubject(e.target.value)
                      }
                    >
                      <option value="">Select Subject</option>
                      {subjectsList.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedGradeFilter}
                      onChange={(e) => setSelectedGradeFilter(e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      {Array.from({ length: 12 }, (_, idx) => {
                        const grade = idx + 1;
                        return (
                          <option key={grade} value={grade}>
                            {`Grade ${grade}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-12 col-md-6 col-lg-4">
                    <div className="border rounded p-2 bg-white">
                      <input
                        type="text"
                        placeholder="Search With School code (comma separated)"
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

                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedLifeLab}
                      onChange={(e) => setSelectedLifeLab(e.target.value)}
                    >
                      <option value="">Life Lab User</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
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
                  {/* Add this  board select input with other filters */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedBoard}
                      onChange={(e) => setSelectedBoard(e.target.value)}
                    >
                      <option value="">Select Board</option>
                      {boardsList.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name}
                        </option>
                      ))}
                    </select>
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
                <div className="d-flex flex-wrap gap-2 mt-3">
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
                    onClick={() => setShowAddTeacherModal(true)}
                  >
                    <Plus className="me-2" size={16} />
                    Add Teacher
                  </button>

                  {/* <button className="btn btn-purple d-inline-flex align-items-center text-white" style={{ backgroundColor: '#6f42c1' }}>
                                        <BarChart3 className="me-2" size={16} />
                                        View Graph
                                    </button> */}
                </div>
              </div>
              {/* Paginated Results Table */}
              <div className="card shadow-sm border-0 mt-2">
                <div className="card-body overflow-x-scroll">
                  <h5 className="card-title mb-4">
                    Results- {tableData.length} Teachers found
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
                          No data to display. Please use the search filters
                          above and click Search.
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
                        className="overflow-x-scroll smooth-scroll rounded-lg shadow"
                        onScroll={handleTableScroll}
                        style={{ maxHeight: "70vh", overflowY: "auto" }}
                      >
                        <table className="table table-striped table-sticky-header w-full">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Mobile</th>
                              <th>City</th>
                              <th>State</th>
                              <th>School Name</th>
                              <th>School Code</th>
                              <th>Mission Assign Count</th>
                              <th>Vision Assign Count</th>
                              <th>Earn Coins</th>
                              <th>Is Life Lab</th>
                              <th>Created At</th>
                              <th>Updated At</th>
                              <th>Subject</th>
                              <th>Grade</th>
                              <th>Section</th>
                              <th>Board</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.map((row, index) => (
                              <tr key={index}>
                                <td>{row.id}</td>
                                <td>{row.name}</td>
                                <td>{row.email}</td>
                                <td>{row.mobile_no}</td>
                                <td>{row.city}</td>
                                <td>{row.state}</td>
                                <td>{row.school_name}</td>
                                <td>{row.school_code}</td>
                                <td>{row.mission_assigned_count}</td>
                                <td>{row.vision_assigned_count}</td>
                                <td>{row.earn_coins}</td>
                                <td>{row.is_life_lab}</td>
                                <td>{row.created_at}</td>
                                <td>{row.updated_at}</td>
                                <td>
                                  {JSON.parse(row.title || '{"en":""}')?.en}
                                </td>
                                <td>{row.grade_name}</td>
                                <td>{row.section_name}</td>
                                <td>{row.board_name}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary me-2 "
                                    onClick={() => handleEdit(row)}
                                  >
                                    <IconEdit size={16} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger "
                                    onClick={() => handleDelete(row)}
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
            </div>

            {/* Add Teacher Modal */}
            {showAddTeacherModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="modal-dialog modal-md">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Add Teacher</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowAddTeacherModal(false)}
                      ></button>
                    </div>
                    <form onSubmit={handleAddTeacher}>
                      <div className="modal-body">
                        {addTeacherError && (
                          <div className="alert alert-danger">
                            {addTeacherError}
                          </div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={teacherForm.name || teacherForm.name}
                            onChange={(e) =>
                              handleTeacherFormChange("name", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={teacherForm.email}
                            onChange={(e) =>
                              handleTeacherFormChange("email", e.target.value)
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mobile No</label>
                          <input
                            type="text"
                            className="form-control"
                            value={teacherForm.mobile_no}
                            onChange={(e) =>
                              handleTeacherFormChange(
                                "mobile_no",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                        {/* Reuse SearchableDropdown for State */}
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <SearchableDropdown
                            options={states}
                            placeholder="Select State"
                            value={teacherForm.state}
                            onChange={(val) =>
                              handleTeacherFormChange("state", val)
                            }
                            isLoading={isStatesLoading}
                            maxDisplayItems={200}
                          />
                        </div>
                        {/* Reuse SearchableDropdown for City */}
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <SearchableDropdown
                            options={addCities}
                            placeholder="Select City"
                            value={teacherForm.city}
                            onChange={(val) =>
                              handleTeacherFormChange("city", val)
                            }
                            isLoading={isAddCitiesLoading}
                            maxDisplayItems={200}
                          />
                        </div>
                        {/* Reuse SearchableDropdown for School */}
                        <div className="mb-3">
                          <label className="form-label">School</label>
                          <SearchableDropdown
                            options={schoolAddOptions.map((s) => s.name)}
                            placeholder="Select School"
                            value={teacherForm.school}
                            onChange={(val) => {
                              // handleTeacherFormChange("school", val);
                              // // If needed, you could also update school_id accordingly.
                              // handleTeacherFormChange("school_id", val);
                              const selectedName = val || "";
                              const found = schoolAddOptions.find(
                                (s) => s.name === selectedName
                              );
                              setTeacherForm((s) => ({
                                ...s,
                                school: selectedName,
                                school_id: found?.id ?? "",
                                school_code: found?.code ?? "",
                              }));
                            }}
                            isLoading={isSchoolsAddLoading}
                            maxDisplayItems={200}
                          />
                        </div>
                        <div className="d-flex flex-row gap-4 w-[90%] mb-3">
                          <input
                            name="school_id"
                            placeholder="School ID"
                            value={teacherForm.school_id ?? ""}
                            // onChange={e => handleNewChange('school_id', e.target.value)}
                            className="w-full border p-2 rounded"
                            disabled
                          />
                          <input
                            name="school_code"
                            placeholder="School Code"
                            value={teacherForm.school_code ?? ""}
                            // onChange={e => handleNewChange('school_code', e.target.value)}
                            className="w-full border p-2 rounded"
                            disabled
                          />
                        </div>
                        {/* New Fields: Teacher Subject, Grade, Section */}
                        <div className="mb-3">
                          <label className="form-label">Teacher Subject</label>
                          <select
                            className="form-select"
                            value={teacherForm.teacher_subject}
                            onChange={(e) =>
                              handleTeacherFormChange(
                                "teacher_subject",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value="">Select Subject</option>
                            {subjectsList.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Teacher Grade</label>
                          <select
                            className="form-select"
                            value={teacherForm.teacher_grade}
                            onChange={(e) =>
                              handleTeacherFormChange(
                                "teacher_grade",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value="">Select Grade</option>
                            {Array.from({ length: 12 }, (_, idx) => {
                              const grade = idx + 1;
                              return (
                                <option key={grade} value={grade}>
                                  {`Grade ${grade}`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Teacher Section</label>
                          <select
                            // type="text"
                            className="form-select"
                            // placeholder="Enter Section (e.g., A)"
                            value={teacherForm.teacher_section}
                            onChange={(e) =>
                              handleTeacherFormChange(
                                "teacher_section",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option key="">Select Section</option>
                            {sectionsList.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Teacher Board</label>
                          <select
                            className="form-select"
                            value={teacherForm.teacher_board}
                            onChange={(e) =>
                              handleTeacherFormChange(
                                "teacher_board",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select Board</option>
                            {addboardsList.map((board) => (
                              <option key={board.id} value={board.id}>
                                {board.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowAddTeacherModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={addingTeacher}
                        >
                          {addingTeacher ? "Adding..." : "Add Teacher"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {showEditModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="modal-dialog modal-md">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Teacher</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowEditModal(false)}
                      ></button>
                    </div>
                    <form onSubmit={saveEdits}>
                      <div className="modal-body">
                        {/* You may display error messages if any */}
                        {error && (
                          <div className="alert alert-danger">{error}</div>
                        )}
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={selectedRow?.name || ""}
                            onChange={(e) =>
                              setSelectedRow((prev) =>
                                prev ? { ...prev, name: e.target.value } : prev
                              )
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={selectedRow?.email || ""}
                            onChange={(e) =>
                              setSelectedRow((prev) =>
                                prev ? { ...prev, email: e.target.value } : prev
                              )
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mobile No</label>
                          <input
                            type="text"
                            className="form-control"
                            value={selectedRow?.mobile_no || ""}
                            onChange={(e) =>
                              setSelectedRow((prev) =>
                                prev
                                  ? { ...prev, mobile_no: e.target.value }
                                  : prev
                              )
                            }
                            required
                          />
                        </div>
                        {/* Reuse SearchableDropdown for State */}
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <SearchableDropdown
                            options={states}
                            placeholder="Select State"
                            value={selectedRow?.state || ""}
                            onChange={(val) =>
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev ? { ...prev, state: val } : prev
                              )
                            }
                            isLoading={isStatesLoading}
                            maxDisplayItems={200}
                          />
                        </div>
                        {/* Reuse SearchableDropdown for City */}
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <SearchableDropdown
                            options={editCities}
                            placeholder="Select City"
                            value={selectedRow?.city || ""}
                            onChange={(val) =>
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev ? { ...prev, city: val } : prev
                              )
                            }
                            isLoading={isEditCitiesLoading}
                            maxDisplayItems={200}
                          />
                        </div>
                        {/* Reuse SearchableDropdown for School */}
                        <div className="mb-3">
                          <label className="form-label">School</label>
                          <SearchableDropdown
                            options={schoolEditOptions.map((s) => s.name)}
                            placeholder="Select School"
                            value={selectedRow?.school || ""}
                            // onChange={(val) => {
                            // setSelectedRow(prev => ({ ...prev, school: val }));
                            // // Optionally update school_id if your data contains that
                            // setSelectedRow(prev => ({ ...prev, school_id: val }));
                            // }}
                            onChange={(val) => {
                              // setSelectedRow((prev: TeacherRow | null) =>
                              //   prev ? { ...prev, school: val } : prev
                              // );
                              // setSelectedRow((prev: TeacherRow | null) =>
                              //     prev ? { ...prev, school_id: val } : prev
                              //   );
                              const selectedName = val || "";
                              const found = schoolEditOptions.find(
                                (s) => s.name === selectedName
                              );
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev ? { ...prev, school: selectedName } : prev
                              );
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev ? { ...prev, school_id: found?.id } : prev
                              );
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev
                                  ? { ...prev, school_code: found?.code }
                                  : prev
                              );
                            }}
                            isLoading={isSchoolsEditLoading}
                            maxDisplayItems={200}
                          />
                        </div>
                        {/* Optional overrides */}
                        <div className="d-flex flex-row gap-2 mb-3">
                          <input
                            placeholder="School ID"
                            value={selectedRow?.school_id ?? ""}
                            // onChange={e => handleEditChange('school_id', e.target.value)}
                            className="w-full border p-2 rounded"
                            disabled
                          />
                          <input
                            placeholder="School Code"
                            value={selectedRow?.school_code ?? ""}
                            // onChange={e => handleEditChange('school_code', e.target.value)}
                            className="w-full border p-2 rounded"
                            disabled
                          />
                        </div>
                        {/* Extra Fields: Teacher Subject, Grade, Section */}
                        <div className="mb-3">
                          <label className="form-label">Teacher Subject</label>
                          <select
                            className="form-select"
                            value={selectedRow?.teacher_subject || ""}
                            onChange={(e) =>
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev
                                  ? {
                                      ...prev,
                                      teacher_subject: e.target.value,
                                    }
                                  : prev
                              )
                            }
                            required
                          >
                            <option value="">Select Subject</option>
                            {subjectsList.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Teacher Grade</label>
                          <select
                            className="form-select"
                            value={selectedRow?.teacher_grade || ""}
                            onChange={(e) =>
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev
                                  ? { ...prev, teacher_grade: e.target.value }
                                  : prev
                              )
                            }
                            required
                          >
                            <option value="">Select Grade</option>
                            {Array.from({ length: 12 }, (_, idx) => {
                              const grade = idx + 1;
                              return (
                                <option key={grade} value={grade}>
                                  {`Grade ${grade}`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Teacher Section</label>
                          <select
                            // type="text"
                            className="form-select"
                            // placeholder="Enter Section (e.g., A)"
                            value={selectedRow?.teacher_section || ""}
                            onChange={(e) =>
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev
                                  ? {
                                      ...prev,
                                      teacher_section: e.target.value,
                                    }
                                  : prev
                              )
                            }
                            required
                          >
                            <option key="">Select Section</option>
                            {sectionsList.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3">
                          <select
                            className="form-select"
                            value={selectedRow?.teacher_board || ""}
                            onChange={(e) =>
                              setSelectedRow((prev: TeacherRow | null) =>
                                prev
                                  ? { ...prev, teacher_board: e.target.value }
                                  : prev
                              )
                            }
                          >
                            <option value="">Select Board</option>
                            {editboardsList.map((board) => (
                              <option key={board.id} value={board.id}>
                                {board.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowEditModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isEditLoading}
                        >
                          {isEditLoading ? "Saving.." : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {showDeleteModal && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <div className="modal-dialog modal-md">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Delete Teacher</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this record?</p>
                      <p>
                        <strong>{selectedRow?.name}</strong>
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={confirmDelete}
                      >
                        Delete
                      </button>
                    </div>
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
