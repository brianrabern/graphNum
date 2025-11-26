import { useState, useImperativeHandle, forwardRef } from "react";
import { Graph } from "../../core/graph/graphTypes";
import {
  starOperation,
  daggerOperation,
  gcdOperation,
  lcmOperation,
} from "../../core/graph/graphOperations";
import { GraphCanvas } from "../GraphCanvas/GraphCanvas";
import { IoMdGitNetwork } from "react-icons/io";
import { playAlienSound } from "../../utils/soundEffects";
import styles from "./Machine.module.css";

interface MachineProps {
  currentGraph: Graph;
  onResultGraph: (graph: Graph) => void;
  onClearCanvas: () => void;
  onOperationComplete?: (
    graph1: Graph,
    graph2: Graph,
    operation: "star" | "dagger" | "gcd" | "lcm",
    result: Graph
  ) => void;
  waitingForOperation?: boolean;
}

export interface MachineHandle {
  loadSlots: (
    slot1: Graph,
    slot2: Graph,
    operation?: "star" | "dagger" | "gcd" | "lcm"
  ) => void;
}

export const Machine = forwardRef<MachineHandle, MachineProps>(
  (
    {
      currentGraph,
      onResultGraph,
      onClearCanvas,
      onOperationComplete,
      waitingForOperation = false,
    },
    ref
  ) => {
    const [slot1, setSlot1] = useState<Graph | null>(null);
    const [slot2, setSlot2] = useState<Graph | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOutputting, setIsOutputting] = useState(false);
    const [suggestedOperation, setSuggestedOperation] = useState<
      "star" | "dagger" | "gcd" | "lcm" | null
    >(null);

    useImperativeHandle(ref, () => ({
      loadSlots: (
        graph1: Graph,
        graph2: Graph,
        operation?: "star" | "dagger" | "gcd" | "lcm"
      ) => {
        setSlot1({ ...graph1 });
        setSlot2({ ...graph2 });
        setSuggestedOperation(operation || null);
      },
    }));

    const handleCapture = (slotSetter: (graph: Graph) => void) => {
      slotSetter({ ...currentGraph });
      onClearCanvas();
    };

    const handleOperation = async (
      operation: "star" | "dagger" | "gcd" | "lcm"
    ) => {
      if (!slot1 || !slot2) return;

      setIsProcessing(true);

      // Brief delay for mysterious effect
      await new Promise((resolve) => setTimeout(resolve, 300));

      let result: Graph;
      switch (operation) {
        case "star":
          result = starOperation(slot1, slot2);
          break;
        case "dagger":
          result = daggerOperation(slot1, slot2);
          break;
        case "gcd":
          result = gcdOperation(slot1, slot2);
          break;
        case "lcm":
          result = lcmOperation(slot1, slot2);
          break;
      }

      // Show output indicator
      setIsOutputting(true);

      // Play alien sound effect
      playAlienSound();

      // Send result directly to main canvas
      onResultGraph(result);

      // Notify that operation completed with details
      if (onOperationComplete) {
        onOperationComplete(slot1, slot2, operation, result);
      }

      setSlot1(null);
      setSlot2(null);
      setSuggestedOperation(null);
      setIsProcessing(false);

      // Hide output indicator after animation
      setTimeout(() => {
        setIsOutputting(false);
      }, 2000);
    };

    const renderSlot = (
      slot: Graph | null,
      slotSetter: (graph: Graph | null) => void,
      onCapture: () => void
    ) => (
      <div className={styles.slot}>
        {slot ? (
          <div className={styles.slotContent}>
            <div className={styles.slotPreview}>
              <GraphCanvas
                graph={slot}
                isCanonical={true}
                width={undefined}
                height={undefined}
                selectedNodeId={null}
                selectedEdgeId={null}
              />
              <button
                className={styles.updateButton}
                onClick={() => slotSetter(null)}
              >
                ↻
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.captureButton} onClick={onCapture}>
            <span className={styles.captureIcon}>
              <IoMdGitNetwork />
            </span>
            <span className={styles.captureLabel}>⟟⋏⌇⟒⍀⏁ ⌇⏁⍀⎍☊⏁⎍⍀⟒</span>
          </button>
        )}
      </div>
    );

    return (
      <div
        className={`${styles.machine} ${isOutputting ? styles.outputting : ""}`}
      >
        {renderSlot(slot1, setSlot1, () => handleCapture(setSlot1))}

        <div className={styles.operations}>
          {(["star", "dagger", "gcd", "lcm"] as const).map((op) => {
            const isSuggested = suggestedOperation === op && slot1 && slot2;
            const shouldDisable = !!(
              slot1 &&
              slot2 &&
              suggestedOperation &&
              suggestedOperation !== op
            );

            const shouldPulse =
              isSuggested && waitingForOperation && !isProcessing;

            return (
              <button
                key={op}
                className={`${styles.operationButton} ${
                  isProcessing ? styles.processing : ""
                } ${isSuggested ? styles.suggested : ""} ${
                  shouldDisable ? styles.disabledOther : ""
                } ${shouldPulse ? styles.tutorialPulse : ""}`}
                onClick={() => handleOperation(op)}
                disabled={!slot1 || !slot2 || isProcessing || shouldDisable}
              >
                {op === "star" && "★"}
                {op === "dagger" && "†"}
                {op === "gcd" && "▼"}
                {op === "lcm" && "▲"}
              </button>
            );
          })}
        </div>

        {renderSlot(slot2, setSlot2, () => handleCapture(setSlot2))}
        <div className={styles.outputIndicator}></div>
      </div>
    );
  }
);
