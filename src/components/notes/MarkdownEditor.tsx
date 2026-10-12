import { useEffect, type MutableRefObject, type ReactNode } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  SquareCode,
  Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";

const proseClass = [
  "text-base text-foreground leading-relaxed",
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:first:mt-0",
  "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6",
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5",
  "[&_p]:mb-4",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4",
  "[&_li]:mb-1 [&_li_p]:mb-0 [&_li>ul]:mb-0 [&_li>ol]:mb-0 [&_li>ul]:mt-1",
  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
  "[&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-4",
  "[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer",
  "[&_hr]:border-border [&_hr]:my-6",
  "[&_strong]:font-semibold",
  // GFM tables: preflight strips all table styling, so restore borders/padding here.
  // Wide tables scroll inside their own wrapper instead of widening the page.
  "[&_.tableWrapper]:overflow-x-auto [&_.tableWrapper]:mb-4",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-0",
  "[&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:align-top",
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
  "[&_th_p]:mb-0 [&_td_p]:mb-0",
  "[&_.selectedCell]:bg-primary/10",
  "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:text-muted-foreground/40 [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:pointer-events-none",
].join(" ");

type Props = {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  /** Show the formatting toolbar above the text. */
  toolbar?: boolean;
  /** Filled with a function that focuses the end of the document. */
  focusRef?: MutableRefObject<(() => void) | null>;
};

type ToolProps = { label: string; shortcut?: string; active?: boolean; onClick: () => void; children: ReactNode };

const Tool = ({ label, shortcut, active, onClick, children }: ToolProps) => (
  <button
    type="button"
    // Keep the editor selection: don't let the button take focus on mousedown.
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={shortcut ? `${label} (${shortcut})` : label}
    className={cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
      active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    {children}
  </button>
);

const mod = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

const Toolbar = ({ editor }: { editor: Editor }) => {
  // Re-render only when the active marks/nodes change, not on every keystroke.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
    }),
  });
  const run = () => editor.chain().focus();
  const sep = <span className="mx-1 h-4 w-px shrink-0 bg-border" aria-hidden />;

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-0 z-10 -mx-2 mb-4 flex items-center gap-0.5 overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-border/70 bg-background/90 px-1.5 py-1 backdrop-blur"
    >
      <Tool label="Heading 1" active={state.h1} onClick={() => run().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Tool>
      <Tool label="Heading 2" active={state.h2} onClick={() => run().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Tool>
      {sep}
      <Tool label="Bold" shortcut={`${mod}+B`} active={state.bold} onClick={() => run().toggleBold().run()}><Bold className="h-4 w-4" /></Tool>
      <Tool label="Italic" shortcut={`${mod}+I`} active={state.italic} onClick={() => run().toggleItalic().run()}><Italic className="h-4 w-4" /></Tool>
      <Tool label="Strikethrough" active={state.strike} onClick={() => run().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Tool>
      <Tool label="Inline code" shortcut={`${mod}+E`} active={state.code} onClick={() => run().toggleCode().run()}><Code className="h-4 w-4" /></Tool>
      {sep}
      <Tool label="Bulleted list" active={state.bullet} onClick={() => run().toggleBulletList().run()}><List className="h-4 w-4" /></Tool>
      <Tool label="Numbered list" active={state.ordered} onClick={() => run().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Tool>
      <Tool label="Quote" active={state.quote} onClick={() => run().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Tool>
      <Tool label="Code block" active={state.codeBlock} onClick={() => run().toggleCodeBlock().run()}><SquareCode className="h-4 w-4" /></Tool>
      <Tool label="Divider" onClick={() => run().setHorizontalRule().run()}><Minus className="h-4 w-4" /></Tool>
    </div>
  );
};

const MarkdownEditor = ({ content, onChange, placeholder, autoFocus, className, toolbar, focusRef }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content,
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class: cn(proseClass, "min-h-[50vh] focus:outline-none", className),
      },
    },
    onUpdate: ({ editor: e }) => {
      const storage = e.storage as unknown as { markdown: { getMarkdown: () => string } };
      onChange(storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (!focusRef) return;
    focusRef.current = () => editor?.commands.focus("end");
    return () => {
      focusRef.current = null;
    };
  }, [editor, focusRef]);

  return (
    <div>
      {toolbar && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default MarkdownEditor;
