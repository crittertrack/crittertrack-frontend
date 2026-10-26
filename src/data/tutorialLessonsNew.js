import { GETTING_STARTED_LESSONS } from './lessons/getting_started_lessons';
import { ANIMAL_RECORD_TAB_LESSONS } from './lessons/animal_record_tab_lessons';
import { ANIMAL_LIST_TOUR_LESSONS } from './lessons/animal_list_tour_lessons';
import { SETTINGS_TAB_LESSONS } from './lessons/settings_tab_lessons';
import { LITTER_MANAGEMENT_LESSONS } from './lessons/litter_management_lessons';
import { MORE_PAGES_LESSONS } from './lessons/more_pages_lessons';

const TUTORIAL_SECTIONS = [
  { id: 'getting-started', label: '🚀 Getting Started', lessons: GETTING_STARTED_LESSONS },
  { id: 'animal-record-tour', label: '🐾 The Animal Record: A Tab-by-Tab Tour', lessons: ANIMAL_RECORD_TAB_LESSONS },
  { id: 'animal-list-tour', label: '📋 The Animal List: A Tab-by-Tab Tour', lessons: ANIMAL_LIST_TOUR_LESSONS },
  { id: 'settings-tour', label: '⚙️ Profile & Settings: A Tab-by-Tab Tour', lessons: SETTINGS_TAB_LESSONS },
  { id: 'litter-management-tour', label: '🐣 The Litter Management: A Feature-by-Feature Tour', lessons: LITTER_MANAGEMENT_LESSONS },
  { id: 'more-pages-tour', label: '📚 More Pages & Tools', lessons: MORE_PAGES_LESSONS },
];

const ALL_LESSONS_ARRAY = TUTORIAL_SECTIONS.flatMap(section => section.lessons);

export const TUTORIAL_LESSONS = {
  sections: TUTORIAL_SECTIONS,
  all: ALL_LESSONS_ARRAY
};

export default TUTORIAL_LESSONS;
