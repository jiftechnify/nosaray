import { LinkIcon } from "@chakra-ui/icons";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { PostQuery, usePostIds } from "../states/Posts";
import { useOngoingWaybackQuery, waybackQueryInputsAtom } from "../states/WaybackQuery";
import { WaybackQuery, WaybackQueryInputs } from "../types/WaybackQuery";
import { CopyNeventsButton } from "./CopyNeventsButton";
import { CopyToClipboardButton } from "./CopyToClipboardButton";
import { Post } from "./Post";

type PostTimelineProps = {
  postQuery: PostQuery;
};

const shareLinkFromQueryInputs = (qin: WaybackQueryInputs | undefined): string => {
  const url = new URL(location.href);
  if (qin) {
    url.search = WaybackQueryInputs.toURLQuery(qin);
  } else {
    url.search = "";
  }
  return url.toString();
};

export const PostTimeline: React.FC<PostTimelineProps> = ({ postQuery }) => {
  const ongoingWaybackQuery = useOngoingWaybackQuery();
  const qin = useAtomValue(waybackQueryInputsAtom);

  const postIds = usePostIds(postQuery);

  return (
    <Flex position="relative" w="100%" direction="column" gap={1}>
      {ongoingWaybackQuery && (
        <HStack alignItems="baseline" alignSelf="start">
          <Text fontSize="2xl" fontWeight="bold">
            Result
          </Text>
          <Text>{WaybackQuery.format(ongoingWaybackQuery)}</Text>
          <Box alignSelf="center">
            <CopyToClipboardButton
              valueToCopy={shareLinkFromQueryInputs(qin)}
              tooltip={{ label: "共有リンクをコピー", placement: "top" }}
            >
              <LinkIcon color="gray.500" />
            </CopyToClipboardButton>
          </Box>
        </HStack>
      )}
      {postIds.map((id) => (
        <Post key={id} id={id} />
      ))}
      <CopyNeventsButton position="fixed" bottom="16px" ml="876px" size="lg" colorScheme="purple" isRound />
    </Flex>
  );
};
