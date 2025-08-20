import React from "react";
import { BadgeCheck, XCircle } from "lucide-react";

const VideoResult = ({ detectionInfo }) => {
  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
        🎯 Detection Result
      </h2>

      {detectionInfo && detectionInfo.length > 0 ? (
        detectionInfo[0].message === "No matches found" ? (
          <div className="flex flex-col items-center justify-center py-10">
            <XCircle className="text-red-500 w-12 h-12 mb-3" />
            <p className="text-red-500 text-lg font-semibold">
              ❌ No matches found in the video
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {detectionInfo.map((d, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl shadow-lg p-4 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    Frame #{d.frame}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      d.similarity > 0.8
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Similarity: {(d.similarity * 100).toFixed(1)}%
                  </span>
                </div>

                {d.imageUrl && (
                  <img
                    src={`http://127.0.0.1:8000${d.imageUrl}`}
                    alt={`Detection ${i}`}
                    className="rounded-lg w-full h-40 object-cover shadow-md mb-3"
                  />
                )}

                <div className="flex items-center gap-2">
                  <BadgeCheck className="text-blue-600 w-5 h-5" />
                  <p className="text-gray-800 text-sm font-medium">
                    {d.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-gray-500 text-center py-6">
          No results yet — Upload and process a video
        </p>
      )}
    </div>
  );
};

export default VideoResult;
