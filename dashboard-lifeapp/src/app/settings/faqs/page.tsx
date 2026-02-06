// app/faqs/page.tsx
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
interface FAQ {
  id: number;
  question: string;
  answer: string;
  media_id: number | null;
  audience: string;
  category: {
    id: number;
    name: string;
  };
  updated_at: string; // ISO string or formatted date string
}

interface Category {
  id: number;
  name: string;
  // description is not needed for the main FAQ list/category dropdown
}

interface FilterOption {
  name: string; // Using 'name' for both categories and audiences for simplicity in dropdowns
}

// --- Main Component ---
export default function FAQs() {
  // --- State Variables ---
  const [categories, setCategories] = useState<Category[]>([]); // For category dropdown in filters and modals
  const [audiences, setAudiences] = useState<FilterOption[]>([]); // For audience dropdown in filters and modals
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("");
  const [selectedAudienceFilter, setSelectedAudienceFilter] =
    useState<string>("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // --- Add/Edit FAQ Modal States ---
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isAddEditLoading, setIsAddEditLoading] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null); // null for Add, FAQ object for Edit
  const addEditFormRef = useRef<HTMLFormElement>(null); // Ref for the Add/Edit form

  // --- Add Category Modal States (nested) ---
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [isAddCategoryLoading, setIsAddCategoryLoading] = useState(false);

  // --- Bulk Upload Modal States ---
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [isBulkUploadLoading, setIsBulkUploadLoading] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for bulk upload file input

  // --- Fetch Data Functions ---

  // Fetch distinct categories for filters and modals
  async function fetchCategories() {
    try {
      const res = await fetch(`${api_startpoint}/api/faq_categories`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories.");
    }
  }

  // Fetch distinct audiences for filters and modals
  async function fetchAudiences() {
    try {
      const res = await fetch(`${api_startpoint}/api/faq_audiences`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: FilterOption[] = await res.json();
      setAudiences(data);
    } catch (error) {
      console.error("Error fetching audiences:", error);
      toast.error("Failed to load audiences.");
    }
  }

  // Load all FAQs or filtered FAQs
  async function loadFAQs(categoryName: string = "", audience: string = "") {
    setIsTableLoading(true);
    try {
      // Using GET with query parameters for filtering
      const queryParams = new URLSearchParams();
      if (categoryName) queryParams.append("category_name", categoryName);
      if (audience) queryParams.append("audience", audience);

      const res = await fetch(
        `${api_startpoint}/api/faqs?${queryParams.toString()}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: FAQ[] = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error("Error loading FAQs:", error);
      toast.error("Failed to load FAQs.");
      setFaqs([]); // Clear table on error
    } finally {
      setIsTableLoading(false);
    }
  }

  // --- Filter Handling ---
  const handleSearch = () => {
    loadFAQs(selectedCategoryFilter, selectedAudienceFilter);
  };

  const handleClear = () => {
    setSelectedCategoryFilter("");
    setSelectedAudienceFilter("");
    loadFAQs(); // Load all FAQs
  };

  // --- CRUD Operations ---

  // Delete FAQ
  const handleDelete = async (id: number) => {
    // Using native confirm as requested
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`${api_startpoint}/api/faqs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      toast.success("FAQ deleted successfully", { autoClose: 1000 }); // Auto-close after 1s
      handleSearch(); // Refresh the table
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ.");
    }
  };

  // Open Add FAQ Modal
  const handleAddClick = () => {
    setEditingFaq(null); // Indicate it's an Add operation
    setShowAddEditModal(true);
  };

  // Open Edit FAQ Modal
  const handleEditClick = (faq: FAQ) => {
    setEditingFaq({ ...faq }); // Pass a copy of the FAQ object
    setShowAddEditModal(true);
  };

  // Handle Add/Edit FAQ Form Submission
  async function handleSaveFAQ(e: React.FormEvent) {
    // --- Add Debugging Logs ---
    console.log("handleSaveFAQ function called!");
    console.log("Event object:", e);
    e.preventDefault();
    console.log("preventDefault called");
    // --- End Debugging Logs ---

    // --- Updated State Check ---
    // Note: For 'Add', editingFaq is null. For 'Edit', it's an object.
    // The check `if (!editingFaq)` prevents saving when adding.
    // We need to allow saving when editingFaq is null (for Add).
    // Let's adjust the logic to only prevent if it's an edit and ID is missing unexpectedly.
    // Actually, the check is okay for Edit, but for Add, editingFaq is null, which is fine.
    // The form fields will provide the data.
    // Let's remove the initial check and handle Add/Edit logic inside.
    // --- End Updated State Check ---

    setIsAddEditLoading(true);
    try {
      // Use the form ref if available, otherwise fall back to event target
      const formElement = addEditFormRef.current
        ? addEditFormRef.current
        : (e.target as HTMLFormElement);
      if (!formElement) {
        throw new Error("Could not find form element.");
      }
      const formData = new FormData(formElement);

      let res;
      const isEdit = editingFaq && editingFaq.id; // Determine if it's an edit operation
      console.log("Is Edit Operation:", isEdit); // --- Debug Log ---

      if (isEdit) {
        // Edit existing FAQ
        // Backend expects PUT /api/faqs/:id
        res = await fetch(`${api_startpoint}/api/faqs/${editingFaq.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Add new FAQ
        res = await fetch(`${api_startpoint}/api/faqs`, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        const errorText = await res.text(); // Get raw text first
        let errorData;
        try {
          errorData = JSON.parse(errorText); // Try to parse as JSON
        } catch (parseError) {
          // If parsing fails, use the raw text as the message
          throw new Error(
            `HTTP error! status: ${res.status}. Message: ${errorText}`
          );
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${res.status}`
        );
      }

      toast.success(
        isEdit ? "FAQ updated successfully" : "FAQ added successfully"
      );
      setShowAddEditModal(false);
      handleSearch(); // Refresh the table
    } catch (error: any) {
      console.error("Error saving FAQ:", error);
      // --- Updated part ---
      let errorMessage = "Failed to save FAQ.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      // --- End updated part ---
      toast.error(errorMessage);
    } finally {
      setIsAddEditLoading(false);
    }
  }

  // --- Category Management (within FAQ modals) ---

  // Open Add Category Modal (from within Add/Edit FAQ modal)
  const openAddCategoryModal = () => {
    setShowAddCategoryModal(true);
  };

  // Handle Add Category Form Submission
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setIsAddCategoryLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const res = await fetch(`${api_startpoint}/api/faq_categories`, {
        method: "POST",
        body: formData,
      });

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

      toast.success("Category added successfully");
      setShowAddCategoryModal(false);
      // Re-fetch categories to include the new one
      await fetchCategories();
      // Reset the form if needed (optional, as modal closes)
      // (form.reset() is not ideal here as it might clear other FAQ form data if not careful)
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category.");
    } finally {
      setIsAddCategoryLoading(false);
    }
  }

  // --- Bulk Upload ---

  // Trigger file download for CSV template
  const downloadTemplate = () => {
    // Backend endpoint to generate and serve the template
    window.open(`${api_startpoint}/api/faq_template.csv`, "_blank");
  };

  // Handle Bulk Upload Form Submission
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
      const res = await fetch(`${api_startpoint}/api/bulk_upload_faqs`, {
        method: "POST",
        body: formData,
      });

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

      const result = await res.json(); // Expect success/failure details from backend
      toast.success(
        `Bulk upload successful: ${result.message || "Processed entries."}`
      );
      setShowBulkUploadModal(false);
      setBulkUploadFile(null); // Clear file state
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
      handleSearch(); // Refresh the table
    } catch (error: any) {
      console.error("Error during bulk upload:", error);
      toast.error(error.message || "Bulk upload failed.");
    } finally {
      setIsBulkUploadLoading(false);
    }
  }

  // --- Lifecycle ---
  useEffect(() => {
    // Fetch initial data
    fetchCategories();
    fetchAudiences();
    loadFAQs(); // Load all FAQs initially
  }, []);

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
                <h5 className="card-title mb-4">Manage FAQs</h5>
                <div className="row g-3">
                  {/* Category Filter Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedCategoryFilter}
                      onChange={(e) =>
                        setSelectedCategoryFilter(e.target.value)
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option
                          key={`filter-cat-${category.id}`}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Audience Filter Dropdown */}
                  <div className="col-12 col-md-6 col-lg-3">
                    <select
                      className="form-select"
                      value={selectedAudienceFilter}
                      onChange={(e) =>
                        setSelectedAudienceFilter(e.target.value)
                      }
                    >
                      <option value="">Select Audience</option>
                      {audiences.map((audience, index) => (
                        <option
                          key={`filter-aud-${index}`}
                          value={audience.name}
                        >
                          {audience.name}
                        </option>
                      ))}
                    </select>
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
                      <Plus size={16} className="me-2" /> Add New FAQ
                    </button>
                    <button
                      className="btn btn-info d-inline-flex align-items-center"
                      onClick={() => setShowBulkUploadModal(true)}
                    >
                      <IconUpload size={16} className="me-2" /> Bulk Upload FAQs
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

            {/* FAQs Table Card */}
            <div className="card shadow-sm border-0 mt-2 mb-4">
              <div className="card-body overflow-x-scroll">
                <h5 className="card-title ml-2 mb-0">
                  Results - {faqs.length} FAQs found
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
                      Loading FAQs, please wait...
                    </p>
                  </div>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Category</th>
                        <th>Audience</th>
                        <th>Updated At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.length > 0 ? (
                        faqs.map((faq) => (
                          <tr key={`faq-${faq.id}`}>
                            <td>{faq.question}</td>
                            <td>{faq.answer}</td>
                            <td>{faq.category?.name || "N/A"}</td>
                            <td>{faq.audience}</td>
                            <td>{new Date(faq.updated_at).toLocaleString()}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleEditClick(faq)}
                                  title="Edit"
                                >
                                  <IconEdit size={16} />
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(faq.id)}
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
                          <td colSpan={6} className="text-center">
                            No FAQs found. Please adjust your search filters or
                            add new FAQs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Add/Edit FAQ Modal */}
      {showAddEditModal && (
        <div
          className="modal show d-block bg-black bg-opacity-50"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="addEditFAQModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content h-100">
              {" "}
              {/* Adjusted structure here */}
              <form
                ref={addEditFormRef}
                onSubmit={handleSaveFAQ}
                className="h-100"
              >
                <div className="modal-header">
                  <h5 className="modal-title" id="addEditFAQModalLabel">
                    {isAddEditLoading && (
                      <div
                        className="spinner-border spinner-border-sm text-primary me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                    {editingFaq?.id ? "Edit FAQ" : "Add New FAQ"}
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
                  {editingFaq?.id && (
                    <input type="hidden" name="id" value={editingFaq.id} />
                  )}

                  {/* Question */}
                  <div className="mb-3">
                    <label htmlFor="faqQuestion" className="form-label">
                      Question *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="faqQuestion"
                      name="question"
                      defaultValue={editingFaq?.question || ""}
                      required
                    />
                  </div>

                  {/* Answer */}
                  <div className="mb-3">
                    <label htmlFor="faqAnswer" className="form-label">
                      Answer *
                    </label>
                    <textarea
                      className="form-control"
                      id="faqAnswer"
                      name="answer"
                      rows={4}
                      defaultValue={editingFaq?.answer || ""}
                      required
                    ></textarea>
                  </div>

                  {/* Audience Dropdown */}
                  <div className="mb-3">
                    <label htmlFor="faqAudience" className="form-label">
                      Audience *
                    </label>
                    <select
                      className="form-select"
                      id="faqAudience"
                      name="audience"
                      defaultValue={editingFaq?.audience || ""}
                      required
                    >
                      <option value="">Select Audience</option>
                      {audiences.map((audience, index) => (
                        <option
                          key={`modal-aud-${index}`}
                          value={audience.name}
                        >
                          {audience.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Dropdown */}
                  <div className="mb-3">
                    <label htmlFor="faqCategory" className="form-label">
                      Category *
                    </label>
                    <div className="input-group">
                      <select
                        className="form-select"
                        id="faqCategory"
                        name="category_id"
                        defaultValue={editingFaq?.category?.id || ""}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option
                            key={`modal-cat-${category.id}`}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={openAddCategoryModal}
                        title="Add New Category"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
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
                    type="submit" // Ensure this is type="submit"
                    className="btn btn-primary"
                    disabled={isAddEditLoading}
                  >
                    {editingFaq?.id ? "Save Changes" : "Add FAQ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal (Nested) */}
      {showAddCategoryModal && (
        <div
          className="modal show d-block bg-black bg-opacity-50"
          tabIndex={-1}
          role="dialog"
          aria-labelledby="addCategoryModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              {" "}
              {/* Adjusted structure here */}
              <form onSubmit={handleAddCategory}>
                {" "}
                {/* Moved onSubmit here */}
                <div className="modal-header">
                  <h5 className="modal-title" id="addCategoryModalLabel">
                    {isAddCategoryLoading && (
                      <div
                        className="spinner-border spinner-border-sm text-primary me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                    Add New Category
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddCategoryModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Category Name */}
                  <div className="mb-3">
                    <label htmlFor="categoryName" className="form-label">
                      Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="categoryName"
                      name="name"
                      required
                    />
                  </div>

                  {/* Category Description */}
                  <div className="mb-3">
                    <label htmlFor="categoryDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="categoryDescription"
                      name="description"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isAddCategoryLoading}
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload FAQs Modal */}
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
              {" "}
              {/* Adjusted structure here */}
              <form onSubmit={handleBulkUpload}>
                {" "}
                {/* Moved onSubmit here */}
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
                    Bulk Upload FAQs
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
                      The file should contain columns: question, answer,
                      category_name, audience.
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
