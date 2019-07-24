#version 300 es

precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_exposure;

out vec4 color;

void main() {
    const float gamma = 2.2;
    vec3 hdr_color = texture(u_texture, v_uv).rgb;
  
    // Exposure tone mapping
    vec3 mapped = vec3(1.0) - exp(-hdr_color * u_exposure);
    // Gamma correction 
    mapped = pow(mapped, vec3(1.0 / gamma));
  
    color = vec4(mapped, 1.0);
}