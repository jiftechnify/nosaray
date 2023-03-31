import { CopyIcon } from "@chakra-ui/icons";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import { nip19 } from "nostr-tools";
import { clearPostSelection, useSelectedPostIds } from "../states/Posts";

type CopyNoteIdsButtonProps = Omit<
  IconButtonProps,
  "aria-label" | "icon" | "onClick"
>;

export const CopyNoteIdsButton: React.FC<CopyNoteIdsButtonProps> = (props) => {
  const selectedIds = useSelectedPostIds("created-at-asc");
  const lineSeparatedIds = selectedIds
    .map((id) => nip19.noteEncode(id))
    .join("\n");
  const { onCopy } = useClipboard(lineSeparatedIds);

  return selectedIds.length > 0 ? (
    <Tooltip label="選択投稿のIDを一括コピー">
      <IconButton
        aria-label="copy note ids of selected posts"
        icon={<CopyIcon />}
        onClick={() => {
          onCopy();
          clearPostSelection();
        }}
        {...props}
      />
    </Tooltip>
  ) : null;
};
