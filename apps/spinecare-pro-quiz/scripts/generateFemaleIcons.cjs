const fs = require('fs');
const path = require('path');

const ICONS = [
    { svg: '20f.svg', name: 'Age20F' },
    { svg: '30f.svg', name: 'Age30F' },
    { svg: '40f.svg', name: 'Age40F' },
    { svg: '60f.svg', name: 'Age60F' }
];

ICONS.forEach(icon => {
    const svgPath = path.join(process.cwd(), 'public', icon.svg);
    const outPath = path.join(process.cwd(), 'components', 'icons', `${icon.name}.tsx`);
    const dir = path.dirname(outPath);

    console.log(`Processing ${icon.svg} -> ${icon.name}...`);

    if (!fs.existsSync(svgPath)) {
        console.error(`Error: ${icon.svg} not found at ${svgPath}`);
        return;
    }

    try {
        const svgData = fs.readFileSync(svgPath, 'utf8');

        // Basic conversions
        const svgContent = svgData
            .replace(/class=/g, 'className=')
            .replace(/fill-rule=/g, 'fillRule=')
            .replace(/stroke-width=/g, 'strokeWidth=')
            .replace(/stroke-linecap=/g, 'strokeLinecap=')
            .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<\?xml.*?\?>/g, '')
            .replace(/xmlns:xlink/g, 'xmlnsXlink')
            .replace(/xlink:href/g, 'xlinkHref')
            .replace(/clip-path/g, 'clipPath')
            .replace(/clip-rule/g, 'clipRule')
            .replace(/<svg([^>]*)>/, '<svg$1 className={className} {...props}>');

        const componentContent = `import React from 'react';

const ${icon.name} = ({ className = "w-12 h-12", ...props }: React.SVGProps<SVGSVGElement>) => (
${svgContent}
);

export default ${icon.name};
`;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outPath, componentContent);
        console.log(`Success: Created ${icon.name}.tsx`);
    } catch (err) {
        console.error(`Failed to process ${icon.svg}:`, err);
    }
});
