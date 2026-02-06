'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import NumberFlow from '@number-flow/react';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';
const inter = Inter({ subsets: ['latin'] });
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

// Type definitions for Competency and Subject
interface Competency {
    id: number;
    competency_title: string; // comes from comp.title in our SQL query
    // document: string;
    status: number; // e.g. 1 for ACTIVE, 0 for DEACTIVE
    created_at: string;
    subject_title: string; // JSON string: e.g. '{"en": "Maths"}'
    level_title: string;   // JSON string: e.g. '{"en": "Level 1"}'
    la_subject_id: number;
    la_level_id: number;

    document_id: string;     // raw ID
    document_path?: string;  // from API
    document_url?: string;   // built server-side

  }
  
  interface Subject {
    id: number;
    title: string; // JSON string: e.g. '{"en": "Science"}'
  }
  interface Level   { id: number; title: string; }

  export default function TeacherCompetencies() {
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [levels, setLevels]           = useState<Level[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [filterSubject, setFilterSubject] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>(''); // "" means all
    const [page, setPage] = useState<number>(1);
  
    // Modal states for Add, Edit and Delete
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Form state for Add / Edit
    const [formCompetency, setFormCompetency] = useState<{
      name: string;
      la_subject_id: string;
      la_level_id: string;
      status: string;
      document: string | File;  // <-- IMPORTANT: allow both string and File
    }>({
      name: '',
      la_subject_id: '',
      la_level_id: '',
      status: '',
      document: '',   // initial empty string
    });
    
  
    // Fetch competencies and subjects using the updated endpoint
    const fetchCompetencies = async () => {
      setLoadingList(true);
      try {
        const params = new URLSearchParams();
        if (filterSubject) params.append('la_subject_id', filterSubject);
        if (filterStatus) params.append('status', filterStatus);
        params.append('page', page.toString());
        const res = await fetch(`${api_startpoint}/admin/competencies?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.error) {
          console.error(data.error);
        } else {
          setCompetencies(data.competencies);
          setSubjects(data.subjects);
          setTotalCount(data.competencies.length);
        }
      } catch (error) {
        console.error('Error fetching competencies:', error);
      } finally {
        setLoadingList(false);
      }
    };
  
    useEffect(() => {
      fetchCompetencies();
      fetchLevels();
    }, [filterSubject, filterStatus, page]);
  
    // Helper function to parse JSON titles
    const parseTitle = (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        return parsed.en || jsonStr;
      } catch (error) {
        return jsonStr;
      }
    };

    const fetchLevels = async () => {
      const res = await fetch(`${api_startpoint}/api/levels`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1 })
      });
      const levels = await res.json();
      setLevels(levels);
    };
  
    // Handlers for filters
    const handleSearch = () => {
      setPage(1);
      fetchCompetencies();
    };
  
    const handleClear = () => {
      setFilterSubject('');
      setFilterStatus('');
      setPage(1);
      fetchCompetencies();
    };
    
    // Form handlers
    const handleFormChange = (field: string, value: any) => {
      setFormCompetency(prev => ({ ...prev, [field]: value }));
    };
    // Add competency
    const addCompetency = async () => {
      if (!(formCompetency.document instanceof File)) {
        alert('Please upload a document before saving.');
        return;
      }
      setIsAdding(true);
      const form = new FormData();
      form.append('name', formCompetency.name);
      form.append('la_subject_id', formCompetency.la_subject_id);
      form.append('la_level_id', formCompetency.la_level_id);
      form.append('status', formCompetency.status);
      form.append('document', formCompetency.document);
    
      try {
        const res = await fetch(`${api_startpoint}/admin/competencies`, {
          method: 'POST',
          body: form
          // ⚡ NO headers here! Browser will auto-set correct multipart content-type
        });
    
        const data = await res.json();
        if (res.ok && data.message) {
          setShowAddModal(false);
          fetchCompetencies();
        } else {
          console.error(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error adding competency:', error);
      } finally { setIsAdding(false); }
    };
    
  
    // Open Edit modal
    const openEditModal = (comp: Competency) => {
      setSelectedCompetency(comp);
      setFormCompetency({
        name: comp.competency_title,
        la_subject_id: comp.subject_title ? comp.la_subject_id.toString() : '',
        la_level_id: comp.level_title ? comp.la_level_id.toString() : '',
        status: comp.status.toString(),
        document: ''
      });
      setShowEditModal(true);
    };
  
    // Update competency
    const updateCompetency = async () => {
      if (!selectedCompetency) return;
      setIsUpdating(true);
      const form = new FormData();
      form.append('name', formCompetency.name);
      form.append('la_subject_id', formCompetency.la_subject_id);
      form.append('la_level_id', formCompetency.la_level_id);
      form.append('status', formCompetency.status);
      if (formCompetency.document instanceof File) {
        form.append('document', formCompetency.document);
      }
      try {
        const res = await fetch(`${api_startpoint}/admin/competencies/${selectedCompetency.id}`, {
          method: 'PUT',
          // headers: { 'Content-Type': 'application/json' },
          body: form
        });
        const data = await res.json();
        if (data.message) {
          setShowEditModal(false);
          setSelectedCompetency(null);
          fetchCompetencies();
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error updating competency:', error);
      } finally { setIsUpdating(false); }
    };
  
    // Open Delete modal
    const openDeleteModal = (comp: Competency) => {
      setSelectedCompetency(comp);
      setShowDeleteModal(true);
    };
  
    // Delete competency
    const deleteCompetency = async () => {
      if (!selectedCompetency) return;
      setIsDeleting(true);
      try {
        const res = await fetch(`${api_startpoint}/admin/competencies/${selectedCompetency.id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.message) {
          setShowDeleteModal(false);
          setSelectedCompetency(null);
          fetchCompetencies();
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error deleting competency:', error);
      } finally { setIsDeleting(false); }
    };
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    return (
      <div className={`page bg-body ${inter.className} font-sans`}>
        <Sidebar />
        <div className="page-wrapper" style={{ marginLeft: '250px' }}>
          <div className="page-body">
            <div className="container-xl pt-4 pb-4 space-y-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="text-xl font-semibold">Competencies</h2>
                  <h5 className="text-muted">{totalCount} {totalCount === 1 ? 'record' : 'records'} found</h5>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <IconPlus className="me-2" /> Add Competency
                </button>
              </div>
  
              {/* Filters */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {parseTitle(sub.title)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-3">
                  <button className="btn btn-success" onClick={handleSearch}>Search</button>
                  <button className="btn btn-warning" onClick={handleClear}>Clear</button>
                </div>
              </div>
  
              {/* Table */}
              <div className="card shadow-sm border-0">
                <div className="card-body overflow-x-auto">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Level</th>
                        <th>Competency Title</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {loadingList ? (
                      <tr><td colSpan={7} className="text-center py-8">
                        <div className="animate-spin border-t-2 border-blue-500 rounded-full w-8 h-8 mx-auto"></div>
                      </td></tr>
                    ) : competencies.map((comp) => (
                        <tr key={comp.id}>
                          <td>{parseTitle(comp.subject_title)}</td>
                          <td>{parseTitle(comp.level_title)}</td>
                          <td>{comp.competency_title}</td>
                          <td>{comp.document_url ? (
                              /\.(jpe?g|png|gif)$/i.test(comp.document_url) ? (
                                <>
                                  <img
                                    src={comp.document_url}
                                    alt="doc"
                                    className="w-16 h-16 object-cover rounded cursor-pointer transition-transform hover:scale-110"
                                    onClick={() => setLightboxUrl(comp.document_url!)}
                                  />
                                </>
                              ) : (
                                <a href={comp.document_url} target="_blank" rel="noopener" className="text-blue-600 underline">
                                  Download
                                </a>
                              )
                            ) : '—'}
                          </td>
                          <td>{comp.status === 1 ? 'Active' : 'Inactive'}</td>
                          <td>{comp.created_at}</td>
                          <td>
                            <button className="btn btn-icon btn-secondary me-2" onClick={() => openEditModal(comp)}>
                              <IconEdit size={16} />
                            </button>
                            <button className="btn btn-icon btn-danger" onClick={() => openDeleteModal(comp)}>
                              <IconTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Pagination controls could be added here */}
            </div>
          </div>
        </div>
  
        {/* Add Competency Modal */}
        {showAddModal && (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Competency</h5>
                  <button className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Competency Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formCompetency.name}
                      onChange={(e) => setFormCompetency({ ...formCompetency, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      value={formCompetency.la_subject_id}
                      onChange={(e) => setFormCompetency({ ...formCompetency, la_subject_id: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {parseTitle(sub.title)}
                        </option>
                      ))}
                    </select>
                  </div>
                    <div className="mb-3">
                      <label className="form-label">Level</label>
                      <select
                        className="form-select"
                        value={formCompetency.la_level_id}
                        onChange={e => handleFormChange('la_level_id', e.target.value)}
                      >
                        <option value="">Select Level</option>
                        {levels.map(lvl => (
                          <option key={lvl.id} value={lvl.id}>{parseTitle(lvl.title)}</option>
                        ))}
                      </select>
                    </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formCompetency.status}
                      onChange={(e) => setFormCompetency({ ...formCompetency, status: e.target.value })}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div className="mb-3">
                     <label className="form-label">Document</label>
                     <input
                       type="file"
                       name="document"
                       accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                       className="form-control"
                       onChange={e =>
                         setFormCompetency(prev => ({
                           ...prev,
                           document: e.target.files ? e.target.files[0] : ''
                         }))
                       }
                     />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Close
                  </button>
                  <button
                    className="btn btn-primary flex items-center"
                    onClick={addCompetency}
                    disabled={isAdding}
                  >
                    {isAdding && <div className="animate-spin border-t-2 border-white rounded-full w-4 h-4 mr-2"></div>}
                    {isAdding ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Edit Competency Modal */}
        {showEditModal && selectedCompetency && (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Competency</h5>
                  <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Competency Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formCompetency.name}
                      onChange={(e) =>
                        setFormCompetency({ ...formCompetency, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      value={formCompetency.la_subject_id}
                      onChange={(e) =>
                        setFormCompetency({ ...formCompetency, la_subject_id: e.target.value })
                      }
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {parseTitle(sub.title)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                      <label className="form-label">Level</label>
                      <select
                        className="form-select"
                        value={formCompetency.la_level_id}
                        onChange={e => handleFormChange('la_level_id', e.target.value)}
                      >
                        <option value="">Select Level</option>
                        {levels.map(lvl => (
                          <option key={lvl.id} value={lvl.id}>{parseTitle(lvl.title)}</option>
                        ))}
                      </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formCompetency.status}
                      onChange={(e) =>
                        setFormCompetency({ ...formCompetency, status: e.target.value })
                      }
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Document</label>
                    <input
                      type="file"
                      name="document"
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                      className="form-control"
                      onChange={e =>
                        setFormCompetency(prev => ({
                          ...prev,
                          document: e.target.files ? e.target.files[0] : ''
                        }))
                      }
                    />

                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary flex items-center"
                    onClick={updateCompetency}
                    disabled={isUpdating}
                  >
                    {isUpdating && <div className="animate-spin border-t-2 border-white rounded-full w-4 h-4 mr-2"></div>}
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Delete Competency Modal */}
        {showDeleteModal && selectedCompetency && (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Competency</h5>
                  <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete competency: <strong>{selectedCompetency.competency_title}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger flex items-center"
                    onClick={deleteCompetency}
                    disabled={isDeleting}
                  >
                    {isDeleting && <div className="animate-spin border-t-2 border-white rounded-full w-4 h-4 mr-2"></div>}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

                      {lightboxUrl && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 mt-0"
                            onClick={() => setLightboxUrl(null)}
                        >
                            <div className="relative">
                            <img
                                src={lightboxUrl}
                                alt="Enlarged Preview"
                                className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                            />
                            <button
                                className="absolute top-2 right-2 text-white bg-gray-900 rounded-full p-1"
                                onClick={(e) => {
                                e.stopPropagation(); // prevent closing when clicking the button itself
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