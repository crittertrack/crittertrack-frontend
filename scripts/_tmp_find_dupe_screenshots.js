// Temporary analysis script - finds step titles that collide to the same screenshot filename within a section.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'tutorialLessonsNew.js');
let src = fs.readFileSync(filePath, 'utf8');

// Strip ES module syntax so we can eval as CommonJS
src = src.replace(/^export const TUTORIAL_LESSONS[\s\S]*$/m, '');
src += '\nmodule.exports = { TUTORIAL_SECTIONS };\n';

const Module = require('module');
const m = new Module(filePath, module);
m.filename = filePath;
m.paths = Module._nodeModulePaths(path.dirname(filePath));
m._compile(src, filePath);

const { TUTORIAL_SECTIONS } = m.exports;

function titleToFilename(title) {
  return title
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

for (const section of TUTORIAL_SECTIONS) {
  const seen = new Map(); // filename -> [{lessonId, lessonTitle, stepNumber, stepTitle}]
  for (const lesson of section.lessons) {
    for (const step of lesson.steps) {
      const fn = titleToFilename(step.title);
      if (!seen.has(fn)) seen.set(fn, []);
      seen.get(fn).push({ lessonId: lesson.id, lessonTitle: lesson.title, stepNumber: step.stepNumber, stepTitle: step.title });
    }
  }
  const dupes = [...seen.entries()].filter(([, arr]) => arr.length > 1);
  if (dupes.length > 0) {
    console.log(`\n=== Section: ${section.id} ===`);
    for (const [fn, arr] of dupes) {
      console.log(`  filename: ${fn}.png`);
      for (const item of arr) {
        console.log(`    - lesson "${item.lessonId}" (${item.lessonTitle}) step ${item.stepNumber}: "${item.stepTitle}"`);
      }
    }
  }
}
