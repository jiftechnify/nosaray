import { Button, Menu, MenuButton, MenuGroup, MenuItemOption, MenuList, MenuOptionGroup } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { PostDisplayMode, postDisplayModeAtom } from "../states/Config";

export const HiddenMenu = () => {
  const [postDispMode, setPostDispMode] = useAtom(postDisplayModeAtom);

  return (
    <Menu>
      <MenuButton as={Button} filter="opacity(0%)">
        Hidden Menu
      </MenuButton>
      <MenuList>
        <MenuGroup fontSize="md" title="Welcome to Hidden Menu!" />
        <MenuOptionGroup
          title="Post Display Mode"
          type="radio"
          value={postDispMode}
          onChange={(v) => setPostDispMode(v as PostDisplayMode)}
        >
          <MenuItemOption value="normal">Normal</MenuItemOption>
          <MenuItemOption value="pubkey-hex-color">Pubkey Hex Color Icon</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
