# Contributing Guide

Thank you for your interest in contributing to EZTutor! This guide helps you submit effective contributions.

## Code of Conduct

- Be respectful and inclusive
- Welcome feedback and criticism gracefully
- Focus on the code, not the person
- Report issues responsibly and privately

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork:** `git clone https://github.com/YOUR-USERNAME/EZTutor.git`
3. **Add upstream remote:** `git remote add upstream https://github.com/refatwashere/EZTutor.git`
4. **Create a feature branch:** `git checkout -b feature/your-feature-name`

## Development Setup

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup instructions.

```bash
npm run install-all
npm start
```

## Making Changes

### Before You Code

1. **Check existing issues** - Don't duplicate existing work
2. **Create/find a GitHub issue** - Describe what you're working on
3. **Discuss major changes** - Comment on the issue to get feedback

### Code Standards

#### JavaScript/Node.js

```javascript
// ✅ Good: Clear, descriptive names
const validateUserEmail = (email) => {
  return EMAIL_REGEX.test(email.trim());
};

// ❌ Bad: Too short, unclear
const check = (e) => {
  return REX.test(e);
};
```

#### React Components

```javascript
// ✅ Good: Functional component with hooks
export function LessonPlan() {
  const [title, setTitle] = useState('');
  const { addToast } = useNotification();

  const handleSave = async () => {
    try {
      await saveLessonPlan(title);
      addToast('Saved successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return <div>{/* JSX */}</div>;
}

// ❌ Bad: Class component, inline handlers
class LessonPlan extends React.Component {
  render() {
    return <div onClick={this.handleClick}>{/* JSX */}</div>;
  }
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): brief description

Longer explanation if needed

Fixes #123
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, semicolons)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Build, dependencies, etc.
- `perf` - Performance improvements

**Examples:**
```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(lesson): handle missing content gracefully"
git commit -m "docs(setup): add PostgreSQL installation steps"
git commit -m "test(export): add edge case test for missing data"
```

### Testing Requirements

**Before submitting a PR:**

1. **Run all tests:**
   ```bash
   npm test
   npm run test:client
   ```

2. **Add tests for new features:**
   - Server: `server/tests/`
   - Client: React Testing Library or Jest

3. **Verify no linting errors:**
   ```bash
   cd client && npm start  # Check for warnings
   ```

### Code Review Checklist

Before submitting, ensure:

- [ ] Code follows style guide
- [ ] No console.log/debugger statements
- [ ] Added tests for new features
- [ ] Tests pass locally (`npm test`)
- [ ] No security vulnerabilities
- [ ] Documentation updated (if applicable)
- [ ] Commit messages are clear
- [ ] Rebased on latest `main`

## Submitting Changes

### Pull Request Process

1. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request:**
   - Go to github.com/refatwashere/EZTutor
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Title Format:**
   ```
   feat(scope): Brief description
   ```

4. **PR Description:**
   ```markdown
   ## Changes
   - What changed
   - Why it changed

   ## Testing
   - How to test these changes
   - Screenshots if UI changes

   ## Related Issues
   Fixes #123
   Closes #456

   ## Checklist
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

### Addressing Review Feedback

1. Make requested changes
2. Push to the same branch (PR updates automatically)
3. **Don't force-push** - Reviewer can see your changes
4. Request re-review when ready

## Feature Branch Workflow

### Feature branch from development

```bash
# Get latest changes
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat(scope): description"

# Push to your fork
git push origin feature/my-feature

# Create PR on GitHub
```

### Update feature branch from main

```bash
# If main changed while you're working
git fetch upstream
git rebase upstream/main

# Or merge if you prefer
git merge upstream/main
```

## Common Contributions

### Adding a New Page

1. Create `client/src/pages/MyPage.js`
2. Add route to `client/src/App.js`
3. Create API endpoint in `server/routes/api.js`
4. Add tests for new functionality
5. Submit PR with description

### Fixing a Bug

1. Create issue describing the bug
2. Reference issue in commit: `git commit -m "fix: issue #123"`
3. Add regression test that fails then passes
4. Submit PR with issue reference

### Improving Documentation

1. Edit relevant `.md` file
2. Test that links work
3. Submit PR with description of changes

## Reporting Bugs

Use GitHub Issues:

1. **Search existing issues** first
2. **Provide a detailed description:**
   - What did you expect?
   - What actually happened?
   - Steps to reproduce
3. **Include environment info:**
   - OS (Windows, Mac, Linux)
   - Node.js version
   - Browser (if client-side)
4. **Attach screenshots/logs** if helpful

## Feature Requests

1. **Create GitHub Issue** with label `enhancement`
2. **Describe the use case:**
   - Who benefits?
   - What problem does it solve?
   - How would you use it?
3. **Suggest implementation** if you have ideas

## Getting Help

- **Questions?** Comment on related issue
- **Stuck?** Ask for help in PR comments
- **General help?** Check [docs/](docs/) folder

## Recognition

Contributors are recognized in:
- Commit history
- CHANGELOG.md
- README.md (maintainer's discretion)

## License

By contributing, you agree your work is licensed under the MIT License.

---

**Questions?** Open an issue with the `question` label.

**Thank you for contributing! 🎉**

Last Updated: February 6, 2026
