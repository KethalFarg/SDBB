const fs = require('fs');
const path = require('path');

// Target Configuration
const SVG_FILE = '60f.svg';
const COMPONENT_NAME = 'Age60F';
const COMPONENT_FILE = 'Age60F.tsx';

const svgPath = path.join(process.cwd(), 'public', SVG_FILE);
const outPath = path.join(process.cwd(), 'components', 'icons', COMPONENT_FILE);
const dir = path.dirname(outPath);

console.log(`Processing ${SVG_FILE} -> ${COMPONENT_FILE}`);
console.log('Reading SVG from:', svgPath);

if (!fs.existsSync(svgPath)) {
    console.error('File not found:', svgPath);
    process.exit(1);
}

// Read SVG file
const svgData = fs.readFileSync(svgPath, 'utf8');

// Simple regex replacement for class -> className, etc.
const svgContent = svgData
    .replace(/class=/g, 'className=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/<\?xml.*?\?>/g, '') // Remove XML declaration
    .replace(/xmlns:xlink/g, 'xmlnsXlink');

const componentContent = `import React from 'react';

const ${COMPONENT_NAME} = ({ className = "w-12 h-12", ...props }: React.SVGProps<SVGSVGElement>) => (
${svgContent}
);

export default ${COMPONENT_NAME};
`;

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

    ${ svgContent }
);

export default Sleep;
`;

fs.writeFileSync(outPath, componentContent);
console.log('Wrote component to:', outPath);
