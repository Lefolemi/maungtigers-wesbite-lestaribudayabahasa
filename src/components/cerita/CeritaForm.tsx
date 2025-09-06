// src/components/cerita/CeritaForm.tsx
import ArticleEditor from "../cerita/CeritaEditor";

interface CeritaFormProps {
  title: string;
  setTitle: (v: string) => void;
  thumbnailPreview: string | null;
  onThumbnailChange: (file: File | null) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
  content: any;
  onContentChange: (content: any) => void;
  warning?: string | null;
}

export default function CeritaForm({
  title,
  setTitle,
  thumbnailPreview,
  onThumbnailChange,
  tags,
  setTags,
  tagInput,
  setTagInput,
  content,
  onContentChange,
  warning,
}: CeritaFormProps) {
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
        placeholder="Enter your story title"
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2 text-lg"
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

      <ArticleEditor content={content} onChange={onContentChange} />
    </div>
  );
}