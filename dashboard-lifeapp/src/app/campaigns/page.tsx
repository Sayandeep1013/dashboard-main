"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/ui/sidebar";
import "@tabler/core/dist/css/tabler.min.css";
import { IconEdit, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import AddCampaignModal from "./AddCampaignModal";
const inter = Inter({ subsets: ["latin"] });



// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

// new api startpoint added

interface Campaign {
  id: number;
  game_type: number;
  game_type_title?: string;
  reference_id: number;
  reference_title: string;
  campaign_title: string;
  description: string;
  button_name?: string;
  image_url?: string;
  scheduled_for: string;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
  status?: number;
}
interface CampaignStats {
  total_submission: number;
  total_approved?: number;
  total_rejected?: number;
  total_requested?: number;
  total_coins_earned: number;
}

// --- New Interface for Mentor Session Edit ---
interface MentorSessionData {
  title: string;
  description: string;
  status: number;
  scheduled_for: string; // Keep as string for date input
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<
    false | { mode: "add" | "edit"; campaign?: Campaign }
  >(false);
  // --- New state for Mentor Session Modal ---
  const [mentorSessionModal, setMentorSessionModal] = useState<{
    isOpen: boolean;
    campaignId: number | null;
    initialData: MentorSessionData | null;
    loading: boolean;
  }>({
    isOpen: false,
    campaignId: null,
    initialData: null,
    loading: false,
  });
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    campaign: Campaign | null;
    stats: CampaignStats | null;
    loading: boolean;
  }>({
    open: false,
    campaign: null,
    stats: null,
    loading: false,
  });
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(
    null
  );
  const [schoolCode, setSchoolCode] = useState("");

  const fetchCampaigns = async (page = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: page.toString(), per_page: "25" });
      const res = await fetch(`${api_startpoint}/api/campaigns?${qs}`);
      const result = await res.json();
      setCampaigns(result.data || []);
      setTotal(result.total || 0);
      setPage(result.page || 1);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStats = async (campaignId: number, code: string) => {
    setDetailsModal((prev) => ({ ...prev, loading: true }));
    try {
      const qs = new URLSearchParams();
      if (code) qs.append("school_code", code);
      const res = await fetch(
        `${api_startpoint}/api/campaigns/${campaignId}/details?${qs}`
      );
      const stats = await res.json();
      setDetailsModal((prev) => ({ ...prev, stats }));
    } catch (err) {
      console.error("Error fetching campaign stats:", err);
    } finally {
      setDetailsModal((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openAdd = () => setModal({ mode: "add" });
  const openEdit = (camp: Campaign) =>
    setModal({ mode: "edit", campaign: camp });
  const closeModal = () => setModal(false);

  // --- New function to open Mentor Session Edit Modal ---
  const openMentorSessionEdit = (camp: Campaign) => {
    // Normalize date for input
    const normalizedDate = camp.scheduled_for
      ? new Date(camp.scheduled_for).toISOString().split("T")[0]
      : "";
    setMentorSessionModal({
      isOpen: true,
      campaignId: camp.id,
      initialData: {
        title: camp.campaign_title || "",
        description: camp.description || "",
        status: camp.status ?? 1,
        scheduled_for: normalizedDate,
      },
      loading: false,
    });
  };

  const closeMentorSessionModal = () => {
    setMentorSessionModal({
      isOpen: false,
      campaignId: null,
      initialData: null,
      loading: false,
    });
  };

  const openDetails = (campaign: Campaign) => {
    setSchoolCode("");
    setDetailsModal({
      open: true,
      campaign,
      stats: null,
      loading: true,
    });
    fetchCampaignStats(campaign.id, "");
  };
  const closeDetails = () =>
    setDetailsModal({
      open: false,
      campaign: null,
      stats: null,
      loading: false,
    });

  const handleDelete = async (id: number) => {
    if (!campaignToDelete) return;
    await fetch(`${api_startpoint}/api/campaigns/${id}`, { method: "DELETE" });
    fetchCampaigns();
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const confirmDelete = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  // --- Function to handle saving Mentor Session changes ---
  const handleSaveMentorSession = async (data: MentorSessionData) => {
    if (!mentorSessionModal.campaignId) return;

    setMentorSessionModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        `${api_startpoint}/api/campaigns/${mentorSessionModal.campaignId}/mentor-session`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        console.log("✅ Mentor Session updated successfully");
        fetchCampaigns(); // Refresh the list
        closeMentorSessionModal();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Error updating Mentor Session:", errorData);
        alert(errorData.message || "Failed to update Mentor Session");
      }
    } catch (err) {
      console.error("🔥 Network error updating Mentor Session:", err);
      alert("Network error occurred while updating.");
    } finally {
      setMentorSessionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="text-xl font-semibold">Campaigns</h2>
              <button className="btn btn-primary" onClick={openAdd}>
                <IconPlus className="me-2" /> Add Campaign
              </button>
            </div>
            {loading ? (
              <div className="text-center py-10">
                <div
                  className="spinner-border text-purple"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading campaigns...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      {[
                        "ID",
                        "Type",
                        "Image",
                        "Ref Title",
                        "Title",
                        "Desc",
                        "Status",
                        "Button",
                        "Scheduled",
                        "End Date",
                        "Created",
                        "Updated",
                        "Details",
                        "Actions",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="h-12">
                        <td>{c.id}</td>
                        <td>{c.game_type_title}</td>
                        <td style={{ width: 72 }}>
                          {c.image_url ? (
                            <img
                              src={c.image_url}
                              className="h-10 w-10 object-cover rounded"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>{c.reference_title || "—"}</td>
                        <td>{c.campaign_title}</td>
                        <td>{c.description}</td>
                        <td>{c.status == 1 ? "active" : "inactive"}</td>
                        <td>{c.button_name || "Start"}</td>
                        <td>{c.scheduled_for}</td>
                        <td>
                          {c.ended_at
                            ? new Date(c.ended_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{c.created_at}</td>
                        <td>{c.updated_at}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openDetails(c)}
                          >
                            View Stats
                          </button>
                        </td>
                        <td className="flex gap-2">
                          {/* Enable Edit for Mentor Session (Type 8) */}
                          {c.game_type === 8 ? (
                            <IconEdit
                              className="cursor-pointer"
                              onClick={() => openMentorSessionEdit(c)}
                            />
                          ) : (
                            <IconEdit
                              className="cursor-pointer"
                              onClick={() => openEdit(c)}
                            />
                          )}
                          <IconTrash
                            className="cursor-pointer text-red-600"
                            onClick={() => confirmDelete(c)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    className="btn"
                    disabled={page <= 1}
                    onClick={() => fetchCampaigns(page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {Math.ceil(total / 25)}
                  </span>
                  <button
                    className="btn"
                    disabled={page * 25 >= total}
                    onClick={() => fetchCampaigns(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          {modal && (
            <AddCampaignModal
              mode={modal.mode}
              initial={modal.campaign}
              onClose={() => {
                closeModal();
                fetchCampaigns();
              }}
            />
          )}
          {/* --- Render Mentor Session Edit Modal --- */}
          {mentorSessionModal.isOpen && mentorSessionModal.initialData && (
            <MentorSessionEditModal
              initialData={mentorSessionModal.initialData}
              onSave={handleSaveMentorSession}
              onClose={closeMentorSessionModal}
              loading={mentorSessionModal.loading}
            />
          )}
          {detailsModal.open && (
            <div
              className="modal d-block"
              tabIndex={-1}
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {detailsModal.campaign?.campaign_title} Statistics
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeDetails}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-4">
                      <label className="form-label">School Code Filter</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={schoolCode}
                          onChange={(e) => setSchoolCode(e.target.value)}
                          placeholder="Enter school code"
                        />
                        <button
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={() =>
                            detailsModal.campaign &&
                            fetchCampaignStats(
                              detailsModal.campaign.id,
                              schoolCode
                            )
                          }
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    {detailsModal.loading ? (
                      <div className="text-center py-4">
                        <div
                          className="spinner-border text-purple"
                          role="status"
                          style={{ width: "3rem", height: "3rem" }}
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading campaign statistics...</p>
                      </div>
                    ) : detailsModal.stats ? (
                      <div className="space-y-3">
                        {/* Simplified stats for Mentor Session (Type 8) */}
                        {detailsModal.campaign?.game_type === 8 ? (
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold">
                              Total Participants Booked:
                            </span>
                            <span>{detailsModal.stats.total_submission}</span>
                          </div>
                        ) : (
                          // Standard stats for other types
                          <>
                            <div className="d-flex justify-content-between">
                              <span className="fw-bold">
                                Total Participants:
                              </span>
                              <span>{detailsModal.stats.total_submission}</span>
                            </div>
                            {detailsModal.campaign?.game_type !== 2 && (
                              <>
                                <div className="d-flex justify-content-between">
                                  <span className="fw-bold">Approved:</span>
                                  <span>
                                    {detailsModal.stats.total_approved}
                                  </span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span className="fw-bold">Rejected:</span>
                                  <span>
                                    {detailsModal.stats.total_rejected}
                                  </span>
                                </div>
                                <div className="d-flex justify-content-between">
                                  <span className="fw-bold">
                                    Pending Review:
                                  </span>
                                  <span>
                                    {detailsModal.stats.total_requested}
                                  </span>
                                </div>
                              </>
                            )}
                            <div className="d-flex justify-content-between border-top pt-2">
                              <span className="fw-bold">
                                Total Coins Earned:
                              </span>
                              <span className="text-success fw-bold">
                                {detailsModal.stats.total_coins_earned}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-danger">
                        Failed to load campaign statistics
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeDetails}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showDeleteModal && campaignToDelete && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              style={{ marginLeft: "250px" }}
            >
              <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{campaignToDelete.campaign_title}</strong>?
                </p>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCampaignToDelete(null);
                    }}
                    className="px-4 py-1 rounded border border-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(campaignToDelete.id)}
                    className="px-4 py-1 rounded bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- New Component for Mentor Session Edit Modal ---
interface MentorSessionEditModalProps {
  initialData: MentorSessionData;
  onSave: (data: MentorSessionData) => void;
  onClose: () => void;
  loading: boolean;
}

const MentorSessionEditModal: React.FC<MentorSessionEditModalProps> = ({
  initialData,
  onSave,
  onClose,
  loading,
}) => {
  const [formData, setFormData] = useState<MentorSessionData>(initialData);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-xl mb-0">Edit Mentor Session</h2>
              <button
                className="btn btn-icon"
                onClick={onClose}
                aria-label="Close"
              >
                <IconX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label">Scheduled Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="scheduled_for"
                  value={formData.scheduled_for}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading || !formData.title || !formData.scheduled_for
                  }
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
