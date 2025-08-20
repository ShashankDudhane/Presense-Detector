import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import VideoResult from "./components/VideoResult";
import { Toaster } from "react-hot-toast";

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [processingDone, setProcessingDone] = useState(false);
  const [detectionInfo, setDetectionInfo] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">
        🎥 Presence Detector
      </h1>

      <div className="w-full max-w-3xl space-y-6">
        <UploadForm
          setVideoUrl={setVideoUrl}
          setProcessingDone={setProcessingDone}
          setDetectionInfo={setDetectionInfo}
        />

        {processingDone && (
          <VideoResult videoUrl={videoUrl} detectionInfo={detectionInfo} />
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
