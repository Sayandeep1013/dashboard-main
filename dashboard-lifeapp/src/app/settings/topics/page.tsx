'use client'
import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import '@tabler/core/dist/css/tabler.min.css';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { Sidebar } from '@/components/ui/sidebar';

const inter = Inter({ subsets: ['latin'] });
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

// Define types for our data
type Subject = {
  id: number;
  title: string; // JSON string, e.g. '{"en": "CBSE"}'
};

type Level = {
  id: number;
  title: string; // JSON string, e.g. '{"en": "Level 1"}'
};

type Topic = {
  id: number;
  title: string; // JSON string
  la_subject_id: string;
  la_level_id: string;
  status: string; // "1" for active, "0" for inactive
  allow_for: string;
  type: string;
  image:string;
  media_id?:number;
  media_path?: string;
  media_url?: string;
};

export default function SettingsTopics() {
  // Data arrays
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  
  // Search filters for topics page
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // "1", "0", or "all"
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [filters, setFilters] = useState({ la_subject_id: '', la_level_id: '', status: '' });
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddLoading, setIsAddLoading] =useState(false)
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  // lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string|null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  // Modal states for topics management
  const [showTopicAddModal, setShowTopicAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [newTopic, setNewTopic] = useState({
    title: '',
    la_subject_id: '',
    la_level_id: '',
    status: '1',
    allow_for: '1',
    type: '2',
    _mediaFile: null as File | null
  });
  // 1) New piece of state for the *form*, not the raw Topic JSON.
  const [editForm, setEditForm] = useState({
    title:        "",  // plain text
    la_subject_id:"",
    la_level_id:  "",
    status:       "1",
    allow_for:    "1",
    type:         "2",
    _mediaFile: null as File | null
  });

  // Fetch subjects and levels on mount
  useEffect(() => {
    // Fetch all subjects (no filter on status for subjects if needed)
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'all' }) // Send all if needed
    })
      .then((res) => res.json())
      .then(data => setSubjects(data))
      .catch((err) => console.error("Failed to fetch subjects:", err));
      
    // Fetch levels (assuming no filter required)
    fetch(`${api_startpoint}/api/levels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1 })
    })
      .then((res) => res.json())
      .then(data => setLevels(data))
      .catch((err) => console.error("Failed to fetch levels:", err));
  }, []);

  // Whenever the filter selections change, update filters state and fetch topics
  useEffect(() => {
    // Set filters using selected values.
    // For status, if "all" is selected, we send an empty filter.
    setFilters({
      la_subject_id: selectedSubject,
      la_level_id: selectedLevel,
      status: selectedStatus === "all" ? "" : selectedStatus,
    });
    setCurrentPage(1);
  }, [selectedStatus, selectedSubject, selectedLevel]);
  
  // Fetch topics each time filters update
  useEffect(() => {
    // Only fetch if subject and level are selected; status is optional.
    if (filters.la_subject_id && filters.la_level_id) {
      setIsLoading(true);
      fetch(`${api_startpoint}/api/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      })
        .then((res) => res.json())
        .then(data => {
          setTopics(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Failed to fetch topics:", err))
        .finally(() => setIsLoading(false));
    } else {
      setTopics([]);
    }
  }, [filters]);

  // Pagination calculations
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginatedTopics = topics.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(topics.length / itemsPerPage);

  // Handlers for modals
  const handleAddTopic = async () => {
    try {
      setIsAddLoading(true)
      const form = new FormData();
      form.append('title', newTopic.title);
      form.append('la_subject_id', newTopic.la_subject_id);
      form.append('la_level_id', newTopic.la_level_id);
      form.append('status', newTopic.status);
      form.append('allow_for', newTopic.allow_for);
      form.append('type', newTopic.type);
      if (newTopic._mediaFile) form.append('media', newTopic._mediaFile);
      const res = await fetch(`${api_startpoint}/api/add_topic`, {
        method:'POST',
        body: form
      });
      const data = await res.json();
      if (data.success) {
        setShowTopicAddModal(false);
        setNewTopic({ title: '', la_subject_id: '', la_level_id: '', status: '1', allow_for: '1', type: '2', _mediaFile: null  });
        // Re-fetch topics with current filters
        fetch(`${api_startpoint}/api/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        })
          .then(res => res.json())
          .then(data => setTopics(Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error("Error adding topic:", error);
    } finally{
      setIsAddLoading(false)
    }
  };

  const openEditModal = (topic: Topic) => {
    setTopicToEdit(topic);
    try {
      const parsed = JSON.parse(topic.title);
      setEditForm({
        title:        parsed.en || "",
        la_subject_id: String(topic.la_subject_id),
        la_level_id:   String(topic.la_level_id),
        status:        topic.status,
        allow_for:     topic.allow_for,
        type:          topic.type,
        _mediaFile:    null  //  default: no new file selected yet
      });
    } catch {
      // fallback if parse fails
      setEditForm(f => ({ ...f, title: topic.title }));
    }
    setShowEditModal(true);
  };

  const handleUpdateTopic = async () => {
    if (!topicToEdit) return;
    setIsEditLoading(true)
    const form = new FormData();
    form.append('title', JSON.stringify({ en: editForm.title }));
    form.append('la_subject_id', editForm.la_subject_id);
    form.append('la_level_id', editForm.la_level_id);
    form.append('status', editForm.status);
    form.append('allow_for', editForm.allow_for);
    form.append('type', editForm.type);
    if (editForm._mediaFile) form.append('media', editForm._mediaFile);
    
    try {
      const res = await fetch(`${api_startpoint}/api/update_topic/${topicToEdit.id}`, {
        method:'POST',  // our Flask is POST
        body: form
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setTopicToEdit(null);
        // Refresh topics
        fetch(`${api_startpoint}/api/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        })
          .then(res => res.json())
          .then(data => setTopics(Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error("Error updating topic:", error);
    } finally {
      setIsEditLoading(false)
    }
  };

  const openDeleteModal = (topic: Topic) => {
    setTopicToDelete(topic);
    setShowDeleteModal(true);
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;
    setIsDeleteLoading(true)
    try {
      const res = await fetch(`${api_startpoint}/api/delete_topic/${topicToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setShowDeleteModal(false);
        setTopicToDelete(null);
        // Refresh topics
        fetch(`${api_startpoint}/api/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        })
          .then(res => res.json())
          .then(data => setTopics(Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
    } finally {
      setIsDeleteLoading(false)
    }
  };

  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-4">
            {/* Header and Search Filters */}
            <div className="d-flex flex-column gap-3 mb-4">
                <h2 className="mb-0">Manage Topics</h2>
                <div className='mt-0'>
                    <div className="mb-2">
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setShowTopicAddModal(true)}
                        >
                            Add Topic/Set
                        </button>
                    </div>
                    <span className="text-muted">Filter Topics:</span>
                </div>
                <div className=" d-flex flex-row gap-3">
                    {/* Status Filter */}
                    <div className="d-flex gap-2">
                        {["Active", "Inactive", "All"].map((statusOption) => {
                        const value = statusOption === "All" ? "all" : statusOption === "Active" ? "1" : "0";
                        return (
                            <button
                            key={value}
                            className={`p-2 border rounded ${selectedStatus === value ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                            onClick={() => setSelectedStatus(value)}
                            >
                            {statusOption}
                            </button>
                        );
                        })}
                    </div>
                    {/* Subject Filter */}
                    {selectedStatus && (
                        <div className="d-flex gap-2">
                        <select
                            className="form-select"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((sub: Subject) => (
                            <option key={sub.id} value={sub.id}>
                                {JSON.parse(sub.title).en}
                            </option>
                            ))}
                        </select>
                        </div>
                    )}
                    {/* Level Filter */}
                    {selectedSubject && (
                        <div className="d-flex gap-2">
                        <select
                            className="form-select"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            <option value="">Select Level</option>
                            {levels.map((lv: Level) => (
                            <option key={lv.id} value={lv.id}>
                                {JSON.parse(lv.title).en}
                            </option>
                            ))}
                        </select>
                        </div>
                    )}

                </div>
              
              {/* Topics Filter */}
              {/* {selectedLevel && (
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="">Select Topic</option>
                    {topics.map((topic: Topic) => (
                      <option key={topic.id} value={topic.id}>
                        {JSON.parse(topic.title).en}
                      </option>
                    ))}
                  </select>
                </div>
              )} */}
            </div>

            {/* Topics Table */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-3">Topics (Total: {topics.length})</h5>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-black text-blue"></div>
                    </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Image</th>
                          <th>Topic Title</th>
                          <th>Subject</th>
                          <th>Level</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTopics.map((topic: Topic) => {
                          const subject = subjects.find((s: Subject) => String(s.id) === String(topic.la_subject_id));
                          const level = levels.find((l: Level) => String(l.id) === String(topic.la_level_id));
                          return (
                            <tr key={topic.id}>
                              <td>{topic.id}</td>
                              <td>
                                {topic.media_url?.match(/\.(jpe?g|png|gif)$/i)
                                    ? <img
                                        src={topic.media_url}
                                        className="w-12 h-12 object-cover cursor-pointer"
                                        onClick={()=>setLightboxUrl(topic.media_url!)}
                                        />
                                    : topic.media_url
                                        ? <button
                                            className="btn btn-link"
                                            onClick={()=>window.open(topic.media_url,'_blank')}
                                            >📄 File</button>
                                        : '—'}
                              </td>
                              <td>{JSON.parse(topic.title).en}</td>
                              <td>{subject ? JSON.parse(subject.title).en : 'N/A'}</td>
                              <td>{level ? JSON.parse(level.title).en : 'N/A'}</td>
                              <td>{String(topic.status) === '1' ? 'Active' : 'Inactive'}</td>
                              <td>
                                <button className="btn btn-secondary btn-sm me-2" onClick={() => openEditModal(topic)}>
                                  <IconEdit /> Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(topic)}>
                                  <IconTrash /> Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Topic/Set Modal */}
        {showTopicAddModal && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Add New Set/Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowTopicAddModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">
                      <label className="form-label">Topic Title</label>
                      <input 
                      type="text" 
                      className="form-control" 
                      value={newTopic.title} 
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      />
                  </div>
                  <div className="mb-2">
                      <label className="form-label">Subject</label>
                      <select 
                      className="form-select" 
                      value={newTopic.la_subject_id || ""}
                      onChange={(e) => setNewTopic({ ...newTopic, la_subject_id: e.target.value })}
                      >
                      <option value=''>Select Subject</option>
                      {subjects.map((sub: Subject) => (
                          <option key={sub.id} value={sub.id}>
                          {JSON.parse(sub.title).en}
                          </option>
                      ))}
                      </select>
                  </div>
                  <div className="mb-2">
                      <label className="form-label">Level</label>
                      <select 
                      className="form-select" 
                      value={newTopic.la_level_id || ""}
                      onChange={(e) => setNewTopic({ ...newTopic, la_level_id: e.target.value })}
                      >
                      <option value=''>Select Level</option>
                      {levels.map((lv: Level) => (
                          <option key={lv.id} value={lv.id}>
                          {JSON.parse(lv.title).en}
                          </option>
                      ))}
                      </select>
                  </div>
                  <div className="mb-2">
                      <label className="form-label">Status</label>
                      <select 
                      className="form-select" 
                      value={newTopic.status}
                      onChange={(e) => setNewTopic({ ...newTopic, status: e.target.value })}
                      >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                      </select>
                  </div>
                  {/* New Type Dropdown */}
                  <div className="mb-2">
                      <label className="form-label">Type</label>
                      <select 
                      className="form-select" 
                      value={newTopic.type}
                      onChange={(e) => setNewTopic({ ...newTopic, type: e.target.value })}
                      >
                      <option value="2">Quiz</option>
                      <option value="3">Riddle</option>
                      <option value="4">Puzzle</option>
                      </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={e => setNewTopic(prev => ({
                        ...prev,
                        _mediaFile: e.target.files?.[0] ?? null
                      }))}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                <button className="btn btn-primary" 
                  onClick={handleAddTopic}
                  disabled={isAddLoading}>
                    {isAddLoading && <div className='animate-spin rounded-full w-4 h-4 mr-2 border-white border-t-4'></div>}
                    {isAddLoading? 'Submitting..':'Submit'}
                </button>
                </div>
            </div>
            </div>
        </div>
        )}


      {/* Edit Topic Modal */}
      {showEditModal && topicToEdit && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Topic Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={editForm.la_subject_id}
                    onChange={e => setEditForm(f => ({ ...f, la_subject_id: e.target.value }))}
                  >
                    <option value=''>Select Subject</option>
                    {subjects.map((sub: Subject) => (
                      <option key={sub.id} value={sub.id}>
                        {JSON.parse(sub.title).en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Level</label>
                  <select
                    className="form-select"
                    value={editForm.la_level_id}
                    onChange={e => setEditForm(f => ({ ...f, la_level_id: e.target.value }))}
                  >
                    <option value=''>Select Level</option>
                    {levels.map((lv: Level) => (
                      <option key={lv.id} value={lv.id}>
                        {JSON.parse(lv.title).en}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={e => setEditForm(prev => ({
                      ...prev,
                      _mediaFile: e.target.files?.[0] ?? null
                    }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateTopic}
                  disabled={isEditLoading}
                >
                  {isEditLoading && <div className='animate-spin rounded-full w-4 h-4 mr-2 border-white border-t-4'></div>}
                  {isEditLoading? 'Saving..':'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Topic Modal */}
      {showDeleteModal && topicToDelete && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the topic: {JSON.parse(topicToDelete.title).en}?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" 
                onClick={handleDeleteTopic}
                disabled = {isDeleteLoading}
                >
                  {isDeleteLoading && <div className='animate-spin rounded-full w-4 h-4 border-white border-t-4 mr-2'></div>}
                  {isDeleteLoading? 'Deleting..':'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={()=>setLightboxUrl(null)}
        >
          <div className="relative">
              <img
              src={lightboxUrl}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
              />
              <button
              className="absolute top-2 right-2 text-white bg-gray-900 rounded-full p-1"
              onClick={e=>{ e.stopPropagation(); setLightboxUrl(null) }}
              >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
