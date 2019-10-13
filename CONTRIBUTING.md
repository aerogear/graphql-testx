# Contributing to GraphQL Testx

First of all, thank you for your interest in contributing to the project :heart_eyes::tada:

The following is a set of guidelines for contributing to **GraphQL Testx**. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Pull Requests Guideline](#pull-requests-guideline)
  - [General Flow](#general-flow)
  - [Pull Request Requirements](#pull-request-requirements)
- [Git Commit Messages Style Guide](#git-commit-messages-style-guide)
- [Inspirations](#inspirations)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Pull Requests Guideline

Contributions to **GraphQL Testx** are made via [Github Pull Requests](https://help.github.com/en/articles/about-pull-requests).

### General Flow

1. Create a fork of the repository
2. Clone your forked repository to your local machine
4. Create a local branch for your work `git checkout -b <user-branch-name>`.
5. Begin working on your local branch
6. When you are ready to contribute your code, run `git push origin <user-branch-name>` to push your changes to your own fork
7. Go to the **GraqhQL Testx** main repository and you will see your change waiting and a link to *“Create a Pull Request”*. Click the link to create a Pull Request.
8. Be as detailed as possible in the description of your Pull Request. Describe what you changed, why you changed it, and give a detailed list of changes and impacted files. If your Pull Request is related to an existing issue, be sure to link the issue in the Pull Request itself, in addition to the Pull Request description.
9. You will receive comments on your Pull Request. Use the Pull Request as a dialog on your changes.

### Pull Request Requirements

Please follow these steps to have your contribution considered by the maintainers:

1. Follow the [style guide](#git-commit-messages-style-guide)
2. Follow the instructions in [pull request template](.github/PULL_REQUEST_TEMPLATE.md) (open in *raw* mode)

The reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Git Commit Messages Style Guide

### Message Structure

A commit message consists of three distinct parts separated by a blank line: the **title** (type of the message and subject), an optional **body** and an optional **footer**. The layout looks like this:

```
type: subject

body

footer
```

### The Type

The type is contained within the title and can be one of these types:

- **feat**: a new feature
- **fix**: a bug fix
- **docs**: changes to documentation
- **style**: formatting, missing semi colons, etc; no code change
- **refactor**: refactoring production code
- **test**: adding tests, refactoring test; no production code change
- **chore**: updating build tasks, package manager configs, etc; no production code change

### The Subject

- Subjects should be no greater than 50 characters.
- Should begin with a capital letter and do not end with a period.
- Uses the imperative, present tense (for examples, use **"change"**; not “changed” nor “changes”).

### The Body

- Optional and only used when a commit requires a bit of explanation and context. Not all commits are complex enough to warrant a body.
- Use the body to explain the **what** and **why** of a commit, not the how.
- The blank line between the title and the body is required.
- You should limit the length of each line to no more than 72 characters.

### The Footer

The footer is optional and is used to reference issue tracker IDs.

### Example Commit Message

```
feat: Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. In some contexts, the first line is treated as the
subject of the commit and the rest of the text as the body. The
blank line separating the summary from the body is critical (unless
you omit the body entirely); various tools like `log`, `shortlog`
and `rebase` can get confused if you run the two together.

Explain the problem that this commit is solving. Focus on why you
are making this change as opposed to how (the code explains that).
Are there side effects or other unintuitive consequenses of this
change? Here's the place to explain them.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded
   by a single space, with blank lines in between, but conventions
   vary here

If you use an issue tracker, put references to them at the bottom,
like this:

Resolves: #123
See also: #456, #789
```

> **Tip:** Use `git commit` command to open an editor in the terminal and you will be able to edit the commit message any way you want :wink:

## Inspirations

This statement thanks the following, on which it draws for content and inspiration:

[Udacity Git Commit Message Style Guide](http://udacity.github.io/git-styleguide/)  
[Atom Contributing Guide](https://github.com/atom/atom/blob/master/CONTRIBUTING.md)  
[VinylDNS Contributing Guide](https://www.vinyldns.io/contributing.html)