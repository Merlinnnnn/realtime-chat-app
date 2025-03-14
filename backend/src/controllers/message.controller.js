import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";

export const getUsersForSideBar = async (req, res) => {
    try {
        const logedInId = req.user._id;
        const filteredUsers = await User.find ({_id: {$ne:logedInId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUserForSideBar",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const getMessageById = async (req, res) => {
    try {
        const {id: userChatedTo} = req.params;
        const myId = req.user._id;
        const message = await Message.find({
            $or: [
                {senderId:myId, receiverId: userChatedTo},
                {senderId: userChatedTo, receiverId: myId}
            ]
        })
        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getUserForSideBar",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
export const sendMessageToId = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imgUrl;
        if (image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imgUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imgUrl,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in send message",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}