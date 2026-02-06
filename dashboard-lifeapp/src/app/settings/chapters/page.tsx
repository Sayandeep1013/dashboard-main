// app/chapters/page.tsx
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
  IconDownload,
  IconUpload,
  IconPlus,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Plus, Search, XCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Configuration ---
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

// --- Interfaces ---
interface Chapter {
  id: number;
  la_board_id: number;
  la_grade_id: number;
  la_subject_id: number;
  title: string;
  description: string | null;
  chapter_no: number;
  created_at: string;
  updated_at: string;
  board_name?: string; // Added for display
  grade_name?: string; // Added for display
  subject_title?: string; // Added for display
}

interface Board {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  title: string; // Assuming the plain title is extracted from JSON
}

// --- Main Component ---
export default function Chapters() {
  // --- State Variables ---
  const [boards, setBoards] = useState<Board[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // --- Filter States ---
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<string>("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] =
    useState<string>("");
  const [searchChapterTitle, setSearchChapterTitle] = useState<string>("");

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20); // Default page size

  // --- Add/Edit Chapter Modal States ---
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isAddEditLoading, setIsAddEditLoading] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const addEditFormRef = useRef<HTMLFormElement>(null);

  // --- Bulk Upload Modal States ---
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [isBulkUploadLoading, setIsBulkUploadLoading] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data Functions ---
  async function fetchBoardsForChaptersPage() {
    try {
      const res = await fetch(`${api_startpoint}/api/chapterpage/data/boards`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Board[] = await res.json();
      setBoards(data);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error("Failed to load boards.");
    }
  }

  async function fetchGradesForChaptersPage() {
    try {
      const res = await fetch(`${api_startpoint}/api/chapterpage/data/grades`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Grade[] = await res.json();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades.");
    }
  }

  async function fetchSubjectsForChaptersPage() {
    try {
      const res = await fetch(
        `${api_startpoint}/api/chapterpage/data/subjects`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Subject[] = await res.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects.");
    }
  }

  async function loadChaptersForChaptersPage(
    page: number = 1,
    size: number = pageSize,
    boardId: string = "",
    gradeId: string = "",
    subjectId: string = "",
    titleSearch: string = ""
  ) {
    setIsTableLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("size", size.toString());
      if (boardId) queryParams.append("board_id", boardId);
      if (gradeId) queryParams.append("grade_id", gradeId);
      if (subjectId) queryParams.append("subject_id", subjectId);
      if (titleSearch) queryParams.append("title_search", titleSearch);

      const res = await fetch(
        `${api_startpoint}/api/chapterpage/data/chapters?${queryParams.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      setChapters(result.data || []);
      setTotalPages(result.total_pages || 1);
      setTotalCount(result.total_count || 0);
      setCurrentPage(result.current_page || 1);
    } catch (error) {
      console.error("Error loading chapters:", error);
      toast.error("Failed to load chapters.");
      setChapters([]);
      setTotalPages(1);
      setTotalCount(0);
      setCurrentPage(1);
    } finally {
      setIsTableLoading(false);
    }
  }

  // --- Filter Handling ---
  const handleSearch = () => {
    // Reset to page 1 when searching
    loadChaptersForChaptersPage(
      1,
      pageSize,
      selectedBoardFilter,
      selectedGradeFilter,
      selectedSubjectFilter,
      searchChapterTitle
    );
  };

  const handleClear = () => {
    setSelectedBoardFilter("");
    setSelectedGradeFilter("");
    setSelectedSubjectFilter("");
    setSearchChapterTitle("");
    // Reset to page 1 and clear filters
    loadChaptersForChaptersPage(1, pageSize);
  };

  // --- Pagination Handlers ---
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadChaptersForChaptersPage(
        page,
        pageSize,
        selectedBoardFilter,
        selectedGradeFilter,
        selectedSubjectFilter,
        searchChapterTitle
      );
    }
  };

  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    // Reset to page 1 when changing page size
    loadChaptersForChaptersPage(
      1,
      newSize,
      selectedBoardFilter,
      selectedGradeFilter,
      selectedSubjectFilter,
      searchChapterTitle
    );
  };

  // --- CRUD Operations ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Chapter?")) return;
    try {
      const res = await fetch(
        `${api_startpoint}/api/chapterpage/data/chapters/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      toast.success("Chapter deleted successfully", { autoClose: 1000 });
      // Reload current page after deletion
      loadChaptersForChaptersPage(
        currentPage,
        pageSize,
        selectedBoardFilter,
        selectedGradeFilter,
        selectedSubjectFilter,
        searchChapterTitle
      );
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter.");
    }
  };

  const handleAddClick = () => {
    setEditingChapter(null);
    setShowAddEditModal(true);
  };

  const handleEditClick = (chapter: Chapter) => {
    setEditingChapter({ ...chapter });
    setShowAddEditModal(true);
  };

  async function handleSaveChapter(e: React.FormEvent) {
    e.preventDefault();
    setIsAddEditLoading(true);
    try {
      const formElement = addEditFormRef.current
        ? addEditFormRef.current
        : (e.target as HTMLFormElement);
      if (!formElement) {
        throw new Error("Could not find form element.");
      }
      const formData = new FormData(formElement);
      let res;
      const isEdit = editingChapter && editingChapter.id;

      if (isEdit) {
        res = await fetch(
          `${api_startpoint}/api/chapterpage/data/chapters/${editingChapter.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        res = await fetch(`${api_startpoint}/api/chapterpage/data/chapters`, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          throw new Error(
            `HTTP error! status: ${res.status}. Message: ${errorText}`
          );
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }
      toast.success(
        isEdit ? "Chapter updated successfully" : "Chapter added successfully"
      );
      setShowAddEditModal(false);
      // Reload current page after adding/editing
      loadChaptersForChaptersPage(
        currentPage,
        pageSize,
        selectedBoardFilter,
        selectedGradeFilter,
        selectedSubjectFilter,
        searchChapterTitle
      );
    } catch (error: any) {
      console.error("Error saving chapter:", error);
      let errorMessage = "Failed to save chapter.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsAddEditLoading(false);
    }
  }

  // --- Bulk Upload ---
  const downloadTemplate = () => {
    window.open(
      `${api_startpoint}/api/chapterpage/data/chapters/template.csv`,
      "_blank"
    );
  };

  async function handleBulkUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkUploadFile) {
      toast.warn("Please select a CSV file.");
      return;
    }
    setIsBulkUploadLoading(true);
    const formData = new FormData();
    formData.append("file", bulkUploadFile);
    try {
      const res = await fetch(
        `${api_startpoint}/api/chapterpage/data/chapters/bulk_upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(errorText || `HTTP error! status: ${res.status}`);
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }
      const result = await res.json();
      toast.success(
        `Bulk upload successful: ${result.message || "Processed entries."}`
      );
      setShowBulkUploadModal(false);
      setBulkUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Reload current page after bulk upload
      loadChaptersForChaptersPage(
        currentPage,
        pageSize,
        selectedBoardFilter,
        selectedGradeFilter,
        selectedSubjectFilter,
        searchChapterTitle
      );
    } catch (error: any) {
      console.error("Error during bulk upload:", error);
      toast.error(error.message || "Bulk upload failed.");
    } finally {
      setIsBulkUploadLoading(false);
    }
  }

  // --- Lifecycle ---
  useEffect(() => {
    fetchBoardsForChaptersPage();
    fetchGradesForChaptersPage();
    fetchSubjectsForChaptersPage();
    loadChaptersForChaptersPage(1, pageSize);
  }, [pageSize]);

  // --- Render ---
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            {/* Filters and Actions Card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Manage Chapters</h5>
                <div className="row g-3">
                  {/* Board Filter Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedBoardFilter}
                      onChange={(e) => setSelectedBoardFilter(e.target.value)}
                    >
                      <option value="">Select Board</option>
                      {boards.map((board) => (
                        <option
                          key={`filter-board-${board.id}`}
                          value={board.id}
                        >
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Filter Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedGradeFilter}
                      onChange={(e) => setSelectedGradeFilter(e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option
                          key={`filter-grade-${grade.id}`}
                          value={grade.id}
                        >
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Filter Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedSubjectFilter}
                      onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option
                          key={`filter-subject-${subject.id}`}
                          value={subject.id}
                        >
                          {subject.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter Title Search with Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="input-icon">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search Chapter Title..."
                        value={searchChapterTitle}
                        onChange={(e) => setSearchChapterTitle(e.target.value)}
                      />
                      <span className="input-icon-addon">
                        <IconSearch size={16} />
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-12 d-flex flex-wrap gap-2 mt-2">
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
                      onClick={handleAddClick}
                    >
                      <Plus size={16} className="me-2" /> Add New Chapter
                    </button>
                    <button
                      className="btn btn-info d-inline-flex align-items-center"
                      onClick={() => setShowBulkUploadModal(true)}
                    >
                      <IconUpload size={16} className="me-2" /> Bulk Upload
                      Chapters
                    </button>
                    <button
                      className="btn btn-outline-secondary d-inline-flex align-items-center"
                      onClick={downloadTemplate}
                    >
                      <IconDownload size={16} className="me-2" /> Download CSV
                      Template
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters Table Card */}
            <div className="card shadow-sm border-0 mt-2 mb-4">
              <div className="card-body overflow-x-scroll">
                <h5 className="card-title ml-2 mb-0">
                  Results - {totalCount} Chapters found
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
                      Loading chapters, please wait...
                    </p>
                  </div>
                ) : (
                  <>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          {/* Added Serial No. column header */}
                          <th>Serial No.</th>
                          <th>Title</th>
                          {/* Moved Chapter No. after Title */}
                          <th>Chapter No.</th>
                          <th>Description</th>
                          <th>Board</th>
                          <th>Grade</th>
                          <th>Subject</th>
                          <th>Created At</th>
                          <th>Updated At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chapters.length > 0 ? (
                          // Add index to map function to generate serial number
                          chapters.map((chapter, index) => (
                            <tr key={`chapter-${chapter.id}`}>
                              {/* Display Serial No. (1-based index for the current page) */}
                              <td>
                                {(currentPage - 1) * pageSize + index + 1}
                              </td>
                              <td>{chapter.title}</td>
                              {/* Display Chapter No. */}
                              <td>{chapter.chapter_no}</td>
                              <td>{chapter.description || "N/A"}</td>
                              <td>{chapter.board_name || "N/A"}</td>
                              <td>{chapter.grade_name || "N/A"}</td>
                              <td>{chapter.subject_title || "N/A"}</td>
                              <td>
                                {new Date(chapter.created_at).toLocaleString()}
                              </td>
                              <td>
                                {new Date(chapter.updated_at).toLocaleString()}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => handleEditClick(chapter)}
                                    title="Edit"
                                  >
                                    <IconEdit size={16} />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(chapter.id)}
                                    title="Delete"
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={10} className="text-center">
                              {" "}
                              {/* Updated colspan */}
                              No chapters found. Please adjust your search
                              filters or add new chapters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center">
                          <label htmlFor="pageSizeSelect" className="me-2">
                            Rows per page:
                          </label>
                          <select
                            id="pageSizeSelect"
                            className="form-select form-select-sm"
                            style={{ width: "auto" }}
                            value={pageSize}
                            onChange={(e) =>
                              changePageSize(Number(e.target.value))
                            }
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </div>

                        <div className="d-flex align-items-center">
                          <span className="me-3">
                            Page {currentPage} of {totalPages}
                          </span>
                          <div
                            className="btn-group"
                            role="group"
                            aria-label="Pagination"
                          >
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => goToPage(1)}
                              disabled={currentPage === 1}
                              title="First"
                            >
                              <IconChevronsLeft size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              title="Previous"
                            >
                              <IconChevronLeft size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              title="Next"
                            >
                              <IconChevronRight size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => goToPage(totalPages)}
                              disabled={currentPage === totalPages}
                              title="Last"
                            >
                              <IconChevronsRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Add/Edit Chapter Modal */}
      {showAddEditModal && (
        <div
          className="modal show d-block bg-black bg-opacity-50"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="addEditChapterModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content h-100">
              <form
                ref={addEditFormRef}
                onSubmit={handleSaveChapter}
                className="h-100"
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="addEditChapterModalLabel">
                    {isAddEditLoading && (
                      <div
                        className="spinner-border spinner-border-sm text-primary me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                    {editingChapter?.id ? "Edit Chapter" : "Add New Chapter"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddEditModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Hidden ID field for Edit */}
                  {editingChapter?.id && (
                    <input type="hidden" name="id" value={editingChapter.id} />
                  )}

                  {/* Board Dropdown (Searchable) */}
                  <div className="mb-3">
                    <label htmlFor="chapterBoard" className="form-label">
                      Board *
                    </label>
                    <select
                      className="form-select"
                      id="chapterBoard"
                      name="la_board_id"
                      defaultValue={editingChapter?.la_board_id || ""}
                      required
                    >
                      <option value="">Select Board</option>
                      {boards.map((board) => (
                        <option
                          key={`modal-board-${board.id}`}
                          value={board.id}
                        >
                          {board.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Dropdown (Searchable) */}
                  <div className="mb-3">
                    <label htmlFor="chapterGrade" className="form-label">
                      Grade *
                    </label>
                    <select
                      className="form-select"
                      id="chapterGrade"
                      name="la_grade_id"
                      defaultValue={editingChapter?.la_grade_id || ""}
                      required
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option
                          key={`modal-grade-${grade.id}`}
                          value={grade.id}
                        >
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Dropdown (Searchable) */}
                  <div className="mb-3">
                    <label htmlFor="chapterSubject" className="form-label">
                      Subject *
                    </label>
                    <select
                      className="form-select"
                      id="chapterSubject"
                      name="la_subject_id"
                      defaultValue={editingChapter?.la_subject_id || ""}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option
                          key={`modal-subject-${subject.id}`}
                          value={subject.id}
                        >
                          {subject.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter Number */}
                  <div className="mb-3">
                    <label htmlFor="chapterNo" className="form-label">
                      Chapter Number *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="chapterNo"
                      name="chapter_no"
                      min="1"
                      defaultValue={editingChapter?.chapter_no || ""}
                      required
                    />
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <label htmlFor="chapterTitle" className="form-label">
                      Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="chapterTitle"
                      name="title"
                      defaultValue={editingChapter?.title || ""}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label htmlFor="chapterDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="chapterDescription"
                      name="description"
                      rows={3}
                      defaultValue={editingChapter?.description || ""}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddEditModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isAddEditLoading}
                  >
                    {editingChapter?.id ? "Save Changes" : "Add Chapter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Chapters Modal */}
      {showBulkUploadModal && (
        <div
          className="modal show d-block bg-black bg-opacity-50"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="bulkUploadModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleBulkUpload}>
                <div className="modal-header">
                  <h5 className="modal-title" id="bulkUploadModalLabel">
                    {isBulkUploadLoading && (
                      <div
                        className="spinner-border spinner-border-sm text-primary me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                    Bulk Upload Chapters
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowBulkUploadModal(false);
                      setBulkUploadFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="bulkUploadFile" className="form-label">
                      Select CSV File *
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      id="bulkUploadFile"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={(e) =>
                        setBulkUploadFile(e.target.files?.[0] || null)
                      }
                      required
                    />
                    <div className="form-text">
                      The file should contain columns: board_name, grade_name,
                      subject_title, chapter_no, title, description.
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 ms-2"
                        onClick={downloadTemplate}
                      >
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowBulkUploadModal(false);
                      setBulkUploadFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={isBulkUploadLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isBulkUploadLoading || !bulkUploadFile}
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
