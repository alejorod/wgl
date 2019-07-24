#version 300 es
precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture;

out vec4 frag;

void main() {
    frag = texture(u_texture, v_uv);

    float brightness = dot(frag.rgb, vec3(0.2126, 0.7152, 0.0722));

    if (brightness < 1.0) {
        frag = vec4(0.0);
    }
}