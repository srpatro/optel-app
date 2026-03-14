import React from 'react';

/**
 * Render the original static feed page as an iframe to preserve
 * the exact HTML/CSS/JS behavior from /public/theme/feed.html.
 *
 * This avoids needing to reimplement the theme's JS initialization
 * inside the SPA.
 */
const Feed = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        title="Socimo Feed"
        src="/theme/feed.html"
        style={{ width: '100%', height: '100%', border: 0 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default Feed;
