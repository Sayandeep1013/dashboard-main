"use client";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Inter } from "next/font/google";
import "@tabler/core/dist/css/tabler.min.css";
import { Sidebar } from "@/components/ui/sidebar";
import NumberFlow from "@number-flow/react";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import Papa from "papaparse";

const inter = Inter({ subsets: ["latin"] });
// const api_startpoint = "http://localhost:5000";
const api_startpoint = "http://152.42.239.141:5000";

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
}

export default function VisionsPage() {
  const [rows, setRows] = useState<VisionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fStatus, setFStatus] = useState<string>("");
  const [fSubject, setFSubject] = useState<string>("");
  const [fLevel, setFLevel] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editRow, setEditRow] = useState<VisionRow | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [visionToDelete, setVisionToDelete] = useState<VisionRow | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 30;

  async function fetchVisions() {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      per_page: perPage.toString(),
    });

    if (fStatus) params.set("status", fStatus);
    if (fSubject) params.set("subject_id", fSubject);
    if (fLevel) params.set("level_id", fLevel);

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
      console.log("API response data:", data);

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
    setCurrentPage(1); // Reset to first page
  };

  useEffect(() => {
    fetchVisions();
  }, [fStatus, fSubject, fLevel, currentPage]);

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
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                  <table className="w-full table-auto">
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
                                <td colSpan={11} className="p-4 bg-gray-50">
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
                                        <div className="mt-2">{q.question}</div>
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
                            colSpan={11}
                            className="p-8 text-center text-gray-500"
                          >
                            No visions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
