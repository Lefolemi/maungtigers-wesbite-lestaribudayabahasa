// src/components/article/ArtikelForm.tsx
import { type ReactNode } from "react";
import ArticleEditor from "./ArticleEditor";

interface ArtikelFormProps {
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  thumbnailPreview: string | null;
  onThumbnailChange: (file: File | null) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  content?: any; // optional for custom editor
  onContentChange?: (content: any) => void; // optional
  warning?: string | null;
  children?: ReactNode; // ✅ support children for custom editor
}

export default function ArtikelForm({
  title,
  setTitle,
  slug,
  thumbnailPreview,
  onThumbnailChange,
  tags,
  setTags,
  tagInput,
  setTagInput,
  content,
  onContentChange,
  warning,
  children,
}: ArtikelFormProps) {
  return (
    <div className="p-8 space-y-6">
      {warning && (
        <div className="p-3 rounded bg-yellow-100 border border-yellow-400 text-yellow-800">
          {warning}
        </div>
      )}

      <input
        type="text"
        value={title}
        placeholder="Masukan judul artikel..."
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2 text-lg"
      />

      <input
        type="text"
        value={slug}
        placeholder="Slug will be generated automatically"
        disabled
        className="w-full border rounded px-3 py-2 text-gray-500"
      />

      <div>
        <label className="block mb-2 font-medium">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onThumbnailChange(e.target.files?.[0] || null)}
        />
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="Thumbnail Preview"
            className="mt-2 w-48 h-32 object-cover rounded border"
          />
        )}
      </div>

      <div>
        <label className="block mb-2 font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          placeholder="Type a tag and press Enter"
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
              setTagInput("");
            }
          }}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Editor */}
      {children ?? <ArticleEditor content={content} onChange={onContentChange!} />}
    </div>
  );
}