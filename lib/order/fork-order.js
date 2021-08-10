"use strict";

var _ = require("../lodash");

module.exports = forkOrder;

/*
 * Assigns an initial order value for each node by performing a DFS search
 * starting from nodes in the first rank. Nodes are assigned an order in their
 * rank as they are first visited.
 *
 * This approach comes from Gansner, et al., "A Technique for Drawing Directed
 * Graphs."
 *
 * Returns a layering matrix with an array per layer and each layer sorted by
 * the order of its nodes.
 */
function forkOrder(g, fork) {
  var visited = {};
  var simpleNodes = _.filter(g.nodes(), function (v) {
    return !g.children(v).length;
  });
  var maxRank = _.max(_.map(simpleNodes, function (v) { return g.node(v).rank; }));
  var layers = _.map(_.range(maxRank + 1), function () { return []; });
  var orderedVs = _.sortBy(simpleNodes, function(v) { return g.node(v).rank; });
  for (var i = 0; i <= maxRank; ++ i) {
    if (i === 0) {
      _.forEach(orderedVs, function(v) {
        var node = g.node(v);
        if (node.rank === 0) {
          visited[v] = true;
          layers[node.rank].push(v);
        }
      });
    } else {
      _.forEach(layers[i-1], function(parent) {
        _.forEach((fork[parent] || {}).children, function(v) {
          if (!visited[v] && _.find(orderedVs, function(node) { return node === v; })) {
            var node = g.node(v);
            visited[v] = true;
            layers[node.rank].push(v);
          }
        });
      });
    }
  }
  var unvisited = _.filter(orderedVs, function(v) {
    return !visited[v];
  });
  _.forEach(unvisited, function(v) {
    var node = g.node(v);
    visited[v] = true;
    layers[node.rank || 0].push(v);
  });

  return layers;
}
