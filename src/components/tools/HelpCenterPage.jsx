import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Bug, CalendarDays, ChevronRight, Download,
  Dna, HeartPulse, HeartHandshake, Lightbulb, Link2, PawPrint, Search, Settings,
  Sparkles, Sprout, ThumbsDown, ThumbsUp
} from 'lucide-react';
import { TUTORIAL_LESSONS } from '../../data/tutorialLessonsNew';

const TOPICS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Set up your account, add animals and learn the basics.',
    Icon: Sprout,
    color: 'green',
  },
  {
    id: 'animals',
    title: 'Animals & Pedigrees',
    description: 'Manage animal records, ownership, collections and family trees.',
    Icon: PawPrint,
    color: 'purple',
  },
  {
    id: 'genetics',
    title: 'Genetics',
    description: 'Explore inherited traits, breeding possibilities and calculators.',
    Icon: Dna,
    color: 'blue',
  },
  {
    id: 'breeding',
    title: 'Breeding & Litters',
    description: 'Track matings, pregnancies, litters, offspring and weaning.',
    Icon: HeartHandshake,
    color: 'orange',
  },
  {
    id: 'care',
    title: 'Health & Care',
    description: 'Keep up with health records, feeding, enclosures and care.',
    Icon: HeartPulse,
    color: 'teal',
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    description: 'Manage your public profile, preferences and account.',
    Icon: Settings,
    color: 'purple',
  },
  {
    id: 'community',
    title: 'Contacts & Community',
    description: 'Connect with breeders, manage contacts and use the marketplace.',
    Icon: HeartHandshake,
    color: 'blue',
  },
  {
    id: 'planning',
    title: 'Planning & Tools',
    description: 'Find guides for supplies, calendar, messages and support.',
    Icon: CalendarDays,
    color: 'orange',
  },
];

const TOPIC_CLASS_NAMES = {
  green: 'bg-emerald-50/70 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-200',
  purple: 'bg-purple-50/70 border-purple-100 text-purple-800 dark:bg-purple-950/20 dark:border-purple-900 dark:text-purple-200',
  blue: 'bg-sky-50/70 border-sky-100 text-sky-800 dark:bg-sky-950/20 dark:border-sky-900 dark:text-sky-200',
  orange: 'bg-orange-50/70 border-orange-100 text-orange-800 dark:bg-orange-950/20 dark:border-orange-900 dark:text-orange-200',
  teal: 'bg-teal-50/70 border-teal-100 text-teal-800 dark:bg-teal-950/20 dark:border-teal-900 dark:text-teal-200',
};

const TOPIC_ICON_CLASS_NAMES = {
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200',
  blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200',
};

const GENETICS_LESSON_IDS = new Set([
  'animal-tab-appearance',
  'offspring-calculator',
  'coi-calculator',
  'target-outcome-calculator',
  'family-tree-explorer',
]);
const BREEDING_LESSON_IDS = new Set([
  'animal-tab-breeding',
  'reproduction-tracking',
  'litter-management',
  'litter-planned-mating',
  'litter-status-transitions',
  'litter-birth-details',
  'litter-offspring-management',
  'litter-expanded-view',
  'litter-auto-calculations',
]);
const CARE_LESSON_IDS = new Set([
  'animal-tab-health',
  'animal-tab-care',
  'health-tracking',
  'feeding-care',
  'enclosures-overview',
]);
const COMMUNITY_LESSON_IDS = new Set([
  'contacts-overview',
  'contacts-add',
  'contacts-detail',
  'contacts-edit',
  'marketplace-overview',
  'community-overview',
  'community-favorites',
  'community-news',
  'community-breeders',
]);
const PLANNING_LESSON_IDS = new Set([
  'calendar-overview',
  'budget-tracker',
  'supplies-inventory',
  'report-an-issue',
  'helpful-resources',
]);

const getTopicId = (lesson, sectionId) => {
  if (GENETICS_LESSON_IDS.has(lesson.id)) return 'genetics';
  if (BREEDING_LESSON_IDS.has(lesson.id)) return 'breeding';
  if (CARE_LESSON_IDS.has(lesson.id)) return 'care';
  if (COMMUNITY_LESSON_IDS.has(lesson.id)) return 'community';
  if (PLANNING_LESSON_IDS.has(lesson.id)) return 'planning';
  if (sectionId === 'getting-started') return 'getting-started';
  if (sectionId === 'settings-tour') return 'profile';
  if (sectionId === 'animal-record-tour' || sectionId === 'animal-list-tour') return 'animals';
  if (sectionId === 'litter-management-tour') return 'breeding';
  return 'planning';
};

const getReadTime = (lesson) => {
  const words = `${lesson.description || ''} ${lesson.steps.map(step => step.content || '').join(' ')}`
    .trim()
    .split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
};

const HOW_TO_ADD_ANIMAL = {
  id: 'how-to-add-an-animal',
  title: 'How to add an animal',
  description: 'Add a new animal to your collection, including identification, appearance, genetics and care details.',
  topicId: 'animals',
  prerequisites: [
    'Know which species to select. You can add a custom species if it is not listed.',
    'Have the animal’s name ready. Identification numbers and other details can be added now or later.',
  ],
  steps: [
    {
      title: 'Open Animal Management',
      content: 'Go to My Animals and select “Add Animal.” On desktop, use the Add Animal button above the list; on mobile, use the + action beside the page title.',
    },
    {
      title: 'Choose the species and enter the details',
      content: 'Search or filter the species list, then select the animal’s species. In the new animal form, enter a name. You can add identification, appearance, genetics, measurements and other information now, or save those details for later.',
    },
    {
      title: 'Save the animal',
      content: 'Select Save at the bottom of the form. The new record is added to My Animals, where you can open it to view or edit its details.',
    },
  ],
  tips: [
    'Choose the species carefully: the species is locked after the animal is created.',
    'You do not need to complete every form section before saving. Add more information by editing the record later.',
    'Public visibility and the Owned/Unowned label are separate settings; review each one when you are ready.',
  ],
  nextSteps: [
    { articleId: 'animal-tab-pedigree', label: 'Add parents and link a pedigree' },
    { articleId: 'animal-tab-health', label: 'Record health information' },
    { articleId: 'animal-tab-timeline', label: 'Explore the animal’s timeline' },
  ],
  relatedArticleIds: [
    'animal-tab-identification',
    'animal-tab-pedigree',
    'animal-list-overview',
    'animal-collections',
  ],
};

const ACCOUNT_ACCESS_ARTICLE = {
  id: 'account-access-and-recovery',
  title: 'Create an account, sign in, or reset your password',
  description: 'Register with email verification, sign in to CritterTrack, or recover access if you forget your password.',
  topicId: 'getting-started',
  searchTerms: ['register', 'registration', 'verify email', 'verification code', 'forgot password', 'login'],
  steps: [
    {
      title: 'Create your account',
      content: 'On the welcome screen, choose “Register Here.” Enter your personal name, email address, password, and password confirmation, then agree to the Terms of Service and Privacy Policy. Select Register to request a verification code.',
    },
    {
      title: 'Verify your email',
      content: 'Enter the 6-digit code sent to your email address and choose “Verify & Create Account.” The code expires after 10 minutes. If it expires or does not arrive, use “Resend Code” or “Change Email or Start Over.” Successful verification creates your account and signs you in.',
    },
    {
      title: 'Sign in',
      content: 'Enter the email address and password for your account on the welcome screen and choose Log In. Select “Keep me signed in” if you want this browser or app to retain your sign-in.',
    },
    {
      title: 'Reset a forgotten password',
      content: 'Choose “Forgot Password?” and enter the email address associated with your account. Open the password-reset email and select its reset button. The link expires after 1 hour. Enter and confirm a new password, then choose Reset Password. Return to the welcome screen and sign in with the new password.',
    },
  ],
  tips: [
    'Check your spam or junk folder if a verification or password-reset email is not in your inbox.',
    'If a verification code expires, request a new one instead of repeatedly submitting the expired code.',
  ],
  relatedArticleIds: ['install-crittertrack-pwa', 'getting-started-account-settings'],
};

const PWA_INSTALL_ARTICLE = {
  id: 'install-crittertrack-pwa',
  title: 'Install CritterTrack as a web app',
  description: 'Add the CritterTrack website to your phone or computer home screen so it opens like an app.',
  topicId: 'getting-started',
  searchTerms: ['PWA', 'web app', 'add to home screen', 'install website', 'iPhone', 'iPad'],
  steps: [
    {
      title: 'Open the install option',
      content: 'On the CritterTrack welcome screen, find “Install CritterTrack (Web)” below the Google Play app option. On supported desktop and Android browsers, select it and accept the browser’s install prompt. The option may be unavailable in browsers that do not support web-app installation.',
    },
    {
      title: 'Add it from iPhone or iPad',
      content: 'Open CritterTrack in Safari, select Share, scroll down and choose “Add to Home Screen,” then confirm with Add. The web install button opens these instructions on iOS because Safari does not provide the same automatic install prompt.',
    },
    {
      title: 'Open CritterTrack from your home screen',
      content: 'Use the new CritterTrack icon to open the web app. Sign in with your existing account. It uses your CritterTrack account and can keep changes available offline to sync when you are online again.',
    },
  ],
  tips: [
    'On Android, the Google Play app is a separate native app and is listed above the web install option.',
    'If the web install option is disabled, try a supported browser. On iPhone or iPad, use Safari and follow the Add to Home Screen steps.',
  ],
  relatedArticleIds: ['install-the-app', 'lite-mode', 'account-access-and-recovery'],
};

const SUPPORT_CRITTERTRACK_ARTICLE = {
  id: 'support-crittertrack',
  title: 'Support CritterTrack and view its supporters',
  description: 'Learn how voluntary support works and where to see the community members who choose to be listed.',
  topicId: 'planning',
  searchTerms: ['donate', 'donation', 'Ko-fi', 'supporters', 'monthly member'],
  steps: [
    {
      title: 'Open the support page',
      content: 'From the web welcome screen, choose “Learn More & Donate.” In the Android app, choose “Support CritterTrack” to open Ko-fi directly. CritterTrack is free to use, with no required subscription or premium tier. Donations are voluntary and help fund hosting, maintenance, and development.',
    },
    {
      title: 'Choose whether to support',
      content: 'On the Support CritterTrack page, choose “Support on Ko-fi” to make a one-time donation or become a monthly member. Ko-fi processes payments and manages monthly subscriptions. Supporting the project is optional and is not required to use CritterTrack.',
      link: {
        label: 'Open CritterTrack on Ko-fi',
        url: 'https://ko-fi.com/crittertrack',
      },
    },
    {
      title: 'View public supporters',
      content: 'Choose a supporter name or the supporter link in the scrolling news ticker to open the public Supporters list. It only displays people who chose to be shown publicly on Ko-fi, so it is not a complete list of everyone who has supported CritterTrack.',
    },
  ],
  relatedArticleIds: ['helpful-resources', 'report-an-issue'],
};

const CUSTOM_SPECIES_ARTICLE = {
  id: 'add-custom-species',
  title: 'Add or request a species',
  description: 'Add a species that is missing from the picker, or request changes to the fields used for a species.',
  topicId: 'getting-started',
  searchTerms: ['custom species', 'new species', 'scientific name', 'latin name', 'species fields'],
  steps: [
    {
      title: 'Open species management',
      content: 'When adding an animal, choose “Add New Species” from the species picker. You can also open Manage Species from the species-selection screen.',
    },
    {
      title: 'Add the missing species',
      content: 'Enter the species name, choose its category, and optionally enter its Latin or scientific name. Select Add. Species you contribute are added to the shared list and become available to all users, so search the list first to avoid adding a duplicate.',
    },
    {
      title: 'Find a species in the picker',
      content: 'Search by common or Latin name, or filter by category. Use the star on a species to add or remove it from your favorites. Favorites are saved in this browser and appear near the top of the picker.',
    },
    {
      title: 'Request different species fields',
      content: 'If a species needs different or additional animal-record fields, choose “Request Species Customization” in Manage Species. Select the species, describe the fields that should change or be added, and send the request for review.',
    },
  ],
  tips: [
    'The species name is locked on an animal after you create its record. Confirm the selection before saving.',
    'Default species are locked in the management list. Community-added species appear as shared entries.',
  ],
  relatedArticleIds: ['how-to-add-an-animal', 'animal-tab-customize'],
};

const LESSONS = TUTORIAL_LESSONS.sections.flatMap(section =>
  section.lessons.map(lesson => ({ ...lesson, sourceSectionId: section.id }))
);
const LEGACY_LESSON_TO_ARTICLE = new Map(LESSONS.map(lesson => [
  lesson.id,
  lesson.id === 'getting-started-animals' ? HOW_TO_ADD_ANIMAL.id : lesson.id,
]));

const ARTICLES = [
  HOW_TO_ADD_ANIMAL,
  ACCOUNT_ACCESS_ARTICLE,
  PWA_INSTALL_ARTICLE,
  SUPPORT_CRITTERTRACK_ARTICLE,
  CUSTOM_SPECIES_ARTICLE,
  ...LESSONS.filter(lesson => lesson.id !== 'getting-started-animals').map(lesson => {
    const topicId = getTopicId(lesson, lesson.sourceSectionId);
    return {
      ...lesson,
      topicId,
      topicTitle: TOPICS.find(topic => topic.id === topicId)?.title || 'Planning & Tools',
      readTime: getReadTime(lesson),
    };
  }),
].map(article => ({
  ...article,
  topicTitle: TOPICS.find(topic => topic.id === article.topicId)?.title || 'Planning & Tools',
  readTime: article.readTime || getReadTime(article),
}));

const POPULAR_ARTICLE_IDS = [
  'how-to-add-an-animal',
  'account-access-and-recovery',
  'install-crittertrack-pwa',
  'support-crittertrack',
];

const HelpCenterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(
    LEGACY_LESSON_TO_ARTICLE.get(searchParams.get('lesson') || searchParams.get('article'))
  );
  const [helpfulVote, setHelpfulVote] = useState(null);

  useEffect(() => {
    const articleId = searchParams.get('lesson') || searchParams.get('article');
    setSelectedArticleId(LEGACY_LESSON_TO_ARTICLE.get(articleId) || articleId);
  }, [searchParams]);

  useEffect(() => {
    setHelpfulVote(null);
  }, [selectedArticleId]);

  const selectedArticle = ARTICLES.find(article => article.id === selectedArticleId);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleArticles = useMemo(() => ARTICLES.filter(article => {
    if (activeTopicId && activeTopicId !== 'all' && article.topicId !== activeTopicId) return false;
    if (!normalizedQuery) return true;
    const searchableText = [
      article.title,
      article.description,
      article.topicTitle,
      ...(article.searchTerms || []),
      ...article.steps.flatMap(step => [step.title, step.content]),
    ].join(' ').toLocaleLowerCase();
    return searchableText.includes(normalizedQuery);
  }), [activeTopicId, normalizedQuery]);

  const openArticle = (article) => {
    if (!article) return;
    setSelectedArticleId(article.id);
    setSearchParams({ lesson: article.id });
  };

  const openTopic = (topicId) => {
    setQuery('');
    setActiveTopicId(topicId);
    setSelectedArticleId(null);
    setSearchParams({});
  };

  const returnToBrowse = () => {
    setSelectedArticleId(null);
    setSearchParams({});
  };

  const resetHome = () => {
    setQuery('');
    setActiveTopicId(null);
    returnToBrowse();
  };

  return (
    <main className="w-full max-w-7xl mx-auto overflow-hidden rounded-xl bg-white shadow-lg dark:bg-dark-card-bg">
      <section className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-primary/20 via-white to-emerald-50 px-5 py-8 sm:px-8 sm:py-10 dark:from-dark-primary/15 dark:via-dark-card-bg dark:to-emerald-950/20">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute right-36 top-16 h-24 w-24 rounded-full border-[18px] border-emerald-100/50 dark:border-emerald-900/30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-dark dark:text-dark-primary">
            CritterTrack Help Center
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-text sm:text-4xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 dark:text-dark-text-secondary sm:text-base">
            Find clear answers and practical guides for getting the most out of CritterTrack.
          </p>
          <label className="mx-auto mt-5 flex max-w-2xl items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-md transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 dark:border-dark-border dark:bg-dark-surface">
            <Search size={19} className="flex-shrink-0 text-gray-500 dark:text-dark-text-muted" />
            <input
              type="search"
              value={query}
              onChange={event => {
                setQuery(event.target.value);
                setSelectedArticleId(null);
                if (searchParams.has('lesson') || searchParams.has('article')) setSearchParams({});
              }}
              placeholder="Search help articles..."
              aria-label="Search help articles"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-dark-text dark:placeholder:text-dark-text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-semibold text-primary-dark hover:underline dark:text-dark-primary"
              >
                Clear
              </button>
            )}
          </label>
        </div>
      </section>

      {selectedArticle ? (
        <ArticleDetail
          article={selectedArticle}
          articles={ARTICLES}
          topics={TOPICS}
          backLabel={
            normalizedQuery
              ? 'Back to search results'
              : activeTopicId === 'all'
                ? 'Back to all articles'
                : activeTopicId
                  ? `Back to ${TOPICS.find(topic => topic.id === activeTopicId)?.title || 'topic'}`
                  : 'Back to Help Center'
          }
          helpfulVote={helpfulVote}
          onVote={setHelpfulVote}
          onBack={returnToBrowse}
          onSelectArticle={openArticle}
          onSelectTopic={openTopic}
        />
      ) : normalizedQuery || activeTopicId ? (
        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-dark dark:text-dark-primary">
                {normalizedQuery ? 'Search results' : activeTopicId === 'all' ? 'Help library' : 'Browse by topic'}
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-dark-text">
                {normalizedQuery
                  ? `Results for “${query.trim()}”`
                  : activeTopicId === 'all'
                    ? 'All help articles'
                    : TOPICS.find(topic => topic.id === activeTopicId)?.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetHome}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary-dark dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-secondary dark:hover:text-dark-primary"
            >
              <ArrowLeft size={15} />
              {normalizedQuery ? 'Clear search & browse topics' : 'Back to all topics'}
            </button>
          </div>
          {visibleArticles.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map(article => (
                <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center dark:border-dark-border">
              <Search size={24} className="mx-auto text-gray-400" />
              <h3 className="mt-3 font-semibold text-gray-800 dark:text-dark-text">No articles found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-muted">
                Try different words or browse a topic.
              </p>
              <button
                type="button"
                onClick={resetHome}
                className="mt-4 text-sm font-semibold text-primary-dark hover:underline dark:text-dark-primary"
              >
                Browse all topics
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="px-5 py-6 sm:px-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={17} className="text-primary-dark dark:text-dark-primary" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text">Browse by topic</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TOPICS.map(({ id, title, description, Icon, color }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setActiveTopicId(id)}
                  className={`group min-h-40 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${TOPIC_CLASS_NAMES[color]}`}
                >
                  <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${TOPIC_ICON_CLASS_NAMES[color]}`}>
                    <Icon size={20} />
                  </span>
                  <span className="block font-bold">{title}</span>
                  <span className="mt-1.5 block text-xs leading-relaxed opacity-80">{description}</span>
                  <span className="mt-2 block text-[11px] font-semibold opacity-70">
                    {ARTICLES.filter(article => article.topicId === id).length} guides
                  </span>
                  <ArrowRight size={16} className="mt-3 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-gray-100 px-5 py-6 sm:px-8 dark:border-dark-border">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-dark dark:text-dark-primary">A good place to start</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-dark-text">Popular guides</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTopicId('all')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:underline dark:text-dark-primary"
              >
                View all articles <ArrowRight size={13} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {POPULAR_ARTICLE_IDS.map(id => ARTICLES.find(article => article.id === id)).filter(Boolean).map(article => (
                <ArticleCard key={article.id} article={article} onClick={() => openArticle(article)} compact />
              ))}
            </div>
          </section>
        </>
      )}

      <footer className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-secondary">
        <span className="inline-flex items-center gap-2">
          <Bug size={16} />
          Still need help?
        </span>
        <Link
          to="/report"
          className="inline-flex items-center gap-1 font-semibold text-primary-dark hover:underline dark:text-dark-primary"
        >
          Contact CritterTrack support <ArrowRight size={14} />
        </Link>
      </footer>
    </main>
  );
};

const ArticleDetail = ({ article, articles, topics, backLabel, helpfulVote, onVote, onBack, onSelectArticle, onSelectTopic }) => {
  const topic = topics.find(item => item.id === article.topicId);
  const relatedArticles = (article.relatedArticleIds || articles
    .filter(item => item.topicId === article.topicId && item.id !== article.id)
    .slice(0, 4).map(item => item.id))
    .map(id => articles.find(item => item.id === id))
    .filter(Boolean);
  const topicArticles = articles.filter(item => item.topicId === article.topicId);
  const sectionLinks = [
    ...(article.prerequisites?.length ? [{ id: 'before-you-start', label: 'Before you start' }] : []),
    { id: 'step-by-step-guide', label: 'Step-by-step guide' },
    ...article.steps.map((step, index) => ({
      id: `article-step-${index + 1}`,
      label: step.title,
    })),
    ...(article.tips?.length ? [{ id: 'helpful-tips', label: 'Helpful tips' }] : []),
    ...(article.nextSteps?.length ? [{ id: 'next-steps', label: 'Next steps' }] : []),
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_220px]">
      <aside className="hidden border-r border-gray-100 bg-gray-50/70 p-4 dark:border-dark-border dark:bg-dark-surface lg:block">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-semibold text-gray-700 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary-dark dark:border-dark-border dark:bg-dark-card-bg dark:text-dark-text-secondary dark:hover:text-dark-primary"
        >
          <ArrowLeft size={15} />
          {backLabel}
        </button>
        <div className="mb-2 flex items-center gap-2 px-2 text-sm font-bold text-gray-900 dark:text-dark-text">
          {topic && <topic.Icon size={17} className="text-primary-dark dark:text-dark-primary" />}
          {topic?.title || article.topicTitle}
        </div>
        <nav aria-label={`${topic?.title || 'Help'} articles`} className="space-y-1">
          {topicArticles.map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectArticle(item)}
              aria-current={item.id === article.id ? 'page' : undefined}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs leading-relaxed transition ${
                item.id === article.id
                  ? 'bg-primary/15 font-semibold text-primary-dark dark:bg-dark-primary/15 dark:text-dark-primary'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 dark:text-dark-text-secondary dark:hover:bg-dark-card-bg dark:hover:text-dark-text'
              }`}
            >
              {item.title}
            </button>
          ))}
        </nav>
        <div className="my-4 border-t border-gray-200 dark:border-dark-border" />
        <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-dark-text-muted">
          Related topics
        </p>
        <nav aria-label="Related topics" className="space-y-1">
          {topics.filter(item => item.id !== topic?.id).slice(0, 4).map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectTopic(item.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-gray-600 transition hover:bg-white hover:text-primary-dark dark:text-dark-text-secondary dark:hover:bg-dark-card-bg dark:hover:text-dark-primary"
            >
              <item.Icon size={15} />
              {item.title}
            </button>
          ))}
        </nav>
      </aside>

      <article className="min-w-0 px-5 py-6 sm:px-7 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-dark-text-muted">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary-dark dark:border-dark-border dark:bg-dark-card-bg dark:text-dark-text-secondary dark:hover:text-dark-primary lg:hidden"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </button>
          <ChevronRight size={13} />
          <span>{topic?.title || article.topicTitle}</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-primary-dark dark:text-dark-primary">{article.title}</span>
        </div>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-dark dark:bg-dark-primary/15 dark:text-dark-primary">
            {topic ? <topic.Icon size={25} /> : <BookOpen size={25} />}
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-semibold text-gray-500 dark:text-dark-text-muted">
              {article.readTime} min read
              <span className="mx-2">·</span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-primary-dark dark:bg-dark-primary/10 dark:text-dark-primary">
                {topic?.title || article.topicTitle}
              </span>
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-text sm:text-3xl">
              {article.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-dark-text-secondary">
              {article.description}
            </p>
          </div>
        </div>

        <div className="mb-5 lg:hidden">
          <label htmlFor="help-topic-article-select" className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-text-secondary">
            More in {topic?.title || article.topicTitle}
          </label>
          <select
            id="help-topic-article-select"
            value={article.id}
            onChange={event => {
              const nextArticle = articles.find(item => item.id === event.target.value);
              if (nextArticle) onSelectArticle(nextArticle);
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
          >
            {topicArticles.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>

        {article.prerequisites?.length > 0 && (
          <section id="before-you-start" className="mb-6 scroll-mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-dark-text">
              <Lightbulb size={17} className="text-emerald-700 dark:text-emerald-300" />
              Before you start
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-gray-700 dark:text-dark-text-secondary">
              {article.prerequisites.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        )}

        <section id="step-by-step-guide" className="scroll-mt-5">
          <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-dark-text">Step-by-step guide</h3>
          <ol className="divide-y divide-gray-100 dark:divide-dark-border">
            {article.steps.map((step, index) => (
              <li id={`article-step-${index + 1}`} key={`${article.id}-${index}`} className="flex scroll-mt-5 gap-3 py-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-dark-text">{step.title}</h4>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-gray-600 dark:text-dark-text-secondary">{step.content}</p>
                  {step.link?.url && (
                    <a
                      href={step.link.url}
                      download={step.link.download || undefined}
                      target={step.link.download ? undefined : '_blank'}
                      rel={step.link.download ? undefined : 'noopener noreferrer'}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-dark hover:underline dark:text-dark-primary"
                    >
                      {step.link.label}{step.link.download ? <Download size={13} /> : <ArrowRight size={13} />}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {article.tips?.length > 0 && (
          <section id="helpful-tips" className="mt-3 scroll-mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-dark-text">
              <BookOpen size={16} className="text-emerald-700 dark:text-emerald-300" />
              Helpful tips
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-gray-700 dark:text-dark-text-secondary">
              {article.tips.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        )}

        {article.nextSteps?.length > 0 && (
          <section id="next-steps" className="mt-4 scroll-mt-5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-dark-text">
              <Link2 size={16} className="text-indigo-700 dark:text-indigo-300" />
              Next steps
            </h3>
            <p className="mt-1 text-xs text-gray-600 dark:text-dark-text-secondary">After you finish this guide, you may want to:</p>
            <ul className="mt-2 space-y-1.5">
              {article.nextSteps.map(item => {
                const nextArticle = articles.find(candidate => candidate.id === item.articleId);
                return nextArticle ? (
                  <li key={item.articleId}>
                    <button
                      type="button"
                      onClick={() => onSelectArticle(nextArticle)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                    >
                      <ArrowRight size={13} />{item.label}
                    </button>
                  </li>
                ) : null;
              })}
            </ul>
          </section>
        )}

        <section className="mt-6 border-t border-gray-100 pt-4 dark:border-dark-border">
          <p className="text-xs font-semibold text-gray-700 dark:text-dark-text-secondary">Was this article helpful?</p>
          {helpfulVote && (
            <p className="mt-2 text-[11px] text-gray-500 dark:text-dark-text-muted">
              Your response is selected for this visit.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button type="button" aria-pressed={helpfulVote === 'yes'} onClick={() => onVote('yes')} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${helpfulVote === 'yes' ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-emerald-950/20'}`}>
              <ThumbsUp size={14} /> Yes
            </button>
            <button type="button" aria-pressed={helpfulVote === 'no'} onClick={() => onVote('no')} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${helpfulVote === 'no' ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-emerald-950/20'}`}>
              <ThumbsDown size={14} /> No
            </button>
          </div>
        </section>
      </article>

      <aside className="hidden border-l border-gray-100 p-4 dark:border-dark-border xl:block">
        <div className="sticky top-4 space-y-4">
          <section className="rounded-xl border border-gray-200 p-3 dark:border-dark-border">
            <h3 className="text-xs font-bold text-gray-900 dark:text-dark-text">In this article</h3>
            <nav className="mt-2 space-y-1" aria-label="In this article">
              {sectionLinks.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-gray-700 hover:bg-primary/10 hover:text-primary-dark dark:text-dark-text-secondary dark:hover:bg-dark-primary/10 dark:hover:text-dark-primary"
                >
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">{index + 1}.</span>{item.label}
                </a>
              ))}
            </nav>
          </section>

          {relatedArticles.length > 0 && (
            <section className="rounded-xl border border-gray-200 p-3 dark:border-dark-border">
              <h3 className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-dark-text">
                <BookOpen size={15} /> Related articles
              </h3>
              <div className="mt-2 space-y-1">
                {relatedArticles.map(item => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onSelectArticle(item)}
                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-2 text-left text-[11px] text-gray-700 hover:bg-gray-50 dark:text-dark-text-secondary dark:hover:bg-dark-surface"
                  >
                    <BookOpen size={13} className="flex-shrink-0 text-primary-dark dark:text-dark-primary" />
                    <span className="min-w-0 flex-1">{item.title}</span>
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <h3 className="text-xs font-bold text-gray-900 dark:text-dark-text">Still need help?</h3>
            <p className="mt-1 text-[11px] text-gray-600 dark:text-dark-text-secondary">Our support team is here for you.</p>
            <Link to="/report" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-emerald-900/40">
              Contact support <ArrowRight size={13} />
            </Link>
          </section>
        </div>
      </aside>
    </div>
  );
};

const ArticleCard = ({ article, onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-start gap-3 rounded-xl border border-gray-200 bg-white text-left transition hover:border-primary/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-dark-border dark:bg-dark-card-bg ${compact ? 'p-3' : 'p-4'}`}
  >
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-dark dark:bg-dark-primary/15 dark:text-dark-primary">
      <BookOpen size={17} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-semibold leading-snug text-gray-900 dark:text-dark-text">{article.title}</span>
      {compact ? (
        <span className="mt-1 block text-xs text-gray-500 dark:text-dark-text-muted">
          {article.topicTitle} · {article.readTime} min read
        </span>
      ) : (
        <span className="mt-1.5 block text-sm leading-relaxed text-gray-600 dark:text-dark-text-secondary">
          {article.description}
        </span>
      )}
    </span>
    <ArrowRight size={15} className="mt-1 flex-shrink-0 text-primary-dark transition-transform group-hover:translate-x-0.5 dark:text-dark-primary" />
  </button>
);

export default HelpCenterPage;
