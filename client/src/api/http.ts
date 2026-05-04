import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

export const http = axios.create({
  baseURL: baseURL ? `${baseURL.replace(/\/$/, "")}/api` : "/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("th_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function wsUrl(): string {
  const api = import.meta.env.VITE_API_URL || "";
  if (!api) {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${window.location.host}/ws`;
  }
  const u = new URL(api);
  const proto = u.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${u.host}/ws`;
}
