import { Task } from "../models/task.model.js";

export const createTask = async (req, res) => {
  const { userId } = req.body;
  const task = await Task.create({
    ...req.body,
    userId: userId,
  });

  res.json({ message: "Task created", task });
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.userId });
  res.json({ tasks });
};

export const taskPerUser = async (req, res) => {
  const data = await Task.aggregate([
    {
      $group: {
        _id: "$userId",
        totalTasks: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        userEmail: "$user.email",
        totalTasks: 1,
      },
    },
  ]);

  console.log(data);
  return res.json({ message: "Task per user fetched", data });
};
