import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [], // Thêm danh sách nhóm
  friends: [], // Thêm danh sách bạn bè
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isGroupsLoading: false, // Thêm trạng thái loading cho groups
  isMessagesLoading: false,
  isFriendsLoading: false, // Thêm trạng thái loading cho friends

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/get-groups"); // API lấy danh sách nhóm
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

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

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      const newGroup = res.data;
      
      // Thêm group mới vào danh sách
      set(state => ({
        groups: [...state.groups, newGroup]
      }));
      
      toast.success("Group created successfully!");
      return newGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },

  addGroupMember: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/add-members`, {
        memberIds
      });
      
      // Cập nhật group trong store
      set(state => ({
        groups: state.groups.map(group => 
          group._id === groupId ? { ...group, members: res.data.members } : group
        )
      }));
      
      return res.data;
    } catch (error) {
      console.error("Error adding group members:", error);
      toast.error(error.response?.data?.message || "Failed to add members");
      throw error;
    }
  },



  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  getMessagesGroup: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      console.log(res);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  sendMessageGroup: async (messageData) => {
    const { selectedGroup, messages } = get();
    if (!selectedGroup) return;
  
    try {
      const res = await axiosInstance.post(`/messages/send-group/${selectedGroup._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Can not send");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
  setNull : () => {
    set({ selectedUser : null}),
    set({ selectedGroup : null });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  checkFriendship: async (otherUserId) => {
    try {
      const res = await axiosInstance.get(`/groups/check-friendship/${otherUserId}`);
      return res.data.areFriends;
    } catch (error) {
      return false;
    }
  },

  friendRequests: [],
  isFriendRequestsLoading: false,

  getFriendRequests: async () => {
    set({ isFriendRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      console.error("Error getting friend requests:", error);
      toast.error(error.response?.data?.message || "Failed to load friend requests");
    } finally {
      set({ isFriendRequestsLoading: false });
    }
  },

  respondToFriendRequest: async (requestId, status) => {
    try {
      const res = await axiosInstance.post("/friends/change-status", {
        requestId,
        status,
      });
      toast.success(res.data.message || `Friend request ${status}`);
      
      // Remove the request from the list
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req._id !== requestId)
      }));
      
      return true;
    } catch (error) {
      console.error("Error responding to friend request:", error);
      toast.error(error.response?.data?.message || "Failed to respond to friend request");
      return false;
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      console.log("Sending friend request to:", receiverId);
      console.log("Current cookies:", document.cookie);
      const res = await axiosInstance.post("/friends/request", {
        receiverId,
      });
      console.log("Friend request response:", res);
      toast.success(res.data.message || "Friend request sent");
      return true;
    } catch (error) {
      console.error("Friend request error:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to send friend request");
      return false;
    }
  },
}));
