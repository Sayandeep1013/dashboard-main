"use client";
import React, { useState, useEffect, ChangeEvent, ReactPortal } from "react";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/ui/sidebar";
import "@tabler/core/dist/css/tabler.min.css";
import { IconEdit, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { ChevronDown } from "lucide-react";
import Error from "next/error";
import ReactDOM from "react-dom";

const inter = Inter({ subsets: ["latin"] });

// const api_startpoint = "http://localhost:5000";
// const api_startpoint = 'https://lifeapp-api-vv1.vercel.app'
// const api_startpoint = "http://152.42.239.141:5000";
// const api_startpoint = "http://152.42.239.141:5000";
const api_startpoint = "https://admin-api.life-lab.org";
// new startpoint added


// Helper to safely parse JSON title
function safeParseTitle(jsonString: string): string {
  if (typeof jsonString !== "string") {
    return "Invalid Title";
  }
  try {
    const parsed = JSON.parse(jsonString);
    return parsed.en || jsonString;
  } catch (e) {
    return jsonString; // Fallback to raw string if parsing fails
  }
}

interface Reference {
  id: number;
  title: string;
}

interface Campaign {
  id: number;
  game_type: number;
  reference_id: number;
  campaign_title: string;
  description: string;
  button_name?: string;
  scheduled_for: string;
  image_url?: string;
  status?: number;
  la_subject_id?: number | null;
  la_level_id?: number | null;
  topic_id?: number;
  media_id?: number;
}

interface PropTypes {
  mode: "add" | "edit";
  initial?: Campaign;
  onClose: () => void;
}

export default function AddCampaignModal({
  mode,
  initial,
  onClose,
}: PropTypes): ReactPortal {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initial?.campaign_title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState(initial?.status ?? 1);
  const [gameType, setGameType] = useState(initial?.game_type ?? 1);

  // Change to string for proper dropdown handling
  const [subjectId, setSubjectId] = useState<string>(
    initial?.la_subject_id?.toString() ?? "0"
  );
  const [levelId, setLevelId] = useState<string>(
    initial?.la_level_id?.toString() ?? "0"
  );
  const [topicId, setTopicId] = useState<string>(
    initial?.topic_id?.toString() ?? "0"
  );

  const [referenceId, setReferenceId] = useState(
    initial?.reference_id?.toString() ?? "0"
  );

  // normalize date
  function toYMD(raw?: string) {
    if (!raw) return "";
    const d = new Date(raw);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }
  const [scheduledFor, setScheduledFor] = useState(
    toYMD(initial?.scheduled_for)
  );

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial?.image_url ?? "");
  const [buttonName, setButtonName] = useState(initial?.button_name ?? "");

  const [subjects, setSubjects] = useState<Reference[]>([]);
  const [levels, setLevels] = useState<Reference[]>([]);
  const [topics, setTopics] = useState<Reference[]>([]);
  const [refs, setRefs] = useState<Reference[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);

  // Add loading states for subjects and levels
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Load campaign details when editing
  useEffect(() => {
    if (!isEdit) return; // only on edit
    fetch(`${api_startpoint}/api/campaigns/${initial!.id}`)
      .then((r) => r.json())
      .then((data: any) => {
        setTitle(data.campaign_title);
        setDescription(data.description);
        setStatus(data.status);
        setGameType(data.game_type);
        setSubjectId(String(data.la_subject_id || "0"));
        setLevelId(String(data.la_level_id || "0"));
        setTopicId(String(data.topic_id || "0"));
        setReferenceId(String(data.reference_id || "0"));
        setScheduledFor(toYMD(data.scheduled_for));
        setButtonName(data.button_name ?? "");
        setPreview(data.image_url ?? "");
        if (data.media_id) {
          initial!.media_id = data.media_id;
        }
      })
      .catch(console.error);
  }, [isEdit, initial]);

  useEffect(() => {
    // For "edit" mode,  fetch all subjects to ensure the assigned one is in the list.
    // For "add" mode, only fetch active subjects.
    setSubjectsLoading(true);
    const subjectParams = isEdit ? {} : { status: "1" };
    fetch(`${api_startpoint}/api/subjects_list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectParams),
    })
      .then((r) => r.json())
      .then(setSubjects)
      .finally(() => setSubjectsLoading(false));

    // Assuming levels don't have a status filter or it's not needed.
    setLevelsLoading(true);
    fetch(`${api_startpoint}/api/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then(setLevels)
      .finally(() => setLevelsLoading(false));
  }, [isEdit]); // Rerun if mode changes.

  useEffect(() => {
    if (gameType !== 2) return;
    setTopicsLoading(true);
    fetch(`${api_startpoint}/api/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        la_subject_id: Number(subjectId),
        la_level_id: Number(levelId),
        status: "1",
      }),
    })
      .then((r) => r.json())
      .then(setTopics)
      .finally(() => setTopicsLoading(false));
  }, [gameType, subjectId, levelId]);

  useEffect(() => {
    if (gameType === 2) {
      setReferenceId(topicId);
    }
  }, [topicId, gameType]);

  useEffect(() => {
    let url = "";
    let opts: RequestInit = { method: "GET" };

    if (gameType === 1) {
      url = `${api_startpoint}/api/mission_list`;
      opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 1,
          subject_id: Number(subjectId),
          level_id: Number(levelId),
        }),
      };
    } else if (gameType === 2) {
      url = `${api_startpoint}/api/quiz_list`;
      opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 1,
          subject_id: Number(subjectId),
          level_id: Number(levelId),
          topic_id: Number(topicId),
        }),
      };
    } else if (gameType === 7) {
      url = `${api_startpoint}/api/vision_list`;
      opts = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 1,
          subject_id: Number(subjectId),
          level_id: Number(levelId),
        }),
      };
    }

    if (!url) {
      setRefs([]);
      return;
    }

    setRefsLoading(true);
    console.log(" Calling API at:", url, opts);
    fetch(url, opts)
      .then((r) => r.json())
      .then((data: any[]) => {
        const list = data.map((i) => ({
          id: i.id,
          title: i.title || i.question_title,
        }));
        setRefs(list);
      })
      .finally(() => {
        setRefsLoading(false);
      });
  }, [gameType, subjectId, levelId, topicId]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const url = isEdit
      ? `${api_startpoint}/api/campaigns/${initial!.id}`
      : `${api_startpoint}/api/campaigns`;
    const method = isEdit ? "PUT" : "POST";
    let fetchOpts: RequestInit;

    if (image) {
      const fd = new FormData();
      fd.append("title", title); // Fixed field name
      fd.append("description", description);
      fd.append("status", String(status));
      fd.append("game_type", String(gameType));
      fd.append(
        "reference_id",
        String(gameType === 2 ? Number(topicId) : Number(referenceId))
      );
      fd.append("scheduled_for", scheduledFor);
      fd.append("button_name", buttonName);

      if ([1, 2, 7].includes(gameType)) {
        fd.append("la_subject_id", subjectId);
        fd.append("la_level_id", levelId);
      }

      if (gameType === 2) {
        fd.append("topic_id", topicId);
      }

      if (isEdit && initial?.id) {
        fd.append("id", String(initial.id));
      }

      fd.append("image", image);
      fetchOpts = { method, body: fd };
    } else {
      const payload: any = {
        title: title, // Fixed field name
        description,
        status,
        game_type: gameType,
        reference_id: gameType === 2 ? Number(topicId) : Number(referenceId),
        scheduled_for: scheduledFor,
        button_name: buttonName,
      };

      if ([1, 2, 7].includes(gameType)) {
        payload.la_subject_id = Number(subjectId);
        payload.la_level_id = Number(levelId);
      }

      if (gameType === 2) {
        payload.topic_id = Number(topicId);
      }

      if (initial?.media_id) {
        payload.media_id = initial.media_id;
      }

      if (isEdit && initial?.id) {
        payload.id = initial.id;
      }

      fetchOpts = {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };
    }

    console.log(" Calling API at:", url, fetchOpts);
    const res = await fetch(url, fetchOpts);

    if (res.ok) {
      onClose();
    } else {
      const errorData = await res.json().catch(() => null);
      alert(errorData?.message || "Error saving campaign");
    }
  };

  const modalContent = (
    <div className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <h2 className="text-xl mb-4">
              {isEdit ? "Edit Campaign" : "Add Campaign"}
            </h2>
            <label className="block mb-2">Title</label>
            <input
              className="input mb-3 w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="block mb-2">Description</label>
            <textarea
              className="textarea mb-3 w-full border p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label className="block mb-2">Status</label>
            <select
              className="select mb-3 w-full border p-2 rounded"
              value={status}
              onChange={(e) => setStatus(+e.target.value)}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
            <label className="block mb-2">Button Name</label>
            <input
              className="input mb-3 w-full border p-2 rounded"
              placeholder="e.g. Start, Play Now, Explore"
              value={buttonName}
              onChange={(e) => setButtonName(e.target.value)}
            />
            <label className="block mb-2">Game Type</label>
            <select
              className="select mb-3 w-full border p-2 rounded"
              value={gameType}
              onChange={(e) => {
                setGameType(+e.target.value);
                // Reset dependencies when game type changes
                setSubjectId("0");
                setLevelId("0");
                setTopicId("0");
                setReferenceId("0");
                setRefs([]);
              }}
            >
              <option value={1}>Mission</option>
              <option value={2}>Quiz</option>
              <option value={7}>Vision</option>
            </select>
            {(gameType === 1 || gameType === 2 || gameType === 7) && (
              <>
                <label className="block mb-1">Subject</label>
                <select
                  className="select mb-3 w-full border p-2 rounded"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={subjectsLoading}
                >
                  <option value="0">
                    {subjectsLoading ? "Loading subjects..." : "Select Subject"}
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {safeParseTitle(s.title)}
                    </option>
                  ))}
                </select>
                <label className="block mb-1">Level</label>
                <select
                  className="select mb-3 w-full border p-2 rounded"
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  disabled={levelsLoading}
                >
                  <option value="0">
                    {levelsLoading ? "Loading levels..." : "Select Level"}
                  </option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id.toString()}>
                      {safeParseTitle(l.title)}
                    </option>
                  ))}
                </select>
              </>
            )}
            {gameType === 2 && (
              <>
                <label className="block mb-1">Topic/Set</label>
                <select
                  className="select mb-3 w-full border p-2 rounded"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={topicsLoading || !subjectId || !levelId}
                >
                  <option value="0">
                    {topicsLoading ? "Loading topics..." : "Select Topic"}
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id.toString()}>
                      {safeParseTitle(t.title)}
                    </option>
                  ))}
                </select>
              </>
            )}
            {(gameType === 1 || gameType === 7) && (
              <>
                <label className="block mb-1">
                  {gameType === 1 ? "Select Mission" : "Select Vision"}
                </label>
                {refsLoading ? (
                  <div className="animate-spin rounded-full border-sky-800 border-t-2 w-3 h-3"></div>
                ) : (
                  <select
                    className="select mb-3 w-full border p-2 rounded"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  >
                    <option value="0">-- choose --</option>
                    {refs.map((r) => (
                      <option key={r.id} value={r.id.toString()}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
            <label className="block mb-2">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="mb-2"
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="h-20 w-20 object-cover rounded mb-4"
              />
            )}
            <label className="block mb-2">Schedule Date</label>
            <input
              className="input mb-4 w-full border p-2 rounded"
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={
                  !title ||
                  !scheduledFor ||
                  (gameType === 2 && topicId === "0") ||
                  ((gameType === 1 || gameType === 7) && referenceId === "0")
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
