const LOGO_TAG_PREFIX = "[[ORG_LOGO:";
const LOGO_TAG_SUFFIX = "]]";

/**
 * Extracts logo url (if present) and clean catatan text from raw catatan string.
 */
export function extractOrgLogoAndNotes(rawCatatan: string | null | undefined): {
  logoUrl: string | null;
  notes: string;
} {
  if (!rawCatatan) {
    return { logoUrl: null, notes: "" };
  }

  const regex = /\[\[ORG_LOGO:([\s\S]*?)\]\]/;
  const match = rawCatatan.match(regex);

  if (!match) {
    return { logoUrl: null, notes: rawCatatan };
  }

  const logoUrl = match[1].trim() || null;
  const notes = rawCatatan.replace(regex, "").trim();

  return { logoUrl, notes };
}

/**
 * Packs logo url and notes text into a stored catatan string.
 */
export function packOrgLogoAndNotes(
  notes: string | null | undefined,
  logoUrl: string | null | undefined
): string {
  const cleanNotes = (notes || "").trim();
  const cleanLogo = (logoUrl || "").trim();

  if (!cleanLogo) {
    return cleanNotes;
  }

  const tag = `${LOGO_TAG_PREFIX}${cleanLogo}${LOGO_TAG_SUFFIX}`;
  return cleanNotes ? `${tag}\n\n${cleanNotes}` : tag;
}
