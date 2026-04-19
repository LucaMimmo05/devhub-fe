import { mainCallApi } from ".";

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

export type UserSearchResult = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
};

export const updateMyProfile = async (data: UpdateProfileRequest) => {
  const response = await mainCallApi.put("/users/me", data);
  return response.data;
};

export const searchUsers = async (username: string): Promise<UserSearchResult[]> => {
  const response = await mainCallApi.get(`/users/search?username=${encodeURIComponent(username)}`);
  return response.data;
};
