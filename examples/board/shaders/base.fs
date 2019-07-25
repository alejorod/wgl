#version 300 es

precision mediump float;

in vec4 v_position;
in vec3 v_vm_normal;
in vec3 v_normal;

layout(location=0) out vec4 o_position;
layout(location=1) out vec4 o_normal;
layout(location=2) out vec4 o_albedo;

void main() {
    o_position = v_position;
    vec3 dx = dFdx(v_position.xyz);
    vec3 dy = dFdy(v_position.xyz);
    vec3 normal = normalize(cross(dx, dy));
    o_normal = vec4(normalize(normal), 1.0);
    // o_normal = vec4(normalize(v_vm_normal), 1.0);

    if (v_normal.y == 1.0 && v_normal.z == 1.0) {
        o_albedo = vec4(45.0 / 255.0, 185.0 / 255.0, 140.0 / 255.0, 1.0) / 0.8;
    } else if (v_normal.y != 0.0) {
        o_albedo = vec4(0.0, 214.0 / 255.0, 224.0 / 255.0, 1.0) / 0.8;
    } else if (v_normal.x != 0.0) {
        o_albedo = vec4(210.0 / 255.0, 214.0 / 255.0, 202.0 / 255.0, 1.0) / 0.8;
    } else if (v_normal.z != 0.0) {
        o_albedo = vec4(226.0 / 255.0, 196.0 / 255.0, 184.0 / 255.0, 1.0) / 0.8;
    }
}