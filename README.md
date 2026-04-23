# Context Monitor

Pi extension that shows a color-coded context usage indicator in the footer.

## How it works

- **Below 70k tokens** – nothing shown
- **70k to 100k** – shows "Context: Xk" with gradient from faint red → bright red
- **100k+** – bright red warning

## Install

```bash
pi install git:github.com/ktappdev/context-monitor
```

Or from a local path:

```bash
pi install /path/to/context-monitor
```

## License

MIT
