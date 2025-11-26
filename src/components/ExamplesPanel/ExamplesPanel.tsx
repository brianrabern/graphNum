import { Graph } from '../../core/graph/graphTypes';
import { revelationExamples, RevelationExample } from '../../data/revelationExamples';
import styles from './ExamplesPanel.module.css';

interface ExamplesPanelProps {
  onLoadExample: (slot1: Graph, slot2: Graph, operation: 'star' | 'dagger' | 'gcd' | 'lcm', exampleId: string) => void;
  tutorialStep: {
    exampleIndex: number;
    waitingForOperation: boolean;
    tutorialComplete?: boolean;
  };
}

export function ExamplesPanel({ onLoadExample, tutorialStep }: ExamplesPanelProps) {
  const handleLoadExample = (example: RevelationExample) => {
    onLoadExample(example.slot1, example.slot2, example.operation, example.id);
  };

  const symbols = ['⌿', '⍀', '⟟', '⋔', '⟒', '⋏', '⎍', '⋔', '⏚', '⟒', '⍀', '⌇'];

  return (
    <div className={styles.container}>
      <div className={styles.buttonsRow}>
        {revelationExamples.map((example, index) => {
          const isCurrentStep = tutorialStep.exampleIndex === index && !tutorialStep.waitingForOperation && !tutorialStep.tutorialComplete;

          return (
            <button
              key={example.id}
              className={`${styles.exampleButton} ${
                isCurrentStep ? styles.pulse : ''
              }`}
              onClick={() => handleLoadExample(example)}
            >
              {symbols[index]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
