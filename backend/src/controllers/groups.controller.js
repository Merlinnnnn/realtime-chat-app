import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import Friendship from "../models/friendship.model.js";
import cloudinary from "../lib/cloudinary.js"; // Thêm dòng này ở đầu file nếu chưa có

export const create = async (req , res) =>{
    const { name, members } = req.body;
    const createdBy = req.user._id; // Lấy từ middleware auth

    try {
        // Kiểm tra xem tất cả members có tồn tại không
        const users = await User.find({ _id: { $in: members } });
        if (users.length !== members.length) {
            return res.status(400).json({ message: "Some users not found" });
        }

        const group = new Group({ 
            name, 
            members: [...members, createdBy], // Thêm người tạo vào danh sách thành viên
            createdBy 
        });
        await group.save();
        
        // Populate thông tin members trước khi trả về
        await group.populate("members", "fullName profilePic");
        
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getGroups = async (req, res) =>{
    const userId = req.user._id; // Lấy từ middleware auth
    console.log("GET /groups/get-groups called");
    try {
        const groups = await Group.find({ members: userId }).populate("members", "fullName profilePic");
        console.log('get-groups',groups);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getFriends = async (req, res) => {
    const userId = req.user._id; // Lấy từ middleware auth
    
    try {
        // Lấy danh sách bạn bè đã được chấp nhận
        const friendships = await Friendship.find({
            $or: [
                { sender: userId, status: "accepted" },
                { receiver: userId, status: "accepted" }
            ]
        });

        // Lấy danh sách ID của bạn bè
        const friendIds = friendships.map(friendship => {
            return friendship.sender.toString() === userId.toString()
                ? friendship.receiver 
                : friendship.sender;
        });

        // Lấy thông tin chi tiết của bạn bè
        const friends = await User.find({ _id: { $in: friendIds } })
            .select("fullName profilePic _id");

        res.status(200).json(friends);
    } catch (error) {
        console.error("Error getting friends:", error);
        res.status(500).json({ error: error.message });
    }
}

export const checkFriendship = async (req, res) => {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    try {
        const friendship = await Friendship.findOne({
            $or: [
                { sender: userId, receiver: otherUserId, status: "accepted" },
                { sender: otherUserId, receiver: userId, status: "accepted" }
            ]
        });
        res.status(200).json({ areFriends: !!friendship });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addGroupMembers = async (req, res) => {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Kiểm tra xem user có phải là creator hoặc member của group không
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Kiểm tra xem các user có tồn tại không
        const users = await User.find({ _id: { $in: memberIds } });
        if (users.length !== memberIds.length) {
            return res.status(400).json({ message: "Some users not found" });
        }

        // Thêm members mới vào group
        const newMembers = [...new Set([...group.members, ...memberIds])];
        group.members = newMembers;
        await group.save();

        // Populate thông tin members
        await group.populate("members", "fullName profilePic");

        res.status(200).json(group);
    } catch (error) {
        console.error("Error adding group members:", error);
        res.status(500).json({ error: error.message });
    }
}
export const updateGroupImage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { profilePic } = req.body;
        const userId = req.user._id;

        // Kiểm tra group tồn tại
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Kiểm tra quyền: chỉ cho phép thành viên nhóm cập nhật ảnh
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }

        // Upload ảnh lên cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Cập nhật ảnh đại diện nhóm (trường img)
        group.img = uploadResponse.secure_url;
        await group.save();

        // Populate thông tin members nếu cần
        await group.populate("members", "fullName profilePic");

        res.status(200).json(group);
    } catch (error) {
        console.log("Update fail", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
