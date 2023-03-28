import { Flex, HStack, Text } from "@chakra-ui/react";
import { PostQuery, usePostIds } from "../states/Posts";
import { formatWaybackQuery, WaybackQuery } from "../types/WaybackQuery";
import { Post } from "./Post";

type PostTimelineProps = {
  ongoingWaybackQuery?: WaybackQuery;
  postQuery: PostQuery;
};

export const PostTimeline: React.FC<PostTimelineProps> = ({
  ongoingWaybackQuery,
  postQuery,
}) => {
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
