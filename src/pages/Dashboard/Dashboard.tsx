import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageContainer from "@/layouts/PageContainer";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Modal from "@/components/ui/Modal";
import { ArrowRight, Plus, FolderGit2, Loader2, Construction, FolderKanban, ListChecks, FileText, Terminal, Calendar, Users } from "lucide-react";
import Task from "@/components/ui/Task";
import QuickNote from "@/components/ui/QuickNote";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { useEffect, useState } from "react";
import { getUserProject, createProject } from "@/services/projectService";
import { getMyTasks } from "@/services/taskService";
import { getMyNotes, createNote } from "@/services/noteService";
import { createCommand, getMyCommands } from "@/services/commandService";
import { CATEGORIES } from "@/types/commandType";
import type { ProjectType } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";
import type { NoteType } from "@/types/noteType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const Dashboard = () => {
  const { user } = useAuth();
  const { setOnCreateProject, setOnCreateNote, setOnCreateCommand } = useHeaderActions();
  const navigate = useNavigate();

  const [previewProjects, setPreviewProjects] = useState<ProjectType[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskType[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteType[]>([]);

  // Stats
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [openTasks, setOpenTasks] = useState<number | null>(null);
  const [totalNotes, setTotalNotes] = useState<number | null>(null);
  const [totalCommands, setTotalCommands] = useState<number | null>(null);

  // Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Project modal
  const [openProject, setOpenProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectPriority, setProjectPriority] = useState<Priority>("LOW");
  const [projectStatus] = useState<Status>("PENDING");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // Note modal
  const [openNote, setOpenNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [creatingNote, setCreatingNote] = useState(false);

  // Command modal
  const [openCommand, setOpenCommand] = useState(false);
  const [cmdTitle, setCmdTitle] = useState("");
  const [cmdValue, setCmdValue] = useState("");
  const [cmdDesc, setCmdDesc] = useState("");
  const [cmdCategory, setCmdCategory] = useState("Bash");
  const [creatingCommand, setCreatingCommand] = useState(false);

  useEffect(() => {
    getUserProject().then((projects) => {
      setPreviewProjects(projects.slice(0, 3));
      setTotalProjects(projects.length);
    }).catch(console.error);
    getMyTasks().then((tasks) => {
      setRecentTasks(tasks.slice(0, 5));
      setOpenTasks(tasks.filter((t: TaskType) => t.status === "PENDING" || t.status === "IN_PROGRESS").length);
    }).catch(console.error);
    getMyNotes().then((notes) => {
      setRecentNotes(notes.slice(0, 3));
      setTotalNotes(notes.length);
    }).catch(console.error);
    getMyCommands().then((cmds) => setTotalCommands(cmds.length)).catch(console.error);
  }, []);

  // Registra i modal opener nel context (singola freccia — i ref non sono setState)
  useEffect(() => {
    setOnCreateProject?.(() => setOpenProject(true));
    setOnCreateNote?.(() => setOpenNote(true));
    setOnCreateCommand?.(() => setOpenCommand(true));
    return () => {
      setOnCreateProject?.(undefined);
      setOnCreateNote?.(undefined);
      setOnCreateCommand?.(undefined);
    };
  }, [setOnCreateProject, setOnCreateNote, setOnCreateCommand]);

  const handleCreateProject = async () => {
    if (!projectTitle.trim() || !user?.id) return;
    setCreatingProject(true);
    try {
      const created = await createProject({
        title: projectTitle.trim(),
        description: projectDesc.trim(),
        ownerId: user.id,
        memberIds: [],
        priority: projectPriority,
        status: projectStatus,
        dueDate: projectDueDate || undefined,
      });
      setPreviewProjects((prev) => [created, ...prev].slice(0, 3));
      toast.success("Project created!");
      setOpenProject(false);
      setProjectTitle(""); setProjectDesc(""); setProjectDueDate("");
    } catch {
      toast.error("Failed to create project.");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return;
    setCreatingNote(true);
    try {
      const created = await createNote({ title: noteTitle.trim(), content: noteContent });
      setRecentNotes((prev) => [created, ...prev].slice(0, 3));
      toast.success("Note created!");
      setOpenNote(false);
      setNoteTitle(""); setNoteContent("");
    } catch {
      toast.error("Failed to create note.");
    } finally {
      setCreatingNote(false);
    }
  };

  const handleCreateCommand = async () => {
    if (!cmdTitle.trim() || !cmdValue.trim()) return;
    setCreatingCommand(true);
    try {
      await createCommand({ title: cmdTitle.trim(), command: cmdValue.trim(), description: cmdDesc, category: cmdCategory });
      toast.success("Command saved!");
      setOpenCommand(false);
      setCmdTitle(""); setCmdValue(""); setCmdDesc(""); setCmdCategory("Bash");
    } catch {
      toast.error("Failed to save command.");
    } finally {
      setCreatingCommand(false);
    }
  };

  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:h-full xl:overflow-hidden">

      {/* Stats row + clock */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center w-fit rounded-lg border border-border bg-card divide-x divide-border overflow-hidden">
          {[
            { label: "Projects", value: totalProjects, icon: FolderKanban, color: "text-blue-500", onClick: () => navigate("/projects") },
            { label: "Tasks", value: openTasks, icon: ListChecks, color: "text-amber-500", onClick: () => navigate("/tasks") },
            { label: "Notes", value: totalNotes, icon: FileText, color: "text-emerald-500", onClick: () => navigate("/notes") },
            { label: "Commands", value: totalCommands, icon: Terminal, color: "text-violet-500", onClick: () => navigate("/commands") },
          ].map(({ label, value, icon: Icon, color, onClick }) => (
            <div
              key={label}
              onClick={onClick}
              className="flex items-center gap-1.5 px-2 sm:px-4 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
              <span className="text-sm font-semibold">
                {value === null ? <span className="text-muted-foreground/40">—</span> : value}
              </span>
              <span className="hidden sm:inline text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Clock */}
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground leading-none">
              {now.toLocaleTimeString("en-GB", { second: "2-digit" })}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground tracking-wide uppercase">
            {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-rows-[1fr] xl:grid-cols-3 gap-4 md:gap-6 xl:gap-10 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-4 md:gap-6 xl:h-full xl:min-h-0">

          {/* Latest projects */}
          <div className="shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Latest projects</span>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate("/projects")}>
                View all <ArrowRight className="ml-1" size={12} />
              </Button>
            </div>
            {previewProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {previewProjects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors min-w-0"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    {/* Title row */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{project.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    {/* Badges + meta */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge data={project.priority} className="text-[10px] px-1.5 py-0.5">
                          {priorityLabel[project.priority] ?? project.priority}
                        </PriorityBadge>
                        <PriorityBadge data={project.status} className="text-[10px] px-1.5 py-0.5">
                          {statusLabel[project.status] ?? project.status}
                        </PriorityBadge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground/60 shrink-0">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-[10px]">{project.members?.length ?? 0}</span>
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px]">
                              {new Date(project.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3">
                <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-sm text-muted-foreground">No projects yet</span>
                <Button size="sm" variant="outline" asChild className="ml-auto h-6 text-xs px-2">
                  <Link to="/projects">Create</Link>
                </Button>
              </div>
            )}
          </div>

          {/* GitHub Activity + Quick Notes */}
          <div className="flex flex-row flex-wrap gap-4 md:gap-6 w-full xl:flex-1 xl:min-h-0">
            <Card className="flex-2 w-full sm:min-w-64 flex flex-col min-h-32 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1 shrink-0">
                <CardTitle className="text-base md:text-lg">GitHub Activity</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 items-center justify-center pb-3 gap-1.5 text-center">
                <Construction className="h-6 w-6 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">GitHub integration coming soon</p>
                <p className="text-xs text-muted-foreground/60">Connect your GitHub account to see your repository activity here.</p>
              </CardContent>
            </Card>

            <Card className="flex-1 w-full sm:min-w-64 flex flex-col min-h-32 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1 shrink-0">
                <CardTitle className="text-base md:text-lg">Quick Notes</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2 pb-0 min-h-0">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <QuickNote key={note.id} note={note} onClick={() => navigate("/notes", { state: { noteId: note.id } })} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </CardContent>
              <CardFooter className="pt-1 pb-2 shrink-0">
                <Button variant="link" size="sm" className="cursor-pointer flex items-center gap-1 p-0" onClick={() => setOpenNote(true)}>
                  <Plus size={14} /> New Note
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Task recenti */}
        <Card className="min-h-64 xl:min-h-0 flex flex-col xl:h-full">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base md:text-lg">Recent Tasks</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => <Task key={task.id} task={task} />)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-1 pb-2 shrink-0">
            <Button variant="link" size="sm" className="cursor-pointer flex items-center gap-1 p-0" onClick={() => navigate("/tasks")}>
              View All Tasks <ArrowRight className="mt-0.5 ml-1" size={16} />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modale — Nuovo progetto */}
      <Modal
        open={openProject}
        onOpenChange={(v) => { setOpenProject(v); if (!v) { setProjectTitle(""); setProjectDesc(""); setProjectDueDate(""); } }}
        title="Create new Project"
        className="max-w-lg"
        footer={
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => setOpenProject(false)} disabled={creatingProject}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={creatingProject || !projectTitle.trim()}>
              {creatingProject && <Loader2 className="animate-spin h-4 w-4 mr-1" />} Create
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Project title" autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Short description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select value={projectPriority} onValueChange={(v) => setProjectPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-due">Due Date</Label>
              <Input id="p-due" type="date" value={projectDueDate} onChange={(e) => setProjectDueDate(e.target.value)} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modale — Nuova nota */}
      <Modal
        open={openNote}
        onOpenChange={(v) => { setOpenNote(v); if (!v) { setNoteTitle(""); setNoteContent(""); } }}
        title="Create new Note"
        className="max-w-lg"
        footer={
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => setOpenNote(false)} disabled={creatingNote}>Cancel</Button>
            <Button onClick={handleCreateNote} disabled={creatingNote || !noteTitle.trim()}>
              {creatingNote && <Loader2 className="animate-spin h-4 w-4 mr-1" />} Create
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="n-title">Title</Label>
            <Input id="n-title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title" autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="n-content">Content</Label>
            <Textarea id="n-content" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Write your note..." className="min-h-28" />
          </div>
        </div>
      </Modal>

      {/* Modale — Nuovo comando */}
      <Modal
        open={openCommand}
        onOpenChange={(v) => { setOpenCommand(v); if (!v) { setCmdTitle(""); setCmdValue(""); setCmdDesc(""); setCmdCategory("Bash"); } }}
        title="Save new Command"
        className="max-w-lg"
        footer={
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => setOpenCommand(false)} disabled={creatingCommand}>Cancel</Button>
            <Button onClick={handleCreateCommand} disabled={creatingCommand || !cmdTitle.trim() || !cmdValue.trim()}>
              {creatingCommand && <Loader2 className="animate-spin h-4 w-4 mr-1" />} Save
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-title">Title</Label>
            <Input id="c-title" value={cmdTitle} onChange={(e) => setCmdTitle(e.target.value)} placeholder="e.g. Start dev server" autoFocus />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-cmd">Command</Label>
            <Input id="c-cmd" value={cmdValue} onChange={(e) => setCmdValue(e.target.value)} placeholder="e.g. npm run dev" className="font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select value={cmdCategory} onValueChange={setCmdCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-desc">Description</Label>
              <Input id="c-desc" value={cmdDesc} onChange={(e) => setCmdDesc(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Dashboard;
