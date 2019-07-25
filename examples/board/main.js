const canvas = document.getElementById('canvas');
const gl = getContext(canvas, {
    clear: [0.0, 0.0, 0.01, 1.0]
});
const shaders = new ShaderManager(gl);
const programs = new ProgramManager(gl, shaders);
const renderer = new Renderer(gl, programs);

const camera = new OrbitCamera(800, 600);
camera.r = 15;

const entities = [];

function main(delta) {
    camera.update(delta / 1000);
    renderer.draw(entities, camera);
}

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

Promise.all([
    loadSrc('cube.obj'),
    loadSrc('cone.obj'),
    shaders.addVertFromPath('base_vs', 'shaders/base.vs'),
    shaders.addFragFromPath('base_fs', 'shaders/base.fs'),
    shaders.addVertFromPath('screen_vs', 'shaders/screen.vs'),
    shaders.addFragFromPath('screen_fs', 'shaders/screen.fs'),
    shaders.addFragFromPath('extract_bloom_fs', 'shaders/extract_bloom.fs'),
    shaders.addFragFromPath('merge_bloom_fs', 'shaders/merge_bloom.fs'),
    shaders.addFragFromPath('bloom_fs', 'shaders/bloom.fs'),
    shaders.addFragFromPath('merge_ssao_fs', 'shaders/merge_ssao.fs'),
    shaders.addFragFromPath('blur_ssao_fs', 'shaders/blur_ssao.fs'),
    shaders.addFragFromPath('ssao_fs', 'shaders/ssao.fs'),
    shaders.addFragFromPath('fxaa_fs', 'shaders/fxaa.fs')
]).then(res => {
    programs.add('base', 'base_vs', 'base_fs', ['u_view', 'u_proj', 'u_model']);
    programs.add('screen', 'screen_vs', 'screen_fs', ['u_texture']);
    programs.add('extract_bloom', 'screen_vs', 'extract_bloom_fs', ['u_texture']);
    programs.add('merge_bloom', 'screen_vs', 'merge_bloom_fs', ['u_main_texture', 'u_bloom_texture']);
    programs.add('bloom', 'screen_vs', 'bloom_fs', ['u_texture', 'u_brightness', 'u_horizontal']);
    programs.add('merge_ssao', 'screen_vs', 'merge_ssao_fs', ['u_main_texture', 'u_ssao_texture']);
    programs.add('blur_ssao', 'screen_vs', 'blur_ssao_fs', ['u_ssao_texture']);
    programs.add('ssao', 'screen_vs', 'ssao_fs', [
        'u_position',
        'u_normal',
        'u_color',
        'u_noise',
        'u_proj',
        'u_width',
        'u_height',
        {
            name: 'u_samples',
            count: 32
        }
    ]);
    programs.add('fxaa', 'screen_vs', 'fxaa_fs', ['u_colorTexture']);

    const vao = createVAO(gl, parseOBJ(res[0]).map(d => createBuffer(gl, d)));

    const count = 10;
    noise.seed(random() * 100);
    for (let x = 0; x < count; x++) {
        for (let z = 0; z < count; z++) {
            const h = (noise.simplex2(x / 8, z / 8) + 1.0) / 2.0;
            entities.push(new Entity(
                vao, 'base', 
                new Transform(x - count / 2, h * 2, z - count / 2, 1.0, h * 4, 1.0)
            ));
        }
    }

    const conev = createVAO(gl, parseOBJ(res[1]).map(d => createBuffer(gl, d)));

    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * count);
        const z = Math.floor(Math.random() * count);
        const h = (noise.simplex2(x / 8, z / 8) + 1.0) / 2.0;
        entities.push(new Entity(
            conev, 'base', 
            new Transform(x - count / 2, h * 4, z - count / 2, 0.5, 2.5, 0.5, 0.0, Math.random() * Math.PI)
        ));
    }

    loop(main).start();
});