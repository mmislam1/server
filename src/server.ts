import mongoose from "mongoose";
import app from "./app";
import { config } from "./config/env";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
// Database Connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("🌿 MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
