/** @type {import('eslint').Rule.RuleModule} */

// CSS named colors. `transparent` is a named color in the spec, and `none` is an SVG paint
// keyword; both are allowed, as is `url(#id)`, so they stay out of this set. The British
// spellings are real CSS keywords, not copy, so the spell check has to leave this list alone.
// cspell:disable
const CSS_COLOR_NAMES = new Set([
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkgrey',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'grey',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightgrey',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'rebeccapurple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
]);
// cspell:enable

// Longer runs are listed first so a 6 or 8 digit hex is not accepted as a shorter one.
const HEX_COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/;

// Recognize the function name rather than validating CSS arguments. Numeric patterns miss
// scientific notation, `none` channels, relative colors, and nested calculations on the web.
const COLOR_FUNCTION = /\b(?:rgba?|hsla?)\(/i;

const COLOR_PROPS = new Set([
    'color',
    'fill',
    'stroke',
    'stopColor',
    'tintColor',
    'placeholderTextColor',
]);

/**
 * Rejects raw colors in styles. Tokens live in `src/theme`, which the config exempts.
 * A text search would also flag `url(#id)` and comments, so this walks the syntax tree.
 */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow hex, rgb, hsl, and CSS color names in styles. Use a token from @/theme.',
        },
        schema: [],
        messages: {
            literal: 'Use a color token from @/theme instead of a raw color.',
        },
    },
    create(context) {
        function check(node) {
            const parts = stringParts(node);
            if (parts.length === 0) return;
            if (!isInStyle(node)) return;

            if (parts.some((part) => hasColorFunction(part))) {
                context.report({ node, messageId: 'literal' });
                return;
            }

            const whole = parts.length === 1 && !hasExpressions(node) ? parts[0] : null;
            if (whole !== null && isCssColorName(whole) && isColorValue(node)) {
                context.report({ node, messageId: 'literal' });
            }
        }

        return {
            Literal: check,
            TemplateLiteral: check,
        };
    },
};

function stringParts(node) {
    if (node.type === 'Literal' && typeof node.value === 'string') return [node.value];
    if (node.type === 'TemplateLiteral') {
        // Each quasi is one static piece of the template, between the expressions.
        // cspell:disable-next-line
        return node.quasis.map((part) => part.value.cooked ?? '');
    }
    return [];
}

function hasExpressions(node) {
    return node.type === 'TemplateLiteral' && node.expressions.length > 0;
}

/**
 * Hex and color functions count anywhere inside a style string. `url(#id)` is a paint
 * reference, so a hex-shaped id there is not a color literal.
 */
function hasColorFunction(value) {
    const withoutPaintUrls = value.replace(/url\(\s*#[^)]*\)/gi, '');
    return HEX_COLOR.test(withoutPaintUrls) || COLOR_FUNCTION.test(withoutPaintUrls);
}

function isCssColorName(value) {
    return CSS_COLOR_NAMES.has(value.trim().toLowerCase());
}

/** StyleSheet.create, a `style` prop, and the JSX paint props are the style positions. */
function isInStyle(node) {
    let current = node.parent;
    while (current) {
        if (current.type === 'JSXAttribute') {
            const name = jsxAttributeName(current);
            return name === 'style' || COLOR_PROPS.has(name);
        }
        if (isStyleSheetCreate(current)) return true;
        current = current.parent;
    }
    return false;
}

/**
 * A CSS color name is only a literal on a color key or paint prop. `pointerEvents: 'none'`
 * is a layout value that happens to sit in a style object.
 */
function isColorValue(node) {
    let current = node.parent;
    while (current) {
        if (current.type === 'Property') {
            if (current.key === node) return false;
            const name = propertyName(current.key);
            return name !== null && isColorKey(name);
        }
        if (current.type === 'JSXAttribute') {
            const name = jsxAttributeName(current);
            return name !== null && COLOR_PROPS.has(name);
        }
        current = current.parent;
    }
    return false;
}

function isColorKey(name) {
    return name === 'color' || name.endsWith('Color') || name === 'fill' || name === 'stroke';
}

function isStyleSheetCreate(node) {
    if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') return false;
    const { object, property, computed } = node.callee;
    return (
        !computed &&
        object.type === 'Identifier' &&
        object.name === 'StyleSheet' &&
        property.type === 'Identifier' &&
        property.name === 'create'
    );
}

function propertyName(node) {
    if (!node) return null;
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    return null;
}

function jsxAttributeName(attribute) {
    if (attribute.name && attribute.name.type === 'JSXIdentifier') return attribute.name.name;
    return null;
}
