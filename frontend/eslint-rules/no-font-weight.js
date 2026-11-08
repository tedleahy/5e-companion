/** @type {import('eslint').Rule.RuleModule} */

/**
 * Rejects `fontWeight` as syntax. Comments and strings may mention it, which a text search
 * cannot tell apart from `style.fontWeight`, so this matches the syntax tree.
 */
module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow fontWeight. Pick a font family, because Android will not synthesize a weight.',
        },
        schema: [],
        messages: {
            fontWeight: 'Pick a face with fontFamily. Android does not synthesize fontWeight.',
        },
    },
    create(context) {
        function report(node) {
            context.report({ node, messageId: 'fontWeight' });
        }

        return {
            Property(node) {
                if (isFontWeightKey(node)) report(node.key);
            },
            PropertyDefinition(node) {
                if (isFontWeightKey(node)) report(node.key);
            },
            TSPropertySignature(node) {
                if (isFontWeightKey(node)) report(node.key);
            },
            JSXAttribute(node) {
                if (node.name.type === 'JSXIdentifier' && node.name.name === 'fontWeight') {
                    report(node.name);
                }
            },
            MemberExpression(node) {
                // A variable, or a template with expressions, is only known at runtime.
                // An expression-free template is already the fontWeight key.
                if (node.computed && staticText(node.property) === null) return;
                if (isFontWeight(node.property)) report(node.property);
            },
        };
    },
};

/**
 * Skips a computed key whose name is only known at runtime.
 * A literal, a bare identifier, or an expression-free template still counts.
 */
function isFontWeightKey(node) {
    if (node.computed && staticText(node.key) === null) return false;
    return isFontWeight(node.key);
}

/**
 * An identifier, a quoted key, or an expression-free template.
 * A string that merely contains the word is none of these.
 */
function isFontWeight(node) {
    if (!node) return false;
    if (node.type === 'Identifier') return node.name === 'fontWeight';
    return staticText(node) === 'fontWeight';
}

/**
 * The string a literal or an expression-free template holds.
 * A template with expressions is a runtime value, so this returns null.
 */
function staticText(node) {
    if (!node) return null;
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    if (node.type !== 'TemplateLiteral' || node.expressions.length > 0) return null;
    // The first quasi is the whole template when it has no expressions.
    // cspell:disable-next-line
    const cooked = node.quasis[0]?.value.cooked;
    return typeof cooked === 'string' ? cooked : null;
}
