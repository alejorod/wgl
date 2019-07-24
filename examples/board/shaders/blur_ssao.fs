#version 300 es

precision mediump float;

out vec4 color;
  
in vec2 v_uv;
  
uniform sampler2D u_ssao_texture;

void main() {
    vec2 texel_size = 0.5 / vec2(textureSize(u_ssao_texture, 0));
    float result = 0.0;
    for (int x = -4; x < 4; ++x) 
    {
        for (int y = -4; y < 4; ++y) 
        {
            vec2 offset = vec2(float(x), float(y)) * texel_size;
            result += texture(u_ssao_texture, v_uv + offset).r;
        }
    }
    color = vec4(vec3(result / (8.0 * 8.0)), 1.0);
}