/**
 * Rehype plugin: envuelve <table> en <div class="table-wrapper overflow-x-auto">
 * para permitir scroll horizontal en móviles sin romper el layout.
 */
export default function rehypeWrapTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      const isTableWrapper = parent?.properties?.className?.includes('table-wrapper');
      if (node.tagName === 'table' && parent && !isTableWrapper) {
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrapper', 'overflow-x-auto', 'w-full', 'my-8'] },
          children: [node]
        };
        parent.children[index] = wrapper;
      }
    });
  };
}

function visit(tree, type, visitor) {
  if (tree.type === type) {
    visitor(tree, null, null);
  }
  if (tree.children) {
    tree.children.forEach((child, index) => {
      if (child.type === type) {
        visitor(child, index, tree);
      }
      visit(child, type, visitor);
    });
  }
}
