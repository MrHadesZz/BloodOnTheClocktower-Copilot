# Third-party materials and rights

The root `LICENSE` covers only original material that the project contributors have authority to license. It does not replace any upstream license or grant rights in game intellectual property.

Runtime dependency license texts are collected in `THIRD_PARTY_LICENSES.txt`. The production build includes that file, `LICENSE`, `NOTICE`, this overview, and the Z3/font notices, and precaches them for offline access.

| Material | Upstream license / owner | Local notice / source |
| --- | --- | --- |
| Z3 runtime and `z3-solver` | MIT | `public/z3/LICENSE.txt`; <https://github.com/Z3Prover/z3> |
| Noto Sans CJK SC subset | SIL Open Font License 1.1 | `public/fonts/OFL-Sans.txt` |
| Noto Serif CJK SC subset | SIL Open Font License 1.1 | `public/fonts/OFL-Serif.txt` |
| React and React DOM | MIT | Installed packages' LICENSE files; <https://github.com/facebook/react> |
| Lucide React icons | ISC | Installed `lucide-react` LICENSE; <https://github.com/lucide-icons/lucide> |
| Other build and test dependencies | Respective upstream licenses | Exact versions are in `package-lock.json`; retain applicable package notices when redistributing |
| Blood on the Clocktower names and game-related references | Respective owners, including The Pandemonium Institute | References are recorded in `reference/clocktower_design/sources.md`; no game IP rights are granted by this repository |

The user interface uses Lucide icons and a project-specific SVG favicon rather than a bundled official character-token art set. This description is not an assertion that every aspect of the application has been approved by the game rights holders.

This is an unofficial, experimental player aid. The finite model checks conditional consistency of recorded information; its results are not official rules rulings or a substitute for a storyteller's decisions. Unsupported rules and exhausted search budgets must remain visibly unknown.

Before public distribution, check the current [TPI Community Created Content Policy](https://bloodontheclocktower.com/pages/community-created-content-policy), including its case-by-case treatment of player aids and restrictions on competing digital tools. Noncommercial licensing and an unofficial label do not establish TPI approval. Any approval applies only to its stated scope and does not automatically cover forks or commercial uses.
