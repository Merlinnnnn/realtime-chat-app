import User from "../models/user.model.js";
import Friendship from "../models/friendship.model.js";

export const addFriend = async (req , res) =>{
    const {senderId, receiverId} = req.body;
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if(!sender && !receiver) {
            return res.status(404).json({message: "User not found"});
        }

        if(sender.friends.includes(receiverId)) {
            return res.status(400).json({message: "Alredy friends"})
        }

        const existingRequest = await Friendship.findOne({
            sender: senderId,
            receiver: receiverId,
            status: "pending",
        })

        if (existingRequest) {
            return res.status(400).json({message: "Friend request already exits"});
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

export const changeStatus = async (req, res) => {
    const {requestId, status} =req.body;
    try {
        const request = await Friendship.findById(requestId);
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        if(!request) {
            return res.status(404).json({ message: "request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: "Friend request already processed" });
        }

        request.status = status;
        await request.save();
        if (status === "accepted") {
            const sender = await User.findById(friendship.sender);
            const receiver = await User.findById(friendship.receiver);

            if (!sender || !receiver) {
                return res.status(404).json({ message: "User not found" });
            }

            sender.friends.push(sender._id);
            receiver.friends.push(receiver._id);

            await sender.save();
            await receiver.save();
            res.status(200).json({ message: `Friend request ${status}` });
        }
    } catch (error) {
        console.error("Error at changing friend request status:", error);
        res.status(500).json({ error: error.message });
    }
}
