import React from "react";

const VideoResult = ({ videoUrl, detectionInfo }) => {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎯 Detection Result
      </h2>

      {/* Video Display */}
      {videoUrl ? (
        <video
          controls
          className="w-full rounded-lg shadow-md mb-6"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p className="text-red-500 text-center mb-6">No video available</p>
      )}

      {/* Detection Info */}
      <div className="space-y-2">
        {detectionInfo && detectionInfo.length > 0 ? (
          detectionInfo.map((d, i) => (
            <p key={i} className="text-gray-700 bg-gray-100 p-3 rounded-lg shadow-sm">
              ✅ {d.message} {d.frame !== undefined && `(Frame: ${d.frame})`}
            </p>
          ))
        ) : (
          <p className="text-gray-500 text-center">No face detected in the video</p>
        )}
      </div>
    </div>
  );
};

export default VideoResult;
