import { clearPosts, clearPostSelection } from "./Posts";
import { clearProfiles } from "./Profiles";
import { clearOngoingWaybackQuery } from "./WaybackQuery";

export const clearAllStates = () => {
  clearPosts();
  clearPostSelection();
  clearProfiles();
  clearOngoingWaybackQuery();
};
