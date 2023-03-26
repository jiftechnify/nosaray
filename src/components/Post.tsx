import {
  Avatar,
  Card,
  Fade,
  Grid,
  GridItem,
  Text,
  useClipboard,
} from "@chakra-ui/react";
import { format, fromUnixTime } from "date-fns";
import { atom, useAtomValue } from "jotai";
import { nip19 } from "nostr-tools";
import { usePost } from "../states/Posts";
import { profileAtomFamily } from "../states/Profiles";

type PostProps = {
  id: string;
};

const undefAtom = atom(undefined);

export const Post: React.FC<PostProps> = ({ id }) => {
  const post = usePost(id);
  const profile = useAtomValue(
    post ? profileAtomFamily(post.pubkey) : undefAtom
  );
  const { onCopy, hasCopied } = useClipboard(
    post?.id ? nip19.noteEncode(post.id) : ""
  );

  if (post === undefined) {
    return null;
  }
  return (
    <Card
      p={3}
      w="100%"
      whiteSpace="pre-wrap"
      key={post.id}
      onClick={onCopy}
      cursor="pointer"
      _hover={{ backgroundColor: "gray.50" }}
    >
      <Grid
        templateAreas={`"icon author date"
                        "icon text   text"`}
        templateRows={"1.4em 1fr"}
        templateColumns={"48px minmax(0, 1fr) 120px"}
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
          <Text color="gray.600">
            {format(fromUnixTime(post.created_at), "M/d HH:mm:ss")}
          </Text>
        </GridItem>
      </Grid>
      <Fade in={hasCopied}>
        <Text fontSize="xs" position="absolute" right="8px" bottom="8px">
          Copied Note ID!
        </Text>
      </Fade>
    </Card>
  );
};
