import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Bug, CalendarDays, Dna, HeartPulse,
  HeartHandshake, PawPrint, Search, Settings, Sparkles, Sprout
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

const ARTICLE_GROUPS = [
  {
    id: 'getting-around',
    title: 'Getting around CritterTrack',
    description: 'Learn the main navigation, account menu and the differences between Full and Lite mode.',
    topicId: 'getting-started',
    keywords: ['navigation', 'menu', 'lite', 'full mode', 'mobile'],
    lessonIds: ['getting-started-layout-tour', 'lite-mode'],
  },
  {
    id: 'animal-records',
    title: 'Create and manage animal records',
    description: 'Add an animal, edit its record, and understand the identification, pedigree, gallery and record sections.',
    topicId: 'animals',
    keywords: ['add animal', 'edit animal', 'species', 'identification', 'pedigree', 'gallery', 'archive', 'duplicates', 'ownership'],
    lessonIds: [
      'getting-started-animals',
      'animal-tab-dashboard',
      'animal-tab-identification',
      'animal-tab-pedigree',
      'animal-tab-gallery',
      'animal-tab-timeline',
      'animal-tab-records',
      'animal-tab-view-only',
      'animal-tab-customize',
      'getting-started-transfers',
      'getting-started-list-basics',
      'animal-list-overview',
      'animal-collections',
      'archive-overview',
    ],
  },
  {
    id: 'genetics-guide',
    title: 'Genetics and appearance',
    description: 'Record appearance and genetic traits, then explore inheritance and possible breeding outcomes.',
    topicId: 'genetics',
    keywords: ['traits', 'genetic code', 'inheritance', 'offspring', 'COI', 'inbreeding', 'target outcome', 'family tree'],
    lessonIds: [
      'animal-tab-appearance',
      'offspring-calculator',
      'coi-calculator',
      'target-outcome-calculator',
      'family-tree-explorer',
    ],
  },
  {
    id: 'daily-care',
    title: 'Health, feeding and enclosure care',
    description: 'Keep health and treatment records, assign care tasks and supplies, and record feeding with the right quantity.',
    topicId: 'care',
    keywords: ['health', 'treatment', 'medication', 'quarantine', 'feeding', 'supplies', 'quantity', 'units', 'enclosure', 'care tasks'],
    lessonIds: [
      'animal-tab-health',
      'animal-tab-care',
      'health-tracking',
      'feeding-care',
      'enclosures-overview',
    ],
  },
  {
    id: 'breeding-lifecycle',
    title: 'Breeding, litters and weaning',
    description: 'Follow the breeding lifecycle from mating and pregnancy through birth, offspring and weaning.',
    topicId: 'breeding',
    keywords: ['mating', 'pregnancy', 'birth', 'litter', 'offspring', 'weaned', 'reproduction'],
    lessonIds: [
      'animal-tab-breeding',
      'reproduction-tracking',
      'litter-management',
      'litter-planned-mating',
      'litter-status-transitions',
      'litter-birth-details',
      'litter-offspring-management',
      'litter-expanded-view',
    ],
  },
  {
    id: 'profile-and-settings',
    title: 'Profile, privacy and account settings',
    description: 'Set up your public profile and manage visibility, directory preferences, data and account options.',
    topicId: 'profile',
    keywords: ['profile', 'privacy', 'directory', 'ratings', 'breeding lines', 'dropdown lists', 'import', 'export', 'account'],
    lessonIds: [
      'getting-started-account-settings',
      'profile-view',
      'settings-profile',
      'settings-info-adoption',
      'settings-directory',
      'settings-ratings',
      'settings-breeding-lines',
      'settings-appearance-options',
      'settings-data-portability',
      'settings-account',
    ],
  },
  {
    id: 'contacts',
    title: 'Manage contacts',
    description: 'Add a contact, keep their details current, and review animals associated with them.',
    topicId: 'community',
    keywords: ['contacts', 'breeder', 'keeper', 'owned animals', 'bred animals'],
    lessonIds: ['contacts-overview', 'contacts-add', 'contacts-detail', 'contacts-edit'],
  },
  {
    id: 'notifications',
    title: 'Notifications and reminders',
    description: 'Understand the notification center, alert ticker and reminders linked to current animal or litter records.',
    topicId: 'planning',
    keywords: ['notification', 'alert', 'reminder', 'ticker', 'unread'],
    lessonIds: ['notifications-overview', 'alert-ticker-overview'],
  },
];

const LESSONS = TUTORIAL_LESSONS.sections.flatMap(section =>
  section.lessons.map(lesson => ({ ...lesson, sourceSectionId: section.id }))
);
const LESSONS_BY_ID = new Map(LESSONS.map(lesson => [lesson.id, lesson]));
const GROUPED_LESSON_IDS = new Set(ARTICLE_GROUPS.flatMap(group => group.lessonIds));
const LEGACY_LESSON_TO_ARTICLE = new Map();

const ARTICLES = [
  ...ARTICLE_GROUPS.map(group => {
    const lessons = group.lessonIds.map(id => LESSONS_BY_ID.get(id)).filter(Boolean);
    const topicTitle = TOPICS.find(topic => topic.id === group.topicId)?.title || 'Planning & Tools';
    const words = [
      group.description,
      ...lessons.flatMap(lesson => [lesson.description, ...lesson.steps.map(step => step.content)]),
    ].join(' ').trim().split(/\s+/).filter(Boolean).length;

    lessons.forEach(lesson => LEGACY_LESSON_TO_ARTICLE.set(lesson.id, group.id));
    return {
      id: group.id,
      title: group.title,
      description: group.description,
      topicId: group.topicId,
      topicTitle,
      keywords: group.keywords,
      readTime: Math.max(1, Math.ceil(words / 180)),
      steps: lessons.flatMap(lesson => [
        { title: lesson.title, content: lesson.description, isSection: true },
        ...lesson.steps,
      ]),
    };
  }),
  ...LESSONS.filter(lesson => !GROUPED_LESSON_IDS.has(lesson.id)).map(lesson => {
    const topicId = getTopicId(lesson, lesson.sourceSectionId);
    LEGACY_LESSON_TO_ARTICLE.set(lesson.id, lesson.id);
    return {
      ...lesson,
      topicId,
      topicTitle: TOPICS.find(topic => topic.id === topicId)?.title || 'Planning & Tools',
      keywords: [],
      readTime: getReadTime(lesson),
    };
  }),
];

const POPULAR_ARTICLE_IDS = [
  'animal-records',
  'breeding-lifecycle',
  'genetics-guide',
  'daily-care',
];

const HelpCenterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(
    LEGACY_LESSON_TO_ARTICLE.get(searchParams.get('lesson') || searchParams.get('article'))
  );

  useEffect(() => {
    const articleId = searchParams.get('lesson') || searchParams.get('article');
    setSelectedArticleId(LEGACY_LESSON_TO_ARTICLE.get(articleId) || articleId);
  }, [searchParams]);

  const selectedArticle = ARTICLES.find(article => article.id === selectedArticleId);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleArticles = useMemo(() => ARTICLES.filter(article => {
    if (activeTopicId && activeTopicId !== 'all' && article.topicId !== activeTopicId) return false;
    if (!normalizedQuery) return true;
    const searchableText = [
      article.title,
      article.description,
      article.topicTitle,
      ...(article.keywords || []),
      ...article.steps.flatMap(step => [step.title, step.content]),
    ].join(' ').toLocaleLowerCase();
    return searchableText.includes(normalizedQuery);
  }), [activeTopicId, normalizedQuery]);

  const openArticle = (article) => {
    setSelectedArticleId(article.id);
    setSearchParams({ lesson: article.id });
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
        <div className="relative max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-dark dark:text-dark-primary">
            CritterTrack Help Center
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-text sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-dark-text-secondary sm:text-base">
            Find clear answers and practical guides for getting the most out of CritterTrack.
          </p>
          <label className="mt-5 flex max-w-2xl items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 dark:border-dark-border dark:bg-dark-surface">
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
        <article className="px-5 py-6 sm:px-8 sm:py-8">
          <button
            type="button"
            onClick={returnToBrowse}
            className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary/10 dark:text-dark-primary dark:hover:bg-dark-surface-hover"
          >
            <ArrowLeft size={16} />
            Back to Help Center
          </button>
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary-dark dark:text-dark-primary">
              {selectedArticle.topicTitle} · {selectedArticle.readTime} min read
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text sm:text-3xl">
              {selectedArticle.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-dark-text-secondary">
              {selectedArticle.description}
            </p>
            <div className="mt-7 space-y-4">
              {selectedArticle.steps.map((step, index) => (
                <section
                  key={`${selectedArticle.id}-${index}`}
                  className={step.isSection
                    ? 'border-b border-gray-200 pb-2 pt-5 first:pt-0 dark:border-dark-border'
                    : 'rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5 dark:border-dark-border dark:bg-dark-surface'}
                >
                  <h3 className={step.isSection
                    ? 'text-lg font-bold text-gray-900 dark:text-dark-text'
                    : 'font-semibold text-gray-900 dark:text-dark-text'}>
                    {step.title}
                  </h3>
                  <p className={`${step.isSection ? 'text-xs' : 'mt-2 text-sm'} whitespace-pre-line leading-relaxed text-gray-700 dark:text-dark-text-secondary`}>
                    {step.content}
                  </p>
                  {step.link?.url && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark hover:underline dark:text-dark-primary"
                    >
                      {step.link.label}
                      <ArrowRight size={14} />
                    </a>
                  )}
                </section>
              ))}
            </div>
          </div>
        </article>
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
              className="text-sm font-semibold text-primary-dark hover:underline dark:text-dark-primary"
            >
              View all topics
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
