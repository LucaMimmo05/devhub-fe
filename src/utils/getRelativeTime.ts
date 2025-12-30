export const timeSince = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(date.getTime())) return "";

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (seconds < minute) {
    return "just now";
  }

  if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes} min ago`;
  }

  if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (seconds < day * 2) {
    return "yesterday";
  }

  const days = Math.floor(seconds / day);
  return `${days} days ago`;
};
