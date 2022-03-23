# Contribution Guide / コントリビュート方法 / 貢獻指南 / 寄與하는 方法

## Developing / 開發

```bash
pnpm install
pnpm run dev -- --open
pnpm run typesafe-i18n
```

### Tauri Build

```bash
pnpm run tauri dev
```
## Releasing / 發佈

1. Clear current tree (commit changes)
2. Run pre-release check
   ```bash
   pnpm run beforeRelease   
   ```
3. Bump version numbers
  ```bash
  pnpx @rstacruz/bump-cli package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json # -M / -m / -p
  cargo update --manifest-path=src-tauri/Cargo.toml
  ```
3. Commit ``V: Release v<version>``
4. Tag the commit above
  ```
  pnpm run tag
  ```
5. Push to Remote
  ```
  git push --follow-tags
  ```

### Commit Message Naming Convention / コミットメッセージ命名規則 / 提交消息命名规则 / 커밋 메시지 명명 규칙 (커밋 메시지 命名 規則)

```regex
(F|R|D|S|V|I): <Verb Phrase>
```

- **F** for **F**eature (Additions, Fixes, Ajustments of functionalities, etc.)
- **T** for **T**esting (New tests / specs, Test refactoring, etc.)
- **R** for **R**efactor (Adjustments of code structure, naming, typing, comments, etc.)
- **D** for **D**ocumentation (Documentation, README, etc.)
- **S** for **S**tyle (Styling, Visual Design Adjustments, etc.)
- **V** for **V**ersion (Versioning, Dependencies, Licensing, etc.)
- **C** for **C**onfiguration (Building, Linting, CLI Tooling, etc.)
- **I** for **I**18n (Translation, Localisation, etc.)
