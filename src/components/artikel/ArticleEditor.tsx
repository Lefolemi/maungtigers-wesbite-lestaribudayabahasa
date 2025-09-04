import { useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

type Props = {
  content: any;
  onChange: (content: any) => void;
};

export default function ArticleEditor({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    editor?.chain().focus().setImage({ src: localUrl }).run();
  };

  if (!editor) return null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          type="button"
          className={`p-2 rounded ${
            editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>

        <button
          type="button"
          className={`p-2 rounded ${
            editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>

        <button
          type="button"
          className={`p-2 rounded ${
            editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </button>

        <button
          type="button"
          className={`p-2 rounded ${
            editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </button>

        <button
          type="button"
          className="p-2 bg-gray-200 rounded"
          onClick={() => fileInputRef.current?.click()}
        >
          🖼️
        </button>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="border p-4 rounded min-h-[300px]" />
    </div>
  );
}