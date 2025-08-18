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
      toast.error("Please upload both an image and a video.");
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
      toast.success("Processing Done ✅");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.dismiss();
      toast.error("Something went wrong. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 w-full">
      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
          }}
          className="block w-full text-gray-700"
        />
        {previewImage && (
          <img src={previewImage} alt="Preview" className="mt-3 w-48 h-48 object-cover rounded-lg mx-auto shadow" />
        )}
      </div>

      {/* Video Upload */}
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Upload Video:</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            setVideo(e.target.files[0]);
            setPreviewVideo(URL.createObjectURL(e.target.files[0]));
          }}
          className="block w-full text-gray-700"
        />
        {previewVideo && (
          <video src={previewVideo} controls className="mt-3 w-full rounded-lg shadow" />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
      >
        {loading ? "Processing..." : "🔍 Detect Face in Video"}
      </button>
    </form>
  );
}

export default UploadForm;
