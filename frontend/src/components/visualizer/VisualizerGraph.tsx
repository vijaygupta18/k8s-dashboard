import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { K8sNode } from './K8sNode';
import type { ResourceGraph } from '../../types/k8s';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

const KIND_COLORS: Record<string, string> = {
  Pod: '#10b981',
  Deployment: '#3b82f6',
  ReplicaSet: '#6366f1',
  StatefulSet: '#8b5cf6',
  DaemonSet: '#a855f7',
  Service: '#f59e0b',
  Ingress: '#ef4444',
  ConfigMap: '#06b6d4',
  Secret: '#ec4899',
  PersistentVolumeClaim: '#14b8a6',
  Job: '#f97316',
  CronJob: '#eab308',
};

const EDGE_STYLES: Record<string, any> = {
  owns: { stroke: '#6b7280', strokeWidth: 2 },
  selects: { stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '5,5' },
  mounts: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '3,3' },
  routes: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '8,4' },
};

const nodeTypes = { k8s: K8sNode };

function getLayoutedElements(graph: ResourceGraph) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 });

  const nodes: Node[] = graph.nodes.map(n => {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    return {
      id: n.id,
      type: 'k8s',
      position: { x: 0, y: 0 },
      data: {
        label: n.name,
        kind: n.kind,
        status: n.status,
        namespace: n.namespace,
        color: KIND_COLORS[n.kind] || '#6b7280',
      },
    };
  });

  const edges: Edge[] = graph.edges.map((e, i) => {
    g.setEdge(e.source, e.target);
    const style = EDGE_STYLES[e.relationship] || EDGE_STYLES.owns;
    return {
      id: `e${i}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      style,
      animated: e.relationship === 'selects',
      labelStyle: { fontSize: 10, fill: '#9ca3af' },
    };
  });

  dagre.layout(g);

  nodes.forEach(node => {
    const pos = g.node(node.id);
    node.position = { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 };
  });

  return { nodes, edges };
}

interface VisualizerGraphProps {
  graph: ResourceGraph | undefined;
}

export function VisualizerGraph({ graph }: VisualizerGraphProps) {
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(
    () => graph ? getLayoutedElements(graph) : { nodes: [], edges: [] },
    [graph]
  );

  const [nodes, , onNodesChange] = useNodesState(layoutNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutEdges);

  const onInit = useCallback((instance: any) => {
    instance.fitView({ padding: 0.2 });
  }, []);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500">No resources to visualize. Select a namespace with resources.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(n: Node) => (n.data?.color as string) || '#6b7280'}
          style={{ height: 100, width: 150 }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs space-y-1.5 backdrop-blur">
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Legend</p>
        {Object.entries(KIND_COLORS).slice(0, 8).map(([kind, color]) => (
          <div key={kind} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span>{kind}</span>
          </div>
        ))}
        <hr className="border-gray-200 dark:border-gray-700" />
        <div className="flex items-center gap-2"><span className="w-6 border-t-2 border-gray-500" /> owns</div>
        <div className="flex items-center gap-2"><span className="w-6 border-t-2 border-blue-500 border-dashed" /> selects</div>
        <div className="flex items-center gap-2"><span className="w-6 border-t-2 border-green-500 border-dotted" /> mounts</div>
      </div>
    </div>
  );
}
