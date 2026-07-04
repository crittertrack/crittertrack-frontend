import React, { useState, useMemo, useEffect } from 'react';
import { Target, Dna, Loader2, Search, Settings, Palette, PlusCircle, X } from 'lucide-react';

const TARGET_OUTCOME_TRAIT_CHIPS = {
    'Fancy Mouse': [
        // Base Colors
        { id: 'black',              label: 'Black',             code: 'a/a',            group: 'Base Color' },
        { id: 'agouti',             label: 'Agouti',            code: 'A/-',            group: 'Base Color' },
        { id: 'am-brindle',         label: 'Am. Brindle',       code: 'Avy/-',          group: 'Base Color' },
        { id: 'dom-red',            label: 'Dominant Red',      code: 'Ay/-',           group: 'Base Color' },

        // Tan, Fox & Shaded
        { id: 'tan',                label: 'Tan',               code: 'any + −/at',     group: 'Tan, Fox & Shaded' },
        { id: 'fox',                label: 'Fox',               code: 'any + −/at + C',       group: 'Tan, Fox & Shaded' },
        { id: 'sable',              label: 'Sable',             code: 'Ay/- + −/at + U/- or -/at + e/e + U/*', group: 'Tan, Fox & Shaded' },

        // Brown Dilutes
        { id: 'chocolate',          label: 'Chocolate',         code: 'b/b',            group: 'Brown Dilute' },
        { id: 'cinnamon',           label: 'Cinnamon',          code: 'A/- b/b',        group: 'Brown Dilute' },

        // Albino & Dilution
        { id: 'albino',             label: 'Albino',            code: 'c/c',            group: 'Albino & Dilution' },
        { id: 'himalayan',          label: 'Himalayan',         code: 'c/ch',           group: 'Albino & Dilution' },
        { id: 'bone',               label: 'Bone',              code: 'c/ce',           group: 'Albino & Dilution' },
        { id: 'siamese',            label: 'Siamese',           code: 'ch/ch',          group: 'Albino & Dilution' },
        { id: 'burmese',            label: 'Burmese',           code: 'ch/cch',         group: 'Albino & Dilution' },
        { id: 'stone',              label: 'Stone',             code: 'c/cch',          group: 'Albino & Dilution' },
        { id: 'beige',              label: 'Beige',             code: 'ce/ce',          group: 'Albino & Dilution' },
        { id: 'colorpoint-beige',   label: 'Colorpoint Beige',  code: 'ch/ce',          group: 'Albino & Dilution' },
        { id: 'mock-choc',          label: 'Mock Chocolate',    code: 'ce/cch',         group: 'Albino & Dilution' },
        { id: 'sepia',              label: 'Sepia',             code: 'a/a cch/cch',    group: 'Albino & Dilution' },
        { id: 'silver-agouti',      label: 'Silver Agouti',     code: 'A/- cch/cch',    group: 'Albino & Dilution' },

        // Blue Dilutes
        { id: 'blue',               label: 'Blue',              code: 'd/d',            group: 'Blue Dilute' },
        { id: 'blue-agouti',        label: 'Blue Agouti',       code: 'A/- d/d',        group: 'Blue Dilute' },
        { id: 'blue-brindle',       label: 'blue-brindle',      code: 'Avy/- p/p',      group: 'Blue Dilute' },
        { id: 'Dominant Amber',     label: 'Amber',             code: 'Ay/- d/d',       group: 'Blue Dilute' },
        { id: 'Recessive Amber',    label: 'Amber',             code: 'd/d e/e',        group: 'Blue Dilute' },

        // Red Dilute
        { id: 'rec-red',            label: 'Recessive Red',     code: 'e/e',            group: 'Red Dilute' },

        // Leaden
        { id: 'Leaden',            label: 'Leaden',            code: 'ln/ln',          group: 'Leaden' },

        // Pink Eye Dilutes
        { id: 'dove',               label: 'Dove',              code: 'p/p',            group: 'Pink Eye Dilute' },
        { id: 'argente',            label: 'Argente',           code: 'A/- p/p',        group: 'Pink Eye Dilute' },

        // Dilutes — Double/Triple
        { id: 'lilac',              label: 'Lilac',             code: 'b/b d/d',        group: 'Dilutes — Double/Triple' },
        { id: 'champagne',          label: 'Champagne',         code: 'b/b p/p',        group: 'Dilutes — Double/Triple' },
        { id: 'silver',             label: 'Silver',            code: 'd/d p/p',        group: 'Dilutes — Double/Triple' },
        { id: 'lavender',           label: 'Lavender',          code: 'b/b d/d p/p',    group: 'Dilutes — Double/Triple' },
        { id: 'cinnamon-argente',   label: 'Cinnamon Argente',  code: 'A/- b/b p/p',   group: 'Dilutes — Double/Triple' },
    
        // Pied
        { id: 'pied',               label: 'Pied',              code: 's/s',            group: 'Pied' },
        { id: 'Hereford',           label: 'Hereford',          code: 's/s+',           group: 'Pied' },
        { id: 'Dutch',              label: 'Dutch',             code: 's/s+',           group: 'Pied' },
        { id: 'Berkshire',          label: 'Berkshire',         code: 's/s+',           group: 'Pied' },

        // Dominant Spotting
        { id: 'variegated',         label: 'Variegated',        code: 'W/w',            group: 'Dominant Spotting' },
        { id: 'banded',             label: 'Banded',            code: 'Wsh/w',          group: 'Dominant Spotting' },
        { id: 'Rumpwhite',          label: 'Rumpwhite',         code: 'Rw/w',           group: 'Dominant Spotting' },

        // Xbrindle
        { id: 'xbrindle',           label: 'Xbrindle',          code: 'Mobr/mobr',      group: 'Xbrindle' },
       
        // Splashed
        { id: 'splashed',           label: 'Splashed',          code: 'Spl/spl',        group: 'Splashed' },

        // Merle
        { id: 'merle',              label: 'Merle',             code: 'rn/rn',          group: 'Merle' },

        // Pearl
        { id: 'pearl',              label: 'Pearl',             code: 'si/si',          group: 'Pearl' },

        // Umbrous
        { id: 'umbrous',            label: 'Umbrous',           code: 'U/-',            group: 'Umbrous' },

        // Shorthair/Longhair
        { id: 'shorthair',          label: 'Shorthair',         code: 'Go/-',           group: 'Shorthair/Longhair' },
        { id: 'longhair',           label: 'Longhair',          code: 'go/go',          group: 'Shorthair/Longhair' },

        // Satin
        { id: 'satin',              label: 'Satin',             code: 'sa/sa',          group: 'Satin' },

        // Astrex & Texel
        { id: 'astrex',             label: 'Astrex',            code: 'Re/-',           group: 'Astrex & Texel' },
        { id: 'texel',              label: 'Texel',             code: 'Re/- go/go',     group: 'Astrex & Texel' },

        // Rosette
        { id: 'rosette',            label: 'Rosette',           code: 'rst/rst',        group: 'Rosette' },

        // Fuzz
        { id: 'fuzz',               label: 'Fuzz',              code: 'fz/fz',          group: 'Fuzz' },

        // Dominant Hairless
        { id: 'dom-hairless',       label: 'Dominant Hairless', code: 'Nu/-',           group: 'Dominant Hairless' },
    ],
    'Fancy Rat': [
        // Base Color — Black series
        { id: 'rat-black',         label: 'Black',               code: 'a/a',          group: 'Base Color — Black' },
        { id: 'rat-chocolate',     label: 'Chocolate',           code: 'a/a b/b',      group: 'Base Color — Black' },
        { id: 'rat-russian-blue',  label: 'Russian Blue',        code: 'a/a d/d',      group: 'Base Color — Black' },
        { id: 'rat-american-blue', label: 'American Blue',       code: 'a/a g/g',      group: 'Base Color — Black' },
        { id: 'rat-mink',          label: 'Mink',                code: 'a/a m/m',      group: 'Base Color — Black' },
        { id: 'rat-champagne',     label: 'Champagne',           code: 'a/a p/p',      group: 'Base Color — Black' },
        { id: 'rat-beige',         label: 'Beige',               code: 'a/a r/r',      group: 'Base Color — Black' },
        // Base Color — Agouti series
        { id: 'rat-agouti',        label: 'Agouti',              code: 'A/A',          group: 'Base Color — Agouti' },
        { id: 'rat-choc-agouti',   label: 'Chocolate Agouti',   code: 'A/A b/b',      group: 'Base Color — Agouti' },
        { id: 'rat-rub-agouti',    label: 'Russian Blue Agouti', code: 'A/A d/d',     group: 'Base Color — Agouti' },
        { id: 'rat-opal',          label: 'Opal',                code: 'A/A g/g',      group: 'Base Color — Agouti' },
        { id: 'rat-cinnamon',      label: 'Cinnamon',            code: 'A/A m/m',      group: 'Base Color — Agouti' },
        { id: 'rat-silver-fawn',   label: 'Silver Fawn',         code: 'A/A p/p',      group: 'Base Color — Agouti' },
        { id: 'rat-topaz',         label: 'Topaz',               code: 'A/A r/r',      group: 'Base Color — Agouti' },
        // C-locus & Color Modifier
        { id: 'rat-albino',        label: 'Albino',              code: 'c/c',          group: 'C-locus & Color Modifier' },
        { id: 'rat-himalayan',     label: 'Himalayan',           code: 'ch/c',         group: 'C-locus & Color Modifier' },
        { id: 'rat-siamese',       label: 'Siamese',             code: 'ch/ch',        group: 'C-locus & Color Modifier' },
        { id: 'rat-tonkinese',     label: 'Tonkinese',           code: 'ct/ct',        group: 'C-locus & Color Modifier' },
        { id: 'rat-marten',        label: 'Ivory Marten',        code: 'cm/c',         group: 'C-locus & Color Modifier' },
        { id: 'rat-burmese',       label: 'Burmese',             code: 'Bu/bu + ct',   group: 'C-locus & Color Modifier' },
        { id: 'rat-sable',         label: 'Sable',               code: 'Bu/Bu + ct',   group: 'C-locus & Color Modifier' },
        // Marking
        { id: 'rat-self',          label: 'Self',                code: 'H/H',          group: 'Marking' },
        { id: 'rat-berkshire',     label: 'Berkshire',           code: 'H/h',          group: 'Marking' },
        { id: 'rat-bareback',      label: 'Bareback',            code: 'H/hi',         group: 'Marking' },
        { id: 'rat-capped',        label: 'Capped',              code: 'Hre/h',        group: 'Marking' },
        { id: 'rat-variegated',    label: 'Variegated',          code: 'H/he',         group: 'Marking' },
        { id: 'rat-hooded',        label: 'Hooded',              code: 'h/h',          group: 'Marking' },
        { id: 'rat-dalmatian',     label: 'Dalmatian',           code: 'Dal/dal',      group: 'Marking' },
        { id: 'rat-roan',          label: 'Roan',                code: 'ro/ro',        group: 'Marking' },
        { id: 'rat-whiteside',     label: 'Whiteside',           code: 'wh/wh',        group: 'Marking' },
        { id: 'rat-white-spot',    label: 'White Spot',          code: 'Ws/w',         group: 'Marking' },
        { id: 'rat-marble',        label: 'Marble',              code: 'Ma/ma',        group: 'Marking' },
        // Coat & Texture
        { id: 'rat-rex',           label: 'Rex',                 code: 'Re/re',        group: 'Coat & Texture' },
        { id: 'rat-double-rex',    label: 'Double Rex',          code: 'Re/Re',        group: 'Coat & Texture' },
        { id: 'rat-velveteen',     label: 'Velveteen',           code: 'Ve/ve',        group: 'Coat & Texture' },
        { id: 'rat-bristle',       label: 'Bristle',             code: 'Br/br',        group: 'Coat & Texture' },
        // Ear Type
        { id: 'rat-dumbo',         label: 'Dumbo',               code: 'du/du',        group: 'Ear Type' },
    ],
};

const buildPrototypeGenotypeFromTraits = (selectedTraits, species = 'Fancy Mouse') => {
    const genotype = {};
    const assumptions = [];

    if (species === 'Fancy Rat') {
        selectedTraits.forEach((id) => {
            switch (id) {
                // Black series
                case 'rat-black':         genotype.A = 'a/a'; break;
                case 'rat-chocolate':     genotype.A = 'a/a'; genotype.B = 'b/b'; break;
                case 'rat-russian-blue':  genotype.A = 'a/a'; genotype.D = 'd/d'; break;
                case 'rat-american-blue': genotype.A = 'a/a'; genotype.G = 'g/g'; break;
                case 'rat-mink':          genotype.A = 'a/a'; genotype.M = 'm/m'; break;
                case 'rat-champagne':     genotype.A = 'a/a'; genotype.P = 'p/p'; break;
                case 'rat-beige':         genotype.A = 'a/a'; genotype.R = 'r/r'; break;
                // Agouti series
                case 'rat-agouti':        genotype.A = 'A/A'; break;
                case 'rat-choc-agouti':   genotype.A = 'A/A'; genotype.B = 'b/b'; break;
                case 'rat-rub-agouti':    genotype.A = 'A/A'; genotype.D = 'd/d'; break;
                case 'rat-opal':          genotype.A = 'A/A'; genotype.G = 'g/g'; break;
                case 'rat-cinnamon':      genotype.A = 'A/A'; genotype.M = 'm/m'; break;
                case 'rat-silver-fawn':   genotype.A = 'A/A'; genotype.P = 'p/p'; break;
                case 'rat-topaz':         genotype.A = 'A/A'; genotype.R = 'r/r'; break;
                // C-locus
                case 'rat-albino':        genotype.C = 'c/c'; break;
                case 'rat-himalayan':     genotype.C = 'ch/c'; break;
                case 'rat-siamese':       genotype.C = 'ch/ch'; break;
                case 'rat-tonkinese':     genotype.C = 'ct/ct'; break;
                case 'rat-marten':        genotype.C = 'cm/c'; break;
                case 'rat-burmese':       genotype.Bu = 'Bu/bu'; genotype.C = 'ct/ct'; break;
                case 'rat-sable':         genotype.Bu = 'Bu/Bu'; genotype.C = 'ct/ct'; break;
                // Marking — H locus
                case 'rat-self':          genotype.H = 'H/H'; break;
                case 'rat-berkshire':     genotype.H = 'H/h'; break;
                case 'rat-bareback':      genotype.H = 'H/hi'; break;
                case 'rat-capped':        genotype.H = 'Hre/h'; break;
                case 'rat-variegated':    genotype.H = 'H/he'; break;
                case 'rat-hooded':        genotype.H = 'h/h'; break;
                // Marking — other
                case 'rat-dalmatian':     genotype.Dal = 'Dal/dal'; break;
                case 'rat-roan':          genotype.Ro = 'ro/ro'; break;
                case 'rat-whiteside':     genotype.Wh = 'wh/wh'; break;
                case 'rat-white-spot':    genotype.Ws = 'Ws/w'; break;
                case 'rat-marble':        genotype.Ma = 'Ma/ma'; break;
                // Coat
                case 'rat-rex':           genotype.Re = 'Re/re'; break;
                case 'rat-double-rex':    genotype.Re = 'Re/Re'; break;
                case 'rat-velveteen':     genotype.Ve = 'Ve/ve'; break;
                case 'rat-bristle':       genotype.Br = 'Br/br'; break;
                // Ear
                case 'rat-dumbo':         genotype.Du = 'du/du'; break;
                default: break;
            }
        });
        return { genotype, assumptions };
    }

    selectedTraits.forEach((id) => {
        switch (id) {
            // Base Color — Black series
            case 'black':            genotype.A  = 'a/a';     break;
            case 'tan':              genotype.A  = 'at/a';    break;
            case 'chocolate':        genotype.A  = 'a/a';  genotype.B = 'b/b'; break;
            case 'blue':             genotype.A  = 'a/a';  genotype.D = 'd/d'; break;
            case 'dove':             genotype.A  = 'a/a';  genotype.P = 'p/p'; break;
            case 'lilac':            genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.D = 'd/d'; break;
            case 'champagne':        genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.P = 'p/p'; break;
            case 'silver':           genotype.A  = 'a/a';  genotype.D = 'd/d'; genotype.P = 'p/p'; break;
            case 'lavender':         genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.D = 'd/d'; genotype.P = 'p/p'; break;
            // Base Color — Agouti series
            case 'agouti':           genotype.A  = 'A/A';     break;
            case 'cinnamon':         genotype.A  = 'A/A';  genotype.B = 'b/b'; break;
            case 'blue-agouti':      genotype.A  = 'A/A';  genotype.D = 'd/d'; break;
            case 'argente':          genotype.A  = 'A/A';  genotype.P = 'p/p'; break;
            case 'cinnamon-argente': genotype.A  = 'A/A';  genotype.B = 'b/b'; genotype.P = 'p/p'; break;
            // Base Color — Other
            case 'dom-red':          genotype.A  = 'Ay/a';    break;
            case 'rec-red':          genotype.E  = 'e/e';     break;
            case 'Leaden':          genotype.Ln = 'ln/ln';   break;
            // Albino & Dilution — C locus
            case 'albino':           genotype.C  = 'c/c';     break;
            case 'himalayan':        genotype.C  = 'c/ch';    break;
            case 'bone':             genotype.C  = 'c/ce';    break;
            case 'siamese':          genotype.C  = 'ch/ch';   break;
            case 'burmese':          genotype.C  = 'ch/cch';  break;
            case 'stone':            genotype.C  = 'c/cch';   break;
            case 'beige':            genotype.C  = 'ce/ce';   break;
            case 'colorpoint-beige': genotype.C  = 'ch/ce';   break;
            case 'mock-choc':        genotype.C  = 'ce/cch';  break;
            case 'sepia':            genotype.A  = 'a/a'; genotype.C = 'cch/cch'; break;
            case 'silver-agouti':    genotype.A  = 'A/A'; genotype.C = 'cch/cch'; break;
            case 'fox':              genotype.A  = 'at/a';    break; // pair with a C chip for full fox expression
            // Pattern & Markings
            case 'am-brindle':       genotype.A  = 'Avy/a';   break;
            case 'xbrindle':         genotype.Mobr = 'Mobr/mobr'; break;
            case 'pied':             genotype.S  = 's/s';     break;
            case 'variegated':       genotype.W  = 'W/w';     break;
            case 'banded':           genotype.W  = 'Wsh/w';   break;
            case 'splashed':         genotype.Spl = 'Spl/spl'; break;
            case 'merle':            genotype.Rn = 'rn/rn';   break;
            case 'pearl':            genotype.Si = 'si/si';   break;
            case 'umbrous':          genotype.U  = 'U/u';     break;
            // Coat & Texture
            case 'shorthair':        genotype.Go = 'Go/Go';   break;
            case 'longhair':         genotype.Go = 'go/go';   break;
            case 'satin':            genotype.Sa = 'sa/sa';   break;
            case 'astrex':           genotype.Re = 'Re/re';   break;
            case 'texel':            genotype.Re = 'Re/re'; genotype.Go = 'go/go'; break;
            case 'rosette':          genotype.Rst = 'rst/rst'; break;
            case 'fuzz':             genotype.Fz = 'fz/fz';  break;
            case 'dom-hairless':     genotype.Nu = 'Nu/nu';   break;
            default: break;
        }
    });

    return { genotype, assumptions };
};

const findPotentialPairings = (allAnimals, target, mode, species) => {
  console.log(`Finding pairings for ${mode}:`, target);

  // Helper to parse a genetic code string like "Ee/aa Wsh/w"
  // into a map like { E: ['E', 'e'], A: ['a', 'a'], W: ['Wsh', 'w'] }
  const parseGeneticCode = (codeString) => {
    if (!codeString) return {};
    const loci = {};
    const parts = codeString.trim().split(/[ \t]+/);

    for (const part of parts) {
      let alleles;
      if (part.includes('/')) {
        alleles = part.split('/');
      } else if (part.length === 2 && part[0].toUpperCase() === part[1].toUpperCase()) {
        alleles = [part[0], part[1]];
      } else {
        continue;
      }

      if (alleles.length !== 2 || !alleles[0] || !alleles[1]) continue;

      // Heuristic for locus key: first letter of first allele, capitalized.
      const locusKey = alleles[0].replace(/[^a-zA-Z]/g, '')[0]?.toUpperCase();

      if (locusKey && !loci[locusKey]) {
        loci[locusKey] = alleles.sort();
      }
    }
    return loci;
  };

  let targetLoci;

  if (mode === 'genetics') {
    targetLoci = parseGeneticCode(target);
  } else if (mode === 'traits') {
    const selectedTraitIds = Object.values(target).filter(Boolean);
    const { genotype } = buildPrototypeGenotypeFromTraits(selectedTraitIds, species);
    targetLoci = genotype;
  } else {
    return Promise.resolve([]);
  }

  if (!targetLoci || Object.keys(targetLoci).length === 0) {
    return Promise.resolve([]);
  }

  const getAlleleProbability = (parentAlleles, desiredAllele) => {
    if (!parentAlleles) return 0;
    const count = parentAlleles.filter(a => a === desiredAllele).length;
    return count / 2;
  };

  const calculateLocusProbability = (sireAlleles, damAlleles, targetAlleles) => {
    const [t1, t2] = targetAlleles;
    const p_t1_sire = getAlleleProbability(sireAlleles, t1);
    const p_t2_sire = getAlleleProbability(sireAlleles, t2);
    const p_t1_dam = getAlleleProbability(damAlleles, t1);
    const p_t2_dam = getAlleleProbability(damAlleles, t2);

    if (t1 === t2) {
      return p_t1_sire * p_t1_dam;
    } else {
      const prob1 = p_t1_sire * p_t2_dam;
      const prob2 = p_t2_sire * p_t1_dam;
      return prob1 + prob2;
    }
  };

  const sires = allAnimals.filter(a => a.gender === 'Male' && a.geneticCode);
  const dams = allAnimals.filter(a => a.gender === 'Female' && a.geneticCode);
  const pairings = [];

  for (const sire of sires) {
    for (const dam of dams) {
      const sireLoci = parseGeneticCode(sire.geneticCode);
      const damLoci = parseGeneticCode(dam.geneticCode);
      let totalProbability = 1;
      let possible = true;
      for (const [locus, targetAlleles] of Object.entries(targetLoci)) {
        const locusProbability = calculateLocusProbability(sireLoci[locus], damLoci[locus], targetAlleles);
        if (locusProbability === 0) {
            possible = false;
            break;
        }
        totalProbability *= locusProbability;
      }
      if (possible && totalProbability > 0) {
        pairings.push({ sire, dam, probability: totalProbability });
      }
    }
  }

  pairings.sort((a, b) => b.probability - a.probability);
  return new Promise(resolve => setTimeout(() => resolve(pairings), 250));
};

const getFullName = (animal) => [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ');

const TraitSelector = ({ species, selectedTraits, onTraitChange, disabled }) => {
  const traitCategories = useMemo(() => {
    const chips = TARGET_OUTCOME_TRAIT_CHIPS[species] || [];
    if (chips.length === 0) {
      return [];
    }

    const categories = {};
    chips.forEach(chip => {
      if (!categories[chip.group]) {
        categories[chip.group] = [];
      }
      categories[chip.group].push({ id: chip.id, label: chip.label });
    });

    return Object.entries(categories).map(([label, options]) => ({
      label,
      options: options.sort((a, b) => a.label.localeCompare(b.label)),
    }));
  }, [species]);

  if (traitCategories.length === 0) {
    return <p className="text-sm text-gray-500 text-center">No visual traits configured for this species.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {traitCategories.map(category => (
        <div key={category.label}>
          <label htmlFor={`trait-${category.label}`} className="block text-sm font-medium text-gray-700 mb-1">
            {category.label}
          </label>
          <select
            id={`trait-${category.label}`}
            value={selectedTraits[category.label] || ''} // This will be the chip ID
            onChange={(e) => onTraitChange(category.label, e.target.value)}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Any</option>
            {category.options.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

/**
 * A dedicated page for the Target Outcome Calculator.
 */
const TargetOutcomePage = ({ myAnimals, authToken, API_BASE_URL, speciesOptions, speciesConfigs }) => {
  const [mode, setMode] = useState('traits'); // 'traits' or 'genetics'
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [targetGenetics, setTargetGenetics] = useState('');
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const availableSpecies = useMemo(() => {
    if (!myAnimals) return [];
    const speciesSet = new Set(myAnimals.map(a => a.species));
    return speciesOptions.filter(s => speciesSet.has(s.name));
  }, [myAnimals, speciesOptions]);

  useEffect(() => {
    if (availableSpecies.length === 1 && !selectedSpecies) {
      setSelectedSpecies(availableSpecies[0].name);
    }
  }, [availableSpecies, selectedSpecies]);

  useEffect(() => {
    setSelectedTraits([]);
    setResults(null);
  }, [selectedSpecies]);

  const handleFindPairings = async () => {
    const isTraitsMode = mode === 'traits';
    const hasTarget = isTraitsMode ? selectedTraits.some(v => v) : targetGenetics.trim();

    if (!hasTarget) {
      setError(isTraitsMode ? 'Please select at least one trait.' : 'Please enter the desired genetic code.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResults(null);
    try {
      const target = isTraitsMode ? selectedTraits.filter(Boolean) : targetGenetics;
      const animalsOfSpecies = myAnimals.filter(a => a.species === selectedSpecies);
      const potentialPairings = await findPotentialPairings(animalsOfSpecies, target, mode, selectedSpecies);
      setResults(potentialPairings);

    } catch (err) {
      console.error("Target Outcome Calculation Error:", err);
      setError(err.response?.data?.message || 'Failed to find pairings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <Target size={32} className="text-primary flex-shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Target Outcome Calculator</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Find potential pairings to produce a specific genetic outcome.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Species and Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <label htmlFor="species-select" className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <select
                id="species-select"
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                disabled={isLoading || availableSpecies.length <= 1}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="" disabled>Select a species</option>
                {availableSpecies.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 self-end">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculator Mode
              </label>
              <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-200">
                <button onClick={() => setMode('traits')} disabled={isLoading} className={`w-1/2 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${mode === 'traits' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}><Palette size={16} /> Visual Traits</button>
                <button onClick={() => setMode('genetics')} disabled={isLoading} className={`w-1/2 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition ${mode === 'genetics' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}><Settings size={16} /> Genetic Code</button>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50">
            {!selectedSpecies ? (
              <p className="text-center text-gray-500">Please select a species to begin.</p>
            ) : mode === 'traits' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Desired Traits</h3>
                <TraitSelector
                  species={selectedSpecies}
                  selectedTraits={selectedTraits}
                  onTraitsChange={setSelectedTraits}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="targetGenetics" className="block text-lg font-semibold text-gray-800 mb-4">
                  Enter Desired Genetic Code
                </label>
                <div className="relative">
                  <input
                    id="targetGenetics"
                    type="text"
                    placeholder="e.g., Ee/aa/Dd"
                    value={targetGenetics}
                    onChange={(e) => setTargetGenetics(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <Dna size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter the genetic combination you want to achieve in the offspring.</p>
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <button
              onClick={handleFindPairings}
              disabled={!selectedSpecies || isLoading}
              className="px-8 py-3 bg-primary text-black font-semibold rounded-lg shadow-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> Searching...</>
              ) : (
                <><Search size={20} /> Find Potential Pairings</>
              )}
            </button>
          </div>

          {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg text-center"><p>{error}</p></div>}

          {results && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Potential Pairings Found ({results.length})</h3>
              {results.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {results.map(({ sire, dam, probability }) => (
                    <div key={sire.id_public + dam.id_public} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p><span className="font-semibold text-blue-700">Sire:</span> {getFullName(sire)} ({sire.id_public})</p>
                          <p><span className="font-semibold text-pink-700">Dam:</span> {getFullName(dam)} ({dam.id_public})</p>
                        </div>
                        <div className="text-center ml-4 flex-shrink-0">
                          <p className="text-2xl font-bold text-primary">{(probability * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Chance</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-center text-gray-600">No potential pairings found in your animals that can produce the target genetics.</p>)}
            </div>
          )}

          {!results && !isLoading && (
             <div className="text-center text-gray-400 mt-8">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select your target criteria above to begin.</p>
                <p className="text-sm mt-2">The calculator will search your animals for pairs that could produce the desired outcome.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TraitChipSelector = ({ species, selectedTraits, onToggle, disabled }) => {
  const traitGroups = useMemo(() => {
      const chips = TARGET_OUTCOME_TRAIT_CHIPS[species] || [];
      if (chips.length === 0) return [];
      const groups = {};
      chips.forEach(chip => {
          if (!groups[chip.group]) groups[chip.group] = [];
          groups[chip.group].push(chip);
      });
      return Object.entries(groups).map(([label, chips]) => ({ label, chips: chips.sort((a, b) => a.label.localeCompare(b.label)) }));
  }, [species]);

  if (traitGroups.length === 0) {
      return <p className="text-sm text-gray-500 text-center">No visual traits configured for this species.</p>;
  }

  return (
      <div className="space-y-4">
          {traitGroups.map(group => (
              <div key={group.label}>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">{group.label}</h4>
                  <div className="flex flex-wrap gap-2">
                      {group.chips.map(chip => {
                          const isActive = selectedTraits.includes(chip.id);
                          return (
                              <button key={chip.id} type="button" onClick={() => onToggle(chip.id)} disabled={disabled} className={`px-3 py-1.5 text-xs rounded-full border transition ${ isActive ? 'bg-primary/80 border-primary text-black font-semibold' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' }`} title={chip.code}>
                                  {chip.label}
                              </button>
                          );
                      })}
                  </div>
              </div>
          ))}
      </div>
  );
};

export default TargetOutcomePage;