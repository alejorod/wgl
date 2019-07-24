#version 300 es
layout(location=0) in vec3 pos;
layout(location=1) in vec3 light;

uniform mat4 u_proj;
uniform mat4 u_view;

out vec3 v_pos;
out vec3 v_light;

void main() {
    gl_Position = u_proj * u_view * vec4(pos, 1.0);
    v_pos = pos;
    v_light = light;
}