#version 300 es

precision mediump float;

layout(location=0) out vec4 g_pos;
layout(location=1) out vec3 g_normal;
layout(location=2) out vec4 g_albedo;

in vec4 v_pos;
in vec3 v_normal;

void main() {
    g_pos = v_pos;
    g_normal = normalize(v_normal);
    // g_albedo = vec4(vec3(0.95), 1.0);
    g_albedo = vec4(0.3, 1.0, 0.4, 1.0);
}

