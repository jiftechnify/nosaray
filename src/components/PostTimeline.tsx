import { Flex, HStack, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { PostQuery, usePostIds } from "../states/Posts";
import { ongoingWaybackQueryAtom } from "../states/WaybackQuery";
import { formatWaybackQuery } from "../types/WaybackQuery";
import { CopyNoteIdsButton } from "./CopyNoteIdsButton";
import { Post } from "./Post";

type PostTimelineProps = {
  postQuery: PostQuery;
};

export const PostTimeline: React.FC<PostTimelineProps> = ({ postQuery }) => {
  const ongoingWaybackQuery = useAtomValue(ongoingWaybackQueryAtom);
  const postIds = usePostIds(postQuery);

  return (
    <Flex position="relative" w="100%" direction="column" gap={1}>
      {ongoingWaybackQuery && (
        <HStack alignItems="baseline" alignSelf="start">
          <Text fontSize="2xl" fontWeight="bold">
            Result
          </Text>
          <Text>{formatWaybackQuery(ongoingWaybackQuery)}</Text>
        </HStack>
      )}
      {postIds.map((id) => (
        <Post key={id} id={id} />
      ))}
      <CopyNoteIdsButton
        position="fixed"
        bottom="16px"
        ml="876px"
        size="lg"
        colorScheme="purple"
        isRound
      />
    </Flex>
  );
};
