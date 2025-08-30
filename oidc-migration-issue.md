# Migrate to npm OIDC Trusted Publishing from Traditional Token-based Authentication

## Overview

npm has released OIDC (OpenID Connect) trusted publishing support as generally available since July 31, 2025. This feature enables secure package publishing directly from CI/CD workflows using ephemeral credentials, eliminating the need for long-lived npm tokens.

## Current State

Textlint currently uses:
- **Build System**: Lerna 8.2.3 with pnpm 10.15.0
- **Publishing**: `lerna publish` command with `NODE_AUTH_TOKEN` (npm token)
- **Packages**: 21 packages (3 main packages + 18 @textlint/* scoped packages)
- **CI/CD**: GitHub Actions for release workflows

## Problem

1. **Security Risk**: Current setup uses long-lived npm tokens stored as GitHub secrets, which pose security risks if compromised
2. **Manual Token Management**: Requires periodic token rotation and manual secret management
3. **No Automatic Provenance**: Must manually add `--provenance` flag for npm provenance attestations

## Proposed Solution

Migrate from traditional npm token authentication to OIDC trusted publishing. This requires:

### Option 1: Use Lerna with npm CLI 11.5.1+
Since Lerna uses npm CLI under the hood, upgrading npm CLI to 11.5.1+ would automatically enable OIDC support when `lerna publish` is executed in a properly configured OIDC environment.

**Pros:**
- Minimal changes to existing workflow
- Maintain Lerna's versioning and changelog features
- Gradual migration possible

**Cons:**
- Lerna doesn't have explicit OIDC documentation
- May have compatibility issues

### Option 2: Migrate from Lerna to pnpm/npm publish (Recommended)
Replace Lerna's publishing functionality with direct pnpm/npm commands while maintaining pnpm workspace structure.

**Pros:**
- Direct control over publishing process
- Native OIDC support with npm 11.5.1+
- Automatic provenance attestations
- Already using pnpm workspace
- Better long-term maintainability

**Cons:**
- Need to reimplement versioning logic
- Need to handle changelog generation separately
- More significant migration effort

## Implementation Steps

### Phase 1: Preparation
1. [ ] Configure npm trusted publishers for all packages via npm web interface
2. [ ] Update npm CLI to version 11.5.1+ in CI environment
3. [ ] Test OIDC authentication in a separate branch

### Phase 2: Migration (Option 2 - Recommended)
1. [ ] Create custom versioning script to replace `lerna version`
   - Handle version bumping across workspace
   - Generate changelogs
   - Create git tags
2. [ ] Replace `lerna publish` with pnpm/npm publish script
   - Iterate through packages
   - Use `npm publish` with OIDC authentication
3. [ ] Update GitHub Actions workflows
   - Configure OIDC permissions (`id-token: write`)
   - Remove `NODE_AUTH_TOKEN` usage
4. [ ] Test canary releases with OIDC
5. [ ] Migrate production release workflow

### Phase 3: Cleanup
1. [ ] Remove npm token from GitHub secrets
2. [ ] Update documentation
3. [ ] Monitor first few releases for issues

## Benefits

1. **Enhanced Security**: Ephemeral tokens that expire after each operation
2. **Zero Secrets Management**: No need to store, rotate, or manage npm tokens
3. **Automatic Provenance**: npm automatically generates and publishes provenance attestations
4. **Reduced Attack Surface**: No long-lived credentials that could be compromised

## Requirements

- npm CLI version 11.5.1 or later
- GitHub Actions with `id-token: write` permission
- Configuration of trusted publishers via npm web interface

## Timeline

- **Week 1-2**: Research and planning
- **Week 3-4**: Implementation and testing in feature branch
- **Week 5**: Canary release testing
- **Week 6**: Production rollout

## References

- [npm trusted publishing with OIDC announcement](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [npm trusted publishers documentation](https://docs.npmjs.com/trusted-publishers/)
- [GitHub issue #4219: npm workspace support](https://github.com/lerna/lerna/issues/4219)
- [npm CLI PR #8336: OIDC implementation](https://github.com/npm/cli/pull/8336)
- [npm CLI PR #8377: OIDC improvements](https://github.com/npm/cli/pull/8377)

## Questions for Discussion

1. Should we maintain Lerna for versioning while using npm publish for publishing?
2. Do we need to migrate all packages at once or can we do a gradual migration?
3. What's the acceptable downtime/risk for the migration?
4. Should we create a fallback mechanism during the transition period?

## Action Items

- [ ] Evaluate current Lerna features we actively use
- [ ] Create proof of concept for OIDC publishing
- [ ] Document rollback procedures
- [ ] Schedule migration during low-activity period

---

/cc @textlint/maintainers