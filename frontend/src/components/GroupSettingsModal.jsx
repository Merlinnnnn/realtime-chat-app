import React, { useState, useEffect } from "react";
import { X, Image, UserPlus, Check } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const GroupSettingsModal = ({ isOpen, onClose, group }) => {
  const { users, addGroupMember, getFriends, friends } = useChatStore();
  const { authUser: currentUser } = useAuthStore();
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const isGroupCreator = group?.createdBy === currentUser?._id;

  useEffect(() => {
    if (isOpen) {
      setIsUsersLoading(true);
      // Lấy danh sách bạn bè
      getFriends().finally(() => setIsUsersLoading(false));
    }
  }, [isOpen, getFriends]);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    setIsLoading(true);
    try {
      await addGroupMember(group._id, selectedUsers);
      toast.success("Friends added successfully!");
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error("Error adding friends:", error);
      toast.error("Failed to add friends");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = () => {
    // TODO: Implement change group image functionality
    toast.info("Change group image functionality coming soon!");
  };

  // Lọc ra những bạn bè chưa có trong group
  const availableFriends = friends.filter(friend => 
    !group?.members.includes(friend._id) && friend._id !== currentUser?._id
  );

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen || !group) return null;

  console.log("GroupSettingsModal rendering:", { isOpen, groupName: group?.name });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Group Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-300 rounded-full"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Group Info */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-20 rounded-full overflow-hidden bg-base-200 border-2 border-base-300 flex items-center justify-center">
              <img
                src={group.img || "/avatar.png"}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <p className="text-sm text-base-content/70">
                {group.members?.length || 0} members
              </p>
            </div>
          </div>
        </div>

        {/* Change Group Image Section */}
        {isGroupCreator && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">Group Image</h4>
            <button
              onClick={handleImageChange}
              className="w-full p-3 border border-base-300 rounded-lg hover:bg-base-200 transition-colors flex items-center gap-3"
              disabled={isLoading}
            >
              <Image className="size-5" />
              <span>Change Group Image</span>
            </button>
          </div>
        )}

        {/* Add Friends Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">
            Add Friends ({selectedUsers.length} selected)
          </h4>
          
          {isUsersLoading ? (
            <div className="text-center py-4">
              <div className="loading loading-spinner loading-md"></div>
              <p className="mt-2 text-sm text-base-content/70">Loading friends...</p>
            </div>
          ) : availableFriends.length === 0 ? (
            <div className="text-center py-4 text-base-content/70">
              No available friends to add
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableFriends.map((friend) => (
                <button
                  key={friend._id}
                  type="button"
                  onClick={() => handleUserToggle(friend._id)}
                  className={`w-full p-3 flex items-center gap-3 rounded-lg border transition-colors ${
                    selectedUsers.includes(friend._id)
                      ? "bg-primary text-primary-content border-primary"
                      : "bg-base-200 hover:bg-base-300 border-base-300"
                  }`}
                  disabled={isLoading}
                >
                  <img
                    src={friend.profilePic || "/avatar.png"}
                    alt={friend.fullName}
                    className="size-10 object-cover rounded-full"
                  />
                  <span className="font-medium flex-1 text-left">
                    {friend.fullName}
                  </span>
                  {selectedUsers.includes(friend._id) && (
                    <Check className="size-5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 p-3 border border-base-300 rounded-lg hover:bg-base-300 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={handleAddMembers}
              disabled={isLoading}
              className="flex-1 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  Adding...
                </div>
              ) : (
                `Add ${selectedUsers.length} friend${selectedUsers.length > 1 ? 's' : ''}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal; 