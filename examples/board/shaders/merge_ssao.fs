#version 300 es
precision mediump float;

in vec2 v_uv;

uniform sampler2D u_main_texture;
uniform sampler2D u_ssao_texture;

out vec4 frag;

void main() {
    vec3 color = texture(u_main_texture, v_uv).rgb;
    vec3 ssao = texture(u_ssao_texture, v_uv).rgb;

    vec3 tfrag = vec3(color * ssao);

    tfrag = vec3(1.0) - exp(-tfrag * 1.8);

    // const float gamma = 2.2;
    // frag = vec4(pow(tfrag, vec3(1.0 / gamma)), 1.0);
    frag = vec4(tfrag, 1.0);
}