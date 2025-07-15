import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  // Nếu không có user hoặc group thì không hiển thị header
  if (!selectedUser && !selectedGroup) return null;

  // Nếu có selectedUser, hiển thị thông tin user
  const isUser = !!selectedUser;
  const chatTarget = isUser ? selectedUser : selectedGroup;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img 
                src={chatTarget.profilePic || chatTarget.groupPic || "/avatar.png"} 
                alt={chatTarget.fullName || chatTarget.name || "Chat"} 
              />
            </div>
          </div>

          {/* User hoặc Group info */}
          <div>
            <h3 className="font-medium">{chatTarget.fullName || chatTarget.name || "Unknown"}</h3>
            {isUser ? (
              <p className="text-sm text-base-content/70">
                {chatTarget._id && onlineUsers.includes(chatTarget._id) ? "Online" : "Offline"}
              </p>
            ) : (
              <p className="text-sm text-base-content/70">Group Chat</p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => isUser ? setSelectedUser(null) : setSelectedGroup(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
