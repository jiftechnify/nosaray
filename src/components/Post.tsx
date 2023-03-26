import { Avatar, Card, Grid, GridItem, Text } from "@chakra-ui/react";
import { format, fromUnixTime } from "date-fns";
import { atom, useAtomValue } from "jotai";
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

  if (post === undefined) {
    return null;
  }
  return (
    <Card p={3} w="100%" whiteSpace="pre-wrap" key={post.id}>
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
    </Card>
  );
};
