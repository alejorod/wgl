#version 300 es

layout(location=0) in vec3 coord;
layout(location=1) in vec3 center;
layout(location=2) in vec3 vel;

uniform mat4 u_proj;
uniform mat4 u_view;

out vec3 c_pos;

void main() {
    // gl_PointSize = min(1.0 / (length(vel) + 0.0001), 5.0);
    // gl_Position = u_proj * u_view * vec4(coord + center, 1.0);
    // gl_PointSize = 5.0;
    // gl_PointSize = min(gl_PointSize / gl_Position.z, gl_PointSize);
    c_pos = center;
    vec3 CameraRight_worldspace = vec3(u_view[0][0], u_view[1][0], u_view[2][0]);
    vec3 CameraUp_worldspace = vec3(u_view[0][1], u_view[1][1], u_view[2][1]);
    vec3 pos =
        center
        + CameraRight_worldspace * coord.x
        + CameraUp_worldspace * coord.y;

        gl_Position = u_proj * u_view * vec4(pos, 1.0);
}