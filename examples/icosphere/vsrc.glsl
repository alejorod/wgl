#version 300 es
layout(location=0) in vec3 a_coord;
layout(location=1) in vec2 a_uv;
layout(location=2) in mat4 a_model;

uniform mat4 u_proj;
uniform mat4 u_view;
uniform float u_height;

out vec2 v_uv;

uniform sampler2D u_texture_h;

void main() {
    vec4 height = texture(u_texture_h, a_uv);
    float val = max((height.r + height.g + height.b) / 3.0, 0.01);
    vec4 t_pos = a_model * vec4(a_coord.x, a_coord.y, a_coord.z * val * u_height, 1.0);
    gl_Position = u_proj * u_view * t_pos;
    v_uv = a_uv;
}