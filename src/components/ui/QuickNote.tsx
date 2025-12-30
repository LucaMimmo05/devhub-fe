import { StickyNote } from "lucide-react";

type QuickNoteProps = {
    note: {
        id: number;
        title: string;
    };
};
const QuickNote = ({ note }: QuickNoteProps) => {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-accent rounded-md py-1 px-2"
      key={note.id}
    >
      <StickyNote size={14} className="shrink-0" />
      <h3 className=" text-sm md:text-base truncate">{note.title}</h3>
    </div>
  );
};

export default QuickNote;
