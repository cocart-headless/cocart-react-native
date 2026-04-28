<!-- CoCart SDK Support Policy Template v1 -->

# Support & Versioning Policy

> **Note:** This SDK is currently in development. The full support lifecycle takes effect once the SDK is declared stable and production-ready.

## Versioning

This SDK follows [Semantic Versioning](https://semver.org/) (SemVer):

- **Major** (X.0.0) — Breaking changes to the public API
- **Minor** (x.Y.0) — New features that are backward-compatible
- **Patch** (x.y.Z) — Bug fixes and security patches

Only the **latest major version** receives active development. Older major versions remain available for install but receive no updates.

### What constitutes a breaking change

- Removing or renaming an exported class, function, type, hook, or interface
- Changing required props of `CoCartProvider`
- Changing required parameters of any exported hook or method
- Changing return types in a way that breaks type assignability
- Dropping a React Native version from the supported matrix

### What is NOT a breaking change

- Adding new optional props or options
- Adding new exported hooks, classes, or types
- Internal refactors that do not affect the public API
- Adding a new React Native version to the supported matrix
- Bug fixes that correct behaviour to match documentation

## SDK Lifecycle

| Phase | Description | Duration |
|---|---|---|
| **Active** | New features, bug fixes, security patches | Current major version |
| **Maintenance** | Security patches and critical bug fixes only | Previous major version, 12 months |
| **Deprecated** | No updates; remains installable | After maintenance ends |

## Supported React Native Versions

| React Native | Status | SDK Support |
|---|---|---|
| 0.74+ | Current | Supported — tested in CI |
| 0.72–0.73 | Maintenance | Minimum supported version |
| 0.71 and below | Unsupported | Not tested or guaranteed |

### Expo Compatibility

| Expo SDK | React Native | Support |
|---|---|---|
| 51+ | 0.74 | Supported |
| 50 | 0.73 | Supported |
| 49 and below | ≤0.72 | Not tested |

### Core SDK Peer Dependency

This package requires `@cocartheadless/sdk` as a peer dependency. The supported version range is `^1.0.0`. Feature availability depends on the version of `@cocartheadless/sdk` installed.

## Deprecation Notices

We communicate deprecations through:

1. **JSDoc tags** — `@deprecated` annotations visible in IDE tooltips
2. **Changelog entry** — Every deprecation noted in release notes
3. **Minimum one minor release** — A deprecation notice ships at least one version before removal
4. **Migration guide** — Major version upgrades include a migration guide in the `docs/` folder

## Getting Help

- **Documentation:** https://cocartapi.com/docs
- **Community:** https://cocartapi.com/community
- **Issues:** https://github.com/cocart-headless/cocart-react-native-sdk/issues
