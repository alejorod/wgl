#version 300 es

layout(location=0) in vec3 a_coord;
layout(location=1) in vec3 a_color;

uniform mat4 u_proj;
uniform mat4 u_view;
uniform float u_limit;

out vec3 v_pos;
out vec3 v_color;

void main() {

    vec3 camera_right_worldspace = vec3(u_view[0][0], u_view[1][0], u_view[2][0]);
    vec3 camera_up_worldspace = vec3(u_view[0][1], u_view[1][1], u_view[2][1]);
    vec3 coord = 
        vec3(u_limit)
        + camera_right_worldspace * a_coord.x
        + camera_up_worldspace * a_coord.y;
    gl_Position = u_proj * u_view * vec4(vec3(u_limit) + coord, 1.0);
    v_pos = a_coord;
    v_color = a_color;
}