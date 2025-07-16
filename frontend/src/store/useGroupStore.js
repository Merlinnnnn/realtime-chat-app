import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore"; // Không cần import hook ở đây
import { useEffect } from "react"; // Không dùng useEffect ở file này

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  isGroupsLoading: false,
  messages: [],
  setMessages: (messages) => set({ messages }),

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/get-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      const newGroup = res.data;
      set(state => ({ groups: [...state.groups, newGroup] }));
      toast.success("Group created successfully!");
      return newGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },

  addGroupMember: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/add-members`, { memberIds });
      set(state => ({
        groups: state.groups.map(group =>
          group._id === groupId ? { ...group, members: res.data.members } : group
        )
      }));
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
      throw error;
    }
  },

  updateGroup: (updatedGroup) => set(state => ({
    groups: state.groups.map(group =>
      group._id === updatedGroup._id ? updatedGroup : group
    )
  })),

  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

  getMessagesGroup: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ messages: res.data });
    } catch (error) {
      // Có thể toast lỗi nếu muốn
    }
  },

  sendMessageGroup: async (messageData) => {
    const { selectedGroup, messages } = get();
    if (!selectedGroup) return;
    try {
      const res = await axiosInstance.post(`/messages/send-group/${selectedGroup._id}`, messageData);
      set({ messages: [...messages, res.data] });
      // Emit socket nếu muốn realtime
      const socket = useAuthStore.getState().socket;
      if (socket) {
        const memberIds = selectedGroup.members.map(m => m._id || m);
        console.log("FE emit sendGroupMessage", {
          groupId: selectedGroup._id,
          message: res.data,
          members: memberIds,
        });
        socket.emit("sendGroupMessage", {
          groupId: selectedGroup._id,
          message: res.data,
          members: memberIds,
        });
      }
    } catch (error) {
      // Có thể toast lỗi nếu muốn
    }
  },
}));

// Đã xóa useEffect ở cuối file. Nếu muốn lắng nghe socket, hãy thực hiện trong component React. 