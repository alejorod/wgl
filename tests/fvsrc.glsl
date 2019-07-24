#version 300 es

layout(location=0) in vec3 pos;
layout(location=1) in vec3 center;
layout(location=2) in vec3 vel;

uniform float u_delta;
uniform mat4 u_proj;
uniform mat4 u_view;

// out vec3 c_pos;
out vec3 v_pos;

void main() {
    //v_pos = center + (vel / 2.0) * u_delta;
    //if (length(v_pos) > 2.0) {
    //    v_pos = normalize(v_pos) / 2.0;
    //}
    //v_pos = center;
    // gl_PointSize = min(1.0 / (length(vel) + 0.0001), 5.0);
    gl_Position = u_proj * u_view * vec4(pos + center, 1.0);
    // gl_PointSize = min(gl_PointSize / gl_Position.z, gl_PointSize);
    // c_pos = center;
}