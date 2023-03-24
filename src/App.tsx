import {
  Avatar,
  Box,
  Card,
  Grid,
  GridItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import { format, fromUnixTime } from "date-fns";
import { useAtom, useAtomValue } from "jotai";
import type { NostrEvent } from "nostr-fetch";
import { utils } from "nostr-tools";
import { Suspense, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { LoginPane } from "./components/LoginPane";
import { WaybackQueryForm } from "./components/WaybackQueryForm";
import { EventFetcher } from "./nostr/EventFetcher";
import { myDataAtom, myPubkeyAtom, profileAtomFamily } from "./states/Profiles";
import type { WaybackQuery } from "./types/WaybackQuery";

export const App = () => {
  const [myPubkey, setMyPubkey] = useAtom(myPubkeyAtom);

  const myData = useAtomValue(myDataAtom);
  const readRelays = useMemo(() => {
    if (myData?.relayList === undefined) {
      return undefined;
    }
    return Object.entries(myData.relayList)
      .filter(([, usage]) => usage.read)
      .map(([url]) => url);
  }, [myData.relayList]);

  const [posts, setPosts] = useState<NostrEvent[]>([]);

  const handleLogin = (pkey: string) => {
    setMyPubkey(pkey);
  };

  const resetPosts = async () => {
    setPosts([]);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  };

  const handleQuery = async (q: WaybackQuery) => {
    if (myData.followList === undefined || readRelays === undefined) {
      return;
    }

    await resetPosts();
    for await (const ev of EventFetcher.fetchTextNotes(
      myData.followList,
      q,
      readRelays
    )) {
      setPosts((prev) => utils.insertEventIntoDescendingList(prev, ev));
    }
  };

  return (
    <Box maxW={800} mt={4} mx="auto">
      <Header />

      <Box mt={4}>
        <Suspense fallback="...">
          {myPubkey === "" && <LoginPane onLogin={handleLogin} />}
          {myPubkey !== "" && (
            <>
              <WaybackQueryForm onClickQuery={handleQuery} />
              <VStack mt={4}>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </VStack>
            </>
          )}
        </Suspense>
      </Box>
    </Box>
  );
};

type PostCardProps = {
  post: NostrEvent;
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const profile = useAtomValue(profileAtomFamily(post.pubkey));

  return (
    <Card p={2} w="100%" whiteSpace="pre-wrap" key={post.id}>
      <Grid
        templateAreas={`"icon author"
                        "icon text"
                        "date date"`}
        templateRows={"1.4em 1fr 1.2em"}
        templateColumns={"48px minmax(0, 1fr)"}
        columnGap={4}
        rowGap={2}
      >
        <GridItem area="icon">
          <Avatar size="48px" src={profile?.picture ?? ""} />
        </GridItem>
        <GridItem area="author">
          <Text fontSize="1.05em" fontWeight="bold">
            {profile?.display_name ?? profile?.name ?? post.pubkey}
          </Text>
        </GridItem>
        <GridItem area="text">
          <Text whiteSpace="pre-wrap">{post.content}</Text>
        </GridItem>
        <GridItem area="date" justifySelf="end">
          <Text>{format(fromUnixTime(post.created_at), "M/d HH:mm:ss")}</Text>
        </GridItem>
      </Grid>
    </Card>
  );
};
