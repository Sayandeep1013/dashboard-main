"use client";
import React, { useEffect, useState, useRef } from "react";
import { Inter } from "next/font/google";
import "@tabler/core/dist/css/tabler.min.css";
import { Sidebar } from "@/components/ui/sidebar";
import NumberFlow from "@number-flow/react";
import {
  IconEdit,
  IconPlus,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconCheck,
  IconSearch, // Added for potential filter icon
} from "@tabler/icons-react";
import Papa from "papaparse";

const inter = Inter({ subsets: ["latin"] });

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";

// --- Inject CSS styles for the new features and dropdown ---
const tableStyles = `
  <style>
    .table-container {
      position: relative;
    }
    .scroll-hint-left, .scroll-hint-right {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(111, 66, 193, 0.9); /* Purple color, adjust as needed */
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
      background: #f8f9fa; /* Or match your table header background */
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    /* Smooth scrolling */
    .smooth-scroll {
      scroll-behavior: smooth;
    }
    /* Searchable Dropdown Styles */
    .searchable-dropdown-container {
      position: relative;
      width: 100%;
    }
    .searchable-dropdown-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #fff;
      min-height: 38px;
      cursor: pointer;
    }
    .searchable-dropdown-placeholder {
      color: #999;
    }
    .searchable-dropdown-chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background-color: #dbeafe; /* blue-100 */
      color: #1e40af; /* blue-800 */
      border-radius: 9999px; /* full */
      font-size: 0.875rem; /* text-sm */
    }
    .searchable-dropdown-chip-remove {
      margin-left: 4px;
      cursor: pointer;
      color: #3b82f6; /* blue-500 */
    }
    .searchable-dropdown-chip-remove:hover {
      color: #1d4ed8; /* blue-700 */
    }
    .searchable-dropdown-list {
      position: absolute;
      z-index: 10;
      width: 100%;
      margin-top: 4px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
    }
    .searchable-dropdown-search-container {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    .searchable-dropdown-search {
      width: 100%;
      padding: 6px 12px 6px 30px; /* Space for icon */
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .searchable-dropdown-search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }
    .searchable-dropdown-item {
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .searchable-dropdown-item:hover {
      background-color: #f5f5f5;
    }
    .searchable-dropdown-item.selected {
      background-color: #eff6ff; /* blue-50 */
    }
    .searchable-dropdown-no-results {
      padding: 12px;
      text-align: center;
      color: #999;
    }
    /* Chapter Filter Styles */
    .chapter-filter-container {
      position: relative;
      width: 100%;
    }
    .chapter-filter-input {
      width: 100%;
      padding: 8px 12px 8px 32px; /* Space for icon */
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .chapter-filter-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }
    .chapter-filter-dropdown {
      position: absolute;
      z-index: 10;
      width: 100%;
      margin-top: 4px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-top: none; /* Seamless look with input */
      border-radius: 0 0 4px 4px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
    }
    .chapter-filter-item {
      padding: 8px 12px;
      cursor: pointer;
    }
    .chapter-filter-item:hover {
      background-color: #f5f5f5;
    }
    .chapter-filter-no-results {
      padding: 12px;
      text-align: center;
      color: #999;
    }
  </style>
`;

// Searchable Dropdown Component (used in Add/Edit Modal)
interface DropdownOption {
  id: number;
  title: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
}

function SearchableDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeOption = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    onChange(selected.filter((item) => item !== id));
  };

  return (
    <div className="searchable-dropdown-container" ref={dropdownRef}>
      {/* Dropdown Header/Selected Items Display */}
      <div
        className="searchable-dropdown-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="searchable-dropdown-placeholder">{placeholder}</span>
        ) : (
          selected.map((id) => {
            const option = options.find((opt) => opt.id === id);
            return option ? (
              <span key={id} className="searchable-dropdown-chip">
                {option.title}
                <span
                  className="searchable-dropdown-chip-remove"
                  onClick={(e) => removeOption(id, e)}
                >
                  &times;
                </span>
              </span>
            ) : null;
          })
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="searchable-dropdown-list">
          {/* Search Input */}
          <div className="searchable-dropdown-search-container">
            {/* <IconSearch size={16} className="searchable-dropdown-search-icon" /> */}
            <input
              type="text"
              className="searchable-dropdown-search"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          {/* Options List */}
          <div>
            {filteredOptions.length === 0 ? (
              <div className="searchable-dropdown-no-results">
                No chapters found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`searchable-dropdown-item ${
                    selected.includes(option.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  <span>{option.title}</span>
                  {selected.includes(option.id) && (
                    <IconCheck size={16} className="text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Chapter Filter Component for the main table
interface ChapterFilterProps {
  chapters: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

function ChapterFilter({ chapters, value, onChange }: ChapterFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter chapters based on the searchTerm (like the modal dropdown)
  const filteredOptions = chapters.filter((option) =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectOption = (title: string) => {
    onChange(title);
    setIsOpen(false);
    setSearchTerm(""); // Clear search term on selection
  };

  return (
    <div className="chapter-filter-container" ref={dropdownRef}>
      <div className="relative">
        <IconSearch size={16} className="chapter-filter-icon" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value); // Update the filter value (triggers API call)
            setSearchTerm(e.target.value); // Update the search term for filtering the dropdown
          }}
          placeholder="Search chapters..."
          className="chapter-filter-input"
          onFocus={() => setIsOpen(true)}
          // Optional: Close dropdown if input is cleared and loses focus
          // onBlur={(e) => {
          //   // Delay to allow click on dropdown item to register
          //   setTimeout(() => setIsOpen(false), 150);
          // }}
        />
      </div>
      {isOpen && (
        <div className="chapter-filter-dropdown">
          {filteredOptions.length === 0 ? (
            <div className="chapter-filter-no-results">No chapters found</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="chapter-filter-item"
                onClick={() => selectOption(option.title)}
              >
                {option.title}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ModalProps {
  mode: "add" | "edit";
  initial?: VisionRow;
  onClose: () => void;
  onSuccess: () => void;
}
interface QuestionPayload {
  question_id?: number;
  question_type: "mcq" | "reflection" | "image";
  question: string;
  options?: { a: string; b: string; c: string; d: string };
  correct_answer?: string;
}
function AddEditModal({ mode, initial, onClose, onSuccess }: ModalProps) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [you, setYou] = useState(initial?.youtube_url || "");
  const [forAll, setForAll] = useState(
    initial ? initial.allow_for.toString() : "1"
  );
  const [subj, setSubj] = useState(initial?.subject_id?.toString() || "");
  const [lvl, setLvl] = useState(initial?.level_id?.toString() || "");
  const [stat, setStat] = useState(initial?.status.toString() || "1");
  const [mcqInputMode, setMcqInputMode] = useState<"manual" | "csv">("manual");
  const [subjTitle, setSubjTitle] = useState(
    initial?.subject?.toString() || ""
  );
  const [lvlTitle, setLvlTitle] = useState(initial?.level?.toString() || "");
  const [questionType, setQuestionType] = useState<
    "mcq" | "reflection" | "image"
  >(initial?.questions?.[0]?.question_type || "mcq");
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]); // Added for chapter selection
  const [chapters, setChapters] = useState<DropdownOption[]>([]); // Added for chapter options
  const [mcqQ, setMcqQ] = useState("");
  const [mcqOpts, setMcqOpts] = useState({ a: "", b: "", c: "", d: "" });
  const [mcqAns, setMcqAns] = useState("");
  const [refQ, setRefQ] = useState("");
  const [imgQ, setImgQ] = useState("");
  const initialMcq = isEdit
    ? initial?.questions
        .filter((q: QuestionPayload) => q.question_type === "mcq")
        .map((q: QuestionPayload) => ({
          question: q.question,
          options: q.options ?? { a: "", b: "", c: "", d: "" },
          correct_answer: q.correct_answer ?? "",
        }))
    : [
        {
          question: "",
          options: { a: "", b: "", c: "", d: "" },
          correct_answer: "",
        },
      ];
  const [mcqList, setMcqList] = useState(
    initialMcq || [
      {
        question: "",
        options: { a: "", b: "", c: "", d: "" },
        correct_answer: "",
      },
    ]
  );
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (result) => {
        const parsed = result.data as string[][];
        const cleaned = parsed
          .filter((row) => row.length >= 6)
          .map((row) => ({
            question: row[0]?.trim(),
            options: {
              a: row[1]?.trim(),
              b: row[2]?.trim(),
              c: row[3]?.trim(),
              d: row[4]?.trim(),
            },
            correct_answer: row[5]?.trim().toLowerCase(),
          }));
        setMcqList(cleaned);
      },
      skipEmptyLines: true,
    });
  };
  const [index, setIndex] = useState<number>(initial?.index || 1);
  const initialSingle = isEdit
    ? initial?.questions.find((q) => q.question_type !== "mcq")?.question ?? ""
    : "";
  const [singleQ, setSingleQ] = useState(initialSingle);
  const addMcq = () => {
    if (mcqList.length < 5) {
      setMcqList([
        ...mcqList,
        {
          question: "",
          options: { a: "", b: "", c: "", d: "" },
          correct_answer: "",
        },
      ]);
    }
  };
  const removeMcq = (idx: number) => {
    setMcqList(mcqList.filter((_, i) => i !== idx));
  };
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "1" }),
    })
      .then((r) => r.json())
      .then((fetchedSubjects) => {
        setSubjects(fetchedSubjects);
        if (isEdit && initial) {
          const foundSubject = fetchedSubjects.find(
            (s: { title: string }) => JSON.parse(s.title).en === initial.subject
          );
          if (foundSubject) {
            setSubj(foundSubject.id.toString());
            setSubjTitle(JSON.parse(foundSubject.title).en);
          }
        }
      });
    fetch(`${api_startpoint}/api/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1 }),
    })
      .then((r) => r.json())
      .then((fetchedLevels) => {
        setLevels(fetchedLevels);
        if (isEdit && initial) {
          const foundLevel = fetchedLevels.find(
            (l: { title: string }) => JSON.parse(l.title).en === initial.level
          );
          if (foundLevel) {
            setLvl(foundLevel.id.toString());
            setLvlTitle(JSON.parse(foundLevel.title).en);
          }
        }
      });
    // Fetch chapters for dropdown
    fetch(`${api_startpoint}/api/chapters`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((chaptersData) => {
        // Ensure chaptersData is an array of DropdownOption
        if (Array.isArray(chaptersData)) {
          setChapters(chaptersData);
          // Set selected chapters in edit mode
          if (isEdit && initial && initial.chapters) {
            // Extract chapter IDs from the initial data
            // This assumes initial.chapters is an array of strings (chapter titles)
            // We need to find the IDs for these titles
            const selectedIds = chaptersData
              .filter((chapter: DropdownOption) =>
                initial.chapters?.includes(chapter.title)
              )
              .map((chapter: DropdownOption) => chapter.id);
            setSelectedChapters(selectedIds);
          }
        } else {
          console.error(
            "API response for chapters is not an array:",
            chaptersData
          );
          setChapters([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chapters:", error);
        setChapters([]); // Set to empty array on error
      });
    if (isEdit && initial) {
      initial.questions.forEach((q) => {
        if (q.question_type === "mcq") {
          setMcqQ(q.question);
          setMcqOpts(q.options || { a: "", b: "", c: "", d: "" });
          setMcqAns(q.correct_answer || "");
        } else if (q.question_type === "reflection") {
          setRefQ(q.question);
        } else if (q.question_type === "image") {
          setImgQ(q.question);
        }
      });
    }
  }, [isEdit, initial]);
  const handleSave = async () => {
    setLoading(true);
    const questions: QuestionPayload[] = [];
    if (questionType === "mcq") {
      mcqList.forEach(
        (q: { question: any; options: any; correct_answer: any }) => {
          if (q.question) {
            questions.push({
              question_type: "mcq",
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
            });
          }
        }
      );
    } else {
      questions.push({ question_type: questionType, question: singleQ });
    }
    if (!subj || !lvl || !title || !desc) {
      alert("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    const payload = {
      title,
      description: desc,
      youtube_url: you,
      allow_for: forAll,
      subject_id: subj,
      level_id: lvl,
      status: stat,
      index: Number(index) || 1,
      questions,
      chapter_ids: selectedChapters, // Add selected chapters to payload
    };
    const url = isEdit
      ? `${api_startpoint}/api/visions/${initial!.vision_id}`
      : `${api_startpoint}/api/visions`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert("Save failed");
    }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit" : "Add"} Vision
        </h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border p-2 rounded mb-2"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded mb-2"
        />
        <input
          value={you}
          onChange={(e) => setYou(e.target.value)}
          placeholder="YouTube URL"
          className="w-full border p-2 rounded mb-2"
        />
        <select
          value={forAll}
          onChange={(e) => setForAll(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="1">All</option>
          <option value="2">Teacher</option>
          <option value="3">Student</option>
        </select>
        <select
          value={subj}
          onChange={(e) => {
            setSubj(e.target.value);
            const selectedSubject = subjects.find(
              (s) => s.id.toString() === e.target.value
            );
            if (selectedSubject) {
              setSubjTitle(JSON.parse(selectedSubject.title).en);
            }
          }}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {JSON.parse(s.title).en}
            </option>
          ))}
        </select>
        <select
          value={lvl}
          onChange={(e) => {
            setLvl(e.target.value);
            const selectedLevel = levels.find(
              (l) => l.id.toString() === e.target.value
            );
            if (selectedLevel) {
              setLvlTitle(JSON.parse(selectedLevel.title).en);
            }
          }}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="">Select Level</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {JSON.parse(l.title).en}
            </option>
          ))}
        </select>
        {/* Chapter Selection Dropdown - FIXED */}
        <div className="mb-2">
          <label className="block mb-1">Chapters</label>
          <SearchableDropdown
            options={chapters}
            selected={selectedChapters}
            onChange={setSelectedChapters}
            placeholder="Select chapters..."
          />
        </div>
        <select
          value={stat}
          onChange={(e) => setStat(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <label className="block mb-2">Index Position</label>
        <input
          type="number"
          min="1"
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="w-full border p-2 rounded"
          placeholder="Enter index position"
        />
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as any)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="mcq">MCQ</option>
          <option value="reflection">Reflection</option>
          <option value="image">Image</option>
        </select>
        {questionType === "mcq" && (
          <div className="border p-3 rounded mb-4">
            <select
              value={mcqInputMode}
              onChange={(e) =>
                setMcqInputMode(e.target.value as "manual" | "csv")
              }
              className="w-full border p-2 rounded mb-4"
            >
              <option value="manual">Upload Manually</option>
              <option value="csv">Upload via CSV</option>
            </select>
            {mcqInputMode === "manual" && (
              <>
                {mcqList.map((q, idx) => (
                  <div key={idx} className="mcq-entry">
                    <textarea
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...mcqList];
                        updated[idx].question = e.target.value;
                        setMcqList(updated);
                      }}
                      placeholder={`Question ${idx + 1}`}
                      className="w-full border p-2 rounded mb-2"
                    />
                    {(["a", "b", "c", "d"] as const).map((opt) => (
                      <input
                        key={opt}
                        placeholder={`Option ${opt}`}
                        value={q.options[opt]}
                        onChange={(e) => {
                          const updated = [...mcqList];
                          updated[idx].options[opt] = e.target.value;
                          setMcqList(updated);
                        }}
                        className="w-full border p-2 rounded mb-1"
                      />
                    ))}
                    <select
                      value={q.correct_answer}
                      onChange={(e) => {
                        const updated = [...mcqList];
                        updated[idx].correct_answer = e.target.value;
                        setMcqList(updated);
                      }}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select Correct</option>
                      {["a", "b", "c", "d"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    {mcqList.length > 1 && (
                      <button onClick={() => removeMcq(idx)}>
                        <IconTrash />
                      </button>
                    )}
                  </div>
                ))}
                {mcqList.length < 5 && (
                  <button onClick={addMcq} className="add-btn">
                    <IconPlus /> Add another question
                  </button>
                )}
              </>
            )}
            {mcqInputMode === "csv" && (
              <div className="border p-3 rounded bg-gray-50">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="mb-2"
                />
                <div>
                  <a
                    href="/MCQtemplate.csv"
                    download="MCQtemplate.csv"
                    className="btn btn-outline-secondary"
                  >
                    Download CSV Template
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        {questionType === "reflection" && (
          <textarea
            value={singleQ}
            onChange={(e) => setSingleQ(e.target.value)}
            placeholder="Reflection question"
            className="w-full border p-2 mb-2 rounded"
          />
        )}
        {questionType === "image" && (
          <input
            type="text"
            value={singleQ}
            onChange={(e) => setSingleQ(e.target.value)}
            placeholder="Image question URL or prompt"
            className="w-full border p-2 mb-2 rounded"
          />
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-sky-700 text-white rounded flex items-center"
          >
            {loading && (
              <span className="animate-spin rounded-full w-3 h-3 border-white border-t-2 mr-2" />
            )}
            {loading ? "Saving.." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
interface VisionRow {
  vision_id: number;
  title: string;
  description: string;
  youtube_url: string | null;
  allow_for: 1 | 2 | 3;
  subject_id: number;
  subject: string;
  level: string;
  level_id: number;
  status: number;
  index?: number;
  questions: QuestionPayload[];
  chapters?: string[]; // Added chapters field
}
export default function VisionsPage() {
  const [rows, setRows] = useState<VisionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fStatus, setFStatus] = useState<string>("");
  const [fSubject, setFSubject] = useState<string>("");
  const [fLevel, setFLevel] = useState<string>("");
  const [fAllowFor, setFAllowFor] = useState<string>(""); // Added for allow_for filter
  const [fChapter, setFChapter] = useState<string>(""); // Added for chapter search
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editRow, setEditRow] = useState<VisionRow | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [chapters, setChapters] = useState<DropdownOption[]>([]); // State for chapters data for filter
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [visionToDelete, setVisionToDelete] = useState<VisionRow | null>(null);
  // --- Refs for table scrolling functionality ---
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(true);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 25;
  // --- Update scroll hints based on current scroll position ---
  const updateScrollHints = () => {
    const container = tableContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftHint(scrollLeft > 10);
      setShowRightHint(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  // --- Handle scroll events to show/hide scroll hints ---
  const handleTableScroll = () => {
    updateScrollHints();
  };
  // --- Scroll table horizontally with larger increments and smooth behavior ---
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
  async function fetchVisions() {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      per_page: perPage.toString(),
    });
    if (fStatus) params.set("status", fStatus);
    if (fSubject) params.set("subject_id", fSubject);
    if (fLevel) params.set("level_id", fLevel);
    if (fAllowFor) params.set("allow_for", fAllowFor); // Added for allow_for filter
    if (fChapter) params.set("chapter", fChapter); // Added for chapter search
    try {
      const url = `${api_startpoint}/api/visions?${params}`;
      console.log("Fetch URL:", url);
      const res = await fetch(url);
      console.log("Response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`API responded with ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      console.log("API response ", data);
      // Determine if we're using the paginated endpoint
      const isPaginatedEndpoint =
        api_startpoint.includes("localhost") ||
        (data.hasOwnProperty("visions") && data.hasOwnProperty("total"));
      let visions, total;
      if (isPaginatedEndpoint) {
        // Localhost-style response: { visions: [...], total: X }
        visions = data.visions || [];
        total = data.total || 0;
      } else {
        // Global endpoint: plain array
        visions = Array.isArray(data) ? data : [];
        total = visions.length;
        // Implement client-side pagination
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        visions = visions.slice(startIndex, endIndex);
      }
      setRows(visions);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / perPage));
      // --- Reset scroll hints when new data loads ---
      setTimeout(() => {
        updateScrollHints();
      }, 100);
    } catch (error: any) {
      console.error("Fetch error:", error);
      alert(`Failed to load visions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }
  const handleDelete = async () => {
    if (!visionToDelete) return;
    try {
      await fetch(`${api_startpoint}/api/visions/${visionToDelete.vision_id}`, {
        method: "DELETE",
      });
      fetchVisions();
      setShowDeleteModal(false);
      setVisionToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete vision");
    }
  };
  // Handle filter changes and reset pagination
  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "status") setFStatus(value);
    if (filter === "subject") setFSubject(value);
    if (filter === "level") setFLevel(value);
    if (filter === "allow_for") setFAllowFor(value); // Added for allow_for filter
    // Note: fChapter is handled directly by the ChapterFilter component
    setCurrentPage(1); // Reset to first page
  };
  useEffect(() => {
    fetchVisions();
  }, [fStatus, fSubject, fLevel, fAllowFor, fChapter, currentPage]); // Added fChapter dependency
  useEffect(() => {
    // Fetch subjects and levels
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "1" }),
    })
      .then((res) => res.json())
      .then(setSubjects);
    fetch(`${api_startpoint}/api/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1 }),
    })
      .then((res) => res.json())
      .then(setLevels);

    // Fetch chapters for the filter dropdown
    fetch(`${api_startpoint}/api/chapters`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((chaptersData) => {
        // Ensure chaptersData is an array of DropdownOption
        if (Array.isArray(chaptersData)) {
          setChapters(chaptersData);
        } else {
          console.error(
            "API response for chapters is not an array:",
            chaptersData
          );
          setChapters([]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chapters for filter:", error);
        setChapters([]); // Set to empty array on error
      });
  }, []);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  // Generate visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = startPage + maxVisible - 1;
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };
  return (
    <div className={`page bg-body ${inter.className} font-sans`}>
      {/* Inject CSS styles */}
      <div dangerouslySetInnerHTML={{ __html: tableStyles }} />
      <Sidebar />
      <div
        className="page-wrapper"
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          padding: "1rem",
        }}
      >
        <div className="page-body">
          <div className="container-xl pt-4 pb-4 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="card w-40">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="subheader">Total Visions</div>
                      <div className="h1 mb-0">
                        <NumberFlow
                          value={totalCount}
                          className="fw-semi-bold text-dark"
                          transformTiming={{
                            endDelay: 6,
                            duration: 750,
                            easing: "cubic-bezier(0.42, 0, 0.58, 1)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="flex flex-wrap gap-3">
                <select
                  value={fStatus}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="border p-2 rounded text-sm"
                >
                  <option value="">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                <select
                  value={fSubject}
                  onChange={(e) =>
                    handleFilterChange("subject", e.target.value)
                  }
                  className="border p-2 rounded text-sm"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={String(subject.id)}>
                      {JSON.parse(subject.title).en}
                    </option>
                  ))}
                </select>
                <select
                  value={fLevel}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="border p-2 rounded text-sm"
                >
                  <option value="">All Levels</option>
                  {levels.map((level) => (
                    <option key={level.id} value={String(level.id)}>
                      {JSON.parse(level.title).en}
                    </option>
                  ))}
                </select>
                {/* Added allow_for filter */}
                <select
                  value={fAllowFor}
                  onChange={(e) =>
                    handleFilterChange("allow_for", e.target.value)
                  }
                  className="border p-2 rounded text-sm"
                >
                  <option value="">All Users</option>
                  <option value="1">All</option>
                  <option value="2">Teacher</option>
                  <option value="3">Student</option>
                </select>
                {/* Replaced chapter search input with ChapterFilter component */}
                <div className="w-48">
                  {" "}
                  {/* Added a fixed width for consistency */}
                  <ChapterFilter
                    chapters={chapters}
                    value={fChapter}
                    onChange={setFChapter} // Directly updates fChapter state
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-sky-600 text-white px-4 py-2 rounded h-fit"
              >
                Add Vision
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full w-12 h-12 border-t-2 border-sky-800"></div>
              </div>
            ) : (
              <>
                {/* --- Table container with scroll hints --- */}
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
                  {/* --- Table with sticky headers, smooth scrolling, and boxed view (shadow, rounded) --- */}
                  <div
                    ref={tableContainerRef}
                    className="overflow-x-scroll smooth-scroll rounded-lg shadow bg-white" // Added bg-white for boxed view consistency
                    onScroll={handleTableScroll}
                    style={{ maxHeight: "70vh", overflowY: "auto" }} // Optional: vertical scrolling with max height
                  >
                    <table className="w-full table-auto table-sticky-header">
                      {" "}
                      {/* Added table-sticky-header class */}
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                            Serial No.
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                            Title
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px] max-w-[300px]">
                            Description
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                            YouTube
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                            Allow For
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                            Subject
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                            Level
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                            Chapters
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                            Status
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                            Details
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                            Index
                          </th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rows.length > 0 ? (
                          rows.map((r, index) => (
                            <React.Fragment key={r.vision_id}>
                              <tr className="hover:bg-gray-50">
                                <td className="p-3 text-sm min-w-[60px]">
                                  {(currentPage - 1) * perPage + index + 1}
                                </td>
                                <td className="p-3 text-sm min-w-[200px]">
                                  {r.title}
                                </td>
                                <td
                                  className="p-3 text-sm min-w-[300px] max-w-[300px] whitespace-normal break-words overflow-y-auto max-h-32"
                                  style={{ wordBreak: "break-word" }}
                                >
                                  {r.description}
                                </td>
                                <td className="p-3 text-sm min-w-[150px]">
                                  {r.youtube_url ? (
                                    <a
                                      href={r.youtube_url}
                                      target="_blank"
                                      className="text-sky-600 hover:underline"
                                    >
                                      Link
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="p-3 text-sm min-w-[100px]">
                                  {r.allow_for === 1
                                    ? "All"
                                    : r.allow_for === 2
                                    ? "Teacher"
                                    : "Student"}
                                </td>
                                <td className="p-3 text-sm min-w-[150px]">
                                  {r.subject}
                                </td>
                                <td className="p-3 text-sm min-w-[150px]">
                                  {r.level}
                                </td>
                                <td className="p-3 text-sm min-w-[150px]">
                                  {r.chapters ? r.chapters.join(", ") : "-"}
                                </td>
                                <td className="p-3 text-sm min-w-[100px]">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      r.status === 1
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {r.status === 1 ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="p-3 text-sm min-w-[120px]">
                                  <button
                                    onClick={() =>
                                      setExpanded((e) => ({
                                        ...e,
                                        [r.vision_id]: !e[r.vision_id],
                                      }))
                                    }
                                    className="text-sky-600 hover:text-sky-800"
                                  >
                                    {expanded[r.vision_id]
                                      ? "Hide Details"
                                      : "Show Details"}
                                  </button>
                                </td>
                                <td className="p-3 text-sm min-w-[80px]">
                                  {r.index || "-"}
                                </td>
                                <td className="p-3 text-sm min-w-[120px]">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditRow(r);
                                        setShowEdit(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <IconEdit size={18} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setVisionToDelete(r);
                                        setShowDeleteModal(true);
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <IconTrash size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {expanded[r.vision_id] && (
                                <tr>
                                  <td colSpan={12} className="p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {r.questions.map((q) => (
                                        <div
                                          key={q.question_id}
                                          className="bg-white p-4 rounded-lg shadow"
                                        >
                                          <div className="font-semibold text-gray-700">
                                            [{q.question_type.toUpperCase()}{" "}
                                            Question]
                                          </div>
                                          <div className="mt-2">
                                            {q.question}
                                          </div>
                                          {q.question_type === "mcq" &&
                                            q.options && (
                                              <ul className="mt-3 space-y-2">
                                                {Object.entries(q.options).map(
                                                  ([k, opt]) => (
                                                    <li
                                                      key={k}
                                                      className="flex items-start"
                                                    >
                                                      <span className="font-medium mr-2">
                                                        {k.toUpperCase()}:
                                                      </span>
                                                      <span>
                                                        {opt}
                                                        {q.correct_answer ===
                                                          k && (
                                                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                            Correct
                                                          </span>
                                                        )}
                                                      </span>
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            )}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={12}
                              className="p-8 text-center text-gray-500"
                            >
                              No visions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex flex-col items-center mt-4">
                    <div className="text-sm text-gray-700 mb-2">
                      Showing {(currentPage - 1) * perPage + 1} to{" "}
                      {Math.min(currentPage * perPage, totalCount)} of{" "}
                      {totalCount} entries
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className={`px-3 py-1 border rounded ${
                          currentPage === 1 || loading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Previous
                      </button>
                      {getPageNumbers().map((page, index) =>
                        typeof page === "number" ? (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === page
                                ? "bg-sky-600 text-white"
                                : "bg-white hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={`ellipsis-${index}`} className="px-3 py-1">
                            {page}
                          </span>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 border rounded ${
                          currentPage === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {showDeleteModal && visionToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">
                    Confirm Deletion
                  </h2>
                  <p className="mb-6">
                    Are you sure you want to delete{" "}
                    <strong>{visionToDelete.title}</strong>?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setVisionToDelete(null);
                      }}
                      className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showAdd && (
              <AddEditModal
                mode="add"
                onClose={() => setShowAdd(false)}
                onSuccess={() => {
                  setShowAdd(false);
                  fetchVisions();
                }}
              />
            )}
            {showEdit && editRow && (
              <AddEditModal
                mode="edit"
                initial={editRow}
                onClose={() => {
                  setShowEdit(false);
                  setEditRow(null);
                }}
                onSuccess={() => {
                  setShowEdit(false);
                  fetchVisions();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
