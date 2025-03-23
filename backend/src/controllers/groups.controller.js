import User from "../models/user.model.js";
import Group from "../models/group.model.js";

export const create = async (req , res) =>{
    const { name, members, createdBy } = req.body;

    try {
        const group = new Group({ name, members, createdBy });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
