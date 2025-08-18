'use client'
import { useState, useEffect } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';

//const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'
// const api_startpoint = 'http://152.42.239.141:5000'
// Define TypeScript types for Enrollment
type Enrollment = {
  id: number;
  enrollment_code: string;
  type: number;      // 5 for "Jigyasa", 6 for "Pragya"
  user_id: number;
  unlock_enrollment_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function SettingsGameEnrollments() {

  // Enrollment list and loading state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modal states for add, edit, delete
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [enrollmentToEdit, setEnrollmentToEdit] = useState<Enrollment | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);

  // New enrollment state (for add modal)
  const [newEnrollment, setNewEnrollment] = useState({
      type: '5',         // default to "Jigyasa"
      user_id: '',
      unlock_enrollment_at: '',
  });
  
  // Add state for notification messages
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

      

  // Function to fetch enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
    // GET endpoint for listing enrollments
    const res = await fetch(`${api_startpoint}/api/enrollments`, {
        method: 'GET',
    });
    
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    setEnrollments(data);
    } catch (error) {
    console.error("Error fetching enrollments:", error);
    setNotification({
        message: `Failed to fetch enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
    });
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => {
      fetchEnrollments();
  }, []);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => {
            setNotification(null);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

    // Pagination calculations
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedEnrollments = enrollments.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(enrollments.length / itemsPerPage);

    // Helper: Map type number to text
    const mapType = (type: number) => {
        if (type === 5) return "Jigyasa";
        if (type === 6) return "Pragya";
        return type.toString();
    };

   // Handlers for adding, editing, deleting enrollments
   const handleAddEnrollment = async () => {
      try {
        const payload = {
          enrollment_code: "7789", // Add temporary enrollment_code to satisfy database constraint
          type: parseInt(newEnrollment.type),  // Convert string to number
          user_id: parseInt(newEnrollment.user_id), // Convert string to number
          unlock_enrollment_at: newEnrollment.unlock_enrollment_at || null,
        };
        
        const res = await fetch(`${api_startpoint}/api/enrollments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        setShowAddModal(false);
        // Reset enrollment form
        setNewEnrollment({ type: '5', user_id: '', unlock_enrollment_at: '' });
        
        // Show success notification
        setNotification({
          message: `Enrollment created successfully with code: ${data.enrollment_code}`,
          type: 'success'
        });
        
        fetchEnrollments(); // refresh the table
      } catch (error) {
        console.error("Error adding enrollment:", error);
        setNotification({
          message: `Failed to add enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
        });
      }
  };
        

  const openEditModal = (enrollment: Enrollment) => {
    setEnrollmentToEdit(enrollment);
    setShowEditModal(true);
  };

  const handleUpdateEnrollment = async () => {
      if (!enrollmentToEdit) return;
      try {
      const payload = {
          enrollment_code: enrollmentToEdit.enrollment_code,
          type: enrollmentToEdit.type,
          user_id: enrollmentToEdit.user_id,
          unlock_enrollment_at: enrollmentToEdit.unlock_enrollment_at,
      };
      
      const res = await fetch(`${api_startpoint}/api/enrollments/${enrollmentToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      setShowEditModal(false);
      setEnrollmentToEdit(null);
      
      // Show success notification
      setNotification({
          message: "Enrollment updated successfully",
          type: 'success'
      });
      
      fetchEnrollments();
      } catch (error) {
      console.error("Error updating enrollment:", error);
      setNotification({
          message: `Failed to update enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
      });
      }
  };

  const openDeleteModal = (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment);
    setShowDeleteModal(true);
  };

  const handleDeleteEnrollment = async () => {
      if (!enrollmentToDelete) return;
      try {
      const res = await fetch(`${api_startpoint}/api/enrollments/${enrollmentToDelete.id}`, {
          method: 'DELETE',
      });
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      setShowDeleteModal(false);
      setEnrollmentToDelete(null);
      
      // Show success notification
      setNotification({
          message: "Enrollment deleted successfully",
          type: 'success'
      });
      
      fetchEnrollments();
      } catch (error) {
      console.error("Error deleting enrollment:", error);
      setNotification({
          message: `Failed to delete enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error'
      });
      }
  };

    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className="page-body">
                    <div className="container-xl pt-4 pb-4 space-y-4">
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex flex-col">
                            <h2 className="mb-0">Enrollments</h2>
                            <small className="text-muted">{enrollments.length} Game Enrollments found</small>
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <IconPlus className="me-2" /> Add Enrollment
                            </button>
                        </div>
                        </div>
                        
                        {/* Notification Alert */}
                        {notification && (
                            <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible`} role="alert">
                                {notification.message}
                                <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
                            </div>
                        )}

                        {/* Loading Animation */}
                        {loading ? (
                        <div className="text-center py-4">
                            <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-sky-800"></div>
                            </div>
                        </div>
                        ) : (
                        <div className="card">
                            <div className="card-body overflow-x-auto">
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Enrollment Code</th>
                                    <th>Type</th>
                                    <th>User ID</th>
                                    <th>Unlock Enrollment At</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedEnrollments.length > 0 ? (
                                    paginatedEnrollments.map((enroll) => (
                                        <tr key={enroll.id}>
                                        <td>{enroll.id}</td>
                                        <td>{enroll.enrollment_code}</td>
                                        <td>{mapType(enroll.type)}</td>
                                        <td>{enroll.user_id}</td>
                                        <td>{enroll.unlock_enrollment_at || 'N/A'}</td>
                                        <td>{enroll.created_at}</td>
                                        <td>{enroll.updated_at}</td>
                                        <td>
                                            <button
                                            className="btn btn-secondary btn-sm me-2"
                                            onClick={() => openEditModal(enroll)}
                                            >
                                            <IconEdit /> Edit
                                            </button>
                                            <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => openDeleteModal(enroll)}
                                            >
                                            <IconTrash /> Delete
                                            </button>
                                        </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center">No enrollments found</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                            {/* Pagination Controls */}
                            {paginatedEnrollments.length > 0 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button
                                    className="btn btn-secondary"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    >
                                    Previous
                                    </button>
                                    <span>
                                    Page {currentPage} of {totalPages || 1}
                                    </span>
                                    <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                        prev < totalPages ? prev + 1 : prev
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    >
                                    Next
                                    </button>
                                </div>
                            )}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

      {/* Add Enrollment Modal */}
      {showAddModal && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Enrollment</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">User ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newEnrollment.user_id}
                    onChange={(e) =>
                      setNewEnrollment({ ...newEnrollment, user_id: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unlock Enrollment At</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={newEnrollment.unlock_enrollment_at}
                    onChange={(e) =>
                      setNewEnrollment({ ...newEnrollment, unlock_enrollment_at: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={newEnrollment.type}
                    onChange={(e) =>
                      setNewEnrollment({ ...newEnrollment, type: e.target.value })
                    }
                  >
                    <option value="5">Jigyasa</option>
                    <option value="6">Pragya</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAddEnrollment}
                  disabled={!newEnrollment.user_id}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enrollment Modal */}
      {showEditModal && enrollmentToEdit && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Enrollment</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Enrollment Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enrollmentToEdit.enrollment_code}
                    onChange={(e) =>
                      setEnrollmentToEdit({ ...enrollmentToEdit, enrollment_code: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">User ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={enrollmentToEdit.user_id}
                    onChange={(e) =>
                      setEnrollmentToEdit({ ...enrollmentToEdit, user_id: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Unlock Enrollment At</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={enrollmentToEdit.unlock_enrollment_at || ""}
                    onChange={(e) =>
                      setEnrollmentToEdit({
                        ...enrollmentToEdit,
                        unlock_enrollment_at: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={String(enrollmentToEdit.type)}
                    onChange={(e) =>
                      setEnrollmentToEdit({ ...enrollmentToEdit, type: parseInt(e.target.value) })
                    }
                  >
                    <option value="5">Jigyasa</option>
                    <option value="6">Pragya</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpdateEnrollment}
                  disabled={!enrollmentToEdit.user_id}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Enrollment Modal */}
      {showDeleteModal && enrollmentToDelete && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete enrollment with code: {enrollmentToDelete.enrollment_code}?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteEnrollment}>
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