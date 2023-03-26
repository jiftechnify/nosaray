import { VStack } from "@chakra-ui/react";
import { PostQuery, usePostIds } from "../states/Posts";
import { Post } from "./Post";

type PostTimelineProps = {
  postQuery: PostQuery;
};

export const PostTimeline: React.FC<PostTimelineProps> = ({ postQuery }) => {
  const postIds = usePostIds(postQuery);

  return (
    <VStack>
      {postIds.map((id) => (
        <Post key={id} id={id} />
      ))}
    </VStack>
  );
};
