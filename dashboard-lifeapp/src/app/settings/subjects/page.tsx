'use client'
import { useState, useEffect } from 'react'
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import '@tabler/core/dist/css/tabler.min.css';

interface Slide {
    id: number;
    title: string;
    heading: string;
    status: number;
    media_url?: string;
}

interface RawSubject {
    id: number;
    title: string; // JSON string
    heading: string; // JSON string
    media_url?: string;
    status: string;
}

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";


export default function SettingsSubject() {
    const [totalSubjects, setTotalSubjects] = useState<Slide[]>([])
    const [loading, setLoading] = useState(true);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [isEditLoading, setIsEditLoading] = useState(false);
    async function fetchSubjectList() {
        try {
            setLoading(true);
            const res = await fetch(`${api_startpoint}/api/subjects_list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'all' }) // Explicitly send status
            });
            const data: RawSubject[] = await res.json();
    
            if (data && data.length > 0) {
                const processedSubjects: Slide[] = data.map(subject => {
                    // The backend is already parsing JSON, so these might be strings
                    // but ensure we handle both cases correctly
                    let title = subject.title;
                    let heading = subject.heading;
                    
                    try {
                        // If it's still a JSON string, parse it
                        if (typeof subject.title === 'string' && subject.title.startsWith('{')) {
                            const titleObj = JSON.parse(subject.title);
                            title = titleObj.en;
                        }
                        
                        if (typeof subject.heading === 'string' && subject.heading.startsWith('{')) {
                            const headingObj = JSON.parse(subject.heading);
                            heading = headingObj.en;
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                    
                    return {
                        id: subject.id,
                        title: title,
                        heading: heading,
                        media_url: subject.media_url,
                        status: parseInt(subject.status),
                    };
                });
    
                setTotalSubjects(processedSubjects);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching subject list:', error);
            setLoading(false);
        }
    }
    
    // Call fetchSubjectList inside useEffect on component mount
    useEffect(() => {
        fetchSubjectList();
    }, []);
    

    // ```````````````````````````````Carousel controls``````````````````````````````````````````````````````
    const options: EmblaOptionsType = {
        align: "start",
        loop: true,
    };
    
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [
        Autoplay({ delay: 6000, stopOnInteraction: false }),
    ]);
    
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    useEffect(() => {
        if (!emblaApi) return;
    
        emblaApi.on("select", () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);
    //`````````````````````````````````````````````````````````````````````````````````````````````````````````````````


    const [showModal, setShowModal] = useState(false)
    const initialFormValues = {
        id: 0,
        title: "",
        heading: "",
        created_by: "",
        status: "1",           // default to “Active”
    };
    const [formValues, setFormValues] = useState(initialFormValues);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<Slide | null>(null)

    const [errorMessage, setErrorMessage] = useState('')

    // lightbox
    const [lightboxUrl, setLightboxUrl] = useState<string|null>(null)

    const handleClear = () => {
        setFormValues(initialFormValues);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedSubject(null);
        //setSelectedIndex(0);
        handleClear(); // Reset values when closing modal
    };
    // Handle form field changes in the modal
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          setImageFile(e.target.files[0]);
        }
    };

    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsAddLoading(true);
        const formData = new FormData();
        // Create proper JSON objects for title and heading
        formData.append('title', JSON.stringify({ en: formValues.title }));
        formData.append('heading', JSON.stringify({ en: formValues.heading }));
        formData.append('created_by', formValues.created_by);
        formData.append('status',     formValues.status);
        if (imageFile) {
          formData.append('image', imageFile);
        }
      
        try {
          const res = await fetch(`${api_startpoint}/api/subjects_new`, {
            method: 'POST',
            body: formData, // FormData handles content-type
          });
      
          if (res.ok) {
            setShowModal(false);
            setFormValues({ id: 0, title: '', heading: '', created_by: '', status:'0' });
            setImageFile(null);
            await fetchSubjectList();
          } else {
            const errorData = await res.json();
            setErrorMessage(errorData.error || 'Error creating subject');
          }
        } catch (err) {
          setErrorMessage('Error connecting to API');
        } finally {
            setIsAddLoading(false);
        }
    };
      



    // -----------------------
    // Edit Subject Handlers
    // -----------------------
    const handleEditClick = (subject: Slide) => {
        setSelectedSubject(subject);
        // Pre-populate the form with the selected subject’s data
        setFormValues({
            id: subject.id,
            title: subject.title,
            heading: subject.heading,
            created_by: '', // You may wish to pre-select role based on additional subject data
            status: String(subject.status),
        });
        setImageFile(null);
        setShowEditModal(true);
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSubject) return;
        setIsEditLoading(true)
        const formData = new FormData();
        formData.append("id", String(formValues.id));
        // Create proper JSON objects for title and heading
        formData.append('title', JSON.stringify({ en: formValues.title }));
        formData.append('heading', JSON.stringify({ en: formValues.heading }));
        formData.append('created_by', formValues.created_by);
        formData.append('status',     formValues.status);
        if (imageFile) {
          formData.append('image', imageFile);
        }
      
        try {
          const res = await fetch(`${api_startpoint}/api/subjects/${selectedSubject.id}`, {
            method: 'PUT',
            body: formData,
          });
      
          if (res.ok) {
            setShowEditModal(false);
            setSelectedSubject(null);
            setFormValues({ id: 0, title: '', heading: '', created_by: '', status:'0' });
            setImageFile(null);
            await fetchSubjectList();
          } else {
            const errorData = await res.json();
            setErrorMessage(errorData.error || 'Error updating subject');
          }
        } catch (err) {
          setErrorMessage('Error connecting to API');
        } finally {
            setIsEditLoading(false);
        }
    };

    
    // -----------------------
    // Delete Subject Handlers
    // -----------------------
    const handleDeleteClick = (subject: Slide) => {
        setSelectedSubject(subject);
        setShowDeleteModal(true);
    }

    const handleDeleteSubmit = async () => {
        if (!selectedSubject) return;
      
        try {
          // Assuming you have a DELETE endpoint, e.g., /api/subjects/<id>
          const res = await fetch(`${api_startpoint}/api/subjects/${selectedSubject.id}`, {
            method: 'DELETE',
          });
      
          if (res.ok) {
            setShowDeleteModal(false);
            setSelectedSubject(null);
            await fetchSubjectList();
          } else {
            const errorData = await res.json();
            setErrorMessage(errorData.error || 'Error deleting subject');
          }
        } catch (err) {
          setErrorMessage('Error connecting to API');
        }
    };


    // Delete Modal
    const DeleteSubjectModal = () => (
        <div className="fixed top-0 right-0 h-full w-1/3 bg-white shadow-lg z-50 transform transition-transform duration-300"
            style={{ transform: showDeleteModal ? 'translateX(0)' : 'translateX(100%)' }}>
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Delete Subject</h2>
                <button onClick={closeModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div className="p-4">
                <p>Are you sure you want to delete the subject <strong>{selectedSubject?.title}</strong>?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setSelectedSubject(null); }}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDeleteSubmit}>Delete</button>
                </div>
            </div>
        </div>
    );


    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />

            {/* Main Content */}
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className='page-body'>
                    <div className='container-xl pt-4 pb-4'>
                        {/* Tabler Card with Carousel */}
                        <div className="card">
                            <div className="card-header py-3 d-flex justify-between items-center">
                                <h3 className="card-title m-0 text-lg font-semibold">Subjects</h3>
                                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus mr-1" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M12 5l0 14" />
                                    <path d="M5 12l14 0" />
                                </svg>
                                Add Subject
                                </button>
                            </div>

                            <div className="card-body overflow-x-auto">
                                {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-800 mx-auto"></div>
                                </div>
                                ) : (
                                <table className="table table-hover w-full">
                                    <thead className="bg-gray-100 text-sm">
                                    <tr>
                                        <th>ID</th>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Heading</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {totalSubjects.map(subject => (
                                        <tr key={subject.id} className="text-sm">
                                        <td>{subject.id}</td>
                                        <td>
                                            {subject.media_url?.match(/\.(jpe?g|png|gif)$/i)
                                                ? <img
                                                    src={subject.media_url}
                                                    className="w-12 h-12 object-cover cursor-pointer"
                                                    onClick={()=>setLightboxUrl(subject.media_url!)}
                                                    />
                                                : subject.media_url
                                                    ? <button
                                                        className="btn btn-link"
                                                        onClick={()=>window.open(subject.media_url,'_blank')}
                                                        >📄 File</button>
                                                    : '—'}
                                        </td>
                                        <td>{subject.title}</td>
                                        <td>{subject.heading}</td>
                                        <td>
                                            <span className={`badge ${subject.status === 1 ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                                            {subject.status === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-2">
                                            <button
                                                className="text-gray-600 hover:text-blue-600"
                                                onClick={() => handleEditClick(subject)}
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-edit" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M16 3l4 4l-11 11h-4v-4z"></path>
                                                <path d="M12 19h4"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className="text-gray-600 hover:text-red-600"
                                                onClick={() => handleDeleteClick(subject)}
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M4 7l16 0"></path>
                                                <path d="M10 11l0 6"></path>
                                                <path d="M14 11l0 6"></path>
                                                <path d="M5 7l1 12a2 2 0 0 0 2 2l8 0a2 2 0 0 0 2 -2l1 -12"></path>
                                                <path d="M9 7l0 -3l6 0l0 3"></path>
                                                </svg>
                                            </button>
                                            </div>
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                )}
                            </div>
                        </div>


                        {/* Add New Subject Button */}
                        {/* <div className="text-center h-50 w-25 mt-3">
                            <button className="btn btn-primary" onClick={() => setShowModal(true)} >
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M12 5l0 14"></path>
                                    <path d="M5 12l14 0"></path>
                                </svg>
                                Add New Subject
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
            {/* Modal Overlay */}
            {showModal && 
                <div className="fixed top-0 right-0 h-full w-2/5 bg-white shadow-lg z-50 transform transition-transform duration-300"
                    style={{ transform: showModal ? 'translateX(0)' : 'translateX(100%)' }}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Add New Subject</h2>
                        <button onClick={closeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="p-4">
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder='Enter a title'
                                    value={formValues.title}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">Heading</label>
                                <input
                                    type="text"
                                    name="heading"
                                    placeholder='Enter a Heading'
                                    value={formValues.heading}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">Created By</label>
                                <select
                                    name="created_by"
                                    value={formValues.created_by}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                >
                                    <option value="">Select role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Mentor">Mentor</option>
                                    <option value="Teacher">Teacher</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formValues.status}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1">Image ID</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border p-2"
                                    required
                                />
        
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="btn btn-primary" disabled={isAddLoading}>
                                    {isAddLoading && <div className='animate-spin border-t-4 border-sky-500 rounded-full w-4 h-4 mr-2'></div>}
                                    {isAddLoading? 'Creating':'Create Subject'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            }
            {showEditModal && 
                <div className="fixed top-0 right-0 h-full w-2/5 bg-white shadow-lg z-50 transform transition-transform duration-300"
                    style={{ transform: showEditModal ? 'translateX(0)' : 'translateX(100%)' }}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Edit Subject</h2>
                        <button onClick={closeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="p-4">
                        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formValues.title}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">Heading</label>
                                <input
                                    type="text"
                                    name="heading"
                                    value={formValues.heading}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">Created By</label>
                                <select
                                    name="created_by"
                                    value={formValues.created_by}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                >
                                    <option value="">Select role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Mentor">Mentor</option>
                                    <option value="Teacher">Teacher</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formValues.status}
                                    onChange={handleChange}
                                    className="w-full border p-2"
                                    required
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-1">Image ID</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border p-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setSelectedSubject(null); }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isEditLoading}>
                                    {isEditLoading && <div className='animate-spin border-t-4 border-sky-500 rounded-full w-4 h-4 mr-2'></div>}
                                    {isEditLoading? 'Updating':'Update Subject'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            }
            {showDeleteModal && <DeleteSubjectModal />}
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