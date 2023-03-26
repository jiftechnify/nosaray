import { Box, Spinner } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { Suspense } from "react";
import { Header } from "./components/Header";
import { LoginPane } from "./components/LoginPane";
import { PostTimeline } from "./components/PostTimeline";
import { WaybackQueryForm } from "./components/WaybackQueryForm";
import { startFetchingPosts } from "./states/Posts";
import { myPubkeyAtom } from "./states/Profiles";
import type { WaybackQuery } from "./types/WaybackQuery";

export const App = () => {
  const [myPubkey, setMyPubkey] = useAtom(myPubkeyAtom);

  const handleLogin = (pkey: string) => {
    setMyPubkey(pkey);
  };

  const handleWayback = async (q: WaybackQuery) => {
    await startFetchingPosts(q);
  };

  return (
    <Box maxW={800} mt={4} mx="auto">
      <Header />
      <Suspense fallback={<Spinner />}>
        <Box mt={4}>
          {myPubkey === "" && <LoginPane onLogin={handleLogin} />}
          {myPubkey !== "" && (
            <>
              <WaybackQueryForm onClickWayback={handleWayback} />
              <PostTimeline postQuery={{ order: "created-at-desc" }} />
            </>
          )}
        </Box>
      </Suspense>
    </Box>
  );
};
