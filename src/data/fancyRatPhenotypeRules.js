/**
 * Fancy Rat — Multi-locus phenotype combination rules
 *
 * Priority-ordered: the first rule whose `match` conditions ALL pass wins.
 *
 * Rule shape:
 *   { match: { [locusSymbol]: string[] }, phenotype: string, notes?: string, unconfirmed?: true }
 *
 * All conditions in `match` are AND logic.
 * A locus array means "any of these notations".
 *
 * Locus symbols match the geneLoci keys returned by the API (post symbol-override):
 *   A, B, Bu, C, D, G, M, P, R   (color genes — live DB)
 *   Dal, Du, H, Ma, Me, Pe, Ro, Wh, Ws    (marking genes — not yet in DB)
 *   Re, Ve, Br, wo, Wa, Ki, Sh            (coat genes — not yet in DB)
 *
 * A-locus shorthands used throughout:
 *   BLACK  = a/a   (self/black phenotype)
 *   AGOUTI = A/A or A/a  (agouti phenotype)
 */

const BLACK  = ['a/a'];
const AGOUTI = ['A/A', 'A/a'];

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
  // C-LOCUS COMPOUND HETEROZYGOTES — phenotype unclear
  // =========================================================
  { match: { C: ['ct/cm'] }, phenotype: 'Unknown (ct/cm)' },
  { match: { C: ['ct/ch'] }, phenotype: 'Unknown (ct/ch)' },
  { match: { C: ['ct/c']  }, phenotype: 'Unknown (ct/c)'  },

  // =========================================================
  // BURMESE × SIAMESE / HIMALAYAN — Bu + ch allele
  // Must come before plain C-locus rules
  // =========================================================
  { match: { A: BLACK,  Bu: ['Bu/bu'], C: ['ch/ch', 'ch/c'] }, phenotype: 'Burmese'         },
  { match: { A: BLACK,  Bu: ['Bu/Bu'], C: ['ch/ch', 'ch/c'] }, phenotype: 'Sable'           },
  { match: { A: AGOUTI, Bu: ['Bu/bu'], C: ['ch/ch', 'ch/c'] }, phenotype: 'Wheaten Burmese' },
  { match: { A: AGOUTI, Bu: ['Bu/Bu'], C: ['ch/ch', 'ch/c'] }, phenotype: 'Wheaten Sable'   },

  // =========================================================
  // BURMESE × MARTEN — Bu + cm allele
  // =========================================================
  { match: { A: BLACK,  Bu: ['Bu/bu'], C: ['cm/cm', 'cm/ch', 'cm/c'] }, phenotype: 'Burmese Marten'  },
  { match: { A: AGOUTI, Bu: ['Bu/bu'], C: ['cm/cm', 'cm/ch', 'cm/c'] }, phenotype: 'Wheaten Marten'  },

  // =========================================================
  // SIAMESE (ch/ch) × DILUTION COMPOUNDS — most specific first
  // =========================================================
  { match: { C: ['ch/ch'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Point Siamese'    },
  { match: { C: ['ch/ch'], D: ['d/d'] },              phenotype: 'Russian Point Siamese' },
  { match: { C: ['ch/ch'], M: ['m/m'] },              phenotype: 'Mink Point Siamese'    },

  // =========================================================
  // HIMALAYAN (ch/c) × DILUTION COMPOUNDS
  // =========================================================
  { match: { C: ['ch/c'], D: ['d/d'] }, phenotype: 'Russian Point Himalayan' },

  // =========================================================
  // MARTEN (cm/*) × DILUTION COMPOUNDS — Black base only
  // =========================================================
  { match: { A: BLACK, C: ['cm/cm', 'cm/ch', 'cm/c'], D: ['d/d'] }, phenotype: 'Russian Marten' },
  { match: { A: BLACK, C: ['cm/cm', 'cm/ch', 'cm/c'], M: ['m/m'] }, phenotype: 'Mink Marten'    },

  // =========================================================
  // BLACK BASE (a/a) + C-LOCUS EXPRESSIONS
  // =========================================================
  { match: { A: BLACK, C: ['ch/c']            }, phenotype: 'Himalayan'      },
  { match: { A: BLACK, C: ['ch/ch']           }, phenotype: 'Siamese'        },
  { match: { A: BLACK, C: ['cm/ch']           }, phenotype: 'Pointed Marten' },
  { match: { A: BLACK, C: ['cm/cm', 'cm/c']   }, phenotype: 'Marten'         },
  { match: { A: BLACK, C: ['ct/ct']           }, phenotype: 'Tonkinese'      },

  // =========================================================
  // AGOUTI BASE (A/-) + C-LOCUS EXPRESSIONS
  // =========================================================
  { match: { A: AGOUTI, C: ['ch/c']           }, phenotype: 'Himalayan'              },
  { match: { A: AGOUTI, C: ['ch/ch']          }, phenotype: 'Siamese'                },
  { match: { A: AGOUTI, C: ['cm/ch']          }, phenotype: 'Agouti Pointed Marten'  },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c']  }, phenotype: 'Agouti Marten'          },
  { match: { A: AGOUTI, C: ['ct/ct']          }, phenotype: 'Agouti Tonkinese'       },

  // =========================================================
  // BURMESE — Bu present but no restrictive C allele (does not visually express)
  // Bu only shows a phenotype when paired with ch, cm, or c.
  // Without those, the animal shows its base color — note is attached.
  // =========================================================
  { match: { A: BLACK,  Bu: ['Bu/bu'] }, phenotype: 'Black',  notes: 'Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: BLACK,  Bu: ['Bu/Bu'] }, phenotype: 'Black',  notes: 'Bu/Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: AGOUTI, Bu: ['Bu/bu'] }, phenotype: 'Agouti', notes: 'Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: AGOUTI, Bu: ['Bu/Bu'] }, phenotype: 'Agouti', notes: 'Bu/Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },

  // =========================================================
  // BLACK BASE + DILUTION / MODIFIER GENES
  // =========================================================
  { match: { A: BLACK, B:  ['b/b']    }, phenotype: 'Chocolate'                                       },
  { match: { A: BLACK, D:  ['d/d']    }, phenotype: 'Russian Blue'                                    },
  { match: { A: BLACK, G:  ['g/g']    }, phenotype: 'American Blue'                                   },
  { match: { A: BLACK, M:  ['m/m']    }, phenotype: 'Mink' },
  { match: { A: BLACK, P:  ['p/p']    }, phenotype: 'Champagne'                                       },
  { match: { A: BLACK, R:  ['r/r']    }, phenotype: 'Beige'                                           },

  // =========================================================
  // AGOUTI BASE + DILUTION / MODIFIER GENES
  // =========================================================
  { match: { A: AGOUTI, B:  ['b/b']   }, phenotype: 'Chocolate Agouti'                               },
  { match: { A: AGOUTI, D:  ['d/d']   }, phenotype: 'Russian Blue Agouti'                           },
  { match: { A: AGOUTI, G:  ['g/g']   }, phenotype: 'American Blue Agouti (Opal)'                   },
  { match: { A: AGOUTI, M:  ['m/m']   }, phenotype: 'Cinnamon'                                       },
  { match: { A: AGOUTI, P:  ['p/p']   }, phenotype: 'Silver Fawn'                                    },
  { match: { A: AGOUTI, R:  ['r/r']   }, phenotype: 'Topaz'                                          },

];

/**
 * Evaluate FANCY_RAT_PHENOTYPE_RULES against a genotype object.
 * Returns the first matching rule, or null if none match.
 *
 * @param {Object} genotype  - e.g. { A: 'a/a', C: 'C/C', M: 'm/m', ... }
 * @returns {{ phenotype: string, notes?: string, unconfirmed?: true } | null}
 */
export function matchFancyRatPhenotype(genotype) {
  for (const rule of FANCY_RAT_PHENOTYPE_RULES) {
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
      const notation = genotype[locus];
      return notation && allowed.includes(notation);
    });
    if (allMatch) return rule;
  }
  return null;
}
