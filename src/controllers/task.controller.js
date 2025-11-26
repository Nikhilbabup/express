import { Task } from "../models/task.model.js";
import { redisClient } from "../utils/redisClient.js";

export const createTask = async (req, res) => {
  const { userId } = req.body;
  const task = await Task.create({
    ...req.body,
    userId: userId,
  });

  res.json({ message: "Task created", task });
};

export const getTasks = async (req, res) => {
  const cacheKey = `tasks_user_${req.user.id}`;  
  // await redisClient.del(cacheKey);
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log(cached);
    
    return res.json({ tasks: JSON.parse(cached), source: "cache" });
  }
  const tasks = await Task.find({ userId: req.user.id });
  await redisClient.setEx(cacheKey, 60, JSON.stringify(tasks));
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
