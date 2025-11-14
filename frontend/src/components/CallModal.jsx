import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";

const CallModal = () => {
  const {
    callState,
    callType,
    incomingCall,
    stream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
  } = useCallStore();
  const { authUser, socket } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { users } = useUserStore();
  const [callerInfo, setCallerInfo] = useState(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Set socket when component mounts or socket changes
  useEffect(() => {
    if (socket) {
      useCallStore.getState().setSocket(socket);
    }
  }, [socket]);

  // Handle incoming call socket event
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      useCallStore.getState().setIncomingCall(data);
    };

    const handleCallRejected = () => {
      useCallStore.getState().endCall();
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-rejected", handleCallRejected);
    };
  }, [socket]);

  // Play local audio stream
  useEffect(() => {
    if (localAudioRef.current && stream) {
      localAudioRef.current.srcObject = stream;
    }
  }, [stream]);

  // Play remote audio stream
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Get caller info
  useEffect(() => {
    if (incomingCall) {
      // For incoming calls, find user from users list or use selectedUser
      const caller = users.find(u => u._id === incomingCall.fromUserId) || 
                     (selectedUser?._id === incomingCall.fromUserId ? selectedUser : null) ||
                     { fullName: "Unknown User", profilePic: "/avatar.png" };
      setCallerInfo(caller);
    } else if (selectedUser) {
      // For outgoing calls, use selectedUser
      setCallerInfo(selectedUser);
    } else {
      setCallerInfo({ fullName: "Unknown User", profilePic: "/avatar.png" });
    }
  }, [incomingCall, selectedUser, users]);

  // Don't render if no call state or no caller info
  if ((!callState && !incomingCall) || !callerInfo) return null;

  // Incoming call (ringing)
  if (callState === "ringing" && incomingCall) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-base-300 rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-6">
          <div className="space-y-2">
            <div className="avatar mx-auto">
              <div className="size-24 rounded-full">
                <img
                  src={callerInfo.profilePic || "/avatar.png"}
                  alt={callerInfo.fullName}
                />
              </div>
            </div>
            <h3 className="text-2xl font-semibold">{callerInfo.fullName}</h3>
            <p className="text-base-content/70">
              {callType === "video" ? "Video" : "Audio"} call incoming...
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={rejectCall}
              className="btn btn-error btn-circle btn-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={acceptCall}
              className="btn btn-success btn-circle btn-lg"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call (in-call or calling)
  if (callState === "calling" || callState === "in-call") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-base-300 rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-6">
          <div className="space-y-2">
            <div className="avatar mx-auto">
              <div className="size-24 rounded-full">
                <img
                  src={callerInfo.profilePic || "/avatar.png"}
                  alt={callerInfo.fullName}
                />
              </div>
            </div>
            <h3 className="text-2xl font-semibold">{callerInfo.fullName}</h3>
            <p className="text-base-content/70">
              {callState === "calling" ? "Calling..." : "In call"}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={endCall}
              className="btn btn-error btn-circle btn-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Hidden audio elements */}
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      </div>
    );
  }

  return null;
};

export default CallModal;

