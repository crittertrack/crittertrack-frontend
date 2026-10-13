import React from 'react';
import { Link } from 'react-router-dom';

// Inline pattern: [label](url), **bold**, *italic* or _italic_ (single-level only, no nesting/escaping).
// Bold may contain links, e.g. **[Get the app](https://example.com)**.
const INLINE_PATTERN = /(\[[^\]\n]+\]\([^)\s]+\)|\*\*(?:\[[^\]\n]+\]\([^)\s]+\)|[^*\n])+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g;
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
            return <strong key={key}>{renderInline(part.slice(2, -2), `${key}b`)}</strong>;
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
    const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    let prevWasText = false;
    return lines.map((line, lineIdx) => {
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        const bullet = line.match(/^\s*-\s+(.+)$/);

        // Headings and bullets are block-level (spans with display:block so this stays valid inside <p>)
        if (heading) {
            prevWasText = false;
            const cls = heading[1].length === 1
                ? 'block text-lg font-bold mt-2 mb-1'
                : 'block text-base font-bold mt-3 mb-1';
            return <span key={lineIdx} className={cls}>{renderInline(heading[2], lineIdx)}</span>;
        }
        if (bullet) {
            prevWasText = false;
            return (
                <span key={lineIdx} className="flex gap-2 pl-2 mb-1">
                    <span aria-hidden="true">•</span>
                    <span className="min-w-0 flex-1">{renderInline(bullet[1], lineIdx)}</span>
                </span>
            );
        }

        // Plain line: a <br /> separates it from a previous plain line (blank lines stay as spacing)
        const node = (
            <React.Fragment key={lineIdx}>
                {prevWasText && <br />}
                {renderInline(line, lineIdx)}
            </React.Fragment>
        );
        prevWasText = true;
        return node;
    });
}
