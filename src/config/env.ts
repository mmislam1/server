import dotenv from "dotenv";
dotenv.config();

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS in .env");
}

export const config = {
  port: process.env.PORT || 5000,
  googleKeyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};
