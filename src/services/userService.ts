import { mainCallApi } from ".";

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export const updateMyProfile = async (data: UpdateProfileRequest) => {
  const response = await mainCallApi.put("/users/me", data);
  return response.data;
};
