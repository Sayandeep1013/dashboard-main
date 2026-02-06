'use client'
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconSearch, IconBell, IconSettings, IconEdit, IconTrash } from '@tabler/icons-react';
import { Plus, Search, XCircle } from "lucide-react";

// const poppins = Poppins({
//   subsets: ['latin'],
//   weight: ['400', '600', '700'],
//   variable: '--font-poppins',
// });

interface Assessment {
  id: number;
  subject: string;   // Science | Maths
  subject_id?: number; // Added subject_id field
  grade: number;
  title: string;
  document_id: number | null;
  document_url?: string;
  status: string;    // Published | Drafted
}
interface Subject { id: number; title: string; }
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";
export default function TeacherAssessment() {
  // State for table data and pagination
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tableData, setTableData] = useState<Assessment[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const rowsPerPage = 50;
  const paginatedData = tableData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Filter states
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterGrade, setFilterGrade] = useState<string>("");
  const [filterTitle, setFilterTitle] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states for Add and Edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({  subject_id: undefined,subject: '', grade: 1, title: '', document_id: null, status: 'Drafted' });
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Helper to parse JSON titles
  const parseTitle = (jsonStr: string) => {
    try { return JSON.parse(jsonStr).en; }
    catch { return jsonStr; }
  };

  // Fetch subjects
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/subjects_list`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '1' })
        });
        const data = await res.json();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    })();
  }, []);

  // Function to fetch assessments based on filters
  const fetchAssessments = async () => {
    setIsTableLoading(true);
    try {
      // Find subject ID from subject name if filterSubject is set
      const subjectId = filterSubject ? 
        subjects.find(s => parseTitle(s.title) === filterSubject)?.id : 
        "";
      const res = await fetch(`${api_startpoint}/api/assessments_search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: subjectId, grade: filterGrade, title: filterTitle, status: filterStatus })
      });
      const data = await res.json();
      setTableData(Array.isArray(data) ? data : []);
      setCurrentPage(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => { fetchAssessments(); }, []);

  // Function to clear filters
  const handleClear = () => {
    setFilterSubject(''); setFilterGrade(''); setFilterTitle(''); setFilterStatus('');
    setTableData([]);
  };

  const handleSearch = () => fetchAssessments();

  const openAddModal = () => { 
    setShowAddModal(true); 
    setNewAssessment({ 
      subject_id: undefined, 
      subject: '', 
      grade: 1, 
      title: '', 
      document_id: null, 
      status: 'Drafted' 
    }); 
    setSelectedFile(null); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };
  
  const openEditModal = (row: Assessment) => { 
    // Find the subject ID for this row
    const subject = subjects.find(s => parseTitle(s.title) === row.subject);
    
    setEditingAssessment({
      ...row,
      subject_id: subject?.id
    }); 
    setShowEditModal(true); 
    setSelectedFile(null); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const closeModals = () => { 
    setShowAddModal(false); 
    setShowEditModal(false); 
    setEditingAssessment(null); 
    setNewAssessment({ 
      subject_id: undefined, 
      subject: '', 
      grade: 1, 
      title: '', 
      document_id: null, 
      status: 'Drafted' 
    }); 
    setSelectedFile(null); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  // Handle subject selection and keep both ID and display name
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>, isNewAssessment: boolean) => {
    const selectedId = Number(e.target.value);
    const selectedSubject = subjects.find(s => s.id === selectedId);
    
    if (isNewAssessment) {
      setNewAssessment({
        ...newAssessment,
        subject_id: selectedId,
        subject: selectedSubject ? parseTitle(selectedSubject.title) : ''
      });
    } else if (editingAssessment) {
      setEditingAssessment({
        ...editingAssessment,
        subject_id: selectedId,
        subject: selectedSubject ? parseTitle(selectedSubject.title) : ''
      });
    }
  };
  // Add assessment
  const handleAdd = async () => {
    setIsAddLoading(true);
    const form = new FormData();
    form.append('subject_id', String(newAssessment.subject_id || ''));
    form.append('grade', String(newAssessment.grade));
    form.append('title', newAssessment.title || '');
    if (selectedFile) form.append('media', selectedFile);
    form.append('status', newAssessment.status || 'Drafted');
    await fetch(`${api_startpoint}/api/add_assessment`, { method: 'POST', body: form });
    setIsAddLoading(false); closeModals(); fetchAssessments();
  };

  // Update assessment
  const handleUpdate = async () => {
    if (!editingAssessment) return;
    setIsEditLoading(true);
    const form = new FormData();
    form.append('id', String(editingAssessment.id));
    form.append('subject_id', String(editingAssessment.subject_id || ''));
    form.append('grade', String(editingAssessment.grade));
    form.append('title', editingAssessment.title);
    if (selectedFile) form.append('media', selectedFile);
    form.append('status', editingAssessment.status);
    await fetch(`${api_startpoint}/api/update_assessment`, { method: 'POST', body: form });
    setIsEditLoading(false); closeModals(); fetchAssessments();
  };

  // Delete assessment
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assessment?')) return;
    await fetch(`${api_startpoint}/api/delete_assessment/${id}`, { method: 'DELETE' });
    fetchAssessments();
  };

  const paginated = tableData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const renderDocument = (row: Assessment) => {
    if (!row.document_url) return '—';
    return row.document_url.endsWith('.pdf')
      ? <button className="btn btn-link" onClick={() => window.open(row.document_url, '_blank')}>📄 PDF</button>
      : <img src={row.document_url} alt="" className="w-12 h-12 cursor-pointer" onClick={() => setLightboxUrl(row.document_url!)} />;
  };


  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />

      {/* Main Content */}
      <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className='page-body'>
          <div className="container-xl pt-0 pb-4">
            {/* Search & Filter Section */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Assessment</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                  <select className="form-select mb-2" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.filter(s => subjects).map(s => (
                      <option key={s.id} value={parseTitle(s.title)}>{parseTitle(s.title)}</option>
                    ))}
                  </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-2">
                    <select
                      className="form-select"
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Title"
                      value={filterTitle}
                      onChange={(e) => setFilterTitle(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-2">
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Published">Published</option>
                      <option value="Drafted">Drafted</option>
                    </select>
                  </div>
                  
                </div>
                <div className="col-12 col-lg-2 d-flex gap-2 mt-4">
                    <button className="btn btn-success d-inline-flex align-items-center" onClick={handleSearch}>
                      <Search className="me-2" size={16} /> Search
                    </button>
                    <button className="btn btn-warning d-inline-flex align-items-center text-dark" onClick={handleClear}>
                      <XCircle className="me-2" size={16} /> Clear
                    </button>
                    <button className="btn btn-success d-inline-flex align-items-center" onClick={openAddModal}>
                      <Plus className="me-2" size={16} /> Add
                    </button>
                  </div>
              </div>
            </div>

            {/* Assessments Table */}
            <div className="card shadow-sm border-0 mt-2">
              <div className="card-body overflow-x-scroll">
                <h5 className="card-title mb-4">Results- {tableData.length} Assessments found</h5>
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
                      <IconSearch size={48} className="mb-3 opacity-50" />
                      <p>No data to display. Please use the search filters above and click Search.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Grade</th>
                          <th>Title</th>
                          <th>Document</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((row, index) => (
                          <tr key={row.id || index}>
                            <td>{row.subject}</td>
                            <td>{row.grade}</td>
                            <td>{row.title}</td>
                            <td>{renderDocument(row)}</td>
                            <td>{row.status}</td>
                            <td>
                              <button className="btn btn-sm btn-info me-1" onClick={() => openEditModal(row)}><IconEdit size={16}/></button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(row.id)}><IconTrash size={16}/></button>
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

      {/* -------------------- Edit Assessment Modal -------------------- */}
      {showEditModal && editingAssessment && (
        <div className="modal show d-block bg-black bg-opacity-50" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Assessment</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <select 
                    className="form-select mb-3" 
                    value={editingAssessment.subject_id || ""}
                    onChange={(e) => handleSubjectChange(e, false)}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{parseTitle(s.title)}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <select
                    className="form-select"
                    value={editingAssessment.grade}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, grade: Number(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingAssessment.title}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label>Document</label>
                  <input type="file" ref={fileInputRef} className="form-control" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingAssessment.status}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, status: e.target.value })}
                  >
                    <option value="Published">Published</option>
                    <option value="Drafted">Drafted</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
                <button className="btn btn-primary border-t-4 animate-spin-none" onClick={handleUpdate} disabled={isEditLoading}>
                {isEditLoading && <div className='animate-spin border-t-2  border-white rounded-full w-2 h-2 mr-2'></div> }
                {isEditLoading ? 'Saving...' : <><IconEdit className="me-2" size={16}/>Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- Add Assessment Modal -------------------- */}
      {showAddModal && (
        <div className="modal show d-block bg-black bg-opacity-50" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Assessment</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <select 
                    className="form-select mb-3" 
                    value={newAssessment.subject_id || ""} 
                    onChange={(e) => handleSubjectChange(e, true)}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{parseTitle(s.title)}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <select
                    className="form-select"
                    value={newAssessment.grade}
                    onChange={(e) => setNewAssessment({ ...newAssessment, grade: Number(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label>Document</label>
                  <input type="file" ref={fileInputRef} className="form-control" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newAssessment.status}
                    onChange={(e) => setNewAssessment({ ...newAssessment, status: e.target.value })}
                  >
                    <option value="Published">Published</option>
                    <option value="Drafted">Drafted</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>Close</button>
                <button className={`btn btn-primary flex items-center`} onClick={handleAdd} disabled={isAddLoading}>
                {isAddLoading && <div className='animate-spin border-t-2  border-white rounded-full w-2 h-2 mr-2'></div> }
                {isAddLoading ? 'Adding...' : <><Plus className="me-2" size={16}/>Add Assessment</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} className="max-w-[90vw] max-h-[90vh]" />
        </div>
      )}
    </div>
  );
}
