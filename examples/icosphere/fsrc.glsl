#version 300 es
precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture_c;
uniform sampler2D u_texture_h;

layout(location=0) out vec4 hdr_color;
layout(location=1) out vec4 bloom_color;

void main() {
    float height = texture(u_texture_h, v_uv).x;
    vec3 object_color = texture(u_texture_c, v_uv).rgb;
    float val = (object_color.r + object_color.g + object_color.b) / 3.0;

    if (val < 0.1) {
        discard;
    }

    if (height > 0.01) {
        object_color = vec3(0.2, 0.4, 1.0);
        bloom_color = vec4(object_color, 1.0);
        object_color = vec3(0.0, 1.0, 0.0);
    } else {
        object_color = object_color * vec3(0.8, 0.8, 1.3);
        bloom_color = vec4(0.0, 0.0, 0.0, 1.0);
    }

    hdr_color = vec4(object_color, 1.0);
}