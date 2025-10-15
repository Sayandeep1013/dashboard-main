'use client'
import { useState, useEffect } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { cn } from "@/lib/utils";
import '@tabler/core/dist/css/tabler.min.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";
interface Language {
    id: number;
    title: string;
    slug: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export default function SettingsLanguages() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [slug, setSlug] = useState('');
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState(0);
    useEffect(() => {
        fetchLanguages();
    }, []);

    async function fetchLanguages() {
        try {
            setLoading(true);
            const response = await fetch(`${api_startpoint}/api/languages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page: 1 }) // Default first page
            });
            const data: Language[] = await response.json();
            setLanguages(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching languages:', error);
            setLoading(false);
        }
    }

    async function handleAddLanguage(e: React.FormEvent) {
        e.preventDefault();
        
        // Validate form inputs
        if (!title.trim()) {
            alert("Please enter a title");
            return;
        }
        
        if (!slug.trim()) {
            alert("Please enter a slug");
            return;
        }
        
        // Show loading state
        setLoading(true);
        
        try {
            console.log("Sending language data:", { title: title.trim(), slug: slug.trim().toLowerCase(), status });
            
            const response = await fetch(`${api_startpoint}/api/languages_new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: title.trim(),
                    slug: slug.trim().toLowerCase(), 
                    status: status
                })
            });
            
            const result = await response.json();
            
            // Check if the request was successful
            if (response.ok) {
                // Success case
                setShowAddModal(false);
                setSlug('');
                setTitle('');
                setStatus(0);
                fetchLanguages(); // Refresh list
                
                // Show success message
                alert("Language added successfully!");
            } else {
                // Error case with message from server
                console.error("Server error:", result);
                alert(`Error: ${result.error || "Unknown error occurred"}`);
            }
        } catch (error) {
            // Network or other errors
            console.error('Error adding language:', error);
            alert(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    }

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

    const openEditModal = (language: Language) => {
        setSelectedLanguage(language);
        setShowEditModal(true);
    };

    async function handleEditLanguage(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedLanguage) return;

        try {
            const response = await fetch(`${api_startpoint}/api/languages_update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedLanguage.id,
                    slug: selectedLanguage.slug,
                    title: selectedLanguage.title,
                    status: selectedLanguage.status,
                })
            });
            const result = await response.json();
            if (response.ok) {
                setShowEditModal(false);
                fetchLanguages(); // Refresh list
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error updating language:', error);
        }
    }

    const handleDelete = async (id: number) => { 
        if (!window.confirm("Are you sure you want to delete this language?")) return;

        try {
            const response = await fetch(`${api_startpoint}/api/languages_delete/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Only use one method to update the UI, not both
                // Remove the local filter and rely on fetchLanguages to refresh the data
                fetchLanguages(); // This will refresh the entire list
                
                // Optional: Show success message
                alert("Language deleted successfully!");
            } else {
                const result = await response.json();
                alert(`Error: ${result.error || "Failed to delete language"}`);
            }
        } catch (error) {
            console.error("Error deleting language:", error);
            alert("Network error while deleting language");
        }
    };
        
    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className='page-body'>
                    <div className='container-xl pt-4 pb-4 space-y-2'>
                        <div className="card shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title">Languages</h4>
                                <button className="btn btn-primary mb-3" onClick={() => setShowAddModal(true)}>+ Add Language</button>
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
                                                    <th>Title</th>
                                                    <th>Slug</th>
                                                    <th>Status</th>
                                                    <th>Created At</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {languages.map((lang) => (
                                                    <tr key={lang.id}>
                                                        <td>{lang.id}</td>
                                                        <td>{lang.title}</td>
                                                        <td>{lang.slug}</td>
                                                        <td>{lang.status === 1 ? 'Active' : 'Inactive'}</td>
                                                        <td>{new Date(lang.created_at).toLocaleString()}</td>
                                                        <td className=''>
                                                            <button className="btn btn-sm btn-outline-primary mx-1" 
                                                                onClick={() => openEditModal(lang)}>
                                                                <IconEdit size={16} />
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(lang.id)}
                                                            >
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

                {/* Add Language Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Add New Language</h2>
                            <form onSubmit={handleAddLanguage}>
                                <div className="mb-3 space-y-1">
                                    <label className="block font-medium">Title</label>
                                    <input
                                        type="text"
                                        className="form-input w-full border border-gray-300 rounded-md p-2"
                                        placeholder="Enter language Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                    <label className="block font-medium">Slug</label>
                                    <input
                                        type="text"
                                        className="form-input w-full border border-gray-300 rounded-md p-2"
                                        placeholder="Enter language slug (e.g., en, fr)"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        required
                                    />
                                    
                                    <label className="form-label">Status</label>
                                    <select
                                        name="status"
                                        value={status}
                                        onChange={e => setStatus(Number(e.target.value))}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                        required
                                    >
                                        <option value="">Select status</option>
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                                
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Language Modal */}
                {showEditModal && selectedLanguage && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold mb-4">Edit Language</h2>
                            <form onSubmit={handleEditLanguage}>
                                <div className="mb-3">
                                    <label className="block font-medium">Slug</label>
                                    <input
                                        type="text"
                                        className="form-input w-full border border-gray-300 rounded-md p-2"
                                        value={selectedLanguage.slug}
                                        onChange={(e) => setSelectedLanguage({ ...selectedLanguage, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block font-medium">Title</label>
                                    <input
                                        type="text"
                                        className="form-input w-full border border-gray-300 rounded-md p-2"
                                        value={selectedLanguage.title}
                                        onChange={(e) => setSelectedLanguage({ ...selectedLanguage, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block font-medium">Status</label>
                                    <select
                                        name='Status'
                                        className="form-input w-full border border-gray-300 rounded-md p-2"
                                        value={selectedLanguage.status}
                                        onChange={(e) => setSelectedLanguage({ ...selectedLanguage, status: Number(e.target.value) })}
                                        required
                                    >
                                        <option value="">Select status</option>
                                        <option value= {1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
