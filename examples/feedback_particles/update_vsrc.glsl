#version 300 es

layout(location=0) in vec3 a_coord;
layout(location=1) in vec3 a_vel;

out vec3 v_coord;

uniform float u_delta;

void main() {
    gl_Position = vec4(a_coord, 1.0);
    v_coord = a_coord + a_vel * u_delta;

    if (length(v_coord) > 4.0) {
        v_coord = vec3(0.0, 0.0, 0.0);
    }
}