/**
 * De facto standard schema of user profile in kind:0 events
 */
export type NostrProfile = {
  /** Screen name */
  name?: string;
  /** Display name */
  display_name?: string;
  /** Bio */
  about?: string;
  /** URL of user's icon */
  picture?: string;
  /** NIP-05 identifier */
  nip05?: string;

  [key: string]: string | undefined;
};
