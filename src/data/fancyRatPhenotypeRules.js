/**
 * Fancy Rat — Multi-locus phenotype combination rules
 *
 * Priority-ordered: the first rule whose `match` conditions ALL pass wins.
 *
 * Rule shape:
 *   { match: { [locusSymbol]: string[] }, phenotype: string, notes?: string, unconfirmed?: true, alternates?: string[] }
 *
 * `alternates` lists other names used for the same phenotype in the hobby
 * (e.g. regional/club naming variants) — informational only, does not affect matching.
 *
 * All conditions in `match` are AND logic.
 * A locus array means "any of these notations".
 *
 * Locus symbols match the geneLoci keys returned by the API (post symbol-override):
 *   A, B, Be, Bu, C, D, G, M, P, R           (color genes)
 *   Dal, Dw, H, Hs, Ma, Ro, Sf, Wh, Ws       (marking genes — appended as suffixes)
 *   Re, Ve, Sm, Lu, Sy, Sk, hr, hrl, sa, nz, fz, pw (coat genes — appended as suffixes)
 *   Du                                        (ear type — appended as suffix)
 *   dr, Mx                                     (body type genes — appended as suffixes)
 *   Me, Pe                                    (modifiers — append only when m/m present)
 *
 * A-locus shorthands used throughout:
 *   BLACK  = a/a   (self/black phenotype)
 *   AGOUTI = A/A or A/a  (agouti phenotype)
 */

const BLACK  = ['a/a'];
const AGOUTI = ['A/A', 'A/a'];

// Genotype notations are matched as exact strings throughout this file (e.g. 'Ws/w'),
// so any input with alleles in the reverse order (e.g. 'w/Ws') must be canonicalized
// before matching. Order: dominant/uppercase-first allele wins, then alphabetical.
function normalizeNotation(notation) {
  if (typeof notation !== 'string' || !notation.includes('/')) return notation;
  const [a, b] = notation.split('/');
  if (!a || !b) return notation;
  const aUpper = a[0] === a[0].toUpperCase() && a[0] !== a[0].toLowerCase();
  const bUpper = b[0] === b[0].toUpperCase() && b[0] !== b[0].toLowerCase();
  if (aUpper && !bUpper) return notation;
  if (!aUpper && bUpper) return `${b}/${a}`;
  return a.localeCompare(b) <= 0 ? notation : `${b}/${a}`;
}

function normalizeRatGenotype(genotype) {
  const normalized = {};
  for (const [locus, notation] of Object.entries(genotype)) {
    normalized[locus] = normalizeNotation(notation);
  }
  return normalized;
}

// C-locus notations that keep full pigment (C is present — carriers still show full color)
const FULL_C = ['C/C', 'C/ct', 'C/cm', 'C/ch', 'C/c'];

export const FANCY_RAT_PHENOTYPE_RULES = [

  // =========================================================
  // STONE & WHEATEN STONE — Bu + Albino (must precede plain Albino rule)
  // =========================================================
  { match: { A: AGOUTI, Bu: ['Bu/bu', 'Bu/Bu'], C: ['c/c'] }, phenotype: 'Wheaten Stone' },
  { match: { A: BLACK,  Bu: ['Bu/bu', 'Bu/Bu'], C: ['c/c'] }, phenotype: 'Stone'         },

  // =========================================================
  // ALBINO — masks all other color/pattern expression
  // =========================================================
  { match: { C: ['c/c'] }, phenotype: 'Albino' },

  // =========================================================
  // BURMESE × C-LOCUS — all Bu + restrictive-C combos (with or without dilutions)
  // are derived dynamically by deriveBuPhenotype() in matchFancyRatPhenotype.
  // =========================================================

  // =========================================================
  // SIAMESE (ch/ch) × DILUTION COMPOUNDS — most specific first
  // =========================================================
  { match: { C: ['ch/ch'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Point Siamese'    },
  { match: { C: ['ch/ch'], D: ['d/d'] },              phenotype: 'Russian Point Siamese' },
  { match: { C: ['ch/ch'], M: ['m/m'] },              phenotype: 'Mink Point Siamese'    },
  { match: { A: BLACK,  C: ['ch/ch'], B: ['b/b'] },   phenotype: 'Chocolate Point Siamese'         },
  { match: { A: AGOUTI, C: ['ch/ch'], B: ['b/b'] },   phenotype: 'Chocolate Agouti Point Siamese'  },
  { match: { A: BLACK,  C: ['ch/ch'], G: ['g/g'] },   phenotype: 'Blue Point Siamese'              },
  { match: { A: AGOUTI, C: ['ch/ch'], G: ['g/g'] },   phenotype: 'Blue Agouti Point Siamese'       },
  { match: { A: BLACK,  C: ['ch/ch'], P: ['p/p'] },   phenotype: 'Champagne Point Siamese'         },
  { match: { A: AGOUTI, C: ['ch/ch'], P: ['p/p'] },   phenotype: 'Amber Point Siamese'             },
  { match: { A: BLACK,  C: ['ch/ch'], R: ['r/r'] },   phenotype: 'Beige Point Siamese'             },
  { match: { A: AGOUTI, C: ['ch/ch'], R: ['r/r'] },   phenotype: 'Topaz Point Siamese'             },

  // =========================================================
  // HIMALAYAN (ch/c) × DILUTION COMPOUNDS
  // =========================================================
  { match: { C: ['ch/c'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Point Himalayan'    },
  { match: { C: ['ch/c'], D: ['d/d'] }, phenotype: 'Russian Point Himalayan' },
  { match: { C: ['ch/c'], M: ['m/m'] }, phenotype: 'Mink Point Himalayan'    },
  { match: { A: BLACK,  C: ['ch/c'], B: ['b/b'] },    phenotype: 'Chocolate Point Himalayan'        },
  { match: { A: AGOUTI, C: ['ch/c'], B: ['b/b'] },    phenotype: 'Chocolate Agouti Point Himalayan' },
  { match: { A: BLACK,  C: ['ch/c'], G: ['g/g'] },    phenotype: 'Blue Point Himalayan'             },
  { match: { A: AGOUTI, C: ['ch/c'], G: ['g/g'] },    phenotype: 'Blue Agouti Point Himalayan'      },
  { match: { A: BLACK,  C: ['ch/c'], P: ['p/p'] },    phenotype: 'Champagne Point Himalayan'        },
  { match: { A: AGOUTI, C: ['ch/c'], P: ['p/p'] },    phenotype: 'Amber Point Himalayan'            },
  { match: { A: BLACK,  C: ['ch/c'], R: ['r/r'] },    phenotype: 'Beige Point Himalayan'            },
  { match: { A: AGOUTI, C: ['ch/c'], R: ['r/r'] },    phenotype: 'Topaz Point Himalayan'            },

  // =========================================================
  // POINTED MARTEN (cm/ch) × DILUTION COMPOUNDS
  // =========================================================
  { match: { A: BLACK,  C: ['cm/ch'], B: ['b/b'] },   phenotype: 'Chocolate Pointed Marten'             },
  { match: { A: AGOUTI, C: ['cm/ch'], B: ['b/b'] },   phenotype: 'Chocolate Agouti Pointed Marten'      },
  { match: { A: BLACK,  C: ['cm/ch'], G: ['g/g'] },   phenotype: 'Blue Pointed Marten'                  },
  { match: { A: AGOUTI, C: ['cm/ch'], G: ['g/g'] },   phenotype: 'Blue Agouti Pointed Marten'           },
  { match: { A: BLACK,  C: ['cm/ch'], P: ['p/p'] },   phenotype: 'Champagne Pointed Marten'             },
  { match: { A: AGOUTI, C: ['cm/ch'], P: ['p/p'] },   phenotype: 'Amber Pointed Marten'                 },
  { match: { A: BLACK,  C: ['cm/ch'], R: ['r/r'] },   phenotype: 'Beige Pointed Marten'                 },
  { match: { A: AGOUTI, C: ['cm/ch'], R: ['r/r'] },   phenotype: 'Topaz Pointed Marten'                 },

  // =========================================================
  // MARTEN (cm/cm, cm/c) × DILUTION COMPOUNDS
  // =========================================================
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Marten' },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Agouti Marten' },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], D: ['d/d'] }, phenotype: 'Russian Marten' },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], D: ['d/d'] }, phenotype: 'Russian Agouti Marten' },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], M: ['m/m'] }, phenotype: 'Mink Marten'    },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], M: ['m/m'] }, phenotype: 'Cinnamon Marten' },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], B: ['b/b'] },   phenotype: 'Chocolate Marten'             },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], B: ['b/b'] },   phenotype: 'Chocolate Agouti Marten'      },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], G: ['g/g'] },   phenotype: 'Blue Marten'                  },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], G: ['g/g'] },   phenotype: 'Blue Agouti Marten'           },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], P: ['p/p'] },   phenotype: 'Champagne Marten'             },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], P: ['p/p'] },   phenotype: 'Amber Marten'                 },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], R: ['r/r'] },   phenotype: 'Beige Marten'                 },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], R: ['r/r'] },   phenotype: 'Topaz Marten'                 },

  // =========================================================
  // POINTED MARTEN (cm/ch) × D/M DILUTION COMPOUNDS
  // =========================================================
  { match: { A: BLACK,  C: ['cm/ch'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Pointed Marten' },
  { match: { A: AGOUTI, C: ['cm/ch'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Agouti Pointed Marten' },
  { match: { A: BLACK,  C: ['cm/ch'], D: ['d/d'] }, phenotype: 'Russian Pointed Marten' },
  { match: { A: AGOUTI, C: ['cm/ch'], D: ['d/d'] }, phenotype: 'Russian Agouti Pointed Marten' },
  { match: { A: BLACK,  C: ['cm/ch'], M: ['m/m'] }, phenotype: 'Mink Pointed Marten'    },
  { match: { A: AGOUTI, C: ['cm/ch'], M: ['m/m'] }, phenotype: 'Cinnamon Pointed Marten' },

  // =========================================================
  // TONKINESE (ct/*) × DILUTION COMPOUNDS
  // =========================================================
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Agouti Tonkinese' },
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], D: ['d/d'] }, phenotype: 'Russian Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], D: ['d/d'] }, phenotype: 'Russian Agouti Tonkinese' },
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], M: ['m/m'] }, phenotype: 'Mink Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], M: ['m/m'] }, phenotype: 'Cinnamon Tonkinese' },
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], B: ['b/b'] }, phenotype: 'Chocolate Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], B: ['b/b'] }, phenotype: 'Chocolate Agouti Tonkinese' },
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], G: ['g/g'] }, phenotype: 'Blue Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], G: ['g/g'] }, phenotype: 'Blue Agouti Tonkinese' },
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], P: ['p/p'] }, phenotype: 'Champagne Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], P: ['p/p'] }, phenotype: 'Amber Tonkinese' },
  { match: { A: BLACK,  C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], R: ['r/r'] }, phenotype: 'Beige Tonkinese' },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'], R: ['r/r'] }, phenotype: 'Topaz Tonkinese' },

  // =========================================================
  // BLACK BASE (a/a) + C-LOCUS EXPRESSIONS
  // =========================================================
  { match: { A: BLACK, C: ['ch/c']            }, phenotype: 'Seal Point Himalayan' },
  { match: { A: BLACK, C: ['ch/ch']           }, phenotype: 'Seal Point Siamese' },
  { match: { A: BLACK, C: ['cm/ch']           }, phenotype: 'Pointed Marten', alternates: ['Pointed Devil'] },
  { match: { A: BLACK, C: ['cm/cm', 'cm/c']   }, phenotype: 'Marten', alternates: ['Devil'] },
  { match: { A: BLACK, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'] }, phenotype: 'Tonkinese'      },

  // =========================================================
  // AGOUTI BASE (A/-) + C-LOCUS EXPRESSIONS
  // =========================================================
  { match: { A: AGOUTI, C: ['ch/c']           }, phenotype: 'Seal Point Himalayan' },
  { match: { A: AGOUTI, C: ['ch/ch']          }, phenotype: 'Seal Point Siamese' },
  { match: { A: AGOUTI, C: ['cm/ch']          }, phenotype: 'Agouti Pointed Marten', alternates: ['Agouti Pointed Devil'] },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c']  }, phenotype: 'Agouti Marten', alternates: ['Agouti Devil'] },
  { match: { A: AGOUTI, C: ['ct/ct', 'ct/cm', 'ct/ch', 'ct/c'] }, phenotype: 'Agouti Tonkinese'       },

  // =========================================================
  // BURMESE — Bu present but no restrictive C allele (does not visually express)
  // Bu only shows a phenotype when paired with ch, cm, or c.
  // Without those, the animal shows its base color — note is attached.
  // C absent entirely = same as full-C: no expression.
  // =========================================================
  { match: { A: BLACK,  Bu: ['Bu/bu'], C: FULL_C }, phenotype: 'Black',  notes: 'Burmese present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: BLACK,  Bu: ['Bu/Bu'], C: FULL_C }, phenotype: 'Black',  notes: 'Homozygous Burmese present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: AGOUTI, Bu: ['Bu/bu'], C: FULL_C }, phenotype: 'Agouti', notes: 'Burmese present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: AGOUTI, Bu: ['Bu/Bu'], C: FULL_C }, phenotype: 'Agouti', notes: 'Homozygous Burmese present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },

  // PEARL (Pe) & MERLE (Me): handled as modifiers in matchFancyRatPhenotype.
  // They append ' Pearl' / ' Merle' to any phenotype when m/m is also present.

  // =========================================================
  // 6-LOCUS COMPOUND DILUTIONS — must be before all others
  // =========================================================
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Platinum Mink Champagne Beige' },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Platinum Cinnamon Amber Topaz', alternates: ['Russian Platinum Cinnamon Silver Fawn'] },

  // =========================================================
  // 5-LOCUS COMPOUND DILUTIONS — must be before 4-locus pairs
  // =========================================================

  // Russian (D) × four other dilutions
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Platinum Mink Champagne'       },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Platinum Cinnamon Amber', alternates: ['Russian Platinum Cinnamon Silverfawn'] },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Caramel'                  },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Saffron'                  },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Caramel'                   },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Saffron'                   },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Caramel'                     },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Saffron'                     },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Lavender Champagne Beige'          },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Lavender Amber Topaz', alternates: ['Russian Lavender Silver Fawn'] },

  // Non-Russian 5-dilution combos
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Platinum Mink Champagne Beige'        },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Platinum Cinnamon Amber Topaz', alternates: ['Platinum Cinnamon Silver Fawn'] },

  // =========================================================
  // 4-LOCUS COMPOUND DILUTIONS — must be before 3-locus pairs
  // =========================================================

  // Russian (D) × three other dilutions
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Russian Platinum Mink'       },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Russian Platinum Cinnamon', alternates: ['Russian Platinum Sienna'] },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Russian Blue Creme'               },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Russian Blue Creme Agouti'        },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Russian Blue Caramel'             },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Russian Blue Saffron'             },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Chocolate Honey'          },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Cinnamon Honey', alternates: ['Russian Sienna Honey'] },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Chocolate Mocha'          },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Cinnamon Argente', alternates: ['Russian Sienna Argente'] },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Caramel Champagne'        },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Saffron Amber', alternates: ['Russian Saffron Silverfawn'] },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Lavender Champagne'       },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Lavender Amber', alternates: ['Russian Lavender Silver Fawn'] },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Beige'           },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Fawn'            },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Beige'            },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Topaz'            },
  { match: { A: BLACK,  D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Beige'              },
  { match: { A: AGOUTI, D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Topaz'              },

  // Non-Russian 4-dilution combos
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Platinum Mink Champagne'     },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Platinum Cinnamon Amber', alternates: ['Platinum Cinnamon Silverfawn'] },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Lavender Caramel'                 },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Lavender Saffron'                 },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Caramel'                  },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Saffron'                  },
  { match: { A: BLACK,  B: ['b/b'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Caramel'                    },
  { match: { A: AGOUTI, B: ['b/b'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Saffron'                    },
  { match: { A: BLACK,  G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Lavender Champagne Beige'         },
  { match: { A: AGOUTI, G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Lavender Amber Topaz', alternates: ['Lavender Silver Fawn'] },

  // =========================================================
  // 3-LOCUS COMPOUND DILUTIONS — must be before 2-locus pairs
  // =========================================================

  // Russian (D) × two other dilutions
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Russian Lavender'         },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Russian Lavender Agouti'  },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'] }, phenotype: 'Russian Platinum'         },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'] }, phenotype: 'Russian Platinum Agouti'  },
  { match: { A: BLACK,  D: ['d/d'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Russian Mocha'            },
  { match: { A: AGOUTI, D: ['d/d'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Russian Argente'          },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Russian Coffee'           },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Russian Coffee Agouti'    },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], R: ['r/r'] }, phenotype: 'Russian Caramel'          },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], R: ['r/r'] }, phenotype: 'Russian Saffron'          },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], P: ['p/p'] }, phenotype: 'Russian Creme'            },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], P: ['p/p'] }, phenotype: 'Russian Creme Agouti'     },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Russian Silver Beige'     },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Russian Silver Fawn'      },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Russian Apricot'          },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Russian Apricot Agouti'   },
  { match: { A: BLACK,  D: ['d/d'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Russian Honey'            },
  { match: { A: AGOUTI, D: ['d/d'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Russian Honey Agouti'     },

  // Non-Russian 3-dilution combos
  { match: { A: BLACK,  G: ['g/g'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Lavender Beige'           },
  { match: { A: AGOUTI, G: ['g/g'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Lavender Fawn'            },
  { match: { A: BLACK,  G: ['g/g'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Lavender Champagne'       },
  { match: { A: AGOUTI, G: ['g/g'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Lavender Amber', alternates: ['Lavender Silver Fawn'] },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Blue Caramel'             },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Blue Saffron'             },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Blue Creme'               },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Blue Creme Agouti'        },
  { match: { A: BLACK,  B: ['b/b'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Chocolate Mocha'          },
  { match: { A: AGOUTI, B: ['b/b'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Cinnamon Argente', alternates: ['Sienna Argente'] },
  { match: { A: BLACK,  B: ['b/b'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Chocolate Honey'          },
  { match: { A: AGOUTI, B: ['b/b'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Cinnamon Honey', alternates: ['Sienna Honey'] },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Platinum Mink'       },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Platinum Cinnamon', alternates: ['Platinum Sienna'] },
  { match: { A: BLACK,  B: ['b/b'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Caramel Champagne'        },
  { match: { A: AGOUTI, B: ['b/b'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Saffron Amber', alternates: ['Saffron Silverfawn'] },
  { match: { A: BLACK,  D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Champagne Beige'  },
  { match: { A: AGOUTI, D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Amber Topaz', alternates: ['Russian Silver Fawn'] },
  { match: { A: BLACK,  G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Beige'            },
  { match: { A: AGOUTI, G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Topaz'            },
  { match: { A: BLACK,  M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Beige'              },
  { match: { A: AGOUTI, M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Topaz'              },

  // =========================================================
  // 2-LOCUS COMPOUND DILUTIONS
  // =========================================================
  { match: { A: BLACK,  D: ['d/d'], R: ['r/r'] }, phenotype: 'Russian Beige', alternates: ['Russian Buff'] },
  { match: { A: AGOUTI, D: ['d/d'], R: ['r/r'] }, phenotype: 'Russian Topaz', alternates: ['Russian Fawn'] },
  { match: { A: BLACK,  D: ['d/d'], P: ['p/p'] }, phenotype: 'Russian Champagne'        },
  { match: { A: AGOUTI, D: ['d/d'], P: ['p/p'] }, phenotype: 'Russian Amber', alternates: ['Russian Silverfawn'] },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'] }, phenotype: 'Russian Silver', alternates: ['Silver Blue'] },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'] }, phenotype: 'Russian Silver Agouti'    },
  { match: { A: BLACK,  D: ['d/d'], M: ['m/m'] }, phenotype: 'Russian Dove'             },
  { match: { A: AGOUTI, D: ['d/d'], M: ['m/m'] }, phenotype: 'Russian Cinnamon'         },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'] }, phenotype: 'Russian Chocolate'        },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'] }, phenotype: 'Russian Chocolate Agouti', alternates: ['Russian Sienna'] },
  { match: { A: BLACK,  G: ['g/g'], R: ['r/r'] }, phenotype: 'Blue Buff'              },
  { match: { A: AGOUTI, G: ['g/g'], R: ['r/r'] }, phenotype: 'Opal Fawn'               },
  { match: { A: BLACK,  G: ['g/g'], P: ['p/p'] }, phenotype: 'Apricot'                 },
  { match: { A: AGOUTI, G: ['g/g'], P: ['p/p'] }, phenotype: 'Apricot Agouti'          },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'] }, phenotype: 'Platinum'                },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'] }, phenotype: 'Platinum Agouti'         },
  { match: { A: BLACK,  G: ['g/g'], M: ['m/m'] }, phenotype: 'Lavender'                },
  { match: { A: AGOUTI, G: ['g/g'], M: ['m/m'] }, phenotype: 'Lavender Agouti'         },
  { match: { A: BLACK,  R: ['r/r'], M: ['m/m'] }, phenotype: 'Mocha'                   },
  { match: { A: AGOUTI, R: ['r/r'], M: ['m/m'] }, phenotype: 'Argente'                 },
  { match: { A: BLACK,  P: ['p/p'], M: ['m/m'] }, phenotype: 'Honey'                   },
  { match: { A: AGOUTI, P: ['p/p'], M: ['m/m'] }, phenotype: 'Honey Agouti'            },
  { match: { A: BLACK,  B: ['b/b'], M: ['m/m'] }, phenotype: 'Coffee'                  },
  { match: { A: AGOUTI, B: ['b/b'], M: ['m/m'] }, phenotype: 'Coffee Agouti'           },
  { match: { A: BLACK,  B: ['b/b'], R: ['r/r'] }, phenotype: 'Caramel'                 },
  { match: { A: AGOUTI, B: ['b/b'], R: ['r/r'] }, phenotype: 'Saffron'                 },
  { match: { A: BLACK,  B: ['b/b'], P: ['p/p'] }, phenotype: 'Creme'                   },
  { match: { A: AGOUTI, B: ['b/b'], P: ['p/p'] }, phenotype: 'Creme Agouti'            },
  { match: { A: BLACK,  P: ['p/p'], R: ['r/r'] }, phenotype: 'Champagne Beige', alternates: ['Champagne Buff'] },
  { match: { A: AGOUTI, P: ['p/p'], R: ['r/r'] }, phenotype: 'Amber Topaz', alternates: ['Silver Fawn'] },

  // =========================================================
  // SINGLE DILUTION — BLACK BASE (a/a)
  // =========================================================
  { match: { A: BLACK, B: ['b/b'] }, phenotype: 'Chocolate'    },
  { match: { A: BLACK, D: ['d/d'] }, phenotype: 'Russian Blue' },
  { match: { A: BLACK, G: ['g/g'] }, phenotype: 'American Blue'},
  { match: { A: BLACK, M: ['m/m'] }, phenotype: 'Mink'         },
  { match: { A: BLACK, P: ['p/p'] }, phenotype: 'Champagne'    },
  { match: { A: BLACK, R: ['r/r'] }, phenotype: 'Beige', alternates: ['Buff'] },

  // =========================================================
  // SINGLE DILUTION — AGOUTI BASE (A/-)
  // =========================================================
  { match: { A: AGOUTI, B: ['b/b'] }, phenotype: 'Chocolate Agouti', alternates: ['Sienna'] },
  { match: { A: AGOUTI, D: ['d/d'] }, phenotype: 'Russian Blue Agouti'       },
  { match: { A: AGOUTI, G: ['g/g'] }, phenotype: 'American Blue Agouti', alternates: ['Opal'] },
  { match: { A: AGOUTI, M: ['m/m'] }, phenotype: 'Cinnamon'                  },
  { match: { A: AGOUTI, P: ['p/p'] }, phenotype: 'Amber', alternates: ['Silverfawn'] },
  { match: { A: AGOUTI, R: ['r/r'] }, phenotype: 'Topaz', alternates: ['Fawn'] },

  // =========================================================
  // BASE COLOR FALLBACKS — catch-all when no dilutions present
  // Must be last in the rules array.
  // =========================================================
  { match: { A: BLACK  }, phenotype: 'Black'  },
  { match: { A: AGOUTI }, phenotype: 'Agouti' },

];

// ---------------------------------------------------------------------------
// C-LOCUS DERIVATION HELPERS
// ---------------------------------------------------------------------------

/**
 * Returns an internal cType key for the C-locus allele combination, or null
 * if the allele does not restrict pigment (full color or Albino — handled
 * by explicit rules earlier in the array).
 */
function getCType(C) {
  if (!C || FULL_C.includes(C) || C === 'c/c') return null;
  if (C === 'ch/ch') return 'siamese';
  if (C === 'ch/c')  return 'himalayan';
  if (C === 'cm/ch') return 'pointed_marten';
  if (C === 'cm/cm' || C === 'cm/c') return 'marten';
  if (C === 'ct/ct' || C === 'ct/cm' || C === 'ct/ch' || C === 'ct/c') return 'tonkinese';
  return null;
}

/** Display suffix for each cType. */
const C_SUFFIX = {
  siamese:        'Siamese',
  himalayan:      'Himalayan',
  pointed_marten: 'Pointed Marten',
  marten:         'Marten',
  tonkinese:      'Tonkinese',
};

/**
 * Traditional name overrides: `${basePhenotype}|${cType}` → final phenotype.
 * Applied before the generic "base + suffix" concatenation.
 */
const C_OVERRIDES = {
  'Russian Blue|siamese':            'Russian Point Siamese',
  'Russian Blue Agouti|siamese':     'Russian Point Siamese',
  'Mink|siamese':                    'Mink Point Siamese',
  'Cinnamon|siamese':                'Mink Point Siamese',
  'Russian Dove|siamese':            'Dove Point Siamese',
  'Russian Cinnamon|siamese':        'Dove Point Siamese',
  'Russian Blue|himalayan':          'Russian Point Himalayan',
  'Russian Blue Agouti|himalayan':   'Russian Point Himalayan',
  'Russian Blue|marten':             'Russian Marten',
  'Mink|marten':                     'Mink Marten',
};

/**
 * Build the final phenotype name from a base dilution name + C-locus type.
 * - Siamese / Himalayan: base color is implicit — drop bare "Black" / "Agouti".
 * - Marten / Pointed Marten / Tonkinese: "Agouti" becomes a prefix; "Black" is dropped.
 * - Compound dilution bases are prepended to the suffix as-is.
 */
function deriveWithCLocus(basePhenotype, cType) {
  const key = `${basePhenotype}|${cType}`;
  if (C_OVERRIDES[key]) return C_OVERRIDES[key];

  const suffix = C_SUFFIX[cType];

  if (cType === 'siamese' || cType === 'himalayan') {
    if (basePhenotype === 'Black' || basePhenotype === 'Agouti') return suffix;
  } else {
    if (basePhenotype === 'Black')  return suffix;
    if (basePhenotype === 'Agouti') return `Agouti ${suffix}`;
  }

  return `${basePhenotype} ${suffix}`;
}

// ---------------------------------------------------------------------------
// MARKING / COAT / EAR GENE LOOKUP TABLES
// ---------------------------------------------------------------------------

const H_PHENOTYPES = {
  'H/H':       'Self',
  'H/Hre':     'Essex',
  'H/hi':      'English Irish',
  'H/he':      'Blazed Berkshire (Variberk)',
  'H/hn':      'Blazed Berkshire (Variberk)',
  'H/h':       'Berkshire (Irish)',
  'Hre/Hre':   'Double Essex',
  'Hre/hi':    'Bareback Headspot',
  'Hre/he':    'Baldie',
  'Hre/hn':    'Baldie',
  'Hre/h':     'Baldie',
  'hi/hi':     'English Irish',
  'hi/he':     'Variegated',
  'hi/hn':     'Variegated',
  'hi/h':      'Berkshire (Irish)',
  'he/he':     'Masked (Patched)',
  'he/hn':     'Capped (Variegated, Split Capped)',
  'he/h':      'Bareback (Variegated, Hooded)',
  'hn/hn':     'Capped (Capped Notch)',
  'hn/h':      'Bareback (Variegated, Hooded)',
  'h/h':       'Hooded',
};

const DAL_PHENOTYPES = {
  'Dal/Dal': 'Double Dalmatian',
  'Dal/dal': 'Dalmatian',
};

// Dal (any copy) compounds with specific H-locus genotypes collapse into a single named pattern
const DALMATIAN_ESSEX_DAL_H     = new Set(['H/Hre']);
const DALMATIAN_IRISH_DAL_H     = new Set(['H/hi']);
const DALMATIAN_BERKSHIRE_DAL_H = new Set(['H/he', 'H/hn', 'hi/hi', 'H/h', 'hi/h']);
const DALMATIAN_BALDIE_DAL_H    = new Set(['Hre/he', 'Hre/hn', 'Hre/h']);
const VARIEGATED_DALMATIAN_DAL_H = new Set(['hi/hn']);
const MASKED_DALMATIAN_DAL_H    = new Set(['he/he']);
const CAPPED_DALMATIAN_DAL_H    = new Set(['he/hn', 'hn/hn']);
const COLLARED_DALMATIAN_DAL_H  = new Set(['he/h', 'hi/he']);
const DALMATIAN_BAREBACK_DAL_H  = new Set(['Hre/hi', 'hn/h']);
const HOODED_DALMATIAN_DAL_H    = new Set(['h/h']);

const MA_PHENOTYPES = {
  'Ma/Ma': 'Double Marble',
  'Ma/ma': 'Marble',
};

const WS_PHENOTYPES = {
  'Ws/Ws': 'Double White Spot',
  'Ws/w':  'White Spot',
};

// Ro and Wh are recessive — only express when homozygous recessive
const RO_PHENOTYPES  = { 'ro/ro': 'Roan (Husky)' };
const WH_PHENOTYPES  = { 'wh/wh': 'Whiteside' };
const HS_PHENOTYPES  = { 'hs/hs': 'Headspot' };

// Sf (Snowflake) — recessive, simply appends to whatever marking phenotype already exists, no compounds
const SF_PHENOTYPES  = { 'sf/sf': 'Snowflake' };

// wh/wh compounds with specific H-locus genotypes collapse into a single named pattern
const ESSEX_WHITESIDE_WH_H          = new Set(['H/Hre']);
const ENGLISH_IRISH_WHITESIDE_WH_H  = new Set(['H/hi', 'hi/hi']);
const BLAZED_BERKSHIRE_WHITESIDE_WH_H = new Set(['H/he', 'H/hn']);
const BALDIE_WHITESIDE_WH_H         = new Set(['Hre/he', 'Hre/hn', 'Hre/h']);
const VARIEGATED_WHITESIDE_WH_H     = new Set(['hi/he', 'hi/hn']);
const MASKED_WHITESIDE_WH_H         = new Set(['he/he']);
const CAPPED_WHITESIDE_WH_H         = new Set(['he/hn', 'hn/hn']);
const BAREBACK_WHITESIDE_WH_H       = new Set(['he/h', 'hn/h']);
const HOODED_WHITESIDE_WH_H         = new Set(['h/h']);

// ro/ro compounds with specific H-locus genotypes collapse into a single named pattern
const BERKSHIRE_ROAN_H = new Set(['H/H', 'H/hi', 'hi/hi', 'H/he', 'H/hn', 'hi/h']);
const BANDED_ROAN_H    = new Set(['h/h', 'hi/he', 'hi/hn']);
const SADDLED_ROAN_H   = new Set(['he/he', 'he/hn', 'hn/hn']);

// Ws (any copy) compounds with specific H-locus genotypes collapse into a single named pattern
const BADGER_WS_H      = new Set(['H/H', 'H/hi', 'hi/hi']);
const COLLARED_WS_H    = new Set(['H/h', 'hi/hn', 'hi/he']);
const SADDLED_WS_H     = new Set(['h/h', 'he/h', 'hn/h']);
const CAP_STRIPED_WS_H = new Set(['he/he', 'hn/hn', 'he/hn']);

// hs/hs (Headspot, separate locus from H) compounds with specific H-locus genotypes
const BERKSHIRE_HEADSPOT_HS_H = new Set(['H/H']);
const BADGER_HS_H              = new Set(['hi/hi']);
const BLAZED_BANDED_HS_H       = new Set(['H/h', 'hi/h']);
const SPLIT_CAPPED_HS_H        = new Set(['he/h', 'hn/h', 'hn/hn', 'he/he']);
const BALDIE_HEADSPOT_HS_H     = new Set(['Hre/he', 'Hre/hn', 'Hre/h']);
const BLAZED_BERKSHIRE_IRISH_HS_H = new Set(['H/hi']);
const BLAZED_BERKSHIRE_HS_H        = new Set(['H/he', 'H/hn']);
const BLAZED_VARIEGATED_HS_H       = new Set(['hi/he', 'hi/hn']);
const BLAZED_CAPPED_HS_H           = new Set(['he/hn']);
const BLAZED_HOODED_HS_H           = new Set(['h/h']);

// Dw (any copy) — dominant, appends 'Downunder' by default, or collapses into a compound name with specific H-locus genotypes
const DW_PHENOTYPES = { 'Dw/Dw': 'Downunder', 'Dw/dw': 'Downunder' };
const DOWNUNDER_BERKSHIRE_DW_H       = new Set(['H/h', 'Hre/h']);
const DOWNUNDER_HOODED_DW_H          = new Set(['h/h']);
const SPOTTED_DOWNUNDER_DW_H         = new Set(['he/h', 'hn/h', 'hi/he', 'hi/hn']);
const VARIEGATED_DOWNUNDER_DW_H      = new Set(['hi/h', 'Hre/he', 'Hre/hn']);
const CAPPED_DOWNUNDER_DW_H          = new Set(['he/hn', 'hn/hn']);
const BAREBACK_HEADSPOT_DOWNUNDER_DW_H = new Set(['Hre/hi']);
// these H genotypes fully mask Dw — Downunder never shows, base H label stands alone
const DW_HIDDEN_H = new Set(['H/Hre', 'H/hi', 'H/he', 'H/hn', 'hi/hi', 'he/he']);

// Coat gene lookup: keyed by locus symbol → notation → label
const COAT_PHENOTYPES = {
  Re: { 'Re/Re': 'Double Rex',       'Re/re': 'Rex'              },
  Ve: { 'Ve/Ve': 'Double Velveteen', 'Ve/ve': 'Velveteen'        },
  Sm: { 'Sm/Sm': 'Extreme Silvermane (Silken)', 'Sm/sm': 'Silvermane (Silken)' },
  Lu: { 'Lu/Lu': 'Extreme Lux',       'Lu/lu': 'Lux'              },
  Sy: { 'Sy/Sy': 'Double Silky',     'Sy/sy': 'Silky'            },
  Sk: { 'Sk/Sk': 'Double Silk',      'Sk/sk': 'Silk'             },
};

// Satin (recessive — only sa/sa expresses)
const SA_PHENOTYPES = { 'sa/sa': 'Satin' };

// Hairless (recessive — only hr/hr expresses)
const HR_PHENOTYPES = { 'hr/hr': 'Hairless (Rhino)' };

// Harley (recessive — only hrl/hrl expresses)
const HRL_PHENOTYPES = { 'hrl/hrl': 'Harley' };

// Angora (recessive — only nz/nz expresses; New Zealand lines only)
const NZ_PHENOTYPES = { 'nz/nz': 'Angora' };

// Fuzz (recessive — only fz/fz expresses)
const FZ_PHENOTYPES = { 'fz/fz': 'Fuzz (Nude)' };

// Werewolf (recessive — only pw/pw expresses)
const PW_PHENOTYPES = { 'pw/pw': 'Werewolf (Patchwork)' };

// Ear gene (Dumbo is recessive — only du/du expresses)
const DU_PHENOTYPES  = { 'du/du': 'Dumbo' };

// Dwarf (recessive — only dr/dr expresses)
const DR_PHENOTYPES = { 'dr/dr': 'Dwarf' };

// Manx (dominant, tailless — Mx/mx expresses; Mx/Mx is homozygous lethal)
const MX_PHENOTYPES = { 'Mx/mx': 'Manx' };

/**
 * Apply all post-color modifiers: marking, coat, ear, Pearl, Merle.
 * Order: [color] [marking] [coat] [ear] [Pearl] [Merle]
 */
function applyModifiers(rule, genotype) {
  let phenotype = rule.phenotype;
  const colorEnd = phenotype.length;

  // --- Hooded locus (Self = no marking, skip) ---
  const hLabel = H_PHENOTYPES[genotype.H];
  const isRoan = genotype.Ro === 'ro/ro';
  const hasWs = genotype.Ws === 'Ws/Ws' || genotype.Ws === 'Ws/w';
  const hasHs = genotype.Hs === 'hs/hs';
  const hasWh = genotype.Wh === 'wh/wh';
  let whCompound = null;
  if (hasWh) {
    if (ESSEX_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Essex Whiteside';
    else if (ENGLISH_IRISH_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'English Irish Whiteside';
    else if (BLAZED_BERKSHIRE_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Blazed Berkshire Whiteside';
    else if (BALDIE_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Baldie Whiteside';
    else if (VARIEGATED_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Variegated Whiteside';
    else if (MASKED_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Masked Whiteside';
    else if (CAPPED_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Capped Whiteside';
    else if (BAREBACK_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Bareback Whiteside';
    else if (HOODED_WHITESIDE_WH_H.has(genotype.H)) whCompound = 'Hooded Whiteside';
  }
  const hasDal = genotype.Dal === 'Dal/Dal' || genotype.Dal === 'Dal/dal';
  let dalCompound = null;
  if (hasDal) {
    if (DALMATIAN_ESSEX_DAL_H.has(genotype.H)) dalCompound = 'Dalmatian Essex';
    else if (DALMATIAN_IRISH_DAL_H.has(genotype.H)) dalCompound = 'Dalmatian Irish';
    else if (DALMATIAN_BERKSHIRE_DAL_H.has(genotype.H)) dalCompound = 'Dalmatian Berkshire';
    else if (DALMATIAN_BALDIE_DAL_H.has(genotype.H)) dalCompound = 'Dalmatian Baldie';
    else if (VARIEGATED_DALMATIAN_DAL_H.has(genotype.H)) dalCompound = 'Variegated Dalmatian';
    else if (MASKED_DALMATIAN_DAL_H.has(genotype.H)) dalCompound = 'Masked Dalmatian';
    else if (CAPPED_DALMATIAN_DAL_H.has(genotype.H)) dalCompound = 'Capped Dalmatian';
    else if (COLLARED_DALMATIAN_DAL_H.has(genotype.H)) dalCompound = 'Collared Dalmatian';
    else if (DALMATIAN_BAREBACK_DAL_H.has(genotype.H)) dalCompound = 'Dalmatian Bareback';
    else if (HOODED_DALMATIAN_DAL_H.has(genotype.H)) dalCompound = 'Hooded Dalmatian';
  }
  let roanCompound = null;
  if (isRoan) {
    if (BERKSHIRE_ROAN_H.has(genotype.H)) roanCompound = 'Berkshire Roan (Berkshire Husky)';
    else if (BANDED_ROAN_H.has(genotype.H)) roanCompound = 'Banded Roan (Banded Husky)';
    else if (SADDLED_ROAN_H.has(genotype.H)) roanCompound = 'Saddled Roan (Saddled Husky)';
  }
  let wsCompound = null;
  if (hasWs) {
    if (BADGER_WS_H.has(genotype.H)) wsCompound = 'Badger';
    else if (COLLARED_WS_H.has(genotype.H)) wsCompound = 'Collared';
    else if (SADDLED_WS_H.has(genotype.H)) wsCompound = 'Saddled';
    else if (CAP_STRIPED_WS_H.has(genotype.H)) wsCompound = 'Cap Striped';
  }
  let hsCompound = null;
  if (hasHs) {
    if (BERKSHIRE_HEADSPOT_HS_H.has(genotype.H)) hsCompound = 'Berkshire Headspot';
    else if (BADGER_HS_H.has(genotype.H)) hsCompound = 'Badger';
    else if (BLAZED_BANDED_HS_H.has(genotype.H)) hsCompound = 'Blazed Banded';
    else if (SPLIT_CAPPED_HS_H.has(genotype.H)) hsCompound = 'Split Capped';
    else if (BALDIE_HEADSPOT_HS_H.has(genotype.H)) hsCompound = 'Baldie Headspot';
    else if (BLAZED_BERKSHIRE_IRISH_HS_H.has(genotype.H)) hsCompound = 'Blazed Berkshire (Irish)';
    else if (BLAZED_BERKSHIRE_HS_H.has(genotype.H)) hsCompound = 'Blazed Berkshire';
    else if (BLAZED_VARIEGATED_HS_H.has(genotype.H)) hsCompound = 'Blazed Variegated';
    else if (BLAZED_CAPPED_HS_H.has(genotype.H)) hsCompound = 'Blazed Capped';
    else if (BLAZED_HOODED_HS_H.has(genotype.H)) hsCompound = 'Blazed Hooded';
  }
  const hasDw = genotype.Dw === 'Dw/Dw' || genotype.Dw === 'Dw/dw';
  let dwCompound = null;
  let dwHidden = false;
  if (hasDw) {
    if (DOWNUNDER_BERKSHIRE_DW_H.has(genotype.H)) dwCompound = 'Downunder Berkshire';
    else if (DOWNUNDER_HOODED_DW_H.has(genotype.H)) dwCompound = 'Downunder Hooded';
    else if (SPOTTED_DOWNUNDER_DW_H.has(genotype.H)) dwCompound = 'Spotted Downunder';
    else if (VARIEGATED_DOWNUNDER_DW_H.has(genotype.H)) dwCompound = 'Variegated Downunder';
    else if (CAPPED_DOWNUNDER_DW_H.has(genotype.H)) dwCompound = 'Capped Downunder';
    else if (BAREBACK_HEADSPOT_DOWNUNDER_DW_H.has(genotype.H)) dwCompound = 'Bareback Headspot Downunder';
    else if (DW_HIDDEN_H.has(genotype.H)) dwHidden = true;
  }
  const hLabelSuppressed = !!(roanCompound || wsCompound || hsCompound || dwCompound || dalCompound || whCompound);
  if (!hLabelSuppressed && hLabel && hLabel !== 'Self') phenotype += ` ${hLabel}`;

  // --- Other marking genes ---
  const dalLabel = DAL_PHENOTYPES[genotype.Dal];
  if (dalCompound) phenotype += ` ${dalCompound}`;
  else if (dalLabel) phenotype += ` ${dalLabel}`;

  const maLabel = MA_PHENOTYPES[genotype.Ma];
  if (maLabel) phenotype += ` ${maLabel}`;

  const roLabel = RO_PHENOTYPES[genotype.Ro];
  if (roanCompound) phenotype += ` ${roanCompound}`;
  else if (roLabel) phenotype += ` ${roLabel}`;

  const whLabel = WH_PHENOTYPES[genotype.Wh];
  if (whCompound) phenotype += ` ${whCompound}`;
  else if (whLabel) phenotype += ` ${whLabel}`;

  const wsLabel = WS_PHENOTYPES[genotype.Ws];
  if (wsCompound) phenotype += ` ${wsCompound}`;
  else if (wsLabel) phenotype += ` ${wsLabel}`;

  if (hsCompound) phenotype += ` ${hsCompound}`;
  else if (HS_PHENOTYPES[genotype.Hs]) phenotype += ` ${HS_PHENOTYPES[genotype.Hs]}`;

  const dwLabel = DW_PHENOTYPES[genotype.Dw];
  if (dwCompound) phenotype += ` ${dwCompound}`;
  else if (!dwHidden && dwLabel) phenotype += ` ${dwLabel}`;

  const sfLabel = SF_PHENOTYPES[genotype.Sf];
  if (sfLabel) phenotype += ` ${sfLabel}`;

  // Re (any copy) + Ve (any copy) together collapse into "Teddy Rex" instead of separate Rex/Velveteen labels
  const hasRex = genotype.Re === 'Re/Re' || genotype.Re === 'Re/re';
  const hasVelveteen = genotype.Ve === 'Ve/Ve' || genotype.Ve === 'Ve/ve';
  const teddyRex = hasRex && hasVelveteen;
  if (teddyRex) phenotype += ' Teddy Rex';
  const markingsEnd = phenotype.length;

  // --- Coat genes ---
  for (const [locus, map] of Object.entries(COAT_PHENOTYPES)) {
    if (teddyRex && (locus === 'Re' || locus === 'Ve')) continue;
    const coatLabel = map[genotype[locus]];
    if (coatLabel) phenotype += ` ${coatLabel}`;
  }

  const saLabel = SA_PHENOTYPES[genotype.sa];
  if (saLabel) phenotype += ` ${saLabel}`;

  const hrLabel = HR_PHENOTYPES[genotype.hr];
  if (hrLabel) phenotype += ` ${hrLabel}`;

  const hrlLabel = HRL_PHENOTYPES[genotype.hrl];
  if (hrlLabel) phenotype += ` ${hrlLabel}`;

  const nzLabel = NZ_PHENOTYPES[genotype.nz];
  if (nzLabel) phenotype += ` ${nzLabel}`;

  const fzLabel = FZ_PHENOTYPES[genotype.fz];
  if (fzLabel) phenotype += ` ${fzLabel}`;

  const pwLabel = PW_PHENOTYPES[genotype.pw];
  if (pwLabel) phenotype += ` ${pwLabel}`;
  const coatEnd = phenotype.length;

  // --- Ear type ---
  const duLabel = DU_PHENOTYPES[genotype.Du];
  if (duLabel) phenotype += ` ${duLabel}`;
  const earEnd = phenotype.length;

  // --- Body type ---
  const drLabel = DR_PHENOTYPES[genotype.dr];
  if (drLabel) phenotype += ` ${drLabel}`;

  const mxLabel = MX_PHENOTYPES[genotype.Mx];
  if (mxLabel) phenotype += ` ${mxLabel}`;
  const bodyEnd = phenotype.length;

  // --- Pearl / Merle (only when m/m present) ---
  if (genotype.M === 'm/m') {
    if (genotype.Pe === 'Pe/pe') phenotype += ' Pearl';
    if (genotype.Me === 'Me/me') phenotype += ' Merle';
    else if (genotype.Me === 'Me/Me') phenotype += ' Extreme Merle';
  }

  // Categorized breakdown for the "Seed to Appearance" feature — derived via
  // string-length checkpoints above, without altering any derivation logic.
  const breakdown = {
    color: phenotype.slice(0, colorEnd).trim(),
    markings: `${phenotype.slice(colorEnd, markingsEnd)} ${phenotype.slice(bodyEnd)}`.trim().replace(/\s+/g, ' '),
    coat: phenotype.slice(markingsEnd, coatEnd).trim(),
    earset: phenotype.slice(coatEnd, earEnd).trim(),
    body: phenotype.slice(earEnd, bodyEnd).trim(),
  };

  return { ...rule, phenotype, breakdown };
}

// ---------------------------------------------------------------------------
// BU DERIVATION
// ---------------------------------------------------------------------------

/**
 * Structural C-type suffix words used by Bu derivation (Siamese/Himalayan fold
 * away entirely — no suffix word at all).
 */
const BU_STRUCTURAL_SUFFIX = {
  marten:         'Marten',
  pointed_marten: 'Pointed Marten',
  tonkinese:      'Tonkinese',
};

/**
 * Derive phenotype when Bu is present with a fully-restrictive C allele.
 *
 * All C-types fold directly into Burmese/Sable naming (no separate C-locus
 * label word from C_SUFFIX) per confirmed rules:
 *   a/a                  + Bu/bu -> Burmese                | + Bu/Bu -> Sable
 *   A/+                  + Bu/bu -> Wheaten Burmese         | + Bu/Bu -> Wheaten Sable
 *   a/a + <structural>    + Bu/bu -> Burmese <Suffix>        | + Bu/Bu -> Sable <Suffix>
 *   A/+ + <structural>    + Bu/bu -> Wheaten <Suffix>        | + Bu/Bu -> Wheaten Sable <Suffix>
 * (<structural> = Marten / Pointed Marten / Tonkinese. "Russian Blue" shortens
 * to "Russian" in this pipeline; Agouti + heterozygous structural types are the
 * only cases that drop the bare dosage word.)
 *
 * Bu fallback (Bu + full C) is handled by explicit rules and skipped here.
 */
function deriveBuPhenotype(genotype) {
  const { Bu, C, A } = genotype;
  if (!Bu || Bu === 'bu/bu') return null;
  if (!C || FULL_C.includes(C) || C === 'c/c') return null; // full-C or Albino: explicit rules

  const cType = getCType(C);
  if (!cType) return null; // no restrictive C type — no Burmese expression

  const isAgouti = AGOUTI.includes(A);
  const structuralSuffix = BU_STRUCTURAL_SUFFIX[cType] ?? '';
  const buDosage = Bu === 'Bu/Bu' ? 'Sable' : 'Burmese';

  // Base dilution name using Black-base rules (avoids 'Agouti' suffix)
  const baseGenotype = { ...genotype, A: 'a/a', C: 'C/C', Bu: 'bu/bu' };
  let dilution = '';
  for (const rule of FANCY_RAT_PHENOTYPE_RULES) {
    if (rule.match.C || rule.match.Bu) continue;
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) =>
      baseGenotype[locus] != null && allowed.includes(baseGenotype[locus])
    );
    if (allMatch && rule.phenotype !== 'Black') { dilution = rule.phenotype; break; }
  }

  if (dilution === 'Russian Blue') dilution = 'Russian';

  // Only Agouti + heterozygous structural types drop the bare dosage word.
  const dropDosage = isAgouti && structuralSuffix && Bu === 'Bu/bu';

  const parts = [];
  if (dilution) parts.push(dilution);
  if (isAgouti) parts.push('Wheaten');
  if (!dropDosage) parts.push(buDosage);
  if (structuralSuffix) parts.push(structuralSuffix);
  return parts.join(' ');
}

// ---------------------------------------------------------------------------

// Lookup of phenotype name -> alternates, built from the rules array so
// carrier trait names can show their alternates too (e.g. "Beige (Buff)").
const PHENOTYPE_ALTERNATES = {};
for (const rule of FANCY_RAT_PHENOTYPE_RULES) {
  if (rule.alternates) PHENOTYPE_ALTERNATES[rule.phenotype] = rule.alternates;
}

function withAlternates(trait) {
  const alternates = PHENOTYPE_ALTERNATES[trait];
  return alternates ? `${trait} (${alternates.join(', ')})` : trait;
}

// Simple biallelic loci where the heterozygote visibly shows the dominant
// allele but hides ("carries") the named recessive trait.
const SIMPLE_RECESSIVE_CARRIERS = {
  A: { het: 'A/a', trait: 'Black' },
  B: { het: 'B/b', trait: 'Chocolate' },
  D: { het: 'D/d', trait: 'Russian Blue' },
  G: { het: 'G/g', trait: 'American Blue' },
  M: { het: 'M/m', trait: 'Mink' },
  Mo: { het: 'Mo/mo', trait: 'Mock Mink' },
  P: { het: 'P/p', trait: 'Champagne' },
  R: { het: 'R/r', trait: 'Beige' },
  Ro: { het: 'Ro/ro', trait: 'Roan' },
  Wh: { het: 'Wh/wh', trait: 'Whiteside' },
  Du: { het: 'Du/du', trait: 'Dumbo' },
  hr: { het: 'Hr/hr', trait: 'Hairless' },
  hrl: { het: 'Hrl/hrl', trait: 'Harley' },
  sa: { het: 'Sa/sa', trait: 'Satin' },
  nz: { het: 'Nz/nz', trait: 'Angora' },
  fz: { het: 'Fz/fz', trait: 'Fuzz' },
  pw: { het: 'Pw/pw', trait: 'Werewolf' },
  dr: { het: 'Dr/dr', trait: 'Dwarf' },
};

/**
 * Recessive/hidden traits carried (but not visibly expressed) by a rat genotype.
 * Covers simple biallelic loci (dominant allele masks the named recessive trait)
 * plus C-locus restrictive alleles masked by a full-color C allele.
 * Dominant-in-heterozygote traits (Bu, Pe, Me, Dal, Ma, Ws, coat genes, H-series)
 * are excluded since they always visibly express and are never "hidden".
 */
// Recessive loci eligible for "possible het" (unconfirmed/probability-based carrier) notes —
// same simple-biallelic set used by getFancyRatCarriers, minus the C-locus (multi-allelic).
export const RAT_POSSIBLE_HET_LOCI = Object.entries(SIMPLE_RECESSIVE_CARRIERS).map(([locus, { trait }]) => ({ locus, name: trait }));

export function getFancyRatCarriers(genotype) {
  genotype = normalizeRatGenotype(genotype);
  const carriers = [];

  for (const [locus, { het, trait }] of Object.entries(SIMPLE_RECESSIVE_CARRIERS)) {
    if (genotype[locus] === het) carriers.push(withAlternates(trait));
  }

  // C-locus: a full-color C allele masks whichever restrictive allele it's paired with.
  const C_CARRIER_TRAIT = { ct: 'Tonkinese', cm: 'Marten', ch: 'Siamese', c: 'Albino' };
  if (genotype.C && genotype.C !== 'C/C' && FULL_C.includes(genotype.C)) {
    const restrictiveAllele = genotype.C.split('/').find(a => a !== 'C');
    const trait = C_CARRIER_TRAIT[restrictiveAllele];
    if (trait) carriers.push(withAlternates(trait));
  }

  return carriers;
}

/**
 * Evaluate FANCY_RAT_PHENOTYPE_RULES against a genotype object.
 *
 * Pass 1 — explicit rules (Albino, Stone, Unknown C, Bu fallbacks,
 *           compound/single dilutions).
 * Pass 2 — Bu derivation: Bu present with restrictive C — derives base dilution
 *           then builds [C-locus] [Bu modifier] name.
 * Pass 3 — C-locus derivation: restrictive C with no Bu — derives base then appends
 *           C-locus suffix with traditional-name overrides.
 * Be — Black-Eyed: prepends "Black Eyed" to whatever the above passes produced,
 *      except c/c (Albino) which becomes "Ivory" instead.
 * Modifiers — Pearl / Merle append to any phenotype when m/m is present.
 *
 * @param {Object} genotype  - e.g. { A: 'a/a', C: 'ch/ch', M: 'm/m', D: 'd/d', ... }
 * @returns {{ phenotype: string, notes?: string, carriers: string[], alternates?: string[] } | null}
 */
export function matchFancyRatPhenotype(genotype) {
  genotype = normalizeRatGenotype(genotype);
  const result = matchFancyRatPhenotypeCore(genotype);
  if (!result) return null;
  return { ...result, carriers: getFancyRatCarriers(genotype) };
}

// Mo (Mock Mink) is a separate, non-complementary locus that phenocopies Mink/Cinnamon —
// treat mo/mo as M's m/m for phenotype-matching purposes only (carrier detection stays separate).
function withMockMinkPhenocopy(genotype) {
  return genotype.Mo === 'mo/mo' ? { ...genotype, M: 'm/m' } : genotype;
}

function computeBasePhenotype(genotype) {
  // Bu (Burmese) derivation must run before the generic C-locus rules below —
  // those rules don't check Bu and would otherwise swallow every Bu match.
  // deriveBuPhenotype() itself defers (returns null) for the cases that need
  // to be handled by explicit rules instead (Stone/Wheaten Stone, Bu present
  // but no restrictive C, Bu absent).
  const buPhenotype = deriveBuPhenotype(genotype);
  if (buPhenotype != null) return { phenotype: buPhenotype };

  // Pass 1: explicit rules
  for (const rule of FANCY_RAT_PHENOTYPE_RULES) {
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
      const notation = genotype[locus];
      return notation != null && allowed.includes(notation);
    });
    if (allMatch) return rule;
  }

  // Pass 3: C-locus derivation (restrictive C, no Bu)
  const cType = getCType(genotype.C);
  if (cType) {
    const baseGenotype = { ...genotype, C: 'C/C' };
    for (const rule of FANCY_RAT_PHENOTYPE_RULES) {
      if (rule.match.C || rule.match.Bu) continue;
      const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
        const notation = baseGenotype[locus];
        return notation != null && allowed.includes(notation);
      });
      if (allMatch) {
        const derived = deriveWithCLocus(rule.phenotype, cType);
        return { ...rule, phenotype: derived };
      }
    }
    // No dilution rule matched — return plain C-locus phenotype
    const baseLabel = genotype.A === 'a/a' ? 'Black' : 'Agouti';
    return { phenotype: deriveWithCLocus(baseLabel, cType) };
  }

  return null;
}

function matchFancyRatPhenotypeCore(genotype) {
  const base = computeBasePhenotype(withMockMinkPhenocopy(genotype));
  if (!base) return null;

  const isBe = genotype.Be === 'Be/be' || genotype.Be === 'Be/Be';
  let result = base;
  if (isBe) {
    // Be is hypostatic to the C-locus: it overrides Albino specifically (Ivory),
    // otherwise it just prefixes whatever base phenotype was derived above.
    result = genotype.C === 'c/c'
      ? { ...base, phenotype: 'Ivory' }
      : { ...base, phenotype: `Black Eyed ${base.phenotype}` };
  }

  return applyModifiers(result, genotype);
}

// ---------------------------------------------------------------------------
// RAT GENE LOCI — metadata for GeneticCodeBuilder visual selector
// ---------------------------------------------------------------------------

export const RAT_GENE_LOCI = {
  // --- Color genes ---
  A:   { name: 'Agouti',              description: 'A/- = Agouti, a/a = Black', combinations: ['A/A', 'A/a', 'a/a'] },
  B:   { name: 'Brown',               description: 'b/b = Chocolate (Black) or Chocolate Agouti', combinations: ['B/B', 'B/b', 'b/b'] },
  Be:  { name: 'Black-Eyed',          description: 'Dominant, hypostatic to C-locus. Be/be or Be/Be = "Black Eyed" prefix on the base phenotype (Be + c/c = Ivory instead).', combinations: ['Be/Be', 'Be/be', 'be/be'] },
  Bu:  { name: 'Burmese',             description: 'Requires restrictive C to express. Bu/bu = Burmese, Bu/Bu = Sable', combinations: ['Bu/Bu', 'Bu/bu', 'bu/bu'] },
  C:   { name: 'C-locus',             description: 'c/c = Albino, ch/ch = Siamese, ch/c = Himalayan, cm/* = Marten, ct/* = Tonkinese', combinations: ['C/C', 'C/ct', 'C/cm', 'C/ch', 'C/c', 'ct/ct', 'ct/cm', 'ct/ch', 'ct/c', 'cm/cm', 'cm/ch', 'cm/c', 'ch/ch', 'ch/c', 'c/c'] },
  D:   { name: 'Dilute (Russian Blue)', description: 'd/d = Russian Blue (Black) or Russian Blue Agouti', combinations: ['D/D', 'D/d', 'd/d'] },
  G:   { name: 'Gray (American Blue)', description: 'g/g = American Blue (Black) or Opal (Agouti)', combinations: ['G/G', 'G/g', 'g/g'] },
  M:   { name: 'Mink',                description: 'm/m = Mink (Black) or Cinnamon (Agouti). Required for Pearl/Merle to express.', combinations: ['M/M', 'M/m', 'm/m'] },
  Mo:  { name: 'Mock Mink',           description: 'Recessive, separate locus from Mink (M). mo/mo is visually identical to Mink/Cinnamon but does not complement with M — a non-carrier at M paired with mo/mo still shows Mink/Cinnamon.', combinations: ['Mo/Mo', 'Mo/mo', 'mo/mo'] },
  P:   { name: 'Pink-eyed Dilution',  description: 'p/p = Champagne (Black) or Amber (Agouti)', combinations: ['P/P', 'P/p', 'p/p'] },
  Pe:  { name: 'Pearl',               description: 'Pe/pe appends Pearl when m/m present. Pe/Pe is lethal.', combinations: ['Pe/Pe', 'Pe/pe', 'pe/pe'] },
  R:   { name: 'Red-eye Dilution',    description: 'r/r = Beige (Black) or Topaz (Agouti)', combinations: ['R/R', 'R/r', 'r/r'] },
  Me:  { name: 'Merle',               description: 'Me/me appends Merle when m/m present. Me/Me appends Extreme Merle (not lethal, per AFRMA).', combinations: ['Me/Me', 'Me/me', 'me/me'] },
  // --- Marking genes ---
  Dal: { name: 'Dalmatian',           description: 'Dominant. Dal/dal = Dalmatian. Dal/Dal is lethal.', combinations: ['Dal/Dal', 'Dal/dal', 'dal/dal'] },
  Dw:  { name: 'Downunder',           description: 'Dominant. Dw/dw or Dw/Dw = Downunder; combines with certain H-locus genotypes for a specific compound name.', combinations: ['Dw/Dw', 'Dw/dw', 'dw/dw'] },
  H:   { name: 'Hooded',              description: 'Multi-allele. H/H = Self (no marking), h/h = Hooded. Hre/Hre (Double Essex) is assumed homozygous lethal.', combinations: ['H/H', 'H/Hre', 'H/hi', 'H/he', 'H/hn', 'H/h', 'Hre/Hre', 'Hre/hi', 'Hre/he', 'Hre/hn', 'Hre/h', 'hi/hi', 'hi/he', 'hi/hn', 'hi/h', 'he/he', 'he/hn', 'he/h', 'hn/hn', 'hn/h', 'h/h'] },
  Hs:  { name: 'Headspot',            description: 'Recessive, separate from H-locus. hs/hs combines with the H-locus genotype to produce a specific pattern name.', combinations: ['Hs/Hs', 'Hs/hs', 'hs/hs'] },
  Ma:  { name: 'Marble',              description: 'Dominant. Ma/ma = Marble. Ma/Ma is possibly lethal/problematic.', combinations: ['Ma/Ma', 'Ma/ma', 'ma/ma'] },
  Ro:  { name: 'Roan',                description: 'Recessive. ro/ro = Roan (progressive white hairs).', combinations: ['Ro/Ro', 'Ro/ro', 'ro/ro'] },
  Sf:  { name: 'Snowflake',           description: 'Recessive. sf/sf = Snowflake, simply appended to whatever marking phenotype already exists.', combinations: ['Sf/Sf', 'Sf/sf', 'sf/sf'] },
  Wh:  { name: 'Whiteside',           description: 'Recessive. wh/wh = Whiteside (both white flanks).', combinations: ['Wh/Wh', 'Wh/wh', 'wh/wh'] },
  Ws:  { name: 'Dominant White Spotting', description: 'Dominant. Ws/w = White Spot. Ws/Ws is lethal.', combinations: ['Ws/Ws', 'Ws/w', 'w/w'] },
  // --- Coat genes ---
  Re:  { name: 'Rex',                 description: 'Dominant. Re/re = Rex, Re/Re = Double Rex.', combinations: ['Re/Re', 'Re/re', 're/re'] },
  Ve:  { name: 'Velveteen',           description: 'Dominant. Ve/ve = Velveteen, Ve/Ve = Double Velveteen. Official genetic code unknown.', combinations: ['Ve/Ve', 'Ve/ve', 've/ve'] },
  Sm:  { name: 'Silvermane',          description: 'Dominant. Sm/sm = Silvermane, Sm/Sm = Extreme Silvermane. Sm/Sm is suspected lethal in utero.', combinations: ['Sm/Sm', 'Sm/sm', 'sm/sm'] },
  Lu:  { name: 'Lux',                 description: 'Dominant. Lu/lu = Lux, Lu/Lu = Extreme Lux. Lu/Lu carries a very high risk of deformities.', combinations: ['Lu/Lu', 'Lu/lu', 'lu/lu'] },
  Sy:  { name: 'Silky',               description: 'Dominant. Sy/sy = Silky, Sy/Sy = Double Silky (stronger expression). Longer, softer/silkier coat.', combinations: ['Sy/Sy', 'Sy/sy', 'sy/sy'] },
  Sk:  { name: 'Silk',                description: 'Dominant. Sk/sk = Silk, Sk/Sk = Double Silk (distinct stronger expression). Fine, lustrous/satin-like coat.', combinations: ['Sk/Sk', 'Sk/sk', 'sk/sk'] },
  hr:  { name: 'Hairless',            description: 'Recessive. hr/hr = Hairless (Rhino, no coat).', combinations: ['Hr/Hr', 'Hr/hr', 'hr/hr'] },
  hrl: { name: 'Harley',              description: 'Recessive. hrl/hrl = Harley (patchy coat). Official genetic code unknown.', combinations: ['Hrl/Hrl', 'Hrl/hrl', 'hrl/hrl'] },
  sa:  { name: 'Satin',               description: 'Recessive. sa/sa = Satin (shiny coat).', combinations: ['Sa/Sa', 'Sa/sa', 'sa/sa'] },
  nz:  { name: 'Angora',              description: 'Recessive. nz/nz = Angora (long coat). New Zealand lines only.', combinations: ['Nz/Nz', 'Nz/nz', 'nz/nz'] },
  fz:  { name: 'Fuzz',                description: 'Recessive. fz/fz = Fuzz (Nude).', combinations: ['Fz/Fz', 'Fz/fz', 'fz/fz'] },
  pw:  { name: 'Werewolf',            description: 'Recessive. pw/pw = Werewolf (Patchwork).', combinations: ['Pw/Pw', 'Pw/pw', 'pw/pw'] },
  // --- Ear type ---
  Du:  { name: 'Dumbo',               description: 'Recessive. du/du = Dumbo (low-set ears).', combinations: ['Du/Du', 'Du/du', 'du/du'] },

  // --- Body type ---
  dr:  { name: 'Dwarf',               description: 'Recessive. dr/dr = Dwarf (small body size).', combinations: ['Dr/Dr', 'Dr/dr', 'dr/dr'] },
  Mx:  { name: 'Manx',                description: 'Dominant, tailless. Mx/mx = Manx. Mx/Mx is homozygous lethal.', combinations: ['Mx/Mx', 'Mx/mx', 'mx/mx'] },
};
