const size = 16;
const offset = size / 2;
const srange = size * 2;

const seed = Math.random() * 100;
noise.seed(seed);

const colors = {
    green: [0.3, 0.95, 0.4],
    gray: [0.95, 0.95, 0.95],
    brown: [0.5, 0.95, 0.4],
    blue: [0.3, 0.95, 0.4]//[0.3, 0.4, 0.95]
};

function isFilled(x, y, z) {
    const h = ((noise.simplex2(x / 200, z / 200) + 1) / 2) * size * 4;

    if (y > h) {
        return 0;
    }

    let n1 = noise.simplex3(x / 100, y / 100, z / 100);
    let n2 = noise.simplex3(x / 80, y / 80, z / 80);
    let n = ((n1 + 1) / 2) + Math.pow(((n2 + 1) / 2), 4);
    return y <= 0 || n > 0.6 ? 1 : 0;
}

function generateChunk(xo, yo, zo) {
    const geometry = new Geometry();
    const chunk = Array(size).fill(0).map(_ => Array(size).fill(0).map(_ => Array(size).fill(0)));
    const lights = Array(size + 2).fill(0).map(_ => Array(size + 2).fill(0).map(_ => Array(size + 2).fill(0)));

    for (let x = size - 1; x >= 0; x--) {
        for (let y = size - 1; y >= 0; y--) {
            for (let z = size - 1; z >= 0; z--) {
                chunk[x][y][z] = isFilled(x + xo, y + yo, z + zo);
    
                // if (chunk[x][y][z]) {
                    // lights[x][y][z] = 0;
                    // continue;
                // }
    
                // let lval = ((lights[x] || [])[y + 1] || [])[z];
                // lval = lval == undefined ? srange : lval + 1;
                // lights[x][y][z] = Math.min(srange, lval);
            }
        }
    }

    for (let x = size + 1; x >= 0; x--) {
        for (let y = size + 1; y >= 0; y--) {
            for (let z = size + 1; z >= 0; z--) {
                if (isFilled(x + xo - 1, y + yo - 1, z + zo - 1)) {
                    lights[x][y][z] = 0;
                    continue;
                }
    
                let lval = ((lights[x] || [])[y + 1] || [])[z];

                if (lval == undefined) {
                    let ti = 0;
                    while(ti < srange && !isFilled(x + xo - 1, y + yo + ti - 1, z + zo -1)) {
                        ti += 1;
                    }
                    lval = ti;
                } else {
                    lval += 1;
                }
                lights[x][y][z] = Math.min(srange, lval);
            }
        }
    }

    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                if (chunk[x][y][z]) {

                    const bottom = y > 0 && chunk[x][y - 1][z];
                    const top    = isFilled(x + xo, y + yo + 1, z + zo);//y < size - 1 && chunk[x][y + 1][z];
                    const left   = x > 0 && chunk[x - 1][y][z];
                    const right  = x < size - 1 && chunk[x + 1][y][z];
                    const front  = z < size - 1 && chunk[x][y][z + 1];
                    const back   = z > 0 && chunk[x][y ][z - 1];

                    let total = 0;
                    let sum = 0;
                    let r = 1;

                    for (let xi = -r; xi < r + 1; xi++) {
                        for (let yi = 0; yi < r + 1; yi++) {
                            for (let zi = -r; zi < r + 1; zi++) {
                                if (xi == 0 && yi == 0 && zi == 0) {
                                    continue
                                }

                                const x0 = x + xi;
                                const y0 = y + yi;
                                const z0 = z + zi;

                                let isfilled = isFilled(x0 + xo, y0 + yo, z0 + zo);
                                let light = ((lights[x0 + 1] || [])[y0 + 1] || [])[z0 + 1];

                                if (!isfilled) {
                                    total += 1;
                                    sum += light == undefined ? srange : light;
                                }
                            }
                        }
                    }

                    let shadow = (sum / total) / srange;

                    let color;

                    if (y + yo == 0) {
                        color = colors.blue;
                    } else if (!top && shadow > 0.2) {
                        color = colors.green;
                    // } else if (!top) {
                        // color = colors.brown;
                    } else {
                        color = colors.gray;
                    }

                    const shadowVec = [shadow, shadow, shadow];
                    
                    const p0 = geometry.addVertex([[x + xo, y + yo, z + zo], shadowVec,color]);
                    const p1 = geometry.addVertex([[x + xo, y + yo, z + 1 + zo], shadowVec, color]);
                    const p2 = geometry.addVertex([[x + 1 + xo, y + yo, z + 1 + zo], shadowVec, color]);
                    const p3 = geometry.addVertex([[x + 1 + xo, y + yo, z + zo], shadowVec, color]);
                    const p4 = geometry.addVertex([[x + xo, y + 1 + yo, z + zo], shadowVec, color]);
                    const p5 = geometry.addVertex([[x + xo, y + 1 + yo, z + 1 + zo], shadowVec, color]);
                    const p6 = geometry.addVertex([[x + 1 + xo, y + 1 + yo, z + 1 + zo], shadowVec, color]);
                    const p7 = geometry.addVertex([[x + 1 + xo, y + 1 + yo, z + zo], shadowVec, color]);

                    if (!bottom) {
                        geometry.addFace([p0, p2, p1]);
                        geometry.addFace([p0, p3, p2]);
                    }

                    if (!top) {
                        geometry.addFace([p4, p5, p6]);
                        geometry.addFace([p4, p6, p7]);
                    }
                    

                    if (!left) {
                        geometry.addFace([p4, p0, p1]);
                        geometry.addFace([p4, p1, p5]);
                    }

                    if (!right) {
                        geometry.addFace([p6, p2, p3]);
                        geometry.addFace([p6, p3, p7]);
                    }

                    if (!front) {
                        geometry.addFace([p5, p1, p2]);
                        geometry.addFace([p5, p2, p6]);
                    }

                    if (!back) {
                        geometry.addFace([p7, p3, p0]);
                        geometry.addFace([p7, p0, p4]);
                    }
                }
            }
        }
    }

    return geometry;
}
