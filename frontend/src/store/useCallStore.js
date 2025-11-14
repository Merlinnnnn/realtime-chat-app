import { create } from "zustand";
import Peer from "simple-peer";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useCallStore = create((set, get) => ({
  callState: null, // 'idle' | 'calling' | 'ringing' | 'in-call' | 'ended'
  callType: null, // 'audio' | 'video'
  peer: null,
  stream: null,
  remoteStream: null,
  incomingCall: null, // { from: socketId, fromUserId: userId, type: 'audio' | 'video', signal: signalData }
  callReceiver: null, // userId of the person being called
  callReceiverSocketId: null, // socket ID of the person being called (for ending calls)
  socket: null,

  setSocket: (socket) => {
    set({ socket });
  },

  // Initialize call (caller side)
  startCall: async (receiverId, callType = "audio") => {
    const { socket } = get();
    if (!socket) {
      toast.error("Connection error. Please refresh the page.");
      return;
    }

    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      set({
        callState: "calling",
        callType,
        stream,
        callReceiver: receiverId,
      });

      // Create peer as initiator
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("signal", (data) => {
        const { authUser } = useAuthStore.getState();
        socket.emit("call-user", {
          userToCall: receiverId,
          signalData: data,
          from: socket.id,
          fromUserId: authUser._id,
          callType,
        });
      });

      peer.on("stream", (remoteStream) => {
        set({ remoteStream });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        toast.error("Call connection error");
        get().endCall();
      });

      socket.on("call-accepted", ({ signal, fromSocketId }) => {
        set({ callState: "in-call", callReceiverSocketId: fromSocketId });
        peer.signal(signal);
      });

      socket.on("call-rejected", () => {
        get().endCall();
        toast.info("Call rejected");
      });

      socket.on("call-ended", () => {
        get().endCall();
        toast.info("Call ended");
      });

      set({ peer });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to access microphone. Please check permissions.");
      get().endCall();
    }
  },

  // Accept incoming call
  acceptCall: async () => {
    const { socket, incomingCall } = get();
    if (!socket || !incomingCall) return;

    try {
      const constraints = {
        audio: true,
        video: incomingCall.type === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (data) => {
        socket.emit("accept-call", { signal: data, to: incomingCall.from });
      });

      peer.on("stream", (remoteStream) => {
        set({ remoteStream });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        toast.error("Call connection error");
        get().endCall();
      });

      peer.signal(incomingCall.signal);

      // Clean up listeners when call ends
      const handleCallEnded = () => {
        get().endCall();
        toast.info("Call ended");
      };
      socket.on("call-ended", handleCallEnded);

      set({
        peer,
        stream,
        callState: "in-call",
        callType: incomingCall.type,
        callReceiver: incomingCall.fromUserId,
        callReceiverSocketId: incomingCall.from,
        incomingCall: null,
      });
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to access microphone. Please check permissions.");
      get().rejectCall();
    }
  },

  // Reject incoming call
  rejectCall: () => {
    const { socket, incomingCall } = get();
    if (socket && incomingCall) {
      socket.emit("reject-call", { to: incomingCall.from });
    }
    set({
      incomingCall: null,
      callState: null,
      callType: null,
    });
  },

  // End call
  endCall: () => {
    const { peer, stream, socket, callReceiverSocketId, callReceiver, callState } = get();
    
    // Clean up peer connection
    if (peer) {
      peer.destroy();
    }
    
    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Notify the other party if call was active
    if (socket && callReceiverSocketId && (callState === "in-call" || callState === "calling")) {
      socket.emit("end-call", { to: callReceiverSocketId });
    }

    // Clean up socket listeners
    if (socket) {
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
    }

    set({
      callState: null,
      callType: null,
      peer: null,
      stream: null,
      remoteStream: null,
      callReceiver: null,
      callReceiverSocketId: null,
    });
  },

  // Set incoming call (called when receiving call-user event)
  setIncomingCall: (data) => {
    set({
      incomingCall: data,
      callState: "ringing",
      callType: data.callType,
    });
  },
}));

