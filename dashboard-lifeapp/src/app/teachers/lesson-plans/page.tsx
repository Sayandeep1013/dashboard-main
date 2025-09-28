"use client";
import "@tabler/core/dist/css/tabler.min.css";
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from "react";
import React from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Sidebar } from "@/components/ui/sidebar";
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { Plus, Search, XCircle } from "lucide-react";

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '600', '700'],
//   variable: '--font-poppins',
// });

interface LessonPlan {
  id: number;
  language: string;
  type: string;
  title: string;
  status: string;
  media_url?: string;
}

interface Language {
  id: number;
  name: string;
}

// Map of type labels to numeric TINYINT values:
const TYPE_OPTIONS = [
  { label: "Life Lab - Demo Models", value: 1 },
  { label: "Jigyasa - Self DIY Activities", value: 2 },
  { label: "Pragya - DIY Activities With Life Lab KITS", value: 3 },
  { label: "Life Lab - Activities Lesson Plans", value: 4 },
  { label: "Default type (None Mentioned)", value: 0 },
];

// Helper: convert the textual type (as returned by the API) to the numeric TINYINT
function labelToTypeValue(label: string): number {
  const found = TYPE_OPTIONS.find((opt) => opt.label === label);
  return found ? found.value : 0;
}

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";


export default function LessonPlans() {
  // filters
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  // data + loading
  const [tableData, setTableData] = useState<LessonPlan[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const rowsPerPage = 50;
  const paginatedData = tableData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState<LessonPlan | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newLessonPlan, setNewLessonPlan] = useState<LessonPlan | null>(null);

  // A fallback mapping if needed (if your languages array is empty)
  // const languageMap: Record<string, number> = {
  //     "English": 1,
  //     "Hindi": 2,
  //     "Tamil": 3,
  //     "Marathi": 4,
  //     "Telugu": 5,
  //     "Kannada": 6,
  //     "Malayalam": 7,
  //     "Odiya": 8,
  //     "Gujarati": 9,
  // };

  // Fetch available languages
  async function fetchLanguages() {
    try {
      const res = await fetch(`${api_startpoint}/api/lesson_plan_languages_2`);
      const data: Language[] = await res.json();
      setLanguages(data);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  }

  // Load all lesson plans (called on component mount)
  async function loadAllLessonPlans() {
    setIsTableLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/lesson_plans_search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "", status: "", title: "" }),
      });
      const data = await res.json();
      setTableData(Array.isArray(data) ? data : []);
      setCurrentPage(0);
    } catch (error) {
      console.error("Load error:", error);
      setTableData([]);
    } finally {
      setIsTableLoading(false);
    }
  }

  // Search lesson plans
  async function handleSearch() {
    const filters = {
      language: selectedLanguage,
      status: selectedStatus,
      title: selectedTitle,
    };
    setIsTableLoading(true);

    try {
      const res = await fetch(`${api_startpoint}/api/lesson_plans_search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      setTableData(Array.isArray(data) ? data : []);
      setCurrentPage(0);
    } catch (error) {
      console.error("Search error:", error);
      setTableData([]);
    } finally {
      setIsTableLoading(false);
    }
  }

  // Clear search filters
  const handleClear = () => {
    setSelectedLanguage("");
    setSelectedStatus("");
    setSelectedTitle("");
    loadAllLessonPlans(); // Load all data when clearing filters
  };

  // delete
  const handleDelete = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`${api_startpoint}/api/delete_lesson_plan/${id}`, {
      method: "DELETE",
    });
    handleSearch();
  };

  // Open edit modal
  function handleEditClick(row: LessonPlan) {
    // Clone the row data into editing state
    setEditingRow({ ...row });
    setShowEditModal(true);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Save changes to an existing Lesson Plan
  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRow || !editingRow.id) return;
    setIsEditLoading(true);
    try {
      const form = new FormData(e.target as HTMLFormElement);
      form.append("id", String(editingRow.id));
      if (file) form.append("media", file);

      await fetch(`${api_startpoint}/api/update_lesson_plan`, {
        method: "POST",
        body: form,
      });

      setIsEditLoading(false);
      setShowEditModal(false);
      handleSearch(); // Refresh table
    } catch (error) {
      console.error("Update error:", error);
      setIsEditLoading(false);
    }
  }

  // Add a new Lesson Plan
  async function handleAddLessonPlan(e: React.FormEvent) {
    e.preventDefault();
    setIsAddLoading(true);
    try {
      const form = new FormData(e.target as HTMLFormElement);
      if (file) form.append("media", file);

      await fetch(`${api_startpoint}/api/add_lesson_plan`, {
        method: "POST",
        body: form,
      });

      setIsAddLoading(false);
      setShowAddModal(false);
      handleSearch();
    } catch (error) {
      console.error("Add error:", error);
      setIsAddLoading(false);
    }
  }

  // Load data when component mounts
  useEffect(() => {
    fetchLanguages();
    loadAllLessonPlans(); // Load all lesson plans on page load
  }, []);

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Lesson Plans</h5>
                <div className="row g-3">
                  {/* Language Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="">Select Language</option>
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.name}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Status Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Published">Published</option>
                      <option value="Drafted">Drafted</option>
                    </select>
                  </div>
                  {/* Title Search */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search with Title"
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                    />
                  </div>
                  {/* Action Buttons */}
                  <div className="col-12 col-md-6 col-lg-3 d-flex gap-2">
                    <button
                      className="btn btn-success d-inline-flex align-items-center"
                      onClick={handleSearch}
                    >
                      <Search className="me-2" size={16} /> Search
                    </button>
                    <button
                      className="btn btn-warning d-inline-flex align-items-center text-dark"
                      onClick={handleClear}
                    >
                      <XCircle className="me-2" size={16} /> Clear
                    </button>
                  </div>
                  <div className="">
                    <button
                      className="btn btn-success"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus size={16} className="me-2" /> Add Lesson Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Plans Table */}
            <div className="card shadow-sm border-0 mt-2 mb-4">
              <div className="card-body overflow-x-scroll">
                <h5 className="card-title ml-2 mb-0">
                  Results- {tableData.length} lesson plans found
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
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Language</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                          <tr
                            key={
                              row.id
                                ? `lesson-plan-${row.id}`
                                : `lesson-plan-${index}-${row.title}`
                            }
                          >
                            <td>{row.language}</td>
                            <td>{row.type}</td>
                            <td>{row.title}</td>
                            <td>
                              {row.media_url?.match(/\.(jpe?g|png|gif)$/i) ? (
                                <img
                                  src={row.media_url}
                                  className="w-12 h-12 object-cover cursor-pointer"
                                  onClick={() => setLightboxUrl(row.media_url!)}
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
                            <td>{row.status}</td>
                            <td className="flex gap-1">
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleEditClick(row)}
                              >
                                <IconEdit size={16} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(row.id)}
                              >
                                <IconTrash size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            No data found. Please use the Search Filter properly
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                {/* Add this pagination component just after your table, before closing the card-body div */}
                {paginatedData.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <span className="text-muted">
                        Showing {currentPage * rowsPerPage + 1} to{" "}
                        {Math.min(
                          (currentPage + 1) * rowsPerPage,
                          tableData.length
                        )}{" "}
                        of {tableData.length} entries
                      </span>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentPage === 0}
                      >
                        Previous
                      </button>
                      {[
                        ...Array(
                          Math.ceil(tableData.length / rowsPerPage)
                        ).keys(),
                      ]
                        .map((page) => (
                          <button
                            key={page}
                            className={`btn ${
                              currentPage === page
                                ? "btn-primary"
                                : "btn-outline-secondary"
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page + 1}
                          </button>
                        ))
                        .slice(
                          Math.max(0, currentPage - 2),
                          Math.min(
                            Math.ceil(tableData.length / rowsPerPage),
                            currentPage + 3
                          )
                        )}
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              Math.ceil(tableData.length / rowsPerPage) - 1,
                              prev + 1
                            )
                          )
                        }
                        disabled={
                          currentPage >=
                          Math.ceil(tableData.length / rowsPerPage) - 1
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
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingRow && (
        <div
          className="modal show d-block bg-black bg-opacity-50"
          tabIndex={-1}
          role="dialog"
        >
          <form
            onSubmit={handleSaveChanges}
            className="modal-dialog"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditLoading && (
                    <div className="animate-spin border-t-4 border-sky-500 rounded-full w-4 h-4 mr-2" />
                  )}
                  Edit Lesson Plan
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Language</label>
                  <select
                    name="language_id"
                    className="form-select"
                    defaultValue={
                      languages.find((l) => l.name === editingRow.language)
                        ?.id || ""
                    }
                    required
                  >
                    <option value="">Select Language</option>
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    className="form-select"
                    defaultValue={
                      TYPE_OPTIONS.find((opt) => opt.label === editingRow?.type)
                        ?.value || ""
                    }
                    required
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    name="title"
                    defaultValue={editingRow.title}
                    type="text"
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Document</label>
                  <input
                    type="file"
                    name="media"
                    ref={fileRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-2"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    defaultValue={editingRow?.status === "Published" ? 1 : 0}
                    required
                  >
                    <option value="1">Published</option>
                    <option value="0">Drafted</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="modal show d-block bg-black bg-opacity-50"
          tabIndex={-1}
          role="dialog"
        >
          <form
            onSubmit={handleAddLessonPlan}
            className="modal-dialog"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isAddLoading && (
                    <div className="animate-spin border-t-4 border-sky-500 rounded-full w-4 h-4 mr-2" />
                  )}
                  Add New Lesson Plan
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Language</label>
                  <select name="language_id" className="form-select" required>
                    <option value="">Select Language</option>
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    className="form-select"
                    defaultValue={
                      TYPE_OPTIONS.find((opt) => opt.label === editingRow?.type)
                        ?.value || ""
                    }
                    required
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    name="title"
                    type="text"
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Document</label>
                  <input
                    type="file"
                    name="media"
                    ref={fileRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-2"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    defaultValue={editingRow?.status === "Published" ? 1 : 0}
                    required
                  >
                    <option value="1">Published</option>
                    <option value="0">Drafted</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Lesson Plan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative">
            <img
              src={lightboxUrl}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              className="absolute top-2 right-2 text-white bg-gray-900 rounded-full p-1"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxUrl(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
