import axios from "axios";

const api = axios.create({
  baseURL: "http://172.30.124.92:3000"
});

export default api;