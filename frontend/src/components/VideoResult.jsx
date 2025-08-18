import React from "react";

const VideoResult = ({ videoUrl, detectionInfo }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">🎯 Detection Result</h2>

      {videoUrl ? (
        <video controls className="w-full rounded-lg shadow">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p className="text-red-500">No video available</p>
      )}

      <div className="mt-4">
        {detectionInfo && detectionInfo.length > 0 ? (
          detectionInfo.map((d, i) => (
            <p key={i} className="text-gray-700">
              ✅ {d.message} {d.frame !== undefined && `(Frame: ${d.frame})`}
            </p>
          ))
        ) : (
          <p className="text-gray-500">No face detected in the video</p>
        )}
      </div>
    </div>
  );
};

export default VideoResult;
