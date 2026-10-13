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

export type MyProfile = UserSearchResult & {
  /** Only returned for the signed-in user. */
  email?: string;
};

export const getMyProfile = async (): Promise<MyProfile> => {
  const response = await mainCallApi.get("/users/me");
  return response.data;
};

/** Permanently deletes the account and everything it owns (projects, tasks, notes, commands). */
/** Schedules the deletion: the backend purges the account after a grace period unless the user signs in again. */
export const deleteMyAccount = async (): Promise<{ deletionScheduledFor: string }> => {
  const response = await mainCallApi.delete("/users/me");
  return response.data;
};
