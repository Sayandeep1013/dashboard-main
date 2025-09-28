"use client";
import "@tabler/core/dist/css/tabler.min.css";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Sidebar } from "@/components/ui/sidebar";
import {
  IconSearch,
  IconTrash,
  IconEdit,
  IconPlus,
  IconFilterOff,
} from "@tabler/icons-react";

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

interface Coupon {
  id: number;
  title: string;
  category_id: number;
  category_title: string;
  coin: string;
  link: string;
  details: string;
  index: number;
  media_id: number;
  created_at: string;
  updated_at: string;
  media_path?: string;
  media_url?: string;
  type: number;
  status: number;
}

interface Category {
  id: number;
  title: string;
}

interface AppSetting {
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

// Map keys to user-friendly titles
const keyToTitleMap: Record<string, string> = {
  coin_per_rupee: "Coins Per Rupee",
  redeem_budget_rupees_student: "Student Monthly Budget ",
  redeem_budget_rupees_teacher: "Teacher Monthly Budget ",
};

// Map keys to editable descriptions (stored in frontend only)
const keyToDescriptionMap: Record<string, string> = {
  coin_per_rupee: "How many coins equal 1 rupee (used in conversion)",
  redeem_budget_rupees_student: "Monthly redemption budget for all students",
  redeem_budget_rupees_teacher: "Monthly redemption budget for all teachers",
};

export default function SettingsCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSettingModal, setShowAddSettingModal] = useState(false);
  const [showEditSettingModal, setShowEditSettingModal] = useState(false);
  const [showDeleteSettingModal, setShowDeleteSettingModal] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedSetting, setSelectedSetting] = useState<AppSetting | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteSettingKey, setDeleteSettingKey] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [loading, setLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isAddSettingLoading, setIsAddSettingLoading] = useState(false);
  const [isEditSettingLoading, setIsEditSettingLoading] = useState(false);
  const [isDeleteSettingLoading, setIsDeleteSettingLoading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    category_id: string;
    coin: string;
    link: string;
    details: string;
    index: string;
    mediaFile: File | null;
    type: string;
    status: string;
  }>({
    title: "",
    category_id: "",
    coin: "",
    link: "",
    details: "",
    index: "",
    mediaFile: null,
    type: "1",
    status: "1",
  });

  const [settingForm, setSettingForm] = useState<{
    key: string;
    value: string;
    title: string;
    description: string;
  }>({
    key: "",
    value: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
    fetchAppSettings();
  }, [startDate, endDate, typeFilter, statusFilter]);

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${api_startpoint}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to load categories",
        type: "error",
      });
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (typeFilter !== null) params.append("type", typeFilter.toString());
      if (statusFilter !== null)
        params.append("status", statusFilter.toString());
      const response = await fetch(`${api_startpoint}/api/coupons?${params}`);
      const data = await response.json();
      setCoupons(data.data);
      setTotalCount(data.count);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to load coupons",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppSettings = async () => {
    try {
      const response = await fetch(`${api_startpoint}/api/app-settings`);
      const data = await response.json();
      setAppSettings(data);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to load settings",
        type: "error",
      });
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setTypeFilter(null);
    setStatusFilter(null);
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, itemsPerPage]);

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      title: coupon.title,
      category_id: String(coupon.category_id),
      coin: coupon.coin,
      link: coupon.link,
      details: coupon.details,
      index: String(coupon.index),
      mediaFile: null,
      type: String(coupon.type),
      status: String(coupon.status),
    });
    setShowEditModal(true);
  };

  const openEditSettingModal = (setting: AppSetting) => {
    const title = keyToTitleMap[setting.key] || setting.key.replace(/_/g, " ");
    const description =
      keyToDescriptionMap[setting.key] ||
      "Custom application setting. Describe what this does.";
    setSelectedSetting(setting);
    setSettingForm({
      key: setting.key,
      value: setting.value,
      title,
      description,
    });
    setShowEditSettingModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleteLoading(true);
      if (deleteId) {
        await fetch(`${api_startpoint}/api/coupons/${deleteId}`, {
          method: "DELETE",
        });
        setShowDeleteModal(false);
        fetchCoupons();
        setToast({ show: true, message: "Coupon deleted", type: "success" });
      }
    } catch (error) {
      setToast({ show: true, message: "Delete failed", type: "error" });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteSetting = async () => {
    try {
      setIsDeleteSettingLoading(true);
      if (deleteSettingKey) {
        await fetch(`${api_startpoint}/api/app-settings/${deleteSettingKey}`, {
          method: "DELETE",
        });
        setShowDeleteSettingModal(false);
        fetchAppSettings();
        setToast({ show: true, message: "Setting deleted", type: "success" });
      }
    } catch (error) {
      setToast({ show: true, message: "Delete failed", type: "error" });
    } finally {
      setIsDeleteSettingLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url =
      showEditModal && selectedCoupon
        ? `${api_startpoint}/api/coupons/${selectedCoupon.id}`
        : `${api_startpoint}/api/coupons`;
    const method = showEditModal ? "PUT" : "POST";
    if (method === "POST") setIsAddLoading(true);
    else setIsEditLoading(true);

    const form = new FormData();
    form.append("title", formData.title);
    form.append("category_id", formData.category_id);
    form.append("coin", formData.coin);
    form.append("link", formData.link);
    form.append("details", formData.details);
    form.append("index", formData.index);
    form.append("type", formData.type);
    form.append("status", formData.status);
    if (formData.mediaFile) form.append("media", formData.mediaFile);

    try {
      const response = await fetch(url, { method, body: form });
      if (response.ok) {
        setShowAddModal(false);
        setShowEditModal(false);
        fetchCoupons();
        setToast({
          show: true,
          message: method === "POST" ? "Coupon created" : "Coupon updated",
          type: "success",
        });
      } else {
        setToast({ show: true, message: "Save failed", type: "error" });
      }
    } catch (error) {
      setToast({ show: true, message: "Network error", type: "error" });
    } finally {
      setIsAddLoading(false);
      setIsEditLoading(false);
    }
  };

  const handleSettingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update the frontend-only description map
    if (settingForm.key) {
      keyToDescriptionMap[settingForm.key] = settingForm.description;
      keyToTitleMap[settingForm.key] = settingForm.title;
    }

    const url = showEditSettingModal
      ? `${api_startpoint}/api/app-settings/${settingForm.key}`
      : `${api_startpoint}/api/app-settings`;
    const method = showEditSettingModal ? "PUT" : "POST";

    if (method === "POST") setIsAddSettingLoading(true);
    else setIsEditSettingLoading(true);

    try {
      const payload = {
        key: settingForm.key.trim(),
        value: settingForm.value.trim(),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowAddSettingModal(false);
        setShowEditSettingModal(false);
        fetchAppSettings();
        setToast({
          show: true,
          message: method === "POST" ? "Setting created" : "Setting updated",
          type: "success",
        });
      } else {
        const err = await response.json();
        setToast({ show: true, message: `Error: ${err.error}`, type: "error" });
      }
    } catch (error) {
      setToast({ show: true, message: "Network error", type: "error" });
    } finally {
      setIsAddSettingLoading(false);
      setIsEditSettingLoading(false);
    }
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (e) {
      return "—";
    }
  };

  const getTypeText = (type: number) => (type === 1 ? "Student" : "Teacher");
  const getStatusText = (status: number) =>
    status === 1 ? "Active" : "Inactive";

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
            {/* App Settings Table */}
            <div className="card mb-4">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">Shop Budget</h3>
                  <div className="mx-2 flex gap-2">
                    {/* Commented out Add New Budget button */}
                    {/* <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSettingForm({
                          key: "",
                          value: "",
                          title: "",
                          description: "",
                        });
                        setShowAddSettingModal(true);
                      }}
                    >
                      <IconPlus size={16} className="mr-1" />
                      Add New Budget
                    </button> */}
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-vcenter table-hover">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Title</th>
                      {/* Commented out Key column header */}
                      {/* <th>Key</th> */}
                      <th>Value</th>
                      <th>Description</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appSettings.length > 0 ? (
                      appSettings.map((setting, idx) => {
                        const title =
                          keyToTitleMap[setting.key] ||
                          setting.key.replace(/_/g, " ");
                        const description =
                          keyToDescriptionMap[setting.key] ||
                          "No description provided.";
                        return (
                          <tr key={setting.key}>
                            <td>{idx + 1}</td>
                            <td>{title}</td>
                            {/* Commented out Key column data */}
                            {/* <td>
                              <code>{setting.key}</code>
                            </td> */}
                            <td>{setting.value}</td>
                            <td className="text-muted">{description}</td>
                            <td>{formatDateTime(setting.created_at)}</td>
                            <td>{formatDateTime(setting.updated_at)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-icon"
                                  onClick={() => openEditSettingModal(setting)}
                                >
                                  <IconEdit size={16} />
                                </button>
                                <button
                                  className="btn btn-icon text-danger"
                                  onClick={() => {
                                    setDeleteSettingKey(setting.key);
                                    setShowDeleteSettingModal(true);
                                  }}
                                >
                                  <IconTrash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center text-muted">
                          No settings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">Coupons ({totalCount})</h3>
                  <div className="mx-2 flex gap-2">
                    <select
                      className="form-select"
                      value={
                        typeFilter === null ? "all" : typeFilter.toString()
                      }
                      onChange={(e) => {
                        setTypeFilter(
                          e.target.value === "all"
                            ? null
                            : parseInt(e.target.value)
                        );
                      }}
                    >
                      <option value="all">All Coupons</option>
                      <option value="1">Student</option>
                      <option value="2">Teacher</option>
                    </select>
                    <select
                      className="form-select"
                      value={
                        statusFilter === null ? "all" : statusFilter.toString()
                      }
                      onChange={(e) => {
                        setStatusFilter(
                          e.target.value === "all"
                            ? null
                            : parseInt(e.target.value)
                        );
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={fetchCoupons}
                      disabled={
                        loading ||
                        (!startDate &&
                          !endDate &&
                          typeFilter === null &&
                          statusFilter === null)
                      }
                    >
                      {loading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                      ) : (
                        <IconSearch size={16} />
                      )}
                      Apply Filters
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={clearFilters}
                    >
                      <IconFilterOff size={16} />
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowAddModal(true);
                        setFormData({
                          title: "",
                          category_id: "",
                          coin: "",
                          link: "",
                          details: "",
                          index: "",
                          mediaFile: null,
                          type: "1",
                          status: "1",
                        });
                      }}
                    >
                      <IconPlus size={16} className="mr-1" />
                      Add Coupon
                    </button>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                {loading ? (
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px" }}
                  >
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  </div>
                ) : (
                  <table className="table table-vcenter table-hover">
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Link</th>
                        <th>Category</th>
                        <th>Coin</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((coupon, idx) => (
                        <tr key={coupon.id}>
                          <td>{idx + 1}</td>
                          <td>
                            {coupon.media_url?.match(/\.(jpe?g|png|gif)$/i) ? (
                              <img
                                src={coupon.media_url}
                                className="w-12 h-12 object-cover cursor-pointer"
                                onClick={() =>
                                  setLightboxUrl(coupon.media_url!)
                                }
                              />
                            ) : coupon.media_url ? (
                              <button
                                className="btn btn-link"
                                onClick={() =>
                                  window.open(coupon.media_url, "_blank")
                                }
                              >
                                📄 File
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td>{coupon.title}</td>
                          <td>{getTypeText(coupon.type)}</td>
                          <td>{getStatusText(coupon.status)}</td>
                          <td>{coupon.link}</td>
                          <td>{coupon.category_title}</td>
                          <td>{coupon.coin}</td>
                          <td>{formatDateTime(coupon.created_at)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-icon"
                                onClick={() => openEditModal(coupon)}
                              >
                                <IconEdit size={16} />
                              </button>
                              <button
                                className="btn btn-icon text-danger"
                                onClick={() => {
                                  setDeleteId(coupon.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <IconTrash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="card-footer">
                <PaginationControls />
              </div>
            </div>
          </div>
        </div>

        {/* === MODALS === */}
        {/* Add Setting Modal */}
        {showAddSettingModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New App Setting</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddSettingModal(false)}
                    ></button>
                  </div>
                  <form onSubmit={handleSettingSubmit}>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settingForm.title}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Coins Per Rupee"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Key (Database Identifier)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={settingForm.key}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              key: e.target.value,
                            })
                          }
                          placeholder="e.g. coin_per_rupee"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Value</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={settingForm.value}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              value: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={settingForm.description}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe what this setting does..."
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddSettingModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isAddSettingLoading}
                      >
                        {isAddSettingLoading && (
                          <div className="animate-spin rounded-full w-4 h-4 border-t-4 border-white mr-2"></div>
                        )}
                        {isAddSettingLoading ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Setting Modal */}
        {showEditSettingModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Setting</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEditSettingModal(false)}
                    ></button>
                  </div>
                  <form onSubmit={handleSettingSubmit}>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Key (Read-only)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settingForm.key}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Title </label>
                        <input
                          type="text"
                          className="form-control"
                          value={settingForm.title}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              title: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Value</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={settingForm.value}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              value: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={settingForm.description}
                          onChange={(e) =>
                            setSettingForm({
                              ...settingForm,
                              description: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowEditSettingModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isEditSettingLoading}
                      >
                        {isEditSettingLoading && (
                          <div className="animate-spin rounded-full w-4 h-4 border-t-4 border-white mr-2"></div>
                        )}
                        {isEditSettingLoading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Setting Modal */}
        {showDeleteSettingModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Delete Setting</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteSettingModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete the Budget{" "}
                    <strong>{deleteSettingKey}</strong>? This cannot be undone.
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteSettingModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteSetting}
                      disabled={isDeleteSettingLoading}
                    >
                      {isDeleteSettingLoading && (
                        <div className="animate-spin rounded-full w-4 h-4 border-t-4 border-white mr-2"></div>
                      )}
                      {isDeleteSettingLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Coupon Modal */}
        {showAddModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Coupon</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                    ></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            value={formData.category_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category_id: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Select</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Coin</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.coin}
                            onChange={(e) =>
                              setFormData({ ...formData, coin: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Link</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.link}
                            onChange={(e) =>
                              setFormData({ ...formData, link: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Index</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.index}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                index: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Type</label>
                          <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) =>
                              setFormData({ ...formData, type: e.target.value })
                            }
                          >
                            <option value="1">Student</option>
                            <option value="2">Teacher</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Media</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mediaFile: e.target.files?.[0] || null,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Details</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={formData.details}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                details: e.target.value,
                              })
                            }
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isAddLoading}
                      >
                        {isAddLoading && (
                          <div className="animate-spin rounded-full w-4 h-4 border-t-4 border-white mr-2"></div>
                        )}
                        {isAddLoading ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Coupon Modal */}
        {showEditModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Coupon</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    ></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Category</label>
                          <select
                            className="form-select"
                            value={formData.category_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                category_id: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Select</option>
                            {categories.map((c) => (
                              <option
                                key={c.id}
                                value={c.id}
                                selected={selectedCoupon?.category_id === c.id}
                              >
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Coin</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.coin}
                            onChange={(e) =>
                              setFormData({ ...formData, coin: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Link</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.link}
                            onChange={(e) =>
                              setFormData({ ...formData, link: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Index</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.index}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                index: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Type</label>
                          <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) =>
                              setFormData({ ...formData, type: e.target.value })
                            }
                          >
                            <option value="1">Student</option>
                            <option value="2">Teacher</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Media</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                mediaFile: e.target.files?.[0] || null,
                              })
                            }
                          />
                          <small className="text-muted">
                            Leave empty to keep current image
                          </small>
                          {selectedCoupon?.media_url && (
                            <div className="mt-2">
                              <img
                                src={selectedCoupon.media_url}
                                alt="Current"
                                className="w-12 h-12 object-cover"
                              />
                              <span className="ml-2">Current Image</span>
                            </div>
                          )}
                        </div>
                        <div className="col-12">
                          <label className="form-label">Details</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            value={formData.details}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                details: e.target.value,
                              })
                            }
                          ></textarea>
                        </div>
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
                        {isEditLoading && (
                          <div className="animate-spin rounded-full w-4 h-4 border-t-4 border-white mr-2"></div>
                        )}
                        {isEditLoading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Coupon Modal */}
        {showDeleteModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Delete Coupon</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete this coupon? This action
                    cannot be undone.
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
                      onClick={handleDelete}
                      disabled={isDeleteLoading}
                    >
                      {isDeleteLoading && (
                        <div className="animate-spin rounded-full w-4 h-4 border-t-4 border-white mr-2"></div>
                      )}
                      {isDeleteLoading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
                className="img-fluid rounded"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="white"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.354 4.646a.5.5 0 1 1 .708-.708L8 5.854l1.942-1.942a.5.5 0 0 1 .708.708L8.707 6.5l1.942 1.942a.5.5 0 0 1-.708.708L8 7.207l-1.942 1.942a.5.5 0 0 1-.708-.708L7.293 6.5 5.354 4.646Z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 transition-all duration-300 ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? "✅" : "❌"}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
