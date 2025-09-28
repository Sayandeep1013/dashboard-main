"use client";
import { useState, useEffect } from "react";
import React from "react";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import "@tabler/core/dist/css/tabler.min.css";
import { IconEdit, IconTrash } from "@tabler/icons-react";

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

interface Levels {
  created_at: string;
  description: string;
  id: number;
  vision_mcq_points: number;
  vision_text_image_points: number;
  jigyasa_points: number;
  mission_points: number;
  pragya_points: number;
  puzzle_points: number;
  puzzle_time: number;
  quiz_points: number;
  quiz_time: number;
  riddle_points: number;
  riddle_time: number;
  status: number;
  title: string;
  updated_at: string;
  teacher_assign_points: number;
  teacher_correct_submission_points: number;
}

export default function SettingsLevels() {
  const [levels, setLevels] = useState<Levels[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // State for delete modals
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<number | null>(null);
  const [deletedLevelTitle, setDeletedLevelTitle] = useState("");

  async function fetchLevels() {
    try {
      setLoading(true);
      const response = await fetch(`${api_startpoint}/api/levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: 1 }),
      });

      const data: Levels[] = await response.json();
      setLevels(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching levels:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLevels();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(0);
  const [visionMcqPoints, setVisionMcqPoints] = useState(0);
  const [visionTextImagePoints, setVisionTextImagePoints] = useState(0);
  const [jigyasaPoints, setJigyasaPoints] = useState(0);
  const [missionPoints, setMissionPoints] = useState(0);
  const [pragyaPoints, setPragyaPoints] = useState(0);
  const [puzzlePoints, setPuzzlePoints] = useState(0);
  const [puzzleTime, setPuzzleTime] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [quizTime, setQuizTime] = useState(0);
  const [riddlePoints, setRiddlePoints] = useState(0);
  const [riddleTime, setRiddleTime] = useState(0);
  const [teacherAssignPoints, setTeacherAssignPoints] = useState(0);
  const [teacherCorrectPoints, setTeacherCorrectPoints] = useState(0);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsAddLoading(true);

    const newLevel = {
      title: { en: title },
      description: { en: description },
      vision_mcq_points: visionMcqPoints,
      vision_text_image_points: visionTextImagePoints,
      jigyasa_points: jigyasaPoints,
      mission_points: missionPoints,
      pragya_points: pragyaPoints,
      puzzle_points: puzzlePoints,
      puzzle_time: puzzleTime,
      quiz_time: quizTime,
      quiz_points: quizPoints,
      riddle_points: riddlePoints,
      riddle_time: riddleTime,
      status: status,
      teacher_assign_points: teacherAssignPoints,
      teacher_correct_submission_points: teacherCorrectPoints,
    };

    try {
      const response = await fetch(`${api_startpoint}/api/levels_new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLevel),
      });

      if (response.ok) {
        setShowAddModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding level:", error);
    } finally {
      setIsAddLoading(false);
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<Levels | null>(null);
  const [editFormValues, setEditFormValues] = useState<Levels>({
    id: 0,
    title: "",
    description: "",
    vision_mcq_points: 0,
    vision_text_image_points: 0,
    jigyasa_points: 0,
    mission_points: 0,
    pragya_points: 0,
    puzzle_points: 0,
    puzzle_time: 60,
    quiz_points: 0,
    quiz_time: 60,
    riddle_points: 0,
    riddle_time: 60,
    status: 1,
    created_at: "",
    updated_at: "",
    teacher_assign_points: 0,
    teacher_correct_submission_points: 0,
  });

  const handleEditClick = (level: Levels) => {
    setSelectedLevel(level);
    try {
      const parsedTitle = JSON.parse(level.title);
      const parsedDescription = JSON.parse(level.description);

      setEditFormValues({
        ...editFormValues,
        id: level.id,
        title: parsedTitle.en,
        description: parsedDescription.en,
        vision_mcq_points: level.vision_mcq_points,
        vision_text_image_points: level.vision_text_image_points,
        jigyasa_points: level.jigyasa_points,
        mission_points: level.mission_points,
        pragya_points: level.pragya_points,
        puzzle_points: level.puzzle_points,
        puzzle_time: level.puzzle_time,
        quiz_points: level.quiz_points,
        quiz_time: level.quiz_time,
        riddle_points: level.riddle_points,
        riddle_time: level.riddle_time,
        status: level.status,
        created_at: level.created_at,
        updated_at: level.updated_at,
        teacher_assign_points: level.teacher_assign_points,
        teacher_correct_submission_points:
          level.teacher_correct_submission_points,
      });
    } catch (err) {
      console.error("JSON parse error:", err);
      setErrorMessage("Failed to parse level data");
    }
    setShowEditModal(true);
  };

  const handleEditChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    const numericFields = [
      "vision_mcq_points",
      "vision_text_image_points",
      "jigyasa_points",
      "mission_points",
      "pragya_points",
      "puzzle_points",
      "puzzle_time",
      "quiz_points",
      "quiz_time",
      "riddle_points",
      "riddle_time",
      "status",
      "teacher_assign_points",
      "teacher_correct_submission_points",
    ];

    setEditFormValues({
      ...editFormValues,
      [name]: numericFields.includes(name) ? Number(value) : value,
    });
  };

  const handleEditSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsEditLoading(true);

    try {
      const formDataForAPI = {
        id: editFormValues.id,
        title: { en: editFormValues.title },
        description: { en: editFormValues.description },
        vision_mcq_points: editFormValues.vision_mcq_points,
        vision_text_image_points: editFormValues.vision_text_image_points,
        jigyasa_points: editFormValues.jigyasa_points,
        mission_points: editFormValues.mission_points,
        pragya_points: editFormValues.pragya_points,
        puzzle_points: editFormValues.puzzle_points,
        puzzle_time: editFormValues.puzzle_time,
        quiz_points: editFormValues.quiz_points,
        quiz_time: editFormValues.quiz_time,
        riddle_points: editFormValues.riddle_points,
        riddle_time: editFormValues.riddle_time,
        status: editFormValues.status,
        teacher_assign_points: editFormValues.teacher_assign_points,
        teacher_correct_submission_points:
          editFormValues.teacher_correct_submission_points,
      };

      const res = await fetch(`${api_startpoint}/api/levels_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataForAPI),
      });

      if (res.ok) {
        setShowEditModal(false);
        setSelectedLevel(null);
        setErrorMessage("");
        window.location.reload();
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "Error updating level");
      }
    } catch (err) {
      setErrorMessage("Error connecting to API");
      console.error("Error updating level:", err);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteClick = (id: number, title: string) => {
    try {
      const parsedTitle = JSON.parse(title);
      setLevelToDelete(id);
      setDeletedLevelTitle(parsedTitle.en);
      setShowDeleteConfirmation(true);
    } catch (error) {
      console.error("Error parsing title:", error);
      setLevelToDelete(id);
      setDeletedLevelTitle("Untitled Level");
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDelete = async () => {
    if (levelToDelete === null) return;

    try {
      const response = await fetch(`${api_startpoint}/api/levels_delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: levelToDelete }),
      });

      if (response.ok) {
        setShowDeleteConfirmation(false);
        setShowDeleteSuccess(true);
        fetchLevels();
      } else {
        console.error("Failed to delete level");
      }
    } catch (error) {
      console.error("Error deleting level:", error);
    } finally {
      setLevelToDelete(null);
    }
  };

  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      <Sidebar />

      {/* Main Content */}
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-2">
            <div className="card shadow-sm border-0 ">
              <div className="card-body overflow-x-scroll">
                <h4 className="card-title ">Levels</h4>

                {/* Levels Table */}
                <div className="table-responsive">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-800"></div>
                    </div>
                  ) : (
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          {/* Added S.No column for serial number */}
                          <th>S.No</th>

                          <th>Title</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Vision MCQ Points</th>
                          <th>Vision Text/Image</th>
                          <th>Mission Points</th>
                          <th>Jigyasa Points</th>
                          <th>Pragya Points</th>
                          <th>Quiz Points</th>
                          <th>Riddle Points</th>
                          <th>Puzzle Points</th>
                          {/* Updated column names */}
                          <th>Teacher Assign Points</th>
                          <th>Teacher Correct Submission Points</th>
                          <th>Quiz Time</th>
                          <th>Riddle Time</th>
                          <th>Puzzle Time</th>
                          <th>Created At</th>
                          <th>Updated At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {levels.map((level, index) => (
                          <tr key={level.id}>
                            {/* Added serial number column */}
                            <td>{index + 1}</td>

                            <td>{JSON.parse(level.title).en}</td>
                            <td>{JSON.parse(level.description).en}</td>
                            <td>{level.status == 1 ? "Active" : "Inactive"}</td>
                            <td>{level.vision_mcq_points}</td>
                            <td>{level.vision_text_image_points}</td>
                            <td>{level.mission_points}</td>
                            <td>{level.jigyasa_points}</td>
                            <td>{level.pragya_points}</td>
                            <td>{level.quiz_points}</td>
                            <td>{level.riddle_points}</td>
                            <td>{level.puzzle_points}</td>
                            <td>{level.teacher_assign_points}</td>
                            <td>{level.teacher_correct_submission_points}</td>
                            <td>{level.quiz_time}</td>
                            <td>{level.riddle_time}</td>
                            <td>{level.puzzle_time}</td>
                            <td>
                              {new Date(level.created_at).toLocaleString()}
                            </td>
                            <td>
                              {new Date(level.updated_at).toLocaleString()}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary mx-1"
                                onClick={() => handleEditClick(level)}
                              >
                                <IconEdit size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDeleteClick(level.id, level.title)
                                }
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
            <div className="w-1/6 h-6">
              <button
                className="btn btn-primary mb-3"
                onClick={() => setShowAddModal(true)}
              >
                Add New Level
              </button>
            </div>
            {/* Sliding Add Modal */}
            {showAddModal && (
              <div
                className="modal fade show d-block mt-0"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1050,
                }}
                tabIndex={-1}
                role="dialog"
              >
                <div className="modal-dialog modal-lg modal-dialog-end">
                  <div
                    className="modal-content"
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      className="modal-header"
                      style={{
                        background: "#f8f9fa",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <h5 className="modal-title">Add New Level</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowAddModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            className="form-control"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select
                            name="status"
                            value={status}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) => setStatus(Number(e.target.value))}
                            className="w-full border p-2"
                            required
                          >
                            <option value="">Select status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Vision MCQ Points
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={visionMcqPoints}
                            onChange={(e) =>
                              setVisionMcqPoints(Number(e.target.value))
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Vision Text/Image Points
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={visionTextImagePoints}
                            onChange={(e) =>
                              setVisionTextImagePoints(Number(e.target.value))
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mission Points</label>
                          <input
                            type="number"
                            className="form-control"
                            value={missionPoints}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setMissionPoints(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Jigyasa Points</label>
                          <input
                            type="number"
                            className="form-control"
                            value={jigyasaPoints}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setJigyasaPoints(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Pragya Points</label>
                          <input
                            type="number"
                            className="form-control"
                            value={pragyaPoints}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setPragyaPoints(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Quiz Points</label>
                          <input
                            type="number"
                            className="form-control"
                            value={quizPoints}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setQuizPoints(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Puzzle Points</label>
                          <input
                            type="number"
                            className="form-control"
                            value={puzzlePoints}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setPuzzlePoints(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Riddle Points</label>
                          <input
                            type="number"
                            className="form-control"
                            value={riddlePoints}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setRiddlePoints(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Quiz Time</label>
                          <input
                            type="number"
                            className="form-control"
                            value={quizTime}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setQuizTime(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Puzzle Time</label>
                          <input
                            type="number"
                            className="form-control"
                            value={puzzleTime}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setPuzzleTime(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Riddle Time</label>
                          <input
                            type="number"
                            className="form-control"
                            value={riddleTime}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setRiddleTime(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Teacher Assign Points
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={teacherAssignPoints}
                            onChange={(e) =>
                              setTeacherAssignPoints(Number(e.target.value))
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">
                            Teacher Correct Submission Points
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={teacherCorrectPoints}
                            onChange={(e) =>
                              setTeacherCorrectPoints(Number(e.target.value))
                            }
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={isAddLoading}
                        >
                          {isAddLoading && (
                            <div className="animate-spin rounded-full border-t-4 border-white w-4 h-4 mr-2"></div>
                          )}
                          {isAddLoading ? "Saving" : "Save Level"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Edit Modal */}
            {showEditModal && (
              <div
                className="fixed top-0 right-0 h-full w-2/5 shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto mt-0 bg-white"
                style={{
                  transform: showEditModal
                    ? "translateX(0)"
                    : "translateX(100%)",
                }}
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Edit Level</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedLevel(null);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-x"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M18 6L6 18"></path>
                      <path d="M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {errorMessage && (
                    <p className="text-red-500">{errorMessage}</p>
                  )}
                  <form onSubmit={handleEditSubmit}>
                    <div className="mb-4">
                      <label className="block mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={editFormValues.title}
                        onChange={handleEditChange}
                        className="w-full border p-2"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={editFormValues.description}
                        onChange={handleEditChange}
                        className="w-full border p-2"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Vision MCQ Points</label>
                      <input
                        type="number"
                        name="vision_mcq_points"
                        value={editFormValues.vision_mcq_points}
                        onChange={handleEditChange}
                        className="w-full border p-2"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">
                        Vision Text/Image Points
                      </label>
                      <input
                        type="number"
                        name="vision_text_image_points"
                        value={editFormValues.vision_text_image_points}
                        onChange={handleEditChange}
                        className="w-full border p-2"
                        required
                      />
                    </div>
                    <div className="d-flex flex-col gap-1">
                      <div className="mb-4">
                        <label className="block mb-1">Jigyasa Points</label>
                        <input
                          type="number"
                          name="jigyasa_points"
                          value={editFormValues.jigyasa_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Mission Points</label>
                        <input
                          type="number"
                          name="mission_points"
                          value={editFormValues.mission_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Pragya Points</label>
                        <input
                          type="number"
                          name="pragya_points"
                          value={editFormValues.pragya_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Puzzle Points</label>
                        <input
                          type="number"
                          name="puzzle_points"
                          value={editFormValues.puzzle_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Puzzle Time</label>
                        <input
                          type="number"
                          name="puzzle_time"
                          value={editFormValues.puzzle_time}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Quiz Points</label>
                        <input
                          type="number"
                          name="quiz_points"
                          value={editFormValues.quiz_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Quiz Time</label>
                        <input
                          type="number"
                          name="quiz_time"
                          value={editFormValues.quiz_time}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Riddle Points</label>
                        <input
                          type="number"
                          name="riddle_points"
                          value={editFormValues.riddle_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Riddle Time</label>
                        <input
                          type="number"
                          name="riddle_time"
                          value={editFormValues.riddle_time}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">
                          Teacher Assign Points
                        </label>
                        <input
                          type="number"
                          name="teacher_assign_points"
                          value={editFormValues.teacher_assign_points}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">
                          Teacher Correct Submission Points
                        </label>
                        <input
                          type="number"
                          name="teacher_correct_submission_points"
                          value={
                            editFormValues.teacher_correct_submission_points
                          }
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-1">Status</label>
                        <select
                          name="status"
                          value={editFormValues.status}
                          onChange={handleEditChange}
                          className="w-full border p-2"
                          required
                        >
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedLevel(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isEditLoading}
                      >
                        {isEditLoading && (
                          <div className="animate-spin rounded-full border-t-4 border-white w-4 h-4 mr-2"></div>
                        )}
                        {isEditLoading ? "Updating" : "Update Level"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">Confirm Deletion</h3>
                    <p className="mt-2">
                      Are you sure you want to delete the level:{" "}
                      <strong>{deletedLevelTitle}</strong>?
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-gray-800"
                      onClick={() => setShowDeleteConfirmation(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Success Modal */}
            {showDeleteSuccess && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowDeleteSuccess(false)}
              >
                <div
                  className="bg-white rounded-lg p-6 w-96 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-green-600">
                      Success!
                    </h3>
                    <p className="mt-2 text-gray-700">
                      The level <strong>{deletedLevelTitle}</strong> has been
                      successfully deleted.
                    </p>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                      onClick={() => setShowDeleteSuccess(false)}
                    >
                      Okay
                    </button>
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
