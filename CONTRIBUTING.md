# Contributing to ng-tourkit

Thanks for helping improve ng-tourkit. By submitting a contribution, you agree
that your work is licensed under the same terms as the project (`LICENSE`).

## Development setup

```sh
npm install
npm start                 # demo app
npm test                  # library + demo tests
npx ng build ng-tourkit   # publishable build
```

## Before you open a PR

1. Keep changes focused — one concern per PR when practical.
2. Match existing Angular/TypeScript style in the repo.
3. Add or update tests for behavior changes.
4. Run `npm test` and ensure the library still builds.
5. Update `CHANGELOG.md` under an `[Unreleased]` section when the change is user-facing.
6. Do not introduce third-party runtime dependencies into the library without discussion.

## Pull requests

- Describe the problem and the approach.
- Note any breaking changes or migration steps.
- Link related issues when applicable.

## Security reports

Do not file public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md).

## Questions and scope

If you are unsure whether a feature fits the library’s “no third-party runtime
deps” direction, open an issue first so we can align before a large PR.
