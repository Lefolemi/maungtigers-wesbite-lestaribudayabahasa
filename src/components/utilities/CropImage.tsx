// components/utilities/CropImage.tsx
import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface CropImageProps {
  onComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function CropImage({ onComplete, onCancel }: CropImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // File -> base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // Utility: get cropped image
  const getCroppedImg = async (
    imageSrc: string,
    cropPixels: Area,
    targetSize = 128
  ): Promise<string> => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Failed to load image"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.save();
    ctx.beginPath();
    ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const sx = Math.round(cropPixels.x);
    const sy = Math.round(cropPixels.y);
    const sWidth = Math.round(cropPixels.width);
    const sHeight = Math.round(cropPixels.height);

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);
    ctx.restore();

    return canvas.toDataURL("image/png");
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels, 128);
      onComplete(cropped);
      setImageSrc(null);
    } catch (err) {
      console.error("Crop error", err);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    onCancel();
  };

  return (
    <div className="flex flex-col items-center">
      <input
        id="crop-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <label
        htmlFor="crop-upload"
        className="px-3 py-2 text-md rounded-figma-md bg-sekunder text-white cursor-pointer"
      >
        {imageSrc ? "Pilih Ulang" : "Upload Foto"}
      </label>

      {imageSrc && (
        <div className="mt-4 w-full">
          <div className="relative w-full min-h-[260px] sm:h-[360px] bg-gray-100 overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                className="px-3 py-1 rounded-figma-md bg-gray-200"
              >
                -
              </button>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                className="px-3 py-1 rounded-figma-md bg-gray-200"
              >
                +
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-figma-md bg-green-600 text-white"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-figma-md bg-gray-500 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}