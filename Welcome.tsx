import React, { useMemo, useState } from "react";
import "./Welcome.css";

const SUGGESTIONS = [
  {
    label: "Top clients by asset growth",
    value: "Show my top clients by asset growth",
  },
  {
    label: "Monthly inflow trend",
    value: "How did inflows change last month?",
  },
  {
    label: "Client concentration",
    value: "Show client concentration analysis",
  },
  {
    label: "Portfolio performance",
    value: "What changed in portfolio performance this quarter?",
  },
];

export default function Welcome({
  userName = "Rohidas",
  onSubmit,
  onSuggestion,
  theme = "light",
}) {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(theme === "dark");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  }, []);

  const submit = (event) => {
    event.preventDefault();

    const value = query.trim();

    if (!value) return;

    onSubmit?.(value);
  };

  const chooseSuggestion = (value) => {
    setQuery(value);
    onSuggestion?.(value);
  };

  return (
    <main
      className={`investorlens-welcome ${
        isDark ? "dark" : "light"
      }`}
    >
      <div className="welcome-shell">
        <section
          className="welcome-content"
          aria-labelledby="welcome-title"
        >
          {/* Brand */}

          <div className="welcome-brand">
            InvestorLens
          </div>

          {/* Greeting */}

          <h1 id="welcome-title">
            {greeting}
            <span className="welcome-gradient-text">
              {" "}
              {userName}{" "}
            </span>
          </h1>

          <p className="welcome-subtitle">
            What would you like to explore?
          </p>

          {/* Search */}

          <div className="welcome-search-wrap">
            <form
              className="welcome-search"
              onSubmit={submit}
            >
              <span
                className="welcome-spark"
                aria-hidden="true"
              >
                ✦
              </span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                type="text"
                autoComplete="off"
                placeholder="Ask InvestorLens anything..."
                aria-label="Ask InvestorLens anything"
              />

              <button
                type="submit"
                aria-label="Submit question"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Suggested prompts */}

          <div className="welcome-starters">
            <div className="welcome-starters-label">
              Try asking
            </div>

            <div className="welcome-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  className="welcome-suggestion"
                  onClick={() =>
                    chooseSuggestion(
                      suggestion.value
                    )
                  }
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}

          <div className="welcome-disclaimer">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 3l8 4v5c0 4.5-3.4 7.8-8 9-4.6-1.2-8-4.5-8-9V7l8-4z"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              <path
                d="M12 8v4m0 4h.01"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>

            <span>
              AI-generated insights may be incomplete.
              Validate critical decisions with official
              reports and source systems.
            </span>
          </div>
        </section>
      </div>

      {/* Local theme toggle.
          Remove this if your application already
          controls the global theme. */}

      <button
        type="button"
        className="welcome-theme-toggle"
        onClick={() =>
          setIsDark((value) => !value)
        }
        aria-label={
          isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >
        {isDark ? "☀" : "☾"}
      </button>
    </main>
  );
          }
