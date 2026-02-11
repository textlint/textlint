---
title: VS Code textlint extension has been transferred to community-based maintenance
author: 3w36zj6
authorURL: http://github.com/3w36zj6
---


[vscode-textlint]: https://marketplace.visualstudio.com/items?itemName=taichi.vscode-textlint
[textlint]: https://marketplace.visualstudio.com/items?itemName=3w36zj6.textlint
[@taichi]: https://github.com/taichi

We have just transferred VS Code textlint extension to community-based maintenance and published version 0.12.0.

## Summary

Version 0.12.0 marks a significant milestone as the VS Code textlint extension has been officially transferred to the textlint organization. The extension is now available as [textlint] in the marketplace while maintaining full compatibility with existing configurations. This transition ensures continued development and closer integration with textlint core projects.

Our focus with this release has been on ensuring a smooth transition for all users, setting the stage for future enhancements in upcoming versions.

The community-maintained extension can be accessed at the following links:

- [textlint/vscode-textlint: Extension to integrate textlint into VS Code.](https://github.com/textlint/vscode-textlint)
- [textlint - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=3w36zj6.textlint)

## Why official fork?

[vscode-textlint] was originally created by [@taichi]. This extension has gained widespread adoption and appreciation from the community, but over time, numerous issues and pull requests accumulated while maintenance activity slowed down. Since VS Code is one of the most popular code editors today, having a well-maintained textlint integration is vital for the growth of the textlint ecosystem.

The community has expressed strong interest in seeing this project continue to evolve. Therefore, to ensure ongoing maintenance and development, the extension has been transferred to the textlint organization starting with version 0.12.0. This transition allows us to leverage community contributions and provide more regular updates.

We'd like to express our gratitude to [@taichi] and all contributors.

For more details about this decision, please refer to the discussion at:

- [Transferring vscode-textlint to community-based maintenance · textlint · Discussion #2](https://github.com/orgs/textlint/discussions/2)

## How to migrate for existing users?

For existing [vscode-textlint] users, migration is straightforward. VS Code supports [deprecated extensions](https://code.visualstudio.com/updates/v1_68#_deprecated-extensions), which allows us to guide users to the recommended alternative.

The original extension has already been marked as deprecated, so you should receive a notification suggesting migration to the new extension. Simply follow the prompts to uninstall [vscode-textlint] and install [textlint].

Good news: All your existing configuration in `settings.json` will continue to work with the new extension without any changes required.

## How to install for new users?

New users can simply install the [textlint] extension directly from the Visual Studio Code Marketplace.

## Progress toward verified publisher status

VS Code offers a domain verification system called verified publisher that helps users identify official extensions from trusted sources. This feature allows publishers to verify their domain ownership, which then displays a verified badge on their extensions in the marketplace.

- [Publishing Extensions | Visual Studio Code Extension API](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#verify-a-publisher)

As this extension has now become the official textlint extension for VS Code, obtaining verified publisher status would be ideal to increase user trust. However, the verification process requires a waiting period of at least 6 months before we become eligible.

Due to this time constraint, we've temporarily placed this issue on hold. Rest assured, we plan to pursue verification once we meet the eligibility requirements to further establish the extension's legitimacy within the VS Code ecosystem.

## Automated publishing workflow

As part of the transfer to the textlint organization, we've automated the VS Code extension publishing process. This workflow is not only beneficial for maintaining official releases but can also help developers who want to create VSIX files in their local environment.

- [vscode-textlint/.github/workflows/publish.yaml at v0.12.0 · textlint/vscode-textlint](https://github.com/textlint/vscode-textlint/blob/v0.12.0/.github/workflows/publish.yaml)

Creating a VSIX package for the extension is straightforward. Simply run `npm run package` in the project's root directory. This command performs two key steps:

1. First, it executes the `prepackage` script, which uses webpack to build and bundle both the server and client components of the extension into a single deployable package.
2. Then, it runs `vsce package` to generate the final VSIX file.

## Full changelog

- [Release v0.12.0 · textlint/vscode-textlint](https://github.com/textlint/vscode-textlint/releases/tag/v0.12.0)
