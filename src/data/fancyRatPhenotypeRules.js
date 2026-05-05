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
  // ALBINO — masks all other color/pattern expression
  // =========================================================
  { match: { C: ['c/c'] }, phenotype: 'Albino' },

  // =========================================================
  // C-LOCUS COMPOUND HETEROZYGOTES — phenotype unclear
  // =========================================================
  { match: { C: ['ct/cm'] }, phenotype: 'Unknown (ct/cm)' },
  { match: { C: ['ct/ch'] }, phenotype: 'Unknown (ct/ch)' },
  { match: { C: ['ct/c']  }, phenotype: 'Unknown (ct/c)'  },
  { match: { C: ['cm/c']  }, phenotype: 'Unknown (cm/c)'  },

  // =========================================================
  // BLACK BASE (a/a) + C-LOCUS EXPRESSIONS
  // =========================================================
  { match: { A: BLACK, C: ['ch/c']  }, phenotype: 'Himalayan'     },
  { match: { A: BLACK, C: ['ch/ch'] }, phenotype: 'Siamese'       },
  { match: { A: BLACK, C: ['cm/ch'] }, phenotype: 'Pointed Marten'},
  { match: { A: BLACK, C: ['cm/cm'] }, phenotype: 'Marten'        },
  { match: { A: BLACK, C: ['ct/ct'] }, phenotype: 'Tonkinese'     },

  // =========================================================
  // AGOUTI BASE (A/-) + C-LOCUS EXPRESSIONS
  // =========================================================
  { match: { A: AGOUTI, C: ['ch/c']  }, phenotype: 'Himalayan'              },
  { match: { A: AGOUTI, C: ['ch/ch'] }, phenotype: 'Siamese'                },
  { match: { A: AGOUTI, C: ['cm/ch'] }, phenotype: 'Agouti Pointed Marten'  },
  { match: { A: AGOUTI, C: ['cm/cm'] }, phenotype: 'Agouti Marten'          },
  { match: { A: AGOUTI, C: ['ct/ct'] }, phenotype: 'Agouti Tonkinese'       },

  // =========================================================
  // BURMESE — hypostatic to C-locus
  // Bu only expresses when C is full color (C/C or carrier).
  // Any non-full C allele pairing takes visual priority over Bu.
  // =========================================================
  { match: { A: BLACK,  Bu: ['Bu/bu'], C: FULL_C }, phenotype: 'Burmese',        notes: 'Burmese is hypostatic to C-locus; C-locus phenotype takes priority if C is non-full' },
  { match: { A: BLACK,  Bu: ['Bu/Bu'], C: FULL_C }, phenotype: 'Double Burmese', notes: 'Burmese is hypostatic to C-locus' },
  { match: { A: AGOUTI, Bu: ['Bu/bu'], C: FULL_C }, phenotype: 'Burmese',        notes: 'Burmese is hypostatic to C-locus' },
  { match: { A: AGOUTI, Bu: ['Bu/Bu'], C: FULL_C }, phenotype: 'Double Burmese', notes: 'Burmese is hypostatic to C-locus' },

  // =========================================================
  // BLACK BASE + DILUTION / MODIFIER GENES
  // =========================================================
  { match: { A: BLACK, B:  ['b/b']    }, phenotype: 'Chocolate'                                       },
  { match: { A: BLACK, D:  ['d/d']    }, phenotype: 'Russian Blue'                                    },
  { match: { A: BLACK, G:  ['g/g']    }, phenotype: 'American Blue'                                   },
  { match: { A: BLACK, M:  ['m/m']    }, phenotype: 'Mink',           unconfirmed: true, notes: 'Mink (m/m) is typically not visually distinct on a black (a/a) base — no separate phenotype name' },
  { match: { A: BLACK, P:  ['p/p']    }, phenotype: 'Champagne'                                       },
  { match: { A: BLACK, R:  ['r/r']    }, phenotype: 'Beige'                                           },

  // =========================================================
  // AGOUTI BASE + DILUTION / MODIFIER GENES
  // =========================================================
  { match: { A: AGOUTI, B:  ['b/b']   }, phenotype: 'Chocolate Agouti'                               },
  { match: { A: AGOUTI, D:  ['d/d']   }, phenotype: 'Russian Blue Agouti'                           },
  { match: { A: AGOUTI, G:  ['g/g']   }, phenotype: 'American Blue Agouti (Opal)'                   },
  { match: { A: AGOUTI, M:  ['m/m']   }, phenotype: 'Cinnamon'                                       },
  { match: { A: AGOUTI, P:  ['p/p']   }, phenotype: 'Silver Fawn (Amber)'                            },
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
