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
  // PEARL (Pe) & MERLE (Me) — only alter phenotype on m/m base
  // Pe and Me are not yet in the live DB; rules ready for when added.
  // =========================================================
  { match: { A: AGOUTI, M: ['m/m'], Pe: ['Pe/pe'] }, phenotype: 'Cinnamon Pearl', notes: 'Pe gene not yet in DB' },
  { match: { A: BLACK,  M: ['m/m'], Pe: ['Pe/pe'] }, phenotype: 'Pearl',          notes: 'Pe gene not yet in DB' },
  { match: { A: AGOUTI, M: ['m/m'], Me: ['Me/me'] }, phenotype: 'Cinnamon Merle', notes: 'Me gene not yet in DB' },
  { match: { A: BLACK,  M: ['m/m'], Me: ['Me/me'] }, phenotype: 'Merle',          notes: 'Me gene not yet in DB' },

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
