import { Flex, HStack, Text } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { PostQuery, usePostIds } from "../states/Posts";
import { ongoingWaybackQueryAtom } from "../states/WaybackQuery";
import { formatWaybackQuery } from "../types/WaybackQuery";
import { Post } from "./Post";

type PostTimelineProps = {
  postQuery: PostQuery;
};

export const PostTimeline: React.FC<PostTimelineProps> = ({ postQuery }) => {
  const ongoingWaybackQuery = useAtomValue(ongoingWaybackQueryAtom);
  const postIds = usePostIds(postQuery);

  return (
    <Flex w="100%" direction="column" gap={1}>
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
    </Flex>
  );
};
