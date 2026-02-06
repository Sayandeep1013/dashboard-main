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
  IconSend,
  IconUser,
} from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
// --- Interfaces ---
interface User {
  id: number;
  school_id: number | null;
  name: string;
  guardian_name: string | null;
  email: string | null;
  username: string | null;
  mobile_no: string | null;
  type: number | null;
  dob: string | null;
  gender: string | null;
  grade: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  password: string | null;
  pin: string | null;
  earn_coins: number;
  heart_coins: number;
  brain_coins: number;
  profile_image: string | null;
  image_path: string | null;
  otp: string | null;
  remember_token: string | null;
  created_at: string;
  updated_at: string;
  device: string | null;
  device_token: string | null;
  la_board_id: number | null;
  la_section_id: number | null;
  la_grade_id: number | null;
  created_by: number | null;
  school_code: string | null;
  user_rank: number | null;
  board_name: string | null;
  school_name?: string;
}
interface PaginatedUsersResponse {
  users: User[];
  total_count: number;
  current_page: number;
  total_pages: number;
  items_per_page: number;
}
interface Coupon {
  id: number;
  title: string;
  status: number;
}
// --- Constants ---
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

// --- SearchableDropdown Component ---
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
// --- Main Component ---
export default function NotificationPage() {
  const [isClient, setIsClient] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
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
  const [selectedSchool, setSelectedSchool] = useState("");
  const [grades] = useState<string[]>(
    Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  );
  const [selectedGrade, setSelectedGrade] = useState("");
  const [userTypes] = useState<string[]>(["All Users", "Student", "Teacher"]);
  const [selectedUserType, setSelectedUserType] = useState("All Users");
  const [specificUserId, setSpecificUserId] = useState("");
  const [schoolCodeInput, setSchoolCodeInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  // --- New State for Uncheck All Button ---
  const [showUncheckAll, setShowUncheckAll] = useState(false);
  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const modalItemsPerPage = 5;
  // --- New States for Coupon Feature ---
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponsLoading, setIsCouponsLoading] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null); // Use null for "None"
  const [isCheckingRedemption, setIsCheckingRedemption] = useState(false); // New state for redemption check
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // State for error modal
  const [errorModalMessage, setErrorModalMessage] = useState(""); // Message for error modal
  const [errorModalUserNames, setErrorModalUserNames] = useState<string[]>([]); // User names for error modal
  // --- NEW STATE: Control Coupon Filtering ---
  const [showAllCoupons, setShowAllCoupons] = useState(false); // State to toggle full coupon list
  // --- Modal Pagination (for selected users list) ---
  const [modalSelectedUsers, setModalSelectedUsers] = useState<User[]>([]); // State for users fetched for modal
  const modalTotalPages = Math.ceil(
    modalSelectedUsers.length / modalItemsPerPage
  );
  const modalIndexOfLastItem = modalCurrentPage * modalItemsPerPage;
  const modalIndexOfFirstItem = modalIndexOfLastItem - modalItemsPerPage;
  const modalCurrentItems = modalSelectedUsers.slice(
    modalIndexOfFirstItem,
    modalIndexOfLastItem
  );
  // --- Fetch States ---
  useEffect(() => {
    async function fetchStates() {
      const cachedStates = sessionStorage.getItem("notification_stateList");
      if (cachedStates) {
        try {
          const parsed = JSON.parse(cachedStates);
          if (Array.isArray(parsed)) {
            setStates(parsed.filter((s) => s));
            return;
          }
        } catch (err) {
          console.error("Error parsing cached states:", err);
        }
      }
      setIsStatesLoading(true);
      try {
        const res = await fetch(
          `${api_startpoint}/api/notification_state_list_schools`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const stateList = data.filter((state) => state);
          setStates(stateList);
          sessionStorage.setItem(
            "notification_stateList",
            JSON.stringify(stateList)
          );
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
  // --- Fetch Cities ---
  const fetchCities = async (state: string) => {
    setIsCitiesLoading(true);
    try {
      const res = await fetch(
        `${api_startpoint}/api/notification_city_list_schools`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: state }),
        }
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      const cityList = Array.isArray(data) ? data.filter((city) => city) : [];
      setCities(cityList);
    } catch (error) {
      console.error("❌ Error fetching city list:", error);
      setCities([]);
    } finally {
      setIsCitiesLoading(false);
    }
  };
  useEffect(() => {
    setSelectedCity("");
    setSelectedSchool("");
    setSchools([]);
    if (selectedState) {
      fetchCities(selectedState);
    } else {
      fetchCities("");
    }
  }, [selectedState]);
  // --- Fetch Schools ---
  const fetchSchools = async (state: string, city: string) => {
    setIsSchoolsLoading(true);
    try {
      const res = await fetch(
        `${api_startpoint}/api/notification_school_list_by_location`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: state, city: city }),
        }
      );
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const processedSchools = data
          .filter((item: any) => typeof item === "string" && item.trim() !== "")
          .map((item: string) => item.trim());
        setSchools(processedSchools);
      } else {
        setSchools([]);
      }
    } catch (error) {
      console.error("Error fetching School list by location:", error);
      setSchools([]);
    } finally {
      setIsSchoolsLoading(false);
    }
  };
  useEffect(() => {
    setSelectedSchool("");
    if (selectedState || selectedCity) {
      fetchSchools(selectedState, selectedCity);
    } else {
      setSchools([]);
    }
  }, [selectedState, selectedCity]);
  // --- Fetch Coupons (Modified to support filtering) ---
  // This function now fetches either filtered or all active coupons based on state
  const fetchCoupons = useCallback(async () => {
    setIsCouponsLoading(true);
    try {
      let url;
      let body = null;
      let method = 'GET'; // Default method
      if (showAllCoupons) {
        // Fetch all active coupons
        url = `${api_startpoint}/api/notification_get_active_coupons`;
      } else {
        // Fetch filtered coupons (active, with 'Processing' redeems for selected users)
        // Pass selected user IDs to the backend
        url = `${api_startpoint}/api/notification_get_filtered_coupons`;
        method = 'POST';
        body = JSON.stringify({ user_ids: Array.from(selectedUserIds) });
      }
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        ...(body && { body }) // Include body only for POST request
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data: Coupon[] = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      setIsCouponsLoading(false);
    }
  }, [showAllCoupons, selectedUserIds]); // Re-run if filter state or selected users change
  // Fetch coupons when the modal opens or when filter state/user selection changes
  useEffect(() => {
    if (isModalOpen) { // Only fetch when modal is open
        fetchCoupons();
    }
  }, [isModalOpen, fetchCoupons]); // Depend on isModalOpen and the memoized fetchCoupons
  useEffect(() => {
    setIsClient(true);
    fetchUsers("", "", "", "", "", "All Users", "", "", 1, itemsPerPage);
  }, []);
  // --- Fetch Paginated Users ---
  const fetchUsers = async (
    query: string,
    state: string,
    city: string,
    school: string,
    grade: string,
    userType: string,
    specificUserId: string,
    schoolCode: string,
    page: number,
    perPage: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${api_startpoint}/api/notification_users_search_paginated`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            search: query,
            state: state,
            city: city,
            school_name: school,
            grade: grade,
            user_type: userType,
            specific_user_id: specificUserId,
            school_code: schoolCode,
            page: page,
            items_per_page: perPage,
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      const paginatedData: PaginatedUsersResponse = await response.json();
      setUsers(paginatedData.users);
      setTotalCount(paginatedData.total_count);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Fetch Users Error:", error);
      setError(errorMessage);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    setCurrentPage(1);
    // --- CHANGED: Do NOT clear selectedUserIds, selectAll, selectAllMatching on search ---
    // setSelectedUserIds(new Set());
    // setSelectAll(false);
    // setSelectAllMatching(false);
    fetchUsers(
      searchTerm,
      selectedState,
      selectedCity,
      selectedSchool,
      selectedGrade,
      selectedUserType,
      specificUserId,
      schoolCodeInput,
      1,
      itemsPerPage
    );
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedSchool("");
    setSelectedGrade("");
    setSelectedUserType("All Users");
    setSpecificUserId("");
    setSchoolCodeInput("");
    setCurrentPage(1);
    // --- CHANGED: Do NOT clear selectedUserIds, selectAll, selectAllMatching on clear filters ---
    // setSelectedUserIds(new Set());
    // setSelectAll(false);
    // setSelectAllMatching(false);
    fetchUsers("", "", "", "", "", "All Users", "", "", 1, itemsPerPage);
  };
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers(
      searchTerm,
      selectedState,
      selectedCity,
      selectedSchool,
      selectedGrade,
      selectedUserType,
      specificUserId,
      schoolCodeInput,
      newPage,
      itemsPerPage
    );
  };
  const handleCheckboxChange = (userId: number) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      const allDisplayedIds = currentItems.map((u) => u.id);
      const allSelected =
        allDisplayedIds.length > 0 &&
        allDisplayedIds.every((id) => newSet.has(id));
      setSelectAll(allSelected);
      if (newSet.has(userId)) {
        setSelectAllMatching(false);
      }
      return newSet;
    });
  };
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        currentItems.forEach((item) => newSet.delete(item.id));
        return newSet;
      });
    } else {
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        currentItems.forEach((item) => newSet.add(item.id));
        return newSet;
      });
    }
    setSelectAll(!selectAll);
    setSelectAllMatching(false);
  };
  const handleSelectAllMatchingChange = async () => {
    if (selectAllMatching) {
      // --- CHANGED: Only remove the IDs that match the current filter, not all selected IDs ---
      try {
        const response = await fetch(
          `${api_startpoint}/api/notification_users_search_ids`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              search: searchTerm,
              state: selectedState,
              city: selectedCity,
              school_name: selectedSchool,
              grade: selectedGrade,
              user_type: selectedUserType,
              specific_user_id: specificUserId,
              school_code: schoolCodeInput,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user IDs for unselecting");
        const userIdsToRemove: number[] = await response.json();
        
        setSelectedUserIds((prev) => {
          const newSet = new Set(prev);
          userIdsToRemove.forEach(id => newSet.delete(id));
          return newSet;
        });
        setSelectAll(false);
      } catch (err) {
        console.error("Error fetching user IDs to unselect:", err);
        alert("Could not unselect all matching users. Please try again.");
        return;
      }
    } else {
      try {
        const response = await fetch(
          `${api_startpoint}/api/notification_users_search_ids`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              search: searchTerm,
              state: selectedState,
              city: selectedCity,
              school_name: selectedSchool,
              grade: selectedGrade,
              user_type: selectedUserType,
              specific_user_id: specificUserId,
              school_code: schoolCodeInput,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user IDs");
        const userIdsToAdd: number[] = await response.json();
        
        // --- CHANGED: Merge fetched IDs with existing selection ---
        setSelectedUserIds((prev) => {
          const newSet = new Set(prev);
          userIdsToAdd.forEach(id => newSet.add(id));
          return newSet;
        });
        setSelectAll(false);
      } catch (err) {
        console.error("Error fetching all matching user IDs:", err);
        alert(
          "Could not select all users. Please try again or select manually."
        );
        return;
      }
    }
    setSelectAllMatching(!selectAllMatching);
  };
  // --- New Function: Fetch Users for Modal ---
  const fetchUsersForModal = async (userIds: number[]) => {
    try {
      const response = await fetch(
        `${api_startpoint}/api/notification_get_users_by_ids`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_ids: userIds }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      const usersData: User[] = await response.json();
      setModalSelectedUsers(usersData);
      setModalCurrentPage(1); // Reset modal pagination
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Fetch Users for Modal Error:", error);
      setSendError(`Error loading selected users: ${errorMessage}`);
      setModalSelectedUsers([]);
    }
  };
  const openNotificationModal = async () => {
    if (selectedUserIds.size === 0) {
      alert("Please select at least one user.");
      return;
    }
    setIsModalOpen(true);
    setSendError(null);
    // --- Reset coupon filter state when modal opens ---
    setShowAllCoupons(false); // Reset to filtered view on opening
    // --- Fetch full user details for the modal ---
    await fetchUsersForModal(Array.from(selectedUserIds));
    // Note: fetchCoupons is now triggered by the useEffect that watches isModalOpen and fetchCoupons
  };
  const closeNotificationModal = () => {
    setIsModalOpen(false);
    setNotificationTitle("");
    setNotificationMessage("");
    setSendError(null);
    setSelectedCouponId(null); // Reset coupon selection
    // --- Reset coupon filter state when modal closes ---
    setShowAllCoupons(false); // Reset to filtered view on closing
    // Clear modal user data
    setModalSelectedUsers([]);
    setModalCurrentPage(1);
  };

  // --- NEW FUNCTION: Uncheck All Users ---
  const handleUncheckAllUsers = () => {
    setSelectedUserIds(new Set());
    setSelectAll(false);
    setSelectAllMatching(false);
    // setShowUncheckAll will be updated by the useEffect below
  };

  // --- NEW USEEFFECT: Control visibility of Uncheck All button ---
  useEffect(() => {
    setShowUncheckAll(selectedUserIds.size > 0);
  }, [selectedUserIds]);

  // --- Modified: Check Coupon Redemption and Status ---
  const checkCouponRedemptionAndStatus = async () => {
    if (!selectedCouponId || selectedCouponId <= 0) {
      // If "None" is selected, proceed directly to sending
      handleSendNotification();
      return;
    }
    setIsCheckingRedemption(true);
    setSendError(null);
    try {
      const userIdsArray = Array.from(selectedUserIds);
      // --- Step 1: Check if coupon exists for users (Redemption Check) ---
      const redemptionResponse = await fetch(
        `${api_startpoint}/api/notification_check_coupon_redemption`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_ids: userIdsArray,
            coupon_id: selectedCouponId,
          }),
        }
      );
      const redemptionResult = await redemptionResponse.json();
      if (!redemptionResponse.ok) {
        // Handle error from backend (e.g., coupon not found)
        throw new Error(
          redemptionResult.error || `Redemption check failed: ${redemptionResponse.status}`
        );
      }
      if (redemptionResult.success === false) {
        // Redemption check failed - show error modal
        setErrorModalMessage(
          `"${redemptionResult.coupon_title}" hasn't been redeemed by:`
        );
        setErrorModalUserNames(redemptionResult.non_redeeming_users || []); // Expecting names from backend
        setIsErrorModalOpen(true);
        return; // Stop the process
      }
      // --- Step 2: If Redemption Check passes, check status (only if showAllCoupons is true) ---
      if (showAllCoupons) {
        const statusResponse = await fetch(
          `${api_startpoint}/api/notification_check_coupon_status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_ids: userIdsArray,
              coupon_id: selectedCouponId,
            }),
          }
        );
        const statusResult = await statusResponse.json();
        if (!statusResponse.ok) {
            // Handle unexpected error from backend
            throw new Error(statusResult.error || `Status check failed: ${statusResponse.status}`);
        }
        if (statusResult.success === false) {
            // Status check failed - show error modal for wrong status
            setErrorModalMessage(
              `"${statusResult.coupon_title}" has already been processed for:`
            );
            // Assuming backend returns an array of strings like "UserName - Status"
            setErrorModalUserNames(statusResult.wrong_status_users || []);
            setIsErrorModalOpen(true);
            return; // Stop the process
        }
        // If status check passes, proceed to send notification
      }
      // If all checks pass (or if showAllCoupons is false and redemption check passes), proceed to send
      handleSendNotification();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during the checks.";
      console.error("Coupon Checks Error:", error);
      setSendError(`Checks Error: ${errorMessage}`);
    } finally {
      setIsCheckingRedemption(false);
    }
  };
  // --- Modified: Handle Send Notification (now called by checkCouponRedemptionAndStatus) ---
  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      setSendError("Please enter both title and message.");
      return;
    }
    setIsSending(true);
    setSendError(null);
    try {
      const userIdsArray = Array.from(selectedUserIds);
      const payload: {
        user_ids: number[];
        title: string;
        message: string;
        coupon_id?: number;
      } = {
        user_ids: userIdsArray,
        title: notificationTitle,
        message: notificationMessage,
      };
      // Include coupon_id if a valid one is selected
      if (selectedCouponId && selectedCouponId > 0) {
        payload.coupon_id = selectedCouponId;
      }
      const response = await fetch(`${api_startpoint}/api/notification_send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to send notification: ${response.status} ${response.statusText}`
        );
      }
      const result = await response.json();
      console.log("Notification sent successfully:", result);
      alert("Notification sent successfully!");
      closeNotificationModal();
      // --- CHANGED: Clear selection after sending ---
      setSelectedUserIds(new Set());
      setSelectAll(false);
      setSelectAllMatching(false);
      // setShowUncheckAll will be updated by the useEffect
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while sending the notification.";
      console.error("Send Notification Error:", error);
      setSendError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };
  // --- Pagination calculations ---
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentItems = users;
  // --- Pagination Controls Component ---
  const PaginationControls = ({
    currentPage,
    totalPages,
    setCurrentPage,
    itemsPerPage,
    totalItems,
  }: {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
  }) => (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div className="text-muted">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
        entries
      </div>
      <div className="d-flex gap-2 align-items-center">
        <select
          className="form-select form-select-sm"
          value={itemsPerPage}
          onChange={(e) => {
            const newItemsPerPage = Number(e.target.value);
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
            fetchUsers(
              searchTerm,
              selectedState,
              selectedCity,
              selectedSchool,
              selectedGrade,
              selectedUserType,
              specificUserId,
              schoolCodeInput,
              1,
              newItemsPerPage
            );
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
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
  useEffect(() => {
    if (currentItems.length === 0) {
      setSelectAll(false);
      return;
    }
    const allItemsOnPageSelected = currentItems.every((item) =>
      selectedUserIds.has(item.id)
    );
    setSelectAll(allItemsOnPageSelected);
  }, [currentItems, selectedUserIds]);
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
                <h3 className="card-title">Send Notifications</h3>
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
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Send Notifications</h3>
              </div>
              <div className="card-body">
                <div className="d-flex mb-3 gap-3 flex-wrap">
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedUserType}
                      onChange={(e) => setSelectedUserType(e.target.value)}
                    >
                      <option value="All Users">All Users</option>
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                  {/* <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Specific User ID"
                      value={specificUserId}
                      onChange={(e) => setSpecificUserId(e.target.value)}
                    />
                  </div> */}
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
                      value={selectedSchool}
                      onChange={(val) => setSelectedSchool(val)}
                      isLoading={isSchoolsLoading}
                      maxDisplayItems={200}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter School Code"
                      value={schoolCodeInput}
                      onChange={(e) => setSchoolCodeInput(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="input-group gap-3 h-full">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search User Name"
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
                  </div>
                </div>
                {totalCount > 0 && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      {selectedUserIds.size > 0 && (
                        <span className="text-muted small">
                          {selectedUserIds.size} user(s) selected.
                          {selectAllMatching &&
                            ` (${totalCount} matching users selected)`}
                        </span>
                      )}
                    </div>
                    <div>
                      {/* --- NEW: Uncheck All Users Button --- */}
                      {showUncheckAll && (
                        <button
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={handleUncheckAllUsers}
                        >
                          Uncheck All Users
                        </button>
                      )}
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllMatchingCheckbox"
                          checked={selectAllMatching}
                          onChange={handleSelectAllMatchingChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="selectAllMatchingCheckbox"
                        >
                          Select All Matching ({totalCount})
                        </label>
                      </div>
                      {selectedUserIds.size > 0 && (
                        <button
                          className="btn btn-success ms-2"
                          onClick={openNotificationModal}
                        >
                          <IconSend size={18} className="me-1" /> Send
                          Notification
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    Error loading users: {error}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-vcenter table-hover">
                      <thead>
                        <tr>
                          <th style={{ width: "1%" }}>
                            <input
                              className="form-check-input m-0 align-middle"
                              type="checkbox"
                              aria-label="Select all on this page"
                              checked={selectAll}
                              onChange={handleSelectAllChange}
                            />
                          </th>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Mobile</th>
                          <th>Type</th>
                          <th>Grade</th>
                          <th>School</th>
                          <th>School Code</th>
                          <th>City</th>
                          <th>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="text-center">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((user) => (
                            <tr key={user.id}>
                              <td>
                                <input
                                  className="form-check-input m-0 align-middle"
                                  type="checkbox"
                                  aria-label={`Select user ${user.name}`}
                                  checked={selectedUserIds.has(user.id)}
                                  onChange={() => handleCheckboxChange(user.id)}
                                />
                              </td>
                              <td>{user.id}</td>
                              <td>{user.name}</td>
                              <td>{user.username || "-"}</td>
                              <td>{user.mobile_no || "-"}</td>
                              <td>
                                {user.type === 3
                                  ? "Student"
                                  : user.type === 5
                                  ? "Teacher"
                                  : "Other"}
                              </td>
                              <td>{user.grade || "-"}</td>
                              <td>
                                {user.school_name || user.school_id || "-"}
                              </td>
                              <td>{user.school_code || "-"}</td>
                              <td>{user.city || "-"}</td>
                              <td>{user.state || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {!loading && !error && totalCount > 0 && (
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalCount}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* --- Main Notification Modal --- */}
      {isModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex={-1}
          aria-labelledby="notificationModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="notificationModalLabel">
                  Confirm Notification
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeNotificationModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="notificationTitle" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="notificationTitle"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Enter notification title"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="notificationMessage" className="form-label">
                    Message
                  </label>
                  <textarea
                    className="form-control"
                    id="notificationMessage"
                    rows={5}
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter notification message"
                  ></textarea>
                </div>
                {/* --- Modified Coupon Dropdown --- */}
                <div className="mb-3">
                  <label htmlFor="couponSelect" className="form-label">
                    Select Coupon (Optional)
                  </label>
                  <select
                    id="couponSelect"
                    className="form-select"
                    value={selectedCouponId || ""} // Use empty string for "None"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "SHOW_ALL") {
                        // Handle the "See Full List" option
                        setShowAllCoupons(true);
                        // fetchCoupons will be triggered by the useEffect
                      } else {
                        // Handle normal coupon selection
                        setSelectedCouponId(
                          value ? Number(value) : null
                        );
                      }
                    }}
                    disabled={
                      isCouponsLoading || isCheckingRedemption || isSending
                    } // Disable during loading/checking/sending
                  >
                    <option value="">None</option>
                    {isCouponsLoading ? (
                      <option value="" disabled>
                        Loading coupons...
                      </option>
                    ) : (
                      <>
                        {/* Map over the fetched coupons */}
                        {coupons.map((coupon) => (
                          <option key={coupon.id} value={coupon.id}>
                            {coupon.title}
                          </option>
                        ))}
                        {/* Conditionally render the "See Full List" option */}
                        {/* Only show it if we are currently showing the filtered list */}
                        {!showAllCoupons && (
                          <option value="SHOW_ALL">[ See the full coupons list ]</option>
                        )}
                      </>
                    )}
                  </select>
                </div>
                <div className="mb-3">
                  <h6>Selected Users ({selectedUserIds.size}):</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalCurrentItems.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="text-center">
                              No users selected
                            </td>
                          </tr>
                        ) : (
                          modalCurrentItems.map((user) => (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.name}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {modalSelectedUsers.length > modalItemsPerPage && (
                      <PaginationControls
                        currentPage={modalCurrentPage}
                        totalPages={modalTotalPages}
                        setCurrentPage={setModalCurrentPage}
                        itemsPerPage={modalItemsPerPage}
                        totalItems={modalSelectedUsers.length}
                      />
                    )}
                  </div>
                </div>
                {sendError && (
                  <div className="alert alert-danger" role="alert">
                    {sendError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeNotificationModal}
                  disabled={isCheckingRedemption || isSending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={checkCouponRedemptionAndStatus} // Use the new combined check function
                  disabled={isCheckingRedemption || isSending}
                >
                  {isCheckingRedemption || isSending ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {isCheckingRedemption ? "Checking..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      <IconSend size={18} className="me-1" /> Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && <div className="modal-backdrop fade show"></div>}
      {/* --- Error Modal (Coupon Check Failed - Redemption or Status) --- */}
      {isErrorModalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", zIndex: 1060 }} // Ensure it's above the main modal
          tabIndex={-1}
          aria-labelledby="errorModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title" id="errorModalLabel">
                  Check Failed
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsErrorModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>{errorModalMessage}</p>
                {errorModalUserNames.length > 0 && (
                  <ul>
                    {errorModalUserNames.map((name, index) => (
                      <li key={index}>
                        <strong>{name}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsErrorModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isErrorModalOpen && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1055 }}
        ></div>
      )}{" "}
      {/* Backdrop for error modal */}
    </div>
  );
}
