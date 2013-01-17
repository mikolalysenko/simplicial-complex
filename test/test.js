var test = require("tap").test
  , top = require("../topology.js");

function arr_equals(t, a, b) {
  console.log(a, "---", b);
  t.equals(a.length, b.length, "lengths don't match");
  for(var i=0; i<a.length; ++i) {
    t.equals(a[i].length, b[i].length, "testing cells["+i+"]");
    for(var j=0; j<a[i].length; ++j) {
      t.equals(a[i][j], b[i][j], "testing cells["+i+"]: " + a[i] + " ; " + b[i]);
    }
  }
}

test("normalize", function(t) {

  var r = [[6, 2, 3], [1, 2, 4], [0, 5, 1], [1], [5,0,1]];
  top.normalize(r);
  
  arr_equals(t, r, [
    [0,1,5],
    [1],
    [1,2,4],
    [2,3,6]
  ]);
  
  t.end();
});

test("skeleton", function(t) {

  var r = [[1,2,3]];
  arr_equals(t, top.skeleton(r,1), [
    [1,2],
    [1,3],
    [2,3]
  ]);
  
  var h = [[1,2,3],[2,3,4]];
  arr_equals(t, top.skeleton(h, 1), [
    [1,2],
    [1,3],
    [2,3],
    [2,4],
    [3,4]
  ]);
  
  var k = [[1,2,3,4,5,6,7,8]];
  arr_equals(t, top.skeleton(k, 0), [
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8]
  ]);

  var s = [[0,1,2,3]];
  arr_equals(t, top.skeleton(s, 2), [
    [0,1,2],
    [0,1,3],
    [0,2,3],
    [1,2,3]
  ]);

  t.end();
});