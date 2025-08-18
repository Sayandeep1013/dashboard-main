'use client'
import { useState, useEffect } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import { IconEdit, IconTrash, IconPlus, IconSearch} from '@tabler/icons-react';
import { XCircle } from 'lucide-react';

//const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'
// const api_startpoint = 'http://152.42.239.141:5000'

type Enrollment = {
    id: number;
    user_id: number;
    type: number;
    la_game_enrollment_id: number;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
};
  
const typeOptions = [
{ value: "1", label: "Life Lab Demo Models" },
{ value: "2", label: "Jigyasa Self DIY activities" },
{ value: "3", label: "Pragya DIY activities with Life Lab KITs" },
{ value: "4", label: "Life Lab activities Lesson Plans" },
{ value: "5", label: "Jigyasa" },
{ value: "6", label: "Pragya" }
];


export default function SettingsGameEnrollmentRequests() {
    // State for table data
    const [requests, setRequests] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [statusFilter, setStatusFilter] = useState<string>('all'); // "all", "approved", "not_approved"
    const [typeFilter, setTypeFilter] = useState<string>('all'); // "all" or one of "1" to "6"

    // States for modals
    const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedRequest, setSelectedRequest] = useState<Enrollment | null>(null);

    // Form state for add/edit
    const [formData, setFormData] = useState({
    user_id: "",
    type: "",
    la_game_enrollment_id: "",
    approved_at: "" // leave blank if not approved
    });

    // Fetch the enrollment requests list (with filters)
    const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch(`${api_startpoint}/api/game_enrollment_requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: statusFilter, // "approved", "not_approved", or "all"
            type: typeFilter       // e.g., "1", "2", etc. or "all"
        })
        });
        if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
        }
        const data = await res.json();
        setRequests(data);
    } catch (err: any) {
        setError(err.message || "Error fetching data.");
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {
    fetchRequests();
    }, [statusFilter, typeFilter]);

    // Handlers for modals
    const openAddModal = () => {
    setFormData({
        user_id: "",
        type: "",
        la_game_enrollment_id: "",
        approved_at: ""
    });
    setAddModalOpen(true);
    };

    const openEditModal = (request: Enrollment) => {
    setSelectedRequest(request);
    setFormData({
        user_id: request.user_id.toString(),
        type: request.type.toString(),
        la_game_enrollment_id: request.la_game_enrollment_id.toString(),
        approved_at: request.approved_at || ""
    });
    setEditModalOpen(true);
    };

    const openDeleteModal = (request: Enrollment) => {
    setSelectedRequest(request);
    setDeleteModalOpen(true);
    };

    // API handler for adding
    const handleAdd = async () => {
    try {
        const res = await fetch(`${api_startpoint}/api/game_enrollment_requests/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.error) {
        alert("Error: " + data.error);
        } else {
        alert(data.message);
        setAddModalOpen(false);
        fetchRequests();
        }
    } catch (error: any) {
        alert("Error: " + error.message);
    }
    };

    // API handler for editing
    const handleEdit = async () => {
    if (!selectedRequest) return;
    try {
        const res = await fetch(`${api_startpoint}/api/game_enrollment_requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.error) {
        alert("Error: " + data.error);
        } else {
        alert(data.message);
        setEditModalOpen(false);
        fetchRequests();
        }
    } catch (error: any) {
        alert("Error: " + error.message);
    }
    };

    // API handler for deleting
    const handleDelete = async () => {
    if (!selectedRequest) return;
    try {
        const res = await fetch(`${api_startpoint}/api/game_enrollment_requests/${selectedRequest.id}`, {
        method: 'DELETE'
        });
        const data = await res.json();
        if (data.error) {
        alert("Error: " + data.error);
        } else {
        alert(data.message);
        setDeleteModalOpen(false);
        fetchRequests();
        }
    } catch (error: any) {
        alert("Error: " + error.message);
    }
    };

    // Clear filters handler
    const handleClear = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    };

    return (
    <div className={`page bg-body ${inter.className} font-sans`}>
        <Sidebar />
        <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className="page-body">
            <div className="container-xl pt-4 pb-4 space-y-4">
            {/* Header and Filter Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Game Enrollment Requests</h2>
                <button className="btn btn-primary" onClick={openAddModal}>
                <IconPlus className="me-2" /> Add Request
                </button>
            </div>
            
            <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label">Status</label>
                <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="not_approved">Not Approved</option>
                </select>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label">Type</label>
                <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                    ))}
                </select>
                </div>
                <div className="col-12 d-flex gap-2">
                <button className="btn btn-success" onClick={fetchRequests}>
                    <IconSearch className="me-1" size={16} /> Search
                </button>
                <button className="btn btn-warning" onClick={handleClear}>
                    <XCircle className="me-1" size={16} /> Clear
                </button>
                </div>
            </div>
            
            {/* Table Section */}
            <div className="card shadow-sm border-0">
                <div className="card-body overflow-x-auto">
                {loading ? (
                    <div className="text-center p-5">
                    <div className="spinner-border" role="status"></div>
                    <p className="mt-3 text-muted">Loading data, please wait...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-danger p-5">
                    <p>Error: {error}</p>
                    </div>
                ) : (
                    <>
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>User ID</th>
                            <th>Type</th>
                            <th>Game Enrollment ID</th>
                            <th>Approved At</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map((req) => (
                            <tr key={req.id}>
                            <td>{req.id}</td>
                            <td>{req.user_id}</td>
                            <td>{req.type}</td>
                            <td>{req.la_game_enrollment_id}</td>
                            <td>{req.approved_at ? req.approved_at : "Not Approved"}</td>
                            <td>{req.created_at}</td>
                            <td>{req.updated_at}</td>
                            <td>
                                <button className="btn btn-sm btn-primary me-2" onClick={() => openEditModal(req)}>
                                <IconEdit size={16} />
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => openDeleteModal(req)}>
                                <IconTrash size={16} />
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
        
        {/* -------------------
            Add Request Modal
        ------------------- */}
        {addModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Add Game Enrollment Request</h5>
                <button className="btn-close" onClick={() => setAddModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input
                    type="text"
                    className="form-control"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                    <option value="">Select Type</option>
                    {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                        {option.label}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Game Enrollment ID</label>
                    <input
                    type="text"
                    className="form-control"
                    value={formData.la_game_enrollment_id}
                    onChange={(e) => setFormData({ ...formData, la_game_enrollment_id: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Approved At</label>
                    <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.approved_at}
                    onChange={(e) => setFormData({ ...formData, approved_at: e.target.value })}
                    required
                    />
                </div>
                </div>
                <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>
                    Close
                </button>
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add Request
                </button>
                </div>
            </div>
            </div>
        </div>
        )}
        
        {/* -------------------
            Edit Request Modal
        ------------------- */}
        {editModalOpen && selectedRequest && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Edit Game Enrollment Request</h5>
                <button className="btn-close" onClick={() => setEditModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input
                    type="text"
                    className="form-control"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                    <option value="">Select Type</option>
                    {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                        {option.label}
                        </option>
                    ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Game Enrollment ID</label>
                    <input
                    type="text"
                    className="form-control"
                    value={formData.la_game_enrollment_id}
                    onChange={(e) => setFormData({ ...formData, la_game_enrollment_id: e.target.value })}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Approved At</label>
                    <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.approved_at}
                    onChange={(e) => setFormData({ ...formData, approved_at: e.target.value })}
                    required
                    />
                </div>
                </div>
                <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={handleEdit}>
                    Save Changes
                </button>
                </div>
            </div>
            </div>
        </div>
        )}
        
        {/* -------------------
            Delete Request Modal
        ------------------- */}
        {deleteModalOpen && selectedRequest && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Delete Request</h5>
                <button className="btn-close" onClick={() => setDeleteModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                <p>Are you sure you want to delete this request?</p>
                <p><strong>{selectedRequest.id}</strong></p>
                </div>
                <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
                    Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
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