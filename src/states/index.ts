import { clearPosts } from "./Posts";
import { clearProfiles } from "./Profiles";
import { clearOngoingWaybackQuery } from "./WaybackQuery";

export const clearAllStates = () => {
  clearPosts();
  clearProfiles();
  clearOngoingWaybackQuery();
};
