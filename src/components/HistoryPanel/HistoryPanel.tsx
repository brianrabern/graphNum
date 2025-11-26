import { Graph } from "../../core/graph/graphTypes";
import { GraphCanvas } from "../GraphCanvas/GraphCanvas";
import styles from "./HistoryPanel.module.css";

export interface HistoryEntry {
  graph1: Graph;
  graph2: Graph;
  operation: "star" | "dagger" | "gcd" | "lcm";
  result: Graph;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
}

const operationSymbols: Record<"star" | "dagger" | "gcd" | "lcm", string> = {
  star: "★",
  dagger: "†",
  gcd: "▼",
  lcm: "▲",
};

export function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>⊑⟟⌇⏁⍜⍀⊬</h2>
      </div>
      <div className={styles.entries}>
        {history.length === 0 ? (
          <div className={styles.emptyState}>
            <p>⋏⍜ ⍜⌿⟒⍀⏃⏁⟟⍜⋏⌇ ⊬⟒⏁</p>
          </div>
        ) : (
          history
            .slice()
            .reverse()
            .map((entry) => (
              <div key={entry.timestamp} className={styles.entry}>
                <div className={styles.graphPreview}>
                  <GraphCanvas
                    graph={entry.graph1}
                    isCanonical={true}
                    width={undefined}
                    height={undefined}
                    selectedNodeId={null}
                    selectedEdgeId={null}
                    nonInteractive={true}
                  />
                </div>
                <div className={styles.operationSymbol}>
                  {operationSymbols[entry.operation]}
                </div>
                <div className={styles.graphPreview}>
                  <GraphCanvas
                    graph={entry.graph2}
                    isCanonical={true}
                    width={undefined}
                    height={undefined}
                    selectedNodeId={null}
                    selectedEdgeId={null}
                    nonInteractive={true}
                  />
                </div>
                <div className={styles.equalsSign}>⇒</div>
                <div className={styles.graphPreview}>
                  <GraphCanvas
                    graph={entry.result}
                    isCanonical={true}
                    width={undefined}
                    height={undefined}
                    selectedNodeId={null}
                    selectedEdgeId={null}
                    nonInteractive={true}
                  />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
