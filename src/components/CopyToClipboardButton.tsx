import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { Box, Tooltip, useClipboard } from "@chakra-ui/react";

type CopyToClipboardButtonProps = {
  valueToCopy: string;
  tooltipLabel?: string;
  children?: React.ReactNode;
};

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  valueToCopy,
  tooltipLabel,
  children,
}) => {
  const { onCopy, hasCopied } = useClipboard(valueToCopy, 500);
  const body = (
    <Box role="button" aria-label="copy share URL" onClick={onCopy}>
      {hasCopied ? (
        <CheckIcon color="green.300" />
      ) : (
        children ?? <CopyIcon color="gray.500" />
      )}
    </Box>
  );

  return tooltipLabel ? (
    <Tooltip label={hasCopied ? "" : tooltipLabel}>{body}</Tooltip>
  ) : (
    body
  );
};
