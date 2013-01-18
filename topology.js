"use strict"; "use restrict";

var bits      = require("bit-twiddle")
  , UnionFind = require("union-find");

//Returns the dimension of a cell complex
function dimension(cells) {
  var d = 0;
  for(var i=0; i<cells.length; ++i) {
    d = Math.max(d, cells[i].length);
  }
  return d-1;
}
exports.dimension = dimension;

//Counts the number of vertices in faces
function countVertices(cells) {
  var vc = 0;
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i];
    for(var j=0; j<c.length; ++j) {
      vc = Math.max(vc, c[j]);
    }
  }
  return vc+1;
}
exports.countVertices = countVertices;

//Clone cells
function cloneCells(cells) {
  var ncells = new Array(cells.length);
  for(var i=0; i<cells.length; ++i) {
    ncells[i] = cells[i].slice(0);
  }
  return ncells;
}
exports.cloneCells = cloneCells;

//Computes the vertex stars for the mesh
function stars(cells, vertex_count) {
  if(!vertex_count) {
    vertex_count = countVertices(faces);
  }
  var stars = new Array(vertex_count);
  for(var i=0; i<vertex_count; ++i) {
    stars[i] = [];
  }
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i];
    for(var j=0; j<c.length; ++j) {
      stars[c[j]].push(i);
    }
  }
  return stars;
};
exports.stars = stars;

var lexCompare = new Function("a", "b", [
  "for(var i=0; i<Math.min(a.length,b.length); ++i) {",
    "var d = a[i] - b[i];",
    "if(d) { return d; }",
  "}",
  "return a.length - b.length;"
].join("\n"));

//Sort cells, break orientation but facilitates indexing
function normalize(cells) {
  //Sort cells first
  for(var i=0; i<cells.length; ++i) {
    cells[i].sort();
  }
  cells.sort(lexCompare);
  //Remove duplicates
  var ptr = 1;
  for(var i=1; i<cells.length; ++i) {
    if(lexCompare(cells[i], cells[i-1])) {
      if(i === ptr) {
        ptr++;
        continue;
      }
      var a = cells[i]
        , b = cells[ptr++];
      b.length = a.length;
      for(var j=0; j<a.length; ++j) {
        b[j] = a[j];
      }
    }
  }
  cells.length = ptr;
  return cells;
}
exports.normalize = normalize;

//Computes the n-skeleton of the cell complex
function skeleton(cells, n) {
  var skel = [];
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i];
    for(var k=(1<<(n+1))-1; k<(1<<c.length); k=bits.nextCombination(k)) {
      var b = new Array(n+1)
        , l = 0;
      for(var j=0; j<c.length; ++j) {
        if(k & (1<<j)) {
          b[l++] = c[j];
        }
      }
      skel.push(b);
    }
  }
  return normalize(skel)
}
exports.skeleton = skeleton;

//Finds an ordered cell
function findCell(cells, c, sorted) {
  if(!sorted) {
    c = c.slice(0);
    c.sort();
  }
  var lo = 0
    , hi = cells.length-1;
  while (lo <= hi) {
    var mid = (lo + hi) >> 1
      , s   = lexCompare(cells[mid], c);
    if(s < 0) {
      lo = mid + 1;
    } else if(s > 0) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}
exports.findCell = findCell;

//Builds an index for an n-cell.  This is more general than stars, but less efficient
function buildIndex(cells, n_skel) {
  var index = new Array(n_skel.length);
  for(var i=0; i<index.length; ++i) {
    index[i] = [];
  }
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i].slice(0);
    c.sort();
    for(var k=0; k<=(1<<c.length); ++k) {
      var b = new Array(bits.popCount(k))
        , l = 0;
      for(var j=0; j<c.length; ++j) {
        if(k & (1<<j)) {
          b[l++] = c[j];
        }
      }
      var idx = findCell(n_skel, b, true);
      if(idx >= 0) {
        index[idx].push(i);
      }
    }
  }
  return idx;
}
exports.buildIndex = buildIndex;

//The d-dimensional boundary operator
function boundary(cells, d) {
  //First, enumerate all d-cells in the complex
  var res = [];
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i].slice(0);
    c.sort();
    for(var k=(1<<(d+1))-1; k<(1<<c.length); k=bits.nextCombination(k)) {
      var b = new Array(n+1)
        , l = 0;
      for(var j=0; j<c.length; ++j) {
        if(k & (1<<j)) {
          b[l++] = c[j];
        }
      }
      res.push(b);
    }
  }
  res.sort(lexCompare);
  //Then remove all cells without parity = 1
  var ptr = 0;
  while(true) {
    while(i < res.length && lexCompare(res[i], res[i+1]) === 0) {
      i += 2;
    }
    if(i >= res.length) {
      break;
    }
    var a = res[ptr++]
      , b = res[i++];
    for(var j=0; j<=d; ++d) {
      a[j] = b[j];
    }
  }
  res.length = ptr;
  return res;
}
exports.boundary = boundary;


//Computes connected components for a dense cell complex
function connectedComponents_dense(cells, vertex_count) {
  //Link vertices by cell
  var labels = new UnionFind(vertex_count);
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i];
    for(var j=0; j<c.length; ++j) {
      for(var k=j+1; k<c.length; ++k) {
        labels.link(c[j], c[k]);
      }
    }
  }
  //Split connected components apart
  var components = []
    , component_labels = labels.ranks;
  for(var i=0; i<component_labels.length; ++i) {
    component_labels[i] = -1;
  }
  for(var i=0; i<cells.length; ++i) {
    var l = labels.find(cells[i][0]);
    if(component_labels[l] < 0) {
      component_labels[l] = components.length;
      components.push([cells[i].slice(0)]);
    } else {
      components[component_labels[l]].push(cells[i].slice(0));
    }
  }
  return components;
}

//Computes connected components for a sparse graph
function connectedComponents_sparse(cells) {
  //First compute the 1-skeleton
  var verts = skeleton(cells, 0);
  //Link vertices by cell
  var labels = new UnionFind(verts.length);
  for(var i=0; i<cells.length; ++i) {
    var c = cells[i];
    for(var j=0; j<c.length; ++j) {
      var vj = findCell(vertices, [c[j]], true);
      for(var k=j+1; k<c.length; ++k) {
        labels.link(vj, findCell(vertices, [c[k]], true));
      }
    }
  }
  //Split connected components apart
  var components = []
    , component_labels = labels.ranks;
  for(var i=0; i<component_labels.length; ++i) {
    component_labels[i] = -1;
  }
  for(var i=0; i<cells.length; ++i) {
    var l = labels.find(findCell(verts, [cells[i][0]], true));
    if(component_labels[l] < 0) {
      component_labels[l] = components.length;
      components.push([cells[i].slice(0)]);
    } else {
      components[component_labels[l]].push(cells[i].slice(0));
    }
  }
  return components;
}

//Computes connected components for a cell complex
function connectedComponents(cells, vertex_count) {
  if(vertex_count) {
    return connectedComponents_dense(cells, vertex_count);
  }
  return connectedComponents_sparse(cells);
}
exports.connectedComponents = connectedComponents;


