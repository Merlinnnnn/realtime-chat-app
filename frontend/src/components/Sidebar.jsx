import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, UsersRound, Plus, UserCheck, MoreVertical } from "lucide-react"; // Thêm UserCheck icon
import React from "react";
import CreateGroupModal from "./CreateGroupModal";
import GroupSettingsModal from "./GroupSettingsModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, selectedGroup, setSelectedGroup, isUsersLoading, getGroups, groups, setNull, checkFriendship, sendFriendRequest } = useChatStore();
  const { onlineUsers, authUser: currentUser } = useAuthStore();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts"); // Tab mặc định là Contacts
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [friendStatus, setFriendStatus] = useState({}); // { userId: true/false }
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState(null);
  const [isGroupSettingsModalOpen, setIsGroupSettingsModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);
  useEffect(() => {
    setNull();
  }, [activeTab]);

  useEffect(() => {
    // Kiểm tra tình bạn cho tất cả users (trừ bản thân)
    const fetchFriendStatus = async () => {
      console.log("Fetching friend status for users:", users.length);
      console.log("Current user:", currentUser);
      const statusObj = {};
      await Promise.all(
        users.filter(u => u._id !== currentUser?._id).map(async (u) => {
          statusObj[u._id] = await checkFriendship(u._id);
        })
      );
      setFriendStatus(statusObj);
    };
    if (users.length > 0 && currentUser?._id) fetchFriendStatus();
  }, [users, currentUser, checkFriendship]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  console.log("Filtered users:", filteredUsers.length);
  console.log("Current user ID:", currentUser?._id);

  const handleAddFriend = async (userId) => {
    console.log("Sending friend request to:", userId);
    console.log("Current user:", currentUser);
    const ok = await sendFriendRequest(userId);
    console.log("Friend request result:", ok);
    if (ok) {
      setFriendStatus((prev) => ({ ...prev, [userId]: false })); // Đánh dấu là đã gửi request (có thể reload lại trạng thái nếu muốn)
    }
  };

  console.log("isUsersLoading:", isUsersLoading);
  console.log("isGroupSettingsModalOpen:", isGroupSettingsModalOpen);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        {/* Tab điều hướng */}
        <div className="border-b border-base-300 w-full p-5 flex justify-between">
          <button 
            className={`flex items-center gap-2 p-2 rounded-md ${
              activeTab === "contacts" ? "bg-base-300" : ""
            }`}
            onClick={() => setActiveTab("contacts")}
          >
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </button>

          <button 
            className={`flex items-center gap-2 p-2 rounded-md ${
              activeTab === "groups" ? "bg-base-300" : ""
            }`}
            onClick={() => setActiveTab("groups")}
          >
            <UsersRound className="size-6" />
            <span className="font-medium hidden lg:block">Groups</span>
          </button>
        </div>

        {/* Hiển thị checkbox "Show online only" khi ở tab Contacts */}
        {activeTab === "contacts" && (
          <div className="mt-3 hidden lg:flex items-center gap-2 p-3">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        )}

        {/* Nút tạo group khi ở tab Groups */}
        {activeTab === "groups" && (
          <div className="mt-3 p-3">
            <button
              onClick={() => setIsCreateGroupModalOpen(true)}
              className="w-full p-3 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="size-5" />
              <span className="hidden lg:block">Create Group</span>
            </button>
          </div>
        )}

        {/* Danh sách Users */}
        {activeTab === "contacts" && (
          <div className="overflow-y-auto w-full py-3">
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                  selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                }`}
                disabled={user._id === currentUser?._id}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                  )}
                </div>
                <div className="hidden lg:block text-left min-w-0 flex-1">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
                {/* Icon bạn bè hoặc + */}
                {user._id !== currentUser?._id && (
                  friendStatus[user._id] ? (
                    <UserCheck className="size-5 text-green-500" title="Bạn bè" />
                  ) : (
                    <button
                      className="size-5 text-primary cursor-pointer hover:bg-base-300 rounded p-1"
                      title="Thêm bạn"
                      onClick={e => {
                        e.stopPropagation();
                        handleAddFriend(user._id);
                      }}
                    >
                      <Plus className="size-5" />
                    </button>
                  )
                )}
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">No online users</div>
            )}
          </div>
        )}

        {/* Danh sách Groups */}
        {activeTab === "groups" && (
          <div className="overflow-y-auto w-full py-3">
            {groups.length > 0 ? (
              groups.map((group) => (
                <div
                  key={group._id}
                  className={`group relative w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                    selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
                  }`}
                >
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <img
                      src={group.img || "/avatar.png"}
                      alt={group.name}
                      className="size-12 object-cover rounded-full"
                    />
                    <div className="hidden lg:block text-left min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                    </div>
                  </button>
                  
                  {/* Nút menu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Opening group settings for:", group.name);
                      setSelectedGroupForSettings(group);
                      setIsGroupSettingsModalOpen(true);
                    }}
                    className="p-1 hover:bg-base-200 rounded transition-opacity"
                    title="Group settings"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-zinc-500 py-4">No groups available</div>
            )}
          </div>
        )}
      </aside>

      {/* Modal tạo group */}
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />

      {/* Modal cài đặt group */}
      <GroupSettingsModal 
        isOpen={isGroupSettingsModalOpen}
        onClose={() => {
          setIsGroupSettingsModalOpen(false);
          setSelectedGroupForSettings(null);
        }}
        group={selectedGroupForSettings}
      />
    </>
  );
};

export default Sidebar;
