mesh-topology
=============

Topological operations and indexing for simplicial complexes (ie triangular meshes, tetrahedral meshes, etc.)


`skeleton(cells, n)`
--------------------
Finds the n-skeleton of a simplicial complex

`buildIndex(cells, n_skel, n)`
------------------------------
Builds an index for neighborhood queries

`normalize(cells)`
------------------
Canonicalizes a cell complex.  Sorts all cells and removes duplicates.  Does not preserve orientation.

`findCell(cells, c, sorted)`
-----------------------------
Finds the cell `c` in the normalized array of cells.

`cloneCells(cells)`
-------------------
Makes a copy of a cell complex

`countVertices(cells)`
----------------------
Counts the number of vertices.  Short hand for:

    skeleton(cells, 1).length


`stars(cells[, vertex_count])`
------------------------------
A more optimized way to build an index for vertices.  Formally equivalent to the following:

    buildIndex(cells, skeleton(cells, 1), 1);

Credits
=======


