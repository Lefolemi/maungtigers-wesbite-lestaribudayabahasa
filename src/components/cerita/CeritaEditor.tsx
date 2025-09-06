// src/components/cerita/CeritaEditor.tsx
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  content: any;
  onChange: (content: any) => void;
};

export default function CeritaEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit], // ✅ no Image extension
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Keep editor content in sync with external state
  useEffect(() => {
    if (!editor) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>

        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>

        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </button>

        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          "
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="border p-4 rounded min-h-[300px]" />
    </div>
  );
}