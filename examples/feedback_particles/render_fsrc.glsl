#version 300 es
precision mediump float;

in vec2 v_uv;
in vec3 v_center;

uniform sampler2D u_texture;

out vec4 color;

void main() {
    float mix_factor = length(v_center) / 3.0;
    color = texture(u_texture, v_uv);
    float alpha = length(v_center) / 3.0;
    color.a = max(color.a - 0.2, 0.0);
    color.a = min(1.0 - alpha, color.a);
    color.xyz = mix(vec3(0.5, 0.2, 0.8), color.xyz, 0.5 + mix_factor);
}