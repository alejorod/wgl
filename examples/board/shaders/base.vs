#version 300 es

layout(location=0) in vec3 a_coord;
layout(location=1) in vec3 a_normal;
layout(location=2) in vec2 a_uv;

uniform mat4 u_proj;
uniform mat4 u_view;
uniform mat4 u_model;

out vec3 v_normal;
out vec3 v_vm_normal;
out vec4 v_position;

void main() {
    gl_Position = u_proj * u_view * u_model * vec4(a_coord, 1.0);
    v_normal = a_normal;
    v_vm_normal = (u_view * vec4(a_normal, 0.0)).xyz;
    v_position = u_view * u_model * vec4(a_coord, 1.0);
}
