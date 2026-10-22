import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Mars, Venus } from 'lucide-react';

const DirectParentTree = ({ focusAnimalId, authToken, onNodeClick, onViewAnimal }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!focusAnimalId) return;
    let cancelled = false;
    const fetchOne = async (id) => {
      if (!id) return null;
      try { const r = await apiClient.get(`/animals/any/${encodeURIComponent(id)}`); return r.data; }
      catch { return { id_public: id, name: 'Unknown' }; }
    };
    const run = async () => {
      const dataMap = {};
      let counter = 0;
      // Set focus animal at y=800 (bottom) so ancestors appear at top with y - 200 growth
      // Node height ~200px, so y offset of 200 connects center-to-center effectively
      const queue = [{ id: focusAnimalId, nodeId: `node-${counter++}`, depth: 0, x: 0, y: 800 }];
      const visited = new Set();
      const ns = [];
      const es = [];
      while (queue.length) {
        const { id, nodeId, depth, x, y } = queue.shift();
        if (!id || depth > 4) continue;
        visited.add(id);
        const animal = await fetchOne(id);
        if (!animal) continue;
        dataMap[id] = animal;
        ns.push({ id: nodeId, type: 'default', position: { x, y }, data: { label: (
          <div style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8, minWidth: 140, textAlign: 'left' }}>
            {animal?.birthDate && <div style={{ fontSize: 11, color: '#666', marginBottom: 4, textAlign: 'center' }}>{String(animal.birthDate).slice(0,10)}</div>}
            {animal?.imageUrl && <img src={animal.imageUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ color: animal?.gender === 'Male' ? '#3b82f6' : animal?.gender === 'Female' ? '#ec4899' : '#9ca3af' }}>
                {animal?.gender === 'Male' ? <Mars size={14} /> : animal?.gender === 'Female' ? <Venus size={14} /> : null}
              </span>
              <span style={{ fontWeight: 600 }}>{[animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ')}</span>
            </div>
            <div style={{ height: 18, borderRadius: 3, marginTop: 6, background: animal?.status === 'Alive' ? '#22c55e' : '#94a3b8', color: 'white', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {animal?.status || 'Unknown'}
            </div>
          </div>
        ), animal, id } });
        if (depth < 4) {
          // Check all possible sire/dam field names for maximum ancestor coverage
          let sire = null;
          let dam = null;
          for (const field of ['sireId_public', 'sireCtuid', 'sireId']) {
            if (animal && animal[field]) { sire = animal[field]; break; }
          }
          for (const field of ['damId_public', 'damCtuid', 'damId']) {
            if (animal && animal[field]) { dam = animal[field]; break; }
          }
          // Capture node IDs after counter increments for correct edge targets
          let sireNodeId = null;
          let damNodeId = null;
          let sireOffset, damOffset;
        if (depth === 1) {
          // Generation 1 (parents): tighter spacing
          sireOffset = 400;
          damOffset = 350;
        } else if (depth === 2) {
          // Generation 2 (grandparents): moderate spacing
          sireOffset = 450;
          damOffset = 400;
        } else if (depth === 3) {
          // Generation 3 (great-grandparents): more spacing
          sireOffset = 500;
          damOffset = 450;
        } else {
          // Fallback for any other depth
          sireOffset = 400 + depth * 50;
          damOffset = 350 + depth * 50;
        }
        if (sire) { sireNodeId = `node-${counter++}`; queue.push({ id: sire, nodeId: sireNodeId, depth: depth + 1, x: x - sireOffset, y: y - 200 }); es.push({ id: `${nodeId}-${sire}`, source: sireNodeId, target: nodeId, type: 'step', style: { stroke: '#888', strokeWidth: 1 } }); }
        if (dam) { damNodeId = `node-${counter++}`; queue.push({ id: dam, nodeId: damNodeId, depth: depth + 1, x: x + damOffset, y: y - 200 }); es.push({ id: `${nodeId}-${dam}`, source: damNodeId, target: nodeId, type: 'step', style: { stroke: '#888', strokeWidth: 1 } }); }
        }
      }
      if (!cancelled) { setNodes(ns); setEdges(es); setLoading(false); }
    };
    run();
    return () => { cancelled = true; };
  }, [focusAnimalId]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading…</div>;

  return (
    <div style={{ width: '100%', height: '90%' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={(_, node) => { onNodeClick?.(node.data.id); onViewAnimal?.(node.data.animal); }}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DirectParentTree;
