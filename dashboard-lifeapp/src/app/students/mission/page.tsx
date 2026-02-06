"use client";
import "@tabler/core/dist/css/tabler.min.css";
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from "react";
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
  IconCircleCheck,
  IconCircleX,
  IconChevronLeft,
  IconChevronRight,
  IconEye, // Added for the button
  IconFileDescription, // Added for modal header
} from "@tabler/icons-react";
import {
  BarChart3,
  ChevronDown,
  Download,
  Plus,
  Search,
  XCircle,
} from "lucide-react";

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

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
    /* Feedback modal styles */
    .feedback-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6); /* Slightly darker backdrop */
      backdrop-filter: blur(2px);   /* Slight blur for modern feel */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1060;
    }
    .feedback-modal-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      width: 90%;
      max-width: 500px;
    }
    .feedback-textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      font-family: inherit;
    }
    .feedback-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    /* Modern Mission Details Modal Styles */
    .modern-modal-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.2);
      border: 1px solid rgba(0,0,0,0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 85vh;
    }

    .modern-modal-header {
      background: #f8f9fa;
      padding: 20px 30px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modern-modal-body {
      padding: 30px;
      overflow-y: auto;
    }

    .modern-details-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .modern-details-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #edf2f7;
      vertical-align: top;
      color: #1e293b;
    }

    .modern-details-table tr:last-child td {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 600;
      color: #64748b;
      width: 160px;
      white-space: nowrap;
    }

    .detail-value {
      line-height: 1.6;
    }

    .modern-img-preview {
      border: 1px solid #e2e8f0;
      padding: 4px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      object-fit: cover;
    }

    .modern-img-preview:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      cursor: zoom-in;
    }

    .modern-btn-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
    }
    .modern-btn-close:hover {
      background: #f1f5f9;
      color: #ef4444;
    }

    /* Modern Button Style */
    .btn-modern-details {
      border-radius: 50px; /* Pill shape */
      padding: 6px 16px;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      border: 1px solid #6366f1;
      color: #6366f1;
      background: transparent;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .btn-modern-details:hover {
      background: #6366f1;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
  </style>
`;

// Utility for safely parsing JSON fields like title, description, etc.
const safeJsonParse = (
  jsonString: string | null,
  defaultValue: string = ""
) => {
  if (!jsonString) return defaultValue;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed.en || defaultValue;
  } catch (e) {
    return jsonString || defaultValue;
  }
};

// Mission type options (same as in Missions page)
const typeOptions = [
  { label: "Mission", value: 1 },
  { label: "Quiz", value: 2 },
  { label: "Riddle", value: 3 },
  { label: "Puzzle", value: 4 },
  { label: "Jigyasa", value: 5 },
  { label: "Pragya", value: 6 },
];

export default function MissionPage() {
  const [selectedFromDate, setSelectedFromDate] = useState(""); // New state for From Date
  const [selectedToDate, setSelectedToDate] = useState(""); // New state for To Date
  const [selectedMissionAcceptance, setSelectedMissionAcceptance] =
    useState("");
  const [selectedAssignedBy, setSelectedAssignBy] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  // Changed from 50 to 15 rows per page for better pagination
  const rowsPerPage = 25;
  const [isTableLoading, setIsTableLoading] = useState(false);
  // Add two new state variables for the school ID and mobile no filters
  const [inputCode, setInputCode] = useState("");
  // Update existing state declaration
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);
  const [selectedMobileNo, setSelectedMobileNo] = useState("");
  // lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  // State for confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    type: "", // "approve" or "reject"
    message: "",
  });
  // State for feedback modal
  const [feedbackModal, setFeedbackModal] = useState({
    show: false,
    type: "", // "approve" or "reject"
    rowId: "",
    missionId: "",
    studentId: "",
    feedbackText: "",
  });

  // ✅ NEW: Mission details modal state
  const [missionDetailsModal, setMissionDetailsModal] = useState<{
    show: boolean;
    missionId: number | null;
    data: any | null;
    loading: boolean;
  }>({
    show: false,
    missionId: null,
    data: null,
    loading: false,
  });

  // Refs for table scrolling functionality
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(true);

  // Handler for search button - handles pagination with proper page indexing
  const handleSearch = async (pageIndex: number) => {
    const filters = {
      mission_acceptance: selectedMissionAcceptance,
      assigned_by: selectedAssignedBy,
      from_date: selectedFromDate, // Include the From Date filter
      to_date: selectedToDate, // Include the To Date filter
      school_code:
        selectedSchoolCode.length > 0 ? selectedSchoolCode : undefined, // new filter
      mobile_no: selectedMobileNo, // new filter
      page: pageIndex + 1, // Backend expects 1-based indexing
      per_page: rowsPerPage, // Use 15 rows per page instead of 50
    };
    setIsTableLoading(true); // Set loading to true when search starts
    try {
      const res = await fetch(`${api_startpoint}/api/student_mission_search`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const result = await res.json();
      // guard against bad shape
      if (!result.data || !result.pagination) {
        console.error("Invalid response:", result);
        setTableData([]);
        setTotalPages(0);
        setTotalRows(0);
        return;
      }
      // 👍 safe to update
      setTableData(result.data);
      setTotalPages(result.pagination.total_pages);
      setTotalRows(result.pagination.total);
      setCurrentPage(pageIndex); // Keep 0-based indexing for frontend
      // Reset scroll hints when new data loads
      setTimeout(() => {
        updateScrollHints();
      }, 100);
    } catch (error) {
      console.error("Search error:", error);
      setTotalRows(0);
      setTableData([]);
    } finally {
      setIsTableLoading(false); // Set loading to false when search completes (success or error)
    }
  };

  // ✅ NEW: Fetch mission details by ID
  const openMissionDetailsModal = async (missionId: number) => {
    setMissionDetailsModal({
      show: true,
      missionId,
      data: null,
      loading: true,
    });
    try {
      const res = await fetch(`${api_startpoint}/api/get_mission_by_id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mission_id: missionId }),
      });
      const data = await res.json();
      setMissionDetailsModal((prev) => ({ ...prev, data, loading: false }));
    } catch (err) {
      console.error("Failed to fetch mission details:", err);
      setMissionDetailsModal((prev) => ({ ...prev, loading: false }));
    }
  };

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

  useEffect(() => {
    // Initial fetch to load the first page of data
    handleSearch(0);
  }, []);

  const handleClear = () => {
    setSelectedMissionAcceptance("");
    setSelectedAssignBy("");
    setSelectedFromDate(""); // Clear the From Date
    setSelectedToDate(""); // Clear the To Date
    setSelectedSchoolCode([]);
    setSelectedMobileNo("");
    setTableData([]);
    setCurrentPage(0);
    setTotalPages(0);
  };

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

  // Open feedback modal when approve/reject is clicked
  const handleStatusActionClick = (
    rowId: string,
    missionId: string,
    studentId: string,
    action: "approve" | "reject"
  ) => {
    setFeedbackModal({
      show: true,
      type: action,
      rowId: rowId,
      missionId: missionId,
      studentId: studentId,
      feedbackText: "",
    });
  };

  // Handle feedback submission and status update
  const handleStatusUpdate = async () => {
    const { rowId, missionId, studentId, type, feedbackText } = feedbackModal;
    try {
      const response = await fetch(
        `${api_startpoint}/api/update_mission_status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            row_id: rowId,
            mission_id: missionId,
            student_id: studentId,
            action: type,
            comments: feedbackText,
          }),
        }
      );
      if (!response.ok) throw new Error("Update failed");
      // Close feedback modal
      setFeedbackModal({
        show: false,
        type: "",
        rowId: "",
        missionId: "",
        studentId: "",
        feedbackText: "",
      });
      // Show confirmation modal
      setConfirmationModal({
        show: true,
        type: type,
        message: `Mission has been ${
          type === "approve" ? "approved" : "rejected"
        } successfully!`,
      });
      // Refresh the table data after successful update
      handleSearch(currentPage);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      {/* Inject CSS styles */}
      <div dangerouslySetInnerHTML={{ __html: tableStyles }} />
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Search & Filter</h5>
                <div className="row g-3">
                  {/* Dropdowns Row 1 */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedMissionAcceptance}
                      onChange={(e) =>
                        setSelectedMissionAcceptance(e.target.value)
                      }
                    >
                      <option value="">Missions Approved/Requested</option>
                      <option value="Approved">Missions Approved</option>
                      <option value="Requested">Missions Requested</option>
                      <option value="Rejected">Mission Rejected</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedAssignedBy}
                      onChange={(e) => setSelectedAssignBy(e.target.value)}
                    >
                      <option value="">Assigned By</option>
                      <option value="Teacher">Teacher</option>
                      <option value="self">Self</option>
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
                    <input
                      type="text"
                      placeholder="Mobile No"
                      className="form-control"
                      value={selectedMobileNo}
                      onChange={(e) => setSelectedMobileNo(e.target.value)}
                    />
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button
                    className="btn btn-success d-inline-flex align-items-center"
                    onClick={() => handleSearch(0)}
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
            </div>
            {/* Paginated Results Table */}
            <div className="card shadow-sm border-0 mt-2">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  Results- {totalRows} Students found
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
                    {/* Scroll hints for visual indication - larger buttons with significant scroll */}
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
                            <th>Row ID</th>
                            <th>Mission ID</th>
                            <th>Student Name</th>
                            <th>School Code</th>
                            <th>School Name</th>
                            <th>Mission Title</th>
                            <th>Media</th>
                            <th>Assigned By</th>
                            <th>Status</th>
                            <th>Feedback</th>
                            {selectedMissionAcceptance === "Requested" && (
                              <th>Action</th>
                            )}
                            {/* ✅ NEW COLUMN */}
                            <th>Mission Details</th>
                            <th>Student ID</th>
                            <th>Requested At</th>
                            <th>Total Points</th>
                            <th>Each Mission Timing</th>
                            <th>Mobile No</th>
                            <th>DOB</th>
                            <th>Grade</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Address</th>
                            <th>Earn Coins</th>
                            <th>Heart Coins</th>
                            <th>Brain Coins</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((row, index) => {
                            let MissionTitle = "";
                            try {
                              const parsedTitle = JSON.parse(row.Mission_Title);
                              MissionTitle = parsedTitle.en || "";
                            } catch (error) {
                              MissionTitle = row.Mission_Title;
                            }
                            return (
                              <tr key={index}>
                                <td>{row.Row_ID}</td>
                                <td>{row.Mission_ID}</td>
                                <td>{row.Student_Name}</td>
                                <td>{row.school_code}</td>
                                <td>{row.School_Name}</td>
                                <td>{MissionTitle}</td>
                                <td>
                                  {row.media_url?.match(
                                    /\.(jpe?g|png|gif)$/i
                                  ) ? (
                                    <img
                                      src={row.media_url}
                                      className="w-12 h-12 object-cover cursor-pointer"
                                      onClick={() =>
                                        setLightboxUrl(row.media_url!)
                                      }
                                    />
                                  ) : row.media_url ? (
                                    <button
                                      className="btn btn-link"
                                      onClick={() =>
                                        window.open(row.media_url, "_blank")
                                      }
                                    >
                                      📄 File
                                    </button>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td>{row.Assigned_By}</td>
                                <td>{row.Status}</td>
                                <td>
                                  {row.Comments ? (
                                    <span title={row.Comments}>
                                      {row.Comments.length > 50
                                        ? `${row.Comments.substring(0, 50)}...`
                                        : row.Comments}
                                    </span>
                                  ) : row.Status === "Requested" ? (
                                    <span className="text-muted">
                                      No feedback
                                    </span>
                                  ) : (
                                    <span className="text-muted">—</span>
                                  )}
                                </td>
                                {selectedMissionAcceptance === "Requested" && (
                                  <td>
                                    {row.Status === "Requested" && (
                                      <div className="d-flex gap-2">
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() =>
                                            handleStatusActionClick(
                                              row.Row_ID,
                                              row.Mission_ID,
                                              row.Student_ID,
                                              "approve"
                                            )
                                          }
                                        >
                                          Approve
                                        </button>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() =>
                                            handleStatusActionClick(
                                              row.Row_ID,
                                              row.Mission_ID,
                                              row.Student_ID,
                                              "reject"
                                            )
                                          }
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                )}
                                {/* ✅ MODIFIED BUTTON: Modern Rounded "Pill" Style */}
                                <td>
                                  <button
                                    className="btn-modern-details"
                                    onClick={() =>
                                      openMissionDetailsModal(
                                        Number(row.Mission_ID)
                                      )
                                    }
                                  >
                                    <IconEye size={16} stroke={2} />
                                    Details
                                  </button>
                                </td>
                                <td>{row.Student_ID}</td>
                                <td>{row.Requested_At}</td>
                                <td>{row.Total_Points}</td>
                                <td>{row.Each_Mission_Timing}</td>
                                <td>{row.mobile_no}</td>
                                <td>{row.dob}</td>
                                <td>{row.grade}</td>
                                <td>{row.city}</td>
                                <td>{row.state}</td>
                                <td>{row.address}</td>
                                <td>{row.earn_coins}</td>
                                <td>{row.heart_coins}</td>
                                <td>{row.brain_coins}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination Controls - Updated with better display and proper page handling */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        Showing{" "}
                        {tableData.length > 0
                          ? currentPage * rowsPerPage + 1
                          : 0}{" "}
                        to{" "}
                        {Math.min((currentPage + 1) * rowsPerPage, totalRows)}{" "}
                        of {totalRows} entries
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleSearch(currentPage - 1)}
                          disabled={currentPage === 0}
                        >
                          Previous
                        </button>
                        <span className="mx-2">
                          Page {currentPage + 1} of {totalPages || 1}
                        </span>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleSearch(currentPage + 1)}
                          disabled={currentPage + 1 >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Lightbox */}
              {lightboxUrl && (
                <div
                  className="position-fixed start-0 end-0 top-0 bottom-0 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
                  style={{ zIndex: 1050 }}
                  onClick={() => setLightboxUrl(null)}
                >
                  <div className="position-relative">
                    <img
                      src={lightboxUrl}
                      alt="Preview"
                      className="img-fluid rounded max-w-full max-h-full"
                      style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                    />
                    <button
                      className="position-absolute top-0 end-0 btn btn-sm btn-dark rounded-circle"
                      style={{ margin: "0.5rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxUrl(null);
                      }}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                </div>
              )}
              {/* Feedback Modal */}
              {feedbackModal.show && (
                <div className="feedback-modal">
                  <div className="feedback-modal-content">
                    <h4 className="mb-3">
                      {feedbackModal.type === "approve"
                        ? "Approve Mission"
                        : "Reject Mission"}
                    </h4>
                    <p className="text-muted mb-3">
                      Please provide feedback for this mission:
                    </p>
                    <textarea
                      className="feedback-textarea"
                      placeholder="Enter your feedback here..."
                      value={feedbackModal.feedbackText}
                      onChange={(e) =>
                        setFeedbackModal({
                          ...feedbackModal,
                          feedbackText: e.target.value,
                        })
                      }
                    />
                    <div className="feedback-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          setFeedbackModal({
                            ...feedbackModal,
                            show: false,
                          })
                        }
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleStatusUpdate}
                        disabled={!feedbackModal.feedbackText.trim()}
                      >
                        Okay
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Confirmation Modal */}
              {confirmationModal.show && (
                <div
                  className="position-fixed start-0 end-0 top-0 bottom-0 d-flex align-items-center justify-content-center"
                  style={{ zIndex: 1060 }}
                >
                  <div
                    className="bg-white rounded-lg shadow-lg p-5 border border-gray-300"
                    style={{ width: "300px", zIndex: 1070 }}
                  >
                    <div className="text-center">
                      <div className="mb-3">
                        {confirmationModal.type === "approve" ? (
                          <IconCircleCheck
                            className="text-green"
                            size={48}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <IconCircleX
                            className="text-danger"
                            size={48}
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <h4 className="mb-3">
                        {confirmationModal.type === "approve"
                          ? "Mission Approved"
                          : "Mission Rejected"}
                      </h4>
                      <p className="text-muted mb-4">
                        {confirmationModal.message}
                      </p>
                      <button
                        className="btn btn-danger w-100"
                        onClick={() =>
                          setConfirmationModal({
                            ...confirmationModal,
                            show: false,
                          })
                        }
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ RE-DESIGNED Mission Details Modal - Modern & Tabular */}
              {missionDetailsModal.show && (
                <div className="feedback-modal">
                  <div
                    className="modern-modal-card"
                    style={{ maxWidth: "800px", width: "90%" }}
                  >
                    {/* Modal Header */}
                    <div className="modern-modal-header">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary-lt p-2 rounded">
                          <IconFileDescription
                            className="text-primary"
                            size={24}
                          />
                        </div>
                        <div>
                          <h3 className="m-0 fw-bold text-dark">
                            Mission Details
                          </h3>
                          <small className="text-muted">
                            Review full mission information
                          </small>
                        </div>
                      </div>
                      <button
                        className="modern-btn-close"
                        onClick={() =>
                          setMissionDetailsModal({
                            show: false,
                            missionId: null,
                            data: null,
                            loading: false,
                          })
                        }
                      >
                        <IconX size={24} />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modern-modal-body">
                      {missionDetailsModal.loading ? (
                        <div className="text-center py-5">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 text-muted">Fetching details...</p>
                        </div>
                      ) : missionDetailsModal.data ? (
                        <div>
                          <table className="modern-details-table">
                            <tbody>
                              <tr>
                                <td className="detail-label">Title</td>
                                <td className="detail-value fw-bold text-primary">
                                  {safeJsonParse(
                                    missionDetailsModal.data.title
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Description</td>
                                <td className="detail-value text-secondary">
                                  {safeJsonParse(
                                    missionDetailsModal.data.description
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Question</td>
                                <td className="detail-value">
                                  {safeJsonParse(
                                    missionDetailsModal.data.question
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Type</td>
                                <td className="detail-value">
                                  <span className="badge bg-blue-lt">
                                    {typeOptions.find(
                                      (t) =>
                                        t.value ===
                                        missionDetailsModal.data.type
                                    )?.label || missionDetailsModal.data.type}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Subject</td>
                                <td className="detail-value">
                                  {JSON.parse(missionDetailsModal.data.subject)
                                    ?.en || "—"}
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Level</td>
                                <td className="detail-value">
                                  {JSON.parse(missionDetailsModal.data.level)
                                    ?.en || "—"}
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Allow For</td>
                                <td className="detail-value text-capitalize">
                                  {missionDetailsModal.data.allow_for}
                                </td>
                              </tr>
                              <tr>
                                <td className="detail-label">Status</td>
                                <td className="detail-value">
                                  <span
                                    className={`badge ${
                                      missionDetailsModal.data.status === 1
                                        ? "bg-success text-white"
                                        : "bg-secondary text-white"
                                    }`}
                                  >
                                    {missionDetailsModal.data.status === 1
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                </td>
                              </tr>
                              {missionDetailsModal.data.image_url && (
                                <tr>
                                  <td className="detail-label">Thumbnail</td>
                                  <td className="detail-value">
                                    <img
                                      src={missionDetailsModal.data.image_url}
                                      alt="Mission thumbnail"
                                      className="modern-img-preview"
                                      style={{
                                        height: "100px",
                                        width: "160px",
                                      }}
                                    />
                                  </td>
                                </tr>
                              )}
                              {missionDetailsModal.data.resources?.length >
                                0 && (
                                <tr>
                                  <td className="detail-label">Documents</td>
                                  <td className="detail-value">
                                    <div className="d-flex flex-wrap gap-3">
                                      {missionDetailsModal.data.resources.map(
                                        (res: any, i: number) => (
                                          <img
                                            key={i}
                                            src={res.url}
                                            alt={`Doc ${i + 1}`}
                                            className="modern-img-preview"
                                            style={{
                                              height: "100px",
                                              width: "auto",
                                              cursor: "pointer",
                                            }}
                                            onClick={() =>
                                              window.open(res.url, "_blank")
                                            }
                                            title="Click to view full resource"
                                          />
                                        )
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                          <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                            <button
                              className="btn btn-primary px-4 py-2 rounded-pill"
                              onClick={() =>
                                setMissionDetailsModal({
                                  show: false,
                                  missionId: null,
                                  data: null,
                                  loading: false,
                                })
                              }
                            >
                              Close Details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <IconX
                            size={48}
                            className="text-danger mb-2 opacity-50"
                          />
                          <p className="text-danger fw-medium">
                            Failed to load mission details.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
