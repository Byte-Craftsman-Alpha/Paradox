"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Team Paradox] Root global error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>500 — System Failure | Team Paradox</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root {
            --bg: #f7f6f2;
            --fg: #111111;
            --fg-soft: #444444;
            --meta: #777777;
            --hairline: rgba(0, 0, 0, 0.12);
            --milk-2: #eeeeea;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0c0d0e;
              --fg: #f2f3f4;
              --fg-soft: #b0b4b8;
              --meta: #6a7178;
              --hairline: rgba(255, 255, 255, 0.12);
              --milk-2: #16181a;
            }
          }
          body {
            margin: 0;
            padding: 0;
            background: var(--bg);
            color: var(--fg);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            max-width: 720px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            box-sizing: border-box;
          }
          .tag {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: var(--meta);
            margin-bottom: 1rem;
            font-family: monospace;
          }
          h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            line-height: 1.05;
            letter-spacing: -0.02em;
            margin: 0 0 1.25rem 0;
            font-weight: 500;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            color: var(--fg-soft);
            margin: 0 0 2rem 0;
          }
          .digest {
            padding: 0.875rem 1rem;
            background: var(--milk-2);
            border: 1px solid var(--hairline);
            font-family: monospace;
            font-size: 13px;
            color: var(--meta);
            margin-bottom: 2rem;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          button, a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 44px;
            padding: 0 1.25rem;
            border: 1px solid var(--hairline);
            background: transparent;
            color: var(--fg);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            text-decoration: none;
            cursor: pointer;
            box-sizing: border-box;
          }
          button.primary {
            background: var(--fg);
            color: var(--bg);
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="tag">500 / Critical Layout Boundary</div>
          <h1>System rendering failed.</h1>
          <p>
            An unrecoverable exception occurred in the root studio shell. Try resetting the session or reloading the application.
          </p>

          {error.digest && (
            <div className="digest">
              Incident Digest: {error.digest}
            </div>
          )}

          <div className="actions">
            <button type="button" className="primary" onClick={() => reset()}>
              Reset Session
            </button>
            <a href="/">
              Reload Studio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

