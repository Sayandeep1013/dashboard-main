'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef, ChangeEvent } from 'react';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import NumberFlow from '@number-flow/react';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';

import { IconLoader2 } from '@tabler/icons-react';

const inter = Inter({ subsets: ['latin'] });
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

interface Resource { resource_id: number; media_id: number; url: string; }
interface Mission {
  id: number;
  title: string;
  description: string;
  question: string;
  type: number;
  allow_for: string;
  subject_id: number;
  subject: string;
  level_id: number;
  level: string;
  status: number;
  image_url?: string;
  resources?: Resource[];
}

const typeOptions = [
    { label: "Mission", value: 1 },
    { label: "Quiz", value:2},
    { label: "Riddle", value:3},
    { label: "Puzzle", value:4},
    { label: "Jigyasa", value: 5 },
    { label: "Pragya", value: 6 },
];

type EditData = {
    id: number;
    subject: string;
    level: string;
    type: string;
    allow_for: string;
    status: string;
    title: string;
    description: string;
    question: string;
    // for new uploads
    image?: File | null;
    documents?: File[];
    // from server
    image_url?: string;
    resources?: Resource[];
};

export default function StudentRelatedPragya() {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('Pragya');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filteredData, setFilteredData] = useState<Mission[]>([]);

    const [isEditLoading, setIsEditLoading] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);

    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResources, setSelectedResources] = useState<Resource[]|null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        level: '',
        type: '',
        allow_for: '',
        title: '',
        description: '',
        question: '',
        image: null as File | null,
        documents: [] as File[],   // ← renamed
        status: ''
    });

    const itemsPerPage = 10;
    
    
    const fetchMissions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${api_startpoint}/api/missions_resource`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: filterStatus,
                    type: typeOptions.find(opt => opt.label === filterType)?.value,
                    subject: filterSubject,
                    level: filterLevel
                })
            });
            const data = await res.json();
            setMissions(data);
        } catch (err) {
            console.error('Error fetching missions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();

        fetch(`${api_startpoint}/api/subjects_list`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Add this line
            body: JSON.stringify({}) // Optional, but ensures valid POST request
          })
        .then(res => res.json())
        .then(setSubjects);

        fetch(`${api_startpoint}/api/levels`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
              },
            body: JSON.stringify({ page: 1 })
          })
            .then(res => res.json())
            .then(data => {
              console.log('Levels response:', data);
              setLevels(data);  // <- might need to change to setLevels(data.levels) or similar
            });
    }, [filterStatus, filterType, filterSubject, filterLevel]);
  
    

    // 2) Input handler
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
        if (name === 'documents' && files) {
            // keep up to 4 files
            setFormData(prev => ({ 
            ...prev, 
            documents: Array.from(files).slice(0, 4) 
            }));
        } else if (name === 'image' && files) {
            setFormData(prev => ({ ...prev, image: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async () => {
        setIsAddLoading(true);
        try {
          const fd = new FormData();
          // text fields
          ['subject','level','type','allow_for','title','description','question','status']
            .forEach(key => {
              const val = (formData as any)[key];
              if (val !== '') fd.append(key, val);
            });
          // image
          if (formData.image) fd.append('image', formData.image);
          // documents (4)
          formData.documents.forEach(file => fd.append('documents', file));
      
          const res = await fetch(`${api_startpoint}/api/add_mission`, {
            method: 'POST',
            body: fd
          });
          const result = await res.json();
          if (res.ok && result.id) {
            await fetchMissions();
            setOpenModal(false);
          } else {
            alert('Error: ' + (result.error || 'Something went wrong.'));
          }
        } catch (err) {
          console.error(err);
          alert('An unexpected error occurred.');
        } finally {
          setIsAddLoading(false);
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [missionToDelete, setMissionToDelete] = useState<any>(null);


    const handleDelete = async () => {
        const res = await fetch(`${api_startpoint}/api/delete_mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: missionToDelete?.id })
        });
    
        if (res.ok) {
        setMissions(prev => prev.filter(m => m.id !== missionToDelete.id));
        setShowDeleteModal(false);
        } else {
        alert('Failed to delete mission.');
        }
    };
  
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<EditData | null>(null);
      

    const handleEditInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        if (!editData) return;
        const target = e.target as HTMLInputElement;
        const { name, value, files } = target;
      
        if (name === 'documents' && files) {
          setEditData(prev => prev && ({
            ...prev,
            documents: Array.from(files).slice(0, 4)
          }));
        } else if (name === 'image' && files) {
          setEditData(prev => prev && ({
            ...prev,
            image: files[0]
          }));
        } else {
          setEditData(prev => prev && ({
            ...prev,
            [name]: value
          }));
        }
    };
    

    const handleEditSubmit = async () => {
        if (!editData) {
            console.warn("Nothing to save – editData is null");
            return;
        }
        setIsEditLoading(true);
        try {
          const fd = new FormData();
          fd.append('id', editData.id.toString());
          ['subject','level','type','allow_for','status','title','description','question']
            .forEach(key => fd.append(key, (editData as any)[key]));
      
          if (editData.image instanceof File) {
            fd.append('image', editData.image);
          }
          if (editData.documents?.length) {
            editData.documents.forEach(file => fd.append('documents', file));
          }
      
          const res = await fetch(`${api_startpoint}/api/update_mission`, {
            method: 'POST',
            body: fd
          });
          const json = await res.json();
          if (json.success) {
            await fetchMissions();
            setShowEditModal(false);
          } else {
            alert('Update failed: ' + (json.error || 'Unknown error'));
          }
        } catch (err) {
          console.error(err);
          alert('An unexpected error occurred');
        } finally {
          setIsEditLoading(false);
        }
    };
    
    
    // Replace the handleSearch function with useEffect
//     useEffect(() => {
//     const filtered = missions.filter((mission) => {
//       return (
//         (filterStatus === '' || String(mission.status) === filterStatus) &&
//         (filterType === '' || String(mission.type) === filterType) &&
//         (filterSubject === '' || String(mission.subject) === filterSubject) &&
//         (filterLevel === '' || String(mission.level) === filterLevel)
//       );
//     });
//     setFilteredData(filtered);
//   }, [missions, filterStatus, filterType, filterSubject, filterLevel]);  // Add dependencies

    const handleClearFilters = () => {
    setFilterStatus('');
    setFilterType('');
    setFilterSubject('');
    setFilteredData(missions);
    };

    // useEffect(() => {
    // setFilteredData(missions); // initially show all
    // }, [missions]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentMissions = missions.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(missions.length / itemsPerPage);
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData]);

    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className="page-body">
                    <div className="container-xl pt-4 pb-4 space-y-4">
                        <h2 className="text-xl font-semibold">Pragya</h2>
                        <button className="px-4 py-2 bg-sky-900 text-white rounded w-[15%]" onClick={() => setOpenModal(true)}>Add New Pragya</button>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-800"></div>
                            </div>
                        ) : (
                            <>
                            <div className="overflow-x-auto">
                                <div className="mb-4 p-4 bg-gray-100 rounded-xl flex flex-wrap items-center gap-4">
                                    {/* Status Filter */}
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="border rounded px-3 py-2"
                                    >
                                        <option value="">All Status</option>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>

                                    {/* Type Filter */}
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="border rounded px-3 py-2"
                                    >
                                        <option value="">All Types</option>
                                        <option value="Pragya">Pragya</option>
                                        <option value="Jigyasa">Jigyasa</option>
                                        <option value="Mission">Mission</option>
                                        {/* <option value="Quiz">Quiz</option>
                                        <option value="Riddle">Riddle</option>
                                        <option value="Puzzle">Puzzle</option> */}
                                        
                                    </select>

                                    {/* Subject Filter */}
                                    <select
                                        value={filterSubject}
                                        onChange={(e) => setFilterSubject(e.target.value)}
                                        className="border rounded px-3 py-2"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>  {/* Use subject.id as value */}
                                                {JSON.parse(subject.title).en}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        className="border rounded px-3 py-2"
                                        value={filterLevel}
                                        onChange={(e) => setFilterLevel(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {levels.map((level) => (
                                            <option key={level.id} value={level.id}>  {/* Use level.id as value */}
                                                {JSON.parse(level.title).en}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* Action Buttons */}
                                    {/* <button
                                        onClick={() => handleSearch()}
                                        className="bg-sky-950 text-white px-4 py-2 rounded"
                                    >
                                        Search
                                    </button> */}
                                    <button
                                         onClick={() => {
                                            setFilterStatus('');
                                            setFilterType('Pragya');
                                            setFilterSubject('');
                                            setFilterLevel('');
                                          }}
                                        className="border border-gray-800 text-gray-700 px-4 py-2 rounded"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <table className="min-w-full table-auto border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100 text-sm">
                                    <tr>
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Title</th>
                                    <th className="p-2 border">Description</th>
                                    <th className="p-2 border">Question</th>
                                    <th className="p-2 border">Image</th>
                                    <th className="p-2 border">Document</th>
                                    <th className="p-2 border">Type</th>
                                    <th className="p-2 border">Allow For</th>
                                    <th className="p-2 border">Subject</th>
                                    <th className="p-2 border">Level</th>
                                    <th className="p-2 border">Status</th>
                                    <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentMissions.map((m) => (
                                    <tr key={m.id} className="text-sm">
                                        <td className="p-2 border">{m.id}</td>
                                        <td className="p-2 border">{JSON.parse(m.title).en}</td>
                                        <td className="p-2 border">{JSON.parse(m.description).en}</td>
                                        <td className="p-2 border">{JSON.parse(m.question).en}</td>
                                        <td className="p-2 border">
                                            {m.image_url
                                                ? <img src={m.image_url!}
                                                        alt={JSON.parse(m.title).en}
                                                        className="w-16 h-16 object-cover rounded cursor-pointer transition-transform hover:scale-110"
                                                        onClick={() => setLightboxUrl(m.image_url!)}
                                                    />
                                                : '—'}
                                        </td>
                                        <td className="p-2 border">
                                        {m.resources?.length ? (
                                                <button
                                                className="text-blue-600 underline"
                                                onClick={() => setSelectedResources(m.resources!)}
                                                >
                                                View ({m.resources.length})
                                                </button>
                                            ) : '—'}
                                        </td>
                                        <td className="p-2 border">
                                        {typeOptions.find(opt => opt.value === m.type)?.label ?? m.type.toString()}
                                        </td>
                                        <td className="p-2 border">{m.allow_for}</td>
                                        <td className="p-2 border">{JSON.parse(m.subject).en}</td>
                                        <td className="p-2 border">{JSON.parse(m.level).en}</td>
                                        <td className="p-2 border">{m.status == 1? 'Active': 'Inactive'}</td>
                                        <td className="p-2 border flex gap-2 justify-center">
                                            <div className=" ">
                                            <IconEdit className="text-blue-500 cursor-pointer" 
                                                onClick={() => {
                                                    setEditData({
                                                      id: m.id,
                                                      title:       JSON.parse(m.title).en,
                                                      description: JSON.parse(m.description).en,
                                                      question:    JSON.parse(m.question).en,
                                                      subject:     m.subject_id.toString(),
                                                      level:       m.level_id.toString(),
                                                      type:        m.type.toString(),
                                                      allow_for:   m.allow_for === 'All' ? '1' : '2',
                                                      status:      m.status.toString(),
                                              
                                                      // New upload slots left empty:
                                                      image:       null,
                                                      documents:   [],
                                              
                                                      // Existing values from API:
                                                      image_url:   m.image_url,
                                                      resources:   m.resources
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                            />
                                            <IconTrash className="text-red-500 cursor-pointer" 
                                                onClick={() => {
                                                    setMissionToDelete(m);
                                                    setShowDeleteModal(true);
                                                }} 
                                            />
                                            </div>
                                        
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-1 bg-sky-950 text-white rounded disabled:opacity-50"
                                >
                                Previous
                                </button>
                                <span className="text-sm">
                                Page {currentPage} of {totalPages} ({missions.length} Pragya found)
                                </span>
                                <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-1 bg-sky-950 text-white rounded disabled:opacity-50"
                                >
                                Next
                                </button>
                            </div>
                            </>
                        )}


                        {openModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 mt-0 flex justify-center items-center z-50">
                                <div className="bg-white p-6 gap-1 rounded-xl shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
                                    <h2 className="text-xl font-semibold mb-4">Add New Mission</h2>

                                    <label className="block mt-2">Subject</label>
                                    <select name="subject" className="w-full border rounded p-2" value={formData.subject}  onChange={handleInputChange}>
                                    <option value="">Select subject</option>
                                    {subjects.map((s: any) => {
                                        try {
                                        const title = JSON.parse(s.title).en;
                                        return <option key={s.id} value={s.id}>{title}</option>;
                                        } catch (e) {
                                        return <option key={s.id} value={s.id}>Invalid Title</option>;
                                        }
                                    })}
                                    </select>

                                    <label className="block mt-2">Level</label>
                                    <select name="level" className="w-full border rounded p-2" value={formData.level} onChange={handleInputChange}>
                                    <option value="">Select level</option>
                                    {levels.map((l: any) => <option key={l.id} value={l.id}>{JSON.parse(l.title).en}</option>)}
                                    </select>

                                    <label className="block mt-2">Type</label>
                                    <select name="type" className="w-full border rounded p-2" onChange={handleInputChange}>
                                    <option value="">Select type</option>
                                    <option value="1">Mission</option>
                                    {/* <option value="2">Quiz</option>
                                    <option value="3">Riddle</option>
                                    <option value="4">Puzzle</option> */}
                                    <option value="5">Jigyasa</option>
                                    <option value="6">Pragya</option>
                                    </select>

                                    <label className="block mt-2">Allow For</label>
                                    <select name="allow_for" className="w-full border rounded p-2" onChange={handleInputChange}>
                                    <option value="">Select audience</option>
                                    <option value="1">All</option>
                                    <option value="2">Teacher</option>
                                    </select>

                                    <label className="block mt-2">Status</label>
                                    <select name="status" className="w-full border rounded p-2" onChange={handleInputChange}>
                                        <option value="">Select Status</option>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>

                                    <label className="block mt-2">Title</label>
                                    <input type="text" name="title" className="w-full border rounded p-2" onChange={handleInputChange} />

                                    <label className="block mt-2">Description</label>
                                    <textarea name="description" className="w-full border rounded p-2" onChange={handleInputChange} />

                                    <label className="block mt-2">Question</label>
                                    <textarea name="question" className="w-full border rounded p-2" onChange={handleInputChange} />

                                    <label className="block mt-2">Image (Thumbnail)</label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        className="w-full"
                                        onChange={handleInputChange}
                                    />

                                    <label className="block mt-2">Documents (Up to 4 images)</label>
                                    <input
                                        type="file"
                                        name="documents"               // ← changed
                                        accept="image/*"
                                        multiple                       // ← allow multiple
                                        className="w-full"
                                        onChange={handleInputChange}
                                    />
                                    {formData.documents.length > 0 && (
                                        <p className="text-sm text-gray-600">
                                        {formData.documents.length} file
                                        {formData.documents.length > 1 ? 's' : ''} selected
                                        </p>
                                    )}
                                    <div className="mt-2 flex justify-between">
                                    <button className="px-4 py-2 bg-gray-900 text-white rounded" onClick={() => setOpenModal(false)}>Cancel</button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-1 bg-sky-950 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={isAddLoading}  // Disable button while loading
                                        >
                                        {isAddLoading ? (
                                            <div className="h-4 w-4  border-white border-t-2 animate-spin rounded-full"></div>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDeleteModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50  mt-0 flex justify-center items-center z-50">
                                <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
                                <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                                <p>Are you sure you want to delete <strong>{JSON.parse(missionToDelete?.title).en}</strong>?</p>
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-1 rounded border border-gray-400"
                                    >
                                    Cancel
                                    </button>
                                    <button
                                    onClick={handleDelete}
                                    className="px-4 py-1 rounded bg-red-600 text-white"
                                    >
                                    Delete
                                    </button>
                                </div>
                                </div>
                            </div>
                        )}


                        {showEditModal && editData && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 mt-0 flex justify-center items-center z-50">
                            <div className="bg-white rounded-xl shadow p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-4">Edit Mission</h2>
                            <div className="flex flex-col gap-1">
                                <label className="block mt-1">Title</label>
                                <input
                                name = "title"
                                value={editData?.title}
                                onChange={handleEditInputChange}
                                placeholder="Title"
                                className="border px-3 py-1 rounded"
                                />
                                <label className="block mt-1">Description</label>
                                <textarea
                                name = "description"
                                value={editData?.description}
                                onChange={handleEditInputChange}
                                placeholder="Description"
                                className="border px-3 py-1 rounded"
                                />

                                <label className="block mt-1">Question</label>
                                <textarea
                                name = "question"
                                value={editData?.question}
                                onChange={handleEditInputChange}
                                placeholder="Question"
                                className="border px-3 py-1 rounded"
                                />

                                {/* Subject */}
                                <label className="block mt-1">Subject</label>
                                <select
                                    name="subject"
                                    value={editData?.subject}
                                    onChange={handleEditInputChange}
                                    className="border px-3 py-1 rounded"
                                    >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id.toString()}>
                                        {JSON.parse(s.title).en}
                                        </option>
                                    ))}
                                </select>

                                {/* Level */}
                                <label className="block mt-1">Level</label>
                                <select
                                    name="level"
                                    value={editData?.level}
                                    onChange={handleEditInputChange}
                                    className="border px-3 py-1 rounded"
                                    >
                                    <option value="">Select Level</option>
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id.toString()}>
                                        {JSON.parse(l.title).en}
                                        </option>
                                    ))}
                                </select>

                                {/* Type */}
                                <label className="block mt-1">Type</label>
                                <select
                                    name="type"     
                                    value={editData?.type || ""}
                                    onChange={handleEditInputChange}
                                    className="border px-3 py-1 rounded"
                                >
                                    <option value="">Select Type</option>
                                    {typeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value.toString()}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Allow For */}
                                <label className="block mt-1">Allow For</label>
                                <select
                                name="allow_for" 
                                value={editData?.allow_for || ""}
                                onChange={handleEditInputChange}
                                className="border px-3 py-1 rounded"
                                >
                                <option value="1">All</option>
                                <option value="2">Teacher</option>
                                </select>

                                {/* Status */}
                                <label className="block mt-1">Status</label>
                                <select
                                name = "status"
                                value={editData?.status || ""}
                                onChange={handleEditInputChange}
                                className="border px-3 py-1 rounded"
                                >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                                </select>
                                
                                {/* Image */}
                                <label className="block mt-4">Current Thumbnail</label>
                                {editData.image_url && !editData.image && (
                                    <img
                                    src={editData.image_url}
                                    alt="Thumbnail"
                                    className="h-24 w-24 object-cover rounded mb-2"
                                    />
                                )}
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleEditInputChange}
                                    className="block mb-4"
                                />

                                {/* Existing documents */}
                                <label className="block">Current Documents</label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    {editData.resources?.map((r, i) => (
                                    <img
                                        key={i}
                                        src={r.url}
                                        alt={`Doc ${i+1}`}
                                        className="h-24 object-cover rounded"
                                    />
                                    ))}
                                </div>
                                {/* Document */}
                                {/* Upload new docs (replaces existing if provided) */}
                                <label className="block mt-2">Replace Documents (up to 4)</label>
                                <input
                                    type="file"
                                    name="documents"
                                    accept="image/*"
                                    multiple
                                    onChange={handleEditInputChange}
                                    className="block mb-1"
                                />
                                {editData.documents?.length ? (
                                <p className="text-sm text-gray-600">
                                    {editData.documents.length} file
                                    {editData.documents.length > 1 ? 's' : ''} selected
                                </p>
                                ) : null}


                                <div className="flex justify-end gap-4 mt-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-1 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSubmit}
                                    className="px-4 py-1 bg-sky-950 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={isEditLoading}  // Disable button while loading
                                    >
                                    {isEditLoading ? (
                                        <div className="h-4 w-4  border-white border-t-2 animate-spin rounded-full"></div>
                                    ) : (
                                        "Save"
                                    )}
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

                        {/* Resources Modal */}
                        {selectedResources && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 mt-0 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-4 max-h-[90vh] overflow-y-auto w-3/5">
                                <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Documents</h2>
                                <button onClick={() => setSelectedResources(null)}>Close</button>
                                </div>
                                <div className="space-y-4">
                                {selectedResources.map((r, i) => (
                                    <img
                                    key={i}
                                    src={r.url}
                                    alt={`Resource ${i + 1}`}
                                    className="w-full object-contain rounded"
                                    />
                                ))}
                                </div>
                            </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}