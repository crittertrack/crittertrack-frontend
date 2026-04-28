import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    Baby, Bean, Bell, Bird, BookOpen, Bug, Calculator, Calendar, Camera, Cat,
    CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardList,
    Circle, Dna, Download, Edit, Eye, EyeOff, Fish, Hash, Heart, HeartOff, Hourglass,
    Images, Link, Loader2, Mars, Milk, PawPrint, Plus, RefreshCw, Search, Star,
    Trash2, Turtle, Unlink, Venus, VenusAndMars, Worm, X
} from 'lucide-react';
import { formatDate, formatDateShort } from '../../utils/dateFormatter';
import DatePicker from '../DatePicker';
import { calculatePhenotype } from '../GeneticsCalculator';

const AnimalImage = ({ src, alt = 'Animal', className = 'w-full h-full object-cover', iconSize = 24 }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);
    React.useEffect(() => { setImageSrc(src); setImageError(false); }, [src]);
    if (!imageSrc || imageError) return <Cat size={iconSize} className="text-gray-400" />;
    return <img src={imageSrc} alt={alt} className={className} onError={() => setImageError(true)} loading="lazy" />;
};

const DEFAULT_SPECIES_OPTIONS = ['Fancy Mouse', 'Fancy Rat', 'Russian Dwarf Hamster', 'Campbells Dwarf Hamster', 'Chinese Dwarf Hamster', 'Syrian Hamster', 'Guinea Pig'];
const TARGET_OUTCOME_PROTOTYPE_SPECIES = 'Fancy Mouse';
const TARGET_OUTCOME_PENDING_SPECIES = DEFAULT_SPECIES_OPTIONS.filter(species => species !== TARGET_OUTCOME_PROTOTYPE_SPECIES);

const TARGET_OUTCOME_TRAIT_CHIPS = {
    'Fancy Mouse': [
        // Base Color — Black series
        { id: 'black',              label: 'Black',             code: 'a/a',            group: 'Base Color — Black' },
        { id: 'tan',                label: 'Tan',               code: 'at/at',          group: 'Base Color — Black' },
        { id: 'chocolate',          label: 'Chocolate',         code: 'b/b',            group: 'Base Color — Black' },
        { id: 'blue',               label: 'Blue',              code: 'd/d',            group: 'Base Color — Black' },
        { id: 'dove',               label: 'Dove',              code: 'b/b d/d',        group: 'Base Color — Black' },
        { id: 'lilac',              label: 'Lilac',             code: 'b/b p/p',        group: 'Base Color — Black' },
        { id: 'champagne',          label: 'Champagne',         code: 'p/p',            group: 'Base Color — Black' },
        { id: 'silver-black',       label: 'Silver',            code: 'si/si',          group: 'Base Color — Black' },
        { id: 'lavender',           label: 'Lavender',          code: 'd/d p/p',        group: 'Base Color — Black' },
        // Base Color — Agouti series
        { id: 'agouti',             label: 'Agouti',            code: 'A/-',            group: 'Base Color — Agouti' },
        { id: 'cinnamon',           label: 'Cinnamon',          code: 'A/- b/b',        group: 'Base Color — Agouti' },
        { id: 'blue-agouti',        label: 'Blue Agouti',       code: 'A/- d/d',        group: 'Base Color — Agouti' },
        { id: 'argente',            label: 'Argente',           code: 'A/- p/p',        group: 'Base Color — Agouti' },
        { id: 'cinnamon-argente',   label: 'Cinnamon Argente',  code: 'A/- b/b p/p',   group: 'Base Color — Agouti' },
        // Base Color — Other
        { id: 'dom-red',            label: 'Dominant Red',      code: 'Ay/-',           group: 'Base Color — Other' },
        { id: 'dom-fawn',           label: 'Dominant Fawn',     code: 'Ay/- d/d',       group: 'Base Color — Other' },
        { id: 'dom-amber',          label: 'Dominant Amber',    code: 'Ay/- b/b',       group: 'Base Color — Other' },
        { id: 'rec-red',            label: 'Recessive Red',     code: 'e/e',            group: 'Base Color — Other' },
        { id: 'rec-fawn',           label: 'Recessive Fawn',    code: 'e/e d/d',        group: 'Base Color — Other' },
        { id: 'rec-amber',          label: 'Recessive Amber',   code: 'e/e b/b',        group: 'Base Color — Other' },
        // Albino & Dilution
        { id: 'albino',             label: 'Albino',            code: 'c/c',            group: 'Albino & Dilution' },
        { id: 'himalayan',          label: 'Himalayan',         code: 'c/ch',           group: 'Albino & Dilution' },
        { id: 'bone',               label: 'Bone',              code: 'c/cch',          group: 'Albino & Dilution' },
        { id: 'siamese',            label: 'Siamese',           code: 'ch/ch',          group: 'Albino & Dilution' },
        { id: 'burmese',            label: 'Burmese',           code: 'ch/cch',         group: 'Albino & Dilution' },
        { id: 'stone',              label: 'Stone',             code: 'ce/ce',          group: 'Albino & Dilution' },
        { id: 'beige',              label: 'Beige',             code: 'c/ce',           group: 'Albino & Dilution' },
        { id: 'colorpoint-beige',   label: 'Colorpoint Beige',  code: 'cch/cch',        group: 'Albino & Dilution' },
        { id: 'mock-choc',          label: 'Mock Chocolate',    code: 'ce/ch',          group: 'Albino & Dilution' },
        { id: 'sepia',              label: 'Sepia',             code: 'ce/cch',         group: 'Albino & Dilution' },
        { id: 'silver-agouti',      label: 'Silver Agouti',     code: 'A/- cch/cch',    group: 'Albino & Dilution' },
        // Pattern & Markings
        { id: 'am-brindle',         label: 'Am. Brindle',       code: 'Avy/-',          group: 'Pattern & Markings' },
        { id: 'xbrindle',           label: 'Xbrindle',          code: 'Mobr/mobr',      group: 'Pattern & Markings' },
        { id: 'pied',               label: 'Pied',              code: 's/s',            group: 'Pattern & Markings' },
        { id: 'variegated',         label: 'Variegated',        code: 'W/w',            group: 'Pattern & Markings' },
        { id: 'banded',             label: 'Banded',            code: 'Wsh/w',          group: 'Pattern & Markings' },
        { id: 'splashed',           label: 'Splashed',          code: 'Spl/spl',        group: 'Pattern & Markings' },
        { id: 'merle',              label: 'Merle',             code: 'rn/rn',          group: 'Pattern & Markings' },
        { id: 'pearl',              label: 'Pearl',             code: 'si/si',          group: 'Pattern & Markings' },
        // Coat & Texture
        { id: 'shorthair',          label: 'Shorthair',         code: 'Go/-',           group: 'Coat & Texture' },
        { id: 'longhair',           label: 'Longhair',          code: 'go/go',          group: 'Coat & Texture' },
        { id: 'satin',              label: 'Satin',             code: 'sa/sa',          group: 'Coat & Texture' },
        { id: 'astrex',             label: 'Astrex',            code: 'Re/-',           group: 'Coat & Texture' },
        { id: 'texel',              label: 'Texel',             code: 'Re/- go/go',     group: 'Coat & Texture' },
        { id: 'rosette',            label: 'Rosette',           code: 'rst/rst',        group: 'Coat & Texture' },
        { id: 'fuzz',               label: 'Fuzz',              code: 'fz/fz',          group: 'Coat & Texture' },
        { id: 'dom-hairless',       label: 'Dominant Hairless', code: 'Nu/-',           group: 'Coat & Texture' },
    ],
};

const getTargetTraitChipCatalog = () => TARGET_OUTCOME_TRAIT_CHIPS[TARGET_OUTCOME_PROTOTYPE_SPECIES];

const getTargetTraitChipGroups = () => {
    const chips = getTargetTraitChipCatalog();
    const order = [];
    const map = {};
    chips.forEach(chip => {
        if (!map[chip.group]) { map[chip.group] = []; order.push(chip.group); }
        map[chip.group].push(chip);
    });
    return order.map(g => ({ group: g, chips: map[g] }));
};

const getTargetTraitChipById = (chipId) => getTargetTraitChipCatalog().find(c => c.id === chipId);

const formatTargetTraitChip = (chip) => {
    if (!chip) return '';
    return `${chip.label} (${chip.code})`;
};

const buildPrototypeGenotypeFromTraits = (selectedTraits) => {
    const genotype = {};
    const assumptions = [];

    selectedTraits.forEach((id) => {
        switch (id) {
            // Base Color — Black series
            case 'black':            genotype.A  = 'a/a';     break;
            case 'tan':              genotype.A  = 'at/at';   break;
            case 'chocolate':        genotype.A  = 'a/a';  genotype.B = 'b/b'; break;
            case 'blue':             genotype.A  = 'a/a';  genotype.D = 'd/d'; break;
            case 'dove':             genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.D = 'd/d'; break;
            case 'lilac':            genotype.A  = 'a/a';  genotype.B = 'b/b'; genotype.P = 'p/p'; break;
            case 'champagne':        genotype.A  = 'a/a';  genotype.P = 'p/p'; break;
            case 'silver-black':     genotype.A  = 'a/a';  genotype.Si = 'si/si'; break;
            case 'lavender':         genotype.A  = 'a/a';  genotype.D = 'd/d'; genotype.P = 'p/p'; break;
            // Base Color — Agouti series
            case 'agouti':           genotype.A  = 'A/A';     break;
            case 'cinnamon':         genotype.A  = 'A/A';  genotype.B = 'b/b'; break;
            case 'blue-agouti':      genotype.A  = 'A/A';  genotype.D = 'd/d'; break;
            case 'argente':          genotype.A  = 'A/A';  genotype.P = 'p/p'; break;
            case 'cinnamon-argente': genotype.A  = 'A/A';  genotype.B = 'b/b'; genotype.P = 'p/p'; break;
            // Base Color — Other
            case 'dom-red':          genotype.A  = 'Ay/a';    break;
            case 'dom-fawn':         genotype.A  = 'Ay/a';  genotype.D = 'd/d'; break;
            case 'dom-amber':        genotype.A  = 'Ay/a';  genotype.B = 'b/b'; break;
            case 'rec-red':          genotype.E  = 'e/e';     break;
            case 'rec-fawn':         genotype.E  = 'e/e';  genotype.D = 'd/d'; break;
            case 'rec-amber':        genotype.E  = 'e/e';  genotype.B = 'b/b'; break;
            // Albino & Dilution — C locus
            case 'albino':           genotype.C  = 'c/c';     break;
            case 'himalayan':        genotype.C  = 'c/ch';    break;
            case 'bone':             genotype.C  = 'c/cch';   break;
            case 'siamese':          genotype.C  = 'ch/ch';   break;
            case 'burmese':          genotype.C  = 'ch/cch';  break;
            case 'stone':            genotype.C  = 'ce/ce';   break;
            case 'beige':            genotype.C  = 'c/ce';    break;
            case 'colorpoint-beige': genotype.C  = 'cch/cch'; break;
            case 'mock-choc':        genotype.C  = 'ce/ch';   break;
            case 'sepia':            genotype.C  = 'ce/cch';  break;
            case 'silver-agouti':    genotype.A  = 'A/A'; genotype.C = 'cch/cch'; break;
            // Pattern & Markings
            case 'am-brindle':       genotype.A  = 'Avy/a';   break;
            case 'xbrindle':         genotype.Mobr = 'Mobr/mobr'; break;
            case 'pied':             genotype.S  = 's/s';     break;
            case 'variegated':       genotype.W  = 'W/w';     break;
            case 'banded':           genotype.W  = 'Wsh/w';   break;
            case 'splashed':         genotype.Spl = 'Spl/spl'; break;
            case 'merle':            genotype.Rn = 'rn/rn';   break;
            case 'pearl':            genotype.Si = 'si/si';   break;
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

    // If a C-locus chip is selected without an A-locus chip, assume black base
    const cLociChips = ['albino','himalayan','bone','siamese','burmese','stone','beige','colorpoint-beige','mock-choc','sepia'];
    if (selectedTraits.some(id => cLociChips.includes(id)) && !genotype.A) {
        genotype.A = 'a/a';
        assumptions.push('C-locus phenotype assumed on black base (a/a) — add a Base Color chip to override.');
    }

    return { genotype, assumptions };
};

const getPrototypePhenotypeInterpretation = (selectedTraits) => {
    const { genotype, assumptions } = buildPrototypeGenotypeFromTraits(selectedTraits);
    if (!Object.keys(genotype).length) return null;

    const result = calculatePhenotype(genotype, genotype);
    if (result?.phenotype && result.phenotype !== 'Standard') {
        const extras = [];
        if (result.carriers?.length) extras.push(`carriers: ${result.carriers.join(', ')}`);
        if (assumptions.length) extras.push(`assumptions: ${assumptions.join(' ')}`);
        return `Phenotype preview (Genetics Builder logic): ${result.phenotype}${extras.length ? ` (${extras.join(' | ')})` : ''}`;
    }
    if (assumptions.length) {
        return `Phenotype preview pending more loci (${assumptions.join(' ')})`;
    }
    return 'Phenotype preview pending more loci to resolve a named outcome.';
};

const getPrototypePhenotypeConfidence = (selectedTraits) => {
    const { genotype, assumptions } = buildPrototypeGenotypeFromTraits(selectedTraits);
    const lociSelected = Object.keys(genotype).length;
    const result = lociSelected ? calculatePhenotype(genotype, genotype) : null;
    const hasResolvedPhenotype = Boolean(result?.phenotype && result.phenotype !== 'Standard');
    const phenotypeLabel = hasResolvedPhenotype ? result.phenotype : 'unresolved';
    const assumptionCount = assumptions.length;

    if (hasResolvedPhenotype && lociSelected >= 3 && assumptions.length === 0) {
        return {
            level: 'high',
            label: 'High Confidence',
            className: 'bg-emerald-100 text-emerald-800',
            detail: `Rule match: resolved phenotype "${phenotypeLabel}" with ${lociSelected} loci and 0 assumptions.`
        };
    }

    if (hasResolvedPhenotype || lociSelected >= 2) {
        const mediumReason = hasResolvedPhenotype
            ? `Rule match: resolved phenotype "${phenotypeLabel}" with ${lociSelected} loci and ${assumptionCount} assumption${assumptionCount === 1 ? '' : 's'}.`
            : `Rule match: phenotype unresolved with ${lociSelected} loci and ${assumptionCount} assumption${assumptionCount === 1 ? '' : 's'}.`;
        return {
            level: 'medium',
            label: 'Medium Confidence',
            className: 'bg-amber-100 text-amber-800',
            detail: mediumReason
        };
    }

    return {
        level: 'low',
        label: 'Needs More Loci',
        className: 'bg-gray-100 text-gray-700',
        detail: `Rule match: only ${lociSelected} locus selected and phenotype unresolved.`
    };
};

const getMinimumParentCarrierRequirements = (selectedTraits) => {
    const { genotype } = buildPrototypeGenotypeFromTraits(selectedTraits);
    if (!Object.keys(genotype).length) return { bothParents: [], oneParent: [] };

    const bothParents = [];
    const oneParent = [];

    const dominantSymbol = {
        B: 'B', C: 'C', D: 'D', E: 'E', P: 'P',
        S: 'S', Rn: 'Rn', Si: 'Si', Sa: 'Sa', Rst: 'Rst',
        Go: 'Go', Fz: 'Fz',
    };

    // Heterozygous dominant targets — only one parent needs the dominant allele
    const domHetTargets = {
        W:    { 'W/w': 'W (variegated)', 'Wsh/w': 'Wsh (banded)' },
        Spl:  { 'Spl/spl': 'Spl (splashed)' },
        Mobr: { 'Mobr/mobr': 'Mobr (xbrindle)' },
        Re:   { 'Re/re': 'Re (astrex/texel)' },
        Nu:   { 'Nu/nu': 'Nu (dom. hairless)' },
    };

    for (const [locus, value] of Object.entries(genotype)) {
        if (!value || !value.includes('/')) continue;
        const [a1, a2] = value.split('/');

        // Explicitly dominant-het targets
        if (domHetTargets[locus]?.[value]) {
            oneParent.push({ label: domHetTargets[locus][value] });
            continue;
        }
        // A-locus: dominant-het (Dom Red, Am. Brindle) — one parent only
        if (locus === 'A' && (value === 'Ay/a' || value === 'Avy/a')) {
            oneParent.push({ label: `${a1} (${value === 'Ay/a' ? 'dom. red/fawn/amber' : 'am. brindle'})` });
            continue;
        }
        // A-locus a/a — both parents need at least one 'a', but any other allele can pair with it
        if (locus === 'A' && value === 'a/a') {
            bothParents.push({ label: '−/a at A', hint: 'any of: a/a, at/a, Ay/a, Avy/a' });
            continue;
        }
        // A-locus at/at
        if (locus === 'A' && value === 'at/at') {
            bothParents.push({ label: '−/at at A', hint: 'at/at or at/a' });
            continue;
        }
        // A-locus A/A — both parents need at least one dominant A
        if (locus === 'A' && value === 'A/A') {
            bothParents.push({ label: 'A/− at A', hint: 'at least one A allele (e.g. A/A, A/a, A/at)' });
            continue;
        }
        // Homozygous recessive: both alleles equal and lowercase
        if (a1 === a2 && a1 === a1.toLowerCase()) {
            const dom = dominantSymbol[locus] || (locus.charAt(0).toUpperCase() + locus.slice(1));
            bothParents.push({ label: `${dom}/${a1}` });
            continue;
        }
        // Compound heterozygous (e.g. c/ch, ce/cch): both alleles recessive but different
        if (a1 !== a2 && a1 === a1.toLowerCase() && a2 === a2.toLowerCase()) {
            bothParents.push({ label: `${a1} + ${a2} at ${locus}` });
        }
    }

    return { bothParents, oneParent };
};

const getSpeciesDisplayName = (species) => {
    const displayNames = {
        'Fancy Mouse': 'Fancy Mice', 'Mouse': 'Fancy Mice',
        'Fancy Rat': 'Fancy Rats', 'Rat': 'Fancy Rats',
        'Russian Dwarf Hamster': 'Russian Dwarf Hamsters',
        'Campbells Dwarf Hamster': 'Campbells Dwarf Hamsters',
        'Chinese Dwarf Hamster': 'Chinese Dwarf Hamsters',
        'Syrian Hamster': 'Syrian Hamsters', 'Hamster': 'Hamsters',
        'Guinea Pig': 'Guinea Pigs'
    };
    return displayNames[species] || species;
};

const litterAge = (birthDate) => {
    if (!birthDate) return null;
    const born = new Date(birthDate);
    const now = new Date();
    if (isNaN(born.getTime()) || born > now) return null;
    let years = now.getFullYear() - born.getFullYear();
    let months = now.getMonth() - born.getMonth();
    let days = now.getDate() - born.getDate();
    if (days < 0) { months--; const pm = new Date(now.getFullYear(), now.getMonth(), 0); days += pm.getDate(); }
    if (months < 0) { years--; months += 12; }
    if (years > 0) return years + 'y ' + months + 'm ' + days + 'd';
    if (months > 0) return months + 'm ' + days + 'd';
    return days + 'd';
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

const getSpeciesLatinName = (species) => {
    const latinNames = {
        'Fancy Mouse': 'Mus musculus',
        'Mouse': 'Mus musculus',
        'Fancy Rat': 'Rattus norvegicus',
        'Rat': 'Rattus norvegicus',
        'Russian Dwarf Hamster': 'Phodopus sungorus',
        'Campbells Dwarf Hamster': 'Phodopus campbelli',
        'Chinese Dwarf Hamster': 'Cricetulus barabensis',
        'Syrian Hamster': 'Mesocricetus auratus',
        'Guinea Pig': 'Cavia porcellus'
    };
    return latinNames[species] || null;
};

// Helper function to get flag class from country code (for flag-icons library)

async function compressImageFile(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) ? the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    const img = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        image.src = url;
    });

    const origWidth = img.width;
    const origHeight = img.height;
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    // Calculate target size preserving aspect ratio
    if (origWidth > maxWidth || origHeight > maxHeight) {
        const widthRatio = maxWidth / origWidth;
        const heightRatio = maxHeight / origHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        targetWidth = Math.round(origWidth * ratio);
        targetHeight = Math.round(origHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    // Fill background white for JPEG to avoid black background on transparent PNGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Always output JPEG for better compatibility (especially with mobile browsers)
    const outputType = 'image/jpeg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    return blob || file;
}

// Compress an image File to be under `maxBytes` if possible.
// Tries decreasing quality first, then scales down dimensions and retries.
// Returns a Blob (best-effort). Throws if input isn't an image.
async function compressImageToMaxSize(file, maxBytes = 200 * 1024, opts = {}) {
    if (!file || !file.type || !file.type.startsWith('image/')) throw new Error('Not an image file');
    // Reject GIFs (animations not allowed) ? the server accepts PNG/JPEG only
    if (file.type === 'image/gif') throw new Error('GIF_NOT_ALLOWED');

    // Start with original dimensions limits from opts or defaults
    let { maxWidth = 1200, maxHeight = 1200, startQuality = 0.85, minQuality = 0.35, qualityStep = 0.05, minDimension = 200 } = opts;

    // Load original image to get dimensions
    const image = await new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(new Error('Failed to load image for compression')); };
        img.src = url;
    });

    let targetW = Math.min(image.width, maxWidth);
    let targetH = Math.min(image.height, maxHeight);

    // Helper to run compression with given dims and quality
    const tryCompress = async (w, h, quality) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
        return blob;
    };

    // First pass: try with decreasing quality at initial dimensions
    let quality = startQuality;
    while (quality >= minQuality) {
        const blob = await tryCompress(targetW, targetH, quality);
        if (!blob) break;
        if (blob.size <= maxBytes) {
            return blob;
        }
        quality -= qualityStep;
    }

    // Second pass: gradually reduce dimensions while preserving aspect ratio
    const aspectRatio = image.width / image.height;
    while (Math.max(targetW, targetH) > minDimension) {
        // Reduce dimensions proportionally to maintain aspect ratio
        const scale = 0.8;
        targetW = Math.round(targetW * scale);
        targetH = Math.round(targetH * scale);
        
        // Ensure neither dimension goes below minDimension while preserving aspect ratio
        if (Math.max(targetW, targetH) < minDimension) {
            if (aspectRatio >= 1) {
                targetW = minDimension;
                targetH = Math.round(minDimension / aspectRatio);
            } else {
                targetH = minDimension;
                targetW = Math.round(minDimension * aspectRatio);
            }
        }
        
        quality = startQuality;
        while (quality >= minQuality) {
            const blob = await tryCompress(targetW, targetH, quality);
            if (!blob) break;
            if (blob.size <= maxBytes) {
                return blob;
            }
            quality -= qualityStep;
        }
    }

    // As a last resort, return the smallest we could create (use minQuality and minimum dimensions while preserving aspect ratio)
    const finalW = aspectRatio >= 1 ? minDimension : Math.round(minDimension * aspectRatio);
    const finalH = aspectRatio <= 1 ? minDimension : Math.round(minDimension / aspectRatio);
    const finalBlob = await tryCompress(finalW, finalH, minQuality);
    return finalBlob || file;
}

// Attempt to compress an image in a Web Worker (public/imageWorker.js).
// Returns a Blob on success, or null if worker not available or reports an error.
const compressImageWithWorker = (file, maxBytes = 200 * 1024, opts = {}) => {
    return new Promise((resolve, reject) => {
        // Try to create a worker pointing to the public folder path
        let worker;
        try {
            worker = new Worker('/imageWorker.js');
        } catch (e) {
            resolve(null); // Worker couldn't be created (e.g., bundler/public path issue)
            return;
        }

        const id = Math.random().toString(36).slice(2);

        const onMessage = (ev) => {
            if (!ev.data || ev.data.id !== id) return;
            if (ev.data.error) {
                worker.removeEventListener('message', onMessage);
                worker.terminate();
                resolve(null);
                return;
            }
            // Received blob
            const blob = ev.data.blob;
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(blob);
        };

        worker.addEventListener('message', onMessage);

        // Post file (structured clone) to worker
        try {
            worker.postMessage({ id, file, maxBytes, opts });
        } catch (e) {
            worker.removeEventListener('message', onMessage);
            worker.terminate();
            resolve(null);
        }
    });
};


const SpeciesPickerModal = ({ speciesOptions, onSelect, onClose, X, Search }) => {
    const categories = ['All', 'Mammal', 'Reptile', 'Bird', 'Amphibian', 'Fish', 'Invertebrate', 'Other'];
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('speciesFavorites') || '[]'); } catch { return []; }
    });

    const toggleFavorite = (e, name) => {
        e.stopPropagation();
        setFavorites(prev => {
            const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
            localStorage.setItem('speciesFavorites', JSON.stringify(next));
            // Dispatch custom event for backend sync
            window.dispatchEvent(new CustomEvent('speciesFavoritesChanged', { detail: next }));
            return next;
        });
    };

    const filtered = speciesOptions
        .filter(s => {
            const matchesCat = cat === 'All' || s.category === cat;
            const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.latinName && s.latinName.toLowerCase().includes(search.toLowerCase()));
            return matchesCat && matchesSearch;
        })
        .sort((a, b) => {
            const aFav = favorites.includes(a.name);
            const bFav = favorites.includes(b.name);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return a.name.localeCompare(b.name);
        });

    const favCount = filtered.filter(s => favorites.includes(s.name)).length;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800">Select Species</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
                </div>

                {/* Search + Category */}
                <div className="p-4 border-b flex-shrink-0 space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or latin name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCat(c)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                                    cat === c ? 'bg-primary text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Species grid */}
                <div className="flex-grow overflow-y-auto p-4">
                    {favCount > 0 && !search && (
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Star size={11} className="fill-current" /> Favourites
                        </p>
                    )}
                    {filtered.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No species found.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {filtered.map((s, idx) => {
                                const isFav = favorites.includes(s.name);
                                const prevFav = idx > 0 && favorites.includes(filtered[idx - 1].name);
                                const showDivider = !search && !isFav && prevFav;
                                return (
                                    <React.Fragment key={s._id || s.name}>
                                        {showDivider && (
                                            <div className="col-span-full border-t border-gray-200 my-1" />
                                        )}
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => onSelect(s.name)}
                                                className={`w-full h-20 flex flex-col items-start justify-center p-2 border-2 rounded-lg text-left transition hover:shadow-md relative ${
                                                    isFav
                                                        ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                                                        : s.isDefault
                                                        ? 'border-primary bg-primary/10 hover:bg-primary/20'
                                                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="font-medium text-sm text-gray-800 leading-tight pr-5 line-clamp-1">
                                                    {s.name}
                                                </span>
                                                {s.latinName && (
                                                    <span className="text-xs italic text-gray-500 mt-0.5 leading-tight line-clamp-1">{s.latinName}</span>
                                                )}
                                                {s.category && (
                                                    <span className="absolute bottom-1 left-2 text-gray-400">
                                                        {s.category === 'Mammal' && <Cat size={12} />}
                                                        {s.category === 'Reptile' && <Turtle size={12} />}
                                                        {s.category === 'Bird' && <Bird size={12} />}
                                                        {s.category === 'Amphibian' && <Worm size={12} />}
                                                        {s.category === 'Fish' && <Fish size={12} />}
                                                        {s.category === 'Invertebrate' && <Bug size={12} />}
                                                        {s.category === 'Other' && <PawPrint size={12} />}
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={e => toggleFavorite(e, s.name)}
                                                title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                                                className={`absolute top-2 right-2 transition ${isFav ? 'text-amber-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'}`}
                                            >
                                                <Star size={13} className={isFav ? 'fill-current' : ''} />
                                            </button>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-3 flex-shrink-0 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{filtered.length} species{favCount > 0 ? ` · ${favCount} favourited` : ''}</span>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};




const ParentSearchModal = ({ 
    title, 
    currentId, 
    onSelect, 
    onClose, 
    authToken, 
    showModalMessage, 
    API_BASE_URL, 
    X, 
    Search, 
    Loader2, 
    LoadingSpinner,
    requiredGender, // Filter: e.g., 'Male' or 'Female'
    birthDate,      // Filter: Date of the animal being bred
    species         // Filter: Species of the animal being bred
}) => {
    const [searchTerm, setSearchTerm] = useState('');
        const [hasSearched, setHasSearched] = useState(false);
    const [localAnimals, setLocalAnimals] = useState([]);
    const [globalAnimals, setGlobalAnimals] = useState([]);
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [scope, setScope] = useState('both'); // 'local' | 'global' | 'both'
    
    // Simple component to render a list item
    const SearchResultItem = ({ animal, isGlobal }) => {
        const imgSrc = animal.imageUrl || animal.photoUrl || null;
        
        return (
            <div 
                className="flex items-center space-x-3 p-3 border-b hover:bg-gray-50 cursor-pointer" 
                onClick={() => onSelect(animal)}
            >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <AnimalImage src={imgSrc} alt={animal.name} className="w-full h-full object-cover" iconSize={24} />
                </div>
                
                {/* Info */}
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{animal.id_public}</p>
                    <p className="text-sm text-gray-600">
                        {animal.species} &bull; {animal.gender} &bull; {animal.status || 'Unknown'}
                    </p>
                    {getSpeciesLatinName(animal.species) && (
                        <p className="text-xs italic text-gray-500">{getSpeciesLatinName(animal.species)}</p>
                    )}
                </div>
                
                {/* Badge */}
                {isGlobal && <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>}
            </div>
        );
    };

        const handleSearch = async () => {
            setHasSearched(true);
        const trimmedSearchTerm = searchTerm.trim();

        if (!trimmedSearchTerm || trimmedSearchTerm.length < 1) {
            setLocalAnimals([]);
            setGlobalAnimals([]);
            showModalMessage('Search Info', 'Please enter a name or ID to search.');
            return;
        }

        // Detect ID searches (CTC1234, CT1234, or 1234)
        const idMatch = trimmedSearchTerm.match(/^\s*(?:CTC?[- ]?)?(\d+)\s*$/i);
        const isIdSearch = !!idMatch;
        // Send full CTC format (CTC1234) instead of just numeric portion (1234)
        const idValue = isIdSearch ? `CTC${idMatch[1]}` : null;

        // --- CONSTRUCT FILTER QUERIES ---
        const genderQuery = requiredGender 
            ? (Array.isArray(requiredGender) 
                ? `&gender=${requiredGender.map(g => encodeURIComponent(g)).join('&gender=')}`
                : `&gender=${requiredGender}`)
            : '';
        const birthdateQuery = birthDate ? `&birthdateBefore=${birthDate}` : '';
        const speciesQuery = species ? `&species=${encodeURIComponent(species)}` : '';

        // Prepare promises depending on scope
        setLoadingLocal(scope === 'local' || scope === 'both');
        setLoadingGlobal(scope === 'global' || scope === 'both');

        // Local search
        if (scope === 'local' || scope === 'both') {
            try {
                const localUrl = isIdSearch
                    ? `${API_BASE_URL}/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;

                const localResponse = await axios.get(localUrl, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Filter out current animal and females deceased before offspring birth date
                const filteredLocal = localResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // Only check deceased date for females (dams must be alive at offspring birth)
                    // Males (sires) can be deceased as long as they mated before death
                    if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Dam died before offspring born
                    }
                    return true;
                });
                setLocalAnimals(filteredLocal);
            } catch (error) {
                console.error('Local Search Error:', error);
                showModalMessage('Search Error', 'Failed to search your animals.');
                setLocalAnimals([]);
            } finally {
                setLoadingLocal(false);
            }
        } else {
            setLocalAnimals([]);
            setLoadingLocal(false);
        }

        // Global search
        if (scope === 'global' || scope === 'both') {
            try {
                const globalUrl = isIdSearch
                    ? `${API_BASE_URL}/public/global/animals?id_public=${encodeURIComponent(idValue)}`
                    : `${API_BASE_URL}/public/global/animals?name=${encodeURIComponent(trimmedSearchTerm)}${genderQuery}${birthdateQuery}${speciesQuery}`;

                const globalResponse = await axios.get(globalUrl);
                // Filter out current animal and females deceased before offspring birth date
                const filteredGlobal = globalResponse.data.filter(a => {
                    if (a.id_public === currentId) return false;
                    // Only check deceased date for females (dams must be alive at offspring birth)
                    // Males (sires) can be deceased as long as they mated before death
                    if (birthDate && a.deceasedDate && (a.gender === 'Female' || a.gender === 'Intersex')) {
                        const offspringBirth = new Date(birthDate);
                        const parentDeceased = new Date(a.deceasedDate);
                        if (parentDeceased < offspringBirth) return false; // Dam died before offspring born
                    }
                    return true;
                });
                setGlobalAnimals(filteredGlobal);
            } catch (error) {
                console.error('Global Search Error:', error);
                setGlobalAnimals([]);
            } finally {
                setLoadingGlobal(false);
            }
        } else {
            setGlobalAnimals([]);
            setLoadingGlobal(false);
        }
    };

        return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title} Selector</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>

                {/* Scope Toggle + Search Bar (Manual Search) */}
                <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Search Scope:</span>
                        {['local','global','both'].map(s => (
                            <button key={s} onClick={() => setScope(s)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition duration-150 ${scope === s ? 'bg-primary text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {s === 'both' ? 'Local + Global' : (s === 'local' ? 'Local' : 'Global')}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder={`Search by Name or ID (e.g., Minnie or CT2468)...`}
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setHasSearched(false); }}
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                        />
                        <button
                            onClick={handleSearch}
                            disabled={((scope === 'local' || scope === 'both') && loadingLocal) || ((scope === 'global' || scope === 'both') && loadingGlobal) || searchTerm.trim().length < 1}
                            className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 flex items-center disabled:opacity-50"
                        >
                            { (loadingLocal || loadingGlobal) ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} /> }
                        </button>
                    </div>
                </div>
                
                {/* Results Area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    {/* Local Results */}
                    {loadingLocal ? <LoadingSpinner message="Searching your animals..." /> : localAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Your Animals ({localAnimals.length})</h4>
                            {localAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={false} />)}
                        </div>
                    )}
                    
                    {/* Global Results */}
                    {loadingGlobal ? <LoadingSpinner message="Searching global animals..." /> : globalAnimals.length > 0 && (
                        <div className="border p-3 rounded-lg bg-white shadow-sm">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Global Display Animals ({globalAnimals.length})</h4>
                            {globalAnimals.map(animal => <SearchResultItem key={animal.id_public} animal={animal} isGlobal={true} />)}
                        </div>
                    )}
                    
                    {/* Updated no results check */}
                    {hasSearched && searchTerm.trim().length >= 1 && localAnimals.length === 0 && globalAnimals.length === 0 && !loadingLocal && !loadingGlobal && (
                        <p className="text-center text-gray-500 py-4">No animals found matching your search term or filters.</p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <button 
                        onClick={() => onSelect(null)} 
                        className="w-full text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        Clear {title} ID
                    </button>
                </div>
            </div>
        </div>
    );
};



﻿// Litter Management Component
const LitterManagement = ({ authToken, API_BASE_URL, userProfile, showModalMessage, onViewAnimal, handleViewAnimal, handleEditAnimal, formDataRef, onFormOpenChange, speciesOptions = [], cachedLitters = null, setCachedLitters, litterCacheTimestamp = 0, setLitterCacheTimestamp }) => {
    const [litters, setLitters] = useState([]);
    const [myAnimals, setMyAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        breedingPairCodeName: '',
        sireId_public: '',
        damId_public: '',
        species: '',
        birthDate: '',
        maleCount: null,
        femaleCount: null,
        unknownCount: null,
        notes: '',
        linkedOffspringIds: [],
        // Enhanced breeding record fields
        breedingMethod: 'Unknown',
        breedingConditionAtTime: '',
        matingDate: '',
        outcome: 'Unknown',
        birthMethod: '',
        litterSizeBorn: null,
        litterSizeWeaned: null,
        stillbornCount: null,
        expectedDueDate: '',
        weaningDate: ''
    });
    const [createOffspringCounts, setCreateOffspringCounts] = useState({
        males: 0,
        females: 0,
        unknown: 0
    });
    // Search filters for parent selection (UI not yet implemented)
    // const [sireSearch, setSireSearch] = useState('');
    // const [damSearch, setDamSearch] = useState('');
    // const [sireSpeciesFilter, setSireSpeciesFilter] = useState('');
    // const [damSpeciesFilter, setDamSpeciesFilter] = useState('');
    const [linkingAnimals, setLinkingAnimals] = useState(false);
    const [availableToLink, setAvailableToLink] = useState({ litter: null, animals: [] });
    const [expandedLitter, setExpandedLitter] = useState(null);
    const [editingLitter, setEditingLitter] = useState(null);
    const [litterImages, setLitterImages] = useState([]);
    const [litterImageUploading, setLitterImageUploading] = useState(false);
    const [pendingLitterImages, setPendingLitterImages] = useState([]);
    const [showLitterImageModal, setShowLitterImageModal] = useState(false);
    const [enlargedLitterImageUrl, setEnlargedLitterImageUrl] = useState(null);

    const handleLitterImageDownload = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `crittertrack-litter-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };
    const [modalTarget, setModalTarget] = useState(null);
    const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
    const [selectedSireAnimal, setSelectedSireAnimal] = useState(null);
    const [selectedDamAnimal, setSelectedDamAnimal] = useState(null);
    const [selectedTpSireAnimal, setSelectedTpSireAnimal] = useState(null);
    const [selectedTpDamAnimal, setSelectedTpDamAnimal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    // COI calculation state
    const [predictedCOI, setPredictedCOI] = useState(null);
    const [calculatingCOI, setCalculatingCOI] = useState(false);
    const [addingOffspring, setAddingOffspring] = useState(null);
    const [newOffspringData, setNewOffspringData] = useState({
        name: '',
        gender: '',
        color: '',
        coat: '',
        remarks: ''
    });
    const [bulkDeleteMode, setBulkDeleteMode] = useState({});
    const [selectedOffspring, setSelectedOffspring] = useState({});
    const [coiCalculating, setCoiCalculating] = useState(new Set()); // litter._id values currently computing COI
    // Session-level cache: key = `${sireId}:${damId}` or `litter:${_id}`, value = COI number
    // Prevents re-fetching the same pairing every time fetchLitters is called
    const coiCacheRef = useRef({});
    const [myAnimalsLoaded, setMyAnimalsLoaded] = useState(false);
    const [litterOffspringMap, setLitterOffspringMap] = useState({}); // litter._id ? offspring array (undefined = not yet loaded)
    const [offspringRefetchToken, setOffspringRefetchToken] = useState(0); // increment to force offspring re-fetch
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
    const [calendarTooltip, setCalendarTooltip] = useState(null); // { litterId, eventType, litter, x, y }
    const [calendarQuery, setCalendarQuery] = useState('');
    const [calendarPlannedOnly, setCalendarPlannedOnly] = useState(false);
    const [calendarEventFilters, setCalendarEventFilters] = useState({ mated: true, due: true, born: true, weaned: true });
    const [urgencyEnabled, setUrgencyEnabled] = useState(() => {
        try { return localStorage.getItem('ct_urgency_enabled') !== 'false'; } catch { return true; }
    });
    const toggleUrgency = () => {
        const next = !urgencyEnabled;
        setUrgencyEnabled(next);
        try {
            localStorage.setItem('ct_urgency_enabled', next ? 'true' : 'false');
            window.dispatchEvent(new StorageEvent('storage', { key: 'ct_urgency_enabled' }));
        } catch {}
    };

    // Mating quick-add form state
    const [showAddMatingForm, setShowAddMatingForm] = useState(false);
    const [editingMatingId, setEditingMatingId] = useState(null); // null = create, set = edit
    const [matingEditChoice, setMatingEditChoice] = useState(null); // litter object awaiting edit/convert choice
    const [matingData, setMatingData] = useState({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });
    const [selectedMatingSire, setSelectedMatingSire] = useState(null);
    const [selectedMatingDam, setSelectedMatingDam] = useState(null);
    const [showMatingBreedingDetails, setShowMatingBreedingDetails] = useState(false);
    const [matingCOI, setMatingCOI] = useState(null);
    const [matingCalcCOI, setMatingCalcCOI] = useState(false);
    const [showMatingSpeciesPicker, setShowMatingSpeciesPicker] = useState(false);

    // Test Pairing modal state
    const [showTestPairingModal, setShowTestPairingModal] = useState(false);
    const [tpSireId, setTpSireId] = useState('');
    const [tpDamId, setTpDamId] = useState('');
    const [tpCOI, setTpCOI] = useState(null);
    const [tpCalculating, setTpCalculating] = useState(false);
    const [tpError, setTpError] = useState(null);
    const [tpMode, setTpMode] = useState('coi'); // 'coi' | 'target'
    const [tpSourceMode, setTpSourceMode] = useState('mine'); // 'mine' | 'mine+favorited'
    const [tpTargetSpecies, setTpTargetSpecies] = useState(TARGET_OUTCOME_PROTOTYPE_SPECIES);
    const [tpSelectedTraits, setTpSelectedTraits] = useState([]);
    const [tpGenerating, setTpGenerating] = useState(false);
    const [tpMockResults, setTpMockResults] = useState([]);
    const [tpExpandedCard, setTpExpandedCard] = useState(null); // key = `${sireId}:${damId}:${idx}`
    const [tpShowResultsHelp, setTpShowResultsHelp] = useState(false);
    const handleCalculateTestPairing = async () => {
        if (!tpSireId || !tpDamId) return;
        const cacheKey = `${tpSireId}:${tpDamId}`;
        if (coiCacheRef.current[cacheKey] != null) {
            setTpCOI(coiCacheRef.current[cacheKey]);
            return;
        }
        setTpCalculating(true);
        setTpError(null);
        setTpCOI(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const res = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                params: { sireId: tpSireId, damId: tpDamId, generations: 20 },
                headers: { Authorization: `Bearer ${authToken}` },
                signal: controller.signal,
            });
            const val = res.data.inbreedingCoefficient ?? 0;
            coiCacheRef.current[cacheKey] = val;
            setTpCOI(val);
        } catch (err) {
            if (axios.isCancel(err)) setTpError('Request timed out ? please try again.');
            else setTpError('Failed to calculate COI. Please try again.');
        } finally {
            clearTimeout(timeout);
            setTpCalculating(false);
        }
    };

    const toggleTargetTraitChip = (chipId) => {
        setTpSelectedTraits(prev => prev.includes(chipId)
            ? prev.filter(id => id !== chipId)
            : [...prev, chipId]
        );
    };

    const runTargetOutcomePrototype = () => {
        if (tpSelectedTraits.length === 0) return;
        setTpGenerating(true);

        const speciesForPairs = TARGET_OUTCOME_PROTOTYPE_SPECIES;
        const malePool = myAnimals.filter(a =>
            (a.species === speciesForPairs) &&
            ['Male', 'Intersex', 'Unknown'].includes(a.gender) &&
            a.status !== 'Deceased'
        );
        const femalePool = myAnimals.filter(a =>
            (a.species === speciesForPairs) &&
            ['Female', 'Intersex', 'Unknown'].includes(a.gender) &&
            a.status !== 'Deceased'
        );

        const selectedSire = tpSireId ? (myAnimals.find(a => a.id_public === tpSireId) || selectedTpSireAnimal) : null;
        const selectedDam = tpDamId ? (myAnimals.find(a => a.id_public === tpDamId) || selectedTpDamAnimal) : null;

        const pairs = [];
        if (selectedSire?.id_public && selectedDam?.id_public) {
            pairs.push({
                sireId: selectedSire.id_public,
                sireName: selectedSire.name || selectedSire.id_public,
                damId: selectedDam.id_public,
                damName: selectedDam.name || selectedDam.id_public,
                source: 'selected'
            });
        }

        malePool.slice(0, 4).forEach((sire) => {
            femalePool.slice(0, 4).forEach((dam) => {
                if (sire.id_public === dam.id_public) return;
                pairs.push({
                    sireId: sire.id_public,
                    sireName: sire.name || sire.id_public,
                    damId: dam.id_public,
                    damName: dam.name || dam.id_public,
                    source: 'mine'
                });
            });
        });

        const uniq = [];
        const seen = new Set();
        pairs.forEach(p => {
            const key = `${p.sireId}:${p.damId}`;
            if (seen.has(key)) return;
            seen.add(key);
            uniq.push(p);
        });

        const selectedTraitLabels = tpSelectedTraits.map(id => {
            const found = getTargetTraitChipById(id);
            return found ? formatTargetTraitChip(found) : id;
        });
        const { assumptions: prototypeAssumptions } = buildPrototypeGenotypeFromTraits(tpSelectedTraits);
        const phenotypeInterpretation = getPrototypePhenotypeInterpretation(tpSelectedTraits);
        const phenotypeConfidence = getPrototypePhenotypeConfidence(tpSelectedTraits);

        const results = uniq.slice(0, 6).map((pair, idx) => {
            const hash = `${pair.sireId}${pair.damId}${tpSelectedTraits.join('|')}`
                .split('')
                .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
            const jitter = (hash % 17) - 8;
            const base = 30 + (tpSelectedTraits.length * 4) - (idx * 5) + jitter;
            const probability = Math.max(1, Math.min(95, base));

            const coiValue = idx === 0 && tpCOI != null
                ? tpCOI
                : Math.max(0, ((hash % 190) / 10));

            const warnings = [];
            if (coiValue >= 12.5) warnings.push('Higher COI than ideal range');
            if (tpSourceMode === 'mine+favorited' && pair.source !== 'mine') warnings.push('Favorited external candidate');

            return {
                ...pair,
                probability,
                coiValue,
                warnings,
                phenotypeConfidence,
                assumptions: prototypeAssumptions,
                explanation: [
                    `Supports target traits: ${selectedTraitLabels.slice(0, 2).join(', ')}${selectedTraitLabels.length > 2 ? ' +' : ''}`,
                    phenotypeInterpretation,
                    `Confidence: ${phenotypeConfidence.label} — ${phenotypeConfidence.detail}`,
                    prototypeAssumptions.length ? `Assumptions used: ${prototypeAssumptions.length}` : null,
                    `Trait coverage confidence is prototype-only (UI mock scoring).`,
                    `COI penalty applied in ranking preview.`
                ].filter(Boolean)
            };
        }).sort((a, b) => b.probability - a.probability);

        setTimeout(() => {
            setTpMockResults(results);
            setTpGenerating(false);
            setTpExpandedCard(null);
        }, 350);
    };

    const usePairForPlannedMating = (pair) => {
        const selectedTraitLabels = tpSelectedTraits
            .map(id => getTargetTraitChipById(id))
            .filter(Boolean)
            .map(formatTargetTraitChip);

        setMatingData(prev => ({
            ...prev,
            species: tpTargetSpecies,
            sireId_public: pair.sireId,
            damId_public: pair.damId,
            notes: [
                prev.notes || '',
                `Target Outcome prototype: ${selectedTraitLabels.join(', ')}`,
                `Predicted match: ${pair.probability.toFixed(2)}%`
            ].filter(Boolean).join('\n')
        }));

        const sire = myAnimals.find(a => a.id_public === pair.sireId) || null;
        const dam = myAnimals.find(a => a.id_public === pair.damId) || null;
        setSelectedMatingSire(sire);
        setSelectedMatingDam(dam);

        setShowTestPairingModal(false);
        setShowAddMatingForm(true);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Check if we have cached litters
                if (cachedLitters && cachedLitters.length > 0) {
                    setLitters(cachedLitters);
                    setLoading(false);
                    // Still fetch fresh data in background
                    await fetchLitters();
                } else {
                    // Load litters first so cards appear immediately; animals fetch silently in background
                    await fetchLitters();
                }
            } catch (error) {
                console.error('Error loading litters:', error);
            } finally {
                setLoading(false);
            }
            // Background – populates offspring cards as soon as it resolves
            fetchMyAnimals().catch(err => console.error('Error loading animals:', err));
        };
        loadData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update parent ref with current form data for tutorial tracking
    useEffect(() => {
        if (formDataRef) {
            formDataRef.current = formData;
        }
    }, [formData, formDataRef]);

    // Notify parent when form open state changes
    useEffect(() => {
        if (onFormOpenChange) {
            onFormOpenChange(showAddForm);
        }
    }, [showAddForm, onFormOpenChange]);

    // Listen for animal updates and refetch litters when pair animals or offspring change
    useEffect(() => {
        const handleAnimalUpdated = (event) => {
            const updatedAnimal = event.detail; // detail IS the animal object
            if (!updatedAnimal?.id_public || !litters.length) return;

            // Patch offspring map in-place so cards reflect changes immediately
            setLitterOffspringMap(prev => {
                let changed = false;
                const updated = { ...prev };
                for (const litterId in updated) {
                    const list = updated[litterId];
                    if (!Array.isArray(list)) continue;
                    const idx = list.findIndex(o => o.id_public === updatedAnimal.id_public);
                    if (idx !== -1) {
                        updated[litterId] = list.map((o, i) =>
                            i === idx ? { ...o, ...updatedAnimal } : o
                        );
                        changed = true;
                    }
                }
                return changed ? updated : prev;
            });
        };

        window.addEventListener('animal-updated', handleAnimalUpdated);
        return () => window.removeEventListener('animal-updated', handleAnimalUpdated);
    }, [litters, setLitterOffspringMap]);

    // Fallback: fetch offspring for a specific litter if not yet loaded when expanded
    // (normally fetchLitters pre-loads all offspring, this is just a safety net)
    useEffect(() => {
        if (!expandedLitter || !authToken) return;
        if (litterOffspringMap[expandedLitter] !== undefined) return; // already loaded
        const litter = litters.find(l => l._id === expandedLitter);
        if (!litter) return;
        axios.get(`${API_BASE_URL}/litters/${litter.litter_id_public}/offspring`, {
            headers: { Authorization: `Bearer ${authToken}` }
        }).then(res => {
            setLitterOffspringMap(prev => ({ ...prev, [expandedLitter]: res.data || [] }));
        }).catch(() => {
            setLitterOffspringMap(prev => ({ ...prev, [expandedLitter]: [] }));
        });
    }, [expandedLitter, litters, authToken, API_BASE_URL, offspringRefetchToken]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleBulkDeleteMode = (litterId) => {
        setBulkDeleteMode(prev => ({ ...prev, [litterId]: !prev[litterId] }));
        setSelectedOffspring(prev => ({ ...prev, [litterId]: [] }));
    };

    const toggleOffspringSelection = (litterId, animalId) => {
        setSelectedOffspring(prev => {
            const current = prev[litterId] || [];
            const updated = current.includes(animalId)
                ? current.filter(id => id !== animalId)
                : [...current, animalId];
            return { ...prev, [litterId]: updated };
        });
    };

    const handleBulkDeleteOffspring = async (litterId) => {
        const selectedIds = selectedOffspring[litterId] || [];
        if (selectedIds.length === 0) {
            showModalMessage('No Selection', 'Please select at least one offspring to delete.');
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} offspring animal(s)? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            setLoading(true);
            for (const id of selectedIds) {
                await axios.delete(`${API_BASE_URL}/animals/${id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
            }
            showModalMessage('Success', `Successfully deleted ${selectedIds.length} offspring animal(s).`);
            setBulkDeleteMode(prev => ({ ...prev, [litterId]: false }));
            setSelectedOffspring(prev => ({ ...prev, [litterId]: [] }));
            await fetchLitters();
            await fetchMyAnimals();
        } catch (error) {
            console.error('Error deleting offspring:', error);
            showModalMessage('Error', 'Failed to delete some offspring. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLitters = async ({ preserveOffspring = false } = {}) => {
        try {
            // Clear offspring cache so expanded litter re-fetches fresh data
            // (skip when caller has already applied an optimistic update)
            if (!preserveOffspring) {
                setLitterOffspringMap({});
            }
            setOffspringRefetchToken(t => t + 1);
            const response = await axios.get(`${API_BASE_URL}/litters`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const littersData = Array.isArray(response.data) ? response.data : [];
            
            // Set litters immediately so UI can render
            setLitters(littersData);
            
            // Cache the litters at parent level to prevent re-fetching on navigation
            if (setCachedLitters) {
                setCachedLitters(littersData);
                if (setLitterCacheTimestamp) {
                    setLitterCacheTimestamp(Date.now());
                }
            }
            
            // Calculate COI for each litter that doesn't have it yet.
            // Each litter updates independently so cards pop in as they resolve.
            // Only calculate COI for litters not already cached this session
            const littersNeedingCOI = littersData.filter(l => {
                if (!l.sireId_public || !l.damId_public) return false;
                if (l.inbreedingCoefficient != null) return false; // already stored in DB
                const cacheKey = `${l.sireId_public}:${l.damId_public}`;
                if (coiCacheRef.current[cacheKey] != null) {
                    // Already computed this session ? patch state immediately, no API call
                    setLitters(prev => prev.map(x => x._id === l._id ? { ...x, inbreedingCoefficient: coiCacheRef.current[cacheKey] } : x));
                    return false;
                }
                return true;
            });
            if (littersNeedingCOI.length > 0) {
                setCoiCalculating(new Set(littersNeedingCOI.map(l => l._id)));
                littersNeedingCOI.forEach(async (litter) => {
                    const cacheKey = `${litter.sireId_public}:${litter.damId_public}`;
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 15000);
                    try {
                        const coiResponse = await axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                            params: { sireId: litter.sireId_public, damId: litter.damId_public, generations: 20 },
                            headers: { Authorization: `Bearer ${authToken}` },
                            signal: controller.signal,
                        });
                        const coi = coiResponse.data.inbreedingCoefficient ?? 0;
                        coiCacheRef.current[cacheKey] = coi;
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, inbreedingCoefficient: coi } : l));
                        axios.put(`${API_BASE_URL}/litters/${litter._id}`, { inbreedingCoefficient: coi }, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }).catch(() => {});
                    } catch { coiCacheRef.current[cacheKey] = 0; /* prevent retry loops on error */ }
                    finally {
                        clearTimeout(timeout);
                        setCoiCalculating(prev => { const next = new Set(prev); next.delete(litter._id); return next; });
                    }
                });
            }

            // Fetch offspring for all litters in parallel right away (no need to wait for expand)
            littersData.forEach(litter => {
                axios.get(`${API_BASE_URL}/litters/${litter.litter_id_public}/offspring`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then(res => {
                    const offspring = Array.isArray(res.data) ? res.data : [];
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: offspring }));

                    // Silently reconcile counts if linked offspring exceed stored values
                    if (offspring.length === 0) return;
                    const linkedMales   = offspring.filter(a => a.gender === 'Male').length;
                    const linkedFemales = offspring.filter(a => a.gender === 'Female').length;
                    const linkedUnknown = offspring.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
                    const linkedTotal   = offspring.length;
                    const storedMales   = litter.maleCount   ?? 0;
                    const storedFemales = litter.femaleCount  ?? 0;
                    const storedUnknown = litter.unknownCount ?? 0;
                    const storedBorn    = litter.litterSizeBorn ?? litter.numberBorn ?? 0;
                    // Only auto-update total born if linked offspring exceed stored value.
                    // Never overwrite manually-entered gender counts.
                    const newBorn = Math.max(storedBorn, linkedTotal);
                    if (newBorn !== storedBorn) {
                        const patch = { litterSizeBorn: newBorn || null, numberBorn: newBorn || null };
                        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, ...patch } : l));
                        axios.put(`${API_BASE_URL}/litters/${litter._id}`, patch, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => {});
                    }
                }).catch(() => {
                    setLitterOffspringMap(prev => ({ ...prev, [litter._id]: [] }));
                });
            });
        } catch (error) {
            console.error('Error fetching litters:', error);
            setLitters([]);
        }
    };

    const fetchMyAnimals = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/animals`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const animalsData = response.data || [];
            
            // Set animals immediately so UI can render
            setMyAnimals(animalsData);
            setMyAnimalsLoaded(true);
            
            // Start COI calculations in background without blocking
            Promise.resolve().then(async () => {
                for (const animal of animalsData) {
                    if ((animal.fatherId_public || animal.motherId_public || animal.sireId_public || animal.damId_public)) {
                        try {
                            const coiResponse = await axios.get(`${API_BASE_URL}/animals/${animal.id_public}/inbreeding`, {
                                params: { generations: 50 },
                                headers: { Authorization: `Bearer ${authToken}` }
                            });
                            animal.inbreedingCoefficient = coiResponse.data.inbreedingCoefficient;
                        } catch (error) {
                            // COI calculation failed silently - non-critical
                        }
                    } else {
                        animal.inbreedingCoefficient = 0;
                    }
                }
                setMyAnimals([...animalsData]);
            });
        } catch (error) {
            console.error('Error fetching animals:', error);
            setMyAnimals([]);
        }
    };

    const handleSelectOtherParentForLitter = (animal) => {
        if (modalTarget === 'sire-litter') {
            setFormData(prev => ({...prev, sireId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedSireAnimal(animal || null);
        } else if (modalTarget === 'dam-litter') {
            setFormData(prev => ({...prev, damId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedDamAnimal(animal || null);
        } else if (modalTarget === 'other-parent1-litter') {
            setFormData(prev => ({...prev, otherParent1Id_public: animal?.id_public || ''}));
        } else if (modalTarget === 'other-parent2-litter') {
            setFormData(prev => ({...prev, otherParent2Id_public: animal?.id_public || ''}));
        } else if (modalTarget === 'tp-sire') {
            setTpSireId(animal?.id_public || '');
            setSelectedTpSireAnimal(animal || null);
            setTpCOI(null);
            setTpError(null);
        } else if (modalTarget === 'tp-dam') {
            setTpDamId(animal?.id_public || '');
            setSelectedTpDamAnimal(animal || null);
            setTpCOI(null);
            setTpError(null);
        } else if (modalTarget === 'sire-mating') {
            setMatingData(prev => ({...prev, sireId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedMatingSire(animal || null);
            setMatingCOI(null);
        } else if (modalTarget === 'dam-mating') {
            setMatingData(prev => ({...prev, damId_public: animal?.id_public || '', species: prev.species || animal?.species || ''}));
            setSelectedMatingDam(animal || null);
            setMatingCOI(null);
        }
        setModalTarget(null);
    };

    // Auto-calculate COI for mating form when both parents are selected
    useEffect(() => {
        if (!matingData.sireId_public || !matingData.damId_public) { setMatingCOI(null); return; }
        const sireId = matingData.sireId_public;
        const damId = matingData.damId_public;
        const cacheKey = `${sireId}:${damId}`;
        if (coiCacheRef.current[cacheKey] != null) { setMatingCOI(coiCacheRef.current[cacheKey]); return; }
        setMatingCalcCOI(true);
        setMatingCOI(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
            params: { sireId, damId, generations: 20 },
            headers: { Authorization: `Bearer ${authToken}` },
            signal: controller.signal,
        }).then(res => {
            const val = res.data.inbreedingCoefficient ?? 0;
            coiCacheRef.current[cacheKey] = val;
            setMatingCOI(val);
        }).catch(() => {}).finally(() => { clearTimeout(timeout); setMatingCalcCOI(false); });
    }, [matingData.sireId_public, matingData.damId_public]); // eslint-disable-line react-hooks/exhaustive-deps

    const resetMatingForm = () => {
        setMatingData({ sireId_public: '', damId_public: '', matingDate: '', expectedDueDate: '', breedingMethod: 'Natural', breedingConditionAtTime: '', species: '', notes: '' });
        setSelectedMatingSire(null);
        setSelectedMatingDam(null);
        setShowMatingBreedingDetails(false);
        setShowMatingSpeciesPicker(false);
        setMatingCOI(null);
        setMatingCalcCOI(false);
        setEditingMatingId(null);
    };

    const handleEditMating = (litter) => {
        const fmt = (d) => !d ? '' : (typeof d === 'string' && d.match(/^\d{4}-\d{2}-\d{2}/) ? d.split('T')[0] : new Date(d).toISOString().split('T')[0]);
        setEditingMatingId(litter._id);
        setMatingData({
            sireId_public: litter.sireId_public || '',
            damId_public: litter.damId_public || '',
            matingDate: fmt(litter.matingDate || litter.pairingDate),
            expectedDueDate: fmt(litter.expectedDueDate),
            breedingMethod: litter.breedingMethod || 'Natural',
            breedingConditionAtTime: litter.breedingConditionAtTime || '',
            species: litter.sire?.species || litter.dam?.species || '',
            notes: litter.notes || '',
        });
        setSelectedMatingSire(litter.sire || null);
        setSelectedMatingDam(litter.dam || null);
        if (litter.inbreedingCoefficient != null) setMatingCOI(litter.inbreedingCoefficient);
        setMatingEditChoice(null);
        setShowAddMatingForm(true);
    };

    const handleSubmitMating = async (e) => {
        e.preventDefault();
        if (!matingData.sireId_public || !matingData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }
        try {
            const sire = myAnimals.find(a => a.id_public === matingData.sireId_public) || selectedMatingSire;
            const dam = myAnimals.find(a => a.id_public === matingData.damId_public) || selectedMatingDam;
            if (!sire || !dam) {
                showModalMessage('Error', 'Selected parents not found. Please re-select sire and dam.');
                return;
            }
            const payload = {
                sireId_public: matingData.sireId_public,
                damId_public: matingData.damId_public,
                species: matingData.species || sire.species,
                matingDate: matingData.matingDate || null,
                expectedDueDate: matingData.expectedDueDate || null,
                breedingMethod: matingData.breedingMethod || 'Natural',
                breedingConditionAtTime: matingData.breedingConditionAtTime || null,
                notes: matingData.notes || '',
                isPlanned: true,
                numberBorn: 0,
            };
            let litterBackendId;
            if (editingMatingId) {
                await axios.put(`${API_BASE_URL}/litters/${editingMatingId}`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                litterBackendId = editingMatingId;
            } else {
                const resp = await axios.post(`${API_BASE_URL}/litters`, payload, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                litterBackendId = resp.data.litterId_backend;
            }
            if (matingCOI != null) {
                axios.put(`${API_BASE_URL}/litters/${litterBackendId}`, { inbreedingCoefficient: matingCOI }, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }).catch(() => {});
            }
            showModalMessage('Success', editingMatingId ? 'Planned mating updated!' : 'Planned mating recorded! Edit the entry to add birth details when the litter arrives.');
            setShowAddMatingForm(false);
            resetMatingForm();
            fetchLitters();
        } catch (error) {
            console.error('Error recording planned mating:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to record mating');
        }
    };

    const handleMarkAsMated = async (litter) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { matingDate: today }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Auto-dismiss the "mating due today" urgency notification for this litter
            try {
                const key = `${litter._id}-mated-${today}`;
                const prev = JSON.parse(localStorage.getItem('ct_urgency_dismissed') || '{}');
                prev[key] = true;
                localStorage.setItem('ct_urgency_dismissed', JSON.stringify(prev));
                window.dispatchEvent(new StorageEvent('storage', { key: 'ct_urgency_dismissed' }));
            } catch {}
            fetchLitters();
        } catch (err) {
            showModalMessage('Error', 'Failed to mark as mated');
        }
    };

    // -- Litter form save-time reconciliation ---------------------------------
    // Returns { correctedCounts, warnings[] } based on form values + linked animals.
    // Rule 1: gender sum > total ? bump total (silent)
    // Rule 2: stillborn or weaned > total ? warn, do NOT auto-correct
    const reconcileLitterFormCounts = (fd, linkedAnimals = []) => {
        const linkedMales   = linkedAnimals.filter(a => a.gender === 'Male').length;
        const linkedFemales = linkedAnimals.filter(a => a.gender === 'Female').length;
        const linkedUnknown = linkedAnimals.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
        // Always keep manual entries ? only enforce minimum equal to linked count
        const maleCount    = Math.max(parseInt(fd.maleCount)    || 0, linkedMales);
        const femaleCount  = Math.max(parseInt(fd.femaleCount)  || 0, linkedFemales);
        const unknownCount = Math.max(parseInt(fd.unknownCount) || 0, linkedUnknown);
        const genderSum    = maleCount + femaleCount + unknownCount;
        const linkedCount  = linkedAnimals.length;
        const manualTotal  = parseInt(fd.litterSizeBorn) || 0;
        const litterSizeBorn = Math.max(manualTotal, genderSum, linkedCount) || null;
        const stillborn    = parseInt(fd.stillbornCount) || 0;
        const weaned       = parseInt(fd.litterSizeWeaned) || 0;
        const warnings     = [];
        if (litterSizeBorn && stillborn > litterSizeBorn)
            warnings.push(`Stillborn (${stillborn}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && weaned > litterSizeBorn)
            warnings.push(`Weaned (${weaned}) exceeds Total Born (${litterSizeBorn}).`);
        if (litterSizeBorn && (stillborn + weaned) > litterSizeBorn)
            warnings.push(`Stillborn + Weaned (${stillborn + weaned}) exceeds Total Born (${litterSizeBorn}).`);
        return {
            correctedCounts: { maleCount: maleCount || null, femaleCount: femaleCount || null, unknownCount: unknownCount || null, litterSizeBorn, numberBorn: litterSizeBorn },
            warnings,
        };
    };
    // -------------------------------------------------------------------------

    // Migration function to set isDisplay to true for all existing animals
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }

        try {
            // Get parent details ? fall back to cached selected animals for global (non-owned) ones
            const sire = myAnimals.find(a => a.id_public === formData.sireId_public) || selectedSireAnimal;
            const dam = myAnimals.find(a => a.id_public === formData.damId_public) || selectedDamAnimal;

            if (!sire || !dam) {
                showModalMessage('Error', 'Selected parents not found. Please re-select sire and dam.');
                return;
            }

            if (sire.species && dam.species && sire.species !== dam.species) {
                showModalMessage('Error', 'Parents must be the same species');
                return;
            }

            // Validate dam was alive at litter birth date (only females need to be alive at birth)
            if (formData.birthDate) {
                const litterBirthDate = new Date(formData.birthDate);
                
                // Only validate dam (female) - sires (males) can be deceased
                if (dam.deceasedDate) {
                    const damDeceasedDate = new Date(dam.deceasedDate);
                    if (damDeceasedDate < litterBirthDate) {
                        showModalMessage('Error', `Dam (${dam.name}) was deceased before the litter birth date`);
                        return;
                    }
                }
            }

            // Reconcile counts against logic model before saving
            const linkedForCreate = myAnimals.filter(a => (formData.linkedOffspringIds || []).includes(a.id_public));
            const { correctedCounts: createCounts, warnings: createWarnings } = reconcileLitterFormCounts(formData, linkedForCreate);
            if (createWarnings.length > 0) {
                const proceed = window.confirm(`Warning:\n${createWarnings.join('\n')}\n\nSave anyway?`);
                if (!proceed) return;
            }

            const litterPayload = {
                breedingPairCodeName: formData.breedingPairCodeName || null,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                birthDate: formData.birthDate || null,
                notes: formData.notes || '',
                offspringIds_public: formData.linkedOffspringIds || [],
                ...createCounts,
                // Enhanced breeding record fields
                breedingMethod: formData.breedingMethod || 'Unknown',
                breedingConditionAtTime: formData.breedingConditionAtTime || null,
                matingDate: formData.matingDate || null,
                expectedDueDate: formData.expectedDueDate || null,
                outcome: formData.outcome || 'Unknown',
                birthMethod: formData.birthMethod || null,
                litterSizeWeaned: formData.litterSizeWeaned || null,
                stillbornCount: formData.stillbornCount || null,
                weaningDate: formData.weaningDate || null
            };

            const litterResponse = await axios.post(`${API_BASE_URL}/litters`, litterPayload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const litterId = litterResponse.data.litterId_backend;

            // Upload any images that were staged during creation
            if (pendingLitterImages.length > 0) {
                for (const { file } of pendingLitterImages) {
                    try {
                        const compressedBlob = await compressImageToMaxSize(file, 480 * 1024, { maxWidth: 1920, maxHeight: 1920, startQuality: 0.85 });
                        const fd = new FormData();
                        fd.append('image', compressedBlob, file.name || 'litter-photo.jpg');
                        const imgResp = await axios.post(`${API_BASE_URL}/litters/${litterId}/images`, fd, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        litterResponse.data.images = imgResp.data.images;
                    } catch (err) {
                        console.error('Failed to upload litter image:', err);
                    }
                }
                setPendingLitterImages([]);
            }

            // Optimistic update ? add new litter to state immediately so it shows without waiting for refetch
            setLitters(prev => [litterResponse.data, ...prev]);

            // Calculate inbreeding coefficient in the background (non-blocking)
            axios.get(`${API_BASE_URL}/animals/inbreeding/pairing`, {
                params: { sireId: formData.sireId_public, damId: formData.damId_public, generations: 20 },
                headers: { Authorization: `Bearer ${authToken}` }
            }).then(coiResponse => {
                const coi = coiResponse.data.inbreedingCoefficient;
                if (coi != null) {
                    axios.put(`${API_BASE_URL}/litters/${litterId}`, { inbreedingCoefficient: coi }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).catch(() => {});
                    // Patch the optimistic entry with the COI once it arrives
                    setLitters(prev => prev.map(l => l.litterId_backend === litterId ? { ...l, inbreedingCoefficient: coi } : l));
                }
            }).catch(() => {});

            // Create offspring animals if requested
            const offspringPromises = [];
            const totalToCreate = parseInt(createOffspringCounts.males || 0) + parseInt(createOffspringCounts.females || 0) + parseInt(createOffspringCounts.unknown || 0);
            
            if (totalToCreate > 0) {
                // Need birthdate to create animals
                if (!formData.birthDate) {
                    showModalMessage('Error', 'Birth date is required to create new offspring animals');
                    return;
                }
                
                // Create males
                for (let i = 1; i <= parseInt(createOffspringCounts.males || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `M${i}`, species: sire.species, gender: 'Male', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                
                // Create females
                for (let i = 1; i <= parseInt(createOffspringCounts.females || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `F${i}`, species: sire.species, gender: 'Female', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }

                // Create unknown/intersex
                for (let i = 1; i <= parseInt(createOffspringCounts.unknown || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `U${i}`, species: sire.species, gender: 'Unknown', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
            }
            
            const createdAnimals = await Promise.all(offspringPromises);

            // Extract the IDs from created animals
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            
            // Combine created and linked offspring IDs
            const allOffspringIds = [...newOffspringIds, ...(formData.linkedOffspringIds || [])];
            
            // Calculate inbreeding for each NEW offspring in the background (non-blocking)
            newOffspringIds.forEach(animalId => {
                axios.get(`${API_BASE_URL}/animals/${animalId}/inbreeding`, {
                    params: { generations: 20 },
                    headers: { Authorization: `Bearer ${authToken}` }
                }).catch(() => {});
            });
            
            // Update litter with all offspring
            await axios.put(`${API_BASE_URL}/litters/${litterId}`, {
                offspringIds_public: allOffspringIds,
                numberBorn: allOffspringIds.length
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // COI will arrive and patch state via the background request fired above

            const createdCount = newOffspringIds.length;
            const linkedCount = formData.linkedOffspringIds?.length || 0;
            const trackingMales = formData.maleCount ? parseInt(formData.maleCount) : 0;
            const trackingFemales = formData.femaleCount ? parseInt(formData.femaleCount) : 0;
            
            let successMsg = 'Litter created successfully!';
            const parts = [];
            if (createdCount > 0) parts.push(`${createdCount} new animal(s) created`);
            if (linkedCount > 0) parts.push(`${linkedCount} animal(s) linked`);
            if (trackingMales > 0 || trackingFemales > 0) {
                parts.push(`tracking ${trackingMales}M/${trackingFemales}F`);
            }
            if (parts.length > 0) {
                successMsg = `Litter created with ${parts.join(', ')}!`;
            }
            
            showModalMessage('Success', successMsg);
            setShowAddForm(false);
            setPendingLitterImages(prev => { prev.forEach(item => URL.revokeObjectURL(item.previewUrl)); return []; });
            setSelectedSireAnimal(null);
            setSelectedDamAnimal(null);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                species: '',
                birthDate: '',
                maleCount: null,
                femaleCount: null,
                unknownCount: null,
                notes: '',
                linkedOffspringIds: [],
                // Enhanced breeding record fields
                breedingMethod: 'Unknown',
                breedingConditionAtTime: '',
                matingDate: '',
                expectedDueDate: '',
                outcome: 'Unknown',
                birthMethod: '',
                litterSizeBorn: null,
                litterSizeWeaned: null,
                stillbornCount: null,
                weaningDate: ''
            });
            setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
            // setSireSearch('');
            // setDamSearch('');
            // setSireSpeciesFilter('');
            // setDamSpeciesFilter('');
            setPredictedCOI(null);
            fetchLitters();
            fetchMyAnimals();
        } catch (error) {
            console.error('Error creating litter:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to create litter');
        }
    };

    // -- Shared litter count recalculation ------------------------------------
    // Rules:
    //  1. Linked animals are ground truth for gender counts (always overwrite)
    //  2. litterSizeBorn = max(current manual total, gender sum, linked count)
    //  3. numberBorn stays in sync with litterSizeBorn
    //  4. stillborn/weaned are never touched here
    const calcLitterCounts = (litter, allLinkedAnimals) => {
        const maleCount   = allLinkedAnimals.filter(a => a.gender === 'Male').length;
        const femaleCount = allLinkedAnimals.filter(a => a.gender === 'Female').length;
        const unknownCount = allLinkedAnimals.filter(a => a.gender !== 'Male' && a.gender !== 'Female').length;
        const genderSum   = maleCount + femaleCount + unknownCount;
        const linkedCount = allLinkedAnimals.length;
        const litterSizeBorn = Math.max(litter.litterSizeBorn || 0, genderSum, linkedCount);
        return { maleCount, femaleCount, unknownCount, litterSizeBorn, numberBorn: litterSizeBorn };
    };
    // -------------------------------------------------------------------------

    const handleLinkAnimals = (litter) => {
        // Search for animals with matching parents and birthdate
        // Require birthdate to be set first
        if (!litter.birthDate) {
            showModalMessage('Required', 'Please enter a birth date for the litter before linking animals.');
            return;
        }

        try {
            // Use already-loaded myAnimals ? no network call needed
            const linkedIds = litter.offspringIds_public || [];
            
            const matching = myAnimals.filter(animal => {
                // Skip if already linked to this litter
                if (linkedIds.includes(animal.id_public)) return false;
                
                const matchesSire = animal.fatherId_public === litter.sireId_public || animal.sireId_public === litter.sireId_public;
                const matchesDam = animal.motherId_public === litter.damId_public || animal.damId_public === litter.damId_public;
                const matchesBirthDate = animal.birthDate && new Date(animal.birthDate).toDateString() === new Date(litter.birthDate).toDateString();
                return matchesSire && matchesDam && matchesBirthDate;
            });

            setAvailableToLink({ litter, animals: matching });
            setLinkingAnimals(true);
        } catch (error) {
            console.error('Error finding matching animals:', error);
            showModalMessage('Error', 'Failed to search for matching animals');
        }
    };

    const handleAddToLitter = async (animalId) => {
        try {
            const litter = availableToLink.litter;
            const updatedOffspringIds = [...(litter.offspringIds_public || []), animalId];
            const addedAnimal = availableToLink.animals.find(a => a.id_public === animalId);
            const existingOffspring = myAnimals.filter(a => (litter.offspringIds_public || []).includes(a.id_public));
            const allLinked = [...existingOffspring, ...(addedAnimal ? [addedAnimal] : [])];
            // Only bump total born if linked count exceeds stored value ? never touch gender counts
            const newBorn = Math.max(litter.litterSizeBorn || 0, allLinked.length);

            // Update the litter's offspring list
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
                litterSizeBorn: newBorn || null,
                numberBorn: newBorn || null,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Update the animal's parents to match the litter's parents
            if (addedAnimal) {
                const parentPatch = { sireId_public: litter.sireId_public || null, damId_public: litter.damId_public || null };
                await axios.put(`${API_BASE_URL}/animals/${addedAnimal.id_public}`, parentPatch, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: addedAnimal.id_public, ...parentPatch } }));
            }
            
            // Optimistically add to offspring list immediately
            if (addedAnimal) {
                setLitterOffspringMap(prev => ({
                    ...prev,
                    [litter._id]: [...(prev[litter._id] || []), addedAnimal]
                }));
            }

            showModalMessage('Success', 'Animal linked to litter!');
            
            // Remove from available list
            setAvailableToLink({
                ...availableToLink,
                animals: availableToLink.animals.filter(a => a.id_public !== animalId)
            });
            
            // Refresh litters to show updated count without clearing offspring cache
            fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error linking animal to litter:', error);
            showModalMessage('Error', 'Failed to link animal to litter');
        }
    };

    const handleAddAllToLitter = async () => {
        try {
            if (!availableToLink.animals || availableToLink.animals.length === 0) return;
            const litter = availableToLink.litter;
            const animalIdsToAdd = availableToLink.animals.map(a => a.id_public);
            const updatedOffspringIds = [...(litter.offspringIds_public || []), ...animalIdsToAdd];
            const existingOffspring = myAnimals.filter(a => (litter.offspringIds_public || []).includes(a.id_public));
            const allLinked = [...existingOffspring, ...availableToLink.animals];
            // Only bump total born if linked count exceeds stored value ? never touch gender counts
            const newBorn = Math.max(litter.litterSizeBorn || 0, allLinked.length);

            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
                litterSizeBorn: newBorn || null,
                numberBorn: newBorn || null,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            // Optimistically add all to offspring list immediately
            setLitterOffspringMap(prev => ({
                ...prev,
                [litter._id]: [...(prev[litter._id] || []), ...availableToLink.animals]
            }));

            showModalMessage('Success', `${animalIdsToAdd.length} animal(s) linked to litter!`);
            
            // Clear available list
            setAvailableToLink({
                ...availableToLink,
                animals: []
            });
            
            // Refresh litters to show updated count without clearing offspring cache
            fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error linking animals to litter:', error);
            showModalMessage('Error', 'Failed to link animals to litter');
        }
    };

    const handleUnlinkOffspring = async (litter, animalId_public) => {
        if (!window.confirm('Remove this animal from the litter? The animal record will NOT be deleted ? only the link to this litter will be removed.')) return;
        try {
            const updatedOffspringIds = (litter.offspringIds_public || []).filter(id => id !== animalId_public);
            const remainingOffspring = (litterOffspringMap[litter._id] || []).filter(a => a.id_public !== animalId_public);
            // Only update the link list ? never modify gender counts or total born on unlink
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, {
                offspringIds_public: updatedOffspringIds,
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            // Optimistic update
            setLitterOffspringMap(prev => ({
                ...prev,
                [litter._id]: remainingOffspring
            }));
            fetchLitters({ preserveOffspring: true });
        } catch (error) {
            console.error('Error unlinking offspring:', error);
            showModalMessage('Error', 'Failed to unlink animal from litter.');
        }
    };

    const handleDeleteLitter = async (litterId) => {
        if (!window.confirm('Are you sure you want to delete this litter? This will not delete the animals, only the litter record.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/litters/${litterId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            showModalMessage('Success', 'Litter deleted successfully!');
            fetchLitters();
        } catch (error) {
            console.error('Error deleting litter:', error);
            showModalMessage('Error', 'Failed to delete litter');
        }
    };

    const handleRecalculateOffspringCounts = async () => {
        if (!window.confirm('This will recalculate offspring counts and gender tallies for all litters based on linked animals. Continue?')) {
            return;
        }

        try {
            setLoading(true);
            let updatedCount = 0;

            for (const litter of litters) {
                const linkedAnimals = myAnimals.filter(a => (litter.offspringIds_public || []).includes(a.id_public));
                const counts = calcLitterCounts(litter, linkedAnimals);

                const needsUpdate =
                    litter.numberBorn !== counts.numberBorn ||
                    (litter.litterSizeBorn || 0) !== counts.litterSizeBorn ||
                    litter.maleCount !== counts.maleCount ||
                    litter.femaleCount !== counts.femaleCount ||
                    litter.unknownCount !== counts.unknownCount;

                if (needsUpdate) {
                    await axios.put(`${API_BASE_URL}/litters/${litter._id}`, counts, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    updatedCount++;
                }
            }

            showModalMessage('Success', `Recalculated counts for ${updatedCount} litter(s)!`);
            fetchLitters();
        } catch (error) {
            console.error('Error recalculating offspring counts:', error);
            showModalMessage('Error', 'Failed to recalculate offspring counts');
        } finally {
            setLoading(false);
        }
    };

    const toggleAllPublic = async () => {
        const allPublic = filteredLitters.every(l => l.showOnPublicProfile);
        const newVal = !allPublic;
        setLitters(prev => prev.map(l =>
            filteredLitters.some(fl => fl._id === l._id) ? { ...l, showOnPublicProfile: newVal } : l
        ));
        try {
            await Promise.all(
                filteredLitters.map(l =>
                    axios.put(`${API_BASE_URL}/litters/${l._id}`, { showOnPublicProfile: newVal }, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    })
                )
            );
        } catch (err) {
            // Revert on failure
            setLitters(prev => prev.map(l =>
                filteredLitters.some(fl => fl._id === l._id) ? { ...l, showOnPublicProfile: !newVal } : l
            ));
        }
    };

    const toggleLitterPublic = async (litter) => {
        const newVal = !litter.showOnPublicProfile;
        setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, showOnPublicProfile: newVal } : l));
        try {
            await axios.put(`${API_BASE_URL}/litters/${litter._id}`, { showOnPublicProfile: newVal }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (err) {
            // Revert on failure
            setLitters(prev => prev.map(l => l._id === litter._id ? { ...l, showOnPublicProfile: !newVal } : l));
        }
    };

    const handleEditLitter = (litter) => {
        // Format birthDate and matingDate for date inputs
        // Date inputs expect YYYY-MM-DD format
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            try {
                // If it's already in YYYY-MM-DD format, return as-is
                if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
                    return dateString.split('T')[0];
                }
                // Otherwise parse and format
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            } catch (e) {
                return '';
            }
        };

        setEditingLitter(litter._id);
        setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
        setLitterImages(litter.images || []);
        // Restore cached parent animal objects for display (supports global animals)
        setSelectedSireAnimal(litter.sire || null);
        setSelectedDamAnimal(litter.dam || null);
        setFormData({
            breedingPairCodeName: litter.breedingPairCodeName || '',
            sireId_public: litter.sireId_public,
            damId_public: litter.damId_public,
            birthDate: formatDateForInput(litter.birthDate),
            maleCount: litter.maleCount || null,
            femaleCount: litter.femaleCount || null,
            unknownCount: litter.unknownCount || null,
            notes: litter.notes || '',
            linkedOffspringIds: litter.offspringIds_public || [],
            species: litter.sire?.species || litter.dam?.species || '',
            // Enhanced breeding record fields
            breedingMethod: litter.breedingMethod || 'Unknown',
            breedingConditionAtTime: litter.breedingConditionAtTime || '',
            matingDate: litter.matingDate || litter.pairingDate,
            outcome: litter.outcome || 'Unknown',
            birthMethod: litter.birthMethod || '',
            litterSizeBorn: litter.litterSizeBorn || litter.numberBorn || null,
            litterSizeWeaned: litter.litterSizeWeaned || litter.numberWeaned || null,
            stillbornCount: litter.stillbornCount || litter.stillborn || null,
            expectedDueDate: formatDateForInput(litter.expectedDueDate),
            weaningDate: formatDateForInput(litter.weaningDate)
        });
        setShowAddForm(true);
        setExpandedLitter(null);
    };

    const handleLitterImageUpload = async (file) => {
        if (litterImages.length >= 5) {
            showModalMessage('Error', 'Maximum of 5 images per litter');
            return;
        }
        // Show local preview immediately while uploading
        const localPreview = URL.createObjectURL(file);
        setLitterImages(prev => [...prev, { url: localPreview, r2Key: '__uploading__' }]);
        setLitterImageUploading(true);
        try {
            const compressedBlob = await compressImageToMaxSize(file, 480 * 1024, { maxWidth: 1920, maxHeight: 1920, startQuality: 0.85 });
            const fd = new FormData();
            fd.append('image', compressedBlob, file.name || 'litter-photo.jpg');
            const resp = await axios.post(`${API_BASE_URL}/litters/${editingLitter}/images`, fd, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            URL.revokeObjectURL(localPreview);
            setLitterImages(resp.data.images || []);
            setLitters(prev => prev.map(l => l._id === editingLitter || l.litterId_backend === editingLitter ? { ...l, images: resp.data.images } : l));
        } catch (err) {
            URL.revokeObjectURL(localPreview);
            setLitterImages(prev => prev.filter(img => img.r2Key !== '__uploading__'));
            showModalMessage('Error', err.response?.data?.message || 'Failed to upload image');
        } finally {
            setLitterImageUploading(false);
        }
    };

    const handleLitterImageDelete = async (r2Key) => {
        try {
            const resp = await axios.delete(`${API_BASE_URL}/litters/${editingLitter}/images/${encodeURIComponent(r2Key)}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLitterImages(resp.data.images || []);
            setLitters(prev => prev.map(l => l._id === editingLitter || l.litterId_backend === editingLitter ? { ...l, images: resp.data.images } : l));
        } catch (err) {
            showModalMessage('Error', err.response?.data?.message || 'Failed to delete image');
        }
    };

    const handleUpdateLitter = async (e) => {
        e.preventDefault();
        
        if (!formData.sireId_public || !formData.damId_public) {
            showModalMessage('Error', 'Please select both a Sire and a Dam');
            return;
        }

        try {
            // Get parent details ? fall back to cached selected animals for global (non-owned) ones
            const sire = myAnimals.find(a => a.id_public === formData.sireId_public) || selectedSireAnimal;
            const dam = myAnimals.find(a => a.id_public === formData.damId_public) || selectedDamAnimal;
            const offspringSpecies = sire?.species || dam?.species || formData.species || '';

            // Create offspring animals if requested
            const offspringPromises = [];
            const totalToCreate = parseInt(createOffspringCounts.males || 0) + parseInt(createOffspringCounts.females || 0) + parseInt(createOffspringCounts.unknown || 0);
            
            if (totalToCreate > 0) {
                // Need birthdate to create animals
                if (!formData.birthDate) {
                    showModalMessage('Error', 'Birth date is required to create new offspring animals');
                    return;
                }
                
                for (let i = 1; i <= parseInt(createOffspringCounts.males || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `M${i}`, species: offspringSpecies, gender: 'Male', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                for (let i = 1; i <= parseInt(createOffspringCounts.females || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `F${i}`, species: offspringSpecies, gender: 'Female', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
                for (let i = 1; i <= parseInt(createOffspringCounts.unknown || 0); i++) {
                    offspringPromises.push(axios.post(`${API_BASE_URL}/animals`, { name: `U${i}`, species: offspringSpecies, gender: 'Unknown', birthDate: formData.birthDate, status: 'Pet', fatherId_public: formData.sireId_public, motherId_public: formData.damId_public, isOwned: true, breederId_public: userProfile.id_public, ownerId_public: userProfile.id_public }, { headers: { Authorization: `Bearer ${authToken}` } }));
                }
            }
            
            const createdAnimals = await Promise.all(offspringPromises);
            const newOffspringIds = createdAnimals.map(response => response.data.id_public);
            const allOffspringIds = [...newOffspringIds, ...(formData.linkedOffspringIds || [])];

            // Reconcile counts against logic model before saving
            const linkedForUpdate = myAnimals.filter(a => allOffspringIds.includes(a.id_public));
            const { correctedCounts: updateCounts, warnings: updateWarnings } = reconcileLitterFormCounts(formData, linkedForUpdate);
            if (updateWarnings.length > 0) {
                const proceed = window.confirm(`Warning:\n${updateWarnings.join('\n')}\n\nSave anyway?`);
                if (!proceed) return;
            }

            await axios.put(`${API_BASE_URL}/litters/${editingLitter}`, {
                breedingPairCodeName: formData.breedingPairCodeName,
                sireId_public: formData.sireId_public,
                damId_public: formData.damId_public,
                birthDate: formData.birthDate,
                notes: formData.notes,
                offspringIds_public: allOffspringIds,
                ...updateCounts,
                // Enhanced breeding record fields
                // Use || null / || 'Unknown' to prevent sending empty strings
                // into strict enum fields, which causes a 500 validation error.
                breedingMethod: formData.breedingMethod || 'Unknown',
                breedingConditionAtTime: formData.breedingConditionAtTime || null,
                matingDate: formData.matingDate || null,
                expectedDueDate: formData.expectedDueDate || null,
                outcome: formData.outcome || 'Unknown',
                birthMethod: formData.birthMethod || null,
                litterSizeWeaned: formData.litterSizeWeaned || null,
                stillbornCount: formData.stillbornCount || null,
                weaningDate: formData.weaningDate || null
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Update all linked offspring to have the correct parents
            const linkedOffspringIds = formData.linkedOffspringIds || [];
            if (linkedOffspringIds.length > 0) {
                const parentPatch = { sireId_public: formData.sireId_public || null, damId_public: formData.damId_public || null };
                const updateOffspringPromises = linkedOffspringIds.map(offspringId =>
                    axios.put(`${API_BASE_URL}/animals/${offspringId}`, parentPatch, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).then(() => window.dispatchEvent(new CustomEvent('animal-updated', { detail: { id_public: offspringId, ...parentPatch } })))
                );
                await Promise.all(updateOffspringPromises);
            }

            showModalMessage('Success', 'Litter updated successfully!');
            setShowAddForm(false);
            setEditingLitter(null);
            setLitterImages([]);
            setSelectedSireAnimal(null);
            setSelectedDamAnimal(null);
            setFormData({
                breedingPairCodeName: '',
                sireId_public: '',
                damId_public: '',
                species: '',
                otherParent1Id_public: '',
                otherParent1Role: '',
                birthDate: '',
                maleCount: null,
                femaleCount: null,
                notes: '',
                linkedOffspringIds: [],
                // Enhanced breeding record fields
                breedingMethod: 'Unknown',
                breedingConditionAtTime: '',
                matingDate: '',
                expectedDueDate: '',
                outcome: 'Unknown',
                birthMethod: '',
                litterSizeBorn: null,
                litterSizeWeaned: null,
                stillbornCount: null,
                weaningDate: ''
            });
            setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
            // setSireSearch('');
            // setDamSearch('');
            // setSireSpeciesFilter('');
            // setDamSpeciesFilter('');
            setPredictedCOI(null);
            fetchLitters();
            fetchMyAnimals();
        } catch (error) {
            console.error('Error updating litter:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update litter');
        }
    };

    const handleAddOffspringToLitter = (litter) => {
        const sire = myAnimals.find(a => a.id_public === litter.sireId_public);
        setAddingOffspring(litter);
        setNewOffspringData({
            name: '',
            gender: '',
            color: '',
            coat: '',
            remarks: ''
        });
    };

    const handleSaveNewOffspring = async () => {
        if (!newOffspringData.name || !newOffspringData.gender) {
            showModalMessage('Error', 'Name and gender are required');
            return;
        }

        try {
            // Fall back to litter's populated sire/dam data for global animals
            const sire = myAnimals.find(a => a.id_public === addingOffspring.sireId_public);
            const offspringSpecies = sire?.species || addingOffspring.sire?.species || addingOffspring.dam?.species || '';
            
            const animalData = {
                name: newOffspringData.name,
                species: offspringSpecies,
                gender: newOffspringData.gender,
                birthDate: addingOffspring.birthDate,
                status: 'Pet',
                fatherId_public: addingOffspring.sireId_public,
                motherId_public: addingOffspring.damId_public,
                color: newOffspringData.color || null,
                coat: newOffspringData.coat || null,
                remarks: newOffspringData.remarks || null,
                isOwned: true,
                breederId_public: userProfile.id_public,
                ownerId_public: userProfile.id_public
            };

            const response = await axios.post(`${API_BASE_URL}/animals`, animalData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const newAnimalId = response.data.id_public;

            // Calculate inbreeding coefficient in the background ? don't block the save
            axios.get(`${API_BASE_URL}/animals/${newAnimalId}/inbreeding`, {
                params: { generations: 50 },
                headers: { Authorization: `Bearer ${authToken}` }
            }).catch(() => {});

            // Link to litter and recalculate gender + total counts
            const updatedOffspringIds = [...(addingOffspring.offspringIds_public || []), newAnimalId];
            const existingOffspring = myAnimals.filter(a => (addingOffspring.offspringIds_public || []).includes(a.id_public));
            const allLinked = [...existingOffspring, { gender: newOffspringData.gender }];
            const counts = calcLitterCounts(addingOffspring, allLinked);

            await axios.put(`${API_BASE_URL}/litters/${addingOffspring._id}`, {
                offspringIds_public: updatedOffspringIds,
                ...counts
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Optimistically add the new animal to the offspring list immediately
            // so it appears in the UI without waiting for the full fetchLitters() refetch.
            const newAnimal = response.data;
            setLitterOffspringMap(prev => ({
                ...prev,
                [addingOffspring._id]: [...(prev[addingOffspring._id] || []), newAnimal]
            }));

            showModalMessage('Success', 'Offspring added to litter!');
            setAddingOffspring(null);
            fetchLitters({ preserveOffspring: true });
            fetchMyAnimals();
        } catch (error) {
            console.error('Error adding offspring:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to add offspring');
        }
    };

    const maleAnimals = myAnimals.filter(a => a.gender === 'Male');
    const femaleAnimals = myAnimals.filter(a => a.gender === 'Female');
    const availableYears = useMemo(() => {
        const years = litters
            .map(litter => litter.birthDate || litter.matingDate || litter.pairingDate)
            .filter(Boolean)
            .map(dateStr => {
                const parsedDate = new Date(dateStr);
                return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getFullYear();
            })
            .filter(Boolean);
        const uniqueYears = [...new Set(years)];
        uniqueYears.sort((a, b) => b - a);
        return uniqueYears;
    }, [litters]);
    
    // Filtered animals are handled directly in the render sections below
    
    // Get unique species from all animals (currently for debugging)
    // const allSpecies = [...new Set(myAnimals.map(a => a.species).filter(Boolean))].sort();
    
    // Filter litters based on search query and species
    const filteredLitters = litters.filter(litter => {
        // Use populated parent data first (covers transferred/hidden animals), fall back to myAnimals
        const sire = litter.sire || myAnimals.find(a => a.id_public === litter.sireId_public);
        const dam  = litter.dam  || myAnimals.find(a => a.id_public === litter.damId_public);
        
        // Species filter
        if (speciesFilter) {
            if (sire?.species !== speciesFilter) return false;
        }

        // Year filter (birthDate fallback to matingDate/pairingDate)
        if (yearFilter) {
            const referenceDate = litter.birthDate || litter.matingDate || litter.pairingDate;
            if (!referenceDate) return false;
            const parsedDate = new Date(referenceDate);
            const litterYear = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getFullYear();
            if (!litterYear || litterYear.toString() !== yearFilter) return false;
        }
        
        // Search filter
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        
        // Search by CTL-ID
        if (litter.litter_id_public && litter.litter_id_public.toLowerCase().includes(query)) return true;
        
        // Search by litter name
        if (litter.breedingPairCodeName && litter.breedingPairCodeName.toLowerCase().includes(query)) return true;
        
        // Search by sire name or ID
        if (sire?.name?.toLowerCase().includes(query)) return true;
        if (sire?.id_public?.toString().includes(query)) return true;
        if (litter.sireId_public?.toString().includes(query)) return true;
        
        // Search by dam name or ID
        if (dam?.name?.toLowerCase().includes(query)) return true;
        if (dam?.id_public?.toString().includes(query)) return true;
        if (litter.damId_public?.toString().includes(query)) return true;
        
        return false;
    }).sort((a, b) => {
        // Sort order: Mated (isPlanned + past matingDate) ? Planned-only ? Born (newest first)
        const today = new Date();
        const aIsMated = a.isPlanned && a.matingDate && new Date(a.matingDate) <= today;
        const bIsMated = b.isPlanned && b.matingDate && new Date(b.matingDate) <= today;
        const aIsPlannedOnly = a.isPlanned && !aIsMated;
        const bIsPlannedOnly = b.isPlanned && !bIsMated;
        const rank = (l, isMated, isPlannedOnly) => isMated ? 0 : isPlannedOnly ? 1 : 2;
        const aRank = rank(a, aIsMated, aIsPlannedOnly);
        const bRank = rank(b, bIsMated, bIsPlannedOnly);
        if (aRank !== bRank) return aRank - bRank;
        // Within same group: newest date first
        const aDate = (a.birthDate || a.matingDate) ? new Date(a.birthDate || a.matingDate).getTime() : null;
        const bDate = (b.birthDate || b.matingDate) ? new Date(b.birthDate || b.matingDate).getTime() : null;
        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        return bDate - aDate;
    });

    const litterStats = filteredLitters.reduce((acc, l) => {
        acc.litters++;
        acc.males   += l.maleCount   ?? 0;
        acc.females += l.femaleCount ?? 0;
        acc.unknown += l.unknownCount ?? 0;
        return acc;
    }, { litters: 0, males: 0, females: 0, unknown: 0 });

    return (
        <div className="w-full max-w-7xl bg-white p-3 sm:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-dark" />
                    Litter Management
                </h2>
                <div className="flex gap-2 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <BookOpen size={14} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors border-l border-gray-200 ${viewMode === 'calendar' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Calendar size={14} /> Calendar
                        </button>
                    </div>
                    {/* Urgency Alerts Toggle */}
                    <button
                        onClick={toggleUrgency}
                        title={urgencyEnabled ? 'Urgency alerts on ? click to disable' : 'Urgency alerts off ? click to enable'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border shadow-sm transition-colors ${urgencyEnabled ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                        <Bell size={14} />
                        <span className="hidden sm:inline">Alerts {urgencyEnabled ? 'On' : 'Off'}</span>
                    </button>
                    {/* Test Pairing Button */}
                    <button
                        onClick={() => {
                            setShowTestPairingModal(true);
                            setTpSireId('');
                            setTpDamId('');
                            setTpCOI(null);
                            setTpError(null);
                            setTpCalculating(false);
                            setTpMode('coi');
                            setTpSourceMode('mine');
                            setTpTargetSpecies(TARGET_OUTCOME_PROTOTYPE_SPECIES);
                            setTpSelectedTraits([]);
                            setTpMockResults([]);
                            setTpGenerating(false);
                            setTpExpandedCard(null);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border shadow-sm bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Test a sire/dam pairing to predict COI"
                    >
                        <Calculator size={14} />
                        <span className="hidden sm:inline">Test Pairing</span>
                    </button>
                    <button
                        onClick={handleRecalculateOffspringCounts}
                        className="bg-primary hover:bg-primary/90 text-black font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg flex items-center"
                        title="Recalculate offspring counts for all litters"
                    >
                        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {/* + Mating / + Litter ? grouped so they never split across rows */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        {/* Mating button */}
                        <button
                            onClick={() => {
                                if (!showAddMatingForm) { setShowAddForm(false); setEditingLitter(null); setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 }); }
                                setShowAddMatingForm(!showAddMatingForm);
                                if (showAddMatingForm) resetMatingForm();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-r border-gray-200 ${showAddMatingForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-black hover:bg-primary-dark'}`}
                            title="Record a planned mating"
                        >
                            {showAddMatingForm ? <X size={14} /> : <Plus size={14} />}
                            <span>Mating</span>
                        </button>
                        {/* Litter button */}
                        <button
                            onClick={() => {
                                if (showAddForm) {
                                    setEditingLitter(null);
                                    setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
                                    setPredictedCOI(null);
                                    setFormData({
                                        breedingPairCodeName: '',
                                        sireId_public: '',
                                        damId_public: '',
                                        otherParent1Id_public: '',
                                        otherParent1Role: '',
                                        otherParent2Id_public: '',
                                        otherParent2Role: '',
                                        birthDate: '',
                                        maleCount: '',
                                        femaleCount: '',
                                        notes: '',
                                        linkedOffspringIds: []
                                    });
                                }
                                if (!showAddForm) setShowAddMatingForm(false);
                                setShowAddForm(!showAddForm);
                            }}
                            data-tutorial-target="new-litter-btn"
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${showAddForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary text-black hover:bg-primary-dark'}`}
                        >
                            {showAddForm ? <X size={14} /> : <Plus size={14} />}
                            <span>Litter</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4 sm:mb-6 pl-0.5">
                <span><span className="font-semibold text-gray-700">{litterStats.litters}</span> Litters</span>
                <span className="text-gray-300">|</span>
                <span><span className="font-semibold text-blue-600">{litterStats.males}</span> Males</span>
                <span className="text-gray-300">|</span>
                <span><span className="font-semibold text-pink-500">{litterStats.females}</span> Females</span>
                <span className="text-gray-300">|</span>
                <span><span className="font-semibold text-gray-500">{litterStats.unknown}</span> Unknown</span>
            </div>

            {loading && litters.length === 0 && (
                /* Skeleton litter cards ? shown only until first fetch completes */
                <div className="space-y-3 animate-pulse mt-2">
                    {[0,1,2,3].map(i => (
                        <div key={i} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-5 w-40 bg-gray-200 rounded" />
                                <div className="h-5 w-20 bg-gray-200 rounded" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="h-4 bg-gray-100 rounded" />
                                <div className="h-4 bg-gray-100 rounded" />
                                <div className="h-4 bg-gray-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Litter Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-xl font-bold text-gray-800">{editingLitter ? 'Edit Litter' : 'Create New Litter'}</h3>
                            <button 
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingLitter(null);
                                    setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
                                    setSelectedSireAnimal(null);
                                    setSelectedDamAnimal(null);
                                    setShowSpeciesPicker(false);
                                }}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4">
                            <form onSubmit={editingLitter ? handleUpdateLitter : handleSubmit} id="litter-form" className="space-y-4">
                                {/* Litter Photos ? top of form, always visible for born litters */}
                                {(editingLitter ? (() => { const tl = litters.find(l => l._id === editingLitter || l.litterId_backend === editingLitter); return tl && !tl.isPlanned; })() : true) && (
                                    <div className="mb-2 p-4 border border-amber-200 rounded-lg bg-amber-50">
                                        <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Camera size={16} className="inline-block align-middle mr-1" /> Litter Photos
                                            <span className="text-xs font-normal text-gray-400">({editingLitter ? litterImages.filter(i => i.r2Key !== '__uploading__').length : pendingLitterImages.length}/5)</span>
                                        </h4>

                                        {/* Thumbnail grid */}
                                        {editingLitter ? (
                                            litterImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {litterImages.map((img, idx) => (
                                                        <div key={img.r2Key || idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                                                            <img src={img.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                                            {img.r2Key === '__uploading__' ? (
                                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                                                    <Hourglass size={12} className="inline-block align-middle text-white" />
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleLitterImageDelete(img.r2Key)}
                                                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Remove photo"
                                                            ><X size={14} /></button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        ) : (
                                            pendingLitterImages.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {pendingLitterImages.map((item, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                                                            <img src={item.previewUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    URL.revokeObjectURL(item.previewUrl);
                                                                    setPendingLitterImages(prev => prev.filter((_, i) => i !== idx));
                                                                }}
                                                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Remove photo"
                                            ><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* Upload button */}
                                        {(editingLitter ? litterImages.length : pendingLitterImages.length) < 5 && (
                                            <label className={`flex items-center gap-2 px-3 py-2 border-2 border-dashed border-amber-400 rounded-lg cursor-pointer hover:bg-amber-100 transition w-fit text-sm font-medium text-amber-700 ${litterImageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (editingLitter) {
                                                            handleLitterImageUpload(file);
                                                        } else {
                                                            if (pendingLitterImages.length >= 5) return;
                                                            const previewUrl = URL.createObjectURL(file);
                                                            setPendingLitterImages(prev => [...prev, { file, previewUrl }]);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                                {litterImageUploading ? <><Loader2 size={14} className="inline-block align-middle animate-spin mr-1" />Uploading?</> : '+ Add Photo'}
                                            </label>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">{editingLitter ? 'PNG or JPEG, max 500 KB each. Up to 5 photos.' : 'Photos will be uploaded when you save the litter.'}</p>
                                    </div>
                                )}

                                {/* Auto-assigned CTL-ID (read-only) */}
                                {editingLitter && editingLitter.litter_id_public && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            System Litter ID (CTL-ID)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingLitter.litter_id_public}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Auto-assigned for system linkage</p>
                                    </div>
                                )}
                                
                                {/* Litter Name - Full Width */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Litter Name/ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.breedingPairCodeName}
                                        onChange={(e) => setFormData({...formData, breedingPairCodeName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., Summer 2025 Litter A, Disney's Hakuna Matata"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Your custom name for this breeding pair</p>
                                </div>

                                {/* Species Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Species {!editingLitter && <span className="text-red-500">*</span>}
                                        {editingLitter && <span className="ml-1 text-xs text-gray-400 font-normal">(locked ? cannot change on edit)</span>}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => !editingLitter && setShowSpeciesPicker(true)}
                                        disabled={!!editingLitter}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-left transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                                            editingLitter
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75'
                                                : 'bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        {formData.species ? (
                                            <span className="font-medium text-gray-800">{formData.species}</span>
                                        ) : (
                                            <span className="text-gray-400">Click to select species...</span>
                                        )}
                                    </button>
                                    {!editingLitter && <p className="text-xs text-gray-500 mt-1">Choose species to filter the sire &amp; dam search</p>}
                                </div>

                                {/* Sire & Dam Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Sire Selection */}
                                    <div data-tutorial-target="sire-dam-section">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sire (Father) {!editingLitter && <span className="text-red-500">*</span>}
                                            {editingLitter && <span className="ml-1 text-xs text-gray-400 font-normal">(locked)</span>}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => !editingLitter && setModalTarget('sire-litter')}
                                            disabled={!!editingLitter || !formData.species}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed${editingLitter ? '' : ' hover:bg-gray-50'}`}
                                        >
                                            {formData.sireId_public ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {myAnimals.find(a => a.id_public === formData.sireId_public)?.name || selectedSireAnimal?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formData.sireId_public}
                                                        </div>
                                                    </div>
                                                    {!myAnimals.find(a => a.id_public === formData.sireId_public) && selectedSireAnimal && (
                                                        <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">{formData.species ? 'Select Sire...' : 'Select species first'}</div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Dam Selection */}
                                    <div data-tutorial-target="sire-dam-section">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dam (Mother) {!editingLitter && <span className="text-red-500">*</span>}
                                            {editingLitter && <span className="ml-1 text-xs text-gray-400 font-normal">(locked)</span>}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => !editingLitter && setModalTarget('dam-litter')}
                                            disabled={!!editingLitter || !formData.species}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed${editingLitter ? '' : ' hover:bg-gray-50'}`}
                                        >
                                            {formData.damId_public ? (
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {myAnimals.find(a => a.id_public === formData.damId_public)?.name || selectedDamAnimal?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formData.damId_public}
                                                        </div>
                                                    </div>
                                                    {!myAnimals.find(a => a.id_public === formData.damId_public) && selectedDamAnimal && (
                                                        <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">{formData.species ? 'Select Dam...' : 'Select species first'}</div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Breeding Information */}
                                <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                                        <Dna size={18} className="inline-block align-middle text-purple-600 mr-2 flex-shrink-0" />Breeding Information
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {/* Breeding Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Breeding Method
                                            </label>
                                            <select
                                                value={formData.breedingMethod || 'Unknown'}
                                                onChange={(e) => setFormData({...formData, breedingMethod: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="Natural">Natural</option>
                                                <option value="AI">Artificial Insemination</option>
                                                <option value="Assisted">Assisted</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>

                                        {/* Breeding Condition */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Breeding Condition
                                            </label>
                                            <select
                                                value={formData.breedingConditionAtTime || ''}
                                                onChange={(e) => setFormData({...formData, breedingConditionAtTime: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Condition...</option>
                                                <option value="Good">Good</option>
                                                <option value="Okay">Okay</option>
                                                <option value="Poor">Poor</option>
                                            </select>
                                        </div>

                                        {/* Outcome Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Breeding Outcome
                                            </label>
                                            <select
                                                value={formData.outcome || 'Unknown'}
                                                onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="Successful">Successful</option>
                                                <option value="Unsuccessful">Unsuccessful</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Mating Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mating Date
                                            </label>
                                            <DatePicker
                                                value={formData.matingDate || ''}
                                                onChange={(e) => setFormData({...formData, matingDate: e.target.value})}
                                                maxDate={new Date()}
                                                className="px-3 py-2"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">Use + Mating to schedule a future mating</p>
                                        </div>

                                        {/* Expected Due Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Expected Due Date
                                            </label>
                                            <DatePicker
                                                value={formData.expectedDueDate || ''}
                                                onChange={(e) => setFormData({...formData, expectedDueDate: e.target.value})}
                                                className="px-3 py-2"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Optional ? shows on calendar</p>
                                        </div>

                                        {/* Birth Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Birth Method
                                            </label>
                                            <select
                                                value={formData.birthMethod || ''}
                                                onChange={(e) => setFormData({...formData, birthMethod: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Method...</option>
                                                <option value="Natural">Natural</option>
                                                <option value="C-Section">C-Section</option>
                                                <option value="Assisted">Assisted</option>
                                                <option value="Induced">Induced</option>
                                                <option value="Unknown">Unknown</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Birth Date & Offspring Counts */}
                                <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
                                        <Baby size={18} className="inline-block align-middle text-green-600 mr-2 flex-shrink-0" />Birth & Offspring Details
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4" data-tutorial-target="litter-dates-counts">
                                        {/* Birth Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Birth Date (Optional)
                                            </label>
                                            <DatePicker
                                                value={formData.birthDate}
                                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                                maxDate={new Date()}
                                                className="px-3 py-2"
                                            />
                                        </div>

                                        {/* Total Born - auto-computed from male + female + unknown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total Born <span className="text-xs text-gray-400 font-normal">(auto)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={typeof formData.litterSizeBorn === 'number' ? formData.litterSizeBorn : (formData.litterSizeBorn || '')}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                                placeholder="Set counts below"
                                            />
                                        </div>

                                        {/* Stillborn Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stillborn
                                            </label>
                                            <input
                                                type="number"
                                                value={typeof formData.stillbornCount === 'number' ? formData.stillbornCount : (formData.stillbornCount || '')}
                                                onChange={(e) => setFormData({...formData, stillbornCount: e.target.value ? parseInt(e.target.value) : null})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>

                                        {/* Total Weaned */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total Weaned
                                            </label>
                                            <input
                                                type="number"
                                                value={typeof formData.litterSizeWeaned === 'number' ? formData.litterSizeWeaned : (formData.litterSizeWeaned || '')}
                                                onChange={(e) => setFormData({...formData, litterSizeWeaned: e.target.value ? parseInt(e.target.value) : null})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Weaning Date */}
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Weaning Date
                                            </label>
                                            <DatePicker
                                                value={formData.weaningDate || ''}
                                                onChange={(e) => setFormData({...formData, weaningDate: e.target.value})}
                                                className="px-3 py-2"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Optional ? shows on calendar</p>
                                        </div>
                                    </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Male Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Males</label>
                                            <input
                                                type="number"
                                                value={typeof formData.maleCount === 'number' ? formData.maleCount : (formData.maleCount || '')}
                                                onChange={(e) => {
                                                    const v = e.target.value ? parseInt(e.target.value) : null;
                                                    const f = formData.femaleCount || 0;
                                                    const u = formData.unknownCount || 0;
                                                    setFormData({...formData, maleCount: v, litterSizeBorn: (v || 0) + f + u || null});
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min={myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Male').length || 0}
                                            />
                                            {(() => { const lm = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Male').length; return lm > 0 && (formData.maleCount || 0) < lm ? (<p className="text-xs text-red-600 mt-1">? {lm} male{lm > 1 ? 's' : ''} linked ? can't be below {lm}</p>) : lm > 0 ? (<p className="text-xs text-gray-500 mt-1">{lm} male{lm > 1 ? 's' : ''} linked</p>) : null; })()}
                                        </div>

                                        {/* Female Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Females</label>
                                            <input
                                                type="number"
                                                value={typeof formData.femaleCount === 'number' ? formData.femaleCount : (formData.femaleCount || '')}
                                                onChange={(e) => {
                                                    const v = e.target.value ? parseInt(e.target.value) : null;
                                                    const m = formData.maleCount || 0;
                                                    const u = formData.unknownCount || 0;
                                                    setFormData({...formData, femaleCount: v, litterSizeBorn: m + (v || 0) + u || null});
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min={myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Female').length || 0}
                                            />
                                            {(() => { const lf = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Female').length; return lf > 0 && (formData.femaleCount || 0) < lf ? (<p className="text-xs text-red-600 mt-1">? {lf} female{lf > 1 ? 's' : ''} linked ? can't be below {lf}</p>) : lf > 0 ? (<p className="text-xs text-gray-500 mt-1">{lf} female{lf > 1 ? 's' : ''} linked</p>) : null; })()}
                                        </div>

                                        {/* Unknown/Intersex Count */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unknown / Intersex</label>
                                            <input
                                                type="number"
                                                value={typeof formData.unknownCount === 'number' ? formData.unknownCount : (formData.unknownCount || '')}
                                                onChange={(e) => {
                                                    const v = e.target.value ? parseInt(e.target.value) : null;
                                                    const m = formData.maleCount || 0;
                                                    const f = formData.femaleCount || 0;
                                                    setFormData({...formData, unknownCount: v, litterSizeBorn: m + f + (v || 0) || null});
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="0"
                                                min={myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && (a.gender === 'Unknown' || a.gender === 'Intersex' || !a.gender)).length || 0}
                                            />
                                            {(() => { const lu = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && (a.gender === 'Unknown' || a.gender === 'Intersex' || !a.gender)).length; return lu > 0 && (formData.unknownCount || 0) < lu ? (<p className="text-xs text-red-600 mt-1">? {lu} unknown linked ? can't be below {lu}</p>) : lu > 0 ? (<p className="text-xs text-gray-500 mt-1">{lu} unknown linked</p>) : null; })()}
                                        </div>
                                    </div>

                                    {/* Total Born (auto-computed) */}
                                    {formData.litterSizeBorn > 0 && (
                                        <div className="mt-2 p-2 rounded-md bg-green-50 border border-green-200">
                                            <p className="text-xs text-green-800"><Hash size={12} className="inline-block align-middle mr-0.5" /> <strong>Total Born auto-set to {formData.litterSizeBorn}</strong> ({formData.maleCount || 0}M + {formData.femaleCount || 0}F + {formData.unknownCount || 0}U)</p>
                                        </div>
                                    )}
                                </div>

                                {/* Link Existing Offspring */}
                                {formData.sireId_public && formData.damId_public && (
                                    <div className="mb-4 border-t pt-4" data-tutorial-target="litter-offspring-sections">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link Existing Animals as Offspring
                                        </label>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-3">
                                                Select animals with matching parents to link them to this litter. {formData.birthDate ? 'Only animals with matching birth date are shown.' : 'Birth date will be filled automatically from selected animals.'}
                                            </p>
                                            <div className="space-y-2">
                                                {myAnimals
                                                    .filter(animal => {
                                                        const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                                        const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                                        
                                                        // If litter has birthdate, only show animals with matching birthdate
                                                        if (formData.birthDate && animal.birthDate) {
                                                            const litterDate = formData.birthDate.split('T')[0];
                                                            const animalDate = animal.birthDate.split('T')[0];
                                                            return matchesSire && matchesDam && litterDate === animalDate;
                                                        }
                                                        
                                                        return matchesSire && matchesDam;
                                                    })
                                                    .map(animal => (
                                                        <label key={animal.id_public} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.linkedOffspringIds?.includes(animal.id_public)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        // Check if litter has a birthdate and animal has a different birthdate
                                                                        if (formData.birthDate && animal.birthDate) {
                                                                            const litterDate = formData.birthDate.split('T')[0];
                                                                            const animalDate = animal.birthDate.split('T')[0];
                                                                            
                                                                            if (litterDate !== animalDate) {
                                                                                const confirmChange = window.confirm(
                                                                                    `This animal has a different birth date (${animalDate}) than the litter (${litterDate}).\n\n` +
                                                                                    `Click OK to update the litter birth date to match the animal's date, or Cancel to abort linking.`
                                                                                );
                                                                                
                                                                                if (!confirmChange) {
                                                                                    // User cancelled, abort the link
                                                                                    return;
                                                                                }
                                                                                
                                                                                // User accepted, update litter birthdate and link the animal
                                                                                setFormData({
                                                                                    ...formData,
                                                                                    birthDate: animalDate,
                                                                                    linkedOffspringIds: [...(formData.linkedOffspringIds || []), animal.id_public]
                                                                                });
                                                                                return;
                                                                            }
                                                                        }
                                                                        
                                                                        // Normal linking flow
                                                                        const newLinked = [...(formData.linkedOffspringIds || []), animal.id_public];
                                                                        const newFormData = { ...formData, linkedOffspringIds: newLinked };
                                                                        
                                                                        // Auto-fill birthdate from offspring if litter has no birthdate
                                                                        if (!formData.birthDate && animal.birthDate) {
                                                                            newFormData.birthDate = animal.birthDate.split('T')[0];
                                                                        }
                                                                        
                                                                        setFormData(newFormData);
                                                                    } else {
                                                                        // Unlinking
                                                                        const newLinked = (formData.linkedOffspringIds || []).filter(id => id !== animal.id_public);
                                                                        setFormData({ ...formData, linkedOffspringIds: newLinked });
                                                                    }
                                                                }}
                                                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                            />
                                                            <span className="text-sm text-gray-800">
                                                                {animal.prefix && `${animal.prefix} `}{animal.name}{animal.suffix && ` ${animal.suffix}`} - {animal.id_public} ({animal.gender}{animal.birthDate ? `, ${new Date(animal.birthDate).toLocaleDateString()}` : ''})
                                                            </span>
                                                        </label>
                                                    ))
                                                }
                                                {myAnimals.filter(animal => {
                                                    const matchesSire = animal.fatherId_public === formData.sireId_public || animal.sireId_public === formData.sireId_public;
                                                    const matchesDam = animal.motherId_public === formData.damId_public || animal.damId_public === formData.damId_public;
                                                    
                                                    // If litter has birthdate, only show animals with matching birthdate
                                                    if (formData.birthDate && animal.birthDate) {
                                                        const litterDate = formData.birthDate.split('T')[0];
                                                        const animalDate = animal.birthDate.split('T')[0];
                                                        return matchesSire && matchesDam && litterDate === animalDate;
                                                    }
                                                    
                                                    return matchesSire && matchesDam;
                                                }).length === 0 && (
                                                    <p className="text-xs text-gray-500 italic">No matching animals found</p>
                                                )}
                                                {formData.linkedOffspringIds?.length > 0 && (
                                                    <p className="text-xs text-green-600 font-semibold mt-2">
                                                        {formData.linkedOffspringIds.length} animal(s) selected
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Create New Offspring */}
                                {formData.sireId_public && formData.damId_public && formData.birthDate && (
                                    <div className="mb-4 border-t pt-4" data-tutorial-target="litter-offspring-sections">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Create New Offspring Animals
                                        </label>
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-800 mb-3">
                                                <strong>Create placeholder animals:</strong> Created with names M1, M2? / F1, F2? You can edit names and details after saving.
                                            </p>
                                            {(() => {
                                                const linkedMales = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Male').length;
                                                const linkedFemales = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && a.gender === 'Female').length;
                                                const linkedUnknown = myAnimals.filter(a => formData.linkedOffspringIds?.includes(a.id_public) && (a.gender === 'Unknown' || a.gender === 'Intersex' || !a.gender)).length;
                                                const totalMales = formData.maleCount || 0;
                                                const totalFemales = formData.femaleCount || 0;
                                                const totalUnknown = formData.unknownCount || 0;
                                                const remainingMales = Math.max(0, totalMales - linkedMales);
                                                const remainingFemales = Math.max(0, totalFemales - linkedFemales);
                                                const remainingUnknown = Math.max(0, totalUnknown - linkedUnknown);
                                                const hasCountInfo = totalMales > 0 || totalFemales > 0 || totalUnknown > 0;
                                                return (
                                                    <>
                                                        {hasCountInfo && (
                                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                                {totalMales > 0 && (
                                                                    <div className="bg-white rounded-lg border border-blue-200 p-3">
                                                                        <div className="flex items-center gap-1 mb-1">
                                                                            <Mars size={13} className="text-blue-500" />
                                                                            <span className="text-blue-600 font-bold text-sm">Males</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 space-y-0.5">
                                                                            <div>Total set: <span className="font-semibold">{totalMales}</span></div>
                                                                            <div>Already linked: <span className="font-semibold">{linkedMales}</span></div>
                                                                            <div>Remaining: <span className={`font-bold ${remainingMales > 0 ? 'text-blue-600' : 'text-green-600'}`}>{remainingMales}</span></div>
                                                                        </div>
                                                                        {remainingMales > 0 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setCreateOffspringCounts(c => ({...c, males: remainingMales.toString()}))}
                                                                                className="mt-2 w-full px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded transition"
                                                                            >
                                                                                + Add {remainingMales} remaining male{remainingMales > 1 ? 's' : ''}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {totalFemales > 0 && (
                                                                    <div className="bg-white rounded-lg border border-pink-200 p-3">
                                                                        <div className="flex items-center gap-1 mb-1">
                                                                            <Venus size={13} className="text-pink-500" />
                                                                            <span className="text-pink-600 font-bold text-sm">Females</span>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 space-y-0.5">
                                                                            <div>Total set: <span className="font-semibold">{totalFemales}</span></div>
                                                                            <div>Already linked: <span className="font-semibold">{linkedFemales}</span></div>
                                                                            <div>Remaining: <span className={`font-bold ${remainingFemales > 0 ? 'text-pink-600' : 'text-green-600'}`}>{remainingFemales}</span></div>
                                                                        </div>
                                                                        {remainingFemales > 0 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setCreateOffspringCounts(c => ({...c, females: remainingFemales.toString()}))}
                                                                                className="mt-2 w-full px-2 py-1 bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-semibold rounded transition"
                                                                            >
                                                                                + Add {remainingFemales} remaining female{remainingFemales > 1 ? 's' : ''}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {hasCountInfo && (remainingMales > 0 || remainingFemales > 0 || remainingUnknown > 0) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setCreateOffspringCounts({ males: remainingMales.toString(), females: remainingFemales.toString(), unknown: remainingUnknown.toString() })}
                                                                className="w-full mb-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition"
                                                            >
                                                                Fill all remaining ({remainingMales}M + {remainingFemales}F + {remainingUnknown}U = {remainingMales + remainingFemales + remainingUnknown} animals)
                                                            </button>
                                                        )}
                                                        {!hasCountInfo && (
                                                            <p className="text-xs text-gray-500 italic">Set the male, female, and unknown counts above to see smart creation options.</p>
                                                        )}
                                                        {hasCountInfo && remainingMales === 0 && remainingFemales === 0 && remainingUnknown === 0 && (
                                                            <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={13} /> All offspring are accounted for via linked animals.</p>
                                                        )}
                                                        {(parseInt(createOffspringCounts.males || 0) > 0 || parseInt(createOffspringCounts.females || 0) > 0 || parseInt(createOffspringCounts.unknown || 0) > 0) && (
                                                            <p className="text-xs text-green-600 font-semibold mt-2">
                                                                Will create {(parseInt(createOffspringCounts.males || 0)) + (parseInt(createOffspringCounts.females || 0)) + (parseInt(createOffspringCounts.unknown || 0))} new animal(s)
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows="3"
                                        placeholder="Additional notes about this litter..."
                                    />
                                </div>

                            </form>
                    </div>

                    <div className="border-t p-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingLitter(null);
                                setCreateOffspringCounts({ males: 0, females: 0, unknown: 0 });
                                setLitterImages([]);
                                pendingLitterImages.forEach(item => URL.revokeObjectURL(item.previewUrl));
                                setPendingLitterImages([]);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                        >
                            Cancel</button>
                        <button
                            type="submit"
                            form="litter-form"
                            data-tutorial-target="create-litter-btn"
                            className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-6 rounded-lg"
                        >
                            {editingLitter ? 'Update Litter' : 'Create Litter'}
                        </button>
                    </div>
                </div>
            </div>
            )}

            {/* Planned Mating Quick-Add Modal */}
            {showAddMatingForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Heart size={18} className="text-indigo-500" />
                                {editingMatingId ? 'Edit Planned Mating' : 'Record Planned Mating'}
                            </h3>
                            <button onClick={() => { setShowAddMatingForm(false); resetMatingForm(); }} className="text-gray-500 hover:text-gray-800">
                                <X size={22} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitMating} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
                            {/* Species */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Species <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setShowMatingSpeciesPicker(true)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 transition focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {matingData.species
                                        ? <span className="font-medium text-gray-800">{matingData.species}</span>
                                        : <span className="text-gray-400">Click to select species...</span>}
                                </button>
                                <p className="text-xs text-gray-500 mt-1">Choose species to filter the sire &amp; dam search</p>
                            </div>
                            {/* Sire */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sire (Father) <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setModalTarget('sire-mating')}
                                    disabled={!matingData.species}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {matingData.sireId_public ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{(myAnimals.find(a => a.id_public === matingData.sireId_public) || selectedMatingSire)?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{matingData.sireId_public}</div>
                                            </div>
                                        </div>
                                    ) : <span className="text-gray-400">{matingData.species ? 'Select Sire...' : 'Select species first'}</span>}
                                </button>
                            </div>
                            {/* Dam */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dam (Mother) <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setModalTarget('dam-mating')}
                                    disabled={!matingData.species}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 transition focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {matingData.damId_public ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{(myAnimals.find(a => a.id_public === matingData.damId_public) || selectedMatingDam)?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{matingData.damId_public}</div>
                                            </div>
                                        </div>
                                    ) : <span className="text-gray-400">{matingData.species ? 'Select Dam...' : 'Select species first'}</span>}
                                </button>
                            </div>
                            {/* COI display */}
                            {(matingCalcCOI || matingCOI != null) && (
                                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${matingCalcCOI ? 'bg-gray-50 text-gray-500' : 'bg-gray-50 text-gray-700'}`}>
                                    {matingCalcCOI
                                        ? <><span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" /> Calculating COI...</>
                                        : <><span className="font-semibold">Predicted COI:</span> {matingCOI.toFixed(2)}%
                                            {matingCOI === 0 && <span className="text-xs ml-1">(unrelated)</span>}
                                          </>
                                    }
                                </div>
                            )}
                            {/* Mating Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mating Date</label>
                                <DatePicker value={matingData.matingDate} onChange={(e) => setMatingData({...matingData, matingDate: e.target.value})} minDate={new Date()} className="px-3 py-2" />
                                <p className="text-xs text-gray-500 mt-1">Today or future ? shows on calendar as "Mated"</p>
                            </div>
                            {/* Expected Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Due Date</label>
                                <DatePicker value={matingData.expectedDueDate} onChange={(e) => setMatingData({...matingData, expectedDueDate: e.target.value})} minDate={matingData.matingDate ? new Date(matingData.matingDate) : new Date()} className="px-3 py-2" />
                                <p className="text-xs text-gray-500 mt-1">Must be on or after mating date ? shows on calendar as "Due"</p>
                            </div>
                            {/* Expandable breeding details */}
                            <button
                                type="button"
                                onClick={() => setShowMatingBreedingDetails(p => !p)}
                                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                {showMatingBreedingDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                {showMatingBreedingDetails ? 'Hide breeding details' : '+ Breeding details (optional)'}
                            </button>
                            {showMatingBreedingDetails && (
                                <div className="space-y-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Breeding Method</label>
                                        <select
                                            value={matingData.breedingMethod}
                                            onChange={(e) => setMatingData({...matingData, breedingMethod: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                                        >
                                            <option value="Natural">Natural</option>
                                            <option value="AI">Artificial Insemination</option>
                                            <option value="Assisted">Assisted</option>
                                            <option value="Unknown">Unknown</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Breeding Condition</label>
                                        <select
                                            value={matingData.breedingConditionAtTime}
                                            onChange={(e) => setMatingData({...matingData, breedingConditionAtTime: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                                        >
                                            <option value="">Select Condition...</option>
                                            <option value="Good">Good</option>
                                            <option value="Okay">Okay</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={matingData.notes}
                                    onChange={(e) => setMatingData({...matingData, notes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
                                    rows="2"
                                    placeholder="Any notes about this mating..."
                                />
                            </div>
                            <p className="text-xs text-gray-500">The entry will appear as <span className="font-semibold text-indigo-600">Planned</span> until you edit it and add a birth date.</p>
                            <div className="flex gap-3 justify-end border-t pt-3">
                                <button type="button" onClick={() => { setShowAddMatingForm(false); resetMatingForm(); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm">Cancel</button>
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg text-sm">Save Mating</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mating Edit Choice Modal */}
            {matingEditChoice && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Planned Mating</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {matingEditChoice.litter_id_public && <span className="font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs mr-2">{matingEditChoice.litter_id_public}</span>}
                            {[matingEditChoice.sire?.prefix, matingEditChoice.sire?.name].filter(Boolean).join(' ') || matingEditChoice.sireId_public || '?'}
                            {' ? '}
                            {[matingEditChoice.dam?.prefix, matingEditChoice.dam?.name].filter(Boolean).join(' ') || matingEditChoice.damId_public || '?'}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleEditMating(matingEditChoice)}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-left"
                            >
                                <Heart size={18} className="text-indigo-500 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-indigo-800 text-sm">Edit Mating</div>
                                    <div className="text-xs text-indigo-500">Update sire, dam, dates or notes</div>
                                </div>
                            </button>
                            <button
                                onClick={() => { handleEditLitter(matingEditChoice); setMatingEditChoice(null); }}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-left"
                            >
                                <ClipboardList size={18} className="text-green-600 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-green-800 text-sm">Convert to Litter</div>
                                    <div className="text-xs text-green-600">Record birth date and offspring details</div>
                                </div>
                            </button>
                        </div>
                        <button onClick={() => setMatingEditChoice(null)} className="mt-4 w-full text-center text-sm text-gray-400 hover:text-gray-600">Cancel</button>
                    </div>
                </div>
            )}

            {/* Litter List */}
            {viewMode === 'list' && (
            <div className="space-y-4">
                {/* Search Bar */}
                {litters.length > 0 && (
                    <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border-2 border-gray-200 space-y-2 sm:space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search litters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        
                        {/* Species filter */}
                        <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <label htmlFor="litter-species-filter" className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Species:</label>
                                <select
                                    id="litter-species-filter"
                                    value={speciesFilter}
                                    onChange={(e) => setSpeciesFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                >
                                    <option value="">All Species</option>
                                    {DEFAULT_SPECIES_OPTIONS.map(species => (
                                        <option key={species} value={species}>
                                            {getSpeciesDisplayName(species)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                {filteredLitters.length > 0 && (
                                    <button
                                        onClick={toggleAllPublic}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                                            filteredLitters.every(l => l.showOnPublicProfile)
                                                ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                                                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        title={filteredLitters.every(l => l.showOnPublicProfile) ? 'Hide all from public profile' : 'Show all on public profile'}
                                    >
                                        {filteredLitters.every(l => l.showOnPublicProfile) ? <Eye size={13} /> : <EyeOff size={13} />}
                                        {filteredLitters.every(l => l.showOnPublicProfile) ? 'All Public' : 'Make All Public'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="litter-year-filter" className='text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap'>Year:</label>
                                <select
                                    id="litter-year-filter"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                    disabled={availableYears.length === 0}
                                >
                                    <option value="">All Years</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {filteredLitters.length === 0 && litters.length > 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Search size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No litters match your search.</p>
                    </div>
                ) : filteredLitters.length === 0 && !loading ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No litters yet. Create your first litter above!</p>
                    </div>
                ) : (
                    filteredLitters.map(litter => {
                        // Use parent data from litter object (includes transferred/hidden animals)
                        const sire = litter.sire || myAnimals.find(a => a.id_public === litter.sireId_public);
                        const dam = litter.dam || myAnimals.find(a => a.id_public === litter.damId_public);
                        const isExpanded = expandedLitter === litter._id;
                        // Use endpoint-fetched offspring (includes transferred animals) with fallback to myAnimals
                        const offspringList = litterOffspringMap[litter._id] ?? [];
                        const offspringLoading = isExpanded && litterOffspringMap[litter._id] === undefined;
                        // Mating state helpers
                        const isMated = litter.isPlanned && litter.matingDate && new Date(litter.matingDate) <= new Date();
                        const isPlannedOnly = litter.isPlanned && !isMated;
                        
                        return (
                            <div key={litter._id} className={`border-2 ${isPlannedOnly ? 'border-dashed border-indigo-300 bg-indigo-50/20' : isMated ? 'border-dashed border-purple-300 bg-purple-50/20' : 'border-gray-200 bg-white'} rounded-lg hover:shadow-md transition`} data-tutorial-target="litter-card">
                                {/* Compact Header - Always Visible */}
                                <div 
                                    className="p-2 sm:p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50/80"
                                    onClick={() => setExpandedLitter(isExpanded ? null : litter._id)}
                                >
                                    {/* Public profile toggle ? before litter name */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleLitterPublic(litter); }}
                                        title={litter.showOnPublicProfile ? 'Shown on public profile ? click to hide' : 'Hidden from public profile ? click to show'}
                                        className={`flex-shrink-0 mr-2 p-1 rounded transition ${litter.showOnPublicProfile ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {litter.showOnPublicProfile ? <Eye size={15} /> : <EyeOff size={15} />}
                                    </button>
                                    {/* Mobile layout: stacked info */}
                                    <div className="flex-1 sm:hidden">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {isPlannedOnly && <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded mr-2">Planned</span>}
                                                    {isMated && <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mr-2">Mated</span>}
                                                    {litter.litter_id_public && <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded mr-2">{litter.litter_id_public}</span>}
                                                    {litter.breedingPairCodeName && <span className="truncate">{litter.breedingPairCodeName}</span>}
                                                    {!litter.breedingPairCodeName && !litter.litter_id_public && <span>Unnamed Litter</span>}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700 ml-2">{isPlannedOnly ? 'Planned' : isMated ? 'Mated' : `${litter.litterSizeBorn ?? litter.numberBorn ?? 0} pups`}</span>
                                        </div>
                                        <div className="flex gap-3 text-xs text-gray-600">
                                            <span><span className="font-medium">S:</span> {sire ? `${sire.prefix ? `${sire.prefix} ` : ''}${sire.name}${sire.suffix ? ` ${sire.suffix}` : ''}` : litter.sireId_public}</span>
                                            <span><span className="font-medium">D:</span> {dam ? `${dam.prefix ? `${dam.prefix} ` : ''}${dam.name}${dam.suffix ? ` ${dam.suffix}` : ''}` : litter.damId_public}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                            {formatDate(litter.birthDate)}
                                            {!litter.isPlanned && litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">~ {litterAge(litter.birthDate)}</span>}
                                        </p>
                                        {(litter.inbreedingCoefficient != null || coiCalculating.has(litter._id)) && (
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                <span className="font-medium">COI:</span>{' '}
                                                {coiCalculating.has(litter._id)
                                                    ? <span className="inline-block w-12 h-2.5 bg-gray-200 rounded animate-pulse align-middle" />
                                                    : `${litter.inbreedingCoefficient.toFixed(2)}%`}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Desktop layout: grid */}
                                    <div className="hidden sm:grid flex-1 grid-cols-6 gap-3 items-center min-w-0">
                                        {/* Col 1: Litter name */}
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 text-sm truncate">{litter.breedingPairCodeName || <span className="text-gray-400 font-normal text-xs">Unnamed</span>}</p>
                                        </div>
                                        {/* Col 2: CTL + date / planned status */}
                                        <div className="min-w-0">
                                            {litter.litter_id_public
                                                ? <span className="text-xs font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-700 block mb-0.5 w-fit">{litter.litter_id_public}</span>
                                                : <span className="text-xs text-gray-400">?</span>}
                                            {isPlannedOnly
                                                ? <span className="text-xs font-semibold text-indigo-600"><Hourglass size={12} className="inline-block align-middle mr-0.5" /> Planned</span>
                                                : isMated
                                                ? <span className="text-xs font-semibold text-purple-600"><Heart size={12} className="inline-block align-middle mr-0.5" /> Mated {formatDate(litter.matingDate)}</span>
                                                : <span className="text-xs text-gray-500">{formatDate(litter.birthDate) || '?'}{litter.birthDate && litterAge(litter.birthDate) && <span className="ml-1 font-semibold text-green-600">~ {litterAge(litter.birthDate)}</span>}</span>}
                                        </div>
                                        {/* Col 3: Sire */}
                                        <div className="min-w-0">
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Sire</span>
                                            <span className="text-sm font-semibold text-gray-800 truncate block">{sire ? [sire.prefix, sire.name, sire.suffix].filter(Boolean).join(' ') : (litter.sireId_public || '?')}</span>
                                        </div>
                                        {/* Col 4: Dam */}
                                        <div className="min-w-0">
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">Dam</span>
                                            <span className="text-sm font-semibold text-gray-800 truncate block">{dam ? [dam.prefix, dam.name, dam.suffix].filter(Boolean).join(' ') : (litter.damId_public || '?')}</span>
                                        </div>
                                        {/* Col 5: COI */}
                                        <div>
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">COI</span>
                                            {coiCalculating.has(litter._id)
                                                ? <span className="inline-block w-10 h-3 bg-gray-200 rounded animate-pulse mt-0.5" />
                                                : <span className="text-sm font-semibold text-gray-800">
                                                    {litter.inbreedingCoefficient != null ? `${litter.inbreedingCoefficient.toFixed(2)}%` : '?'}
                                                  </span>}
                                        </div>
                                        {/* Col 6: Born with M/F/U */}
                                        <div>
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold block">{litter.isPlanned ? 'Status' : 'Born'}</span>
                                            {isPlannedOnly
                                                ? <span className="text-xs font-semibold text-indigo-500">Awaiting mating</span>
                                                : isMated
                                                ? <span className="text-xs font-semibold text-purple-500">Awaiting birth</span>
                                                : <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</span>
                                                    {(litter.maleCount != null || litter.femaleCount != null || litter.unknownCount != null) && (
                                                        <span className="text-xs ml-1">
                                                            <span className="text-blue-500 font-semibold">{litter.maleCount ?? 0}M</span>
                                                            <span className="text-gray-400 mx-0.5">/</span>
                                                            <span className="text-pink-500 font-semibold">{litter.femaleCount ?? 0}F</span>
                                                            <span className="text-gray-400 mx-0.5">/</span>
                                                            <span className="text-purple-500 font-semibold">{litter.unknownCount ?? 0}U</span>
                                                        </span>
                                                    )}
                                                  </div>
                                            }
                                        </div>
                                    </div>
                                    {isPlannedOnly && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleMarkAsMated(litter); }}
                                            title="Mark as mated today"
                                            className="flex-shrink-0 flex items-center gap-1 mr-1 px-2 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                                        >
                                            <Heart size={11} /> Mated today
                                        </button>
                                    )}
                                    {(litter.images?.length > 0) && (
                                        <span className="flex items-center gap-0.5 text-[11px] text-gray-400 mr-1 flex-shrink-0">
                                            <Images size={12} />
                                            <span>{litter.images.length}</span>
                                        </span>
                                    )}
                                    <ChevronDown
                                        size={18}
                                        className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t-2 border-gray-200 p-2 sm:p-4 bg-gray-50">
                                        <div className="flex flex-wrap justify-end gap-1 sm:gap-2 mb-3 sm:mb-4">
                                            {isPlannedOnly && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsMated(litter); }}
                                                    className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                                >
                                                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    <span>Mated Today</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (litter.isPlanned) { setMatingEditChoice(litter); } else { handleEditLitter(litter); }
                                                }}
                                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                            >
                                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            {!litter.isPlanned && <button
                                                onClick={() => handleLinkAnimals(litter)}
                                                data-tutorial-target="link-animals-btn"
                                                className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-black font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                            >
                                                <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Link</span>
                                            </button>}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLitter(litter._id);
                                                }}
                                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </div>

                                        {/* -- 1. Parents + COI ------------------------------------- */}
                                        {(sire || dam) && (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Parents</h4>
                                                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                                    {/* Sire */}
                                                    {sire ? (
                                                        <div
                                                            onClick={sire.isTransferred ? undefined : () => onViewAnimal(sire)}
                                                            className={`bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 ${sire.isTransferred ? 'opacity-75' : 'cursor-pointer hover:shadow-md'} transition shadow-sm`}
                                                        >
                                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                {sire.imageUrl || sire.photoUrl
                                                                    ? <img src={sire.imageUrl || sire.photoUrl} alt={sire.name} className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={24} /></div>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Mars size={12} className="text-primary flex-shrink-0" />
                                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Sire</span>
                                                                </div>
                                                                <p className="font-bold text-gray-800 truncate text-sm">{sire.prefix ? `${sire.prefix} ` : ''}{sire.name}{sire.suffix ? ` ${sire.suffix}` : ''}</p>
                                                                <p className="text-xs text-gray-500">{sire.species}</p>
                                                                <p className="text-[10px] text-gray-400 font-mono">{sire.id_public}</p>
                                                            </div>
                                                        </div>
                                                    ) : <div />}
                                                    {/* COI badge between parents */}
                                                    <div className="flex flex-col items-center px-2">
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">COI</div>
                                                        {coiCalculating.has(litter._id)
                                                            ? <div className="w-14 h-5 bg-gray-200 rounded animate-pulse" />
                                                            : litter.inbreedingCoefficient != null
                                                                ? <div className="text-base font-medium text-gray-800">{litter.inbreedingCoefficient.toFixed(2)}%</div>
                                                                : <div className="text-base font-medium text-gray-300">?</div>}
                                                    </div>
                                                    {/* Dam */}
                                                    {dam ? (
                                                        <div
                                                            onClick={dam.isTransferred ? undefined : () => onViewAnimal(dam)}
                                                            className={`bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 ${dam.isTransferred ? 'opacity-75' : 'cursor-pointer hover:shadow-md'} transition shadow-sm`}
                                                        >
                                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                                {dam.imageUrl || dam.photoUrl
                                                                    ? <img src={dam.imageUrl || dam.photoUrl} alt={dam.name} className="w-full h-full object-cover" />
                                                                    : <div className="w-full h-full flex items-center justify-center text-gray-400"><Cat size={24} /></div>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1 mb-0.5">
                                                                    <Venus size={12} className="text-accent flex-shrink-0" />
                                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Dam</span>
                                                                </div>
                                                                <p className="font-bold text-gray-800 truncate text-sm">{dam.prefix ? `${dam.prefix} ` : ''}{dam.name}{dam.suffix ? ` ${dam.suffix}` : ''}</p>
                                                                <p className="text-xs text-gray-500">{dam.species}</p>
                                                                <p className="text-[10px] text-gray-400 font-mono">{dam.id_public}</p>
                                                            </div>
                                                        </div>
                                                    ) : <div />}
                                                </div>
                                            </div>
                                        )}

                                        {/* -- 2. Breeding info -------------------------------------- */}
                                        {((litter.matingDate || litter.pairingDate) || litter.breedingMethod || litter.breedingCondition || litter.breedingConditionAtTime || litter.outcome || litter.birthMethod || litter.birthDate || litter.expectedDueDate || litter.weaningDate) && (
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Breeding &amp; Birth</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                                    {(litter.matingDate || litter.pairingDate) && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mating Date</div>
                                                            <div className="font-semibold text-gray-800">{formatDate(litter.matingDate || litter.pairingDate)}</div>
                                                        </div>
                                                    )}
                                                    {litter.expectedDueDate && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Expected Due Date</div>
                                                            <div className="font-semibold text-gray-800">{formatDate(litter.expectedDueDate)}</div>
                                                        </div>
                                                    )}
                                                    {litter.breedingMethod && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Method</div>
                                                            <div className="font-semibold text-gray-800">{litter.breedingMethod}</div>
                                                        </div>
                                                    )}
                                                    {(litter.breedingCondition || litter.breedingConditionAtTime) && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Breeding Condition</div>
                                                            <div className="font-semibold text-gray-800">{litter.breedingCondition || litter.breedingConditionAtTime}</div>
                                                        </div>
                                                    )}
                                                    {litter.outcome && !(litter.isPlanned && litter.outcome === 'Unknown') && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Outcome</div>
                                                            <div className={`font-semibold ${litter.outcome === 'Successful' ? 'text-green-600' : litter.outcome === 'Unsuccessful' ? 'text-red-500' : 'text-gray-800'}`}>{litter.outcome}</div>
                                                        </div>
                                                    )}
                                                    {litter.birthMethod && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Method</div>
                                                            <div className="font-semibold text-gray-800">{litter.birthMethod}</div>
                                                        </div>
                                                    )}
                                                    {litter.birthDate && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Birth Date</div>
                                                            <div className="font-semibold text-gray-800">{formatDate(litter.birthDate)}{litterAge(litter.birthDate) && <span className="ml-2 text-xs font-semibold text-green-600">~ {litterAge(litter.birthDate)}</span>}</div>
                                                        </div>
                                                    )}
                                                    {litter.weaningDate && (
                                                        <div>
                                                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaning Date</div>
                                                            <div className="font-semibold text-gray-800">{formatDate(litter.weaningDate)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* -- 3. Litter Stats: left = counts, right = sex ------------ */}
                                        {!litter.isPlanned && <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                                            <div className="flex flex-col sm:grid sm:grid-cols-2 sm:divide-x divide-gray-200 gap-3 sm:gap-0">
                                                {/* Left: Born / Stillborn / Weaned */}
                                                <div className="grid grid-cols-3 sm:pr-4">
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Born</div>
                                                        <div className="text-xl font-bold text-gray-800">{litter.litterSizeBorn ?? litter.numberBorn ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Stillborn</div>
                                                        <div className="text-xl font-bold text-gray-400">{litter.stillbornCount ?? litter.stillborn ?? '0'}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Weaned</div>
                                                        <div className="text-xl font-bold text-green-600">{litter.litterSizeWeaned ?? litter.numberWeaned ?? 0}</div>
                                                    </div>
                                                </div>
                                                {/* Right: Males / Females / Unknown */}
                                                <div className="grid grid-cols-3 sm:pl-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Males</div>
                                                        <div className="text-xl font-bold text-blue-500">{litter.maleCount ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Females</div>
                                                        <div className="text-xl font-bold text-pink-500">{litter.femaleCount ?? 0}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Unknown</div>
                                                        <div className="text-xl font-bold text-purple-500">{litter.unknownCount ?? 0}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}

                                        {/* -- 4. Photos -------------------------------------------- */}
                                        {!litter.isPlanned && litter.images?.length > 0 && (
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Photos</h4>
                                                <div className="flex gap-2 flex-wrap">
                                                    {litter.images.map((img, idx) => (
                                                        <button
                                                            key={img.r2Key || idx}
                                                            onClick={(e) => { e.stopPropagation(); setEnlargedLitterImageUrl(img.url); setShowLitterImageModal(true); }}
                                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition flex-shrink-0 focus:outline-none"
                                                        >
                                                            <img src={img.url} alt={`Litter photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* -- 5. Notes ---------------------------------------------- */}
                                        {litter.notes && (
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4>
                                                <p className="text-sm text-gray-700 italic leading-relaxed">{litter.notes}</p>
                                            </div>
                                        )}

                                        {/* Offspring skeleton while dedicated offspring fetch is in flight */}
                                        {offspringLoading && (
                                            <div className="mb-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {[0, 1, 2].map((i) => (
                                                        <div key={i} className="bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden border-2 border-gray-200 animate-pulse">
                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                <div className="w-20 h-20 bg-gray-200 rounded-md" />
                                                            </div>
                                                            <div className="w-full px-4 pb-3 space-y-1.5">
                                                                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                                                                <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
                                                            </div>
                                                            <div className="w-full bg-gray-100 py-1 border-t border-gray-200">
                                                                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Offspring Cards */}
                                        {offspringList.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-gray-700">Offspring ({offspringList.length})</h4>
                                                    <div className="flex items-center gap-2">
                                                        {bulkDeleteMode[litter._id] && (
                                                            <>
                                                                <span className="text-sm text-gray-600">
                                                                    {(selectedOffspring[litter._id] || []).length} selected
                                                                </span>
                                                                <button
                                                                    onClick={() => handleBulkDeleteOffspring(litter._id)}
                                                                    disabled={(selectedOffspring[litter._id] || []).length === 0}
                                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Delete Selected
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleBulkDeleteMode(litter._id)}
                                                                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold rounded-lg transition"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {!bulkDeleteMode[litter._id] && (
                                                            <button
                                                                onClick={() => toggleBulkDeleteMode(litter._id)}
                                                                className="p-2 hover:bg-gray-200 rounded-lg transition"
                                                                title="Delete Multiple"
                                                            >
                                                                <Trash2 size={18} className="text-red-500" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {offspringList.map(animal => {
                                                        const isBulkMode = bulkDeleteMode[litter._id] || false;
                                                        const isSelected = (selectedOffspring[litter._id] || []).includes(animal.id_public);
                                                        
                                                        return (
                                                        <div
                                                            key={animal.id_public}
                                                            onClick={() => {
                                                                if (isBulkMode) {
                                                                    toggleOffspringSelection(litter._id, animal.id_public);
                                                                } else {
                                                                    // Inject litter's parent IDs as fallback so animals whose DB links
                                                                    // were wiped still display (and re-save) the correct parents
                                                                    const animalWithParents = {
                                                                        ...animal,
                                                                        sireId_public: animal.sireId_public || litter.sireId_public || null,
                                                                        damId_public: animal.damId_public || litter.damId_public || null,
                                                                    };
                                                                    // If animal is owned by current user, open edit view; otherwise open read-only view
                                                                    const isOwnedByUser = animal.ownerId_public === userProfile?.id_public;
                                                                    if (isOwnedByUser) {
                                                                        handleViewAnimal && handleViewAnimal(animalWithParents);
                                                                    } else {
                                                                        onViewAnimal(animalWithParents);
                                                                    }
                                                                }
                                                            }}
                                                            className={`relative bg-white rounded-lg shadow-sm h-52 flex flex-col items-center overflow-hidden transition border-2 pt-2 ${
                                                                isSelected ? 'border-red-500 cursor-pointer hover:shadow-md' : 'border-gray-300 cursor-pointer hover:shadow-md'
                                                            }`}
                                                        >
                                                            {isBulkMode && (
                                                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleOffspringSelection(litter._id, animal.id_public)}
                                                                        className="w-5 h-5 cursor-pointer"
                                                                    />
                                                                </div>
                                                            )}
                                                            {!isBulkMode && (
                                                                <div className="absolute top-1.5 left-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        onClick={() => handleUnlinkOffspring(litter, animal.id_public)}
                                                                        className="p-1 rounded bg-white/80 hover:bg-orange-100 text-gray-300 hover:text-orange-500 transition"
                                                                        title="Unlink from litter (does not delete the animal)"
                                                                    >
                                                                        <Unlink size={12} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {/* Gender badge top-right */}
                                                            {(animal.gender === 'Male' || animal.gender === 'Female') && (
                                                                <div className="absolute top-1.5 right-1.5">
                                                                    {animal.gender === 'Male' ? <Mars size={14} strokeWidth={2.5} className="text-primary" /> : animal.gender === 'Female' ? <Venus size={14} strokeWidth={2.5} className="text-accent" /> : animal.gender === 'Intersex' ? <VenusAndMars size={14} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={14} strokeWidth={2.5} className="text-gray-400" />}
                                                                </div>
                                                            )}

                                                            {/* Profile image */}
                                                            <div className="flex-1 flex items-center justify-center w-full px-2 mt-1">
                                                                {animal.imageUrl || animal.photoUrl ? (
                                                                    <img 
                                                                        src={animal.imageUrl || animal.photoUrl} 
                                                                        alt={animal.name} 
                                                                        className="w-20 h-20 object-cover rounded-md" 
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                        <Cat size={32} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Icon row */}
                                                            <div className="w-full flex justify-center items-center space-x-2 py-1">
                                                                {animal.isOwned ? (
                                                                    <Heart size={12} className="text-black" />
                                                                ) : (
                                                                    <HeartOff size={12} className="text-black" />
                                                                )}
                                                                {animal.showOnPublicProfile || animal.isDisplay ? (
                                                                    <Eye size={12} className="text-black" />
                                                                ) : (
                                                                    <EyeOff size={12} className="text-black" />
                                                                )}
                                                                {animal.isInMating && <Hourglass size={12} className="text-black" />}
                                                                {animal.isPregnant && <Bean size={12} className="text-black" />}
                                                                {animal.isNursing && <Milk size={12} className="text-black" />}
                                                            </div>
                                                            
                                                            {/* Name */}
                                                            <div className="w-full text-center px-2 pb-1">
                                                                <div className="text-sm font-semibold text-gray-800 truncate">
                                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                                </div>
                                                            </div>

                                                            {/* ID bottom-right */}
                                                            <div className="w-full px-2 pb-2 flex justify-end">
                                                                <div className="text-xs text-gray-500">{animal.id_public}</div>
                                                            </div>
                                                            
                                                            {/* Status bar */}
                                                            <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300 mt-auto">
                                                                <div className="text-xs font-medium text-gray-700">{animal.status || 'Unknown'}</div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Offspring Section */}
                                        {!litter.isPlanned && addingOffspring && addingOffspring._id === litter._id ? (
                                            <div className="bg-white rounded-lg border-2 border-primary p-4">
                                                <h4 className="text-sm font-bold text-gray-700 mb-3">Add New Offspring</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.name}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, name: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Enter name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                                                        <select
                                                            value={newOffspringData.gender}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, gender: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.color}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, color: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Coat</label>
                                                        <input
                                                            type="text"
                                                            value={newOffspringData.coat}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, coat: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
                                                        <textarea
                                                            value={newOffspringData.remarks}
                                                            onChange={(e) => setNewOffspringData({...newOffspringData, remarks: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                            rows="2"
                                                            placeholder="Optional notes"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded">
                                                    <div className="text-sm font-semibold text-blue-900 mb-2">Auto-Assigned Parent Information</div>
                                                    <div className="text-xs text-blue-800 space-y-1">
                                                        <div><span className="font-semibold">Species:</span> {sire?.species || addingOffspring.sire?.species || addingOffspring.dam?.species || 'Unknown'}</div>
                                                        <div><span className="font-semibold">Birth Date:</span> {formatDate(litter.birthDate)}</div>
                                                        <div><span className="font-semibold">Sire (Father):</span> {litter.sirePrefixName ? `${litter.sirePrefixName}` : litter.sireId_public || 'Not set'}</div>
                                                        <div><span className="font-semibold">Dam (Mother):</span> {litter.damPrefixName ? `${litter.damPrefixName}` : litter.damId_public || 'Not set'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveNewOffspring}
                                                        className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-black font-semibold px-4 py-2 rounded-lg"
                                                    >
                                                        <Plus size={16} />
                                                        Save Offspring
                                                    </button>
                                                    <button
                                                        onClick={() => setAddingOffspring(null)}
                                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : !litter.isPlanned ? (
                                            <button
                                                onClick={() => handleAddOffspringToLitter(litter)}
                                                className="flex items-center gap-1 bg-accent hover:bg-accent/90 text-white font-semibold px-3 py-2 rounded-lg text-sm"
                                            >
                                                <Plus size={16} />
                                                Add Offspring
                                            </button>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            )} {/* End viewMode === 'list' */}

            {/* Calendar View */}
            {viewMode === 'calendar' && (() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

                // Locale-aware first day of week (0=Sun, 1=Mon, ... 6=Sat)
                const localeFirstDay = (() => {
                    try {
                        const loc = new Intl.Locale(navigator.language || 'en-US');
                        const fw = loc.weekInfo?.firstDay ?? (loc.getWeekInfo?.()?.firstDay ?? 7);
                        return fw % 7; // JS: 7(Sun)?0, 1(Mon)?1, 6(Sat)?6
                    } catch(e) { return 0; }
                })();

                // Build event map: 'YYYY-MM-DD' -> [{type, litter}]
                const eventMap = {};
                const q = (calendarQuery || '').trim().toLowerCase();
                const filteredLitters = litters.filter(l => {
                    if (calendarPlannedOnly && !l.isPlanned) return false;
                    if (!q) return true;
                    const text = [
                        l.breedingPairCodeName,
                        l.litter_id_public,
                        l.sire?.name,
                        l.dam?.name,
                        l.sireId_public,
                        l.damId_public
                    ].filter(Boolean).join(' ').toLowerCase();
                    return text.includes(q);
                });

                const addEvent = (dateVal, type, litter) => {
                    if (!dateVal) return;
                    if (!calendarEventFilters[type]) return;
                    let d;
                    try {
                        // Parse as local time to avoid UTC-offset date shifting
                        const s = typeof dateVal === 'string' ? dateVal.substring(0, 10) : null;
                        d = s ? new Date(s + 'T00:00:00') : new Date(dateVal);
                        if (isNaN(d.getTime())) return;
                    } catch(e) { return; }
                    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    if (!eventMap[k]) eventMap[k] = [];
                    // Skip only duplicate same litter + same event type on same day.
                    if (eventMap[k].some(e => e.litter._id === litter._id && e.type === type)) return;
                    eventMap[k].push({ type, litter });
                };
                filteredLitters.forEach(l => {
                    addEvent(l.matingDate, 'mated', l);
                    addEvent(l.expectedDueDate, 'due', l);
                    addEvent(l.birthDate, 'born', l);
                    addEvent(l.weaningDate, 'weaned', l);
                });

                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);
                const monthEventList = Object.entries(eventMap)
                    .flatMap(([dateKey, events]) => events.map(ev => ({ dateKey, ...ev })))
                    .filter(ev => {
                        const d = new Date(`${ev.dateKey}T00:00:00`);
                        return d >= monthStart && d <= monthEnd;
                    })
                    .sort((a, b) => {
                        if (a.dateKey < b.dateKey) return -1;
                        if (a.dateKey > b.dateKey) return 1;
                        const order = { mated: 0, due: 1, born: 2, weaned: 3 };
                        return (order[a.type] ?? 99) - (order[b.type] ?? 99);
                    });

                const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                const allDayAbbr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                const dayNames = [...allDayAbbr.slice(localeFirstDay), ...allDayAbbr.slice(0, localeFirstDay)];
                // true for columns that land on Saturday or Sunday
                const isWeekendCol = dayNames.map(d => d === 'Sun' || d === 'Sat');

                // Offset of the month's first day relative to the locale week start
                const rawFirstDay = new Date(year, month, 1).getDay();
                const firstDayOffset = (rawFirstDay - localeFirstDay + 7) % 7;

                const cells = [];
                for (let i = 0; i < firstDayOffset; i++) cells.push(null);
                for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                while (cells.length % 7 !== 0) cells.push(null);

                const typeStyles = {
                    mated:  { bg: 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300', dot: 'bg-purple-400', label: 'Mated' },
                    due:    { bg: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300', dot: 'bg-amber-400', label: 'Due' },
                    born:   { bg: 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-500', dot: 'bg-green-500', label: 'Born' },
                    weaned: { bg: 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300', dot: 'bg-sky-400', label: 'Weaned' },
                };

                const getLitterName = (l) => l.breedingPairCodeName || l.litter_id_public || 'Unnamed Litter';
                const getSireDam = (l) => {
                    const sn = l.sire?.name || l.sireId_public || '?';
                    const dn = l.dam?.name || l.damId_public || '?';
                    return `${sn} · ${dn}`;
                };
                // Format a date value as "10 Jan 2026"
                const fmtD = (v) => {
                    if (!v) return null;
                    try { const d = new Date(v); if (isNaN(d)) return null; return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch(e) { return null; }
                };
                // Type-specific pill label
                const getPillLabel = (ev) => {
                    const l = ev.litter;
                    const pairName = l.breedingPairCodeName || l.litter_id_public || 'Unnamed';
                    const sn = l.sire?.name || l.sireId_public || '?';
                    const dn = l.dam?.name || l.damId_public || '?';
                    if (ev.type === 'due') return `${pairName} · ${dn}`;
                    if (ev.type === 'born') {
                        const total = l.litterSizeBorn ?? l.numberBorn ?? 0;
                        const m = l.maleCount ?? 0;
                        const f = l.femaleCount ?? 0;
                        return `${pairName} · ${total} born (${m}M/${f}F)`;
                    }
                    if (ev.type === 'weaned') {
                        const total = l.litterSizeWeaned ?? l.numberWeaned ?? (l.litterSizeBorn ?? l.numberBorn ?? 0);
                        return `${pairName} · ${total} to wean`;
                    }
                    // mated
                    return `${pairName} · ${sn} · ${dn}`;
                };

                return (
                    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <button
                                onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                                className="p-1.5 rounded-lg hover:bg-gray-200 transition"
                            >
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <h3 className="text-lg font-bold text-gray-800">{monthNames[month]} {year}</h3>
                            <button
                                onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                                className="p-1.5 rounded-lg hover:bg-gray-200 transition"
                            >
                                <ChevronRight size={20} className="text-gray-600" />
                            </button>
                        </div>

                        <div className="px-4 py-3 bg-white border-b border-gray-200 space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Search size={14} className="text-gray-400" />
                                    <input
                                        value={calendarQuery}
                                        onChange={(e) => setCalendarQuery(e.target.value)}
                                        placeholder="Filter by pair, litter ID, sire or dam"
                                        className="w-full md:w-80 p-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                                        }}
                                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={() => setCalendarPlannedOnly(v => !v)}
                                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border ${calendarPlannedOnly ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Planned Only
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {Object.entries(typeStyles).map(([key, style]) => (
                                    <button
                                        key={key}
                                        onClick={() => setCalendarEventFilters(prev => ({ ...prev, [key]: !prev[key] }))}
                                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition ${calendarEventFilters[key] ? `${style.bg}` : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'}`}
                                    >
                                        {style.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Day-of-week headers */}
                        <div className="grid grid-cols-7 border-b-2 border-gray-300 bg-gray-50">
                            {dayNames.map((d, i) => (
                                <div key={d} className={`py-2 text-center text-xs font-bold uppercase tracking-wide ${isWeekendCol[i] ? 'text-rose-400' : 'text-gray-500'}`}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day Cells */}
                        <div className="grid grid-cols-7 divide-x divide-y divide-gray-300">
                            {cells.map((day, idx) => {
                                const colIdx = idx % 7;
                                const isWeekend = isWeekendCol[colIdx];
                                if (day === null) return (
                                    <div key={`blank-${idx}`} className={`min-h-[72px] ${isWeekend ? 'bg-rose-50/40' : 'bg-gray-50/60'}`} />
                                );
                                const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                const events = eventMap[dateKey] || [];
                                const isToday = dateKey === todayStr;
                                return (
                                    <div key={dateKey} className={`min-h-[72px] p-1 ${isToday ? 'bg-blue-50' : isWeekend ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-gray-50/80'}`}>
                                        <span className={`inline-flex items-center justify-center w-6 h-6 text-sm rounded-full font-medium ${isToday ? 'bg-primary text-black ring-2 ring-primary/40 font-bold' : 'text-gray-700'}`}>
                                            {day}
                                        </span>
                                        <div className="mt-0.5 space-y-0.5">
                                            {events.map((ev, i) => {
                                                const st = (ev.type === 'due' && ev.litter.birthDate)
                                                    ? { bg: 'bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-300', label: 'Due (Born)' }
                                                    : (typeStyles[ev.type] || typeStyles.born);
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCalendarTooltip(t => (t && t.key === `${dateKey}-${i}`) ? null : { key: `${dateKey}-${i}`, litter: ev.litter, type: ev.type })}
                                                        className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate transition-colors ${st.bg}${ev.litter.isPlanned ? ' border-dashed opacity-80' : ''}`}
                                                        title={`${ev.litter.isPlanned ? '[Planned] ' : ''}${st.label}: ${getLitterName(ev.litter)} (${getSireDam(ev.litter)})`}
                                                    >
                                                        {ev.litter.isPlanned && '~ '}{getPillLabel(ev)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Selected event detail */}
                        {calendarTooltip && (() => {
                            const l = calendarTooltip.litter;
                            const type = calendarTooltip.type;
                            const sn = l.sire?.name || l.sireId_public || '?';
                            const dn = l.dam?.name || l.damId_public || '?';
                            const pairName = l.breedingPairCodeName || l.litter_id_public || 'Unnamed Litter';
                            const callId = l.litter_id_public;

                            const daysStatus = (() => {
                                if (l.birthDate) return { text: `Born ${fmtD(l.birthDate)}`, cls: 'text-green-600 font-semibold' };
                                if (!l.expectedDueDate) return null;
                                const due = new Date(l.expectedDueDate);
                                if (isNaN(due)) return null;
                                const now = new Date(); now.setHours(0,0,0,0); due.setHours(0,0,0,0);
                                const diff = Math.round((due - now) / 86400000);
                                if (diff > 0) return { text: `${diff} day${diff !== 1 ? 's' : ''} remaining`, cls: 'text-green-600' };
                                if (diff === 0) return { text: 'Due today', cls: 'text-amber-600 font-semibold' };
                                return { text: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, cls: 'text-red-600 font-semibold' };
                            })();

                            const Row = ({ label, value, cls }) => {
                                if (value == null || value === '') return null;
                                return (
                                    <div className="flex gap-2 text-sm">
                                        <span className="text-gray-500 w-32 flex-shrink-0">{label}</span>
                                        <span className={`text-gray-800 font-medium ${cls || ''}`}>{value}</span>
                                    </div>
                                );
                            };

                            const tooltipPillStyle = (type === 'due' && l.birthDate)
                                ? { bg: 'bg-gray-100 text-gray-500 border border-gray-300', label: 'Due (Born)' }
                                : (typeStyles[type] || typeStyles.born);

                            return (
                                <div className="mx-3 mb-3 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    {/* Header */}
                                    <div className="flex justify-between items-start gap-2 mb-3 pb-2 border-b border-gray-200">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${tooltipPillStyle.bg}`}>
                                                    {tooltipPillStyle.label}
                                                </span>
                                                <span className="font-bold text-gray-800 text-sm">{pairName} ? {sn} ? {dn}</span>
                                            </div>
                                            {callId && <p className="text-xs text-gray-400 mt-0.5">{callId}</p>}
                                        </div>
                                        <button onClick={() => setCalendarTooltip(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="space-y-1.5">
                                        {type === 'due' && (<>
                                            <Row label="Mated:" value={fmtD(l.matingDate)} />
                                            <Row label="Due:" value={fmtD(l.expectedDueDate)} />
                                            {daysStatus && <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Status:</span><span className={daysStatus.cls}>{daysStatus.text}</span></div>}
                                            <Row label="Method:" value={l.breedingMethod && l.breedingMethod !== 'Unknown' ? l.breedingMethod : null} />
                                            <Row label="Condition:" value={l.breedingConditionAtTime || null} />
                                        </>)}
                                        {type === 'born' && (<>
                                            <Row label="Birth Method:" value={l.birthMethod || null} />
                                            <Row label="Born:" value={fmtD(l.birthDate)} />
                                            <Row label="Total:" value={l.litterSizeBorn ?? l.numberBorn ?? null} />
                                            <Row label="Males:" value={l.maleCount ?? null} />
                                            <Row label="Females:" value={l.femaleCount ?? null} />
                                            <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Stillborn:</span><span className="text-gray-800 font-medium">{l.stillbornCount ?? 0}</span></div>
                                            <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Weaned:</span><span className="text-gray-800 font-medium">{l.litterSizeWeaned ?? l.numberWeaned ?? 0}</span></div>
                                            <Row label="Weaning Date:" value={fmtD(l.weaningDate)} />
                                        </>)}
                                        {type === 'weaned' && (() => {
                                            const weanStatus = (() => {
                                                if (!l.weaningDate) return null;
                                                const wd = new Date(l.weaningDate); if (isNaN(wd)) return null;
                                                const now = new Date(); now.setHours(0,0,0,0); wd.setHours(0,0,0,0);
                                                const diff = Math.round((wd - now) / 86400000);
                                                if (diff > 0) return { text: `Due in ${diff} day${diff !== 1 ? 's' : ''}`, cls: 'text-green-600' };
                                                if (diff === 0) return { text: 'Weaning today', cls: 'text-amber-600 font-semibold' };
                                                return { text: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, cls: 'text-red-600 font-semibold' };
                                            })();
                                            const ageInDays = (() => {
                                                if (!l.birthDate || !l.weaningDate) return null;
                                                const b = new Date(l.birthDate); const w = new Date(l.weaningDate);
                                                if (isNaN(b) || isNaN(w)) return null;
                                                return Math.round((w - b) / 86400000);
                                            })();
                                            return (<>
                                                <Row label="Born:" value={fmtD(l.birthDate)} />
                                                <Row label="Weaning Date:" value={fmtD(l.weaningDate)} />
                                                {ageInDays != null && <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Age:</span><span className="text-gray-800 font-medium">{ageInDays} day{ageInDays !== 1 ? 's' : ''}</span></div>}
                                                {weanStatus && <div className="flex gap-2 text-sm"><span className="text-gray-500 w-32 flex-shrink-0">Status:</span><span className={weanStatus.cls}>{weanStatus.text}</span></div>}
                                            </>);
                                        })()}
                                        {type === 'mated' && (<>
                                            <Row label="Mating Date:" value={fmtD(l.matingDate)} />
                                            <Row label="Expected Due:" value={fmtD(l.expectedDueDate)} />
                                            <Row label="Method:" value={l.breedingMethod && l.breedingMethod !== 'Unknown' ? l.breedingMethod : null} />
                                            <Row label="Condition:" value={l.breedingConditionAtTime || null} />
                                        </>)}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="mx-3 mb-3 p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-800">Month Agenda</h4>
                                <span className="text-xs text-gray-500">{monthEventList.length} event{monthEventList.length !== 1 ? 's' : ''}</span>
                            </div>
                            {monthEventList.length === 0 ? (
                                <p className="text-xs text-gray-500">No events match the current month/filter selection.</p>
                            ) : (
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {monthEventList.map((ev, idx) => {
                                        const st = (ev.type === 'due' && ev.litter.birthDate)
                                            ? { bg: 'bg-gray-100 text-gray-500 border border-gray-300', label: 'Due (Born)' }
                                            : (typeStyles[ev.type] || typeStyles.born);
                                        return (
                                            <button
                                                key={`${ev.dateKey}-${ev.type}-${ev.litter._id}-${idx}`}
                                                onClick={() => setCalendarTooltip({ key: `${ev.dateKey}-${idx}`, litter: ev.litter, type: ev.type })}
                                                className="w-full text-left px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${st.bg}`}>{st.label}</span>
                                                    <span className="text-[11px] text-gray-500">{fmtD(ev.dateKey)}</span>
                                                </div>
                                                <div className="text-xs text-gray-800 font-medium mt-1 truncate">{getPillLabel(ev)}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600 items-center">
                            {Object.entries(typeStyles).map(([k, v]) => (
                                <span key={k} className="flex items-center gap-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${v.dot}`} />
                                    {v.label}
                                </span>
                            ))}
                            {filteredLitters.length === 0 && (
                                <span className="text-gray-400 italic ml-auto">No litters match current calendar filters</span>
                            )}
                            <span className="text-gray-400 ml-auto hidden sm:block">Click a pill for details</span>
                        </div>
                    </div>
                );
            })()}

            {/* Link Animals Modal */}
            {linkingAnimals && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-xl font-bold text-gray-800">Link Animals to Litter</h3>
                            <button onClick={() => setLinkingAnimals(false)} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4">
                            {availableToLink.animals && availableToLink.animals.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No unlinked animals found with matching parents and birth date.</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Found {availableToLink.animals?.length || 0} unlinked animal(s) with matching parents and birth date:
                                    </p>
                                    {availableToLink.animals?.map(animal => (
                                        <div key={animal.id_public} className="border rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">
                                                    {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}{animal.suffix ? ` ${animal.suffix}` : ''}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {animal.id_public} &bull; {animal.gender} &bull; {animal.species}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleAddToLitter(animal.id_public)}
                                                className="bg-primary hover:bg-primary/90 text-black font-semibold px-3 py-1 rounded text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t p-4 space-y-2">
                            {availableToLink.animals && availableToLink.animals.length > 0 && (
                                <button
                                    onClick={handleAddAllToLitter}
                                    className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg"
                                >
                                    Add All ({availableToLink.animals.length})
                                </button>
                            )}
                            <button
                                onClick={() => setLinkingAnimals(false)}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Species Picker Modal */}
            {showSpeciesPicker && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions}
                    onSelect={(speciesName) => {
                        setFormData(prev => ({...prev, species: speciesName, sireId_public: '', damId_public: ''}));
                        setSelectedSireAnimal(null);
                        setSelectedDamAnimal(null);
                        setShowSpeciesPicker(false);
                    }}
                    onClose={() => setShowSpeciesPicker(false)}
                    X={X}
                    Search={Search}
                />
            )}

            {/* Sire Modal */}
            {modalTarget === 'sire-litter' && (
                <ParentSearchModal
                    title="Select Sire"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Male', 'Intersex', 'Unknown']}
                    species={formData.species || undefined}
                />
            )}

            {/* Dam Modal */}
            {modalTarget === 'dam-litter' && (
                <ParentSearchModal
                    title="Select Dam"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Female', 'Intersex', 'Unknown']}
                    species={formData.species || undefined}
                />
            )}

            {/* Mating Form ? Species Picker */}
            {showMatingSpeciesPicker && (
                <SpeciesPickerModal
                    speciesOptions={speciesOptions}
                    onSelect={(speciesName) => {
                        setMatingData(prev => ({...prev, species: speciesName, sireId_public: '', damId_public: ''}));
                        setSelectedMatingSire(null);
                        setSelectedMatingDam(null);
                        setMatingCOI(null);
                        setShowMatingSpeciesPicker(false);
                    }}
                    onClose={() => setShowMatingSpeciesPicker(false)}
                    X={X}
                    Search={Search}
                />
            )}

            {/* Mating Form ? Sire Modal */}
            {modalTarget === 'sire-mating' && (
                <ParentSearchModal
                    title="Select Sire"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Male', 'Intersex', 'Unknown']}
                    species={matingData.species || undefined}
                />
            )}

            {/* Mating Form ? Dam Modal */}
            {modalTarget === 'dam-mating' && (
                <ParentSearchModal
                    title="Select Dam"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Female', 'Intersex', 'Unknown']}
                    species={matingData.species || undefined}
                />
            )}

            {/* Test Pairing Modal */}
            {showTestPairingModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-gray-200 px-5 py-4 flex-shrink-0">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Calculator size={18} className="text-primary" />
                                Test Pairing
                            </h3>
                            <button onClick={() => setShowTestPairingModal(false)} className="text-gray-500 hover:text-gray-800">
                                <X size={22} />
                            </button>
                        </div>
                        {/* Tab bar */}
                        <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0">
                            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setTpMode('coi')}
                                    className={`px-3 py-1.5 text-sm font-medium ${tpMode === 'coi' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    COI Calculator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTpMode('target')}
                                    className={`px-3 py-1.5 text-sm font-medium border-l border-gray-200 ${tpMode === 'target' ? 'bg-primary text-black' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Target Outcome (Prototype)
                                </button>
                            </div>
                        </div>
                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1">

                        {tpMode === 'coi' && (
                        <div className="p-5 space-y-5">
                            <p className="text-sm text-gray-500">Pick a sire and dam to calculate the predicted Coefficient of Inbreeding (COI) for their offspring.</p>
                            <hr className="border-gray-100" />
                            {/* Sire */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sire (Father)</label>
                                <button
                                    type="button"
                                    onClick={() => setModalTarget('tp-sire')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-left transition focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {tpSireId ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{myAnimals.find(a => a.id_public === tpSireId)?.name || selectedTpSireAnimal?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{tpSireId}</div>
                                            </div>
                                            {!myAnimals.find(a => a.id_public === tpSireId) && selectedTpSireAnimal && (
                                                <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">Select Sire...</div>
                                    )}
                                </button>
                            </div>
                            {/* Dam */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dam (Mother)</label>
                                <button
                                    type="button"
                                    onClick={() => setModalTarget('tp-dam')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-left transition focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {tpDamId ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{myAnimals.find(a => a.id_public === tpDamId)?.name || selectedTpDamAnimal?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{tpDamId}</div>
                                            </div>
                                            {!myAnimals.find(a => a.id_public === tpDamId) && selectedTpDamAnimal && (
                                                <span className="text-xs text-black bg-primary px-2 py-1 rounded-full flex-shrink-0">Global</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">Select Dam...</div>
                                    )}
                                </button>
                            </div>
                            {/* Calculate Button */}
                            <hr className="border-gray-100" />
                            <button
                                onClick={handleCalculateTestPairing}
                                disabled={!tpSireId || !tpDamId || tpCalculating}
                                className="w-full py-2 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                {tpCalculating ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
                                ) : (
                                    <><Calculator size={15} /> Calculate COI</>
                                )}
                            </button>
                            {/* Result */}
                            {tpCOI !== null && (
                                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-center">
                                    <div className="text-sm font-medium text-gray-600 mb-1">Predicted COI</div>
                                    <div className="text-3xl font-bold text-gray-800">{tpCOI.toFixed(2)}%</div>
                                </div>
                            )}
                            {/* Error */}
                            {tpError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{tpError}</div>
                            )}
                        </div>
                        )}

                        {tpMode === 'target' && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                            <div className="lg:col-span-3 divide-y divide-gray-200">

                                {/* Pair Source + Species */}
                                <div className="px-5 py-4">
                                    <div className="flex items-end gap-6 flex-wrap">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Pair Source</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setTpSourceMode('mine')}
                                                    className={`px-3 py-1.5 text-sm rounded-lg border ${tpSourceMode === 'mine' ? 'bg-primary text-black border-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    My Animals
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTpSourceMode('mine+favorited')}
                                                    className={`px-3 py-1.5 text-sm rounded-lg border ${tpSourceMode === 'mine+favorited' ? 'bg-primary text-black border-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    My Animals + Favorited
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Species</label>
                                            <div className="px-3 py-1.5 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap">
                                                {TARGET_OUTCOME_PROTOTYPE_SPECIES}
                                            </div>
                                        </div>
                                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 self-end">
                                            <span className="font-semibold">Coming later:</span> {TARGET_OUTCOME_PENDING_SPECIES.join(', ')}
                                        </div>
                                    </div>
                                </div>

                                {/* Trait Chips */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Trait Chips
                                            {tpSelectedTraits.length > 0 && (
                                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-primary/20 text-gray-700 font-semibold normal-case tracking-normal">
                                                    {tpSelectedTraits.length} selected
                                                </span>
                                            )}
                                        </label>
                                        {tpSelectedTraits.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => { setTpSelectedTraits([]); setTpMockResults([]); setTpExpandedCard(null); }}
                                                className="text-xs text-gray-400 hover:text-red-500 transition"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {getTargetTraitChipGroups().map(({ group, chips }) => (
                                            <div key={group}>
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{group}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {chips.map(chip => {
                                                        const active = tpSelectedTraits.includes(chip.id);
                                                        return (
                                                            <button
                                                                key={chip.id}
                                                                type="button"
                                                                onClick={() => toggleTargetTraitChip(chip.id)}
                                                                className={`px-2.5 py-1.5 text-xs rounded-full border transition ${active ? 'bg-primary/20 border-primary text-gray-800' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                                                title={formatTargetTraitChip(chip)}
                                                            >
                                                                {formatTargetTraitChip(chip)}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Live phenotype preview */}
                                {tpSelectedTraits.length > 0 && (() => {
                                    const preview = getPrototypePhenotypeInterpretation(tpSelectedTraits);
                                    const conf = getPrototypePhenotypeConfidence(tpSelectedTraits);
                                    const reqs = getMinimumParentCarrierRequirements(tpSelectedTraits);
                                    const isResolved = conf?.level === 'high' || conf?.level === 'medium';
                                    return (
                                        <div className={`px-5 py-4 border-b border-gray-200 text-xs ${isResolved ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                                            <div className={`flex items-center gap-1.5 ${isResolved ? 'text-emerald-800' : 'text-gray-500'}`}>
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${isResolved ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                <span className="font-semibold flex-shrink-0">Target phenotype:</span>
                                                <span className="truncate">{preview || 'Select chips above to preview'}</span>
                                            </div>
                                            {conf && (
                                                <div className="mt-1 pl-3 text-[10px] text-gray-400">{conf.detail}</div>
                                            )}
                                            {(reqs.bothParents.length > 0 || reqs.oneParent.length > 0) && (
                                                <div className="mt-2 pl-3 space-y-0.5 border-t border-gray-200 pt-2">
                                                    {reqs.bothParents.length > 0 && (
                                                        <div className="text-[10px] text-gray-500">
                                                            <span className="font-medium text-gray-700">Both parents must carry:</span>{' '}
                                                            {reqs.bothParents.map((item, i) => (
                                                                <span key={i}>
                                                                    {i > 0 && ' · '}
                                                                    <span className="font-mono">{item.label}</span>
                                                                    {item.hint && <span className="text-gray-400"> ({item.hint})</span>}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {reqs.oneParent.length > 0 && (
                                                        <div className="text-[10px] text-gray-500">
                                                            <span className="font-medium text-gray-700">At least one parent needs:</span>{' '}
                                                            {reqs.oneParent.map((item, i) => (
                                                                <span key={i}>
                                                                    {i > 0 && ' · '}
                                                                    <span className="font-mono">{item.label}</span>
                                                                    {item.hint && <span className="text-gray-400"> ({item.hint})</span>}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

{/* Run button */}
                                <div className="px-5 py-4">
                                <button
                                    type="button"
                                    onClick={runTargetOutcomePrototype}
                                    disabled={tpSelectedTraits.length === 0 || tpGenerating}
                                    className="w-full py-2 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    {tpGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Building Prototype Results...</> : <><Star size={15} /> Find Best Pairings (Prototype)</>}
                                </button>
                            </div>{/* end Run button section */}

                            </div>{/* end left divide-y column */}

                            <div className="lg:col-span-2 p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700">Ranked Results Preview</h4>
                                    <button
                                        type="button"
                                        onClick={() => setTpShowResultsHelp(v => !v)}
                                        className="text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition"
                                    >
                                        {tpShowResultsHelp ? 'Hide help' : 'What do these scores mean?'}
                                    </button>
                                </div>
                                {tpShowResultsHelp && (
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-800 space-y-1.5">
                                        <div><span className="font-semibold">Target match %</span> — estimated probability that offspring of this pair express your selected target traits (prototype calculation).</div>
                                        <div><span className="font-semibold">COI %</span> — coefficient of inbreeding; lower is generally better. Pairs with a COI warning are flagged in amber.</div>
                                        <div className="pt-0.5 border-t border-blue-200 space-y-1">
                                            <div className="font-semibold text-blue-900">Confidence levels</div>
                                            <div><span className="font-semibold text-emerald-700">High</span> — phenotype resolved, ≥3 loci selected, no assumptions needed.</div>
                                            <div><span className="font-semibold text-amber-700">Medium</span> — phenotype resolved OR ≥2 loci, but may include assumptions.</div>
                                            <div><span className="font-semibold text-gray-600">Needs More Loci</span> — not enough genetic information to resolve a named phenotype; add more trait chips.</div>
                                        </div>
                                        <div className="pt-0.5 border-t border-blue-200">Click the <span className="font-semibold">confidence badge</span> or <span className="font-semibold">Assumptions chip</span> on any result card to expand its full reasoning.</div>
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                    <span className="text-gray-500">Confidence legend:</span>
                                    <span className="px-1.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">High</span>
                                    <span className="px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">Medium</span>
                                    <span className="px-1.5 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">Needs More Loci</span>
                                </div>
                                {tpGenerating ? (
                                    <div className="space-y-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 animate-pulse">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                                                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="h-4 w-6 bg-gray-100 rounded-full" />
                                                        <div className="h-4 w-20 bg-gray-200 rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    <div className="h-6 w-36 bg-gray-100 rounded-lg" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : tpMockResults.length === 0 ? (
                                    <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                                        Select traits and run the prototype to see ranked pair cards here.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                        {tpMockResults.map((r, idx) => {
                                            const cardKey = `${r.sireId}:${r.damId}:${idx}`;
                                            const isExpanded = tpExpandedCard === cardKey;
                                            return (
                                            <div key={cardKey} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                                {/* Card header — always visible */}
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold text-gray-800 truncate">{r.sireName} ({r.sireId}) × {r.damName} ({r.damId})</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                Target match: <span className="font-semibold text-gray-700">{r.probability.toFixed(2)}%</span>
                                                                {' '}•{' '}
                                                                COI: <span className="font-semibold text-gray-700">{r.coiValue.toFixed(2)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">#{idx + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setTpExpandedCard(isExpanded ? null : cardKey)}
                                                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold cursor-pointer transition ${r.phenotypeConfidence?.className || 'bg-gray-100 text-gray-700'}`}
                                                                title={`Click to ${isExpanded ? 'hide' : 'show'} reasoning`}
                                                            >
                                                                {r.phenotypeConfidence?.label || 'Needs More Loci'} {isExpanded ? '▲' : '▼'}
                                                            </button>
                                                            {r.assumptions?.length > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setTpExpandedCard(isExpanded ? null : cardKey)}
                                                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-800 cursor-pointer transition"
                                                                    title="Click to expand reasoning"
                                                                >
                                                                    Assumptions ({r.assumptions.length})
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {r.warnings.length > 0 && (
                                                        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                                            {r.warnings.join(' • ')}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => usePairForPlannedMating(r)}
                                                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        >
                                                            Use Pair in Planned Mating
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Expandable reasoning panel */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-100 bg-gray-50 px-3 py-2.5 space-y-1.5">
                                                        <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Reasoning</div>
                                                        <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                                                            {r.explanation.map((line, i) => <li key={i}>{line}</li>)}
                                                        </ul>
                                                        {r.assumptions?.length > 0 && (
                                                            <div className="mt-1.5 pt-1.5 border-t border-yellow-200">
                                                                <div className="text-[11px] font-semibold text-yellow-800 mb-0.5">Assumptions applied</div>
                                                                <ul className="text-xs text-yellow-700 space-y-0.5 list-disc list-inside">
                                                                    {r.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        )}

                        </div>{/* end scrollable body */}
                        <div className="border-t border-gray-200 px-5 py-3 flex justify-end flex-shrink-0">
                            <button onClick={() => setShowTestPairingModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Test Pairing ? Sire Search Modal */}
            {modalTarget === 'tp-sire' && (
                <ParentSearchModal
                    title="Select Sire"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Male', 'Intersex', 'Unknown']}
                />
            )}

            {/* Test Pairing ? Dam Search Modal */}
            {modalTarget === 'tp-dam' && (
                <ParentSearchModal
                    title="Select Dam"
                    onSelect={handleSelectOtherParentForLitter}
                    onClose={() => setModalTarget(null)}
                    authToken={authToken}
                    showModalMessage={showModalMessage}
                    API_BASE_URL={API_BASE_URL}
                    X={X}
                    Search={Search}
                    Loader2={Loader2}
                    LoadingSpinner={LoadingSpinner}
                    requiredGender={['Female', 'Intersex', 'Unknown']}
                />
            )}

            {/* Litter Photo Modal */}
            {showLitterImageModal && enlargedLitterImageUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
                    onClick={() => setShowLitterImageModal(false)}
                >
                    <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowLitterImageModal(false); }}
                            className="self-end text-white hover:text-gray-300 transition"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={enlargedLitterImageUrl}
                            alt="Litter photo"
                            className="max-w-full max-h-[75vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLitterImageDownload(enlargedLitterImageUrl); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LitterManagement;
