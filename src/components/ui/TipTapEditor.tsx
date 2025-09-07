// src/components/common/TipTapEditor.tsx
import { useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Strikethrough, Quote, Image as ImageIcon } from "lucide-react";

type Props = {
  content: any;
  onChange: (content: any) => void;
  showImageButton?: boolean; // optional toggle
};

export default function TipTapEditor({ content, onChange, showImageButton = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: showImageButton ? [StarterKit, Image] : [StarterKit],
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const localUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: localUrl }).run();

    // Optional: handle upload to server if needed
  };

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
          <Bold size={18} />
        </button>

        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={18} />
        </button>

        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={18} />
        </button>

        <button
          type="button"
          className={`p-2 rounded ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={18} />
        </button>

        {showImageButton && (
          <>
            <button
              type="button"
              className="p-2 bg-gray-200 rounded"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={18} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="border p-4 rounded min-h-[300px]" />
    </div>
  );
}