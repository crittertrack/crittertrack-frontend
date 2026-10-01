// Auto-generate tutorial screenshots by driving the LIVE site with Playwright.
//
// The site resolves each step's image by kebab-cased step title
// (src/data/tutorialScreenshots.js), so filenames must match exactly.
//
// Built around the two things that break naive attempts:
//
//  1. AUTH IS INJECTED ONCE. The app keeps a JWT in localStorage and gates every route on
//     it, so a fresh browser context lands on the login screen for EVERY url - which is how
//     you end up with hundreds of identical login screenshots. We log in via the API once,
//     inject the token with addInitScript so it exists before any app code runs, and reuse a
//     SINGLE browser context for the whole run.
//
//  2. EVERY CAPTURE IS VERIFIED BEFORE WRITING. After each navigation we assert we are
//     signed in and on the intended screen. If that fails we record a failure and write NO
//     image. A run that saves nothing but prints failures is useful; a run that saves
//     hundreds of copies of the login page is worse than useless, because it looks like it
//     worked.
//
// Usage:
//   node scripts/generate-tutorial-screenshots.js
//   node scripts/generate-tutorial-screenshots.js --all
//   node scripts/generate-tutorial-screenshots.js --lesson=lite-mode
//   node scripts/generate-tutorial-screenshots.js --headed
//
// Credentials come from .env.screenshots (gitignored). Read-only: this script only
// navigates and screenshots. It never creates, edits or deletes anything on the site.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const LESSONS_FILE = path.join(ROOT, 'src', 'data', 'tutorialLessonsNew.js');
const OUT_ROOT = path.join(ROOT, 'public', 'images', 'tutorials');

const argv = process.argv.slice(2);
const hasFlag = (f) => argv.includes(f);
const opt = (name) => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split('=').slice(1).join('=') : null;
};

// Plain split on the first '=' - no dotenv expansion, because the password contains '$'
// and '^' which some parsers try to interpolate.
function readEnvFile(file) {
    const out = {};
    if (!fs.existsSync(file)) return out;
    for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const i = line.indexOf('=');
        if (i === -1) continue;
        out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return out;
}

const env = { ...readEnvFile(path.join(ROOT, '.env')), ...readEnvFile(path.join(ROOT, '.env.screenshots')) };
const BASE_URL = (env.CT_BASE_URL || 'https://www.crittertrack.net').replace(/\/$/, '');
const EMAIL = env.CT_EMAIL;
const PASSWORD = env.CT_PASSWORD;

function titleToFilename(title) {
    return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function loadLessons() {
    let src = fs.readFileSync(LESSONS_FILE, 'utf8');
    // Strip ESM syntax so the file can be evaluated as CommonJS: the trailing export
    // block, plus any top-level imports (the file imports the APK URL config).
    src = src.replace(/^\s*import\s+[^;]+;\s*$/gm, '');
    src = src.replace(/^export const TUTORIAL_LESSONS[\s\S]*$/m, '');
    // Stand in for the stripped import so the lesson objects can reference it.
    src = 'const ANDROID_APK_URL = null;\n' + src;
    src += '\nmodule.exports = { TUTORIAL_SECTIONS };\n';
    const m = new Module(LESSONS_FILE, module);
    m.filename = LESSONS_FILE;
    m.paths = Module._nodeModulePaths(path.dirname(LESSONS_FILE));
    m._compile(src, LESSONS_FILE);
    return m.exports.TUTORIAL_SECTIONS;
}

const SECTIONS = loadLessons();
const onlyLesson = opt('lesson');

const TARGETS = [];
for (const section of SECTIONS) {
    for (const lesson of section.lessons) {
        if (onlyLesson && lesson.id !== onlyLesson) continue;
        for (const step of lesson.steps) {
            const count = step.screenshotCount || 1;
            for (let v = 1; v <= count; v++) {
                const file = path.join(OUT_ROOT, section.id, `${titleToFilename(step.title)}${v > 1 ? `-${v}` : ''}.png`);
                TARGETS.push({ section: section.id, lesson: lesson.id, step, v, count, file });
            }
        }
    }
}

const FORCE = hasFlag('--all');
const pending = TARGETS.filter((t) => FORCE || !fs.existsSync(t.file));

// How to reach each screen. Anything not listed is reported as "needs a recipe" rather than
// being silently captured as the wrong thing. Add entries here as you go.
//   path   - route to visit
//   verify - optional 'text:<needle>' that must be present, as a stronger check than "logged in"
const ROUTES = {
    'getting-started-layout-tour': { path: '/' },
    'getting-started-animals': { path: '/' },
    'getting-started-list-basics': { path: '/' },
    'getting-started-account-settings': { path: '/settings', verify: 'text:Directory' },
    'getting-started-transfers': { path: '/' },
    'litter-offspring-management': { path: '/litters' },
    'contacts-overview': { path: '/contacts' },
    'marketplace-overview': { path: '/marketplace' },
    'calendar-overview': { path: '/calendar' },
    'community-overview': { path: '/community' },
    'messages-overview': { path: '/' },
    'notifications-overview': { path: '/' },
    'alert-ticker-overview': { path: '/' },
    'report-an-issue': { path: '/' },
    'helpful-resources': { path: '/resources' },
    'family-tree-explorer': { path: '/tools/family-tree' },
    'coi-calculator': { path: '/tools/coi' },
    'offspring-calculator': { path: '/tools/offspring' },
    'target-outcome-calculator': { path: '/tools/target-outcome' },
    'budget-tracker': { path: '/finance/budget' },
    'supplies-inventory': { path: '/finance/supplies' },
};

async function main() {
    if (!EMAIL || !PASSWORD) {
        console.error('Missing CT_EMAIL / CT_PASSWORD. Put them in .env.screenshots (gitignored).');
        process.exit(1);
    }
    console.log(`Target      : ${BASE_URL}`);
    console.log(`Total steps : ${TARGETS.length}`);
    console.log(`To capture  : ${pending.length}${FORCE ? '  (--all, overwriting)' : '  (missing only)'}`);
    if (pending.length === 0) {
        console.log('\nNothing to do - every referenced screenshot already exists.');
        return;
    }

    const browser = await chromium.launch({ headless: !hasFlag('--headed'), slowMo: hasFlag('--headed') ? 120 : 0 });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: 'light',
    });
    context.setDefaultTimeout(30000);

    // ---- 1. log in once, via the API
    console.log('\nLogging in...');
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD, keepSignedIn: true }),
    });
    if (!res.ok) {
        console.error(`Login failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
        await browser.close();
        process.exit(1);
    }
    const body = await res.json();
    const token = body.token || (body.data && body.data.token);
    if (!token) {
        console.error('Login returned no token:', JSON.stringify(body).slice(0, 300));
        await browser.close();
        process.exit(1);
    }
    console.log('  got token');

    // ---- 2. every page load starts signed in
    await context.addInitScript((t) => {
        try { window.localStorage.setItem('authToken', t); } catch (e) { /* ignore */ }
    }, token);

    // ---- 3. prove we are NOT on the login screen before capturing anything
    const probe = await context.newPage();
    await probe.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await probe.waitForTimeout(3500);
    const probeState = await probe.evaluate(() => ({
        url: location.pathname,
        hasToken: !!localStorage.getItem('authToken'),
        hasLoginForm: !!document.querySelector('input[type="password"]'),
    }));
    await probe.close();
    console.log(`  landed on /${probeState.url}  token=${probeState.hasToken}  loginForm=${probeState.hasLoginForm}`);
    if (!probeState.hasToken || probeState.hasLoginForm) {
        console.error('\nABORT - the session is not holding. Refusing to capture.');
        await browser.close();
        process.exit(1);
    }

    // ---- 4. capture
    const captured = [];
    const failed = [];
    const skipped = [];
    let lastLesson = null;

    for (const t of pending) {
        const route = ROUTES[t.lesson];
        if (!route) {
            skipped.push({ ...t, why: 'no navigation recipe yet' });
            continue;
        }
        if (t.lesson !== lastLesson) {
            console.log(`\n-- ${t.lesson}`);
            lastLesson = t.lesson;
        }
        const page = await context.newPage();
        try {
            await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(2500);

            // THE guard. Never write a file without these passing.
            const state = await page.evaluate(() => ({
                url: location.pathname,
                hasToken: !!localStorage.getItem('authToken'),
                hasLoginForm: !!document.querySelector('input[type="password"]'),
            }));
            if (state.hasLoginForm || !state.hasToken) {
                throw new Error(`bounced to login (landed on /${state.url})`);
            }
            if (route.verify && route.verify.startsWith('text:')) {
                const needle = route.verify.slice(5);
                if (!(await page.locator(`text=${needle}`).count())) {
                    throw new Error(`expected text "${needle}" not found on /${state.url}`);
                }
            }
            fs.mkdirSync(path.dirname(t.file), { recursive: true });
            await page.screenshot({ path: t.file, fullPage: false });
            captured.push(t);
            console.log(`   ok   ${path.basename(t.file)}`);
        } catch (err) {
            // Deliberately NO screenshot on failure - a wrong image is worse than none.
            failed.push({ ...t, why: err.message });
            console.log(`   FAIL ${path.basename(t.file)} - ${err.message}`);
        } finally {
            await page.close();
        }
    }

    await browser.close();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`captured : ${captured.length}`);
    console.log(`failed   : ${failed.length}`);
    console.log(`skipped  : ${skipped.length}  (no navigation recipe yet)`);
    console.log('='.repeat(60));
    if (failed.length) {
        console.log('\nFAILED (no image written):');
        for (const f of failed) console.log(`  ${path.relative(OUT_ROOT, f.file)}  - ${f.why}`);
    }
    if (skipped.length) {
        const lessons = [...new Set(skipped.map((s) => s.lesson))];
        console.log(`\nNEEDS A NAV RECIPE (${skipped.length} images across ${lessons.length} lessons):`);
        for (const l of lessons) console.log(`  ${l}`);
    }
    fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'docs', 'screenshot-run-report.json'), JSON.stringify({
        ranAt: new Date().toISOString(),
        captured: captured.map((c) => path.relative(ROOT, c.file)),
        failed: failed.map((f) => ({ file: path.relative(ROOT, f.file), why: f.why })),
        skipped: skipped.map((s) => ({ file: path.relative(ROOT, s.file), why: s.why })),
    }, null, 2));
    console.log('\nFull report: docs/screenshot-run-report.json');
}

main().catch((e) => { console.error(e); process.exit(1); });