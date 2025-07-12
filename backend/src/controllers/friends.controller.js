import User from "../models/user.model.js";
import Friendship from "../models/friendship.model.js";

export const addFriend = async (req , res) =>{
    console.log("Add Friend Api");
    const senderId = req.user._id; // Lấy từ middleware auth
    const {receiverId} = req.body;
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if(!sender || !receiver) {
            return res.status(404).json({message: "User not found"});
        }

        if(sender.friends.includes(receiverId)) {
            return res.status(400).json({message: "Already friends"})
        }

        const existingRequest = await Friendship.findOne({
            sender: senderId,
            receiver: receiverId,
            status: "pending",
        })

        if (existingRequest) {
            return res.status(400).json({message: "Friend request already exists"});
        }

        await Friendship.create({
            sender: senderId,
            receiver: receiverId,
            status: "pending", // "pending", "accepted", "rejected"
        });

        res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
        console.log("Error at Send add friend request");
        res.status(500).json({ error: error.message });
    }
}

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await Friendship.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "fullName profilePic");
        
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error getting friend requests:", error);
        res.status(500).json({ error: error.message });
    }
};

export const changeStatus = async (req, res) => {
    const { requestId, status } = req.body;
    try {
        const request = await Friendship.findById(requestId);

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Friend request already processed" });
        }

        request.status = status;
        await request.save();

        if (status === "accepted") {
            const sender = await User.findById(request.sender);
            const receiver = await User.findById(request.receiver);

            if (!sender || !receiver) {
                return res.status(404).json({ message: "User not found" });
            }
            sender.friends.push(receiver._id);
            receiver.friends.push(sender._id);

            await sender.save();
            await receiver.save();
        }

        return res.status(200).json({ message: `Friend request ${status}` });
    } catch (error) {
        console.error("Error at changing friend request status:", error);
        return res.status(500).json({ error: error.message });
    }
};

