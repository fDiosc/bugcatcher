# BugCatcher React SDK

BugCatcher is an intelligent bug capture tool with session replays and AI-powered triage. This SDK allows you to easily integrate the BugCatcher widget into your React applications.

## Installation

```bash
npm install @bugcatcher/react
# or
yarn add @bugcatcher/react
# or
pnpm add @bugcatcher/react
```

## Usage

Import the `BugCatcherWidget` and add it to your root component (usually `App.tsx` or `layout.tsx`).

```tsx
import { BugCatcherWidget } from '@bugcatcher/react';

function App() {
  return (
    <>
      {/* Your app content */}
      <BugCatcherWidget apiKey="YOUR_PROJECT_API_KEY" />
    </>
  );
}
```

## Configuration

The `BugCatcherWidget` component accepts the following props:

| Prop | Type | Description |
| --- | --- | --- |
| `apiKey` | `string` | **Required**. Your project's API key from the BugCatcher dashboard. |

## How it works

The widget automatically:
- Captures console errors and logs.
- Tracks network requests (Fetch and XHR).
- Records user sessions for visual replays.
- Provides a simple UI for users to report bugs with optional descriptions.

Visit [bugcatcher.app](https://bugcatcher.app) to manage your projects and view reports.

## License

MIT
