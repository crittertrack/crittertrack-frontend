const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const founderIDs = {
    Quattro: ['CTC61', 'CTC330'],
    Pawfriends: ['CTC184', 'CTC105', 'CTC104', 'CTC100', 'CTC98', 'CTC76', 'CTC99'],
    Kingfish: 'CTC268',
    Banda: 'CTC269'
};

const readCSVFiles = (dir) => {
    return fs.readdirSync(dir)
        .filter(file => file.startsWith('family-tree-2026-03-23-part') && file.endsWith('.csv') && file !== 'family-tree-2026-03-23.csv')
        .map(file => fs.readFileSync(path.join(dir, file), 'utf-8'));
};

const buildGraph = (data) => {
    const graph = {};
    data.forEach((entry) => {
        const id = entry['ID'];
        const sire = entry['Sire ID'];
        const dam = entry['Dam ID'];
        graph[id] = { sire, dam };
    });
    return graph;
};

const computeFounderLines = (graph) => {
    const founderLines = {};
    for (const id in graph) {
        const ancestors = getAncestors(graph, id);
        const tags = getTags(ancestors);
        founderLines[id] = tags;
    }
    return founderLines;
};

const getAncestors = (graph, id) => {
    const ancestors = new Set();
    const stack = [id];
    while (stack.length) {
        const current = stack.pop();
        if (!ancestors.has(current)) {
            ancestors.add(current);
            const { sire, dam } = graph[current];
            if (sire) stack.push(sire);
            if (dam) stack.push(dam);
        }
    }
    return Array.from(ancestors);
};

const getTags = (ancestors) => {
    const tags = new Set();
    for (const ancestor of ancestors) {
        if (founderIDs.Quattro.includes(ancestor) || founderIDs.Pawfriends.includes(ancestor)) {
            tags.add('Hybrid');
        }
        if (ancestor === founderIDs.Kingfish) {
            tags.add('Gianni');
        }
        if (ancestor === founderIDs.Banda) {
            tags.add('Gianni');
        }
    }
    return Array.from(tags);
};

const writeOutput = (founderLines) => {
    // Define output logic to write to data/founder-lines-all.csv and data/founder-lines-ctu2-current.csv
};

const files = readCSVFiles('data');
const combinedData = files.map(file => csv.parseString(file)).flat();
const graph = buildGraph(combinedData);
const founderLines = computeFounderLines(graph);
writeOutput(founderLines);

// Package.json entry: 
// "compute:founder-lines": "node scripts/compute-founder-lines.js"