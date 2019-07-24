#version 300 es

layout(location=0) in vec3 a_coord;

uniform mat4 u_proj;
uniform mat4 u_view;

void main() {
    gl_Position = u_proj * u_view * vec4(a_coord, 1.0);
}