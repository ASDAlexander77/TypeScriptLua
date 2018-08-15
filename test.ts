var loops = 15
var nx = 120
var nz = 120

function morph(a, f) {
    var PI2nx = Math.PI * 8/nx
    var sin = Math.sin
    var f30 = -(50 * sin(f*Math.PI*2))
    
    for (var i = 0; i < nz; ++i) {
        for (var j = 0; j < nx; ++j) {
            a[3*(i*nx+j)+1]    = sin((j-1) * PI2nx ) * -f30
        }
    }
}

    
var a = []
for (var i=0; i < nx*nz*3; ++i) 
    a[i] = 0

for (var i = 0; i < loops; ++i) {
    morph(a, i/loops)
}

testOutput = 0;
for (var i = 0; i < nx; i++)
    testOutput += a[3*(i*nx+i)+1];
a = null;