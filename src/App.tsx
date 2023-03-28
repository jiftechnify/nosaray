import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { Suspense, useState } from "react";
import { Header } from "./components/Header";
import { LoginPane } from "./components/LoginPane";
import { PostTimeline } from "./components/PostTimeline";
import { WaybackQueryForm } from "./components/WaybackQueryForm";
import { startFetchingPosts } from "./states/Posts";
import { myPubkeyAtom } from "./states/Profiles";
import type { WaybackQuery } from "./types/WaybackQuery";

export const App = () => {
  const [myPubkey, setMyPubkey] = useAtom(myPubkeyAtom);
  const [ongoingWaybackQuery, setOngoingWaybackQuery] = useState<
    WaybackQuery | undefined
  >(undefined);

  const handleLogin = (pkey: string) => {
    setMyPubkey(pkey);
  };

  const handleWayback = async (q: WaybackQuery) => {
    setOngoingWaybackQuery(q);
    await startFetchingPosts(q);
  };

  return (
    <Box maxW={800} m={4} mx="auto">
      <Header />
      <Suspense fallback={<Spinner />}>
        <Box mt={4}>
          {myPubkey === "" && <LoginPane onLogin={handleLogin} />}
          {myPubkey !== "" && (
            <Flex direction="column" gap={4}>
              <WaybackQueryForm onClickWayback={handleWayback} />
              <PostTimeline
                ongoingWaybackQuery={ongoingWaybackQuery}
                postQuery={{ order: "created-at-desc" }}
              />
            </Flex>
          )}
        </Box>
      </Suspense>
    </Box>
  );
};
