import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Clock3,
  Command,
  LayoutGrid,
  ListTodo,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

/**
 * Massive Single-File TypeScript React App
 * ---------------------------------------
 * Purpose:
 * - A large, self-contained app in one file for testing/editor stress/use.
 * - Stores data in localStorage.
 * - Includes tasks, notes, analytics, settings, filters, command palette,
 *   seeded demo data, import/export, keyboard shortcuts, and a lot of UI state.
 *
 * This is intentionally one file.
 */

type Priority = "low" | "medium" | "high";
type TaskStatus = "todo" | "doing" | "done";
type ThemeMode = "light" | "dark" | "system";
type Density = "compact" | "comfortable" | "spacious";
type AppTab = "dashboard" | "tasks" | "notes" | "analytics" | "settings";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  tags: string[];
  estimateHours: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

type Note = {
  id: string;
  title: string;
  body: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

type AppSettings = {
  theme: ThemeMode;
  density: Density;
  autoSeed: boolean;
  showCompletedTasks: boolean;
  defaultPriority: Priority;
  accent: string;
};

type AppState = {
  tasks: Task[];
  notes: Note[];
  settings: AppSettings;
};

type TaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  estimateHours: number;
  tags: string;
};

type NoteDraft = {
  title: string;
  body: string;
  color: string;
  pinned: boolean;
  tags: string;
};

const STORAGE_KEY = "massive-single-file-app:v1";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  density: "comfortable",
  autoSeed: true,
  showCompletedTasks: true,
  defaultPriority: "medium",
  accent: "violet",
};

const ACCENTS = [
  "violet",
  "blue",
  "emerald",
  "amber",
  "rose",
  "fuchsia",
  "cyan",
];

const NOTE_COLORS = [
  "bg-yellow-100 dark:bg-yellow-900/40",
  "bg-blue-100 dark:bg-blue-900/40",
  "bg-emerald-100 dark:bg-emerald-900/40",
  "bg-pink-100 dark:bg-pink-900/40",
  "bg-violet-100 dark:bg-violet-900/40",
  "bg-orange-100 dark:bg-orange-900/40",
];

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function todayInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(value: string | null): string {
  if (!value) return "No date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function relativeDate(value: string | null): string {
  if (!value) return "No due date";
  const due = new Date(value);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "Due yesterday";
  if (diffDays > 1) return `Due in ${diffDays} days`;
  return `${Math.abs(diffDays)} days overdue`;
}

function cls(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function seedTasks(): Task[] {
  const today = todayInputValue();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const toInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const rows: Array<Omit<Task, "id" | "createdAt" | "updatedAt">> = [
    {
      title: "Define product scope",
      description: "List MVP features, constraints, and what is explicitly not included.",
      status: "doing",
      priority: "high",
      dueDate: today,
      tags: ["planning", "mvp"],
      estimateHours: 3,
      completedAt: null,
    },
    {
      title: "Write auth flow tests",
      description: "Validate signup, login, logout, and protected route access.",
      status: "todo",
      priority: "high",
      dueDate: toInput(tomorrow),
      tags: ["testing", "auth"],
      estimateHours: 5,
      completedAt: null,
    },
    {
      title: "Refactor shared utilities",
      description: "Centralize repeated helpers and reduce duplicated logic.",
      status: "todo",
      priority: "medium",
      dueDate: toInput(nextWeek),
      tags: ["refactor", "core"],
      estimateHours: 4,
      completedAt: null,
    },
    {
      title: "Polish landing page copy",
      description: "Replace placeholder sections with concise product messaging.",
      status: "done",
      priority: "low",
      dueDate: today,
      tags: ["marketing", "copy"],
      estimateHours: 2,
      completedAt: nowIso(),
    },
    {
      title: "Set up analytics dashboard",
      description: "Track completion rates, active work, and notes volume.",
      status: "doing",
      priority: "medium",
      dueDate: toInput(nextWeek),
      tags: ["analytics", "dashboard"],
      estimateHours: 6,
      completedAt: null,
    },
  ];

  return rows.map((row) => ({
    ...row,
    id: uid("task"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

function seedNotes(): Note[] {
  const rows: Array<Omit<Note, "id" | "createdAt" | "updatedAt">> = [
    {
      title: "Ideas",
      body: "Keep the scope narrow. Ship a small app that does a few things well instead of pretending to solve everything.",
      color: NOTE_COLORS[0],
      pinned: true,
      tags: ["thinking", "product"],
    },
    {
      title: "Testing",
      body: "Integration tests prove systems interact correctly. Unit tests prove isolated logic does what it claims.",
      color: NOTE_COLORS[1],
      pinned: true,
      tags: ["tests", "engineering"],
    },
    {
      title: "Reminder",
      body: "Do not let the dashboard become more important than the work it is meant to track.",
      color: NOTE_COLORS[2],
      pinned: false,
      tags: ["discipline"],
    },
  ];

  return rows.map((row) => ({
    ...row,
    id: uid("note"),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

function createInitialState(): AppState {
  return {
    tasks: seedTasks(),
    notes: seedNotes(),
    settings: DEFAULT_SETTINGS,
  };
}

function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const state: AppState = {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
    };
    if (state.tasks.length === 0 && state.notes.length === 0 && state.settings.autoSeed) {
      return createInitialState();
    }
    return state;
  } catch {
    return createInitialState();
  }
}

function writeState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sortTasks(tasks: Task[]): Task[] {
  const priorityWeight: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };
  const statusWeight: Record<TaskStatus, number> = {
    doing: 3,
    todo: 2,
    done: 1,
  };

  return [...tasks].sort((a, b) => {
    const statusDiff = statusWeight[b.status] - statusWeight[a.status];
    if (statusDiff !== 0) return statusDiff;

    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function useSystemDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return dark;
}

function accentClasses(accent: string): { border: string; bg: string; text: string; ring: string } {
  const map: Record<string, { border: string; bg: string; text: string; ring: string }> = {
    violet: {
      border: "border-violet-500",
      bg: "bg-violet-500",
      text: "text-violet-500",
      ring: "ring-violet-500/30",
    },
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-500",
      text: "text-blue-500",
      ring: "ring-blue-500/30",
    },
    emerald: {
      border: "border-emerald-500",
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      ring: "ring-emerald-500/30",
    },
    amber: {
      border: "border-amber-500",
      bg: "bg-amber-500",
      text: "text-amber-500",
      ring: "ring-amber-500/30",
    },
    rose: {
      border: "border-rose-500",
      bg: "bg-rose-500",
      text: "text-rose-500",
      ring: "ring-rose-500/30",
    },
    fuchsia: {
      border: "border-fuchsia-500",
      bg: "bg-fuchsia-500",
      text: "text-fuchsia-500",
      ring: "ring-fuchsia-500/30",
    },
    cyan: {
      border: "border-cyan-500",
      bg: "bg-cyan-500",
      text: "text-cyan-500",
      ring: "ring-cyan-500/30",
    },
  };

  return map[accent] || map.violet;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-black/50 dark:text-white/50">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-black/50 dark:text-white/40">{subtitle}</div>
        </div>
        <div className="rounded-2xl border border-black/10 p-3 dark:border-white/10">{icon}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-black/50 dark:text-white/50">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 px-2.5 py-1 text-xs dark:border-white/10">
      {children}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const style =
    priority === "high"
      ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
      : priority === "medium"
      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return <span className={cls("rounded-full border px-2 py-1 text-xs font-medium", style)}>{priority}</span>;
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const style =
    status === "done"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "doing"
      ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
      : "border-white/0 bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/70";
  return <span className={cls("rounded-full border px-2 py-1 text-xs font-medium", style)}>{status}</span>;
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-black/15 bg-black/[0.02] p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-md">
        <div className="text-lg font-medium">{title}</div>
        <p className="mt-2 text-sm text-black/55 dark:text-white/50">{body}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(handle);
  }, [value, ms]);
  return debounced;
}

export default function MassiveSingleFileApp() {
  const [state, setState] = useState<AppState>(() => readState());
  const [tab, setTab] = useState<AppTab>("dashboard");
  const [taskSearch, setTaskSearch] = useState("");
  const debouncedTaskSearch = useDebouncedValue(taskSearch, 180);
  const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | TaskStatus>("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<"all" | Priority>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const systemDark = useSystemDark();
  const isDark = state.settings.theme === "dark" || (state.settings.theme === "system" && systemDark);
  const accent = accentClasses(state.settings.accent);
  const exportRef = useRef<HTMLAnchorElement | null>(null);

  const [taskDraft, setTaskDraft] = useState<TaskDraft>({
    title: "",
    description: "",
    priority: state.settings.defaultPriority,
    dueDate: "",
    estimateHours: 1,
    tags: "",
  });

  const [noteDraft, setNoteDraft] = useState<NoteDraft>({
    title: "",
    body: "",
    color: NOTE_COLORS[0],
    pinned: false,
    tags: "",
  });

  useEffect(() => {
    writeState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
      }
      if (isMeta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setShowTaskModal(true);
        setEditingTaskId(null);
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setShowTaskModal(false);
        setShowNoteModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const tags = useMemo(() => {
    const set = new Set<string>();
    state.tasks.forEach((task) => task.tags.forEach((tag) => set.add(tag)));
    return ["all", ...Array.from(set).sort()];
  }, [state.tasks]);

  const visibleTasks = useMemo(() => {
    const lower = debouncedTaskSearch.trim().toLowerCase();
    return sortTasks(
      state.tasks.filter((task) => {
        if (!state.settings.showCompletedTasks && task.status === "done") return false;
        if (taskStatusFilter !== "all" && task.status !== taskStatusFilter) return false;
        if (taskPriorityFilter !== "all" && task.priority !== taskPriorityFilter) return false;
        if (selectedTag !== "all" && !task.tags.includes(selectedTag)) return false;
        if (!lower) return true;
        return [task.title, task.description, task.tags.join(" ")].join(" ").toLowerCase().includes(lower);
      })
    );
  }, [state.tasks, debouncedTaskSearch, taskStatusFilter, taskPriorityFilter, selectedTag, state.settings.showCompletedTasks]);

  const visibleNotes = useMemo(() => {
    return [...state.notes].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [state.notes]);

  const stats = useMemo(() => {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.status === "done").length;
    const doing = state.tasks.filter((t) => t.status === "doing").length;
    const todo = state.tasks.filter((t) => t.status === "todo").length;
    const overdue = state.tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate).getTime() < new Date(todayInputValue()).getTime();
    }).length;
    const totalHours = state.tasks.reduce((sum, task) => sum + task.estimateHours, 0);
    return { total, done, doing, todo, overdue, totalHours };
  }, [state.tasks]);

  const chartData = useMemo(
    () => [
      { name: "Todo", value: stats.todo },
      { name: "Doing", value: stats.doing },
      { name: "Done", value: stats.done },
    ],
    [stats.todo, stats.doing, stats.done]
  );

  const priorityData = useMemo(
    () => [
      { name: "High", count: state.tasks.filter((t) => t.priority === "high").length },
      { name: "Medium", count: state.tasks.filter((t) => t.priority === "medium").length },
      { name: "Low", count: state.tasks.filter((t) => t.priority === "low").length },
    ],
    [state.tasks]
  );

  const velocityData = useMemo(() => {
    const days = 7;
    const result: Array<{ day: string; created: number; completed: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { weekday: "short" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      result.push({
        day: key,
        created: state.tasks.filter((t) => {
          const ts = new Date(t.createdAt).getTime();
          return ts >= dayStart && ts < dayEnd;
        }).length,
        completed: state.tasks.filter((t) => {
          if (!t.completedAt) return false;
          const ts = new Date(t.completedAt).getTime();
          return ts >= dayStart && ts < dayEnd;
        }).length,
      });
    }
    return result;
  }, [state.tasks]);

  const commandActions = [
    { id: "go_dashboard", label: "Go to Dashboard", action: () => setTab("dashboard") },
    { id: "go_tasks", label: "Go to Tasks", action: () => setTab("tasks") },
    { id: "go_notes", label: "Go to Notes", action: () => setTab("notes") },
    { id: "go_analytics", label: "Go to Analytics", action: () => setTab("analytics") },
    { id: "go_settings", label: "Go to Settings", action: () => setTab("settings") },
    {
      id: "new_task",
      label: "Create New Task",
      action: () => {
        setEditingTaskId(null);
        resetTaskDraft();
        setShowTaskModal(true);
      },
    },
    {
      id: "new_note",
      label: "Create New Note",
      action: () => {
        setEditingNoteId(null);
        resetNoteDraft();
        setShowNoteModal(true);
      },
    },
    {
      id: "seed_demo",
      label: "Reset With Demo Data",
      action: () => {
        setState(createInitialState());
        setToast("Demo data restored");
      },
    },
    {
      id: "export_json",
      label: "Export JSON Backup",
      action: () => exportJson(),
    },
  ];

  const filteredCommandActions = useMemo(() => {
    const q = commandSearch.trim().toLowerCase();
    if (!q) return commandActions;
    return commandActions.filter((item) => item.label.toLowerCase().includes(q));
  }, [commandActions, commandSearch]);

  function resetTaskDraft() {
    setTaskDraft({
      title: "",
      description: "",
      priority: state.settings.defaultPriority,
      dueDate: "",
      estimateHours: 1,
      tags: "",
    });
  }

  function resetNoteDraft() {
    setNoteDraft({
      title: "",
      body: "",
      color: NOTE_COLORS[0],
      pinned: false,
      tags: "",
    });
  }

  function parseTags(raw: string): string[] {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  function addTask() {
    if (!taskDraft.title.trim()) return;
    const next: Task = {
      id: uid("task"),
      title: taskDraft.title.trim(),
      description: taskDraft.description.trim(),
      priority: taskDraft.priority,
      status: "todo",
      dueDate: taskDraft.dueDate || null,
      estimateHours: Math.max(1, Number(taskDraft.estimateHours) || 1),
      tags: parseTags(taskDraft.tags),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    };
    setState((prev) => ({ ...prev, tasks: [next, ...prev.tasks] }));
    setShowTaskModal(false);
    resetTaskDraft();
    setToast("Task created");
  }

  function saveTaskEdit() {
    if (!editingTaskId || !taskDraft.title.trim()) return;
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title: taskDraft.title.trim(),
              description: taskDraft.description.trim(),
              priority: taskDraft.priority,
              dueDate: taskDraft.dueDate || null,
              estimateHours: Math.max(1, Number(taskDraft.estimateHours) || 1),
              tags: parseTags(taskDraft.tags),
              updatedAt: nowIso(),
            }
          : task
      ),
    }));
    setEditingTaskId(null);
    setShowTaskModal(false);
    resetTaskDraft();
    setToast("Task updated");
  }

  function addNote() {
    if (!noteDraft.title.trim() && !noteDraft.body.trim()) return;
    const next: Note = {
      id: uid("note"),
      title: noteDraft.title.trim() || "Untitled",
      body: noteDraft.body.trim(),
      color: noteDraft.color,
      pinned: noteDraft.pinned,
      tags: parseTags(noteDraft.tags),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setState((prev) => ({ ...prev, notes: [next, ...prev.notes] }));
    setShowNoteModal(false);
    resetNoteDraft();
    setToast("Note created");
  }

  function saveNoteEdit() {
    if (!editingNoteId) return;
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === editingNoteId
          ? {
              ...note,
              title: noteDraft.title.trim() || "Untitled",
              body: noteDraft.body.trim(),
              color: noteDraft.color,
              pinned: noteDraft.pinned,
              tags: parseTags(noteDraft.tags),
              updatedAt: nowIso(),
            }
          : note
      ),
    }));
    setEditingNoteId(null);
    setShowNoteModal(false);
    resetNoteDraft();
    setToast("Note updated");
  }

  function toggleTaskStatus(id: string) {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => {
        if (task.id !== id) return task;
        const nextStatus: TaskStatus =
          task.status === "todo" ? "doing" : task.status === "doing" ? "done" : "todo";
        return {
          ...task,
          status: nextStatus,
          updatedAt: nowIso(),
          completedAt: nextStatus === "done" ? nowIso() : null,
        };
      }),
    }));
  }

  function deleteTask(id: string) {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((task) => task.id !== id) }));
    setToast("Task deleted");
  }

  function deleteNote(id: string) {
    setState((prev) => ({ ...prev, notes: prev.notes.filter((note) => note.id !== id) }));
    setToast("Note deleted");
  }

  function openEditTask(task: Task) {
    setEditingTaskId(task.id);
    setTaskDraft({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate || "",
      estimateHours: task.estimateHours,
      tags: task.tags.join(", "),
    });
    setShowTaskModal(true);
  }

  function openEditNote(note: Note) {
    setEditingNoteId(note.id);
    setNoteDraft({
      title: note.title,
      body: note.body,
      color: note.color,
      pinned: note.pinned,
      tags: note.tags.join(", "),
    });
    setShowNoteModal(true);
  }

  function togglePinNote(id: string) {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned, updatedAt: nowIso() } : note
      ),
    }));
  }

  function exportJson() {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = exportRef.current;
    if (link) {
      link.href = url;
      link.download = "massive-single-file-app-backup.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 250);
      setToast("Backup exported");
    }
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppState;
        if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.notes)) {
          throw new Error("Invalid file");
        }
        setState({
          tasks: parsed.tasks,
          notes: parsed.notes,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        });
        setToast("Backup imported");
      } catch {
        setToast("Import failed");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const densityClasses =
    state.settings.density === "compact"
      ? "gap-3"
      : state.settings.density === "spacious"
      ? "gap-6"
      : "gap-4";

  const tabButton = (id: AppTab, label: string, icon: React.ReactNode) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      className={cls(
        "flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition",
        tab === id
          ? cls("border-transparent text-white", accent.bg)
          : "border-black/10 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className={cls(isDark ? "dark" : "", "min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-white")}>
      <a ref={exportRef} className="hidden" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium dark:border-white/10 dark:bg-white/5">
              <Sparkles className="h-3.5 w-3.5" />
              Massive Single-File TS App
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Work Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-black/60 dark:text-white/50">
              One file. Real state. Local persistence. Tasks, notes, analytics, settings, and enough moving parts to stress an editor without turning into nonsense.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <Command className="h-4 w-4" />
              Command Palette
              <span className="rounded-md border border-black/10 px-1.5 py-0.5 text-xs dark:border-white/10">Ctrl/Cmd + K</span>
            </button>
            <button
              onClick={() => {
                setEditingTaskId(null);
                resetTaskDraft();
                setShowTaskModal(true);
              }}
              className={cls("inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-white shadow-sm", accent.bg)}
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabButton("dashboard", "Dashboard", <LayoutGrid className="h-4 w-4" />)}
          {tabButton("tasks", "Tasks", <ListTodo className="h-4 w-4" />)}
          {tabButton("notes", "Notes", <StickyNote className="h-4 w-4" />)}
          {tabButton("analytics", "Analytics", <BarChart3 className="h-4 w-4" />)}
          {tabButton("settings", "Settings", <Settings className="h-4 w-4" />)}
        </div>

        <AnimatePresence mode="wait">
          {tab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cls("grid grid-cols-1", densityClasses)}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Tasks" value={stats.total} subtitle="All tracked work items" icon={<ListTodo className="h-5 w-5" />} />
                <StatCard title="Completed" value={stats.done} subtitle="Tasks marked done" icon={<CheckCircle2 className="h-5 w-5" />} />
                <StatCard title="In Progress" value={stats.doing} subtitle="Current active tasks" icon={<Clock3 className="h-5 w-5" />} />
                <StatCard title="Estimated Hours" value={stats.totalHours} subtitle="Across all tasks" icon={<BarChart3 className="h-5 w-5" />} />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 xl:col-span-2">
                  <SectionTitle title="Recent Tasks" subtitle="Sorted by status, priority, and due date" action={<Pill>{visibleTasks.length} visible</Pill>} />
                  {visibleTasks.length === 0 ? (
                    <EmptyState title="No tasks found" body="Change filters or create a new task." />
                  ) : (
                    <div className="space-y-3">
                      {visibleTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <button onClick={() => toggleTaskStatus(task.id)} className="shrink-0">
                                  {task.status === "done" ? <CheckCircle2 className={cls("h-5 w-5", accent.text)} /> : <Circle className="h-5 w-5 text-black/40 dark:text-white/40" />}
                                </button>
                                <div className="truncate text-base font-medium">{task.title}</div>
                              </div>
                              <p className="mt-2 line-clamp-2 text-sm text-black/55 dark:text-white/50">{task.description || "No description"}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <StatusBadge status={task.status} />
                                <PriorityBadge priority={task.priority} />
                                <Pill>{relativeDate(task.dueDate)}</Pill>
                                {task.tags.map((tag) => (
                                  <Pill key={tag}>#{tag}</Pill>
                                ))}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button onClick={() => openEditTask(task)} className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10">Edit</button>
                              <button onClick={() => deleteTask(task.id)} className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <SectionTitle title="Pinned Notes" subtitle="Fast reference cards" />
                  <div className="space-y-3">
                    {visibleNotes.filter((note) => note.pinned).length === 0 ? (
                      <EmptyState title="No pinned notes" body="Pin a note to keep it visible on the dashboard." />
                    ) : (
                      visibleNotes
                        .filter((note) => note.pinned)
                        .slice(0, 4)
                        .map((note) => (
                          <div key={note.id} className={cls("rounded-2xl border border-black/10 p-4 dark:border-white/10", note.color)}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-medium">{note.title}</div>
                                <p className="mt-2 line-clamp-4 text-sm text-black/70 dark:text-white/70">{note.body}</p>
                              </div>
                              <button onClick={() => openEditNote(note)} className="rounded-xl border border-black/10 bg-white/60 px-2 py-1 text-xs dark:border-white/10 dark:bg-black/20">Edit</button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <SectionTitle
                  title="Tasks"
                  subtitle="Filter, edit, and track your work"
                  action={
                    <button
                      onClick={() => {
                        setEditingTaskId(null);
                        resetTaskDraft();
                        setShowTaskModal(true);
                      }}
                      className={cls("rounded-2xl px-4 py-2 text-sm text-white", accent.bg)}
                    >
                      Add Task
                    </button>
                  }
                />

                <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
                  <div className="relative lg:col-span-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35 dark:text-white/35" />
                    <input
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder="Search tasks"
                      className="w-full rounded-2xl border border-black/10 bg-white/80 py-2.5 pl-10 pr-4 text-sm outline-none ring-0 dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  </div>
                  <select value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value as any)} className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <option value="all">All statuses</option>
                    <option value="todo">Todo</option>
                    <option value="doing">Doing</option>
                    <option value="done">Done</option>
                  </select>
                  <select value={taskPriorityFilter} onChange={(e) => setTaskPriorityFilter(e.target.value as any)} className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <option value="all">All priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="rounded-2xl border border-black/10 bg-white/80 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                    {tags.map((tag) => (
                      <option key={tag} value={tag}>{tag === "all" ? "All tags" : `#${tag}`}</option>
                    ))}
                  </select>
                </div>

                {visibleTasks.length === 0 ? (
                  <EmptyState
                    title="No tasks match this view"
                    body="Clear the filters or add a new task."
                    action={<button onClick={() => { setTaskSearch(""); setTaskStatusFilter("all"); setTaskPriorityFilter("all"); setSelectedTag("all"); }} className="rounded-2xl border border-black/10 px-4 py-2 text-sm dark:border-white/10">Reset filters</button>}
                  />
                ) : (
                  <div className="space-y-3">
                    {visibleTasks.map((task) => (
                      <div key={task.id} className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <button onClick={() => toggleTaskStatus(task.id)} className="shrink-0">
                                {task.status === "done" ? <CheckCircle2 className={cls("h-5 w-5", accent.text)} /> : <Circle className="h-5 w-5 text-black/40 dark:text-white/40" />}
                              </button>
                              <div>
                                <div className="font-medium">{task.title}</div>
                                <div className="mt-1 text-xs text-black/45 dark:text-white/45">Created {formatDate(task.createdAt)}</div>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-black/60 dark:text-white/55">{task.description || "No description"}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <StatusBadge status={task.status} />
                              <PriorityBadge priority={task.priority} />
                              <Pill>{task.estimateHours}h estimate</Pill>
                              <Pill>{formatDate(task.dueDate)}</Pill>
                              {task.tags.map((tag) => (
                                <Pill key={tag}>#{tag}</Pill>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => openEditTask(task)} className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10">Edit</button>
                            <button onClick={() => deleteTask(task.id)} className="rounded-xl border border-black/10 px-3 py-2 text-sm dark:border-white/10">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === "notes" && (
            <motion.div key="notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <SectionTitle
                  title="Notes"
                  subtitle="Quick ideas, reminders, and scratch work"
                  action={<button onClick={() => { setEditingNoteId(null); resetNoteDraft(); setShowNoteModal(true); }} className={cls("rounded-2xl px-4 py-2 text-sm text-white", accent.bg)}>Add Note</button>}
                />
                {visibleNotes.length === 0 ? (
                  <EmptyState title="No notes yet" body="Create a note to start collecting ideas." />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleNotes.map((note) => (
                      <div key={note.id} className={cls("rounded-3xl border border-black/10 p-4 dark:border-white/10", note.color)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-base font-medium">{note.title}</div>
                              {note.pinned ? <Pill>pinned</Pill> : null}
                            </div>
                            <div className="mt-1 text-xs text-black/45 dark:text-white/45">Updated {formatDate(note.updatedAt)}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => togglePinNote(note.id)} className="rounded-lg border border-black/10 bg-white/60 px-2 py-1 text-xs dark:border-white/10 dark:bg-black/20">{note.pinned ? "Unpin" : "Pin"}</button>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-black/70 dark:text-white/70">{note.body}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <Pill key={tag}>#{tag}</Pill>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <button onClick={() => openEditNote(note)} className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20">Edit</button>
                          <button onClick={() => deleteNote(note.id)} className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm dark:border-white/10 dark:bg-black/20">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <SectionTitle title="Status Distribution" subtitle="Current task states" />
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                        {chartData.map((entry, index) => (
                          <Cell key={entry.name} fill={["#64748b", "#3b82f6", "#10b981"][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <SectionTitle title="Priority Mix" subtitle="Work by urgency" />
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 xl:col-span-2">
                <SectionTitle title="7-Day Activity" subtitle="Created vs completed tasks" />
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={velocityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="created" strokeWidth={2} />
                      <Line type="monotone" dataKey="completed" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <SectionTitle title="Appearance" subtitle="Theme and density" />
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 text-sm font-medium">Theme</div>
                      <div className="flex flex-wrap gap-2">
                        {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setState((prev) => ({ ...prev, settings: { ...prev.settings, theme: mode } }))}
                            className={cls(
                              "rounded-2xl border px-4 py-2 text-sm",
                              state.settings.theme === mode ? cls("text-white", accent.bg, "border-transparent") : "border-black/10 dark:border-white/10"
                            )}
                          >
                            {mode === "light" ? <Sun className="mr-2 inline h-4 w-4" /> : mode === "dark" ? <Moon className="mr-2 inline h-4 w-4" /> : <Sparkles className="mr-2 inline h-4 w-4" />}
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-sm font-medium">Density</div>
                      <div className="flex flex-wrap gap-2">
                        {(["compact", "comfortable", "spacious"] as Density[]).map((density) => (
                          <button
                            key={density}
                            onClick={() => setState((prev) => ({ ...prev, settings: { ...prev.settings, density } }))}
                            className={cls(
                              "rounded-2xl border px-4 py-2 text-sm",
                              state.settings.density === density ? cls("text-white", accent.bg, "border-transparent") : "border-black/10 dark:border-white/10"
                            )}
                          >
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-sm font-medium">Accent</div>
                      <div className="flex flex-wrap gap-2">
                        {ACCENTS.map((item) => {
                          const a = accentClasses(item);
                          return (
                            <button
                              key={item}
                              onClick={() => setState((prev) => ({ ...prev, settings: { ...prev.settings, accent: item } }))}
                              className={cls(
                                "h-10 w-10 rounded-2xl border",
                                a.bg,
                                state.settings.accent === item ? "ring-4 ring-black/10 dark:ring-white/15" : "border-transparent"
                              )}
                              aria-label={`Set accent ${item}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <SectionTitle title="Behavior" subtitle="App preferences and data tools" />
                  <div className="space-y-4">
                    <label className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 px-4 py-3 dark:border-white/10">
                      <div>
                        <div className="font-medium">Auto-seed demo data</div>
                        <div className="text-sm text-black/50 dark:text-white/50">Populate sample content when state is empty</div>
                      </div>
                      <input type="checkbox" checked={state.settings.autoSeed} onChange={(e) => setState((prev) => ({ ...prev, settings: { ...prev.settings, autoSeed: e.target.checked } }))} />
                    </label>

                    <label className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 px-4 py-3 dark:border-white/10">
                      <div>
                        <div className="font-medium">Show completed tasks</div>
                        <div className="text-sm text-black/50 dark:text-white/50">Hide done tasks from main task views</div>
                      </div>
                      <input type="checkbox" checked={state.settings.showCompletedTasks} onChange={(e) => setState((prev) => ({ ...prev, settings: { ...prev.settings, showCompletedTasks: e.target.checked } }))} />
                    </label>

                    <div>
                      <div className="mb-2 text-sm font-medium">Default priority for new tasks</div>
                      <select value={state.settings.defaultPriority} onChange={(e) => setState((prev) => ({ ...prev, settings: { ...prev.settings, defaultPriority: e.target.value as Priority } }))} className="w-full rounded-2xl border border-black/10 bg-white/80 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <button onClick={exportJson} className="rounded-2xl border border-black/10 px-4 py-2 text-sm dark:border-white/10">Export JSON</button>
                      <label className="cursor-pointer rounded-2xl border border-black/10 px-4 py-2 text-center text-sm dark:border-white/10">
                        Import JSON
                        <input type="file" accept="application/json" onChange={importJson} className="hidden" />
                      </label>
                      <button
                        onClick={() => {
                          setState(createInitialState());
                          setToast("App reset to demo data");
                        }}
                        className="rounded-2xl border border-black/10 px-4 py-2 text-sm dark:border-white/10"
                      >
                        Reset Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showTaskModal && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{editingTaskId ? "Edit Task" : "New Task"}</h3>
                  <p className="text-sm text-black/50 dark:text-white/50">Create or update a work item.</p>
                </div>
                <button onClick={() => setShowTaskModal(false)} className="rounded-xl border border-black/10 p-2 dark:border-white/10"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <input value={taskDraft.title} onChange={(e) => setTaskDraft((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" placeholder="Task title" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea value={taskDraft.description} onChange={(e) => setTaskDraft((prev) => ({ ...prev, description: e.target.value }))} rows={5} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" placeholder="Describe the work" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Priority</label>
                  <select value={taskDraft.priority} onChange={(e) => setTaskDraft((prev) => ({ ...prev, priority: e.target.value as Priority }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Due Date</label>
                  <input type="date" value={taskDraft.dueDate} onChange={(e) => setTaskDraft((prev) => ({ ...prev, dueDate: e.target.value }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Estimate (hours)</label>
                  <input type="number" min={1} value={taskDraft.estimateHours} onChange={(e) => setTaskDraft((prev) => ({ ...prev, estimateHours: Number(e.target.value) }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tags</label>
                  <input value={taskDraft.tags} onChange={(e) => setTaskDraft((prev) => ({ ...prev, tags: e.target.value }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" placeholder="tag1, tag2" />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowTaskModal(false)} className="rounded-2xl border border-black/10 px-4 py-2 text-sm dark:border-white/10">Cancel</button>
                <button onClick={editingTaskId ? saveTaskEdit : addTask} className={cls("rounded-2xl px-4 py-2 text-sm text-white", accent.bg)}>{editingTaskId ? "Save Changes" : "Create Task"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNoteModal && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{editingNoteId ? "Edit Note" : "New Note"}</h3>
                  <p className="text-sm text-black/50 dark:text-white/50">Capture ideas and reference points.</p>
                </div>
                <button onClick={() => setShowNoteModal(false)} className="rounded-xl border border-black/10 p-2 dark:border-white/10"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <input value={noteDraft.title} onChange={(e) => setNoteDraft((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" placeholder="Note title" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Body</label>
                  <textarea value={noteDraft.body} onChange={(e) => setNoteDraft((prev) => ({ ...prev, body: e.target.value }))} rows={7} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" placeholder="Write something useful" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button key={c} onClick={() => setNoteDraft((prev) => ({ ...prev, color: c }))} className={cls("h-10 w-10 rounded-2xl border border-black/10 dark:border-white/10", c, noteDraft.color === c ? "ring-4 ring-black/10 dark:ring-white/20" : "")} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tags</label>
                  <input value={noteDraft.tags} onChange={(e) => setNoteDraft((prev) => ({ ...prev, tags: e.target.value }))} className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.03]" placeholder="tag1, tag2" />
                </div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={noteDraft.pinned} onChange={(e) => setNoteDraft((prev) => ({ ...prev, pinned: e.target.checked }))} />
                  <span className="text-sm">Pin note</span>
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowNoteModal(false)} className="rounded-2xl border border-black/10 px-4 py-2 text-sm dark:border-white/10">Cancel</button>
                <button onClick={editingNoteId ? saveNoteEdit : addNote} className={cls("rounded-2xl px-4 py-2 text-sm text-white", accent.bg)}>{editingNoteId ? "Save Changes" : "Create Note"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCommandPalette && (
          <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="w-full max-w-2xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900">
              <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
                <Command className="h-4 w-4 text-black/40 dark:text-white/40" />
                <input
                  autoFocus
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Search commands"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button onClick={() => setShowCommandPalette(false)} className="rounded-xl border border-black/10 p-2 dark:border-white/10"><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[60vh] overflow-auto p-2">
                {filteredCommandActions.length === 0 ? (
                  <div className="p-4 text-sm text-black/50 dark:text-white/50">No commands found.</div>
                ) : (
                  filteredCommandActions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setShowCommandPalette(false);
                        setCommandSearch("");
                      }}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                    >
                      <span>{item.label}</span>
                      <span className="text-xs text-black/40 dark:text-white/40">enter</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-4 right-4 z-[60] rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-xl dark:border-white/10 dark:bg-neutral-900">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
