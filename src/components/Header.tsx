import {
  Avatar,
  Box,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { myDataAtom, myPubkeyAtom } from "../states/Profiles";

export const Header: React.FC = () => {
  const isLoggedIn = useAtomValue(myPubkeyAtom) !== "";

  return (
    <Flex w={800} align="baseline">
      <Heading>Nosaray</Heading>
      <Text fontSize="sm">pre-alpha</Text>
      <Text ms={2} fontSize="sm" color="gray.600">
        Wayback Machine for Nostr.
      </Text>
      <Spacer />
      {isLoggedIn && (
        <Box cursor="pointer" alignSelf="center">
          <AccountMenu />
        </Box>
      )}
    </Flex>
  );
};

const AccountMenu: React.FC = () => {
  const { profile } = useAtomValue(myDataAtom);
  const tipText = profile?.display_name ?? profile?.name ?? "ログイン中";

  const resetMyPubkey = useResetAtom(myPubkeyAtom);

  return (
    <Menu>
      <MenuButton as={Avatar} size="sm" src={profile?.picture ?? ""} />
      <MenuList>
        <MenuGroup title={tipText}>
          <MenuItem onClick={resetMyPubkey}>ログアウト</MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
};
