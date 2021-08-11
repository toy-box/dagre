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
  var ranks = [];
  _.forEach(unvisited, function(v) {
    var node = g.node(v);
    if (ranks.length === 0 || _.find(ranks, function(rank) { return rank !== node.rank; })) ranks.push(node.rank);
  });
  _.forEach(ranks, function(rank) {
    if (rank -1 > -1) {
      var rankChilds = [];
      var rankArr = _.filter(orderedVs, function(v) { 
        var node = g.node(v);
        return node.rank === rank;
      });
      _.forEach(layers[rank-1], function(layer) {
        var children = (fork[layer] || {}).children;
        if(children && children.length > 0) {
          _.forEach(children, function(child) {
            rankChilds.push(child);
            // if (!_.find(rankChilds, function(ch) { return ch === child; })) rankChilds.push(child);
          });
        } else if (g.successors(layer) && g.successors(layer).length > 0) {
          rankChilds.push(g.successors(layer)[0]);
        }
      });
      var rankChildBoys = [];
      _.forEach(rankChilds, function(child) {
        var ch = _.find(rankChilds, function(ar) {
          return child === ar;
        });
        if (ch) {
          rankChildBoys.push(ch);
        } else {
          rankChildBoys.push(child);
        }
      });
      // console.log(rankChilds, ranks, unvisited);
      console.log(rankChildBoys, rankChilds, rankArr, '111');
      var currentRanks = _.cloneDeep(rankArr);
      _.forEach(rankChildBoys, function(v, index) {
        var idx = null;
        var obj = _.find(rankArr, function(ar, arrIdx) {
          if (ar === v) {
            idx = arrIdx;
            return true;
          }
        });
        if (idx > -1 && currentRanks[index] !== obj) {
          var item = currentRanks[index];
          currentRanks.splice(idx, 1, item);
          currentRanks.splice(index, 1, obj);
          console.log(currentRanks);
        }
      });
      layers[rank] = _.filter(currentRanks, function(r) { return r; });
    }
  });
  // _.forEach(unvisited, function(v) {
  //   var node = g.node(v);
  //   visited[v] = true;
  //   // var list = layers[node.rank];
  //   layers[node.rank] = [];
  //   if (node.rank -1 > -1) {
  //     _.forEach(layers[node.rank -1], function(layer) {
  //       var children = (fork[layer] || {}).children;
  //       if (children && children.length > 0) {
  //         _.forEach(children, function(child) {
  //           if (!_.find(layers[node.rank], function(r) { return r === child; })) {
  //             if (_.find(list, function(li) { return li === child; })) {
  //               layers[node.rank].push(child);
  //             } else {
  //               layers[node.rank].push(v);
  //             }
  //           }
  //         });
  //       } else if (!_.find(layers[node.rank], function(r) { return r === v; })) {
  //         layers[node.rank || 0].push(v);
  //       }
  //     });
  //   } else {
  //     layers[node.rank || 0].push(v);
  //   }
  // });
  console.log(layers, ranks);

  return layers;
}
