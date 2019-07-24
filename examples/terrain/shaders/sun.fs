#version 300 es

precision mediump float;

in vec3 v_pos;
in vec3 v_color;

layout(location=0) out vec4 color;
layout(location=1) out vec4 bloom;

void main() {
    color = vec4(v_color, 1.0);
}