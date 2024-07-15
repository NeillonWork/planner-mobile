import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.0.43:3333",
  //192.168.0.43
});
