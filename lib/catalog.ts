export type CatalogInfo = {
  username: string;
  description: string;
  whatsapp: string;
  primaryColor: string;
  logoUrl: string;
};

const FALLBACK_CATALOG: CatalogInfo = {
  username: "Nexum",
  description:
    "Tienda de vasos, termitos, termos y accesorios para el hogar.",
  whatsapp: "",
  primaryColor: "#7c5cff",
  logoUrl: "",
};

function normalizeColor(color: string | undefined): string {
  if (!color) {
    return FALLBACK_CATALOG.primaryColor;
  }

  const trimmed = color.trim();
  const hexColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return hexColor.test(trimmed) ? trimmed : FALLBACK_CATALOG.primaryColor;
}

export async function getCatalogInfo(company: string): Promise<CatalogInfo> {
  const normalizedCompany = company.trim().toLowerCase();

  if (!normalizedCompany) {
    return FALLBACK_CATALOG;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/catalog/${encodeURIComponent(normalizedCompany)}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        ...FALLBACK_CATALOG,
        username: normalizedCompany,
      };
    }

    const payload = (await response.json()) as Partial<CatalogInfo>;
    const username = payload.username?.trim() || normalizedCompany;

    return {
      username,
      description: payload.description?.trim() || FALLBACK_CATALOG.description,
      whatsapp: payload.whatsapp?.trim() || "",
      primaryColor: normalizeColor(payload.primaryColor),
      logoUrl: payload.logoUrl?.trim() || "",
    };
  } catch {
    return {
      ...FALLBACK_CATALOG,
      username: normalizedCompany,
    };
  }
}
