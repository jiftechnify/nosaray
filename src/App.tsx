import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { Suspense, useMemo } from "react";
import { Header } from "./components/Header";
import { LoginPane } from "./components/LoginPane";
import { PostTimeline } from "./components/PostTimeline";
import { WaybackQueryForm } from "./components/WaybackQueryForm";
import type { PostOrder } from "./states/Posts";
import { myPubkeyAtom } from "./states/Profiles";
import { waybackQueryInputsAtom } from "./states/WaybackQuery";

export const App = () => {
  const myPubkey = useAtomValue(myPubkeyAtom);
  const queryInputs = useAtomValue(waybackQueryInputsAtom);

  const postOrder: PostOrder = useMemo(() => {
    if (queryInputs?.type === "since-and-until") {
      // show oldest first when since < until (natural order), newest first when reversed
      return queryInputs.sinceDatetime <= queryInputs.untilDatetime ? "created-at-asc" : "created-at-desc";
    }
    return "created-at-desc";
  }, [queryInputs]);

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
                <PostTimeline postQuery={{ order: postOrder }} />
              </Flex>
            )}
          </Box>
        </Suspense>
      </Box>
    </>
  );
};
