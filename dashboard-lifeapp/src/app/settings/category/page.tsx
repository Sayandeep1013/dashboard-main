
"use client";
import "@tabler/core/dist/css/tabler.min.css";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Sidebar } from "@/components/ui/sidebar";
import {
  IconTrash,
  IconPlus,
  IconCircleCheck,
  IconCircleX,
  IconEdit,
} from "@tabler/icons-react";

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState({
    id: 0,
    title: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${api_startpoint}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showNotification("error", "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const res = await fetch(`${api_startpoint}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newCategory.trim() }),
      });

      if (res.ok) {
        setNewCategory("");
        fetchCategories();
        setShowAddModal(false);
        showNotification("success", "Category added successfully!");
      } else {
        showNotification("error", "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      showNotification("error", "Failed to add category");
    }
  };

  const updateCategory = async () => {
    if (!editCategory.title.trim()) return;

    try {
      const res = await fetch(
        `${api_startpoint}/api/categories/${editCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editCategory.title.trim() }),
        }
      );

      if (res.ok) {
        fetchCategories();
        setShowEditModal(false);
        showNotification("success", "Category updated successfully!");
      } else {
        showNotification("error", "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      showNotification("error", "Failed to update category");
    }
  };

  const deleteCategory = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${api_startpoint}/api/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCategories();
        setShowDeleteModal(false);
        showNotification("success", "Category deleted successfully!");
      } else {
        showNotification("error", "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification("error", "Failed to delete category");
    }
  };

  const showNotification = (type: string, message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      3000
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-0 pb-4">
            {/* Header with Add Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title">Categories Management</h1>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <IconPlus className="me-2" size={16} />
                Add Category
              </button>
            </div>

            {/* Categories Table */}
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title mb-4">Categories List</h5>

                {isLoading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-purple" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center p-5">
                    <p className="text-muted">No categories found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>S.No</th> {/* Changed from ID to Serial Number */}
                          <th>Category Name</th>
                          <th>Created At</th>
                          <th>Updated At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category, index) => (
                          <tr key={category.id}>
                            <td>{index + 1}</td>{" "}
                            {/* Show serial number instead of ID */}
                            <td>{category.title}</td>
                            <td>
                              {new Date(
                                category.created_at
                              ).toLocaleDateString()}
                            </td>
                            <td>
                              {new Date(
                                category.updated_at
                              ).toLocaleDateString()}
                            </td>
                            <td className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setEditCategory({
                                    id: category.id,
                                    title: category.title,
                                  });
                                  setShowEditModal(true);
                                }}
                              >
                                <IconEdit size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setDeleteId(category.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <IconTrash size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && <div className="modal-backdrop fade show"></div>}
      <div className={`modal fade ${showAddModal ? "show d-block" : ""}`}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Category</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
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
                type="button"
                className="btn btn-primary"
                onClick={addCategory}
                disabled={!newCategory.trim()}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {showEditModal && <div className="modal-backdrop fade show"></div>}
      <div className={`modal fade ${showEditModal ? "show d-block" : ""}`}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Category</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editCategory.title}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      title: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && updateCategory()}
                />
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
                type="button"
                className="btn btn-primary"
                onClick={updateCategory}
                disabled={!editCategory.title.trim()}
              >
                Update Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}
      <div className={`modal fade ${showDeleteModal ? "show d-block" : ""}`}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Category</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>
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
                onClick={deleteCategory}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className="position-fixed bottom-0 end-0 m-4"
          style={{ zIndex: 1000 }}
        >
          <div
            className={`alert alert-${
              notification.type === "success" ? "success" : "danger"
            } alert-dismissible fade show`}
          >
            <div className="d-flex align-items-center">
              {notification.type === "success" ? (
                <IconCircleCheck className="me-2" size={24} />
              ) : (
                <IconCircleX className="me-2" size={24} />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
