'use client'
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconSearch, IconBell, IconSettings, IconEdit, IconTrash } from '@tabler/icons-react';
import { Plus, XCircle } from "lucide-react";

// const poppins = Poppins({
//     subsets: ['latin'],
//     weight: ['400', '600', '700'],
//     variable: '--font-poppins',
// });

interface LessonPlanLanguage {
    id?: number;
    title: string;
    status: string;
}

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function LessonPlanLanguage() {
    const [tableData, setTableData] = useState<LessonPlanLanguage[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const rowsPerPage = 50;
    const [isTableLoading, setIsTableLoading] = useState(false);
    const paginatedData = tableData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRow, setEditingRow] = useState<LessonPlanLanguage | null>(null);

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLesson, setNewLesson] = useState<LessonPlanLanguage>({
        title: '',
        status: 'Draft'
    });

    // ✅ Move this function outside of useEffect so it can be reused
    async function fetchLessonPlanLanguages() {
        try {
            setIsTableLoading(true);
            const res = await fetch(`${api_startpoint}/api/lesson_plan_language`);
            const data: LessonPlanLanguage[] = await res.json();
            setTableData(data);
        } catch (error) {
            console.error("Error fetching lesson plan languages:", error);
        } finally {
            setIsTableLoading(false);
        }
    }

    useEffect(() => {
        fetchLessonPlanLanguages();
    }, []);

    const handleEditClick = (row: LessonPlanLanguage) => {
        setEditingRow(row);
        setShowEditModal(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingRow) {
            setEditingRow({ ...editingRow, [name]: value });
        } else {
            setNewLesson({ ...newLesson, [name]: value });
        }
    };

    const handleSaveChanges = async () => {
        if (!editingRow) return;

        try {
            const res = await fetch(`${api_startpoint}/api/update_lesson_plan_language`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingRow.id,
                    title: editingRow.title,
                    status: editingRow.status === 'Publish' ? 1 : 0
                })
            });

            if (!res.ok) {
                throw new Error(`API responded with status: ${res.status}`);
            }

            setShowEditModal(false);
            fetchLessonPlanLanguages(); // ✅ This function is now accessible
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update the lesson plan language.");
        }
    };

    const handleAddLesson = async () => {
        try {
            const res = await fetch(`${api_startpoint}/api/add_lesson_plan_language`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newLesson.title,
                    status: newLesson.status === 'Publish' ? 1 : 0
                })
            });

            if (!res.ok) {
                throw new Error(`API responded with status: ${res.status}`);
            }

            setShowAddModal(false);
            fetchLessonPlanLanguages(); // ✅ No more errors here
        } catch (error) {
            console.error("Add error:", error);
            alert("Failed to add the lesson plan language.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
    
        try {
            const res = await fetch(`${api_startpoint}/api/delete_lesson_plan_language/${id}`, {
                method: 'DELETE'
            });
    
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            fetchLessonPlanLanguages(); // Refresh data
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete the lesson plan language.");
        }
    };
    
    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                {/* <header className="navbar navbar-expand-md navbar-light bg-white shadow-sm border-bottom mb-3">
                    <div className="container-fluid">
                        <div className="d-flex flex-grow-0 align-items-center w-full">
                            <span className='font-bold text-xl text-black '>LifeAppDashBoard</span>
                            <div className='w-5/6 h-10'></div>
                            <div className='d-flex gap-3 align-items-center'>
                                <a href="#" className="btn btn-light btn-icon"><IconSearch size={20} /></a>
                                <a href="#" className="btn btn-light btn-icon"><IconBell size={20} /></a>
                                <a href="#" className="btn btn-light btn-icon"><IconSettings size={20} /></a>
                            </div>
                        </div>
                    </div>
                </header> */}
                <div className="page-body">
                    <div className='container-xl pt-0 pb-4'>
                        <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
                            <Plus size={16} className="me-2" />
                            Add Lesson Plan Language
                        </button>

                        <div className='card shadow-sm border-0 mt-2 mb-4'>
                            <div className='card-body overflow-x-scroll'>
                                {isTableLoading ? (
                                    <div className="text-center p-5">
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.title}</td>
                                                    <td>{row.status}</td>
                                                    <td className="flex gap-2">
                                                        <button className="btn btn-sm btn-info" onClick={() => handleEditClick(row)}>
                                                            <IconEdit size={16} />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id!)}>
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

            {/* Add & Edit Modal */}
            {showEditModal && editingRow && (
                <div className="modal show d-block bg-black bg-opacity-50">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Lesson Plan Language</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input type="text" name="title" value={editingRow.title} onChange={handleFormChange} />
                                <select name="status" value={editingRow.status} onChange={handleFormChange}>
                                    <option value="Publish">Publish</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showAddModal && (
                <div className="modal show d-block bg-black bg-opacity-50">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Lesson Plan Language</h5>
                                <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={newLesson.title} 
                                    onChange={handleFormChange} 
                                    className="form-control mb-3"
                                    placeholder="Enter title"
                                />
                                <select 
                                    name="status" 
                                    value={newLesson.status} 
                                    onChange={handleFormChange}
                                    className="form-select"
                                >
                                    <option value="Publish">Publish</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleAddLesson}>Add Language</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
