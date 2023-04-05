import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { Suspense } from "react";
import { Header } from "./components/Header";
import { LoginPane } from "./components/LoginPane";
import { PostTimeline } from "./components/PostTimeline";
import { WaybackQueryForm } from "./components/WaybackQueryForm";
import { myPubkeyAtom } from "./states/Profiles";

export const App = () => {
  const myPubkey = useAtomValue(myPubkeyAtom);

  return (
    <>
      <Box maxW={800} m={4} mx="auto">
        <Header />
        <Suspense fallback={<Spinner />}>
          <Box mt={4}>
            {myPubkey === "" && <LoginPane />}
            {myPubkey !== "" && (
              <Flex direction="column" gap={4}>
                <WaybackQueryForm />
                <PostTimeline postQuery={{ order: "created-at-desc" }} />
              </Flex>
            )}
          </Box>
        </Suspense>
      </Box>
    </>
  );
};
