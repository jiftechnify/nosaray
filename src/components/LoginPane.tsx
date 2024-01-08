import { Alert, AlertIcon, AlertTitle, Button, Center, HStack, Text } from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import { nip07ExtAtom } from "../states/Nip07Ext";
import { myPubkeyAtom } from "../states/Profiles";

export const LoginPane: React.FC = () => {
  const nip07Ext = useAtomValue(nip07ExtAtom);
  const setMyPubkey = useSetAtom(myPubkeyAtom);

  const handleClickLogin = async () => {
    setMyPubkey(await window.nostr.getPublicKey());
  };

  return (
    <Center mt={4} height="54px">
      {nip07Ext ? (
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
      )}
    </Center>
  );
};
