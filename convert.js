const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'temp_repo', 'index.html');
const outPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Home.jsx');

let html = fs.readFileSync(htmlPath, 'utf8');

// Extract the body content (excluding scripts at the end if any)
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error('Could not find body tag');
  process.exit(1);
}
let bodyHtml = bodyMatch[1];

// Remove the script tags from bodyHtml if any
bodyHtml = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, '');

// Remove HTML comments
bodyHtml = bodyHtml.replace(/<!--[\s\S]*?-->/g, '');

// Convert class to className
bodyHtml = bodyHtml.replace(/ class="/g, ' className="');
bodyHtml = bodyHtml.replace(/ class='/g, " className='");

// Convert for to htmlFor
bodyHtml = bodyHtml.replace(/ for="/g, ' htmlFor="');

// Fix unclosed tags
const unclosedTags = ['img', 'input', 'br', 'hr', 'link', 'meta'];
unclosedTags.forEach(tag => {
  const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
  bodyHtml = bodyHtml.replace(regex, `<${tag}$1 />`);
});

// Convert inline styles to objects (this is tricky with regex, we'll try to find any style="..." and convert them)
bodyHtml = bodyHtml.replace(/style="([^"]*)"/g, (match, styles) => {
  const styleObj = {};
  styles.split(';').forEach(s => {
    if (!s.trim()) return;
    const [key, value] = s.split(':');
    if (!key || !value) return;
    const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
    styleObj[camelKey] = value.trim();
  });
  return `style={${JSON.stringify(styleObj)}}`;
});

// Fix SVG attributes
const svgAttributes = [
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'fill-rule',
  'clip-rule',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'stroke-miterlimit'
];

svgAttributes.forEach(attr => {
  const camelAttr = attr.replace(/-([a-z])/g, g => g[1].toUpperCase());
  const regex = new RegExp(` ${attr}="([^"]*)"`, 'gi');
  bodyHtml = bodyHtml.replace(regex, ` ${camelAttr}="$1"`);
});

// Also replace tabindex -> tabIndex
bodyHtml = bodyHtml.replace(/ tabindex="/gi, ' tabIndex="');

// Map navigation to add Client Portal link
bodyHtml = bodyHtml.replace(
  /<li><a href="#contact" className="nav-link nav-btn" data-page="contact">Contact Us<\/a><\/li>/gi,
  '<li><Link to="/login" className="nav-link">Client Portal</Link></li>\n                    <li><a href="#contact" className="nav-link nav-btn" data-page="contact">Contact Us</a></li>'
);

bodyHtml = bodyHtml.replace(
  /<li><a href="#contact" className="mobile-link mobile-btn" data-page="contact">Contact Us<\/a><\/li>/gi,
  '<li><Link to="/login" className="mobile-link">Client Portal</Link></li>\n                    <li><a href="#contact" className="mobile-link mobile-btn" data-page="contact">Contact Us</a></li>'
);

// Now wrap it in a React component
const reactComponent = `import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../landing.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Dynamically inject the app.js script when component mounts
    const script = document.createElement('script');
    script.src = '/js/app.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Make navigate available to global scope if app.js relies on location changes (optional)
  window.reactNavigate = navigate;

  return (
    <div className="landing-page-container">
      ${bodyHtml}
    </div>
  );
};

export default Home;
`;

fs.writeFileSync(outPath, reactComponent, 'utf8');
console.log('Conversion successful!');
