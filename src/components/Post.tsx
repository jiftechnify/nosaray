import { CheckIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Card,
  Grid,
  GridItem,
  HStack,
  Text,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import { format, fromUnixTime } from "date-fns";
import { atom, useAtomValue } from "jotai";
import { nip19 } from "nostr-tools";
import { usePost } from "../states/Posts";
import { profileAtomFamily } from "../states/Profiles";

const toTruncatedNpub = (hexPubkey: string) => {
  const npub = nip19.npubEncode(hexPubkey);
  return `${npub.slice(0, 8)}:${npub.slice(-8)}`;
};

const undefAtom = atom(undefined);

type PostProps = {
  id: string;
};

export const Post: React.FC<PostProps> = ({ id }) => {
  const post = usePost(id);
  const profile = useAtomValue(
    post ? profileAtomFamily(post.pubkey) : undefAtom
  );
  const noteId = post?.id ? nip19.noteEncode(post.id) : undefined;

  if (post === undefined) {
    return null;
  }
  return (
    <Card
      p={3}
      w="100%"
      whiteSpace="pre-wrap"
      key={post.id}
      _hover={{ backgroundColor: "gray.50" }}
    >
      <Grid
        templateAreas={`"icon author date"
                        "icon text   text"`}
        templateRows={"1.4em 1fr"}
        templateColumns={"48px minmax(0, 1fr) 120px"}
        columnGap={2}
        rowGap={2}
      >
        <GridItem area="icon">
          <Avatar size="48px" src={profile?.picture ?? ""} />
        </GridItem>
        <GridItem area="author">
          <Text fontSize="1.05em" fontWeight="bold">
            {profile?.display_name ??
              profile?.name ??
              toTruncatedNpub(post.pubkey)}
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
      <HStack position="absolute" top="12px" left="800px" px={2}>
        {noteId && <CopyNoteIdButton noteId={nip19.noteEncode(post.id)} />}
        {noteId && <OpenViaNosTxButton noteId={noteId} />}
      </HStack>
    </Card>
  );
};

type CopyNoteIdButtonProps = {
  noteId: string; // note1...
};

const CopyNoteIdButton: React.FC<CopyNoteIdButtonProps> = ({ noteId }) => {
  const { onCopy, hasCopied } = useClipboard(noteId);

  return (
    <Tooltip label={hasCopied ? "" : "Note IDをコピー"}>
      <Box role="button" aria-label="copy note id" onClick={onCopy}>
        {hasCopied ? (
          <CheckIcon color="green.300" />
        ) : (
          <CopyIcon color="gray.500" />
        )}
      </Box>
    </Tooltip>
  );
};

const NosTx_BASE_URL = "https://nostx.shino3.net";

type OpenViaNosTxButtonProps = {
  noteId: string; // note1...
};

const OpenViaNosTxButton: React.FC<OpenViaNosTxButtonProps> = ({ noteId }) => {
  const handleClick = () => {
    window.open(`${NosTx_BASE_URL}/${noteId}`);
  };

  return (
    <Tooltip label="NosTx経由で開く">
      <Box
        role="button"
        aria-label="open the note via NosTx"
        onClick={handleClick}
      >
        <ExternalLinkIcon color="gray.500" />
      </Box>
    </Tooltip>
  );
};
