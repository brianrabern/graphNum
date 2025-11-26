import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ReactFlowInstance,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Graph } from '../../core/graph/graphTypes';
import { getColorValue } from '../../core/math/colorMapping';
import styles from './GraphCanvas.module.css';

interface GraphCanvasProps {
  graph: Graph;
  isCanonical?: boolean;
  width?: number;
  height?: number;
  onNodeDrag?: (nodeId: string, x: number, y: number) => void;
  onNodeClick?: (nodeId: string, shiftKey?: boolean, isEdgeTarget?: boolean) => void;
  onEdgeClick?: (edgeId: string) => void;
  onCanvasClick?: () => void;
  onNodeAdd?: (color: string, x: number, y: number) => void;
  onEdgeAdd?: (sourceId: string, targetId: string) => void;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  selectedColor?: string | null;
  onFlowInstanceReady?: (instance: ReactFlowInstance) => void;
  nonInteractive?: boolean;
}

// Custom node component for colored nodes with glow effects
function ColorNode({ data }: { data: { color: string; label?: string } }) {
  const colorValue = getColorValue(data.color);
  const baseColor = data.color === 'white' || data.color === 'gray' ? '#e0e0e0' : colorValue;

  // Create lighter and darker versions for 3D effect
  const highlightColor = data.color === 'white' || data.color === 'gray'
    ? '#ffffff'
    : data.color === 'red' ? '#ffaaaa'
    : data.color === 'blue' ? '#aaaaff'
    : data.color === 'green' ? '#aaffaa'
    : data.color === 'yellow' ? '#ffffaa'
    : data.color === 'cyan' ? '#aaffff'
    : data.color === 'magenta' ? '#ffaaff'
    : '#ffffff';

  const lighterColor = data.color === 'white' || data.color === 'gray'
    ? '#f0f0f0'
    : data.color === 'red' ? '#ff7777'
    : data.color === 'blue' ? '#7777ff'
    : data.color === 'green' ? '#77ff77'
    : data.color === 'yellow' ? '#ffff77'
    : data.color === 'cyan' ? '#77ffff'
    : data.color === 'magenta' ? '#ff77ff'
    : baseColor;

  const darkerColor = data.color === 'white' || data.color === 'gray'
    ? '#a0a0a0'
    : data.color === 'red' ? '#aa0000'
    : data.color === 'blue' ? '#0000aa'
    : data.color === 'green' ? '#00aa00'
    : data.color === 'yellow' ? '#aaaa00'
    : data.color === 'cyan' ? '#00aaaa'
    : data.color === 'magenta' ? '#aa00aa'
    : baseColor;

  const darkestColor = data.color === 'white' || data.color === 'gray'
    ? '#707070'
    : data.color === 'red' ? '#660000'
    : data.color === 'blue' ? '#000066'
    : data.color === 'green' ? '#006600'
    : data.color === 'yellow' ? '#666600'
    : data.color === 'cyan' ? '#006666'
    : data.color === 'magenta' ? '#660066'
    : '#000000';

  return (
    <div
      className={styles.colorNode}
      style={{
        background: `radial-gradient(circle at 25% 25%, ${highlightColor} 0%, ${lighterColor} 15%, ${baseColor} 45%, ${darkerColor} 75%, ${darkestColor} 100%)`,
        border: `1px solid ${darkestColor}80`,
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: `
          0 0 4px ${baseColor}20,
          inset -4px -4px 10px ${darkestColor}60,
          inset 3px 3px 6px ${lighterColor}90,
          inset -1px -1px 2px ${darkerColor}50,
          2px 2px 5px rgba(0, 0, 0, 0.25)
        `,
        overflow: 'visible',
      }}
    >
      <div className={styles.sphereHighlight}></div>
      <div className={styles.sphereRimLight}></div>
      <Handle
        type="source"
        position={Position.Right}
      />
      <Handle
        type="target"
        position={Position.Right}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  colorNode: ColorNode,
};

export function GraphCanvas({
  graph,
  isCanonical = false,
  width: _width = 800,
  height: _height = 600,
  onNodeDrag,
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  onNodeAdd,
  onEdgeAdd,
  selectedNodeId,
  selectedEdgeId,
  selectedColor,
  onFlowInstanceReady,
  nonInteractive = false,
}: GraphCanvasProps) {
  // Convert our graph format to React Flow format
  const reactFlowNodes: Node[] = graph.nodes.map((node) => ({
    id: node.id,
    type: 'colorNode',
    position: { x: node.x || 0, y: node.y || 0 },
    data: { color: node.color },
    selected: selectedNodeId === node.id,
    draggable: !isCanonical,
    connectable: !isCanonical,
  }));

  const reactFlowEdges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    selected: selectedEdgeId === edge.id,
    style: {
      stroke: selectedEdgeId === edge.id ? '#ff6b6b' : '#d4c4a8',
      strokeWidth: selectedEdgeId === edge.id ? 4 : 2.5,
      opacity: selectedEdgeId === edge.id ? 1 : 0.9,
    },
    // Remove arrows - edges are undirected in our graph
    // markerEnd: {
    //   type: MarkerType.ArrowClosed,
    //   width: 20,
    //   height: 20,
    // },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const prevNodeIdsRef = React.useRef<string>(graph.nodes.map(n => n.id).join(','));

  // Update nodes/edges when graph changes
  React.useEffect(() => {
    setNodes(reactFlowNodes);

    // Check if graph structure changed significantly (new graph from operation)
    const currentNodeIds = graph.nodes.map(n => n.id).join(',');
    const graphStructureChanged = prevNodeIdsRef.current !== currentNodeIds;

    if (graphStructureChanged && reactFlowInstance.current && graph.nodes.length > 0) {
      // Use setTimeout to ensure nodes are rendered before fitting view
      setTimeout(() => {
        if (nonInteractive || isCanonical) {
          const nodeCount = graph.nodes.length;
          reactFlowInstance.current?.fitView({
            padding: nodeCount === 1 ? 0.3 : 0.2,
            duration: 0,
            maxZoom: 5,
            minZoom: 0.01,
            includeHiddenNodes: false
          });
        } else {
          reactFlowInstance.current?.fitView({ padding: 0.2, duration: 400 });
        }
      }, 300);
    }
    prevNodeIdsRef.current = currentNodeIds;
  }, [graph.nodes, selectedNodeId, nonInteractive, isCanonical]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    setEdges(reactFlowEdges);

    // Fit view after edges are updated for non-interactive views
    if ((nonInteractive || isCanonical) && reactFlowInstance.current && graph.nodes.length > 0) {
      setTimeout(() => {
        const nodeCount = graph.nodes.length;
        reactFlowInstance.current?.fitView({
          padding: nodeCount === 1 ? 0.3 : 0.2,
          duration: 0,
          maxZoom: 5,
          minZoom: 0.01,
          includeHiddenNodes: false
        });
      }, 350);
    }
  }, [graph.edges, selectedEdgeId, nonInteractive, isCanonical]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle node drag
  const onNodeDragHandler = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!isCanonical && onNodeDrag) {
        onNodeDrag(node.id, node.position.x, node.position.y);
      }
    },
    [isCanonical, onNodeDrag]
  );

  // Handle node click
  const onNodeClickHandler = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  // Handle edge click
  const onEdgeClickHandler = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge.id);
      }
    },
    [onEdgeClick]
  );

  // Handle connection (edge creation)
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || params.source === params.target) {
        return;
      }

      // Add edge to React Flow state using addEdge utility
      setEdges((eds) => addEdge(params, eds));

      // Sync to parent graph
      if (onEdgeAdd) {
        onEdgeAdd(params.source, params.target);
      }
    },
    [setEdges, onEdgeAdd]
  );

  // Connection validation - simple check
  const isValidConnection = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return false;
    if (connection.source === connection.target) return false;

    // Check if edge already exists in React Flow's edges
    const exists = edges.some(
      e => (e.source === connection.source && e.target === connection.target) ||
           (e.source === connection.target && e.target === connection.source)
    );
    return !exists;
  }, [edges]);

  // Handle edge changes from React Flow
  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      // Apply changes to React Flow's internal state
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Handle pane click with coordinates for node addition
  const onPaneClickWithCoords = useCallback(
    (event: React.MouseEvent) => {
      if (onNodeAdd && selectedColor && !isCanonical && reactFlowInstance.current) {
        // Convert screen coordinates to flow coordinates
        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        onNodeAdd(selectedColor, position.x, position.y);
      } else if (onCanvasClick) {
        onCanvasClick();
      }
    },
    [onNodeAdd, selectedColor, onCanvasClick, isCanonical]
  );

  // Store React Flow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;

    // Fit view for non-interactive or canonical views
    if (nonInteractive || isCanonical) {
      const fitViewWithRetry = () => {
        if (graph.nodes.length === 0) return;

        instance.fitView({
          padding: graph.nodes.length === 1 ? 0.3 : 0.2,
          duration: 0,
          maxZoom: 5,
          minZoom: 0.01,
          includeHiddenNodes: false
        });
      };

      // Try multiple times to ensure it fits
      setTimeout(fitViewWithRetry, 200);
      setTimeout(fitViewWithRetry, 400);
      setTimeout(fitViewWithRetry, 600);
    }

    if (onFlowInstanceReady) {
      onFlowInstanceReady(instance);
    }
  }, [onFlowInstanceReady, nonInteractive, isCanonical, graph.nodes.length]);

  return (
    <div className={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={nonInteractive ? undefined : onNodesChange}
        onEdgesChange={nonInteractive ? undefined : onEdgesChangeHandler}
        onNodeDrag={nonInteractive ? undefined : onNodeDragHandler}
        onNodeClick={nonInteractive ? undefined : onNodeClickHandler}
        onEdgeClick={nonInteractive ? undefined : onEdgeClickHandler}
        onConnect={nonInteractive ? undefined : onConnect}
        isValidConnection={nonInteractive ? undefined : isValidConnection}
        onPaneClick={nonInteractive ? undefined : onPaneClickWithCoords}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView={nonInteractive || isCanonical}
        fitViewOptions={nonInteractive || isCanonical ? { padding: 0.2, maxZoom: 5, minZoom: 0.01, includeHiddenNodes: false } : undefined}
        attributionPosition="bottom-left"
        nodesDraggable={!isCanonical && !nonInteractive}
        nodesConnectable={!isCanonical && !nonInteractive}
        elementsSelectable={!isCanonical && !nonInteractive}
        panOnDrag={!nonInteractive}
        zoomOnScroll={!nonInteractive}
        zoomOnPinch={!nonInteractive}
        connectionRadius={nonInteractive ? 0 : 30}
        snapToGrid={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        {!isCanonical && !nonInteractive && <Controls />}
      </ReactFlow>
    </div>
  );
}
