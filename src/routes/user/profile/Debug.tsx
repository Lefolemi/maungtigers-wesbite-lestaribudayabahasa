import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";

export default function Debug() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImage = useCallback(async () => {
    if (!image || !croppedAreaPixels) return null;

    const img = new Image();
    img.src = image;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const targetSize = 128; // final profile size
    canvas.width = targetSize;
    canvas.height = targetSize;

    // draw cropped area scaled into 128x128
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      targetSize,
      targetSize
    );

    return canvas.toDataURL("image/png");
  }, [image, croppedAreaPixels]);

  const handleConfirm = async () => {
    const cropped = await getCroppedImage();
    if (cropped) {
      setFinalImage(cropped);
      setImage(null); // close cropper
    }
  };

  const handleCancel = () => {
    setImage(null);
    setFinalImage(null);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Debug: Picture Editor</h2>

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Cropper */}
      {image && (
        <div>
          <div className="relative w-full h-[400px] bg-gray-200">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              Confirm
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-500 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview result */}
      {finalImage && (
        <div>
          <p className="font-medium">Final Cropped Image (128×128):</p>
          <img
            src={finalImage}
            alt="Cropped"
            className="mt-2 w-32 h-32 rounded-full border"
          />
        </div>
      )}
    </div>
  );
}