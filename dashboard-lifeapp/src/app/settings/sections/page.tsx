'use client'
import { useState, useEffect } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from "@/lib/utils";
import '@tabler/core/dist/css/tabler.min.css';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

interface Section {
    id: number;
    name: string;
    status: number;
    created_at: string;
    updated_at: string;
}


export default function SettingsSections() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSection, setNewSection] = useState({ name: '', status: 1 });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingSectionId, setDeletingSectionId] = useState<number | null>(null);

    async function fetchSections() {
        try {
            setLoading(true);
            const body = statusFilter === 'all' ? {} : { status: statusFilter === 'active' ? 1 : 0 };
            const response = await fetch(`${api_startpoint}/api/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data: Section[] = await response.json();
            setSections(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sections:', error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSections();
    }, [statusFilter]);

    async function handleAddSection() {
        try {
            const response = await fetch(`${api_startpoint}/api/sections_new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSection)
            });
            if (response.ok) {
                fetchSections();
                setShowAddModal(false);
                setNewSection({ name: '', status: 1 });
            }
        } catch (error) {
            console.error('Error adding section:', error);
        }
    }

    async function handleUpdateSection() {
        if (!editingSection) return;
        try {
            const response = await fetch(`${api_startpoint}/api/sections_update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSection)
            });
            if (response.ok) {
                fetchSections();
                setShowEditModal(false);
                setEditingSection(null);
            }
        } catch (error) {
            console.error('Error updating section:', error);
        }
    }

    async function handleDeleteSectionDirect(id: number) {
        try {
            const response = await fetch(`${api_startpoint}/api/sections_delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            if (response.ok) {
                fetchSections();
                setDeletingSectionId(null);
                // Ensure other state is clean
                setNewSection({ name: '', status: 1 });
            }
        } catch (error) {
            console.error('Error deleting section:', error);
        }
    }

    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className='page-body'>
                    <div className='container-xl pt-4 pb-4 space-y-2'>
                        <div className="card shadow-sm border-0">
                            <div className="card-body overflow-x-scroll">
                                <h4 className="card-title">Sections</h4>
                                <div className="mb-3 d-flex justify-content-between">
                                    <div>
                                        <label className="me-2">Filter by Status:</label>
                                        <select 
                                            className="form-select w-auto d-inline-block"
                                            value={statusFilter} 
                                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                        >
                                            <option value="all">All</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <button className="btn btn-primary" onClick={() => {
                                        // Reset form state completely before showing modal
                                        setNewSection({ name: '', status: 1 });
                                        setShowAddModal(true);
                                    }}>
                                        <IconPlus size={16} className="me-1" /> Add New Section
                                    </button>
                                </div>
                                <div className="table-responsive">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-40">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-800"></div>
                                        </div>
                                    ) : (
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Name</th>
                                                    <th>Status</th>
                                                    <th>Created At</th>
                                                    <th>Updated At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sections.map((section) => (
                                                    <tr key={section.id}>
                                                        <td>{section.id}</td>
                                                        <td>{section.name}</td>
                                                        <td>{section.status === 1 ? 'Active' : 'Inactive'}</td>
                                                        <td>{section.created_at}</td>
                                                        <td>{section.updated_at}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-primary mx-1"
                                                                onClick={() => { setEditingSection(section); setShowEditModal(true); }}
                                                                >
                                                                <IconEdit size={16} />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger mx-1"
                                                               onClick={() => { 
                                                                if (window.confirm('Are you sure you want to delete this section?')) {
                                                                    handleDeleteSectionDirect(section.id);
                                                                }
                                                            }}>
                                                                <IconTrash size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showAddModal && (
                <div className="modal d-block" tabIndex={-1}
                    style={{ 
                        background: 'rgba(0,0,0,0.5)', 
                        position: 'fixed', 
                        top: 0, left: 0, 
                        width: '100vw', height: '100vh', 
                        zIndex: 1050 
                    }}
                    >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Section</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        // Reset form when manually closing
                                        setNewSection({ name: '', status: 1 });
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={newSection.name || ''} 
                                        onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} 
                                        key={`new-section-name-${showAddModal}`}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select 
                                        className="form-select" 
                                        value={newSection.status} 
                                        onChange={(e) => setNewSection({ ...newSection, status: parseInt(e.target.value) })}>
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => {
                                    setShowAddModal(false);
                                    // Reset form when manually closing
                                    setNewSection({ name: '', status: 1 });
                                }}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddSection}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && editingSection && (
                <div className="modal d-block" tabIndex={-1}
                    style={{ 
                        background: 'rgba(0,0,0,0.5)', 
                        position: 'fixed', 
                        top: 0, left: 0, 
                        width: '100vw', height: '100vh', 
                        zIndex: 1050 
                    }}
                    key={`edit-modal-${editingSection.id}`}
                    >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Section</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editingSection?.name || ''} 
                                        onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })} 
                                        key={`edit-section-name-${showEditModal}`}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select 
                                        className="form-select" 
                                        value={editingSection.status} 
                                        onChange={(e) => setEditingSection({ ...editingSection, status: parseInt(e.target.value) })}>
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdateSection}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}