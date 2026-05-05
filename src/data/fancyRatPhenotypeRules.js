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
 *   A, B, Bu, C, D, G, M, P, R               (color genes)
 *   Dal, H, Ma, Ro, Wh, Ws                   (marking genes — appended as suffixes)
 *   Re, Ve, Br, wo, Wa, Ki, Sh               (coat genes — appended as suffixes)
 *   Du                                        (ear type — appended as suffix)
 *   Me, Pe                                    (modifiers — append only when m/m present)
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
  // BURMESE × C-LOCUS — all Bu + restrictive-C combos (with or without dilutions)
  // are derived dynamically by deriveBuPhenotype() in matchFancyRatPhenotype.
  // Only Ivory Marten (Bu/Bu + cm) is kept explicit as a stable name override.
  // =========================================================
  { match: { Bu: ['Bu/Bu'], C: ['cm/cm', 'cm/ch', 'cm/c'] }, phenotype: 'Ivory Marten' },

  // =========================================================
  // SIAMESE (ch/ch) × DILUTION COMPOUNDS — most specific first
  // =========================================================
  { match: { C: ['ch/ch'], D: ['d/d'], M: ['m/m'] }, phenotype: 'Dove Point Siamese'    },
  { match: { C: ['ch/ch'], D: ['d/d'] },              phenotype: 'Russian Point Siamese' },
  { match: { C: ['ch/ch'], M: ['m/m'] },              phenotype: 'Mink Point Siamese'    },
  { match: { A: BLACK,  C: ['ch/ch'], B: ['b/b'] },   phenotype: 'Chocolate Siamese'               },
  { match: { A: AGOUTI, C: ['ch/ch'], B: ['b/b'] },   phenotype: 'Chocolate Agouti Siamese'        },
  { match: { A: BLACK,  C: ['ch/ch'], G: ['g/g'] },   phenotype: 'American Blue Siamese'           },
  { match: { A: AGOUTI, C: ['ch/ch'], G: ['g/g'] },   phenotype: 'American Blue Agouti Siamese'    },
  { match: { A: BLACK,  C: ['ch/ch'], P: ['p/p'] },   phenotype: 'Champagne Siamese'               },
  { match: { A: AGOUTI, C: ['ch/ch'], P: ['p/p'] },   phenotype: 'Silver Fawn Siamese'             },
  { match: { A: BLACK,  C: ['ch/ch'], R: ['r/r'] },   phenotype: 'Beige Siamese'                   },
  { match: { A: AGOUTI, C: ['ch/ch'], R: ['r/r'] },   phenotype: 'Topaz Siamese'                   },

  // =========================================================
  // HIMALAYAN (ch/c) × DILUTION COMPOUNDS
  // =========================================================
  { match: { C: ['ch/c'], D: ['d/d'] }, phenotype: 'Russian Point Himalayan' },
  { match: { A: BLACK,  C: ['ch/c'], B: ['b/b'] },    phenotype: 'Chocolate Himalayan'             },
  { match: { A: AGOUTI, C: ['ch/c'], B: ['b/b'] },    phenotype: 'Chocolate Agouti Himalayan'      },
  { match: { A: BLACK,  C: ['ch/c'], G: ['g/g'] },    phenotype: 'American Blue Himalayan'         },
  { match: { A: AGOUTI, C: ['ch/c'], G: ['g/g'] },    phenotype: 'American Blue Agouti Himalayan'  },
  { match: { A: BLACK,  C: ['ch/c'], P: ['p/p'] },    phenotype: 'Champagne Himalayan'             },
  { match: { A: AGOUTI, C: ['ch/c'], P: ['p/p'] },    phenotype: 'Silver Fawn Himalayan'           },
  { match: { A: BLACK,  C: ['ch/c'], R: ['r/r'] },    phenotype: 'Beige Himalayan'                 },
  { match: { A: AGOUTI, C: ['ch/c'], R: ['r/r'] },    phenotype: 'Topaz Himalayan'                 },

  // =========================================================
  // POINTED MARTEN (cm/ch) × DILUTION COMPOUNDS
  // =========================================================
  { match: { A: BLACK,  C: ['cm/ch'], B: ['b/b'] },   phenotype: 'Chocolate Pointed Marten'             },
  { match: { A: AGOUTI, C: ['cm/ch'], B: ['b/b'] },   phenotype: 'Chocolate Agouti Pointed Marten'      },
  { match: { A: BLACK,  C: ['cm/ch'], G: ['g/g'] },   phenotype: 'American Blue Pointed Marten'         },
  { match: { A: AGOUTI, C: ['cm/ch'], G: ['g/g'] },   phenotype: 'American Blue Agouti Pointed Marten'  },
  { match: { A: BLACK,  C: ['cm/ch'], P: ['p/p'] },   phenotype: 'Champagne Pointed Marten'             },
  { match: { A: AGOUTI, C: ['cm/ch'], P: ['p/p'] },   phenotype: 'Silver Fawn Pointed Marten'           },
  { match: { A: BLACK,  C: ['cm/ch'], R: ['r/r'] },   phenotype: 'Beige Pointed Marten'                 },
  { match: { A: AGOUTI, C: ['cm/ch'], R: ['r/r'] },   phenotype: 'Topaz Pointed Marten'                 },

  // =========================================================
  // MARTEN (cm/*) × DILUTION COMPOUNDS — Black base only
  // =========================================================
  { match: { A: BLACK, C: ['cm/cm', 'cm/ch', 'cm/c'], D: ['d/d'] }, phenotype: 'Russian Marten' },
  { match: { A: BLACK, C: ['cm/cm', 'cm/ch', 'cm/c'], M: ['m/m'] }, phenotype: 'Mink Marten'    },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], B: ['b/b'] },   phenotype: 'Chocolate Marten'             },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], B: ['b/b'] },   phenotype: 'Chocolate Agouti Marten'      },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], G: ['g/g'] },   phenotype: 'American Blue Marten'         },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], G: ['g/g'] },   phenotype: 'American Blue Agouti Marten'  },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], P: ['p/p'] },   phenotype: 'Champagne Marten'             },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], P: ['p/p'] },   phenotype: 'Silver Fawn Marten'           },
  { match: { A: BLACK,  C: ['cm/cm', 'cm/c'], R: ['r/r'] },   phenotype: 'Beige Marten'                 },
  { match: { A: AGOUTI, C: ['cm/cm', 'cm/c'], R: ['r/r'] },   phenotype: 'Topaz Marten'                 },

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
  { match: { A: BLACK,  Bu: ['Bu/bu'], C: FULL_C }, phenotype: 'Black',  notes: 'Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: BLACK,  Bu: ['Bu/Bu'], C: FULL_C }, phenotype: 'Black',  notes: 'Bu/Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: AGOUTI, Bu: ['Bu/bu'], C: FULL_C }, phenotype: 'Agouti', notes: 'Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },
  { match: { A: AGOUTI, Bu: ['Bu/Bu'], C: FULL_C }, phenotype: 'Agouti', notes: 'Bu/Bu present but does not visually express — requires a restrictive C allele (ch, cm, or c)' },

  // PEARL (Pe) & MERLE (Me): handled as modifiers in matchFancyRatPhenotype.
  // They append ' Pearl' / ' Merle' to any phenotype when m/m is also present.

  // =========================================================
  // BASE COLOR FALLBACKS — catch-all when no dilutions present
  // Must be last in the rules array.
  // =========================================================
  { match: { A: BLACK  }, phenotype: 'Black'  },
  { match: { A: AGOUTI }, phenotype: 'Agouti' },

  // =========================================================
  // 6-LOCUS COMPOUND DILUTIONS — must be before all others
  // =========================================================
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Lavender Chocolate Champagne Beige' },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Lavender Chocolate Silver Topaz'    },

  // =========================================================
  // 5-LOCUS COMPOUND DILUTIONS — must be before 4-locus pairs
  // =========================================================

  // Russian (D) × four other dilutions
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Lavender Chocolate Champagne'       },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Lavender Chocolate Silver Fawn'     },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Caramel'                  },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Saffron'                  },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Caramel'                   },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Saffron'                   },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Caramel'                     },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Saffron'                     },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Lavender Champagne Beige'          },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Lavender Silver Topaz'             },

  // Non-Russian 5-dilution combos
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Lavender Chocolate Champagne Beige'        },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Lavender Chocolate Silver Topaz'           },

  // =========================================================
  // 4-LOCUS COMPOUND DILUTIONS — must be before 3-locus pairs
  // =========================================================

  // Russian (D) × three other dilutions
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Russian Lavender Chocolate'       },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Russian Lavender Chocolate Agouti'},
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Russian Blue Creme'               },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Russian Blue Creme Agouti'        },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Russian Blue Caramel'             },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Russian Blue Saffron'             },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Chocolate Honey'          },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Cinnamon Honey'           },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Chocolate Mocha'          },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Cinnamon Argente'         },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Caramel Champagne'        },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Saffron Silver Fawn'      },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Lavender Champagne'       },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Russian Lavender Silver Fawn'     },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Beige'           },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Russian Lavender Fawn'            },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Beige'            },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Apricot Topaz'            },
  { match: { A: BLACK,  D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Beige'              },
  { match: { A: AGOUTI, D: ['d/d'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Honey Topaz'              },

  // Non-Russian 4-dilution combos
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Lavender Chocolate Champagne'     },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'], P: ['p/p'] }, phenotype: 'Lavender Chocolate Silver Fawn'   },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Lavender Caramel'                 },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'], R: ['r/r'] }, phenotype: 'Lavender Saffron'                 },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Caramel'                  },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Saffron'                  },
  { match: { A: BLACK,  B: ['b/b'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Caramel'                    },
  { match: { A: AGOUTI, B: ['b/b'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Saffron'                    },
  { match: { A: BLACK,  G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Lavender Champagne Beige'         },
  { match: { A: AGOUTI, G: ['g/g'], M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Lavender Silver Topaz'            },

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
  { match: { A: AGOUTI, G: ['g/g'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Lavender Silver Fawn'     },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Blue Caramel'             },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], R: ['r/r'] }, phenotype: 'Blue Saffron'             },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Blue Creme'               },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], P: ['p/p'] }, phenotype: 'Blue Creme Agouti'        },
  { match: { A: BLACK,  B: ['b/b'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Chocolate Mocha'          },
  { match: { A: AGOUTI, B: ['b/b'], R: ['r/r'], M: ['m/m'] }, phenotype: 'Cinnamon Argente'         },
  { match: { A: BLACK,  B: ['b/b'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Chocolate Honey'          },
  { match: { A: AGOUTI, B: ['b/b'], P: ['p/p'], M: ['m/m'] }, phenotype: 'Cinnamon Honey'           },
  { match: { A: BLACK,  B: ['b/b'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Lavender Chocolate'       },
  { match: { A: AGOUTI, B: ['b/b'], G: ['g/g'], M: ['m/m'] }, phenotype: 'Lavender Chocolate Agouti'},
  { match: { A: BLACK,  B: ['b/b'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Caramel Champagne'        },
  { match: { A: AGOUTI, B: ['b/b'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Saffron Silver Fawn'      },
  { match: { A: BLACK,  D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Champagne Beige'  },
  { match: { A: AGOUTI, D: ['d/d'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Russian Silver Topaz'     },
  { match: { A: BLACK,  G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Beige'            },
  { match: { A: AGOUTI, G: ['g/g'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Apricot Topaz'            },
  { match: { A: BLACK,  M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Beige'              },
  { match: { A: AGOUTI, M: ['m/m'], P: ['p/p'], R: ['r/r'] }, phenotype: 'Honey Topaz'              },

  // =========================================================
  // 2-LOCUS COMPOUND DILUTIONS
  // =========================================================
  { match: { A: BLACK,  D: ['d/d'], R: ['r/r'] }, phenotype: 'Russian Beige'            },
  { match: { A: AGOUTI, D: ['d/d'], R: ['r/r'] }, phenotype: 'Russian Topaz'            },
  { match: { A: BLACK,  D: ['d/d'], P: ['p/p'] }, phenotype: 'Russian Champagne'        },
  { match: { A: AGOUTI, D: ['d/d'], P: ['p/p'] }, phenotype: 'Russian Silver Fawn'      },
  { match: { A: BLACK,  D: ['d/d'], G: ['g/g'] }, phenotype: 'Russian Silver'           },
  { match: { A: AGOUTI, D: ['d/d'], G: ['g/g'] }, phenotype: 'Russian Silver Agouti'    },
  { match: { A: BLACK,  D: ['d/d'], M: ['m/m'] }, phenotype: 'Russian Dove'             },
  { match: { A: AGOUTI, D: ['d/d'], M: ['m/m'] }, phenotype: 'Russian Cinnamon'         },
  { match: { A: BLACK,  B: ['b/b'], D: ['d/d'] }, phenotype: 'Russian Chocolate'        },
  { match: { A: AGOUTI, B: ['b/b'], D: ['d/d'] }, phenotype: 'Russian Chocolate Agouti' },
  { match: { A: BLACK,  G: ['g/g'], R: ['r/r'] }, phenotype: 'Blue Silver'              },
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
  { match: { A: BLACK,  P: ['p/p'], R: ['r/r'] }, phenotype: 'Champagne Beige'         },
  { match: { A: AGOUTI, P: ['p/p'], R: ['r/r'] }, phenotype: 'Silver Topaz'            },

  // =========================================================
  // SINGLE DILUTION — BLACK BASE (a/a)
  // =========================================================
  { match: { A: BLACK, B: ['b/b'] }, phenotype: 'Chocolate'    },
  { match: { A: BLACK, D: ['d/d'] }, phenotype: 'Russian Blue' },
  { match: { A: BLACK, G: ['g/g'] }, phenotype: 'American Blue'},
  { match: { A: BLACK, M: ['m/m'] }, phenotype: 'Mink'         },
  { match: { A: BLACK, P: ['p/p'] }, phenotype: 'Champagne'    },
  { match: { A: BLACK, R: ['r/r'] }, phenotype: 'Beige'        },

  // =========================================================
  // SINGLE DILUTION — AGOUTI BASE (A/-)
  // =========================================================
  { match: { A: AGOUTI, B: ['b/b'] }, phenotype: 'Chocolate Agouti'          },
  { match: { A: AGOUTI, D: ['d/d'] }, phenotype: 'Russian Blue Agouti'       },
  { match: { A: AGOUTI, G: ['g/g'] }, phenotype: 'American Blue Agouti (Opal)'},
  { match: { A: AGOUTI, M: ['m/m'] }, phenotype: 'Cinnamon'                  },
  { match: { A: AGOUTI, P: ['p/p'] }, phenotype: 'Silver Fawn'               },
  { match: { A: AGOUTI, R: ['r/r'] }, phenotype: 'Topaz'                     },

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
  if (C === 'ct/ct') return 'tonkinese';
  return null; // ct/* Unknown combos — handled by explicit rules
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
  'H/Hre':     'Patched',
  'H/hi':      'English Irish',
  'H/he':      'Variberk',
  'H/hn':      'Variberk',
  'H/h':       'Berkshire',
  'Hre/Hre':   'Restricted Hooded',
  'Hre/hi':    'Bareback Headspot',
  'Hre/he':    'Bareback',
  'Hre/hn':    'Restricted Hooded',
  'Hre/h':     'Masked',
  'hi/hi':     'English Irish',
  'hi/he':     'Variegated',
  'hi/hn':     'Variegated',
  'hi/h':      'Berkshire',
  'he/he':     'Masked',
  'he/hn':     'Capped',
  'he/h':      'Variegated',
  'hn/hn':     'Capped Notch',
  'hn/h':      'Bareback',
  'h/h':       'Hooded',
};

const DAL_PHENOTYPES = {
  'Dal/Dal': 'Double Dalmatian',
  'Dal/dal': 'Dalmatian',
};

const MA_PHENOTYPES = {
  'Ma/Ma': 'Double Marble',
  'Ma/ma': 'Marble',
};

const WS_PHENOTYPES = {
  'Ws/Ws': 'Double White Spot',
  'Ws/w':  'White Spot',
};

// Ro and Wh are recessive — only express when homozygous recessive
const RO_PHENOTYPES  = { 'ro/ro': 'Roan' };
const WH_PHENOTYPES  = { 'wh/wh': 'Whiteside' };

// Coat gene lookup: keyed by locus symbol → notation → label
const COAT_PHENOTYPES = {
  Re: { 'Re/Re': 'Double Rex',       'Re/re': 'Rex'              },
  Ve: { 'Ve/Ve': 'Double Velveteen', 'Ve/ve': 'Velveteen'        },
  Br: { 'Br/Br': 'Extreme Bristle',  'Br/br': 'Bristle'          },
  wo: { 'Wo/Wo': 'Extreme Woolly',   'Wo/wo': 'Woolly'           },
  Wa: { 'Wa/Wa': 'Extreme Wavy',     'Wa/wa': 'Wavy'             },
  Ki: { 'Ki/Ki': 'Extreme Kinky',    'Ki/ki': 'Kinky'            },
  Sh: { 'Sh/Sh': 'Extreme Shaggy',   'Sh/sh': 'Shaggy'          },
};

// Ear gene (Dumbo is recessive — only du/du expresses)
const DU_PHENOTYPES  = { 'du/du': 'Dumbo' };

/**
 * Apply all post-color modifiers: marking, coat, ear, Pearl, Merle.
 * Order: [color] [marking] [coat] [ear] [Pearl] [Merle]
 */
function applyModifiers(rule, genotype) {
  let phenotype = rule.phenotype;

  // --- Hooded locus (Self = no marking, skip) ---
  const hLabel = H_PHENOTYPES[genotype.H];
  if (hLabel && hLabel !== 'Self') phenotype += ` ${hLabel}`;

  // --- Other marking genes ---
  const dalLabel = DAL_PHENOTYPES[genotype.Dal];
  if (dalLabel) phenotype += ` ${dalLabel}`;

  const maLabel = MA_PHENOTYPES[genotype.Ma];
  if (maLabel) phenotype += ` ${maLabel}`;

  const roLabel = RO_PHENOTYPES[genotype.Ro];
  if (roLabel) phenotype += ` ${roLabel}`;

  const whLabel = WH_PHENOTYPES[genotype.Wh];
  if (whLabel) phenotype += ` ${whLabel}`;

  const wsLabel = WS_PHENOTYPES[genotype.Ws];
  if (wsLabel) phenotype += ` ${wsLabel}`;

  // --- Coat genes ---
  for (const [locus, map] of Object.entries(COAT_PHENOTYPES)) {
    const coatLabel = map[genotype[locus]];
    if (coatLabel) phenotype += ` ${coatLabel}`;
  }

  // --- Ear type ---
  const duLabel = DU_PHENOTYPES[genotype.Du];
  if (duLabel) phenotype += ` ${duLabel}`;

  // --- Pearl / Merle (only when m/m present) ---
  if (genotype.M === 'm/m') {
    if (genotype.Pe === 'Pe/pe') phenotype += ' Pearl';
    if (genotype.Me === 'Me/me') phenotype += ' Merle';
  }

  return { ...rule, phenotype };
}

// ---------------------------------------------------------------------------
// BU DERIVATION
// ---------------------------------------------------------------------------

/**
 * Derive phenotype when Bu is present with a fully-restrictive C allele.
 * Pipeline: [Wheaten if Agouti] [base dilution] [C-locus label] [Bu modifier]
 *
 * Ivory Marten (Bu/Bu + cm) is handled by an explicit rule and skipped here.
 * Bu fallback (Bu + full C) is handled by explicit rules and skipped here.
 */
function deriveBuPhenotype(genotype) {
  const { Bu, C, A } = genotype;
  if (!Bu || Bu === 'bu/bu') return null;
  if (!C || FULL_C.includes(C) || C === 'c/c') return null; // full-C or Albino: explicit rules
  if (Bu === 'Bu/Bu' && ['cm/cm', 'cm/ch', 'cm/c'].includes(C)) return null; // Ivory Marten: explicit

  const cType = getCType(C);
  if (!cType) return null;

  const isAgouti = AGOUTI.includes(A);
  const isMarten = cType === 'marten';

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

  // C-locus label (marten handled via Bu suffix)
  const cLabel = isMarten ? '' : (C_SUFFIX[cType] ?? '');

  // Bu suffix
  const buDosage = Bu === 'Bu/Bu' ? 'Sable' : 'Burmese';
  const buSuffix = isMarten ? `${buDosage} Marten` : buDosage;

  // Assemble: Wheaten (if Agouti) + dilution + C-label + Bu-suffix
  const parts = [];
  if (isAgouti) parts.push('Wheaten');
  if (dilution) parts.push(dilution);
  if (cLabel)   parts.push(cLabel);
  parts.push(buSuffix);
  return parts.join(' ');
}

// ---------------------------------------------------------------------------

/**
 * Evaluate FANCY_RAT_PHENOTYPE_RULES against a genotype object.
 *
 * Pass 1 — explicit rules (Albino, Stone, Unknown C, Ivory Marten, Bu fallbacks,
 *           compound/single dilutions).
 * Pass 2 — Bu derivation: Bu present with restrictive C — derives base dilution
 *           then builds [C-locus] [Bu modifier] name.
 * Pass 3 — C-locus derivation: restrictive C with no Bu — derives base then appends
 *           C-locus suffix with traditional-name overrides.
 * Modifiers — Pearl / Merle append to any phenotype when m/m is present.
 *
 * @param {Object} genotype  - e.g. { A: 'a/a', C: 'ch/ch', M: 'm/m', D: 'd/d', ... }
 * @returns {{ phenotype: string, notes?: string } | null}
 */
export function matchFancyRatPhenotype(genotype) {
  // Pass 1: explicit rules
  for (const rule of FANCY_RAT_PHENOTYPE_RULES) {
    const allMatch = Object.entries(rule.match).every(([locus, allowed]) => {
      const notation = genotype[locus];
      return notation != null && allowed.includes(notation);
    });
    if (allMatch) return applyModifiers(rule, genotype);
  }

  // Pass 2: Bu derivation (Bu + restrictive C, with or without dilutions)
  const buPhenotype = deriveBuPhenotype(genotype);
  if (buPhenotype != null) return applyModifiers({ phenotype: buPhenotype }, genotype);

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
        return applyModifiers({ ...rule, phenotype: derived }, genotype);
      }
    }
    // No dilution rule matched — return plain C-locus phenotype
    const baseLabel = genotype.A === 'a/a' ? 'Black' : 'Agouti';
    return applyModifiers({ phenotype: deriveWithCLocus(baseLabel, cType) }, genotype);
  }

  return null;
}
