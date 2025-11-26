import React from "react";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}></header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>
          ⟟ ⊑⏃⎐⟒ ⏚⟒⟒⋏ ⟒⌖⌿⟒⍀⟟⋔⟒⋏⏁⟟⋏☌ ⍙⟟⏁⊑ ⋔⟒⎅⟟⏁⏃⏁⟟⍜⋏ ⎎⍜⍀ ⏃ ⌰⍜⋏☌ ⏁⟟⋔⟒, ⏚⎍⏁ ⟊⎍⌇⏁
          ⍀⟒- ☊⟒⋏⏁⌰⊬ ⟟ ⌇⟒⟒⋔ ⏁⍜ ⊑⏃⎐⟒ ☊⍜⋔⟒ ⏃☊⍀⍜⌇⌇ ⏃⋏⍜⏁⊑⟒⍀ ⏚⟒⟟⋏☌ ⟟⋏ ⏁⊑⟒⍀⟒. ⟟⏁ ⋔⏃⊬
          ⟊⎍⌇⏁ ⏚⟒ ⋔⟒ ⌰⍜⍜☍⟟⋏☌ ⏃⏁ ⋔⟒, ⏚⎍⏁ ⍙⊑⏃⏁⟒⎐⟒⍀ ⟟⏁ ⟟⌇, ⟟⏁ ⟟⌇ ⌇⊑⍜⍙⟟⋏☌ ⋔⟒ ⌇⍜⋔⟒
          ⍀⟒⏃⌰⌰⊬
        </p>
      </footer>
    </div>
  );
}
