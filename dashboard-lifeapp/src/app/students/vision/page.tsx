"use client";
import React, { useEffect, useState, useRef } from "react";
import { Inter } from "next/font/google";
import "@tabler/core/dist/css/tabler.min.css";
import { Sidebar } from "@/components/ui/sidebar";
import { Download, Search, XCircle, Eye, Play } from "lucide-react";
import {
  IconCircleCheck,
  IconCircleX,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";


const inter = Inter({ subsets: ["latin"] });


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
      border-radius: 10%; /* Changed from 50% to 10% as requested */
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
// Interfaces for type safety 
interface SessionRow {
  [key: string]: any;
  answer_id: number | null;
  vision_id: number;
  vision_title: string;
  question_title: string;
  user_name: string;
  teacher_name: string;
  answer_text: string | null;
  answer_option: string | null;
  media_id: number | null;
  media_path: string | null;
  score: number | null;
  answer_type: string;
  status: string;
  created_at: string;
  vision_youtube_url: string | null;
  media_url?: string;
  user_id?: number;
  representative_answer_id?: number;
  comment?: string; // Added comment field
}
interface VisionDetails {
  vision_id: number;
  title: string;
  description: string;
  youtube_url: string | null;
  allow_for: number;
  subject: string;
  level: string;
  status: number;
  index: number;
  questions: QuestionDetails[];
}
interface QuestionDetails {
  question_id: number;
  question_type: string;
  question: string;
  options: { [key: string]: string } | null;
  correct_answer: string | null;
}
interface MCQAnswer {
  answer_id: number;
  question_id: number;
  answer_option: string;
  score: number | null;
  status: string;
  created_at: string;
  question_text: string;
  options: { [key: string]: string } | null;
  correct_answer: string | null;
}
export default function VisionSessionsPage() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [qtype, setQtype] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);
  const [confirmationModal, setConfirmationModal] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [visionDetailsModal, setVisionDetailsModal] = useState({
    show: false,
    details: null as VisionDetails | null,
    loading: false,
  });
  const [mcqAnswersModal, setMcqAnswersModal] = useState({
    show: false,
    answers: [] as MCQAnswer[],
    loading: false,
    visionTitle: "",
    userName: "",
  });
// New state for feedback modal
const [feedbackModal, setFeedbackModal] = useState<{
  show: boolean;
  answerId: number | null;
  action: "approve" | "reject" | "";
  comment: string;
  loading: boolean;
}>({
  show: false,
  answerId: null,
  action: "",
  comment: "",
  loading: false,
});
// --- NEW: State for total pages ---
const [totalPages, setTotalPages] = useState(1);

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
  const fetchSessions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("per_page", perPage.toString());
    if (qtype) params.set("question_type", qtype);
    if (assignedBy) params.set("assigned_by", assignedBy);
    if (dateStart) params.set("date_start", dateStart);
    if (dateEnd) params.set("date_end", dateEnd);
    if (filterStatus) params.set("status", filterStatus);
    selectedSchoolCode.forEach((code) => params.append("school_codes", code));
    try {
      const res = await fetch(
        `${api_startpoint}/api/vision_sessions?${params}`
      );
      const result = await res.json();
      const sessions = Array.isArray(result.data) ? result.data : [];
      setRows(sessions);
      // --- NEW: Set total pages from API response ---
      setTotalPages(result.total_pages || 1);
      // Reset scroll hints when new data loads
      setTimeout(() => {
        updateScrollHints();
      }, 100);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      alert("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions();
  }, [
    filterStatus,
    page,
    qtype,
    assignedBy,
    dateStart,
    dateEnd,
    selectedSchoolCode,
  ]);
  const handleSearch = () => {
    setPage(1);
    fetchSessions();
  };
  const handleClear = () => {
    setQtype("");
    setAssignedBy("");
    setDateStart("");
    setDateEnd("");
    setSelectedSchoolCode([]);
    setInputCode("");
    setPage(1);
    fetchSessions();
  };
  const handleScoreBlur = async (id: number, value: string) => {
    const newScore = Number(value);
    if (!isNaN(newScore)) {
      try {
        await fetch(`${api_startpoint}/api/vision_sessions/${id}/score`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: newScore }),
        });
        fetchSessions();
      } catch (error) {
        console.error("Error updating score:", error);
        alert("Failed to update score.");
      }
    }
  };
  const showVisionDetails = async (visionId: number) => {
    setVisionDetailsModal({ show: true, details: null, loading: true });
    try {
      const res = await fetch(
        `${api_startpoint}/api/vision_details/${visionId}`
      );
      if (!res.ok) throw new Error("Failed to fetch vision details");
      const details: VisionDetails = await res.json();
      setVisionDetailsModal({ show: true, details, loading: false });
    } catch (error) {
      console.error("Error fetching vision details:", error);
      alert("Failed to load vision details.");
      setVisionDetailsModal({ show: false, details: null, loading: false });
    }
  };
  const showMcqAnswers = async (
    visionId: number,
    userId: number,
    visionTitle: string,
    userName: string
  ) => {
    setMcqAnswersModal({
      show: true,
      answers: [],
      loading: true,
      visionTitle,
      userName,
    });
    try {
      const res = await fetch(
        `${api_startpoint}/api/mcq_answers/${visionId}/${userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch MCQ answers");
      const data = await res.json();
      setMcqAnswersModal({
        show: true,
        answers: data.mcq_answers,
        loading: false,
        visionTitle,
        userName,
      });
    } catch (error) {
      console.error("Error fetching MCQ answers:", error);
      alert("Failed to load MCQ answers.");
      setMcqAnswersModal({
        show: false,
        answers: [],
        loading: false,
        visionTitle: "",
        userName: "",
      });
    }
  };
  const closeVisionDetailsModal = () => {
    setVisionDetailsModal({ show: false, details: null, loading: false });
  };
  const closeMcqAnswersModal = () => {
    setMcqAnswersModal({
      show: false,
      answers: [],
      loading: false,
      visionTitle: "",
      userName: "",
    });
  };
  // New functions for feedback modal
  const openFeedbackModal = (answerId: number, action: "approve" | "reject") => {
    setFeedbackModal({
      show: true,
      answerId,
      action,
      comment: "",
      loading: false,
    });
  };
  const closeFeedbackModal = () => {
    setFeedbackModal({
      show: false,
      answerId: null,
      action: "",
      comment: "",
      loading: false,
    });
  };
  const handleFeedbackSubmit = async () => {
    if (!feedbackModal.answerId) return;
    setFeedbackModal(prev => ({ ...prev, loading: true }));
    try {
      // Update status with comment
      await fetch(
        `${api_startpoint}/api/vision_sessions/${feedbackModal.answerId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: feedbackModal.action === "approve" ? "approved" : "rejected",
            comment: feedbackModal.comment,
          }),
        }
      );
      // If approving, also update score for non-MCQ answers
      if (feedbackModal.action === "approve") {
        const row = rows.find(r => 
          (r.answer_id === feedbackModal.answerId) || 
          (r.representative_answer_id === feedbackModal.answerId)
        );
        if (row && row.answer_type !== "mcq") {
          await fetch(
            `${api_startpoint}/api/vision_sessions/${feedbackModal.answerId}/score`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ score: 10 }), // Default score for approval
            }
          );
        }
      }
      // Refresh data
      fetchSessions();
      // Show confirmation
      setConfirmationModal({
        show: true,
        type: feedbackModal.action,
        message: `Vision session ${feedbackModal.action === "approve" ? "approved" : "rejected"} successfully!`,
      });
      // Close feedback modal
      closeFeedbackModal();
    } catch (error) {
      console.error(`Error ${feedbackModal.action}ing session:`, error);
      alert(`Failed to ${feedbackModal.action} session.`);
    } finally {
      setFeedbackModal(prev => ({ ...prev, loading: false }));
    }
  };
  const exportToCSV = () => {
    if (rows.length === 0) {
      alert("No data to export. Please perform a search first.");
      return;
    }
    try {
      const headers = Object.keys(rows[0]);
      let csvContent = headers.join(",") + "\n";
      rows.forEach((row) => {
        const values = headers.map((header) => {
          const cellValue =
            row[header] === null || row[header] === undefined
              ? ""
              : row[header];
          const escapedValue = String(cellValue).replace(/"/g, '""');
          return `"${escapedValue}"`;
        });
        csvContent += values.join(",") + "\n";
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `vision_sessions_data_export_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
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
  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      {/* Inject CSS styles */}
      <div dangerouslySetInnerHTML={{ __html: tableStyles }} />
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-2">
            {/* Filters */}
            <div className="card shadow-sm border-0 mb-2">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      value={qtype}
                      onChange={(e) => setQtype(e.target.value)}
                      className="border p-2 rounded w-100"
                    >
                      <option value="">All Types</option>
                      <option value="option">MCQ</option>
                      <option value="text">Reflection</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      value={assignedBy}
                      onChange={(e) => setAssignedBy(e.target.value)}
                      className="border p-2 rounded w-100"
                    >
                      <option value="">All</option>
                      <option value="teacher">Assigned by Teacher</option>
                      <option value="self">Self-assigned</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border p-2 rounded w-100"
                    >
                      <option value="">All Status</option>
                      <option value="requested">Requested</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="border p-2 rounded w-100"
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="border p-2 rounded w-100"
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
                </div>
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
            {/* Export Button */}
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
            {/* Sessions Table - Improved Styling */}
            {loading ? (
              <div className="w-8 h-8 border-t-2 border-sky-700 animate-spin rounded-full mx-auto my-4"></div>
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
                  className="overflow-x-scroll smooth-scroll rounded-lg shadow"
                  onScroll={handleTableScroll}
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  <table className="table table-vcenter card-table w-full table-auto min-w-full bg-white border border-gray-200 table-sticky-header">
                    <thead className="table-light">
                      <tr>
                        {/* --- NEW: Serial No. Column Header --- */}
                        <th className="text-nowrap">S. No.</th>
                        <th className="text-nowrap">Vision</th>
                        {/* Increased width for Question column */}
                        <th
                          className="text-nowrap"
                          style={{ minWidth: "400px", width: "40%" }}
                        >
                          Question
                        </th>
                        <th className="text-nowrap">User</th>
                        <th className="text-nowrap">Assigned By</th>
                        <th className="text-nowrap">Answer Text</th>
                        <th className="text-nowrap">Answer Option</th>
                        <th className="text-nowrap">Image Answer</th>
                        <th className="text-nowrap">YouTube Link</th>
                        <th className="text-nowrap">Show Details</th>
                        <th className="text-nowrap">Total Points</th>
                        <th className="text-nowrap">Status</th>
                        <th className="text-nowrap">Feedback</th> {/* New Feedback Column */}
                        {filterStatus === "requested" && (
                          <th className="text-nowrap">Actions</th>
                        )}
                        <th className="text-nowrap">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, index) => (
                        <tr
                          key={`${r.answer_id || r.representative_answer_id}-${
                            r.user_id || 0
                          }`}
                        >
                          {/* --- NEW: Serial Number Cell --- */}
                          <td className="align-middle text-nowrap">
                            {(page - 1) * perPage + index + 1}
                          </td>
                          <td className="align-middle">{r.vision_title}</td>
                          {/* Question column with wider space */}
                          <td
                            className="align-middle"
                            style={{ minWidth: "300px", width: "30%" }}
                          >
                            {r.question_title}
                          </td>
                          <td className="align-middle">{r.user_name}</td>
                          <td className="align-middle">{r.teacher_name}</td>
                          <td className="align-middle">
                            {r.answer_type === "text" ? r.answer_text : ""}
                          </td>
                          <td className="align-middle">
                            {r.answer_type === "mcq" ? (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  showMcqAnswers(
                                    r.vision_id,
                                    r.user_id!,
                                    r.vision_title,
                                    r.user_name
                                  )
                                }
                              >
                                See MCQ Answers
                              </button>
                            ) : (
                              r.answer_option
                            )}
                          </td>
                          <td className="align-middle">
                            {r.answer_type === "image" && r.media_url && (
                              <img
                                src={r.media_url}
                                alt="Answer"
                                className="img-thumbnail cursor-pointer"
                                style={{ maxHeight: "50px", maxWidth: "50px" }}
                                onClick={() => setLightboxUrl(r.media_url!)}
                              />
                            )}
                          </td>
                          <td className="align-middle">
                            {r.vision_youtube_url ? (
                              <a
                                href={r.vision_youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                              >
                                Video Link
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="align-middle text-center">
                            {" "}
                            {/* Centered button */}
                            <button
                              className="btn btn-sm btn-icon btn-outline-secondary"
                              onClick={() => showVisionDetails(r.vision_id)}
                              title="Show Vision Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                          <td className="align-middle">
                            <input
                              type="number"
                              defaultValue={r.score ?? ""}
                              onBlur={(e) =>
                                handleScoreBlur(
                                  r.answer_id || r.representative_answer_id!,
                                  e.target.value
                                )
                              }
                              className="form-control form-control-sm w-100"
                              style={{ maxWidth: "80px" }}
                              disabled={r.answer_type === "mcq"}
                            />
                          </td>
                          <td className="align-middle">
                            <span
                              className={`badge ${
                                r.status === "approved"
                                  ? "bg-success"
                                  : r.status === "rejected"
                                  ? "bg-danger"
                                  : r.status === "requested"
                                  ? "bg-warning"
                                  : "bg-secondary"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          {/* New Feedback Column */}
                          <td className="align-middle">
                            {r.status === "requested" ? (
                              <span className="text-muted">No feedback</span>
                            ) : r.comment ? (
                              <div 
                                className="feedback-text"
                                title={r.comment}
                                style={{ 
                                  maxWidth: "200px", 
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {r.comment}
                              </div>
                            ) : (
                              <span className="text-muted">No feedback</span>
                            )}
                          </td>
                          {filterStatus === "requested" && (
                            <td className="align-middle">
                              <div
                                className="btn-group btn-group-sm"
                                role="group"
                              >
                                <button
                                  className="btn btn-success"
                                  onClick={() => 
                                    openFeedbackModal(
                                      r.answer_id || r.representative_answer_id!, 
                                      "approve"
                                    )
                                  }
                                  disabled={r.answer_type === "mcq"}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger"
                                  onClick={() => 
                                    openFeedbackModal(
                                      r.answer_id || r.representative_answer_id!, 
                                      "reject"
                                    )
                                  }
                                  disabled={r.answer_type === "mcq"}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="align-middle text-nowrap">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center p-3">
              <button
                className="btn btn-primary"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              {/* --- UPDATED: Show Page X/Y --- */}
              <span>Page {page}/{totalPages}</span>
              <button
                className="btn btn-primary"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
            {/* Lightbox Modal */}
            {lightboxUrl && (
              <div
                className="modal modal-blur fade show"
                style={{ display: "block" }}
                id="image-lightbox"
                tabIndex={-1}
                role="dialog"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Image Answer</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setLightboxUrl(null)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body text-center">
                      <img
                        src={lightboxUrl}
                        className="img-fluid"
                        alt="Answer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Confirmation Modal */}
            {confirmationModal.show && (
              <div
                className="modal modal-blur fade show"
                style={{ display: "block" }}
                id="confirmation-modal"
                tabIndex={-1}
                role="dialog"
              >
                <div
                  className="modal-dialog modal-sm modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() =>
                        setConfirmationModal({
                          ...confirmationModal,
                          show: false,
                        })
                      }
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "15px",
                      }}
                    ></button>
                    <div className="modal-body text-center py-4">
                      <div className="mb-3">
                        {confirmationModal.type === "approve" ? (
                          <IconCircleCheck
                            className="text-success"
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
                      <h3>
                        {confirmationModal.type === "approve"
                          ? "Approved"
                          : "Rejected"}
                      </h3>
                      <div className="text-muted">
                        {confirmationModal.message}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="w-100">
                        <div className="row">
                          <div className="col">
                            <button
                              className="btn w-100 btn-primary"
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
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Vision Details Modal - Larger Headers */}
            {visionDetailsModal.show && (
              <div
                className="modal modal-blur fade show"
                style={{ display: "block" }}
                id="vision-details-modal"
                tabIndex={-1}
                role="dialog"
              >
                <div
                  className="modal-dialog modal-xl modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      {/* Increased title size */}
                      <h3 className="modal-title fw-bold">Vision Details</h3>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeVisionDetailsModal}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      {visionDetailsModal.loading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : visionDetailsModal.details ? (
                        <div>
                          {/* Section: Title - Larger Header */}
                          <div className="mb-4">
                            {/* Increased header size using h4 and fs-5 for text */}
                            <h4 className="fw-bold mb-2 text-primary fs-3">
                              Title
                            </h4>
                            <p className="mb-0 fs-4">
                              {visionDetailsModal.details.title}
                            </p>
                          </div>
                          <hr />
                          {/* Section: Description - Larger Header */}
                          <div className="mb-4">
                            <h4 className="fw-bold mb-2 text-primary fs-3">
                              Description
                            </h4>
                            <p className="mb-0 fs-4">
                              {visionDetailsModal.details.description}
                            </p>
                          </div>
                          <hr />
                          {/* Section: YouTube Link - Larger Header */}
                          <div className="mb-4">
                            <h4 className="fw-bold mb-2 text-primary fs-3">
                              YouTube Link
                            </h4>
                            {visionDetailsModal.details.youtube_url ? (
                              <a
                                href={visionDetailsModal.details.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary fs-4"
                              >
                                {visionDetailsModal.details.youtube_url}
                              </a>
                            ) : (
                              <p className="mb-0 text-muted fs-5">N/A</p>
                            )}
                          </div>
                          <hr />
                          {/* Section: Subject - Larger Header */}
                          <div className="mb-4">
                            <h4 className="fw-bold mb-2 text-primary fs-3">
                              Subject
                            </h4>
                            <p className="mb-0 fs-4">
                              {visionDetailsModal.details.subject || "N/A"}
                            </p>
                          </div>
                          <hr />
                          {/* Section: Level - Larger Header */}
                          <div className="mb-4">
                            <h4 className="fw-bold mb-2 text-primary fs-3">
                              Level
                            </h4>
                            <p className="mb-0 fs-4">
                              {visionDetailsModal.details.level || "N/A"}
                            </p>
                          </div>
                          <hr />
                          {/* Section: Questions - No Accordion */}
                          <div>
                            {/* Larger Header for Questions section */}
                            <h4 className="fw-bold mb-3 text-primary fs-3">
                              Questions
                            </h4>
                            {visionDetailsModal.details.questions.length > 0 ? (
                              <div className="row g-3">
                                {visionDetailsModal.details.questions.map(
                                  (q) => (
                                    <div className="col-12" key={q.question_id}>
                                      <div className="card border">
                                        <div className="card-body">
                                          <h6 className="card-subtitle mb-2 text-muted fs-4">
                                            <span className="badge bg-secondary me-2">
                                              {q.question_type.toUpperCase()}
                                            </span>
                                            {q.question}
                                          </h6>
                                          {q.options && (
                                            <div className="mt-2">
                                              <p className="mb-1 fw-medium fs-4">
                                                Options:
                                              </p>
                                              <ul className="mb-0 ps-3">
                                                {Object.entries(q.options).map(
                                                  ([key, value]) => (
                                                    <li
                                                      key={key}
                                                      className="mb-1 fs-4"
                                                    >
                                                      <strong>
                                                        {key.toUpperCase()}:
                                                      </strong>{" "}
                                                      {value}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                          {q.correct_answer && (
                                            <div className="mt-2">
                                              <p className="mb-0 fw-bold text-success fs-4">
                                                Correct Answer:{" "}
                                                {q.correct_answer.toUpperCase()}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-muted fs-4">
                                No questions found for this vision.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-danger fs-4">
                          Error loading details.
                        </p>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeVisionDetailsModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* MCQ Answers Modal - Removed Status Column */}
            {mcqAnswersModal.show && (
              <div
                className="modal modal-blur fade show"
                style={{ display: "block" }}
                id="mcq-answers-modal"
                tabIndex={-1}
                role="dialog"
              >
                <div
                  className="modal-dialog modal-xl modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        MCQ Answers: {mcqAnswersModal.visionTitle} -{" "}
                        {mcqAnswersModal.userName}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeMcqAnswersModal}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      {mcqAnswersModal.loading ? (
                        <div className="text-center">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : mcqAnswersModal.answers.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark">
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Question</th>
                                <th scope="col">Options</th>
                                <th scope="col">Correct Answer</th>
                                <th scope="col">Student&apos;s Answer</th>
                                {/* Status column removed */}
                              </tr>
                            </thead>
                            <tbody>
                              {mcqAnswersModal.answers.map((answer, index) => (
                                <tr key={answer.answer_id}>
                                  <th scope="row">{index + 1}</th>
                                  <td>{answer.question_text}</td>
                                  <td>
                                    {answer.options ? (
                                      <ul className="mb-0 ps-3">
                                        {Object.entries(answer.options).map(
                                          ([key, value]) => (
                                            <li key={key}>
                                              <strong>
                                                {key.toUpperCase()}:
                                              </strong>{" "}
                                              {value}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="fw-bold text-success">
                                    {answer.correct_answer?.toUpperCase() ||
                                      "N/A"}
                                  </td>
                                  <td
                                    className={`fw-bold ${
                                      answer.answer_option?.toLowerCase() ===
                                      answer.correct_answer?.toLowerCase()
                                        ? "text-success"
                                        : "text-danger"
                                    }`}
                                  >
                                    {answer.answer_option?.toUpperCase() ||
                                      "N/A"}
                                    {answer.answer_option?.toLowerCase() ===
                                    answer.correct_answer?.toLowerCase()
                                      ? " (Correct)"
                                      : " (Incorrect)"}
                                  </td>
                                  {/* Status cell removed */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted text-center fs-5">
                          No MCQ answers found for this session.
                        </p>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeMcqAnswersModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Feedback Modal */}
            {feedbackModal.show && (
              <div
                className="modal modal-blur fade show"
                style={{ display: "block" }}
                id="feedback-modal"
                tabIndex={-1}
                role="dialog"
              >
                <div
                  className="modal-dialog modal-dialog-centered"
                  role="document"
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {feedbackModal.action === "approve" ? "Approve" : "Reject"} Mission
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={closeFeedbackModal}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label htmlFor="feedback-comment" className="form-label">
                          Add Feedback (Optional)
                        </label>
                        <textarea
                          id="feedback-comment"
                          className="form-control"
                          rows={4}
                          placeholder="Enter your feedback comments..."
                          value={feedbackModal.comment}
                          onChange={(e) =>
                            setFeedbackModal(prev => ({
                              ...prev,
                              comment: e.target.value
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeFeedbackModal}
                        disabled={feedbackModal.loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          feedbackModal.action === "approve" ? "btn-success" : "btn-danger"
                        }`}
                        onClick={handleFeedbackSubmit}
                        disabled={feedbackModal.loading}
                      >
                        {feedbackModal.loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            {feedbackModal.action === "approve" ? "Approving..." : "Rejecting..."}
                          </>
                        ) : (
                          `Okay - ${feedbackModal.action === "approve" ? "Approve" : "Reject"}`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Backdrop for modals */}
            {(lightboxUrl ||
              confirmationModal.show ||
              visionDetailsModal.show ||
              mcqAnswersModal.show ||
              feedbackModal.show) && (
              <div className="modal-backdrop fade show"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}