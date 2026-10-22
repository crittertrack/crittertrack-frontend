
import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Mars, Venus } from 'lucide-react';

// ============================================================
// LAYOUT SETTINGS
// ============================================================

// Approximate width of each animal card, including its border.
const NODE_WIDTH = 180;

// Horizontal gap between the sire and dam cards of the same animal.
// Lower this to bring the two parents closer together.
const WITHIN_PAIR_GAP = 24;

// Minimum horizontal gap between separate branches.
// Increase this if cards from different pairs still overlap.
const BETWEEN_BRANCH_GAP = 28;

// Vertical distance between generations.
const GENERATION_HEIGHT = 200;

// Number of ancestor generations to display.
const MAX_DEPTH = 4;

// ============================================================
// COMPONENT
// ============================================================

const DirectParentTree = ({
  focusAnimalId,
  authToken,
  onNodeClick,
  onViewAnimal,
}) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!focusAnimalId) {
      setNodes([]);
      setEdges([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOne = async (id) => {
      if (!id) return null;

      try {
        const response = await apiClient.get(
          `/animals/any/${encodeURIComponent(id)}`,
          authToken
            ? { headers: { Authorization: `Bearer ${authToken}` } }
            : undefined
        );

        return response.data;
      } catch {
        return { id_public: id, name: 'Unknown' };
      }
    };

    const getParentId = (animal, fields) => {
      for (const field of fields) {
        const value = animal?.[field];

        if (value && typeof value === 'string') {
          return value;
        }

        if (value && typeof value === 'number') {
          return String(value);
        }
      }

      return null;
    };

    const run = async () => {
      setLoading(true);

      try {
        // ----------------------------------------------------
        // STEP 1: Fetch the ancestor tree.
        // ----------------------------------------------------

        const animalMap = new Map();
        const rootId = String(focusAnimalId);
        const queue = [{ id: rootId, depth: 0 }];
        const visited = new Set();

        while (queue.length > 0) {
          if (cancelled) return;

          const current = queue.shift();
          const id = String(current.id);

          if (
            !id ||
            current.depth > MAX_DEPTH ||
            visited.has(id)
          ) {
            continue;
          }

          visited.add(id);

          const animal = await fetchOne(id);

          if (!animal) continue;

          const sireId = getParentId(animal, [
            'sireId_public',
            'sireCtuid',
            'sireId',
          ]);

          const damId = getParentId(animal, [
            'damId_public',
            'damCtuid',
            'damId',
          ]);

          animalMap.set(id, {
            id,
            animal,
            sireId,
            damId,
          });

          if (current.depth < MAX_DEPTH) {
            if (sireId && !visited.has(String(sireId))) {
              queue.push({
                id: String(sireId),
                depth: current.depth + 1,
              });
            }

            if (damId && !visited.has(String(damId))) {
              queue.push({
                id: String(damId),
                depth: current.depth + 1,
              });
            }
          }
        }

        if (cancelled) return;

        // ----------------------------------------------------
        // STEP 2: Calculate required width for every subtree.
        //
        // This prevents neighboring branches from overlapping.
        // A leaf needs only its own card width.
        // A node with parents reserves space for both branches.
        // ----------------------------------------------------

        const subtreeWidths = new Map();
        const widthVisiting = new Set();

        const getSubtreeWidth = (id, depth = 0) => {
          const key = String(id);

          if (subtreeWidths.has(key)) {
            return subtreeWidths.get(key);
          }

          const entry = animalMap.get(key);

          if (!entry || depth >= MAX_DEPTH) {
            return NODE_WIDTH;
          }

          // Guard against circular pedigree references.
          if (widthVisiting.has(key)) {
            return NODE_WIDTH;
          }

          widthVisiting.add(key);

          const sireExists =
            entry.sireId &&
            animalMap.has(String(entry.sireId));

          const damExists =
            entry.damId &&
            animalMap.has(String(entry.damId));

          let width = NODE_WIDTH;

          if (sireExists && damExists) {
            const sireWidth = getSubtreeWidth(
              entry.sireId,
              depth + 1
            );

            const damWidth = getSubtreeWidth(
              entry.damId,
              depth + 1
            );

            // Each parent's branch reserves its own width.
            width =
              sireWidth +
              BETWEEN_BRANCH_GAP +
              WITHIN_PAIR_GAP +
              damWidth;
          } else if (sireExists) {
            width = Math.max(
              NODE_WIDTH,
              getSubtreeWidth(entry.sireId, depth + 1)
            );
          } else if (damExists) {
            width = Math.max(
              NODE_WIDTH,
              getSubtreeWidth(entry.damId, depth + 1)
            );
          }

          widthVisiting.delete(key);

          subtreeWidths.set(key, width);

          return width;
        };

        getSubtreeWidth(rootId);

        // ----------------------------------------------------
        // STEP 3: Position nodes using their reserved widths.
        //
        // Every subtree receives its own horizontal region.
        // Parent cards are placed inside that region, with the
        // sire on the left and the dam on the right.
        // ----------------------------------------------------

        const ns = [];
        const es = [];
        let nodeCounter = 0;

        const placedNodes = new Map();
        const edgeKeys = new Set();

        const addNode = (id, depth, left, right, path) => {
          const key = String(id);
          const entry = animalMap.get(key);

          if (!entry) return;

          // Avoid duplicate rendering and infinite recursion.
          if (path.has(key)) return;

          const { animal, sireId, damId } = entry;
          const nodeId = `node-${nodeCounter++}`;

          const centerX = (left + right) / 2;
          const y = (MAX_DEPTH - depth) * GENERATION_HEIGHT;

          placedNodes.set(key, {
            nodeId,
            x: centerX,
            y,
          });

          ns.push({
            id: nodeId,
            type: 'default',
            position: {
              x: centerX - NODE_WIDTH / 2,
              y,
            },
            style: {
              width: NODE_WIDTH,
              padding: 0,
              border: 'none',
              background: 'transparent',
            },
            data: {
              id: key,
              animal,
              label: (
                <div
                  style={{
                    boxSizing: 'border-box',
                    width: NODE_WIDTH,
                    border: '1px solid #ccc',
                    padding: 8,
                    borderRadius: 8,
                    background: '#fff',
                    textAlign: 'left',
                    overflow: 'hidden',
                  }}
                >
                  {animal?.birthDate && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#666',
                        marginBottom: 4,
                        textAlign: 'center',
                      }}
                    >
                      {String(animal.birthDate).slice(0, 10)}
                    </div>
                  )}

                  {animal?.imageUrl && (
                    <img
                      src={animal.imageUrl}
                      alt=""
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 6,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        color:
                          animal?.gender === 'Male'
                            ? '#3b82f6'
                            : animal?.gender === 'Female'
                            ? '#ec4899'
                            : '#9ca3af',
                      }}
                    >
                      {animal?.gender === 'Male' ? (
                        <Mars size={14} />
                      ) : animal?.gender === 'Female' ? (
                        <Venus size={14} />
                      ) : null}
                    </span>

                    <span
                      style={{
                        fontWeight: 600,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {[
                        animal?.prefix,
                        animal?.name,
                        animal?.suffix,
                      ]
                        .filter(Boolean)
                        .join(' ') || 'Unknown'}
                    </span>
                  </div>

                  <div
                    style={{
                      minHeight: 18,
                      borderRadius: 3,
                      marginTop: 6,
                      background:
                        animal?.status === 'Alive'
                          ? '#22c55e'
                          : '#94a3b8',
                      color: 'white',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {animal?.status || 'Unknown'}
                  </div>
                </div>
              ),
            },
          });

          if (depth >= MAX_DEPTH) return;

          const nextPath = new Set(path);
          nextPath.add(key);

          const sireExists =
            sireId && animalMap.has(String(sireId));

          const damExists =
            damId && animalMap.has(String(damId));

          const sireWidth = sireExists
            ? getSubtreeWidth(sireId, depth + 1)
            : 0;

          const damWidth = damExists
            ? getSubtreeWidth(damId, depth + 1)
            : 0;

          let sireCenter;
          let damCenter;

          if (sireExists && damExists) {
            const combinedWidth =
              sireWidth + WITHIN_PAIR_GAP + damWidth;

            const pairLeft = centerX - combinedWidth / 2;

            sireCenter = pairLeft + sireWidth / 2;
            damCenter =
              pairLeft + sireWidth + WITHIN_PAIR_GAP +
              damWidth / 2;
          } else if (sireExists) {
            sireCenter = centerX - NODE_WIDTH / 2 -
              BETWEEN_BRANCH_GAP - sireWidth / 2;
          } else if (damExists) {
            damCenter = centerX + NODE_WIDTH / 2 +
              BETWEEN_BRANCH_GAP + damWidth / 2;
          }

          if (sireExists) {
            const childLeft = sireCenter - sireWidth / 2;
            const childRight = sireCenter + sireWidth / 2;

            addNode(
              sireId,
              depth + 1,
              childLeft,
              childRight,
              nextPath
            );

            const parentNode = placedNodes.get(String(sireId));
            const edgeKey = `${parentNode?.nodeId}-${nodeId}`;

            if (parentNode && !edgeKeys.has(edgeKey)) {
              edgeKeys.add(edgeKey);

              es.push({
                id: edgeKey,
                source: parentNode.nodeId,
                target: nodeId,
                type: 'straight',
                style: {
                  stroke: '#888',
                  strokeWidth: 1,
                },
              });
            }
          }

          if (damExists) {
            const childLeft = damCenter - damWidth / 2;
            const childRight = damCenter + damWidth / 2;

            addNode(
              damId,
              depth + 1,
              childLeft,
              childRight,
              nextPath
            );

            const parentNode = placedNodes.get(String(damId));
            const edgeKey = `${parentNode?.nodeId}-${nodeId}`;

            if (parentNode && !edgeKeys.has(edgeKey)) {
              edgeKeys.add(edgeKey);

              es.push({
                id: edgeKey,
                source: parentNode.nodeId,
                target: nodeId,
                type: 'straight',
                style: {
                  stroke: '#888',
                  strokeWidth: 1,
                },
              });
            }
          }
        };

        const rootWidth = getSubtreeWidth(rootId);
        const rootLeft = -rootWidth / 2;

        addNode(
          rootId,
          0,
          rootLeft,
          rootLeft + rootWidth,
          new Set()
        );

        if (!cancelled) {
          setNodes(ns);
          setEdges(es);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to build pedigree tree:', error);

        if (!cancelled) {
          setNodes([]);
          setEdges([]);
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [focusAnimalId, authToken]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '90%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.05}
        onNodeClick={(_, node) => {
          onNodeClick?.(node.data.id);
          onViewAnimal?.(node.data.animal);
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DirectParentTree;
