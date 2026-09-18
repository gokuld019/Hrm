"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import PageLoader from "./components/PageLoader";
import { ThemeProvider } from "./ThemeContext";

export default function RootLayout({ children }) {
  const [initialLoading, setInitialLoading] = useState(true);

  // First-time page load
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        <ThemeProvider>

          {/* ── First load loader ── */}
          {initialLoading && (
            <>
              <div className="loader-wrapper">
                <div className="loader-container">
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <div className="dot dot-3"></div>
                </div>
              </div>

              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", width: 0, height: 0 }}
              >
                <defs>
                  <filter id="goo">
                    <feGaussianBlur result="blur" stdDeviation="10" in="SourceGraphic" />
                    <feColorMatrix
                      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
                      mode="matrix"
                      in="blur"
                    />
                  </filter>
                </defs>
              </svg>
            </>
          )}

          {/* ── Route change loader ── */}
          <PageLoader />

          {children}

        </ThemeProvider>
      </body>
    </html>
  );
}