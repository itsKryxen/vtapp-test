const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace all instances of the crimson colors with CSS variables.
css = css.replace(/179,\s*40,\s*33/g, 'var(--brand-rgb)');
css = css.replace(/224,\s*104,\s*94/g, 'var(--brand-bright-rgb)');
css = css.replace(/238,\s*156,\s*149/g, 'var(--brand-light-rgb)');

// Add the variables to :root and .light
css = css.replace(
  '  --brand: #b32821;',
  '  --brand-rgb: 179, 40, 33;\n  --brand-bright-rgb: 224, 104, 94;\n  --brand-light-rgb: 238, 156, 149;\n  --brand: #b32821;\n  --brand-bright: #e0685e;\n  --brand-light: #ee9c95;\n  --brand-dark: #6b1713;'
);

css = css.replace(
  '  --brand: #00e5ff;',
  '  --brand-rgb: 0, 229, 255;\n  --brand-bright-rgb: 8, 194, 214;\n  --brand-light-rgb: 0, 255, 157;\n  --brand: #00e5ff;\n  --brand-bright: #08c2d6;\n  --brand-light: #00ff9d;\n  --brand-dark: #008291;'
);

fs.writeFileSync(cssPath, css);

const ringsPath = path.join(__dirname, 'src', 'components', 'HeroRings.tsx');
let rings = fs.readFileSync(ringsPath, 'utf8');
rings = rings.replace(/179,\s*40,\s*33/g, 'var(--brand-rgb)');
rings = rings.replace(/224,\s*104,\s*94/g, 'var(--brand-bright-rgb)');
fs.writeFileSync(ringsPath, rings);

const blueprintPath = path.join(__dirname, 'src', 'components', 'BlueprintMark.tsx');
let blueprint = fs.readFileSync(blueprintPath, 'utf8');
blueprint = blueprint.replace(/#b32821/g, 'var(--brand)');
blueprint = blueprint.replace(/#e0685e/g, 'var(--brand-bright)');
blueprint = blueprint.replace(/#ee9c95/g, 'var(--brand-light)');
blueprint = blueprint.replace(/#6b1713/g, 'var(--brand-dark)');
fs.writeFileSync(blueprintPath, blueprint);

console.log('Replaced colors successfully!');
