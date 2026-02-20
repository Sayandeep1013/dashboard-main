"use client";

import "@tabler/core/dist/css/tabler.min.css";
import { useState, useEffect } from "react";
import React from "react";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/ui/sidebar";
import {
    IconSearch,
    IconX,
    IconCircleCheck,
    IconCircleX,
} from "@tabler/icons-react";
import {
    Download,
    Search,
    XCircle,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function MissionPage() {
    const user_type = 5; // Hardcoded for Teacher
    const [selectedFromDate, setSelectedFromDate] = useState("");
    const [selectedToDate, setSelectedToDate] = useState("");
    const [selectedMissionAcceptance, setSelectedMissionAcceptance] = useState("");
    const [selectedAssignedBy, setSelectedAssignBy] = useState("");
    const [tableData, setTableData] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const rowsPerPage = 50;
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [inputCode, setInputCode] = useState("");
    const [selectedSchoolCode, setSelectedSchoolCode] = useState<string[]>([]);
    const [selectedMobileNo, setSelectedMobileNo] = useState("");
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const [confirmationModal, setConfirmationModal] = useState({
        show: false,
        type: "",
        message: "",
    });

    const handleSearch = async (pageIndex: number) => {
        const filters = {
            mission_acceptance: selectedMissionAcceptance,
            assigned_by: selectedAssignedBy,
            from_date: selectedFromDate,
            to_date: selectedToDate,
            school_code: selectedSchoolCode.length > 0 ? selectedSchoolCode : undefined,
            mobile_no: selectedMobileNo,
            page: pageIndex + 1,
            per_page: rowsPerPage,
            user_type: user_type
        };

        setIsTableLoading(true);

        try {
            const res = await fetch(`${api_startpoint}/api/student_mission_search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });
            const result = await res.json();
            if (!result.data || !result.pagination) {
                console.error("Invalid response:", result);
                setTableData([]);
                setTotalPages(0);
                setTotalRows(0);
                return;
            }

            setTableData(result.data);
            setTotalPages(result.pagination.total_pages);
            setTotalRows(result.pagination.total);
            setCurrentPage(pageIndex);
        } catch (error) {
            console.error("Search error:", error);
            setTotalRows(0);
            setTableData([]);
        } finally {
            setIsTableLoading(false);
        }
    };

    useEffect(() => {
        handleSearch(0);
    }, []);

    const handleClear = () => {
        setSelectedMissionAcceptance("");
        setSelectedAssignBy("");
        setSelectedFromDate("");
        setSelectedToDate("");
        setSelectedSchoolCode([]);
        setSelectedMobileNo("");
        setTableData([]);
        setCurrentPage(0);
        setTotalPages(0);
    };

    const exportToCSV = () => {
        if (tableData.length === 0) {
            alert("No data to export. Please perform a search first.");
            return;
        }

        try {
            const headers = Object.keys(tableData[0]);
            let csvContent = headers.join(",") + "\n";

            tableData.forEach((row) => {
                const values = headers.map((header) => {
                    const cellValue = row[header] === null || row[header] === undefined ? "" : row[header];
                    const escapedValue = String(cellValue).replace(/"/g, '""');
                    return `"${escapedValue}"`;
                });
                csvContent += values.join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `student_data_export_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting CSV:", error);
            alert("An error occurred while exporting data. Please try again.");
        }
    };

    const handleStatusUpdate = async (
        rowId: string,
        missionId: string,
        studentId: string,
        action: "approve" | "reject"
    ) => {
        try {
            const response = await fetch(`${api_startpoint}/api/update_mission_status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    row_id: rowId,
                    mission_id: missionId,
                    student_id: studentId,
                    action: action,
                }),
            });

            if (!response.ok) throw new Error("Update failed");

            setConfirmationModal({
                show: true,
                type: action,
                message: `Mission has been ${action === "approve" ? "approved" : "rejected"} successfully!`,
            });

            handleSearch(0);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: "250px" }}>
                <div className="page-body">
                    <div className="container-xl pt-0 pb-4">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-4">Search & Filter</h5>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <select
                                            className="form-select"
                                            value={selectedMissionAcceptance}
                                            onChange={(e) => setSelectedMissionAcceptance(e.target.value)}
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

                        <div className="card shadow-sm border-0 mt-2">
                            <div className="card-body overflow-x-scroll">
                                <h5 className="card-title mb-4">
                                    {`Results- ${totalRows} Teachers found`}
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
                                    <>
                                        <table className="table table-striped">
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
                                                    {selectedMissionAcceptance === "Requested" && (
                                                        <th>Action</th>
                                                    )}
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
                                                                {row.media_url?.match(/\.(jpe?g|png|gif)$/i) ? (
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
                                                            {selectedMissionAcceptance === "Requested" && (
                                                                <td>
                                                                    {row.Status === "Requested" && (
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                className="btn btn-sm btn-success"
                                                                                onClick={() =>
                                                                                    handleStatusUpdate(
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
                                                                                    handleStatusUpdate(
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
                                        <div className="d-flex justify-content-between mt-3">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleSearch(currentPage - 1)}
                                                disabled={currentPage === 0}
                                            >
                                                Previous
                                            </button>
                                            <div className="d-flex align-items-center">
                                                <span className="mx-2">
                                                    Page {currentPage + 1} of {totalPages || 1}
                                                </span>
                                            </div>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleSearch(currentPage + 1)}
                                                disabled={currentPage + 1 >= totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
