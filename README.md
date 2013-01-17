mesh-topology
=============

Topological operations and indexing for simplicial complexes (ie triangular meshes, tetrahedral meshes, etc.) in node.js.

Usage
=====

First, you need to install the library using npm:

    npm install mesh-topology

    
And then in your scripts, you can just require it like usual:

    var top = require("mesh-topology");

Cell complexes in `mesh-topology` are represented as arrays of vertex indices.  For example, here is a triangular mesh:

    var tris = [
        [0,1,2],
        [1,2,3],
        [2,3,4]
      ];
      
And here is how you would compute its edges using `mesh-topology`:

    var edges = top.skeleton(tris, 1);
    
    //Result:
    //  edges = [ [0,1],
    //            [0,2],
    //            [1,2],
    //            [1,3],
    //            [2,3],
    //            [2,4],
    //            [3,4] ]


`skeleton(cells, n)`
--------------------
Computes the [n-skeleton](http://en.wikipedia.org/wiki/N-skeleton) of an unoriented simplicial complex.  The result is returned in `normalize`d order.

* `cells` is a cell complex
* `n` is the dimension of the skeleton to compute.

Example:

* `skeleton(tris, 1)` returns all the edge in a triangular mesh
* `skeleton(tets, 2)` returns all the faces of a tetrahedral mesh
* `skeleton(cells, 0)` returns all the vertices of a mesh

Time complexity:  `O( cells.length * (d choose n) )`, where d is the dimension of the cell complex.

`normalize(cells)`
------------------
Canonicalizes a cell complex.  Sorts all cells lexicographically and removes duplicates.  Does not preserve orientation.

* `cells` is a complex.

Note that this function is done **in place**.  `cells` will be mutated.  If this is not acceptable, you should make a copy first using `cloneCells`.

Time complexity: `O(d * cells.length * log(cells.length) )`

`findCell(cells, c, sorted)`
-----------------------------
Finds the index of cell `c` in a `normalize`d array of cells.

* `cells` is a `normalize`'d array of cells
* `c` is a cell represented by an array of vertex indices
* `sorted` if set to `true` then assume that the query cell `c` is sorted lexicographically (ie `c.sort()` was called).

Returns: The index of `c` in the array if it exists, otherwise -1

Time complexity: `O(d * log(cells.length))`, where `d` is the max of the dimension of `cells` and `c`

`buildIndex(base_cells, query_cells)`
------------------------------
Builds an index for [neighborhood queries](http://en.wikipedia.org/wiki/Polygon_mesh#Summary_of_mesh_representation).  This allows you to quickly find cells the in `base_cells` which are incident to `query_cells`.

* `base_cells` is any array of cells
* `query_cells` is a `normalize`d array of cells

Returns: An array with the same length as `query_cells`, each entry of which is an array of all cells in `base_cells` which are incident to `query_cells[i]`.

Time complexity: `O(d * 2^d * base_cells.length * log(query_cells.length))`, where `d` is the larger dimension of either `base_cells` and `query_cells`.

`cloneCells(cells)`
-------------------
Makes a copy of a cell complex

* `cells` is an array of cells

Returns: A deep copy of the cell complex

Time complexity: `O(cells.length * d)`

`countVertices(cells)`
----------------------
An optimized way to get the number of 0-cells in a cell complex with dense, sequentially indexed vertices.  If `cells` has these properties, then:

    countVertices(cells)
    
Is equivalent to:

    skeleton(cells, 0).length

* `cells` is a cell complex
    
Returns: The number of vertices in the cell complex

Time complexity:  `O(d * cells.length)`

`stars(cells[, vertex_count])`
------------------------------
A more optimized way to build an index for vertices for cell complexes with sequentially enumerated vertices.  If `cells` is a complex with each occuring exactly once, then:

    stars(cells)

Is equivalent to doing:

    buildIndex(cells, skeleton(cells, 0), 0)
    
* `cells` is a cell complex
* `vertex_count` is an optional parameter giving the number of vertices in the cell complex.  If not specified, then `countVertices()` is used internally to get the size of the cell complex.

Returns: An array of elements with the same length as `vertex_count` giving the [vertex stars of the mesh](http://en.wikipedia.org/wiki/Star_(graph_theory)) as indexed arrays of cells.

Time complexity:  `O(d * cells.length)`

Credits
=======
(c) 2013 Mikola Lysenko.  MIT License

