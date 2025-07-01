//TODO: build a healthcheck response that simply returns the OK status as json with a message
import mongoose from "mongoose";

const healthCheck = async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    uptime: process.uptime(), // server uptime in seconds
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

export { healthCheck };
