export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL,
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  };
  
// Debug - log giá trị biến môi trường khi load config
console.log("Environment Variables in API_CONFIG:", {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  BASE_URL: API_CONFIG.BASE_URL,
  fromEnv: import.meta.env.VITE_API_URL ? true : false
});