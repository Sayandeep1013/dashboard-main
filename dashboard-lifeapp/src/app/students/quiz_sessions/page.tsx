"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/ui/sidebar";
import "@tabler/core/dist/css/tabler.min.css";
import NumberFlow from "@number-flow/react";
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";

import { IconLoader2 } from "@tabler/icons-react";

const inter = Inter({ subsets: ["latin"] });
// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";
// Add CSS styles for the new features
const tableStyles = `
  <style>
    .table-container {
      position: relative;
    }
    
    .scroll-hint-left, .scroll-hint-right {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(111, 66, 193, 0.9);
      color: white;
      padding: 12px 16px;
      border-radius: 10%; /* Changed from 50% to 10% as requested */
      cursor: pointer;
      z-index: 5;
      transition: opacity 0.3s;
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .scroll-hint-left {
      left: 15px;
    }
    
    .scroll-hint-right {
      right: 15px;
    }
    
    .scroll-hint-hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    /* Sticky table header */
    .table-sticky-header thead th {
      position: sticky;
      top: 0;
      background: #f8f9fa;
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    /* Smooth scrolling */
    .smooth-scroll {
      scroll-behavior: smooth;
    }
  </style>
`;

interface QuizSession {
  id: number;
  user_id: number;
  game_id: number;
  subject_title: string;
  level_title: string;
  topic_title: string;
  time_taken: number;
  total_questions: number;
  total_correct_answers: number;
  user_name: string;
  school_name: string;
  earn_coins: number;
  heart_coins: number;
  brain_coins: number;
  created_at: string;
  coins: number;
}

interface QuestionDetail {
  game_code: string;
  question_id: number;
  question_title: string;
  la_level_id: number;
  la_topic_id: number;
  game_type: string;
  question_type: string;
  is_answer: number;
  answer_option: string;
}

interface QuestionWithAnswer {
  question_position: number;
  question_id: number;
  question_title: string; // JSON string, e.g. '{"en":"..."}'
  option_id: number;
  option_text: string; // JSON string, e.g. '{"en":"..."}'
  is_correct_option: number; // 1 or 0
  selected_by_user: number; // 1 or 0
  user_is_correct: number; // 1 or 0 (same for all options of this question)
  coins_awarded: number; // coins for that question
}

interface ExpandedQuestionsProps {
  questions: QuestionWithAnswer[];
}

function ExpandedQuestions({ questions }: ExpandedQuestionsProps) {
  // Group by question_position
  const byQuestion = React.useMemo(() => {
    const map: Record<
      number,
      {
        title: string;
        user_is_correct: boolean;
        coins_awarded: number;
        options: QuestionWithAnswer[];
      }
    > = {};

    for (const q of questions) {
      if (!map[q.question_position]) {
        map[q.question_position] = {
          title: JSON.parse(q.question_title).en,
          user_is_correct: q.user_is_correct === 1 && q.selected_by_user === 1,
          coins_awarded: q.coins_awarded,
          options: [],
        };
      }
      map[q.question_position].options.push(q);
    }

    // Convert to array and preserve order
    return Object.values(map).sort(
      (a, b) => a.options[0].question_position - b.options[0].question_position
    );
  }, [questions]);

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6">
      {byQuestion.map((q, idx) => {
        // Find the correct answer text
        const correctOpt = q.options.find((opt) => opt.is_correct_option === 1);
        const correctText = correctOpt
          ? JSON.parse(correctOpt.option_text).en
          : "—";

        return (
          <div key={idx} className="p-4 border rounded shadow bg-white">
            {/* Question Title */}
            <div className="text-lg font-semibold mb-2">{q.title}</div>

            {/* Options: highlight only the one the user selected */}
            <div className="flex flex-wrap gap-2 mb-2">
              {q.options.map((opt) => {
                const isSelected = opt.selected_by_user === 1;
                const isRight = opt.is_correct_option === 1;

                // default neutral style
                let bg = "bg-gray-200 text-gray-800";
                if (isSelected) {
                  bg = isRight
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white";
                }

                return (
                  <div
                    key={opt.option_id}
                    className={`px-3 py-1 rounded ${bg}`}
                  >
                    {JSON.parse(opt.option_text).en}
                  </div>
                );
              })}
            </div>

            {/* Feedback line */}
            <div className="text-sm mb-1">
              {q.user_is_correct
                ? `✅ You answered correctly and earned ${q.coins_awarded} coins.`
                : `❌ Incorrect — you earned ${q.coins_awarded} coins.`}
            </div>

            {/* Always show the correct answer */}
            <div className="text-sm font-medium">
              Correct answer:{" "}
              <span className="text-blue-600">{correctText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentRelatedQuizSessions() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [quizData, setQuizData] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [perPage] = useState(25); // match backend default/cap
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [topics, setTopics] = useState<{ id: number; title: string }[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const [uniqueUserCount, setUniqueUserCount] = useState<number>(0);
  const [uniqueSchoolCount, setUniqueSchoolCount] = useState<number>(0);

  // Refs for table scrolling functionality
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(true);

  // Fetch quiz sessions using the new API query
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${api_startpoint}/api/quiz_sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
            la_subject_id: selectedSubjectId,
            la_level_id: selectedLevelId,
            la_topic_id: selectedTopicId,
            page: page,
            per_page: perPage,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || res.statusText);
        setQuizData(json.data);
        setTotalPages(json.total_pages);
        setTotalRows(json.total);
        setUniqueUserCount(json.unique_user_count);
        setUniqueSchoolCount(json.unique_school_count);

        // Reset scroll hints when new data loads
        setTimeout(() => {
          updateScrollHints();
        }, 100);
      } catch (err) {
        console.error("Failed to load quiz session data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    startDate,
    endDate,
    selectedSubjectId,
    selectedLevelId,
    selectedTopicId,
    page,
  ]);

  // Update scroll hints based on current scroll position
  const updateScrollHints = () => {
    const container = tableContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftHint(scrollLeft > 10);
      setShowRightHint(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Handle scroll events to show/hide scroll hints
  const handleTableScroll = () => {
    updateScrollHints();
  };

  // Scroll table horizontally with larger increments and smooth behavior
  const scrollTableHorizontally = (direction: "left" | "right") => {
    if (tableContainerRef.current) {
      const container = tableContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of viewport width

      container.scrollTo({
        left:
          direction === "left"
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });

      // Update hints after scroll
      setTimeout(updateScrollHints, 300);
    }
  };

  // Compute unique subjects
  // const subjects = useMemo(() => {
  //   const uniq = new Set(quizData.map(q => JSON.parse(q.subject_title).en));
  //   return Array.from(uniq);
  // }, [quizData]);

  const [subjects, setSubjects] = useState<{ id: number; title: string }[]>([]);
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/subjects_list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "1" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || res.statusText);
        setSubjects(json);
      } catch (err) {
        console.error("Failed to Load subjects data", err);
      }
    };
    fetchSubjects();
  }, []);

  // Compute levels available for the selected subject
  // const levels = useMemo(() => {
  //   if (!selectedSubject) return [];
  //   const filtered = quizData.filter(q => JSON.parse(q.subject_title).en === selectedSubject);
  //   const uniq = new Set(filtered.map(q => JSON.parse(q.level_title).en));
  //   return Array.from(uniq);
  // }, [quizData, selectedSubject]);

  const [levels, setLevels] = useState<{ id: number; title: string }[]>([]);
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch(`${api_startpoint}/api/levels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || res.statusText);
        setLevels(json);
      } catch (err) {
        console.error("Failed to Load subjects data", err);
      }
    };
    fetchLevels();
  }, []);

  // Compute topics available for the selected subject and level
  useEffect(() => {
    // only fetch once both IDs are set
    if (selectedSubjectId && selectedLevelId) {
      fetch(`${api_startpoint}/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          la_subject_id: selectedSubjectId,
          la_level_id: selectedLevelId,
          status: "1", // or whatever you need
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          // assume API returns [ { id, title, ... } ]
          // if title is JSON, parse it:
          const parsed = json.map((t: any) => ({
            id: t.id,
            title: JSON.parse(t.title).en,
          }));
          setTopics(parsed);
        })
        .catch((err) => {
          console.error("Failed to load topics", err);
          setTopics([]);
        });
    } else {
      setTopics([]);
    }
  }, [selectedSubjectId, selectedLevelId]);

  // Filter table data based on selected filters
  // const filteredData = useMemo(() => {
  //   let data = quizData;
  //   if (selectedSubject) {
  //     data = data.filter(q => JSON.parse(q.subject_title).en === selectedSubject);
  //   }
  //   if (selectedLevel) {
  //     data = data.filter(q => JSON.parse(q.level_title).en === selectedLevel);
  //   }
  //   if (selectedTopic) {
  //     data = data.filter(q => JSON.parse(q.topic_title).en === selectedTopic);
  //   }
  //   return data;
  // }, [quizData, selectedSubject, selectedLevel, selectedTopic]);

  // Pagination of filtered data
  // const indexOfLast = currentPage * itemsPerPage;
  // const indexOfFirst = indexOfLast - itemsPerPage;
  // const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  // const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // controls
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  // Handle filter resets when higher level changes
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedLevel("");
    setSelectedTopic("");
    setPage(1);
  };
  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setSelectedTopic("");
    setPage(1);
  };
  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setPage(1);
  };

  // Add this to your component's state
  const hasActiveFilters = selectedSubject || selectedLevel || selectedTopic;

  // Add this function to handle clearing filters
  const handleClearFilters = () => {
    setSelectedSubject("");
    setSelectedLevel("");
    setSelectedTopic("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };
  const exportToCSV = () => {
    const csvContent = [
      Object.keys(quizData[0]).join(","), // Header
      ...quizData.map((item) =>
        Object.values({
          ...item,
          subject_title: JSON.parse(item.subject_title).en,
          level_title: JSON.parse(item.level_title).en,
          topic_title: JSON.parse(item.topic_title).en,
        })
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-sessions.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      {/* Inject CSS styles */}
      <div dangerouslySetInnerHTML={{ __html: tableStyles }} />

      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-4">
            <h2 className="text-xl font-semibold">Quiz Game Sessions</h2>

            {/* Filter Section */}
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <h5 className="mb-0">Select Subject</h5>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubjectId(subject.id);
                        setSelectedSubject(JSON.parse(subject.title).en);
                        // reset lower‐level filters:
                        setSelectedLevel("");
                        setSelectedLevelId(null);
                        setSelectedTopic("");
                        setSelectedTopicId(null);
                        setPage(1);
                      }}
                      className={`cursor-pointer px-3 py-1 rounded border ${
                        selectedSubject === JSON.parse(subject.title).en
                          ? "bg-sky-800 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {JSON.parse(subject.title).en}
                    </div>
                  ))}
                </div>
              </div>
              {selectedSubject && levels.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h5 className="mb-0">Select Level</h5>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                      <div
                        key={level.id}
                        onClick={() => {
                          setSelectedLevelId(level.id);
                          setSelectedLevel(JSON.parse(level.title).en);
                          setSelectedTopic("");
                          setSelectedTopicId(null);
                          setPage(1);
                        }}
                        className={`cursor-pointer px-3 py-1 rounded border ${
                          selectedLevel === JSON.parse(level.title).en
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {JSON.parse(level.title).en}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedSubject && selectedLevel && topics.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h5 className="mb-0">Select Topic</h5>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setSelectedTopic(topic.title);
                          setPage(1);
                        }}
                        className={`cursor-pointer px-3 py-1 rounded border ${
                          selectedTopic === topic.title
                            ? "bg-indigo-800 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {topic.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Filters & Export Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Left: clear‑filters (only if active) */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 rounded border bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}

              {/* Right: date pickers */}
              <div className="flex gap-4 flex-wrap items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border rounded p-1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border rounded p-1"
                  />
                </div>

                {/* Export button, vertically centered by items-center on parent */}
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Export to CSV
                </button>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <div className="bg-white shadow rounded p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Total Game Sessions
                </div>
                <NumberFlow
                  value={totalRows}
                  className="text-2xl font-bold text-gray-800"
                  transformTiming={{
                    endDelay: 6,
                    duration: 750,
                    easing: "cubic-bezier(0.42, 0, 0.58, 1)",
                  }}
                />
              </div>
              <div className="bg-white shadow rounded p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Unique Students
                </div>
                <NumberFlow
                  value={uniqueUserCount}
                  className="text-2xl font-bold text-gray-800"
                  transformTiming={{
                    endDelay: 6,
                    duration: 750,
                    easing: "cubic-bezier(0.42, 0, 0.58, 1)",
                  }}
                />
              </div>

              <div className="bg-white shadow rounded p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Unique Schools
                </div>
                <NumberFlow
                  value={uniqueSchoolCount}
                  className="text-2xl font-bold text-gray-800"
                  transformTiming={{
                    endDelay: 6,
                    duration: 750,
                    easing: "cubic-bezier(0.42, 0, 0.58, 1)",
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <IconLoader2 className="animate-spin" />
              </div>
            ) : (
              <>
                <div className="table-container">
                  {/* Scroll hints for visual indication - larger buttons with significant scroll */}
                  <button
                    className={`scroll-hint-left ${
                      !showLeftHint ? "scroll-hint-hidden" : ""
                    }`}
                    onClick={() => scrollTableHorizontally("left")}
                    aria-label="Scroll left"
                  >
                    <IconChevronLeft size={24} />
                  </button>
                  <button
                    className={`scroll-hint-right ${
                      !showRightHint ? "scroll-hint-hidden" : ""
                    }`}
                    onClick={() => scrollTableHorizontally("right")}
                    aria-label="Scroll right"
                  >
                    <IconChevronRight size={24} />
                  </button>

                  {/* Table with sticky headers and smooth scrolling */}
                  <div
                    ref={tableContainerRef}
                    className="overflow-x-scroll smooth-scroll rounded-lg shadow"
                    onScroll={handleTableScroll}
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                  >
                    <table className="table table-vcenter card-table w-full table-auto min-w-full bg-white border border-gray-200 table-sticky-header">
                      <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                        <tr>
                          <th className="text-left">User ID</th>
                          <th className="text-left">Game ID</th>
                          <th className="text-left">Subject</th>
                          <th className="text-left">Level</th>
                          <th className="text-left">Topic</th>
                          <th className="text-left">Time Taken</th>
                          <th className="text-left">Total Q</th>
                          <th className="text-left">Correct Q</th>
                          <th className="text-left">Created At</th>
                          <th className="text-left">Coins</th>
                          <th className="text-left">User Name</th>
                          <th className="text-left">School</th>
                          <th className="text-left">Earn Coins</th>
                          <th className="text-left">Heart Coins</th>
                          <th className="text-left">Brain Coins</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700">
                        {quizData.map((entry, index) => (
                          <tr key={`${entry.id}-${index}`} className="border-t">
                            <td>{entry.user_id}</td>
                            <td>{entry.game_id}</td>
                            <td>{JSON.parse(entry.subject_title).en}</td>
                            <td>{JSON.parse(entry.level_title).en}</td>
                            <td>{JSON.parse(entry.topic_title).en}</td>
                            <td>{entry.time_taken}</td>
                            <td>{entry.total_questions}</td>
                            <td>{entry.total_correct_answers}</td>
                            <td>{entry.created_at}</td>
                            <td>{entry.coins}</td>
                            <td>{entry.user_name}</td>
                            <td>{entry.school_name}</td>
                            <td>{entry.earn_coins}</td>
                            <td>{entry.heart_coins}</td>
                            <td>{entry.brain_coins}</td>
                            {/* Expanded row portion commented out
                            {expandedRow === entry.game_id && (
                              <tr key={`${entry.user_id}-${entry.game_id}-expanded`}>
                                <td colSpan={13} className="p-0">
                                  <div className="bg-gray-50 py-4 border-t border-b">
                                    {questionsLoading ? (
                                      <div className="flex justify-center py-4">
                                        <IconLoader2 className="animate-spin" />
                                      </div>
                                    ) : (
                                      <ExpandedQuestions questions={questions} />
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                            */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={goPrev}
                    disabled={page === 1}
                    className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {page} of {totalPages} ({totalRows} total)
                  </span>
                  <button
                    onClick={goNext}
                    disabled={page === totalPages}
                    className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
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
  );
}
