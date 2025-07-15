import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
// Đã xóa import { useEffect } from "react"; vì không được dùng hook trong store

export const useFriendStore = create((set, get) => ({
  friends: [],
  isFriendsLoading: false,
  friendRequests: [],
  isFriendRequestsLoading: false,

  getFriends: async () => {
    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/friends`);
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friends");
    } finally {
      set({ isFriendsLoading: false });
    }
  },

  getFriendRequests: async () => {
    set({ isFriendRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load friend requests");
    } finally {
      set({ isFriendRequestsLoading: false });
    }
  },

  respondToFriendRequest: async (requestId, status) => {
    try {
      const res = await axiosInstance.post("/friends/change-status", { requestId, status });
      toast.success(res.data.message || `Friend request ${status}`);
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req._id !== requestId)
      }));
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to respond to friend request");
      return false;
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      const res = await axiosInstance.post("/friends/request", { receiverId });
      toast.success(res.data.message || "Friend request sent");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
      return false;
    }
  },

  checkFriendship: async (otherUserId) => {
    try {
      const res = await axiosInstance.get(`/groups/check-friendship/${otherUserId}`);
      return res.data.areFriends;
    } catch (error) {
      return false;
    }
  },
}));

// Đã xóa useEffect lắng nghe socket khỏi file store này. Nếu muốn lắng nghe socket, hãy thực hiện trong component React hoặc custom hook. 