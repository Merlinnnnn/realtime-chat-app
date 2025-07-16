import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useGroupStore();
  const { getFriends, friends, isFriendsLoading } = useFriendStore();
  const { authUser: user } = useAuthStore();
  
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getFriends();
    }
  }, [isOpen, getFriends]);

  const handleFriendToggle = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedFriends.length === 0) {
      alert("Please select at least one friend");
      return;
    }

    setIsCreating(true);
    try {
      await createGroup({
        name: groupName.trim(),
        members: selectedFriends
      });
      
      // Reset form
      setGroupName("");
      setSelectedFriends([]);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-300 rounded-full"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-3 border border-base-300 rounded-lg bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter group name..."
              disabled={isCreating}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Friends ({selectedFriends.length} selected)
            </label>
            
            {isFriendsLoading ? (
              <div className="text-center py-4">
                <div className="loading loading-spinner loading-md"></div>
                <p className="mt-2 text-sm text-zinc-500">Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-4 text-zinc-500">
                No friends available
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend._id}
                    type="button"
                    onClick={() => handleFriendToggle(friend._id)}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg border transition-colors ${
                      selectedFriends.includes(friend._id)
                        ? "bg-primary text-primary-content border-primary"
                        : "bg-base-200 hover:bg-base-300 border-base-300"
                    }`}
                    disabled={isCreating}
                  >
                    <img
                      src={friend.profilePic || "/avatar.png"}
                      alt={friend.fullName}
                      className="size-10 object-cover rounded-full"
                    />
                    <span className="font-medium flex-1 text-left">
                      {friend.fullName}
                    </span>
                    {selectedFriends.includes(friend._id) && (
                      <Check className="size-5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 border border-base-300 rounded-lg hover:bg-base-300 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !groupName.trim() || selectedFriends.length === 0}
              className="flex-1 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading loading-spinner loading-sm"></div>
                  Creating...
                </div>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal; 