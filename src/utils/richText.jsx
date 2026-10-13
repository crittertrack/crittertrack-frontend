import React from 'react';
import { Link } from 'react-router-dom';

// Inline pattern: [label](url), **bold**, *italic* or _italic_ (single-level only, no nesting/escaping).
const INLINE_PATTERN = /(\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*\n]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g;
const LINK_PATTERN = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/;

const LINK_CLASS = 'text-blue-600 dark:text-blue-400 underline hover:no-underline break-words';

// Hostnames treated as "this site", so absolute links to it stay inside the app.
const INTERNAL_HOSTS = new Set(['crittertrack.com', 'www.crittertrack.com', 'crittertrack.net', 'www.crittertrack.net']);

/**
 * Classifies a link target:
 *  - { kind: 'internal', to } for in-app paths ("/community/news") and absolute URLs to this site
 *  - { kind: 'external', href } for other http(s)/mailto links
 *  - null for anything unsafe or unusable (javascript:, data:, empty, ...)
 */
export function resolveLink(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return null;

    // In-app path. "//host" is protocol-relative (external), so it is not treated as internal.
    if (url.startsWith('/') && !url.startsWith('//')) {
        return { kind: 'internal', to: url };
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return null;
    }

    if (parsed.protocol === 'mailto:') return { kind: 'external', href: url };
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    if (parsed.hostname === currentHost || INTERNAL_HOSTS.has(parsed.hostname)) {
        return { kind: 'internal', to: `${parsed.pathname}${parsed.search}${parsed.hash}` || '/' };
    }
    return { kind: 'external', href: url };
}

/**
 * A link that stays inside the app (React Router) for internal targets, and opens in a new
 * tab for external ones. Unsafe targets render as plain text. Pass children to override the label.
 */
export function SmartLink({ url, children, className = LINK_CLASS }) {
    const target = resolveLink(url);
    if (!target) return <>{children || url}</>;
    if (target.kind === 'internal') {
        return <Link to={target.to} className={className}>{children || target.to}</Link>;
    }
    return (
        <a href={target.href} target="_blank" rel="noopener noreferrer" className={className}>
            {children || target.href}
        </a>
    );
}

function renderInline(line, keyPrefix) {
    const parts = line.split(INLINE_PATTERN).filter(part => part !== '');
    return parts.map((part, i) => {
        const key = `${keyPrefix}-${i}`;
        const link = part.match(LINK_PATTERN);
        if (link) {
            return <SmartLink key={key} url={link[2]}>{link[1]}</SmartLink>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={key}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={key}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={key}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
}

/**
 * Renders admin-authored broadcast/announcement text as React nodes (no dangerouslySetInnerHTML):
 * preserves line breaks and supports **bold**, *italic* (or _italic_) and [label](url) links.
 * Links starting with "/" (or pointing at this site) navigate inside the app; others open in a new tab.
 */
export function renderRichText(text) {
    if (!text) return null;
    return String(text).split('\n').map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {renderInline(line, lineIdx)}
        </React.Fragment>
    ));
}
