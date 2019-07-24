#version 300 es
precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture;

out vec4 color;

void main() {
    color = texture(u_texture, v_uv);

    if (length(color.rgb) <= 1.5) {
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}