import { Box, Text, VStack } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import type { NostrEvent } from "nostr-fetch";
import { utils } from "nostr-tools";
import { Suspense, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LoginPane } from "./components/LoginPane";
import { WaybackQueryForm } from "./components/WaybackQueryForm";
import { EventFetcher } from "./nostr/EventFetcher";
import { myDataAtom, myPubkeyAtom } from "./states/Profiles";
import type { WaybackQuery } from "./types/WaybackQuery";

export const App = () => {
  const [myPubkey, setMyPubkey] = useAtom(myPubkeyAtom);

  const { followList, relayList } = useAtomValue(myDataAtom);
  const readRelays = useMemo(
    () =>
      Object.entries(relayList)
        .filter(([, usage]) => usage.read)
        .map(([url]) => url),
    [relayList]
  );

  const [posts, setPosts] = useState<NostrEvent[]>([]);

  const handleLogin = (pkey: string) => {
    setMyPubkey(pkey);
  };

  const handleQuery = async (q: WaybackQuery) => {
    for await (const ev of EventFetcher.fetchTextNotes(
      followList,
      q,
      readRelays
    )) {
      console.log(ev);
      setPosts((prev) => utils.insertEventIntoDescendingList(prev, ev));
    }
  };

  return (
    <Box maxW={800} mt={4} mx="auto">
      <Header />
      <Suspense fallback="...">
        <Box mt={4}>
          {myPubkey === "" && <LoginPane onLogin={handleLogin} />}
          {myPubkey !== "" && (
            <>
              <WaybackQueryForm onClickQuery={handleQuery} />
              <VStack>
                {posts.map((post) => (
                  <Text key={post.id}>{post.content}</Text>
                ))}
              </VStack>
            </>
          )}
        </Box>
      </Suspense>
    </Box>
  );
};
