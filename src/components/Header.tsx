import { Avatar, Flex, Heading, Spacer, Text, Tooltip } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { myDataAtom } from "../states/Profiles";

export const Header: React.FC = () => {
  // const myPubkey = useAtomValue(myPubkeyAtom);
  const { profile } = useAtomValue(myDataAtom);

  const tipText = profile?.display_name ?? "ログイン中";

  return (
    <Flex w={800} align="baseline">
      <Heading>Nosaray</Heading>
      <Text ms={2} fontSize="sm" color="gray.600">
        Wayback Machine for Nostr.
      </Text>
      <Spacer />
      <Tooltip label={tipText}>
        <Avatar size="sm" src={profile?.picture ?? ""} alignSelf="center" />
      </Tooltip>
    </Flex>
  );
};
