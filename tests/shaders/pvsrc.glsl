#version 300 es

layout(location=0) in vec3 center;
layout(location=1) in vec3 vel;

uniform float u_delta;

out vec3 v_center;

void main() {
    v_center = center + (vel / 4.0) * u_delta;
    if (length(v_center) > 0.7) {
       v_center = normalize(v_center) / 2.0;
    }
    gl_Position = vec4(center, 1.0);
}