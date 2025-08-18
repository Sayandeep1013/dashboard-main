'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/ui/sidebar';
import '@tabler/core/dist/css/tabler.min.css';
import NumberFlow from '@number-flow/react';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';
const inter = Inter({ subsets: ['latin'] });
//const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
const api_startpoint = 'http://152.42.239.141:5000'

interface Sessions {
    id: number;
    name: string;
    status: number;
    zoom_link: string;
    zoom_password: string;
    heading: string;
    description?: string; // Add this line
    date_time: string;
  }
  
export default function MentorsSessions() {
    const [sessions, setSessions] = useState<Sessions[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    // Fetch sessions from the API endpoint.
    const fetchSessions = () => {
        setLoading(true);
        fetch(`${api_startpoint}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setSessions(data);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching sessions:', err);
            setLoading(false);
          });
    };
    
    useEffect(() => {
        fetchSessions();
    }, []);

    const [statusFilter, setStatusFilter] = useState("all");

    const filteredSessions = sessions.filter((session) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return session.status === 1;
        if (statusFilter === "inactive") return session.status === 0;
        return true;
    });
      
    const paginatedSessions = filteredSessions.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(filteredSessions.length / limit);
      
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);
      

    
    // Convert numeric status to a user-friendly string.
    const renderStatus = (status: number) => {
        return status === 1 ? 'Active' : 'Inactive';
    };

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Sessions | null>(null);
    const handleSessionUpdate = () => {
        fetch(`${api_startpoint}/api/update_session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(editingSession),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log("Session updated:", data);
            setEditModalOpen(false);
            fetchSessions(); // refresh table
        })
        .catch((err) => console.error("Update error:", err));
    };
      
    const openEditModal = (session: Sessions) => {
        setEditingSession(session);
        setEditModalOpen(true);
    };
      
    
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);

    
    const toggleParticipants = async (sessionId: number) => {
        if (selectedRowId === sessionId) {
          setSelectedRowId(null); // collapse if clicked again
          return;
        }
      
        setSelectedRowId(sessionId);
        setParticipantsLoading(true);
      
        try {
          const response = await fetch(`${api_startpoint}/api/session_participants`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId }),
          });
      
          const data = await response.json();
          setParticipants(data);
        } catch (error) {
          console.error("Failed to fetch participants:", error);
        } finally {
          setParticipantsLoading(false);
        }
    };
      
      
      
    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className="page-body">
                    <div className="container-xl pt-4 pb-4 space-y-2">
                        <h2 className="text-xl font-semibold">Sessions</h2>
                        {/* Count card to display total number of sessions (after filter) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-1">
                          <div className="bg-white shadow rounded p-4 border border-gray-200">
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              Total Sessions
                            </div>
                            <div className="text-2xl font-semibold text-sky-950">
                              {filteredSessions.length}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mb-1" style={{width:145}}>
                                <select
                                    className="form-select w-48"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Sessions</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                        </div>
                        <div className="card">
                            

                            <div className="table-responsive">
                                {loading ? (
                                <   div className="flex justify-center items-center h-40">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-800"></div>
                                </div>
                                ) : (
                                    
                                    <table className="table table-vcenter card-table w-full table-auto">
                                        {/* <h4>{filteredSessions.length()}</h4> */}
                                        <thead className="min-w-full">
                                            <tr>
                                                <th className="">ID</th>
                                                <th className="">Name</th>
                                                <th className="">Heading</th>
                                                <th className="">Zoom Link</th>
                                                <th className="">Zoom Password</th>
                                                <th className="">Date Time</th>
                                                <th className="">Status</th>
                                                <th className="">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedSessions.map((session, index) => (
                                                <React.Fragment key={session.id}>
                                                    <tr key={index}>
                                                        <td className="text-sm">{session.id}</td>
                                                        <td className="">{session.name}</td>
                                                        <td className="">{session.heading}</td>
                                                        <td className="">
                                                        <a href={session.zoom_link} target="_blank" rel="noopener noreferrer">
                                                            {session.zoom_link}
                                                        </a>
                                                        </td>
                                                        <td className="">{session.zoom_password}</td>
                                                        <td className="">{session.date_time}</td>
                                                        <td className="">{renderStatus(session.status)}</td>
                                                        <td className="">
                                                        <div className="btn-list d-flex flex-col">
                                                            <button className="btn btn-icon btn-primary" style={{width:16, height:16}}
                                                                onClick={() => openEditModal(session)} >
                                                            <IconEdit size={16} />
                                                            </button>
                                                            <button className="btn btn-sm btn-secondary ml-0"
                                                            onClick={() => toggleParticipants(session.id)} >
                                                            Participants
                                                            </button>
                                                        </div>
                                                        </td>
                                                    </tr>
                                                    {selectedRowId === session.id && (
                                                        <tr>
                                                            <td colSpan={10}>
                                                                {participantsLoading ? (
                                                                <div className="flex justify-center p-4">
                                                                    <div className="animate-spin h-11 w-11 border-6 border-t-8 border-blue-600 rounded-full"></div>
                                                                </div>
                                                                ) : (
                                                                <div className="p-4 bg-gray-50 border rounded">
                                                                    <h4 className="font-semibold mb-2">Participants</h4>
                                                                    {participants.length > 0 ? (
                                                                    <table className="table-auto w-full text-sm">
                                                                        <thead>
                                                                        <tr>
                                                                            <th>School ID</th>
                                                                            <th>Name</th>
                                                                            <th>Mobile</th>
                                                                            <th>Grade</th>
                                                                            <th>City</th>
                                                                            <th>State</th>
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        {participants.map((p) => (
                                                                            <tr key={p.mobile_no}>
                                                                            <td>{p.school_id}</td>
                                                                            <td>{p.name}</td>
                                                                            <td>{p.mobile_no}</td>
                                                                            <td>{p.grade}</td>
                                                                            <td>{p.city}</td>
                                                                            <td>{p.state}</td>
                                                                            </tr>
                                                                        ))}
                                                                        </tbody>
                                                                    </table>
                                                                    ) : (
                                                                    <div className="text-gray-500">No participants found.</div>
                                                                    )}
                                                                </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                        

                                    </table>
                                
                                )}
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-sm text-gray-600">
                                                Page {page} of {totalPages}
                                            </span>
                                            <div className="btn-list">
                                                <button
                                                className="btn btn-sm"
                                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={page === 1}
                                                >
                                                Previous
                                                </button>
                                                <button
                                                className="btn btn-sm"
                                                onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                                                disabled={page === totalPages}
                                                >
                                                Next
                                                </button>
                                            </div>
                                        </div>
                            </div>
                            
                        </div>
                        {editModalOpen && editingSession && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-0">
                                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Edit Session</h3>
                                    <button 
                                        className="text-gray-400 hover:text-gray-600" 
                                        onClick={() => setEditModalOpen(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                                Heading
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter session heading"
                                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition duration-150 ease-in-out"
                                                value={editingSession.heading}
                                                onChange={(e) =>
                                                setEditingSession({ ...editingSession, heading: e.target.value })
                                                }
                                            />
                                        </div>

                                    
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                placeholder="Enter session description"
                                                rows={4}
                                                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition duration-150 ease-in-out resize-none"
                                                value={editingSession.description || ""}
                                                onChange={(e) =>
                                                setEditingSession({ ...editingSession, description: e.target.value })
                                                }
                                            />
                                        </div>

                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                        className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        value={editingSession.status}
                                        onChange={(e) =>
                                            setEditingSession({ ...editingSession, status: parseInt(e.target.value) })
                                        }
                                        >
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                        </select>
                                    </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button 
                                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-150 ease-in-out"
                                            onClick={() => setEditModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-5 py-2 text-sm font-medium text-white bg-sky-950 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out"
                                            onClick={handleSessionUpdate}
                                        >
                                            Save Changes
                                        </button>
                                    </div>

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