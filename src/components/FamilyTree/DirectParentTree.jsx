import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';

const Node = ({ animal, onClick }) => (
  <button onClick={() => onClick?.(animal?.id_public)} style={{ border: '1px solid #ccc', padding: 8, borderRadius: 8, minWidth: 140, textAlign: 'left' }}>
    {animal?.imageUrl && <img src={animal.imageUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
      <span>{animal?.gender === 'Male' ? '♂' : animal?.gender === 'Female' ? '♀' : ''}</span>
      <span style={{ fontWeight: 600 }}>{[animal?.prefix, animal?.name, animal?.suffix].filter(Boolean).join(' ')}</span>
    </div>
    <div style={{ fontSize: 12, color: '#666' }}>Status: {animal?.status || 'Unknown'}</div>
  </button>
);

const DirectParentTree = ({ focusAnimalId, authToken, onNodeClick }) => {
  const [nodes, setNodes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!focusAnimalId) return;
    let cancelled = false;
    const fetchOne = async (id) => {
      if (!id) return null;
      try {
        const r = await apiClient.get(`/animals/any/${encodeURIComponent(id)}`);
        return r.data;
      } catch {
        return { id_public: id, name: 'Unknown' };
      }
    };
    const run = async () => {
      const result = {};
      const queue = [{ id: focusAnimalId, depth: 0 }];
      const visited = new Set();
      while (queue.length) {
        const { id, depth } = queue.shift();
        if (!id || visited.has(id) || depth > 4) continue;
        visited.add(id);
        const data = await fetchOne(id);
        if (data) {
          result[id] = data;
          if (depth < 4) {
            if (data.sireId_public) queue.push({ id: data.sireId_public, depth: depth + 1 });
            if (data.damId_public) queue.push({ id: data.damId_public, depth: depth + 1 });
          }
        }
      }
      if (!cancelled) {
        setNodes(result);
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [focusAnimalId]);

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%' }}>Loading…</div>;

  const renderLevel = (id, depth = 0) => {
    if (!id || depth > 4) return null;
    const animal = nodes[id];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Node animal={animal} onClick={onNodeClick} />
        {depth < 4 && (
          <div style={{ display: 'flex', gap: 16 }}>
            {renderLevel(animal?.sireId_public, depth + 1)}
            {renderLevel(animal?.damId_public, depth + 1)}
          </div>
        )}
      </div>
    );
  };

  return <div style={{ padding: 16, overflow: 'auto' }}>{renderLevel(focusAnimalId)}</div>;
};

export default DirectParentTree;