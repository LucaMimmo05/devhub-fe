import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";
import { cn } from "@/lib/utils";

const proseClass = [
  "text-base text-foreground leading-relaxed",
  "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:first:mt-0",
  "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6",
  "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5",
  "[&_p]:mb-4",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4",
  "[&_li]:mb-1",
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
};

const MarkdownEditor = ({ content, onChange, placeholder, autoFocus, className }: Props) => {
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

  return <EditorContent editor={editor} />;
};

export default MarkdownEditor;
