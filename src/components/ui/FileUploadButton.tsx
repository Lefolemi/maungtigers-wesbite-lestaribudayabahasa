type Props = {
    id: string;
    label: string;
    accept: string;
    disabled?: boolean;
    onChange: (file: File | null) => void;
};

export default function FileUploadButton({
    id,
    label,
    accept,
    disabled,
    onChange,
    }: Props) {
    return (
        <div>
        <label
            htmlFor={id}
            className={`cursor-pointer inline-block px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            disabled
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-sekunder text-white hover:bg-tersier"
            }`}
        >
            {label}
        </label>
        <input
            id={id}
            type="file"
            accept={accept}
            disabled={disabled}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="hidden"
        />
        </div>
    );
}  