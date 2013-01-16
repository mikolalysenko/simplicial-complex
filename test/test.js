var test = require("tap").test
  , top = require("../topology.js");

function arr_equals(t, a, b) {
  t.equals(a.length, b.length);
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

  t.end();
});