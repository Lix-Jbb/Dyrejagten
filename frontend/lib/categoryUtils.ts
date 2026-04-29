const CATEGORY_MAP: Record<string, string> = {
  insekt: "Insekter",
  insekter: "Insekter",
  bille: "Insekter",
  biller: "Insekter",
  sommerfugl: "Insekter",
  fugl: "Fugle",
  fugle: "Fugle",
  pattedyr: "Pattedyr",
  krybdyr: "Krybdyr og padder",
  padde: "Krybdyr og padder",
  padder: "Krybdyr og padder",
  frø: "Krybdyr og padder",
  tudse: "Krybdyr og padder",
  salamander: "Krybdyr og padder",
  "krybdyr og padder": "Krybdyr og padder",
  fisk: "Fisk",
  edderkop: "Edderkopper og smådyr",
  edderkopper: "Edderkopper og smådyr",
  "edderkopper og smådyr": "Edderkopper og smådyr",
  leddyr: "Edderkopper og smådyr",
  smådyr: "Edderkopper og smådyr",
  havdyr: "Hav- og stranddyr",
  stranddyr: "Hav- og stranddyr",
  krabbe: "Hav- og stranddyr",
  musling: "Hav- og stranddyr",
  snegl: "Hav- og stranddyr",
  "hav og stranddyr": "Hav- og stranddyr",
  "hav- og stranddyr": "Hav- og stranddyr",
  andre: "Andre dyr i Danmark",
  andet: "Andre dyr i Danmark",
  "andre dyr i danmark": "Andre dyr i Danmark",
};

export function normalizeCategory(value?: string | null) {
  if (!value) {
    return "Andre dyr i Danmark";
  }

  const normalized = value.trim().toLowerCase();
  return CATEGORY_MAP[normalized] || value.trim();
}