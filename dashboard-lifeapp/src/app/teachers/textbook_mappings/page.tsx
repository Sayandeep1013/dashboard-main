"use client";
import "@tabler/core/dist/css/tabler.min.css";
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

// const api_startpoint = "http://localhost:5000";
const api_startpoint = "http://152.42.239.141:5000";

interface TextbookMapping {
  id: number;
  board: string;
  language: string;
  subject: string;
  grade: string;
  title: string;
  status: string;
  media_url?: string;
}

interface FilterOption {
  id: number;
  name: string;
}

export default function TextbookMappings() {
  // State variables
  const [boards, setBoards] = useState<FilterOption[]>([]);
  const [languages, setLanguages] = useState<FilterOption[]>([]);
  const [subjects, setSubjects] = useState<FilterOption[]>([]);
  const [grades, setGrades] = useState<FilterOption[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [tableData, setTableData] = useState<TextbookMapping[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRow, setEditingRow] = useState<TextbookMapping | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const rowsPerPage = 50;
  const paginatedData = tableData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // Fetch filter options
  async function fetchFilterOptions() {
    try {
      const [boardsRes, languagesRes, subjectsRes, gradesRes] = await Promise.all([
        fetch(`${api_startpoint}/api/textbook_mapping_boards`),
        fetch(`${api_startpoint}/api/textbook_mapping_languages`),
        fetch(`${api_startpoint}/api/textbook_mapping_subjects`),
        fetch(`${api_startpoint}/api/textbook_mapping_grades`)
      ]);

      setBoards(await boardsRes.json());
      setLanguages(await languagesRes.json());
      setSubjects(await subjectsRes.json());
      setGrades(await gradesRes.json());
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }

  // Load all textbook mappings
  async function loadAllTextbookMappings() {
    setIsTableLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/textbook_mappings_search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          board: "", 
          language: "", 
          subject: "", 
          grade: "", 
          status: "", 
          title: "" 
        }),
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

  // Search textbook mappings
  async function handleSearch() {
    const filters = {
      board: selectedBoard,
      language: selectedLanguage,
      subject: selectedSubject,
      grade: selectedGrade,
      status: selectedStatus,
      title: selectedTitle,
    };
    
    setIsTableLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/textbook_mappings_search`, {
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
    setSelectedBoard("");
    setSelectedLanguage("");
    setSelectedSubject("");
    setSelectedGrade("");
    setSelectedStatus("");
    setSelectedTitle("");
    loadAllTextbookMappings();
  };

  // Delete a mapping
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this textbook mapping?")) return;
    await fetch(`${api_startpoint}/api/delete_textbook_mapping/${id}`, {
      method: "DELETE",
    });
    handleSearch();
  };

  // Open edit modal
  function handleEditClick(row: TextbookMapping) {
    setEditingRow({ ...row });
    setShowEditModal(true);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Save changes to an existing mapping
  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRow || !editingRow.id) return;
    setIsEditLoading(true);
    try {
      const form = new FormData(e.target as HTMLFormElement);
      form.append("id", String(editingRow.id));
      if (file) form.append("media", file);

      await fetch(`${api_startpoint}/api/update_textbook_mapping`, {
        method: "POST",
        body: form,
      });

      setIsEditLoading(false);
      setShowEditModal(false);
      handleSearch();
    } catch (error) {
      console.error("Update error:", error);
      setIsEditLoading(false);
    }
  }

  // Add a new mapping
  async function handleAddTextbookMapping(e: React.FormEvent) {
    e.preventDefault();
    setIsAddLoading(true);
    try {
      const form = new FormData(e.target as HTMLFormElement);
      if (file) form.append("media", file);

      await fetch(`${api_startpoint}/api/add_textbook_mapping`, {
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

  // Load data on component mount
  useEffect(() => {
    fetchFilterOptions();
    loadAllTextbookMappings();
  }, []);

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Textbook Mappings</h5>
                <div className="row g-3">
                  {/* Board Dropdown */}
                  <div className="col-12 col-md-6 col-lg-2">
                    <select
                      className="form-select"
                      value={selectedBoard}
                      onChange={(e) => setSelectedBoard(e.target.value)}
                    >
                      <option value="">Select Board</option>
                      {boards.map((board) => (
                        <option key={board.id} value={board.name}>
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Language Dropdown */}
                  <div className="col-12 col-md-6 col-lg-2">
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
                  
                  {/* Subject Dropdown */}
                  <div className="col-12 col-md-6 col-lg-2">
                    <select
                      className="form-select"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Grade Dropdown */}
                  <div className="col-12 col-md-6 col-lg-2">
                    <select
                      className="form-select"
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.name}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="col-12 col-md-6 col-lg-2">
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
                  <div className="col-12 col-md-6 col-lg-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Title"
                      value={selectedTitle}
                      onChange={(e) => setSelectedTitle(e.target.value)}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="col-12 d-flex gap-2 mt-2">
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
                    <button
                      className="btn btn-primary ms-auto d-inline-flex align-items-center"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus size={16} className="me-2" /> Add Mapping
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Textbook Mappings Table */}
            <div className="card shadow-sm border-0 mt-2 mb-4">
              <div className="card-body overflow-x-scroll">
                <h5 className="card-title ml-2 mb-0">
                  Results - {tableData.length} mappings found
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
                        <th>Board</th>
                        <th>Language</th>
                        <th>Subject</th>
                        <th>Grade</th>
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
                                ? `mapping-${row.id}`
                                : `mapping-${index}-${row.title}`
                            }
                          >
                            <td>{row.board}</td>
                            <td>{row.language}</td>
                            <td>{row.subject}</td>
                            <td>{row.grade}</td>
                            <td>{row.title}</td>
                            <td>
                              {row.media_url?.match(/\.(jpe?g|png|gif)$/i) ? (
                                <img
                                  src={row.media_url}
                                  className="w-12 h-12 object-cover cursor-pointer"
                                  onClick={() => setLightboxUrl(row.media_url!)}
                                  alt="Document preview"
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
                            <td>
                              <div className="d-flex gap-1">
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
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center">
                            No data found. Please adjust your search filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                
                {/* Pagination */}
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
                  Edit Textbook Mapping
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Board</label>
                  <select
                    name="board_id"
                    className="form-select"
                    defaultValue={
                      boards.find((b) => b.name === editingRow.board)?.id || ""
                    }
                    required
                  >
                    <option value="">Select Board</option>
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
                
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
                  <label className="form-label">Subject</label>
                  <select
                    name="subject_id"
                    className="form-select"
                    defaultValue={
                      subjects.find((s) => s.name === editingRow.subject)
                        ?.id || ""
                    }
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <select
                    name="grade_id"
                    className="form-select"
                    defaultValue={
                      grades.find((g) => g.name === editingRow.grade)?.id || ""
                    }
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
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
                  <small className="text-muted">
                    Leave blank to keep existing document
                  </small>
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
            onSubmit={handleAddTextbookMapping}
            className="modal-dialog"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isAddLoading && (
                    <div className="animate-spin border-t-4 border-sky-500 rounded-full w-4 h-4 mr-2" />
                  )}
                  Add New Textbook Mapping
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Board</label>
                  <select
                    name="board_id"
                    className="form-select"
                    required
                  >
                    <option value="">Select Board</option>
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Language</label>
                  <select
                    name="language_id"
                    className="form-select"
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
                  <label className="form-label">Subject</label>
                  <select
                    name="subject_id"
                    className="form-select"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <select
                    name="grade_id"
                    className="form-select"
                    required
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
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
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    defaultValue="1"
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
                  Add Mapping
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
