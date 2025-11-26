import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "./components/Layout/AppLayout";
import { GraphCanvas } from "./components/GraphCanvas/GraphCanvas";
import { ColorPalette } from "./components/NodeEditor/ColorPalette";
import { Machine, MachineHandle } from "./components/Machine/Machine";
import { ExamplesPanel } from "./components/ExamplesPanel/ExamplesPanel";
import {
  HistoryPanel,
  HistoryEntry,
} from "./components/HistoryPanel/HistoryPanel";
import { useGraph } from "./hooks/useGraph";
import { useBackgroundAudio } from "./hooks/useBackgroundAudio";
import { ReactFlowInstance } from "reactflow";
import { Graph } from "./core/graph/graphTypes";
import { revelationExamples } from "./data/revelationExamples";
import styles from "./App.module.css";

function App() {
  const {
    graph,
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
  } = useGraph();

  const [draggingFromNode, setDraggingFromNode] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState<{
    exampleIndex: number;
    waitingForOperation: boolean;
    tutorialComplete?: boolean;
  }>({ exampleIndex: 0, waitingForOperation: false });
  const [showResultIndicator, setShowResultIndicator] = useState(false);
  const [highlightColorPalette, setHighlightColorPalette] = useState(false);
  const [operationHistory, setOperationHistory] = useState<HistoryEntry[]>([]);
  const reactFlowInstanceRef = React.useRef<ReactFlowInstance | null>(null);
  const machineRef = useRef<MachineHandle>(null);

  // Background audio
  useBackgroundAudio({
    src: "/alien.mp3",
    volume: 0.2,
    loop: true,
    autoplay: true,
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEdgeId, deleteEdge]);

  const handleCanvasClick = (color: string, x: number, y: number) => {
    addNode(color, x, y);
  };

  const handleNodeClick = (
    nodeId: string,
    shiftKey?: boolean,
    isEdgeTarget?: boolean
  ) => {
    if (isEdgeTarget && selectedNodeId && selectedNodeId !== nodeId) {
      // Complete edge creation from drag
      addEdge(selectedNodeId, nodeId);
      setSelectedNodeId(null);
      setDraggingFromNode(null);
    } else if (shiftKey && selectedNodeId && selectedNodeId !== nodeId) {
      // Create edge from selected node to clicked node
      addEdge(selectedNodeId, nodeId);
      setSelectedNodeId(null);
    } else if (draggingFromNode && draggingFromNode !== nodeId) {
      // Complete edge creation (from drag - legacy)
      addEdge(draggingFromNode, nodeId);
      setDraggingFromNode(null);
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
      setDraggingFromNode(null);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  };

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);

  const handleLoadExample = (
    slot1: Graph,
    slot2: Graph,
    operation: "star" | "dagger" | "gcd" | "lcm",
    exampleId: string
  ) => {
    if (machineRef.current) {
      const exampleIndex = revelationExamples.findIndex(
        (ex) => ex.id === exampleId
      );
      machineRef.current.loadSlots(slot1, slot2, operation);
      // Set tutorial step to wait for operation, reset tutorialComplete if it was set
      setTutorialStep({
        exampleIndex,
        waitingForOperation: true,
        tutorialComplete: false,
      });
    }
  };

  const handleResultGraph = (resultGraph: Graph) => {
    setGraphData(resultGraph);
    // Show result indicator
    setShowResultIndicator(true);
    setTimeout(() => {
      setShowResultIndicator(false);
    }, 2000);
  };

  const handleOperationComplete = (
    graph1: Graph,
    graph2: Graph,
    operation: "star" | "dagger" | "gcd" | "lcm",
    result: Graph
  ) => {
    // Add to history
    const historyEntry: HistoryEntry = {
      graph1: { ...graph1, nodes: [...graph1.nodes], edges: [...graph1.edges] },
      graph2: { ...graph2, nodes: [...graph2.nodes], edges: [...graph2.edges] },
      operation,
      result: { ...result, nodes: [...result.nodes], edges: [...result.edges] },
      timestamp: Date.now(),
    };
    setOperationHistory((prev) => [...prev, historyEntry]);

    // Advance to next example after a brief delay
    setTimeout(() => {
      setTutorialStep((prev) => {
        // Only advance if we were waiting for an operation (tutorial mode)
        if (!prev.waitingForOperation) {
          return prev;
        }
        const nextIndex = prev.exampleIndex + 1;
        if (nextIndex < revelationExamples.length) {
          return {
            exampleIndex: nextIndex,
            waitingForOperation: false,
            tutorialComplete: false,
          };
        }
        // Tutorial complete - highlight clear button
        return {
          exampleIndex: prev.exampleIndex,
          waitingForOperation: false,
          tutorialComplete: true,
        };
      });
    }, 1000);
  };

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <ExamplesPanel
            onLoadExample={handleLoadExample}
            tutorialStep={tutorialStep}
          />
          <Machine
            ref={machineRef}
            currentGraph={graph}
            onResultGraph={handleResultGraph}
            onClearCanvas={clearGraph}
            onOperationComplete={handleOperationComplete}
            waitingForOperation={tutorialStep.waitingForOperation}
          />
        </div>

        <div className={styles.centerPanel}>
          <div
            className={`${styles.canvasWrapper} ${
              showResultIndicator ? styles.resultFlash : ""
            }`}
          >
            <GraphCanvas
              graph={graph}
              isCanonical={false}
              width={undefined}
              height={undefined}
              onNodeDrag={updateNodePosition}
              onNodeClick={(nodeId, shiftKey, isEdgeTarget) =>
                handleNodeClick(nodeId, shiftKey, isEdgeTarget)
              }
              onEdgeClick={handleEdgeClick}
              onCanvasClick={() => {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
                setDraggingFromNode(null);
              }}
              onNodeAdd={(color, x, y) => handleCanvasClick(color, x, y)}
              onEdgeAdd={addEdge}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              selectedColor={null}
              onFlowInstanceReady={(instance) => {
                reactFlowInstanceRef.current = instance;
              }}
            />
            <button
              className={`${styles.clearButton} ${
                tutorialStep.tutorialComplete && !highlightColorPalette
                  ? styles.tutorialHighlight
                  : ""
              }`}
              onClick={() => {
                clearGraph();
                if (tutorialStep.tutorialComplete) {
                  setHighlightColorPalette(true);
                }
                // Reset tutorial state so no example buttons are highlighted
                setTutorialStep({
                  exampleIndex: -1,
                  waitingForOperation: false,
                  tutorialComplete: false,
                });
              }}
            >
              ☊⌰⟒⏃⍀
            </button>
          </div>
          <div className={styles.toolbar}>
            <div className={styles.colorSection}>
              <ColorPalette
                selectedColor={selectedNode?.color || null}
                onColorSelect={(color) => {
                  if (selectedNodeId) {
                    // If a node is selected, change its color
                    updateNodeColor(selectedNodeId, color);
                  } else {
                    // Otherwise, add a new node to the center of the visible viewport
                    if (reactFlowInstanceRef.current) {
                      try {
                        const flowContainer = document.querySelector(
                          ".react-flow"
                        ) as HTMLElement;
                        if (flowContainer) {
                          const rect = flowContainer.getBoundingClientRect();
                          const screenCenterX = rect.left + rect.width / 2;
                          const screenCenterY = rect.top + rect.height / 2;
                          const flowPos =
                            reactFlowInstanceRef.current.screenToFlowPosition({
                              x: screenCenterX,
                              y: screenCenterY,
                            });
                          addNode(color, flowPos.x, flowPos.y);
                        } else {
                          addNode(color, 400, 300);
                        }
                      } catch {
                        // Fallback if calculation fails
                        addNode(color, 400, 300);
                      }
                    } else {
                      // Fallback to default center if instance not ready
                      addNode(color, 400, 300);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <HistoryPanel history={operationHistory} />
        </div>
      </div>
    </AppLayout>
  );
}

export default App;
