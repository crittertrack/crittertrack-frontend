import { ANIMAL_RECORD_TAB_LESSONS } from './src/data/lessons/animal_record_tab_lessons.js';
console.log('LESSONS OK, count:', ANIMAL_RECORD_TAB_LESSONS.length);
const ids = ANIMAL_RECORD_TAB_LESSONS.map(l => l.id);
console.log('has average-kinship:', ids.includes('average-kinship'));
const lesson = ANIMAL_RECORD_TAB_LESSONS.find(l => l.id === 'average-kinship');
console.log('step titles:', lesson ? lesson.steps.map(s => s.title).join(' | ') : 'MISSING');
