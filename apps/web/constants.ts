import { apiConfig } from "@uni-host/config";

export const API_URL = apiConfig.baseUrl;
export const WEB_URL = process.env.WEB_URL || "http://localhost:3000";
