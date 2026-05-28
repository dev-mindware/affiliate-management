import { api } from "./api";

export const profileService = {
  getProfile: async () => {
    return api.get("/affiliate/profile");
  },
  updateProfile: async (data: any) => {
    return api.patch("/affiliate/profile", data);
  },
};
