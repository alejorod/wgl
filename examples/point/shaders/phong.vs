#version 300 es

layout(location=0) in vec3 a_coord;

uniform mat4 u_proj;
uniform mat4 u_view;
uniform mat4 u_model;

out vec3 v_pos;

void main() {
    gl_Position = u_proj * u_view * u_model * vec4(a_coord, 1.0);
    v_pos = (u_model * vec4(a_coord, 1.0)).xyz;
}