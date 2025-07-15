import React, { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { Check, X, UserPlus } from "lucide-react";

const Notifications = ({ isOpen, onClose }) => {
  const { 
    friendRequests, 
    getFriendRequests, 
    respondToFriendRequest, 
    isFriendRequestsLoading 
  } = useFriendStore();

  useEffect(() => {
    if (isOpen) {
      getFriendRequests();
    }
  }, [isOpen, getFriendRequests]);

  const handleRespond = async (requestId, status) => {
    await respondToFriendRequest(requestId, status);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-base-300">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <UserPlus className="size-5" />
          Friend Requests
          {friendRequests.length > 0 && (
            <span className="badge badge-primary badge-sm">{friendRequests.length}</span>
          )}
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {isFriendRequestsLoading ? (
          <div className="p-4 text-center">
            <span className="loading loading-spinner loading-md"></span>
            <p className="mt-2 text-sm text-base-content/70">Loading...</p>
          </div>
        ) : friendRequests.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-base-content/70">No friend requests</p>
          </div>
        ) : (
          <div className="p-2">
            {friendRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-lg mb-2"
              >
                <img
                  src={request.sender.profilePic || "/avatar.png"}
                  alt={request.sender.fullName}
                  className="size-10 object-cover rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{request.sender.fullName}</p>
                  <p className="text-xs text-base-content/70">wants to be your friend</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRespond(request._id, "accepted")}
                    className="btn btn-sm btn-success btn-circle"
                    title="Accept"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={() => handleRespond(request._id, "rejected")}
                    className="btn btn-sm btn-error btn-circle"
                    title="Reject"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
