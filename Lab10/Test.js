require ("./Ex4.js");

var attributes = "Daniel;21;21.5;20-age";

var pieces = attributes.split(";");

for (i=0; i<pieces.length; i++) {
errArray = isNonNegInt(pieces[i], true);
console.log(`i: ${i} ${error.Array.join(",")}`);
} 