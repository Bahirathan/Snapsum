/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Video, 
  FileText, 
  Bookmark, 
  Tag, 
  Link2,
  Lock,
  Unlock,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export interface GraphNode {
  id: string; // e.g. "w-videoId" or "c-conceptId"
  type: 'workspace' | 'concept';
  label: string;
  sourceId?: string; // associated videoId
  x: number;
  y: number;
  vx: number;
  vy: number;
  mastery?: number;
  tags?: string[];
  bookmarks?: boolean;
  personalNotes?: string;
  crossLinks?: string[];
  rawObject: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'source' | 'custom' | 'tag';
  notes?: string;
}

interface KnowledgeGraphVisualizerProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  onUpdateNodesPositions: (updatedNodes: GraphNode[]) => void;
  searchQuery?: string;
}

export default function KnowledgeGraphVisualizer({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onUpdateNodesPositions,
  searchQuery = ''
}: KnowledgeGraphVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 450 });
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [freezeSimulation, setFreezeSimulation] = useState<boolean>(false);
  const [localNodes, setLocalNodes] = useState<GraphNode[]>(nodes);

  // Sync prop nodes with localNodes on changes
  useEffect(() => {
    setLocalNodes((prev) => {
      return nodes.map((node) => {
        const match = prev.find((pn) => pn.id === node.id);
        if (match) {
          return {
            ...node,
            x: match.x,
            y: match.y,
            vx: match.vx,
            vy: match.vy
          };
        }
        return node;
      });
    });
  }, [nodes]);

  // Measure container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        setDimensions({ 
          width: width || 700, 
          height: height || 450 
        });
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Force-Directed Layout Simulation Loop (Localized)
  useEffect(() => {
    if (localNodes.length === 0 || freezeSimulation) return;

    let animationFrameId: number;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const repulsion = 1400; // Node repulsion strength
    const springLength = 85; // Ideal link length
    const springStrength = 0.05; // Spring pull factor
    const centerGravity = 0.02; // Attract to center of view
    const damping = 0.82; // Velocity friction damping

    const runSimulation = () => {
      setLocalNodes((currentNodes) => {
        if (currentNodes.length === 0) return currentNodes;
        return currentNodes.map((n1, i) => {
          if (n1.id === draggedNodeId) return n1; // Don't move active dragged node

          let vx = n1.vx || 0;
          let vy = n1.vy || 0;

          // 1. Center Gravity attraction
          vx += (centerX - n1.x) * centerGravity;
          vy += (centerY - n1.y) * centerGravity;

          // 2. Pairwise repulsion
          for (let j = 0; j < currentNodes.length; j++) {
            if (i === j) continue;
            const n2 = currentNodes[j];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);

            if (dist < 280) {
              const force = repulsion / distSq;
              vx += (dx / dist) * force;
              vy += (dy / dist) * force;
            }
          }

          // 3. Spring forces along links
          links.forEach((link) => {
            let sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
            let targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

            if (sourceId === n1.id || targetId === n1.id) {
              const otherId = sourceId === n1.id ? targetId : sourceId;
              const otherNode = currentNodes.find(n => n.id === otherId);

              if (otherNode) {
                const dx = otherNode.x - n1.x;
                const dy = otherNode.y - n1.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;

                // Hooke's Law: stretch force
                const force = (dist - springLength) * springStrength;
                vx += (dx / dist) * force;
                vy += (dy / dist) * force;
              }
            }
          });

          // Apply velocities and limit coordinates to container view
          let nextX = n1.x + vx;
          let nextY = n1.y + vy;

          const margin = 24;
          if (nextX < margin) { nextX = margin; vx = 0; }
          if (nextX > dimensions.width - margin) { nextX = dimensions.width - margin; vx = 0; }
          if (nextY < margin) { nextY = margin; vy = 0; }
          if (nextY > dimensions.height - margin) { nextY = dimensions.height - margin; vy = 0; }

          return {
            ...n1,
            x: nextX,
            y: nextY,
            vx: vx * damping,
            vy: vy * damping
          };
        });
      });

      animationFrameId = requestAnimationFrame(runSimulation);
    };

    animationFrameId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [links, draggedNodeId, freezeSimulation, dimensions]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
    onSelectNode(node);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Map screen coordinates back considering pan and zoom
      const mouseX = (e.clientX - rect.left - panOffset.x) / zoomScale;
      const mouseY = (e.clientY - rect.top - panOffset.y) / zoomScale;

      setLocalNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return {
            ...n,
            x: mouseX,
            y: mouseY,
            vx: 0,
            vy: 0
          };
        }
        return n;
      }));
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset({ x: panOffset.x + dx, y: panOffset.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
    onUpdateNodesPositions(localNodes);
  };

  const startPanning = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Helper to determine match against search queries
  const isHighlighted = (node: GraphNode) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return node.label.toLowerCase().includes(query) || 
           node.tags?.some(t => t.toLowerCase().includes(query)) ||
           node.type.toLowerCase().includes(query);
  };

  return (
    <div className="relative border border-neutral-200 dark:border-zinc-800 rounded-3xl bg-neutral-50/50 dark:bg-zinc-950/40 overflow-hidden flex flex-col justify-between select-none">
      
      {/* HUD Toolbar overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-neutral-200/60 dark:border-zinc-800 shadow-xs text-xs font-mono">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-neutral-500 dark:text-zinc-400">Nodes: {localNodes.length}</span>
        </span>
        <span className="text-neutral-300 dark:text-zinc-700">|</span>
        <button 
          onClick={() => setFreezeSimulation(!freezeSimulation)} 
          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          title="Pause or unlock physics settles"
        >
          {freezeSimulation ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          <span>{freezeSimulation ? 'Run' : 'Freeze'}</span>
        </button>
      </div>

      {/* Zoom controls HUD */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-2.5 py-1.5 rounded-2xl border border-neutral-200/60 dark:border-zinc-800 shadow-xs">
        <button 
          onClick={() => setZoomScale(Math.max(zoomScale - 0.15, 0.5))} 
          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono font-bold text-neutral-400 dark:text-zinc-500 px-1.5">{Math.round(zoomScale * 100)}%</span>
        <button 
          onClick={() => setZoomScale(Math.min(zoomScale + 0.15, 1.8))} 
          className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => { setZoomScale(1); setPanOffset({ x: 0, y: 0 }); }} 
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer border-l border-neutral-200 dark:border-zinc-800 pl-1.5 ml-1"
          title="Reset View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas Area */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={startPanning}
        className={`w-full h-[450px] relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0 z-10 overflow-visible"
        >
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomScale})`}>
            {/* Draw Relationship Lines / Links */}
            {links.map((link, idx) => {
              const sourceNode = localNodes.find(n => n.id === link.source);
              const targetNode = localNodes.find(n => n.id === link.target);

              if (!sourceNode || !targetNode) return null;

              // Draw beautiful dynamic color bands
              let strokeColor = 'rgba(129, 140, 248, 0.16)'; // Light indigo for concepts
              let strokeDash = undefined;

              if (link.type === 'custom') {
                strokeColor = 'rgba(239, 68, 68, 0.4)'; // Orange/red for user custom bridges
                strokeDash = '4 3';
              } else if (link.type === 'tag') {
                strokeColor = 'rgba(16, 185, 129, 0.2)'; // Emerald for shared tags
              }

              // Double thick and glow on hover
              const isLinkedToHovered = hoveredNodeId === sourceNode.id || hoveredNodeId === targetNode.id;
              const isLinkedToSelected = selectedNodeId === sourceNode.id || selectedNodeId === targetNode.id;

              if (isLinkedToSelected) {
                strokeColor = link.type === 'custom' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(99, 102, 241, 0.7)';
              } else if (isLinkedToHovered) {
                strokeColor = 'rgba(99, 102, 241, 0.45)';
              }

              return (
                <g key={`l-${idx}`}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={strokeColor}
                    strokeWidth={isLinkedToSelected ? 2.5 : isLinkedToHovered ? 1.8 : 1.2}
                    strokeDasharray={strokeDash}
                    className="transition-all duration-300"
                  />
                  {/* Small relationship indicator bubbles for custom links */}
                  {link.type === 'custom' && link.notes && (
                    <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2})`}>
                      <circle r="4" fill="#ef4444" className="animate-ping" />
                      <circle r="3" fill="#ef4444">
                        <title>{`Relationship Note: ${link.notes}`}</title>
                      </circle>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Draw Nodes */}
            {localNodes.map((node) => {
              const selected = selectedNodeId === node.id;
              const hovered = hoveredNodeId === node.id;
              const isDimmed = searchQuery && !isHighlighted(node);

              // Styling values based on node type
              const isConcept = node.type === 'concept';
              const fill = isConcept 
                ? (selected ? '#6366f1' : hovered ? '#818cf8' : '#e0e7ff') 
                : (selected ? '#bf5af2' : hovered ? '#d68aff' : '#f3e8ff');
              
              const border = isConcept
                ? (selected ? '#4f46e5' : '#818cf8')
                : (selected ? '#a333c8' : '#c084fc');

              const iconColor = isConcept 
                ? (selected ? '#ffffff' : '#4f46e5')
                : (selected ? '#ffffff' : '#9333ea');

              const size = isConcept ? 24 : 30;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="transition-all duration-300 cursor-pointer"
                  opacity={isDimmed ? 0.25 : 1}
                >
                  {/* Halo pulse effect for selected/hovered nodes */}
                  {(selected || hovered) && (
                    <circle
                      r={size + 10}
                      fill={isConcept ? 'rgba(99, 102, 241, 0.08)' : 'rgba(192, 132, 252, 0.08)'}
                      stroke={isConcept ? 'rgba(99, 102, 241, 0.15)' : 'rgba(192, 132, 252, 0.15)'}
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={size}
                    fill={fill}
                    stroke={border}
                    strokeWidth={selected ? 3 : hovered ? 2 : 1.5}
                    className="shadow-sm transition-colors duration-300"
                  />

                  {/* Center Icon inside SVG Node */}
                  <g transform={`translate(-8, -8)`}>
                    {isConcept ? (
                      <Brain style={{ width: 16, height: 16, color: iconColor }} />
                    ) : node.rawObject?.response?.metadata?.videoUrl?.includes('uploaded-files') || node.rawObject?.response?.metadata?.videoUrl?.includes('pasted-text') ? (
                      <FileText style={{ width: 16, height: 16, color: iconColor }} />
                    ) : (
                      <Video style={{ width: 16, height: 16, color: iconColor }} />
                    )}
                  </g>

                  {/* Bookmark indicator overlay */}
                  {node.bookmarks && (
                    <g transform={`translate(${size - 6}, -${size - 6})`}>
                      <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />
                      <path 
                        d="M -2,-3 L 2,-3 L 2,3 L 0,1 L -2,3 Z" 
                        fill="#ffffff" 
                        transform="scale(0.85)"
                      />
                    </g>
                  )}

                  {/* Mastery percentage overlay badge for Concepts */}
                  {isConcept && node.mastery !== undefined && (
                    <g transform={`translate(0, ${size + 4})`}>
                      <rect
                        x="-18"
                        y="-6"
                        width="36"
                        height="12"
                        rx="4"
                        fill={node.mastery >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                        stroke={node.mastery >= 70 ? '#10b981' : '#ef4444'}
                        strokeWidth="0.8"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fontSize="8px"
                        fontWeight="bold"
                        fill={node.mastery >= 70 ? '#059669' : '#dc2626'}
                        fontFamily="monospace"
                      >
                        {node.mastery}%
                      </text>
                    </g>
                  )}

                  {/* Label Text below node */}
                  <text
                    textAnchor="middle"
                    y={isConcept ? size + 26 : size + 16}
                    fontSize="9px"
                    fontWeight={selected ? "bold" : "500"}
                    fill={selected ? "#111827" : "#4b5563"}
                    className="dark:fill-zinc-300 font-sans pointer-events-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
                  >
                    {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Empty placeholder if no nodes */}
        {localNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-xs text-neutral-400 font-light italic z-0">
            <Brain className="w-10 h-10 text-neutral-300 dark:text-zinc-700 animate-pulse mb-3" />
            <span>Process video summaries or documents to automatically feed and construct your connected neural knowledge graph.</span>
          </div>
        )}
      </div>

      {/* Footer explanation / legend bar */}
      <div className="bg-neutral-100/80 dark:bg-zinc-900/60 border-t border-neutral-200/80 dark:border-zinc-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-neutral-500 dark:text-zinc-400 font-sans">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="font-bold uppercase font-mono tracking-wider">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-100 border border-indigo-400 inline-block"></span>
            <span>Concept Mental Model</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-100 border border-purple-400 inline-block"></span>
            <span>Document / Video Workspace</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#ef4444] border-t border-dashed inline-block"></span>
            <span>Custom Topic Relation Bridge</span>
          </span>
        </div>
        <span className="text-neutral-400 font-light">Drag nodes to stabilize or customize layout. Click to explore connections.</span>
      </div>

    </div>
  );
}
