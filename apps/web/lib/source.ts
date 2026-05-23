import type * as PageTree from "fumadocs-core/page-tree";
import { loader } from "fumadocs-core/source";

import { docs } from "@/.source/server";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});

// Drive the sidebar's root-toggle tabs. Each file-based root folder (e.g.
// `api`, `adapters`) becomes its own tab; everything left at the content root
// is wrapped in a synthetic "General" root folder here rather than moved into a
// folder of its own - this keeps every page URL intact.
const tree = source.pageTree;
const isRoot = (node: PageTree.Node): node is PageTree.Folder =>
  node.type === "folder" && node.root === true;
const roots = tree.children.filter(isRoot);
const rest = tree.children.filter((node) => !isRoot(node));

if (roots.length > 0 && rest.length > 0) {
  const generalFolder: PageTree.Folder = {
    children: rest,
    name: "General",
    root: true,
    type: "folder",
  };

  source.pageTree = { ...tree, children: [generalFolder, ...roots] };
}
