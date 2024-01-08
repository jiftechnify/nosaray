import { CopyIcon } from "@chakra-ui/icons";
import { IconButton, IconButtonProps, Tooltip, useClipboard } from "@chakra-ui/react";
import { neventEncode } from "nostr-tools/nip19";
import { clearPostSelection, useSelectedPostIds } from "../states/Posts";

type CopyNeventsButtonProps = Omit<IconButtonProps, "aria-label" | "icon" | "onClick">;

export const CopyNeventsButton: React.FC<CopyNeventsButtonProps> = (props) => {
  const selectedIds = useSelectedPostIds("created-at-asc");
  const lineSeparatedIds = selectedIds.map((id) => neventEncode({ id })).join("\n");
  const { onCopy } = useClipboard(lineSeparatedIds);

  return selectedIds.length > 0 ? (
    <Tooltip label="選択投稿のID(nevent)を一括コピー">
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
