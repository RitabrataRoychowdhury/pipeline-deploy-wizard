Pre-Redesign Backup

What this is:
- A snapshot of application source prior to redesign.
- Excludes: src/pages/demo/** and src/pages/landing/** (kept intact in main tree).

How to use it:
- Browse INVENTORY.txt to see what’s included.
- To restore everything from this backup into src (overwriting current work):
    rsync -av --delete backups/<this-backup>/src/ src/
  Or on systems without rsync:
    cp -r backups/<this-backup>/src/* src/

Partial restore:
- Copy specific files or folders back into `src/` as needed.

Compare with current code:
- Use diff recursively:
    diff -ru src backups/<this-backup>/src | less
- Or git diff with worktree copy if desired.

Notes:
- Context files (package.json, tsconfig*, vite config, etc.) are included here for reference; they are not auto-restored by commands above. Restore them manually if required.
- This backup mirrors the structure of `src` except for excluded demo and landing pages.

Created by Codex CLI assistant.
