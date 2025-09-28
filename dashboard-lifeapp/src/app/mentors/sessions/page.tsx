"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/ui/sidebar";
import "@tabler/core/dist/css/tabler.min.css";
import { IconEdit, IconEye, IconPlus, IconTrash } from "@tabler/icons-react"; // Added IconEye for Participants
const inter = Inter({ subsets: ["latin"] });

// --- API Endpoint Configuration ---

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

//wahterever

// --- TypeScript Interfaces ---

// Interface for a Mentor Session object
interface Session {
  id: number;
  user_id: number; // Mentor ID
  name: string; // Mentor Name (fetched via JOIN)
  heading: string;
  description?: string; // Optional description
  zoom_link: string;
  zoom_password: string;
  date_time: string; // Scheduled date and time
  status: number; // 1 = Active, 0 = Inactive
  created_at: string;
  updated_at: string;
}

// Interface for a Participant object (fetched for a specific session)
interface Participant {
  school_id: string;
  name: string;
  mobile_no: string;
  grade: string;
  city: string;
  state: string;
  la_session_id: number; // Link back to the session
}

// --- Main Component ---
export default function MentorSessions() {
  // --- State Management ---

  // State for the list of sessions fetched from the backend
  const [sessions, setSessions] = useState<Session[]>([]);
  // Loading state for the main table
  const [loading, setLoading] = useState<boolean>(true);
  // Current page number for pagination
  const [page, setPage] = useState<number>(1);
  // Number of items per page for pagination
  const [limit] = useState<number>(10);
  // Filter state for session status (all, active, inactive)
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State for the Edit Session Modal
  const [editModal, setEditModal] = useState<{
    open: boolean;
    session: Session | null;
  }>({
    open: false,
    session: null,
  });

  // State for the View Participants Modal
  const [participantsModal, setParticipantsModal] = useState<{
    open: boolean;
    sessionId: number | null;
    participants: Participant[];
    loading: boolean;
  }>({
    open: false,
    sessionId: null,
    participants: [],
    loading: false,
  });

  // State for the Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    session: Session | null;
  }>({
    open: false,
    session: null,
  });

  // --- Data Fetching Functions ---

  /**
   * Fetches the list of mentor sessions from the backend API.
   * This version fetches all sessions once and handles filtering/pagination client-side.
   */
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/sessions`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: Session[] = await res.json();
      // Update state with the full list of fetched sessions
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      // Optionally, show an error message to the user
      setSessions([]); // Ensure sessions is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the list of participants for a specific session.
   * @param sessionId The ID of the session to fetch participants for.
   */
  const fetchParticipants = async (sessionId: number) => {
    setParticipantsModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${api_startpoint}/api/session_participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: Participant[] = await res.json();
      setParticipantsModal((prev) => ({ ...prev, participants: data }));
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      setParticipantsModal((prev) => ({ ...prev, participants: [] })); // Clear on error
    } finally {
      setParticipantsModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // --- Effect Hooks ---

  // Fetch sessions on initial load
  useEffect(() => {
    fetchSessions();
  }, []);

  // Reset to page 1 whenever the status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // --- Derived Data (Client-Side Filtering & Pagination) ---

  // Apply status filter client-side
  const filteredSessions = sessions.filter((session) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "1") return session.status === 1;
    if (statusFilter === "0") return session.status === 0;
    return true; // Fallback
  });

  // Calculate pagination values based on filtered list
  const totalPages = Math.ceil(filteredSessions.length / limit);
  const paginatedSessions = filteredSessions.slice(
    (page - 1) * limit,
    page * limit
  );

  // --- UI Interaction Handlers ---

  /**
   * Opens the Edit Session modal with the selected session's data.
   * @param session The session object to edit.
   */
  const openEditModal = (session: Session) => {
    setEditModal({ open: true, session: { ...session } }); // Create a copy for editing
  };

  /**
   * Closes the Edit Session modal.
   */
  const closeEditModal = () => {
    setEditModal({ open: false, session: null });
  };

  /**
   * Handles changes to input fields in the Edit Session modal.
   * Updates the `editingSession` state.
   * @param field The name of the field being updated.
   * @param value The new value for the field.
   */
  const handleEditChange = (field: keyof Session, value: string | number) => {
    setEditModal((prev) => {
      if (!prev.session) return prev;
      return {
        ...prev,
        session: {
          ...prev.session,
          [field]: value,
        },
      };
    });
  };

  /**
   * Sends the updated session data to the backend API.
   */
  const handleSessionUpdate = async () => {
    if (!editModal.session) return;

    try {
      const res = await fetch(`${api_startpoint}/api/update_session`, {
        method: "POST", // Backend expects POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editModal.session), // Send the modified session object
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update session");
      }

      // On successful update, close the modal and refresh the session list
      closeEditModal();
      fetchSessions(); // Refresh the full list
    } catch (err) {
      console.error("Update error:", err);
      alert(
        `Error updating session: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  /**
   * Opens the View Participants modal for a given session.
   * Triggers fetching of participants.
   * @param sessionId The ID of the session to view participants for.
   */
  const openParticipantsModal = (sessionId: number) => {
    setParticipantsModal({
      open: true,
      sessionId,
      participants: [],
      loading: true,
    });
    fetchParticipants(sessionId);
  };

  /**
   * Closes the View Participants modal.
   */
  const closeParticipantsModal = () => {
    setParticipantsModal({
      open: false,
      sessionId: null,
      participants: [],
      loading: false,
    });
  };

  /**
   * Opens the Delete Confirmation modal for a given session.
   * @param session The session object to delete.
   */
  const openDeleteModal = (session: Session) => {
    setDeleteModal({ open: true, session });
  };

  /**
   * Closes the Delete Confirmation modal.
   */
  const closeDeleteModal = () => {
    setDeleteModal({ open: false, session: null });
  };

  /**
   * Sends a request to delete a session from the backend.
   * @param id The ID of the session to delete.
   */
  const handleDelete = async (id: number) => {
    if (!deleteModal.session) return;

    try {
      const res = await fetch(`${api_startpoint}/api/delete_session/${id}`, {
        method: "DELETE", // Backend expects DELETE
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete session");
      }

      // On successful delete, close the modal and refresh the session list
      closeDeleteModal();
      fetchSessions(); // Refresh the full list
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        `Error deleting session: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  // --- Helper Functions ---

  /**
   * Converts numeric status (0/1) to a user-friendly string.
   * @param status The numeric status value.
   * @returns "Active" or "Inactive".
   */
  const renderStatus = (status: number) => {
    return status === 1 ? "Active" : "Inactive";
  };

  // --- Rendered JSX ---
  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-2">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="text-xl font-semibold">Mentor Sessions</h2>
              {/* Placeholder for potential Add Session button if needed in future */}
              {/* <button className="btn btn-primary" onClick={openAdd}>
                <IconPlus className="me-2" /> Add Session
              </button> */}
            </div>

            {/* Total Sessions Count Card - Original Style, No Loading Spinner, Less Spacing */}
            {/* Reduced mb from mb-3 to mb-2 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
              <div className="bg-white shadow rounded p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Total Sessions
                </div>
                {/* Display total directly from filtered list, no spinner */}
                <div className="text-2xl font-semibold text-sky-950">
                  {filteredSessions.length}{" "}
                  {/* Count based on current filter */}
                </div>
              </div>
            </div>

            {/* Status Filter Dropdown - Reduced mb from mb-3 to mb-2 */}
            <div className="d-flex justify-content-start mb-2">
              <select
                className="form-select w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Sessions</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Main Table Card */}
            <div className="card">
              <div className="card-body">
                {loading ? (
                  // Loading Spinner
                  <div className="text-center py-10">
                    <div
                      className="spinner-border text-purple"
                      role="status"
                      style={{ width: "3rem", height: "3rem" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading sessions...</p>
                  </div>
                ) : (
                  // Session Table
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          {[
                            // "ID",
                            "s. No.",
                            "Mentor Name",
                            "Heading",
                            "Description", // Added Description column
                            "Zoom Link",
                            "Zoom Password",
                            "Date Time",
                            "Status",
                            "Created",
                            "Updated",
                            "Actions", // Combined actions column
                          ].map((header) => (
                            <th key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSessions.length > 0 ? (
                          paginatedSessions.map((session, index) => (
                            <tr key={session.id}>
                              {/* <td>{session.id}</td> */}
                              <td>{(page - 1) * 10 + index + 1}</td>
                              <td>{session.name}</td> {/* Mentor Name */}
                              <td>{session.heading}</td>
                              <td>{session.description || "—"}</td>{" "}
                              {/* Show description or placeholder */}
                              <td>
                                {/* Make Zoom Link clickable */}
                                {session.zoom_link ? (
                                  <a
                                    href={session.zoom_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Join Session
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td>{session.zoom_password || "—"}</td>
                              <td>
                                {new Date(session.date_time).toLocaleString()}
                              </td>
                              <td>{renderStatus(session.status)}</td>
                              <td>
                                {new Date(
                                  session.created_at
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                {new Date(
                                  session.updated_at
                                ).toLocaleDateString()}
                              </td>
                              <td className="flex gap-2">
                                {/* Edit Button */}
                                <IconEdit
                                  className="cursor-pointer"
                                  onClick={() => openEditModal(session)}
                                />
                                {/* View Participants Button */}
                                <IconEye
                                  className="cursor-pointer text-info"
                                  onClick={() =>
                                    openParticipantsModal(session.id)
                                  }
                                />
                                {/* Delete Button */}
                                <IconTrash
                                  className="cursor-pointer text-red-600"
                                  onClick={() => openDeleteModal(session)}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          // No Sessions Found Message
                          <tr>
                            <td
                              colSpan={11}
                              className="text-center text-muted py-4"
                            >
                              No sessions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="d-flex align-items-center justify-content-between mt-4">
                      <span className="text-muted">
                        Showing{" "}
                        {Math.min(
                          (page - 1) * limit + 1,
                          filteredSessions.length
                        )}{" "}
                        to {Math.min(page * limit, filteredSessions.length)} of{" "}
                        {filteredSessions.length} entries
                      </span>
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-primary"
                          disabled={page <= 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous
                        </button>
                        <span className="btn btn-outline-primary disabled">
                          Page {page} of {totalPages || 1}
                        </span>
                        <button
                          className="btn btn-outline-primary"
                          disabled={page >= totalPages}
                          onClick={() => setPage(page + 1)}
                        >
                          Next
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

      {/* --- Modals --- */}

      {/* Edit Session Modal */}
      {editModal.open && editModal.session && (
        <div
          className="modal modal-blur fade show d-block"
          id="editSessionModal"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Session</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Heading</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editModal.session.heading}
                    onChange={(e) =>
                      handleEditChange("heading", e.target.value)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editModal.session.description || ""}
                    onChange={(e) =>
                      handleEditChange("description", e.target.value)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editModal.session.status}
                    onChange={(e) =>
                      handleEditChange("status", parseInt(e.target.value, 10))
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link link-secondary me-auto"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSessionUpdate}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Participants Modal */}
      {participantsModal.open && (
        <div
          className="modal modal-blur fade show d-block"
          id="participantsModal"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Session Participants</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeParticipantsModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {participantsModal.loading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border text-purple"
                      role="status"
                      style={{ width: "3rem", height: "3rem" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading participants...</p>
                  </div>
                ) : participantsModal.participants.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>School ID</th>
                          <th>Name</th>
                          <th>Mobile</th>
                          <th>Grade</th>
                          <th>City</th>
                          <th>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participantsModal.participants.map((participant) => (
                          <tr
                            key={`${participant.mobile_no}-${participant.la_session_id}`}
                          >
                            {" "}
                            {/* Unique key */}
                            <td>{participant.school_id}</td>
                            <td>{participant.name}</td>
                            <td>{participant.mobile_no}</td>
                            <td>{participant.grade}</td>
                            <td>{participant.city}</td>
                            <td>{participant.state}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    No participants found for this session.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeParticipantsModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.session && (
        <div
          className="modal modal-blur fade show d-block"
          id="deleteConfirmationModal"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the session{" "}
                  <strong>{deleteModal.session.heading}</strong>? This action
                  cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link link-secondary me-auto"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteModal.session!.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
