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
import { ArrowRight, Plus, FolderGit2, Loader2, Calendar, AlertCircle } from "lucide-react";
import Task from "@/components/ui/Task";
import QuickNote from "@/components/ui/QuickNote";
import GithubActivity from "@/components/ui/GithubActivity";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { githubActivityMock } from "@/mock/dashboard-mock";
import { useEffect, useState } from "react";
import { getUserProject, createProject } from "@/services/projectService";
import { getMyTasks } from "@/services/taskService";
import { getMyNotes, createNote } from "@/services/noteService";
import { createCommand } from "@/services/commandService";
import { CATEGORIES } from "@/types/commandType";
import type { ProjectType } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";
import type { NoteType } from "@/types/noteType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const isOverdue = (dueDate?: string) =>
  !!dueDate && new Date(dueDate) < new Date();

const formatDate = (d?: string) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const Dashboard = () => {
  const { user } = useAuth();
  const { setOnCreateProject, setOnCreateNote, setOnCreateCommand } = useHeaderActions();
  const navigate = useNavigate();

  const [previewProjects, setPreviewProjects] = useState<ProjectType[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskType[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteType[]>([]);
  const [dueSoonTasks, setDueSoonTasks] = useState<TaskType[]>([]);

  // Project modal
  const [openProject, setOpenProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectPriority, setProjectPriority] = useState<Priority>("LOW");
  const [projectStatus, setProjectStatus] = useState<Status>("PENDING");
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
    getUserProject(3).then(setPreviewProjects).catch(console.error);
    getMyTasks().then((tasks) => {
      setRecentTasks(tasks.slice(0, 5));
      const withDue = tasks
        .filter((t: TaskType) => t.dueDate && t.status !== "COMPLETED")
        .sort((a: TaskType, b: TaskType) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 4);
      setDueSoonTasks(withDue);
    }).catch(console.error);
    getMyNotes().then((notes) => setRecentNotes(notes.slice(0, 3))).catch(console.error);
  }, []);

  // Register modal openers in context
  useEffect(() => {
    setOnCreateProject?.(() => () => setOpenProject(true));
    setOnCreateNote?.(() => () => setOpenNote(true));
    setOnCreateCommand?.(() => () => setOpenCommand(true));
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
      toast.error("Failed to create command.");
    } finally {
      setCreatingCommand(false);
    }
  };

  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:h-full xl:overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-rows-[1fr] xl:grid-cols-3 gap-10 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-6 xl:h-full xl:min-h-0">

          {/* Due soon */}
          <Card className="shrink-0">
            <CardHeader className="pb-1">
              <CardTitle className="text-base">Upcoming deadlines</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="px-4 py-0 pt-1 pb-3">
              {dueSoonTasks.length > 0 ? (
                <div className="flex flex-col">
                  {dueSoonTasks.map((task) => {
                    const overdue = isOverdue(task.dueDate);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
                      >
                        {overdue
                          ? <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                          : <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        }
                        <p className="text-sm font-medium flex-1 truncate">{task.title}</p>
                        <span className={cn(
                          "text-xs shrink-0",
                          overdue ? "text-destructive font-medium" : "text-muted-foreground"
                        )}>
                          {overdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
                        </span>
                        <PriorityBadge data={task.priority} className="text-[10px] px-1.5 py-0.5 shrink-0">
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </PriorityBadge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-3">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>

          {/* Latest projects — compact list */}
          <div className="shrink-0 md:flex hidden flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Latest projects</CardTitle>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate("/projects")}>
                View all <ArrowRight className="ml-1" size={12} />
              </Button>
            </div>
            {previewProjects.length > 0 ? (
              <Card>
                <CardContent className="px-4 py-0">
                  {previewProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/20 -mx-4 px-4 transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                        )}
                      </div>
                      <PriorityBadge data={project.status} className="text-[10px] px-1.5 py-0.5 shrink-0">
                        {statusLabel[project.status] ?? project.status}
                      </PriorityBadge>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center p-6 border-dashed shadow-none bg-muted/10 h-24">
                <div className="flex items-center gap-2 text-center">
                  <FolderGit2 className="h-4 w-4 text-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground">No projects yet</span>
                  <Button size="sm" variant="outline" asChild className="ml-2">
                    <Link to="/projects"><Plus className="mr-1 h-3 w-3" />Create</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Activity + Notes */}
          <div className="flex flex-row flex-wrap gap-6 w-full xl:flex-1 xl:min-h-0">
            <Card className="flex-2 w-full sm:min-w-75 flex flex-col min-h-75 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">Activity</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 pb-0 flex-1 overflow-y-auto min-h-0">
                {githubActivityMock.map((activity) => (
                  <GithubActivity key={activity.id} activity={activity} />
                ))}
              </CardContent>
              <CardFooter className="flex justify-end pt-1 pb-2">
                <Button variant="link" size="sm" className="cursor-pointer flex items-center gap-1 p-0" onClick={() => navigate("/github")}>
                  View All Activity <ArrowRight className="mt-0.5 ml-1" size={16} />
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex-1 w-full sm:min-w-75 flex flex-col min-h-75 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">Quick Notes</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2 pb-0">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <QuickNote key={note.id} note={note} onClick={() => navigate("/notes", { state: { noteId: note.id } })} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </CardContent>
              <CardFooter className="pt-1 pb-2">
                <Button variant="link" size="sm" className="cursor-pointer flex items-center gap-1 p-0" onClick={() => setOpenNote(true)}>
                  <Plus size={14} /> New Note
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Recent Tasks */}
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

      {/* Create Project Modal */}
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

      {/* Create Note Modal */}
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

      {/* Create Command Modal */}
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
