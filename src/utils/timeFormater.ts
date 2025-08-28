
import moment from "moment-timezone";

export const timeFormaterFunc = (): string => {
  return moment.tz(Date.now(), "Europe/London").format("MMMM Do, h:mm A"); // e.g., "May 19th, 2:07 PM"
};
