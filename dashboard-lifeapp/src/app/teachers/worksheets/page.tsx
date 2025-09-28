'use client'
import '@tabler/core/dist/css/tabler.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from 'react';
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

interface Subject { id: number; title: string; }
interface Worksheet {
  id: number;
  subject_title: string;
  grade: number;
  title: string;
  document_url?: string;
  status: string;
}

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

export default function TeacherWorkSheets() {
  // Filters
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filterSub, setFilterSub] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTitle, setFilterTitle] = useState('');

  // Data
  const [data, setData] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Modal & form
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currRow, setCurrRow] = useState<Worksheet | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Load subjects for dropdowns
  useEffect(() => {
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: '1' })
    })
      .then(r => r.json())
      .then(js => setSubjects(js));
  }, []);

  // Fetch worksheets
  const fetchData = async () => {
    setLoading(true);
    const filters = { subject: filterSub, grade: filterGrade, status: filterStatus, title: filterTitle };
    const res = await fetch(`${api_startpoint}/api/work_sheets_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    const js = await res.json();
    setData(js);
    setCurrentPage(1);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Clear filters
  const handleClear = () => {
    setFilterSub('');
    setFilterGrade('');
    setFilterStatus('');
    setFilterTitle('');
    fetchData();
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this worksheet?')) return;
    await fetch(`${api_startpoint}/api/delete_work_sheet/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Add worksheet
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const formEl = e.target as HTMLFormElement;
      const formData = new FormData(formEl);
      
      // Validate required fields
      const subjectId = formData.get('subject');
      const grade = formData.get('grade');
      const title = formData.get('title');
      
      if (!subjectId || !grade || !title) {
        alert('Please fill all required fields');
        setAddLoading(false);
        return;
      }
      
      // Add file if exists
      if (file) {
        formData.append('media', file);
      }
      
      const response = await fetch(`${api_startpoint}/api/add_work_sheet`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when sending FormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add worksheet');
      }
      
      setAddLoading(false);
      setAddOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error adding worksheet:', error);
      alert('Failed to add worksheet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setAddLoading(false);
    }
  }

  // Update worksheet
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currRow) return;
    setEditLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      formData.append('id', String(currRow.id));
      
      // Validate required fields
      const subjectId = formData.get('subject');
      const grade = formData.get('grade');
      const title = formData.get('title');
      
      if (!subjectId || !grade || !title) {
        alert('Please fill all required fields');
        setEditLoading(false);
        return;
      }
      
      if (file) {
        formData.append('media', file);
      }
      
      const response = await fetch(`${api_startpoint}/api/update_work_sheet`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update worksheet');
      }
      
      setEditLoading(false);
      setEditOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating worksheet:', error);
      alert('Failed to update worksheet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setEditLoading(false);
    }
  };

  // Slice for pagination
  const paginated = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />

      {/* Main Content */}
      <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className="page-body">
          <div className='container-xl pt-0 pb-4'>
            {/* Search & Filter Section */}
            <div className='card shadow-sm border-0 mb-4'>
              <div className="card-body">
                <h5 className="card-title mb-4">Work Sheets</h5>
                <div className="row g-3">
                  <div className='col-12 col-md-6 col-lg-3'>
                  <select className="form-select" value={filterSub} onChange={e => setFilterSub(e.target.value)}>
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{JSON.parse(s.title).en}</option>
                    ))}
                  </select>
                  </div>
                  <div className='col-12 col-md-6 col-lg-3'>
                    <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="">All Status</option>
                      <option>Published</option>
                      <option>Drafted</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <select className="form-select" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
                      <option value="">All Grades</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <input className="form-control" placeholder="Search by Title" value={filterTitle} onChange={e => setFilterTitle(e.target.value)} />
                  </div>
                  {/* Action Buttons */}
                  <div className="d-flex flex-row gap-2 mt-4">
                    <button className="btn btn-success" onClick={fetchData}>
                      <Search className="inline-block mr-1" /> Search
                    </button>
                    <button className="btn btn-warning" onClick={handleClear}>
                      <XCircle className="inline-block mr-1" /> Clear
                    </button>
                    <button className="btn btn-primary" onClick={() => { setAddOpen(true); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
                      <Plus className="inline-block mr-1" /> Add Worksheet
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className='card shadow-sm border-0 mt-2'>
              <div className="card-body overflow-x-scroll">
                <h5 className="card-title mb-4">Results- {data.length} worksheets found</h5>
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-purple" role="status" style={{ width: "3rem", height: "3rem" }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading data, please wait...</p>
                  </div>
                ) : data.length === 0 ? (
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
                      {paginated.map(r => (
                        <tr key={r.id}>
                          <td>{JSON.parse(r.subject_title).en}</td>
                          <td>{r.grade}</td>
                          <td>{r.title}</td>
                          <td>
                            {r.document_url?.match(/\.(jpe?g|png|gif)$/i) ? (
                              <img
                              src={r.document_url}
                              className="w-12 h-12 cursor-pointer"
                              onClick={() => setLightboxUrl(r.document_url!)}
                            />
                          ) : r.document_url ? (
                              <button className="btn btn-link" onClick={() => window.open(r.document_url)}>
                                📄 PDF
                              </button>
                            ) : '—'}
                          </td>
                          <td>{r.status}</td>
                          <td className="flex gap-1">
                            <button className="btn btn-info btn-sm" onClick={() => { setCurrRow(r); setEditOpen(true); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>
                              <IconEdit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                              <IconTrash size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                      <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        Previous
                      </button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
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

      {/* -------------------- Edit Worksheet Modal -------------------- */}
      {editOpen && currRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium flex items-center">
                {editLoading && <div className="animate-spin border-t-4 border-blue-500 rounded-full w-4 h-4 mr-2"/>}
                Edit Worksheet
              </h3>
            </div>
            <form onSubmit={handleUpdate} className="p-4">
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <select name="subject" defaultValue={currRow.subject_title} className="form-select" required>
                  {subjects.map(s => <option key={s.id} value={s.id}>{JSON.parse(s.title).en}</option>)}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Grade</label>
                <select name="grade" defaultValue={currRow.grade} className="form-select" required>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input name="title" defaultValue={currRow.title} className="form-control" required />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Document</label>
                <input type="file" name="media" ref={fileRef} onChange={e => setFile(e.target.files?.[0] || null)} className="form-control" />
                {currRow.document_url && (
                  <div className="mt-2 text-sm text-gray-600">
                    Current: {currRow.document_url.split('/').pop()}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="form-label">Status</label>
                <select name="status" defaultValue={currRow.status} className="form-select">            
                  <option>Published</option>
                  <option>Drafted</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- Add Worksheet Modal -------------------- */}
      {addOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-3">
              <h3 className="text-lg font-medium flex items-center">
                {addLoading && <div className="animate-spin border-t-4 border-blue-500 rounded-full w-4 h-4 mr-2"/>}
                Add Worksheet
              </h3>
            </div>
            <form onSubmit={handleAdd} className="p-4">
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <select name="subject" className="form-select" required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{JSON.parse(s.title).en}</option>)}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Grade</label>
                <select name="grade" className="form-select" required>
                  <option value="">Select Grade</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input name="title" placeholder="Worksheet title" className="form-control" required />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Document</label>
                <input type="file" name="media" ref={fileRef} onChange={e => setFile(e.target.files?.[0] || null)} className="form-control" />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" defaultValue="Published">
                  <option>Published</option>
                  <option>Drafted</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add Worksheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative">
            <img
              src={lightboxUrl}
              alt="Enlarged"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              className="absolute top-2 right-2 text-white bg-gray-900 rounded-full p-1"
              onClick={e => { e.stopPropagation(); setLightboxUrl(null); }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
