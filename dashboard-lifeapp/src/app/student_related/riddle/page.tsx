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
  title: string; // stored as JSON string; we'll parse it when displaying
};

type Level = {
  id: number;
  title: string;
};

type Topic = {
  id: number;
  title: string; // stored as JSON string
  la_subject_id: string;
  la_level_id: string;
  status: string;
  allow_for: string;
  type: string;
};

type QuizQuestion = {
  id: number;
  question_title: string;
  subject_title: string;
  level_title: string;
  topic_title: string | null;
  status: string;
  index: string;
  question_type?: string;
  options: {
    title: string;
    is_answer: number;
  }[];
};

export default function StudentRelatedRiddle() {
  // Data arrays
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);


    const [subjectsLoading, setSubjectsLoading] = useState<boolean>(false);
    const [topicsLoading, setTopicsLoading] = useState<boolean>(false);

  // Filters state (overall filters)
  const [filters, setFilters] = useState({ subject_id: '', level_id: '', status: '', topic_id: '' });

  // Individual filter selection states for UI steps
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const [loading, setLoading] = useState(false);

  // Quiz modals & related state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [showQuizEditModal, setShowQuizEditModal] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<QuizQuestion | null>(null);

  const [newQuestion, setNewQuestion] = useState({
    question_title: '',
    subject_id: '',
    level_id: '',
    topic_id: '',
    status: '1',
    type: '3',
    question_type: '1',
    options: ['', '', '', ''],
    correct_index: 0,
  });

  // Topic management states
  const [showTopicAddModal, setShowTopicAddModal] = useState(false);
  const [showTopicEditModal, setShowTopicEditModal] = useState(false);
  const [showTopicDeleteModal, setShowTopicDeleteModal] = useState(false);
  const [showTopicListModal, setShowTopicListModal] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [newTopic, setNewTopic] = useState({
    title: '',
    la_subject_id: '',
    la_level_id: '',
    status: '1',
    allow_for: '1',
    type: '2',
  });

  // Pagination state (20 questions per page)
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 20;

  // Fetch subjects and levels on mount
  useEffect(() => {
    const statusFilter = selectedStatus || 'all';  // Default to "all" if no status is selected
    setSubjectsLoading(true);
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusFilter }),
    })
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Failed to fetch subjects:", err))
      .finally(() => setSubjectsLoading(false));
  }, [selectedStatus]);
  
  useEffect(() => {
    // fetch(`${api_startpoint}/api/subjects_list`, { method: 'POST' })
    //   .then(res => res.json())
    //   .then(setSubjects);
    fetch(`${api_startpoint}/api/levels`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1 })
    })
      .then(res => res.json())
      .then(setLevels);
  }, []);

  // Fetch topics when subject, level, and status are selected
  useEffect(() => {
    if (selectedSubject && selectedLevel && selectedStatus) {
      const payload = {
        la_subject_id: selectedSubject,
        la_level_id: selectedLevel,
        status: selectedStatus,
      };
      setTopicsLoading(true);
      fetch(`${api_startpoint}/api/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => setTopics(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to fetch topics:", err))
        .finally(() => setTopicsLoading(false));
    } else {
      setTopics([]);
    }
  }, [selectedSubject, selectedLevel, selectedStatus]);

  // Fetch quiz questions only when all filters are selected
  useEffect(() => {
    if (selectedStatus && selectedSubject && selectedLevel && selectedTopic) {
      // Construct the new filter payload directly
      const newFilters = {
        subject_id: selectedSubject,
        level_id: selectedLevel,
        status: selectedStatus,
        topic_id: selectedTopic,
        type: 3, //riddle
      };
      setCurrentPage(1);
      // Instead of setFilters(newFilters) + fetchData(), call fetchData(newFilters) directly
      fetchData(newFilters);
    } else {
      setQuestions([]);
    }
  }, [selectedStatus, selectedSubject, selectedLevel, selectedTopic]);

  const fetchData = async (payload?: {
    subject_id: string;
    level_id: string;
    status: string;
    topic_id: string;
  }) => {
    setLoading(true);
    // If no payload was passed, default to your local state
    const finalPayload = payload || filters;
  
    const res = await fetch(`${api_startpoint}/api/quiz_questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    });
    const data = await res.json();
    const grouped = data.reduce((acc: any, curr: any) => {
      if (!acc[curr.id]) {
        acc[curr.id] = {
          id: curr.id,
          question_title: curr.question_title,
          subject_title: curr.subject_title,
          level_title: curr.level_title,
          topic_title: curr.topic_title,
          status: curr.status,
          index: curr.index,
          options: []
        };
      }
      acc[curr.id].options.push({
        title: curr.answer_option,
        is_answer: curr.is_answer
      });
      return acc;
    }, {});
    setQuestions(Object.values(grouped));
    setLoading(false);
  };

  const handleAddQuestion = async () => {
    const payload = {
      ...newQuestion,
      options: newQuestion.options.map((opt, idx) => ({
        title: opt,
        is_correct: idx === newQuestion.correct_index ? 1 : 0
      }))
    };
    await fetch(`${api_startpoint}/api/add_quiz_question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setShowQuizModal(false);
    fetchData();
  };

  const confirmDeleteQuestion = (id: number) => {
    setQuestionToDelete(id);
    setConfirmDeleteQuiz(true);
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    await fetch(`${api_startpoint}/api/delete_quiz_question/${questionToDelete}`, {
      method: 'DELETE',
    });
    setConfirmDeleteQuiz(false);
    setQuestionToDelete(null);
    fetchData();
  };

  const openEditQuizModal = (q: QuizQuestion) => {
    setQuizToEdit(q);
    setShowQuizEditModal(true);
  };

  const handleUpdateQuiz = async () => {
    if (!quizToEdit) return;
    const payload = {
      ...quizToEdit,
      options: quizToEdit.options.map((opt, idx) => ({
        title: opt.title,
        is_correct: idx === quizToEdit.options.findIndex(o => o.is_answer === 1) ? 1 : 0
      }))
    };
    await fetch(`${api_startpoint}/api/update_quiz_question/${quizToEdit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setShowQuizEditModal(false);
    fetchData();
  };

  // Pagination calculations
  const indexOfLast = currentPage * questionsPerPage;
  const indexOfFirst = indexOfLast - questionsPerPage;
  const paginatedQuestions = questions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Topic management handlers
  const handleAddTopic = async () => {
    await fetch(`${api_startpoint}/api/add_topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTopic)
    });
    setShowTopicAddModal(false);
    fetch(`${api_startpoint}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        la_subject_id: selectedSubject,
        la_level_id: selectedLevel,
        status: selectedStatus,
      })
    })
      .then(res => res.json())
      .then(data => setTopics(Array.isArray(data) ? data : []));
  };

  const openEditTopicModal = (topic: Topic) => {
    setTopicToEdit(topic);
    setShowTopicEditModal(true);
  };

  const handleUpdateTopic = async () => {
    if (!topicToEdit) return;
    await fetch(`${api_startpoint}/api/update_topic/${topicToEdit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topicToEdit)
    });
    setShowTopicEditModal(false);
    fetch(`${api_startpoint}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        la_subject_id: selectedSubject,
        la_level_id: selectedLevel,
        status: selectedStatus,
      })
    })
      .then(res => res.json())
      .then(data => setTopics(Array.isArray(data) ? data : []));
  };

  const openDeleteTopicModal = (topic: Topic) => {
    setTopicToDelete(topic);
    setShowTopicDeleteModal(true);
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;
    await fetch(`${api_startpoint}/api/delete_topic/${topicToDelete.id}`, {
      method: 'DELETE',
    });
    setShowTopicDeleteModal(false);
    setTopicToDelete(null);
    fetch(`${api_startpoint}/api/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        la_subject_id: selectedSubject,
        la_level_id: selectedLevel,
        status: selectedStatus,
      })
    })
      .then(res => res.json())
      .then(data => setTopics(Array.isArray(data) ? data : []));
  };

  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: '250px' }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex flex-col">
                <h2 className="text-xl font-semibold pb-0 mb-0">Riddle Questions</h2>
                <h5 className="text-muted pb-0 mb-0">{questions.length} riddles found</h5>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowQuizModal(true)}>
                  <IconPlus className="me-2" /> Add New Riddle
                </button>
                {/* <button className="btn btn-info d-flex align-items-center" onClick={() => setShowTopicListModal(true)}>
                  Topics List
                </button>
                <button className="btn btn-secondary d-flex align-items-center" onClick={() => setShowTopicAddModal(true)}>
                  <IconPlus className="me-2" /> Add New Set/Topic
                </button> */}
              </div>
            </div>

            {/* Filter Steps */}
            {/* Step 1: Status Options */}
            <div className="d-flex flex-col mb-2">
                <h5 className='mb-1'>Select Status</h5>
                <div className="d-flex gap-3">
                    {["Active", "Inactive", "All"].map((statusOption) => {
                        // Map Active to "1", Inactive to "0", All to "all"
                        const value = statusOption === "All" ? "all" : statusOption === "Active" ? "1" : "0";
                        return (
                        <div
                            key={value}
                            onClick={() => setSelectedStatus(value)}
                            className={`p-2 border rounded ${
                            selectedStatus === value ? 'bg-primary text-white' : 'bg-light text-dark'
                            }`}
                            style={{ cursor: 'pointer' }}
                        >
                            {statusOption}
                        </div>
                        );
                    })}
                </div>
                
            </div>
            {/* Step 2: Subject Options */}
            {selectedStatus && (
                <div className="d-flex flex-col mb-2">
                    <h5 className='mb-1'>Select Subject</h5>
                    {subjectsLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-black"></div>
                    </div>
                    ) : (
                    <div className="d-flex flex-wrap gap-3">
                        {subjects.map((sub: Subject) => (
                        <div
                            key={sub.id}
                            onClick={() => setSelectedSubject(String(sub.id))}
                            className={`p-2 border rounded ${selectedSubject === String(sub.id) ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {JSON.parse(sub.title).en}
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            )}

            {/* Step 3: Level Options */}
            {selectedSubject && (
                <div className="d-flex flex-col mb-2">
                    <h5 className='mb-1'>Select Level</h5>
                    <div className="d-flex flex-wrap gap-3">
                        {levels.map((lv: Level) => (
                        <div
                            key={lv.id}
                            onClick={() => setSelectedLevel(String(lv.id))}
                            className={`p-2 border rounded ${selectedLevel === String(lv.id) ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {JSON.parse(lv.title).en}
                        </div>
                        ))}
                </div>
              </div>
            )}
            {/* Step 4: Topic/Set Options */}
            {selectedLevel && (
                <div className="d-flex flex-col mb-2">
                    <h5 className='mb-1'>Select Set/Topic</h5>
                    {topicsLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-black"></div>
                    </div>
                    ) : (
                    <div className="d-flex flex-wrap gap-3">
                        {topics.map((topic: Topic) => (
                        <div
                            key={topic.id}
                            onClick={() => setSelectedTopic(String(topic.id))}
                            className={`p-2 border rounded ${selectedTopic === String(topic.id) ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                            style={{ cursor: 'pointer' }}
                        >
                            {JSON.parse(topic.title).en}
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            )}


            {/* Quiz Questions */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-black text-blue"></div>
                </div>
            ) : (
              <div className="space-y-4">
                {paginatedQuestions.map((q: QuizQuestion) => (
                  <div key={q.id} className="card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <div className="fw-bold">{JSON.parse(q.question_title).en}</div>
                        <div className="text-muted small">
                          Subject: {JSON.parse(q.subject_title).en} | Level: {JSON.parse(q.level_title).en} | Topic: {q.topic_title ? JSON.parse(q.topic_title).en : 'N/A'} | Status: {q.status} | Index: {q.index}
                        </div>
                      </div>
                      <div>
                        <button className="btn btn-secondary me-2" onClick={() => openEditQuizModal(q)}>
                          <IconEdit /> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => confirmDeleteQuestion(q.id)}>
                          <IconTrash /> Delete
                        </button>
                      </div>
                    </div>
                    <div className="row">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="col-md-6">
                          <div className={`border rounded p-2 mb-2 ${opt.is_answer ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                            {JSON.parse(opt.title).en}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Quiz Modal */}
      {showQuizModal && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Riddle</h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Riddle Title</label>
                  <textarea className="form-control" value={newQuestion.question_title} onChange={(e) => setNewQuestion({ ...newQuestion, question_title: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={newQuestion.subject_id} onChange={(e) => setNewQuestion({ ...newQuestion, subject_id: e.target.value })}>
                    <option value=''>Select Subject</option>
                    {subjects.map((sub: Subject) => (
                      <option key={sub.id} value={sub.id}>{JSON.parse(sub.title).en}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={newQuestion.level_id} onChange={(e) => setNewQuestion({ ...newQuestion, level_id: e.target.value })}>
                    <option value=''>Select Level</option>
                    {levels.map((lv: Level) => (
                      <option key={lv.id} value={lv.id}>{JSON.parse(lv.title).en}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Topic/Set</label>
                  <select className="form-select" value={newQuestion.topic_id} onChange={(e) => setNewQuestion({ ...newQuestion, topic_id: e.target.value })}>
                    <option value=''>Select Topic</option>
                    {topics.map((topic: Topic) => (
                      <option key={topic.id} value={topic.id}>{JSON.parse(topic.title).en}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="mb-2">
                      <label className="form-label">Option {i + 1}</label>
                      <input className="form-control" value={opt} onChange={(e) => {
                        const newOpts = [...newQuestion.options];
                        newOpts[i] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOpts });
                      }} />
                    </div>
                  ))}
                </div>
                <div className="mb-2">
                  <label className="form-label">Correct Option</label>
                  <select className="form-select" value={newQuestion.correct_index} onChange={(e) => setNewQuestion({ ...newQuestion, correct_index: parseInt(e.target.value) })}>
                    {newQuestion.options.map((_, idx) => (
                      <option key={idx} value={idx}>Option {idx + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleAddQuestion}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showQuizEditModal && quizToEdit && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Riddle Question</h5>
                <button type="button" className="btn-close" onClick={() => setShowQuizEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Riddle Title</label>
                  <textarea className="form-control" value={quizToEdit.question_title} onChange={(e) =>
                    setQuizToEdit({ ...quizToEdit, question_title: e.target.value })
                  } />
                </div>
                <div className="mb-2">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={quizToEdit.status || "1"}
                    onChange={(e) => setQuizToEdit({ ...quizToEdit, status: e.target.value })}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                <div className="mb-2">
                  {quizToEdit.options.map((opt, i) => (
                    <div key={i} className="mb-2">
                      <label className="form-label">Option {i + 1}</label>
                      <input
                        className="form-control"
                        value={opt.title}
                        onChange={(e) => {
                          const newOptions = [...quizToEdit.options];
                          newOptions[i].title = e.target.value;
                          setQuizToEdit({ ...quizToEdit, options: newOptions });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-2">
                  <label className="form-label">Correct Option</label>
                  <select className="form-select" onChange={(e) => {
                    const correctIdx = parseInt(e.target.value);
                    const updatedOptions = quizToEdit.options.map((opt, idx) => ({
                      ...opt,
                      is_answer: idx === correctIdx ? 1 : 0
                    }));
                    setQuizToEdit({ ...quizToEdit, options: updatedOptions });
                  }}>
                    {quizToEdit.options.map((_, idx) => (
                      <option key={idx} value={idx}>Option {idx + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateQuiz}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Modal */}
      {confirmDeleteQuiz && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDeleteQuiz(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this Riddle?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmDeleteQuiz(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteQuestion}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topics List Modal */}
      {showTopicListModal && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Topics List</h5>
                <button type="button" className="btn-close" onClick={() => setShowTopicListModal(false)}></button>
              </div>
              <div className="modal-body">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Topic Title</th>
                      <th>Subject</th>
                      <th>Level</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic: Topic) => {
                      const subject = subjects.find((s: Subject) => String(s.id) === String(topic.la_subject_id));
                      const level = levels.find((l: Level) => String(l.id) === String(topic.la_level_id));
                      return (
                        <tr key={topic.id}>
                          <td>{topic.id}</td>
                          <td>{JSON.parse(topic.title).en}</td>
                          <td>{subject ? JSON.parse(subject.title).en : 'N/A'}</td>
                          <td>{level ? JSON.parse(level.title).en : 'N/A'}</td>
                          <td>{String(topic.status) === '1' ? 'Active' : 'Inactive'}</td>
                          <td>
                            <button className="btn btn-secondary btn-sm me-2" onClick={() => openEditTopicModal(topic)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => openDeleteTopicModal(topic)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowTopicListModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <input className="form-control" value={newTopic.title} onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={newTopic.la_subject_id || ""} onChange={(e) => setNewTopic({ ...newTopic, la_subject_id: e.target.value })}>
                    <option value=''>Select Subject</option>
                    {subjects.map((sub: Subject) => (
                      <option key={sub.id} value={sub.id}>{JSON.parse(sub.title).en}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={newTopic.la_level_id || ""} onChange={(e) => setNewTopic({ ...newTopic, la_level_id: e.target.value })}>
                    <option value=''>Select Level</option>
                    {levels.map((lv: Level) => (
                      <option key={lv.id} value={lv.id}>{JSON.parse(lv.title).en}</option>
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
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleAddTopic}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {showTopicEditModal && topicToEdit && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowTopicEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Topic Title</label>
                  <input className="form-control" value={topicToEdit.title || ""} onChange={(e) => setTopicToEdit({ ...topicToEdit!, title: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Subject</label>
                  <select className="form-select" value={topicToEdit.la_subject_id || ""} onChange={(e) => setTopicToEdit({ ...topicToEdit!, la_subject_id: e.target.value })}>
                    <option value=''>Select Subject</option>
                    {subjects.map((sub: Subject) => (
                      <option key={sub.id} value={sub.id}>{JSON.parse(sub.title).en}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={topicToEdit.la_level_id || ""} onChange={(e) => setTopicToEdit({ ...topicToEdit!, la_level_id: e.target.value })}>
                    <option value=''>Select Level</option>
                    {levels.map((lv: Level) => (
                      <option key={lv.id} value={lv.id}>{JSON.parse(lv.title).en}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={topicToEdit.status || "1"}
                    onChange={(e) => setTopicToEdit({ ...topicToEdit!, status: e.target.value })}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateTopic}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Topic Modal */}
      {showTopicDeleteModal && topicToDelete && (
        <div className="modal d-block bg-black bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowTopicDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the topic= {JSON.parse(topicToDelete.title).en}?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowTopicDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteTopic}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
