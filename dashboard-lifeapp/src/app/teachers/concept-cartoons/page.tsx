'use client'
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react'
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconSearch, IconBell, IconSettings, IconTrash } from '@tabler/icons-react';
import { IconEdit } from '@tabler/icons-react';
import {
  Plus,
  Search,
  XCircle,
} from "lucide-react";

// const poppins = Poppins({
//     subsets: ['latin'],
//     weight: ['400', '600', '700'],
//     variable: '--font-poppins',
// });


interface CartoonData {
    id: number;
    la_subject: string;
    la_level_id: string;
    title: string;
    media_id: string | null;
    media_url?: string;
    status: string;
  }
  interface Level {
    id: number;
    title: string;
  }

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function ConceptCartoons() {
    const [lightboxUrl, setLightboxUrl] = useState<string|null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const rowsPerPage = 50;
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    const paginatedData = tableData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    
    // State for the edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRow, setEditingRow] = useState<CartoonData | null>(null);
    
     // State for add modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCartoon, setNewCartoon] = useState<{
              la_subject: string;
              la_level_id: string;
              title: string;
              status: string;
            }>({
              la_subject: "",
             la_level_id: "",
              title: "",
              status: "Drafted",
    });

    // Helper to parse JSON titles (for levels)
    const parseTitle = (jsonStr: string) => {
        try { return JSON.parse(jsonStr).en; }
        catch { return jsonStr; }
    };

    // Fetch levels from API
    useEffect(() => {
        (async () => {
        try {
            const res = await fetch(`${api_startpoint}/api/levels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: 1 })
            });
            const data = await res.json();
            setLevels(data);
        } catch (err) {
            console.error('Failed to fetch levels:', err);
        }
        })();
    }, []);

    const handleClear = () => {
        setSelectedStatus("");
        setSelectedSubject("");
        setTableData([]);
    };
    
    const handleSearch = async () => {
        const filters = {
            status: selectedStatus,
            subject: selectedSubject
        };
        
        setIsTableLoading(true);
    
        try {
            const res = await fetch(`${api_startpoint}/api/teacher_concept_cartoons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            
            if (!res.ok) {
                throw new Error(`API responded with status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log("API response:", data);
            
            if (Array.isArray(data)) {
                setTableData(data);
            } else if (data && typeof data === 'object') {
                if (Object.keys(data).some(key => !isNaN(Number(key)))) {
                    const arrayData = Object.values(data);
                    setTableData(arrayData);
                } else {
                    console.error("API returned non-array data:", data);
                    setTableData([]);
                }
            } else {
                console.error("API returned non-array data:", data);
                setTableData([]);
            }
            
            setCurrentPage(0);
        } catch (error) {
            console.error("Search error:", error);
            setTableData([]);
        } finally {
            setIsTableLoading(false);
        }
    };
    
    // Handle opening the edit modal
    const handleEditClick = (row: CartoonData) => {
        setEditingRow(row);
        setShowEditModal(true);
    };
    
    // Handle closing the edit modal
    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingRow(null);
    };

    // Handle closing the add modal
    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setNewCartoon({
            la_subject: "",
            la_level_id: "",
            title: "",
            status: "Drafted"
        });
        setSelectedFile(null); // Also reset the uploaded file!
    };
    

    
    // Handle form changes for adding and editing
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, isEdit = false) => {
        const { name, value } = e.target;
        if (isEdit && editingRow) {
            setEditingRow({
                ...editingRow,
                [name]: value
            });
        } else {
            setNewCartoon({
                ...newCartoon,
                [name]: value
            });
        }
    };

    // Handle saving the updated data
    const handleSaveChanges = async () => {
        if (!editingRow) return;
        setIsEditLoading(true);
        // 1) Inspect the object
        // console.log("🤔 editingRow:", editingRow);

        
        try {
            const form = new FormData();
            form.append('id', String(editingRow.id));
            form.append('la_subject_id', editingRow.la_subject === 'Science' ? '1' : '2');
            form.append('la_level_id', editingRow.la_level_id);
            form.append('title', editingRow.title);
            form.append('status', editingRow.status === 'Published' ? '1' : '0');
            if (selectedFile) form.append('media', selectedFile);
            const res = await fetch(`${api_startpoint}/api/update_concept_cartoon`, {
              method: 'POST',
              body: form
            });
            
            if (!res.ok) {
                throw new Error(`API responded with status: ${res.status}`);
            }
            
            // Update the local state to reflect the change
            const updatedTableData = tableData.map(row => {
                if (row.id === editingRow.id) {
                    return editingRow;
                }
                return row;
            });
            
            setTableData(updatedTableData);
            setShowEditModal(false);
            setEditingRow(null);
            
            // Re-fetch the data to ensure we have the latest from the server
            handleSearch();
            
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update the concept cartoon. Please try again.");
        } finally {
            setIsEditLoading(false);
        }
    };

    // Handle adding a new cartoon
    const handleAddCartoon = async () => {
        setIsAddLoading(true);
        try {
            const form = new FormData();
            form.append('la_subject_id', newCartoon.la_subject === 'Science' ? '1' : '2');
            form.append('la_level_id', newCartoon.la_level_id);
            form.append('title', newCartoon.title);
            form.append('status', newCartoon.status === 'Published' ? '1' : '0');
            if (selectedFile) form.append('media', selectedFile);
            const res = await fetch(`${api_startpoint}/api/add_concept_cartoon`, { method: 'POST', body: form });

            if (!res.ok) {
                throw new Error(`API responded with status: ${res.status}`);
            }

            setShowAddModal(false);
            handleSearch(); // Refresh table
        } catch (error) {
            console.error("Add error:", error);
            alert("Failed to add the concept cartoon. Please try again.");
        } finally {
            setIsAddLoading(false);
        }
    };
    
    const handleDelete = async (id: number) => {
        if (!confirm('Really delete this cartoon?')) return
        setIsTableLoading(true)
        try {
          const res = await fetch(`${api_startpoint}/api/delete_concept_cartoon/${id}`, {
            method: 'DELETE'
          })
          if (!res.ok) throw new Error(await res.text())
          // re-run your search to refresh data
          await handleSearch()
        } catch (err) {
          console.error('Delete error:', err)
          alert('Failed to delete')
        } finally {
          setIsTableLoading(false)
        }
    }
    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />

            {/* Main Content */}
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className="page-body">
                    <div className='container-xl pt-0 pb-4'>
                        <div className='card shadow-sm border-0 mb-4'>
                            <div className="card-body">
                                <h5 className="card-title mb-4">Search & Filter</h5>
                                <div className="row g-3">
                                    <div className='col-12 col-md-6 col-lg-3'>
                                        <select className='form-select' value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                                            <option value=''>Select Subject</option>
                                            <option value='Science'>Science</option>
                                            <option value='Maths'>Maths</option>
                                        </select>
                                    </div>
                                    <div className='col-12 col-md-6 col-lg-3'>
                                        <select className='form-select' value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                            <option value=''>Select Status</option>
                                            <option value='Published'>Published</option>
                                            <option value='Drafted'>Drafted</option>
                                        </select>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="d-flex flex-row gap-2 mt-4">
                                        <button className="btn btn-success d-inline-flex align-items-center" 
                                        onClick={handleSearch}
                                        >
                                            <Search className="me-2" size={16} />
                                            Search
                                        </button>
                                        
                                        <button className="btn btn-warning d-inline-flex align-items-center text-dark" 
                                        onClick={handleClear}
                                        >
                                            <XCircle className="me-2" size={16} />
                                            Clear
                                        </button>
                                        <button className="btn btn-success d-inline-flex align-items-center" 
                                            onClick={() => setShowAddModal(true)}
                                            >
                                            <Plus className="me-2" size={16} />
                                            Add Concept Cartoon
                                        </button>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                        <div className='card shadow-sm border-0 mt-2 '>
                            <div className="card-body overflow-x-scroll">
                                <h5 className="card-title mb-4">Results- {tableData.length} concept cartoons found</h5>
                                {isTableLoading ? (
                                    <div className="text-center p-5">
                                        <div className="spinner-border text-purple" role="status" style={{ width: "3rem", height: "3rem" }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading data, please wait...</p>
                                    </div>
                                ) : tableData.length === 0 ? (
                                    <div className="text-center p-5">
                                        <div className="text-muted justify-items-center">
                                            <IconSearch size={48} className="mb-3 opacity-50 " />
                                            <p>No data to display. Please use the search filters above and click Search.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th>Level</th>
                                                    <th>Title</th>
                                                    <th>Document</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{row.la_subject}</td>
                                                        <td>{row.la_level_id}</td>
                                                        <td>{row.title}</td>
                                                        <td>{row.media_url ? (
                                                                row.media_url.endsWith('.pdf') ? (
                                                                <div
                                                                    className="flex items-center space-x-2 cursor-pointer text-blue-600"
                                                                    onClick={() => window.open(row.media_url, '_blank')}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                    <span>View PDF</span>
                                                                </div>
                                                                ) : (
                                                                <img
                                                                    src={row.media_url}
                                                                    alt={row.title}
                                                                    className="w-12 h-12 object-cover rounded cursor-pointer"
                                                                    onClick={() => setLightboxUrl(row.media_url!)}
                                                                />
                                                                )
                                                            ) : '—'}
                                                        </td>
                                                        <td>{row.status}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-info"
                                                                onClick={() => handleEditClick(row)}
                                                            >
                                                                <IconEdit size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger ml-2"
                                                                onClick={() => handleDelete(row.id)}
                                                            >
                                                                <IconTrash size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {/* Pagination Controls */}
                                        <div className="d-flex justify-content-between mt-3">
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                                disabled={currentPage === 0}
                                            >
                                                Previous
                                            </button>
                                            <div className="d-flex align-items-center">
                                                <span className="mx-2">
                                                    Page {currentPage + 1} of {Math.ceil(tableData.length / rowsPerPage) || 1}
                                                </span>
                                            </div>
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => setCurrentPage(prev => (prev + 1) * rowsPerPage < tableData.length ? prev + 1 : prev)}
                                                disabled={(currentPage + 1) * rowsPerPage >= tableData.length}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add Modal */}
            {showAddModal && (
                <div className="modal show d-block bg-black bg-opacity-50" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Concept Cartoon</h5>
                                <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Subject</label>
                                        <select className="form-select" name="la_subject" value={newCartoon.la_subject} onChange={(e) => handleFormChange(e)}>
                                            <option value="">Select Subject</option>
                                            <option value="Science">Science</option>
                                            <option value="Maths">Maths</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Level</label>
                                        <select
                                            className="form-select"
                                            name="la_level_id"
                                            value={newCartoon.la_level_id}
                                            onChange={e => handleFormChange(e)}
                                        >
                                            <option value="">Select Level</option>
                                            {levels.map(l => (
                                            <option key={l.id} value={String(l.id)}>{parseTitle(l.title)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input type="text" className="form-control" name="title" value={newCartoon.title} onChange={(e) => handleFormChange(e)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Document</label>
                                        <input
                                            type="file"
                                            name="media"
                                            accept="image/*,.pdf,.csv"
                                            className="form-control"
                                            onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                                        />                                    
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal}>Cancel</button>
                                <button
                                    className={`btn btn-primary flex items-center`}
                                    onClick={handleAddCartoon}
                                    disabled={isAddLoading}
                                >   {isAddLoading && <div className='animate-spin border-t-2  border-white rounded-full w-4 h-4 mr-2'></div> }
                                    {isAddLoading ? 'Adding...' : <><Plus className="me-2" size={16} />Add Cartoon</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {showEditModal && editingRow && (
                <div className="modal show d-block bg-black bg-opacity-50" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Concept Cartoon</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="la_subject" className="form-label">Subject</label>
                                        <select
                                            className="form-select"
                                            id="la_subject"
                                            name="la_subject"
                                            value={editingRow.la_subject}
                                            onChange={e => handleFormChange(e, true)}
                                        >
                                            <option value="Science">Science</option>
                                            <option value="Maths">Maths</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="la_level_id" className="form-label">Level</label>
                                        <select
                                            className="form-select"
                                            name="la_level_id"
                                            value={editingRow.la_level_id}
                                            onChange={e => handleFormChange(e, true)}
                                        >
                                            <option value="">Select Level</option>
                                            {levels.map(l => (
                                            <option key={l.id} value={String(l.id)}>{parseTitle(l.title)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={editingRow.title}
                                            onChange={e => handleFormChange(e, true)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="document" className="form-label">Document</label>
                                        <input
                                            type="file"
                                            name="media"
                                            accept="image/*,.pdf,.csv"
                                            className="form-control"
                                            onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            id="status"
                                            name="status"
                                            value={editingRow.status}
                                            onChange={e => handleFormChange(e, true)}
                                        >
                                            <option value="Published">Published</option>
                                            <option value="Drafted">Drafted</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button
                                    className={`btn btn-primary flex items-center`}
                                    onClick={handleSaveChanges}
                                    disabled={isEditLoading}
                                >   {isEditLoading && <div className='animate-spin border-t-2  border-white rounded-full w-4 h-4 mr-2'></div> }
                                    {isEditLoading ? 'Saving...' : <><IconEdit className="me-2" size={16} />Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {lightboxUrl && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setLightboxUrl(null)}
            >
                <img src={lightboxUrl} className="max-w-[90vw] max-h-[90vh]" />
            </div>
            )}
        </div>
    );
}
