"use client";
import "@tabler/core/dist/css/tabler.min.css";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import React from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Sidebar } from "@/components/ui/sidebar";
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconDownload,
  IconX,
} from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";

interface CouponRedemption {
  "Student Name": string;
  "School Name": string;
  "Mobile Number": string;
  state: string;
  city: string;
  cluster: string | null;
  block: string | null;
  district: string | null;
  grade: string | number;
  "Coupon Title": string;
  "Coins Redeemed": number;
  "School Code": string;
  user_id: number;
  "Coupon Redeemed Date": string;
}

// const api_startpoint = "http://localhost:5000";
const api_startpoint = "http://152.42.239.141:5000";

function SearchableDropdown({
  options,
  placeholder,
  value,
  onChange,
  isLoading = false,
  maxDisplayItems = 100,
}: {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  maxDisplayItems?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [displayedItems, setDisplayedItems] = useState(maxDisplayItems);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDisplayedItems(maxDisplayItems);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, maxDisplayItems]);

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

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const scrollPosition = scrollTop + clientHeight;

    if (
      scrollHeight - scrollPosition < 50 &&
      displayedItems < filteredOptions.length
    ) {
      setDisplayedItems((prev) =>
        Math.min(prev + maxDisplayItems, filteredOptions.length)
      );
    }
  }, [displayedItems, filteredOptions.length, maxDisplayItems]);

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

  const visibleOptions = useMemo(() => {
    return filteredOptions.slice(0, displayedItems);
  }, [filteredOptions, displayedItems]);

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

                {hasMoreItems && (
                  <div className="flex items-center justify-center px-3 py-2 text-gray-500 border-t border-gray-100 bg-gray-50">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-500"></div>
                    <span>
                      Loading more... ({visibleOptions.length} of{" "}
                      {filteredOptions.length})
                    </span>
                  </div>
                )}

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

export default function CouponsRedeemed() {
  const [isClient, setIsClient] = useState(false);
  const [coupons, setCoupons] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [states, setStates] = useState<string[]>([]);
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState("");
  const [clusters, setClusters] = useState<string[]>([]);
  const [isClustersLoading, setIsClustersLoading] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState("");
  const [blocks, setBlocks] = useState<string[]>([]);
  const [isBlocksLoading, setIsBlocksLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [grades] = useState<string[]>(
    Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  );
  const [selectedGrade, setSelectedGrade] = useState("");
  const [couponTitles, setCouponTitles] = useState<string[]>([]);
  const [isCouponTitlesLoading, setIsCouponTitlesLoading] = useState(false);
  const [selectedCouponTitle, setSelectedCouponTitle] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [schoolCodeInput, setSchoolCodeInput] = useState("");

  // Fetch states
  useEffect(() => {
    async function fetchStates() {
      const cachedStates = sessionStorage.getItem("stateList");
      if (cachedStates) {
        setStates(JSON.parse(cachedStates));
        return;
      }

      setIsStatesLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/state_list_schools`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const stateList = data.filter((state) => state);
          setStates(stateList);
          sessionStorage.setItem("stateList", JSON.stringify(stateList));
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

  // Fetch cities
  const fetchCities = async (state: string) => {
    setIsCitiesLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/city_list_schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: state }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setCities(data || []);
    } catch (error) {
      console.error("❌ Error fetching city list:", error);
      setCities([]);
    } finally {
      setIsCitiesLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCity("");
    fetchCities(selectedState);
  }, [selectedState]);

  // Initial city load
  useEffect(() => {
    fetchCities("");
  }, []);

  // Fetch schools
  useEffect(() => {
    async function fetchSchools() {
      const cachedSchools = sessionStorage.getItem("SchoolList");
      if (cachedSchools) {
        try {
          const parsed = JSON.parse(cachedSchools);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSchools(parsed);
            return;
          }
        } catch (err) {
          console.error("Error parsing cached schools:", err);
        }
      }

      setIsSchoolsLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/school_list`);
        const data: { name: string }[] = await res.json();

        if (Array.isArray(data)) {
          let allProcessedSchools: string[] = [];
          const processSchoolsBatch = (
            startIndex: number,
            batchSize: number
          ): void => {
            const endIndex = Math.min(startIndex + batchSize, data.length);
            const batch = data
              .slice(startIndex, endIndex)
              .map((item) => (item.name ? item.name.trim() : ""))
              .filter((name) => name !== "");

            allProcessedSchools = [...allProcessedSchools, ...batch];
            setSchools(allProcessedSchools);

            if (endIndex < data.length) {
              setTimeout(() => processSchoolsBatch(endIndex, batchSize), 0);
            } else {
              sessionStorage.setItem(
                "SchoolList",
                JSON.stringify(allProcessedSchools)
              );
              setIsSchoolsLoading(false);
            }
          };
          processSchoolsBatch(0, 100);
        } else {
          setSchools([]);
          setIsSchoolsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching School list:", error);
        setSchools([]);
        setIsSchoolsLoading(false);
      }
    }

    fetchSchools();
  }, []);

  // Fetch clusters
  useEffect(() => {
    async function fetchClusters() {
      const cachedClusters = sessionStorage.getItem("ClusterList");
      if (cachedClusters) {
        setClusters(JSON.parse(cachedClusters));
        return;
      }

      setIsClustersLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/school_clusters`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const clusterList = data.filter((cluster) => cluster);
          setClusters(clusterList);
          sessionStorage.setItem("ClusterList", JSON.stringify(clusterList));
        }
      } catch (error) {
        console.error("Error fetching clusters:", error);
      } finally {
        setIsClustersLoading(false);
      }
    }
    fetchClusters();
  }, []);

  // Fetch blocks
  useEffect(() => {
    async function fetchBlocks() {
      const cachedBlocks = sessionStorage.getItem("BlockList");
      if (cachedBlocks) {
        setBlocks(JSON.parse(cachedBlocks));
        return;
      }

      setIsBlocksLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/school_blocks`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const blockList = data.filter((block) => block);
          setBlocks(blockList);
          sessionStorage.setItem("BlockList", JSON.stringify(blockList));
        }
      } catch (error) {
        console.error("Error fetching blocks:", error);
      } finally {
        setIsBlocksLoading(false);
      }
    }
    fetchBlocks();
  }, []);

  // Fetch districts
  useEffect(() => {
    async function fetchDistricts() {
      const cachedDistricts = sessionStorage.getItem("DistrictList");
      if (cachedDistricts) {
        setDistricts(JSON.parse(cachedDistricts));
        return;
      }

      setIsDistrictsLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/school_districts`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const districtList = data.filter((district) => district);
          setDistricts(districtList);
          sessionStorage.setItem("DistrictList", JSON.stringify(districtList));
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setIsDistrictsLoading(false);
      }
    }
    fetchDistricts();
  }, []);

  // Fetch coupon titles
  useEffect(() => {
    async function fetchCouponTitles() {
      const cachedTitles = sessionStorage.getItem("couponTitles");
      if (cachedTitles) {
        setCouponTitles(JSON.parse(cachedTitles));
        return;
      }

      setIsCouponTitlesLoading(true);
      try {
        const response = await fetch(`${api_startpoint}/api/coupon_titles`);
        if (!response.ok) throw new Error("Failed to fetch coupon titles");
        const titles = await response.json();
        setCouponTitles(titles);
        sessionStorage.setItem("couponTitles", JSON.stringify(titles));
      } catch (error) {
        console.error("Error fetching coupon titles:", error);
      } finally {
        setIsCouponTitlesLoading(false);
      }
    }
    fetchCouponTitles();
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchCoupons("", "", "", "", "", "", "", "", "", "", "", "", "");
  }, []);

  const fetchCoupons = async (
    query: string,
    state: string,
    mobile: string,
    city: string,
    school: string,
    grade: string,
    couponTitle: string,
    startDate: string,
    endDate: string,
    schoolCode: string,
    cluster: string,
    block: string,
    district: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${api_startpoint}/api/coupon_redeem_search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            search: query,
            mobile: mobile,
            state: state,
            city: city,
            school: school,
            grade: grade,
            coupon_title: couponTitle,
            start_date: startDate,
            end_date: endDate,
            school_code: schoolCode,
            cluster: cluster,
            block: block,
            district: district,
          }),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      const tableData = await response.json();
      setCoupons(tableData as CouponRedemption[]);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCoupons(
      searchTerm,
      selectedState,
      searchMobile,
      selectedCity,
      selectedSchools,
      selectedGrade,
      selectedCouponTitle,
      startDate,
      endDate,
      schoolCodeInput,
      selectedCluster,
      selectedBlock,
      selectedDistrict
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedSchools("");
    setSelectedCluster("");
    setSelectedBlock("");
    setSelectedDistrict("");
    setSelectedGrade("");
    setSelectedCouponTitle("");
    setSearchMobile("");
    setStartDate("");
    setEndDate("");
    setSchoolCodeInput("");
    fetchCoupons("", "", "", "", "", "", "", "", "", "", "", "", "");
  };

  const exportToCSV = () => {
    const headers = [
      "S.No.", // Added serial number header
      "Student Name",
      "School Name",
      "Mobile Number",
      "State",
      "City",
      "Cluster",
      "Block",
      "District",
      "Grade",
      "Coupon Title",
      "Coins Redeemed",
      "Status",
      "School Code",
      "User ID",
      "Coupon Redeemed Date",
    ];
    const csvRows = [headers.join(",")];
    coupons.forEach((coupon, index) => {
      const row = [
        index + 1, // Serial number
        coupon["Student Name"] || "",
        coupon["School Name"] || "",
        coupon["Mobile Number"] || "",
        coupon.state || "",
        coupon.city || "",
        coupon.cluster || "",
        coupon.block || "",
        coupon.district || "",
        coupon.grade || "",
        coupon["Coupon Title"] || "",
        coupon["Coins Redeemed"] || "",
        (coupon as any).status || "",
        coupon["School Code"] || "",
        coupon.user_id,
        coupon["Coupon Redeemed Date"] || "",
      ];
      csvRows.push(row.join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_coupon_redemptions.csv";
    link.click();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    } catch (e) {
      return "";
    }
  };

  if (!isClient) {
    return (
      <div className={`page bg-light ${inter.className} font-sans`}>
        <Sidebar />
        <div className="page-wrapper" style={{ marginLeft: "250px" }}>
          <header className="navbar navbar-expand-md navbar-light bg-white shadow-sm border-bottom mb-3">
            <div className="container-fluid">
              <div className="d-flex align-items-center w-full">
                <span className="font-bold text-xl text-black">
                  LifeAppDashboard
                </span>
              </div>
            </div>
          </header>
          <div className="container-xl pt-0 pb-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Coupon Redemptions</h3>
              </div>
              <div className="card-body">
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pagination controls
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = coupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  const PaginationControls = () => (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div className="text-muted">
        Showing {indexOfFirstItem + 1} to{" "}
        {Math.min(indexOfLastItem, coupons.length)} of {coupons.length} entries
      </div>

      <div className="d-flex gap-2 align-items-center">
        <select
          className="form-select form-select-sm"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>

        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="w-1/3 p-0">
          <span className="p-0 d-flex">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Student Coupon Redemptions</h3>
              </div>
              <div className="card-body">
                <div className="d-flex mb-3 gap-3 flex-wrap">
                  {/* State Filter */}
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

                  {/* City Filter */}
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

                  {/* School Filter */}
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

                  {/* School Code Filter */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter School Code"
                      value={schoolCodeInput}
                      onChange={(e) => setSchoolCodeInput(e.target.value)}
                    />
                  </div>

                  {/* Cluster Filter */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={clusters}
                      placeholder="Select Cluster"
                      value={selectedCluster}
                      onChange={(val) => setSelectedCluster(val)}
                      isLoading={isClustersLoading}
                      maxDisplayItems={200}
                    />
                  </div>

                  {/* Block Filter */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={blocks}
                      placeholder="Select Block"
                      value={selectedBlock}
                      onChange={(val) => setSelectedBlock(val)}
                      isLoading={isBlocksLoading}
                      maxDisplayItems={200}
                    />
                  </div>

                  {/* District Filter */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={districts}
                      placeholder="Select District"
                      value={selectedDistrict}
                      onChange={(val) => setSelectedDistrict(val)}
                      isLoading={isDistrictsLoading}
                      maxDisplayItems={200}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="input-group gap-3 h-full">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Student Name"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={grades}
                      placeholder="Select Grade"
                      value={selectedGrade}
                      onChange={(val) => setSelectedGrade(val)}
                      maxDisplayItems={12}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <SearchableDropdown
                      options={couponTitles}
                      placeholder="Select Coupon Title"
                      value={selectedCouponTitle}
                      onChange={(val) => setSelectedCouponTitle(val)}
                      isLoading={isCouponTitlesLoading}
                      maxDisplayItems={200}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="input-group gap-3 h-full">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Mobile No..."
                        value={searchMobile}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          setSearchMobile(sanitized);
                        }}
                        pattern="[0-9]*"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || undefined}
                    />
                  </div>

                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                    />
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-primary rounded-sm"
                      onClick={handleSearch}
                    >
                      <IconSearch size={18} className="me-1" /> Search
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleClearFilters}
                    >
                      <IconX size={18} className="me-1" /> Clear
                    </button>
                    <button className="btn btn-primary" onClick={exportToCSV}>
                      <IconDownload size={18} className="me-1" /> Export
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    Error loading data: {error}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-vcenter table-hover">
                      <thead>
                        <tr>
                          {/* Added serial number column header */}
                          <th className="text-center">S.No.</th>
                          <th>Student Name</th>
                          <th>School Name</th>
                          <th>Mobile Number</th>
                          <th>State</th>
                          <th>City</th>
                          <th>Cluster</th>
                          <th>Block</th>
                          <th>District</th>
                          <th>Grade</th>
                          <th>Coupon Title</th>
                          <th>Coins Redeemed</th>
                          <th>Status</th>
                          <th>School Code</th>
                          <th>User ID</th>
                          <th>Redeemed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr>
                            {/* Updated colspan to 15 for new column */}
                            <td colSpan={15} className="text-center">
                              No redemptions found
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((coupon, index) => (
                            <tr key={index}>
                              {/* Added serial number cell */}
                              <td className="text-center">
                                {indexOfFirstItem + index + 1}
                              </td>
                              <td>{coupon["Student Name"]}</td>
                              <td>{coupon["School Name"]}</td>
                              <td>{coupon["Mobile Number"]}</td>
                              <td>{coupon.state}</td>
                              <td>{coupon.city}</td>
                              <td>{coupon.cluster || "-"}</td>
                              <td>{coupon.block || "-"}</td>
                              <td>{coupon.district || "-"}</td>
                              <td>{coupon.grade}</td>
                              <td>{coupon["Coupon Title"]}</td>
                              <td>{coupon["Coins Redeemed"]}</td>
                              <td>{(coupon as any).status || "-"}</td>
                              <td>{coupon["School Code"]}</td>
                              <td>{coupon.user_id}</td>
                              <td>
                                {formatDate(coupon["Coupon Redeemed Date"])}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {!loading && !error && coupons.length > 0 && (
                      <PaginationControls />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
