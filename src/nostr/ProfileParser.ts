import type { NostrProfile } from "../types/NostrProfile";

const pullOutStringProp = (
  r: Record<string, unknown>,
  keyCandidates: string[]
): string | undefined => {
  const candidates: unknown[] = [];
  for (const k of keyCandidates) {
    candidates.push(r[k]);
    delete r[k];
  }
  for (const c of candidates) {
    if (typeof c === "string") {
      return c;
    }
  }
  return undefined;
};

export const parseNostrProfile = (
  k0Content: string
): NostrProfile | undefined => {
  try {
    const j = JSON.parse(k0Content) as unknown;
    if (typeof j !== "object" || j === null || Array.isArray(j)) {
      throw Error();
    }
    const r = j as Record<string, unknown>;

    const knownProps = {
      name: pullOutStringProp(r, ["name", "username"]),
      displayName: pullOutStringProp(r, ["display_name", "displayName"]),
      about: pullOutStringProp(r, ["about"]),
      picture: pullOutStringProp(r, ["picture"]),
      banner: pullOutStringProp(r, ["banner"]),
      nip05: pullOutStringProp(r, ["nip05", "nip-05", "nip5"]),
    };
    return { ...knownProps, ...r };
  } catch {
    console.error(
      "parseNostrProfile: failed to parse kind 0 content as profile",
      k0Content
    );
    return undefined;
  }
};
