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
                // `style[weight]` uses a variable, so the member is not the fontWeight key.
                if (node.computed && node.property.type !== 'Literal') return;
                if (isFontWeight(node.property)) report(node.property);
            },
        };
    },
};

/** Skips a computed key that is a variable. A literal or a bare fontWeight identifier still counts. */
function isFontWeightKey(node) {
    if (node.computed && node.key.type !== 'Literal') return false;
    return isFontWeight(node.key);
}

/** An identifier or a quoted key. A plain string that merely contains the word is neither. */
function isFontWeight(node) {
    if (!node) return false;
    if (node.type === 'Identifier') return node.name === 'fontWeight';
    if (node.type === 'Literal') return node.value === 'fontWeight';
    return false;
}
