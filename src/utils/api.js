// const URL= 'https://tbh-api-production-c79a.up.railway.app/'

import axios from "axios";

const api = axios.create({
	baseURL: "http://192.168.0.198:3000/api",
	withCredentials: true,
});

export default api;
