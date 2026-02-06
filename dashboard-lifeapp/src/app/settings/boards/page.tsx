'use client'
import '@tabler/core/dist/css/tabler.min.css';
import { useEffect, useState } from 'react';
import React from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { Sidebar } from '@/components/ui/sidebar';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

type Board = {
    id: number;
    name: string;
    status: number;  // 1=Active, 0=Inactive
    created_at: string;
    updated_at: string;
};


export default function SettingsBoards () {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const boardsPerPage = 10;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [boardToEdit, setBoardToEdit] = useState<Board | null>(null);
    const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
    const [newBoard, setNewBoard] = useState({ name: '', status: '1' }); // status as string ("1" or "0")

    // Fetch boards from API
    const fetchBoards = async () => {
        setLoading(true);
        try {
        const res = await fetch(`${api_startpoint}/api/boards`, { method: 'POST' });
        const data = await res.json();
        setBoards(data);
        } catch (error) {
        console.error("Failed to fetch boards:", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);


    // Pagination calculations
    const indexOfLast = currentPage * boardsPerPage;
    const indexOfFirst = indexOfLast - boardsPerPage;
    const paginatedBoards = boards.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(boards.length / boardsPerPage);

    // Handlers for adding/updating/deleting a board
    const handleAddBoard = async () => {
        try {
        const res = await fetch(`${api_startpoint}/api/add_board`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBoard),
        });
        const data = await res.json();
        if (data.success) {
            setShowAddModal(false);
            setNewBoard({ name: '', status: '1' });
            fetchBoards();
        }
        } catch (error) {
        console.error(error);
        }
    };

    const openEditModal = (board: Board) => {
        setBoardToEdit(board);
        setShowEditModal(true);
    };

    const handleUpdateBoard = async () => {
        if (!boardToEdit) return;
        try {
        const res = await fetch(`${api_startpoint}/api/update_board/${boardToEdit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(boardToEdit),
        });
        const data = await res.json();
        if (data.success) {
            setShowEditModal(false);
            setBoardToEdit(null);
            fetchBoards();
        }
        } catch (error) {
        console.error(error);
        }
    };

    const openDeleteModal = (board: Board) => {
        setBoardToDelete(board);
        setShowDeleteModal(true);
    };

    const handleDeleteBoard = async () => {
        if (!boardToDelete) return;
        try {
        const res = await fetch(`${api_startpoint}/api/delete_board/${boardToDelete.id}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
            setShowDeleteModal(false);
            setBoardToDelete(null);
            fetchBoards();
        }
        } catch (error) {
        console.error(error);
        }
    };

    return (
        <div className={`page bg-body ${inter.className} font-sans`}>
            <Sidebar />

            {/* Main Content */}
            <div className="page-wrapper" style={{ marginLeft: '250px' }}>
                <div className='page-body'>
                    <div className='container-xl pt-4 pb-4'>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h2 className="mb-0">Boards</h2>
                                <small className="text-muted">{boards.length} Boards found</small>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <IconPlus className="me-2" /> Add New Board
                                </button>
                            </div>
                        </div>
                        {/* Boards Table */}
                        {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-black"></div>
                        </div>
                        ) : (
                        <div className="card">
                            <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {paginatedBoards.map((board: Board) => (
                                    <tr key={board.id}>
                                    <td>{board.id}</td>
                                    <td>{board.name}</td>
                                    <td>{board.status === 1 ? 'Active' : 'Inactive'}</td>
                                    <td>{board.created_at}</td>
                                    <td>{board.updated_at}</td>
                                    <td>
                                        <button
                                        className="btn btn-secondary btn-sm me-2"
                                        onClick={() => openEditModal(board)}
                                        >
                                        <IconEdit /> Edit
                                        </button>
                                        <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => openDeleteModal(board)}
                                        >
                                        <IconTrash /> Delete
                                        </button>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>
                            {/* Pagination Controls */}
                            <div className="d-flex justify-content-between align-items-center p-3">
                            <button
                                className="btn btn-secondary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className="btn btn-secondary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        {/* Add New Board Modal */}
        {showAddModal && (
            <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Add New Board</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body">
                    <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={newBoard.name}
                        onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                    />
                    </div>
                    <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                        className="form-select"
                        value={newBoard.status}
                        onChange={(e) => setNewBoard({ ...newBoard, status: e.target.value })}
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleAddBoard}>
                    Submit
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Edit Board Modal */}
        {showEditModal && boardToEdit && (
            <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Edit Board</h5>
                    <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body">
                    <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={boardToEdit.name}
                        onChange={(e) => setBoardToEdit({ ...boardToEdit, name: e.target.value })}
                    />
                    </div>
                    <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                        className="form-select"
                        value={String(boardToEdit.status)}
                        onChange={(e) =>
                        setBoardToEdit({ ...boardToEdit, status: parseInt(e.target.value) })
                        }
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleUpdateBoard}>
                    Save Changes
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}

        {/* Delete Board Modal */}
        {showDeleteModal && boardToDelete && (
            <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Confirm Delete</h5>
                    <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete the board: {boardToDelete.name}?</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                    </button>
                    <button className="btn btn-danger" onClick={handleDeleteBoard}>
                    Delete
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}