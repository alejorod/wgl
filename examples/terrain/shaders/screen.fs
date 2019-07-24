#version 300 es

precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture;
uniform sampler2D u_bloom;

out vec4 color;

void main() {
    color = texture(u_texture, v_uv);
    vec4 bloom = texture(u_bloom, v_uv);
    color += bloom;
}