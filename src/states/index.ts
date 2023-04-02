import { clearPosts, clearPostSelection } from "./Posts";
import { clearProfiles } from "./Profiles";
import { clearWaybackQueryInputs } from "./WaybackQuery";

export const clearAllStates = () => {
  clearPosts();
  clearPostSelection();
  clearProfiles();
  clearWaybackQueryInputs();
};
