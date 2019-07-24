#version 300 es

layout(location=0) in vec3 a_coord;
layout(location=1) in vec3 a_color;

uniform mat4 u_proj;
uniform mat4 u_view;

out vec3 v_color;

void main() {
    gl_Position = u_proj * u_view * vec4(a_coord, 1.0);
    v_color = a_color;
}