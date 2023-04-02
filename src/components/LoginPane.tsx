import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Center,
  HStack,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { nip07ExtAtom } from "../states/Nip07Ext";
import { myPubkeyAtom } from "../states/Profiles";

export const LoginPane: React.FC = () => {
  const nip07Ext = useAtomValue(loadable(nip07ExtAtom));
  const setMyPubkey = useSetAtom(myPubkeyAtom);

  const handleClickLogin = async () => {
    setMyPubkey(await window.nostr.getPublicKey());
  };

  const content = (() => {
    switch (nip07Ext.state) {
      case "loading":
        return <Spinner />;

      case "hasData":
        const available = nip07Ext.data !== undefined;
        return available ? (
          <HStack>
            <Text>NIP-07拡張機能で</Text>
            <Button colorScheme="purple" onClick={handleClickLogin}>
              ログイン
            </Button>
          </HStack>
        ) : (
          <Alert status="warning" w="max-content">
            <AlertIcon />
            <AlertTitle>NIP-07拡張機能が利用できません</AlertTitle>
          </Alert>
        );

      case "hasError": // unreachable
        return null;
    }
  })();

  return (
    <Center mt={4} height="54px">
      {content}
    </Center>
  );
};
