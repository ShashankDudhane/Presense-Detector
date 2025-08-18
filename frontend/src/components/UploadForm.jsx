import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function UploadForm({ setVideoUrl, setProcessingDone, setDetectionInfo }) {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !video) {
      toast.error("Upload both image and video!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("video", video);

    try {
      setLoading(true);
      toast.loading("Processing video...");

      const { data } = await axios.post(
        "http://127.0.0.1:8000/upload/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.dismiss();

      if (!data.success) {
        toast.error(data.error || "Detection failed");
        return;
      }

      setVideoUrl(`http://127.0.0.1:8000${data.videoUrl}`);
      setDetectionInfo(data.detections);
      setProcessingDone(true);
      toast.success("Processing done ✅");

    } catch (err) {
      console.error("Upload error:", err);
      toast.dismiss();
      toast.error("Backend error. Check console logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white shadow-xl rounded-2xl p-8 max-w-md mx-auto mt-10"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🔍 Face Detection
      </h2>

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
          }}
          className="block w-full text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="mt-3 w-48 h-48 object-cover rounded-lg shadow-md mx-auto"
          />
        )}
      </div>

      {/* Video Upload */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Upload Video:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setVideo(file);
            setPreviewVideo(URL.createObjectURL(file));
          }}
          className="block w-full text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {previewVideo && (
          <video
            src={previewVideo}
            controls
            className="mt-3 w-full rounded-lg shadow-md"
          />
        )}
      </div>

      {/* Submit Button */}
      <button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Detect Face"}
      </button>
    </form>
  );
}

export default UploadForm;
