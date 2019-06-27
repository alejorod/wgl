#version 300 es

layout(location=0) in vec3 a_coord;
layout(location=1) in vec2 a_uv;
layout(location=2) in vec3 a_pos;
layout(location=3) in vec3 a_vel;

out vec2 v_uv;
out vec3 v_center;

uniform mat4 u_proj;
uniform mat4 u_view;

void main() {
    vec3 camera_right_worldspace = vec3(u_view[0][0], u_view[1][0], u_view[2][0]);
    vec3 camera_up_worldspace = vec3(u_view[0][1], u_view[1][1], u_view[2][1]);
    vec3 coord = 
        a_pos
        + camera_right_worldspace * a_coord.x * (length(a_vel) / 4.0)
        + camera_up_worldspace * a_coord.y * (length(a_vel) / 4.0);
    gl_Position = u_proj * u_view * vec4(a_pos + coord, 1.0);
    v_uv = a_uv;
    v_center = a_pos;
}