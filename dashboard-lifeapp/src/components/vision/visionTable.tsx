"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Inter } from "next/font/google";
import "@tabler/core/dist/css/tabler.min.css";
import { Sidebar } from "@/components/ui/sidebar";
import { Download, Search, XCircle } from "lucide-react";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react"; // Added icons for modal
import { UserType } from "@/types";

const inter = Inter({ subsets: ["latin"] });
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = 'http://localhost:5000'
const api_startpoint = "http://152.42.239.141:5000";

interface SessionRow {
    [key: string]: any;
    answer_id: number;
    vision_title: string;
    question_title: string;
    user_name: string;
    teacher_name: string;
    answer_text: string;
    answer_option: string;
    media_id: number | null;
    media_path: string | null;
    score: number | null;
    answer_type: string;
    created_at: string;
    media_url?: string;
}

export default function VisionSessionsComponent({user_type}:UserType) {
    const [rows, setRows] = useState<SessionRow[]>([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(25);
    const [qtype, setQtype] = useState("");
    const [assignedBy, setAssignedBy] = useState("");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [loading, setLoading] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState("");
    const [filterStatus, setFilterStatus] = useState(""); // '', 'requested','approved','rejected'
    // Update existing state declaration
    const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);

    // NEW: State for confirmation modal
    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        type: "", // "approve" or "reject"
        message: "",
    });

    const fetchSessions = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("per_page", perPage.toString());
        params.set("user_type",user_type.toString())
        if (qtype) params.set("question_type", qtype);
        if (assignedBy) params.set("assigned_by", assignedBy);
        if (dateStart) params.set("date_start", dateStart);
        if (dateEnd) params.set("date_end", dateEnd);
        if (filterStatus) params.set("status", filterStatus);

        // append each code separately
        selectedSchoolCode.forEach((code) => params.append("school_codes", code));

        const res = await fetch(`${api_startpoint}/api/vision_sessions?${params}`);
        const result = await res.json();
        // Ensure data is an array
        const sessions = Array.isArray(result.data) ? result.data : [];
        setRows(sessions);
        setLoading(false);
    };

    // Trigger fetch on filters change
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

    // Called when "Search" button clicked
    const handleSearch = () => {
        setPage(1);
        fetchSessions();
    };

    // Reset all filters
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
            await fetch(`${api_startpoint}/api/vision_sessions/${id}/score`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: newScore }),
            });
            fetchSessions();
        }
    };

    const exportToCSV = () => {
        // Return early if there's no data to export
        if (rows.length === 0) {
            alert("No data to export. Please perform a search first.");
            return;
        }

        try {
            // Get all the headers (keys) from the first data row
            const headers = Object.keys(rows[0]);

            // Create CSV header row
            let csvContent = headers.join(",") + "\n";

            // Add data rows
            rows.forEach((row) => {
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
        <>
            <div className="page-body">
                <div className="container-xl pt-4 pb-4 space-y-2">
                    <div className="card shadow-sm border-0 mb-2">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-12 col-md-6 col-lg-3">
                                    <select
                                        value={qtype}
                                        onChange={(e) => setQtype(e.target.value)}
                                        className="border p-2 rounded"
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
                                        className="border p-2 rounded"
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
                                        className="border p-2 rounded"
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
                                        className="border p-2 rounded"
                                    />
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <input
                                        type="date"
                                        value={dateEnd}
                                        onChange={(e) => setDateEnd(e.target.value)}
                                        className="border p-2 rounded"
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
                    </div>
                    {/* Table */}
                    {loading ? (
                        <div className="w-8 h-8 border-t-2 border-sky-700 animate-spin rounded-full"></div>
                    ) : (
                        <table className="w-full table-auto border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Vision</th>
                                    <th className="p-2 border">Question</th>
                                    <th className="p-2 border">User</th>
                                    <th className="p-2 border">Assigned By</th>
                                    <th className="p-2 border">Answer Text</th>
                                    <th className="p-2 border">Answer Option</th>
                                    <th className="p-2 border">Image Answer</th>
                                    <th className="p-2 border">Total Points</th>
                                    <th className="p-2 border">Status</th>
                                    {filterStatus === "requested" && (
                                        <th className="p-2 border">Actions</th>
                                    )}
                                    <th className="p-2 border">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.answer_id}>
                                        <td className="p-2 border">{r.vision_title}</td>
                                        <td className="p-2 border">{r.question_title}</td>
                                        <td className="p-2 border">{r.user_name}</td>
                                        <td className="p-2 border">{r.teacher_name}</td>
                                        <td className="p-2 border">
                                            {r.answer_type === "text" ? r.answer_text : ""}
                                        </td>
                                        <td className="p-2 border">
                                            {r.answer_type === "option" ? r.answer_option : ""}
                                        </td>
                                        <td className="p-2 border">
                                            {r.answer_type === "image" && r.media_url && (
                                                <img
                                                    src={r.media_url}
                                                    alt="Answer"
                                                    className="h-12 w-12 object-cover cursor-pointer"
                                                    onClick={() => setLightboxUrl(r.media_url!)}
                                                />
                                            )}
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                defaultValue={r.score ?? ""}
                                                onBlur={(e) =>
                                                    handleScoreBlur(r.answer_id, e.target.value)
                                                }
                                                className="w-16 border p-1 rounded"
                                            />
                                        </td>
                                        <td className="p-2 border">{r.status}</td>

                                        {filterStatus === "requested" && (
                                            <td className="p-2 border space-x-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={async () => {
                                                        // First: update status to 'approved'
                                                        await fetch(
                                                            `${api_startpoint}/api/vision_sessions/${r.answer_id}/status`,
                                                            {
                                                                method: "PUT",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                },
                                                                body: JSON.stringify({ status: "approved" }),
                                                            }
                                                        );

                                                        // Second: call score API to store points
                                                        await fetch(
                                                            `${api_startpoint}/api/vision_sessions/${r.answer_id}/score`,
                                                            {
                                                                method: "PUT",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                },
                                                                body: JSON.stringify({
                                                                    points: r.points || 10,
                                                                }),
                                                            }
                                                        );

                                                        // Refresh sessions
                                                        fetchSessions();

                                                        // NEW: Show confirmation modal
                                                        setConfirmationModal({
                                                            show: true,
                                                            type: "approve",
                                                            message:
                                                                "Vision session approved successfully!",
                                                        });
                                                    }}
                                                >
                                                    Approved
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={async () => {
                                                        await fetch(
                                                            `${api_startpoint}/api/vision_sessions/${r.answer_id}/status`,
                                                            {
                                                                method: "PUT",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                },
                                                                body: JSON.stringify({ status: "rejected" }),
                                                            }
                                                        );
                                                        fetchSessions();

                                                        // NEW: Show confirmation modal
                                                        setConfirmationModal({
                                                            show: true,
                                                            type: "reject",
                                                            message:
                                                                "Vision session rejected successfully!",
                                                        });
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        )}

                                        <td className="p-2 border">
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

                        <span>Page {page}</span>

                        <button
                            className="btn btn-primary"
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={rows.length < perPage}
                        >
                            Next
                        </button>
                    </div>
                    {/* Lightbox Modal */}
                    {lightboxUrl && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <img
                                src={lightboxUrl}
                                className="max-h-[90vh] object-contain"
                            />
                            <button
                                className="absolute top-4 right-4 text-white text-2xl"
                                onClick={() => setLightboxUrl(null)}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* NEW: Confirmation Modal */}
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
                                            ? "Vision Approved"
                                            : "Vision Rejected"}
                                    </h4>
                                    <p className="text-muted mb-4">
                                        {confirmationModal.message}
                                    </p>
                                    <button
                                        className="btn btn-danger w-100" // Red button
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
                </div>
            </div>
        </>


    );
}
