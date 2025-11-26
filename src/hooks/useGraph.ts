import { useState, useCallback, useMemo } from 'react';
import { Graph, createNode, createEdge, generateId } from '../core/graph/graphTypes';
import { graphToNumber, GraphNumberResult } from '../core/graph/graphToNumber';

export function useGraph(initialGraph?: Graph) {
  const [graph, setGraph] = useState<Graph>(
    initialGraph || { nodes: [], edges: [] }
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Compute number from graph
  const numberResult: GraphNumberResult = useMemo(() => {
    return graphToNumber(graph);
  }, [graph]);

  // Add node
  const addNode = useCallback((color: string, x: number, y: number) => {
    const newNode = createNode(generateId('node'), color, x, y);
    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    return newNode.id;
  }, []);

  // Update node position
  const updateNodePosition = useCallback((nodeId: string, x: number, y: number) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      ),
    }));
  }, []);

  // Update node color
  const updateNodeColor = useCallback((nodeId: string, color: string) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, color } : node
      ),
    }));
  }, []);

  // Add edge
  const addEdge = useCallback((sourceId: string, targetId: string) => {
    // Check if edge already exists
    const exists = graph.edges.some(
      e => (e.source === sourceId && e.target === targetId) ||
           (e.source === targetId && e.target === sourceId)
    );

    if (exists || sourceId === targetId) {
      return null;
    }

    const newEdge = createEdge(generateId('edge'), sourceId, targetId);
    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));
    return newEdge.id;
  }, [graph.edges]);

  // Delete edge
  const deleteEdge = useCallback((edgeId: string) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => edge.id !== edgeId),
    }));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId]);

  // Set graph
  const setGraphData = useCallback((newGraph: Graph) => {
    setGraph(newGraph);
  }, []);

  // Clear graph
  const clearGraph = useCallback(() => {
    setGraph({ nodes: [], edges: [] });
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  return {
    graph,
    numberResult,
    selectedNodeId,
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    addNode,
    updateNodePosition,
    updateNodeColor,
    addEdge,
    deleteEdge,
    setGraphData,
    clearGraph,
  };
}
