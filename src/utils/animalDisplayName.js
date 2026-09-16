import React from 'react';

const FLAG_EMOJI_TO_CODE = {
    '🇩🇪': 'de',
    '🇬🇧': 'gb',
    '🇺🇸': 'us',
    '🇫🇷': 'fr',
    '🇮🇹': 'it',
    '🇪🇸': 'es',
    '🇳🇴': 'no',
    '🇸🇪': 'se',
    '🇨🇦': 'ca',
    '🇦🇺': 'au',
    '🇳🇿': 'nz',
    '🇨🇭': 'ch',
    '🇧🇪': 'be',
    '🇦🇹': 'at',
    '🇵🇹': 'pt',
    '🇳🇱': 'nl',
    '🇩🇰': 'dk',
    '🇮🇪': 'ie',
    '🇵🇱': 'pl',
    '🇨🇿': 'cz',
    '🇭🇺': 'hu',
    '🇷🇺': 'ru',
    '🇯🇵': 'jp',
    '🇰🇷': 'kr',
    '🇨🇳': 'cn',
    '🇮🇳': 'in',
    '🇧🇷': 'br',
    '🇲🇽': 'mx',
    '🇿🇦': 'za',
    '🇸🇬': 'sg',
    '🇭🇰': 'hk',
    '🇲🇾': 'my',
    '🇹🇭': 'th',
};

const FLAG_REGEX = /(\p{Regional_Indicator}{2})/u;

export const stripManualFlagEmoji = (value = '') => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const match = trimmed.match(FLAG_REGEX);
    if (!match) return trimmed;
    const withoutFlag = trimmed.replace(match[1], '').replace(/\s{2,}/g, ' ').trim();
    return withoutFlag;
};

export const getAnimalDisplayParts = (animal = {}) => {
    const rawSegments = [animal.prefix, animal.name, animal.suffix]
        .map((segment) => (typeof segment === 'string' ? segment.trim() : ''))
        .filter(Boolean);

    let flagCode = null;
    const segments = rawSegments.map((segment) => {
        const match = segment.match(FLAG_REGEX);
        if (!match) return segment;
        if (!flagCode) flagCode = FLAG_EMOJI_TO_CODE[match[1]] || null;
        return stripManualFlagEmoji(segment);
    }).filter(Boolean);

    const displayText = segments.join(' ');

    return {
        flagCode,
        displayText: displayText || rawSegments.join(' ') || 'Unnamed',
        segments,
    };
};

export const formatAnimalDisplayName = (animal = {}) => {
    if (!animal || typeof animal !== 'object') return 'Unnamed';
    const { displayText } = getAnimalDisplayParts(animal);
    return displayText || 'Unnamed';
};

export const AnimalNameWithFlag = ({ animal, className = '', textClassName = '', flagClassName = 'inline-block h-4 w-6 align-middle rounded-sm border border-slate-200 dark:border-slate-700 overflow-hidden', wrapperClassName = 'inline-flex items-center gap-1.5' }) => {
    const { flagCode, displayText } = getAnimalDisplayParts(animal);
    const text = displayText || [animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ') || 'Unnamed';

    return (
        <span
            className={`${wrapperClassName} ${className}`.trim()}
            style={{ direction: 'ltr', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
            {flagCode && (
                <span
                    className={`fi fi-${flagCode} ${flagClassName}`.trim()}
                    aria-label={`${flagCode.toUpperCase()} flag`}
                    style={{ display: 'inline-block', flexShrink: 0, order: 0 }}
                />
            )}
            <span className={textClassName} style={{ order: 1 }}>{text}</span>
        </span>
    );
};
