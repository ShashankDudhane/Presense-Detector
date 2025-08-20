import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UploadCloud, Image, Video } from "lucide-react";

function UploadForm({ setDetectionInfo, setProcessingDone }) {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !video) {
      toast.error("Please upload both image and video.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("video", video);

    try {
      setLoading(true);
      setProgress(0);
      toast.loading("Processing video...");

      const { data } = await axios.post(
        "http://127.0.0.1:8000/upload/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      toast.dismiss();
      setProgress(0);

      if (!data.success) {
        toast.error(data.error || "Detection failed");
        return;
      }

      setDetectionInfo(data.detections);
      setProcessingDone(true);
      toast.success("Processing Done ✅");
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss();
      toast.error("Something went wrong — check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (type === "image") {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  };

  const preventDefault = (e) => e.preventDefault();

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-2xl rounded-2xl p-8 space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">
        🔍 Detect Image in Video
      </h2>

      {/* Upload Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image Upload */}
        <div
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => imageInputRef.current.click()}
          onDrop={(e) => handleDrop(e, "image")}
          onDragOver={preventDefault}
        >
          {!previewImage ? (
            <>
              <Image className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">
                Drag & Drop Image or Click to Upload
              </p>
            </>
          ) : (
            <img
              src={previewImage}
              alt="preview"
              className="w-full h-48 object-cover rounded-lg shadow"
            />
          )}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={(e) => {
              const f = e.target.files[0];
              setImage(f);
              setPreviewImage(f ? URL.createObjectURL(f) : null);
            }}
            className="hidden"
          />
        </div>

        {/* Video Upload */}
        <div
          className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => videoInputRef.current.click()}
          onDrop={(e) => handleDrop(e, "video")}
          onDragOver={preventDefault}
        >
          {!previewVideo ? (
            <>
              <Video className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">
                Drag & Drop Video or Click to Upload
              </p>
            </>
          ) : (
            <video
              src={previewVideo}
              controls
              className="w-full h-48 rounded-lg shadow"
            />
          )}
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef}
            onChange={(e) => {
              const f = e.target.files[0];
              setVideo(f);
              setPreviewVideo(f ? URL.createObjectURL(f) : null);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {loading ? "Processing..." : "🔍 Detect Image in Video"}
      </button>
    </form>
  );
}

export default UploadForm;
