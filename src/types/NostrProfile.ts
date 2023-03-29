/**
 * De facto standard schema of user profile in kind:0 events
 */
export type NostrProfile = {
  /** Screen name */
  name?: string;
  /** Display name */
  displayName?: string;
  /** Bio */
  about?: string;
  /** URL of the user's icon */
  picture?: string;
  /** URL of the banner image */
  banner?: string;
  /** NIP-05 identifier */
  nip05?: string;

  [key: string]: unknown;
};

export type NostrProfileWithMeta = NostrProfile & {
  /** `pubkey` of orifinal event */
  pubkey: string;
  /** `created_at` of original event */
  created_at: number;
};
