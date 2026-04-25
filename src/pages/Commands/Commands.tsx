import { useEffect, useMemo, useRef, useState } from "react";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { getMyCommands, createCommand, updateCommand, deleteCommand } from "@/services/commandService";
import type { CommandType } from "@/types/commandType";
import { CATEGORIES } from "@/types/commandType";
import PageContainer from "@/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Check, Copy, Loader2, Plus, Search, Terminal, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NEW_CATEGORY_VALUE = "__new__";

const categoryColor: Record<string, string> = {
  Bash:   "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Git:    "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Docker: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SQL:    "bg-purple-500/10 text-purple-600 border-purple-500/20",
  NPM:    "bg-red-500/10 text-red-600 border-red-500/20",
  Other:  "bg-muted text-muted-foreground border-border",
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handle}>
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
};

const Commands = () => {
  const { setOnCreate } = useHeaderActions();

  const [commands, setCommands] = useState<CommandType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [editingCmd, setEditingCmd] = useState<CommandType | null>(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fCommand, setFCommand] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fCategory, setFCategory] = useState("Bash");
  const [fCustomCategory, setFCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSearch = useRef("");
  const currentCategory = useRef("All");

  const fetchCommands = (category: string, search: string) => {
    setLoading(true);
    getMyCommands(
      category === "All" ? undefined : category,
      search || undefined
    )
      .then(setCommands)
      .catch(() => toast.error("Failed to load commands."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCommands("All", "");
  }, []);

  useEffect(() => {
    setOnCreate?.(() => openCreate());
    return () => setOnCreate?.(undefined);
  }, [setOnCreate]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    currentCategory.current = cat;
    fetchCommands(cat, currentSearch.current);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    currentSearch.current = value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchCommands(currentCategory.current, value);
    }, 400);
  };

  // Custom categories derived from user's existing commands
  const customCategories = useMemo(() => {
    const defaultSet = new Set<string>(CATEGORIES);
    const seen = new Set<string>();
    return commands
      .map((c) => c.category)
      .filter((cat) => !defaultSet.has(cat) && cat && !seen.has(cat) && seen.add(cat));
  }, [commands]);

  // Resolved category value for save (handles new custom input)
  const resolvedCategory = fCategory === NEW_CATEGORY_VALUE
    ? fCustomCategory.trim()
    : fCategory;

  const openCreate = () => {
    setIsNew(true);
    setEditingCmd(null);
    setFTitle(""); setFCommand(""); setFDescription(""); setFCategory("Bash"); setFCustomCategory("");
    setConfirmDelete(false);
    setOpenSheet(true);
  };

  const openEdit = (cmd: CommandType) => {
    setIsNew(false);
    setEditingCmd(cmd);
    setFTitle(cmd.title);
    setFCommand(cmd.command);
    setFDescription(cmd.description ?? "");
    // If the command's category is custom, pre-fill the custom input
    const isCustom = !CATEGORIES.includes(cmd.category as never);
    setFCategory(isCustom ? NEW_CATEGORY_VALUE : cmd.category);
    setFCustomCategory(isCustom ? cmd.category : "");
    setConfirmDelete(false);
    setOpenSheet(true);
  };

  const handleSave = async () => {
    if (!fTitle.trim() || !fCommand.trim() || !resolvedCategory) return;
    setSaving(true);
    try {
      const payload = { title: fTitle, command: fCommand, description: fDescription || undefined, category: resolvedCategory };
      if (isNew) {
        const created = await createCommand(payload);
        setCommands((prev) => [created, ...prev]);
        toast.success("Command created!");
      } else if (editingCmd) {
        const updated = await updateCommand(editingCmd.id, payload);
        setCommands((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success("Command updated!");
      }
      setOpenSheet(false);
    } catch {
      toast.error("Failed to save command.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingCmd) return;
    try {
      await deleteCommand(editingCmd.id);
      setCommands((prev) => prev.filter((c) => c.id !== editingCmd.id));
      setOpenSheet(false);
      toast.success("Command deleted.");
    } catch {
      toast.error("Failed to delete command.");
    }
  };

  const allFilterCategories = ["All", ...CATEGORIES, ...customCategories];

  return (
    <PageContainer className="space-y-4">
      {/* Search + category filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {allFilterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commands grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      ) : commands.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] gap-4 text-center">
          <Terminal className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <h3 className="font-semibold text-lg">No commands yet</h3>
            <p className="text-muted-foreground text-sm">Save your first snippet to get started.</p>
          </div>
          <Button onClick={openCreate}>New Command</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className="border rounded-lg p-4 flex flex-col gap-2 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => openEdit(cmd)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge
                    variant="outline"
                    className={cn("text-xs shrink-0", categoryColor[cmd.category] ?? categoryColor.Other)}
                  >
                    {cmd.category}
                  </Badge>
                  <p className="font-medium text-sm truncate">{cmd.title}</p>
                </div>
                <CopyButton text={cmd.command} />
              </div>

              {cmd.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{cmd.description}</p>
              )}

              <div
                className="bg-muted rounded-md px-3 py-2 font-mono text-xs text-foreground overflow-x-auto whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {cmd.command}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit sheet */}
      <Sheet open={openSheet} onOpenChange={(open) => !open && setOpenSheet(false)}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="px-6 py-5 border-b">
            <SheetTitle>{isNew ? "New Command" : "Edit Command"}</SheetTitle>
            <SheetDescription>{isNew ? "Save a new snippet." : editingCmd?.title}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="e.g. List all containers" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={fCategory}
                onValueChange={(val) => {
                  setFCategory(val);
                  if (val !== NEW_CATEGORY_VALUE) setFCustomCategory("");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  {customCategories.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Custom</div>
                      {customCategories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </>
                  )}
                  <SelectItem value={NEW_CATEGORY_VALUE}>
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3 w-3" /> New category…
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {fCategory === NEW_CATEGORY_VALUE && (
                <div className="relative">
                  <Input
                    autoFocus
                    value={fCustomCategory}
                    onChange={(e) => setFCustomCategory(e.target.value)}
                    placeholder="e.g. Kubernetes"
                    className="pr-8"
                  />
                  {fCustomCategory && (
                    <button
                      type="button"
                      onClick={() => setFCustomCategory("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Command</Label>
              <Textarea
                value={fCommand}
                onChange={(e) => setFCommand(e.target.value)}
                placeholder="docker ps -a"
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                value={fDescription}
                onChange={(e) => setFDescription(e.target.value)}
                placeholder="What does this command do?"
                rows={3}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t flex items-center justify-between gap-2">
            {!isNew && (
              <>
                {!confirmDelete ? (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-destructive">Delete?</span>
                    <Button size="sm" variant="destructive" onClick={handleDelete}>Yes</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
                  </div>
                )}
              </>
            )}
            {isNew && <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenSheet(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !fTitle.trim() || !fCommand.trim() || !resolvedCategory}>
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                {isNew ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
};

export default Commands;
