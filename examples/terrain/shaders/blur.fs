#version 300 es
precision mediump float;

in vec2 v_uv;

uniform sampler2D u_texture;
uniform bool u_horizontal;

out vec4 color;

float weight[5] = float[] (
    0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216
);

float modi = 1.0;

void main() {
    vec2 tex_offset = 1.0 / vec2(float(textureSize(u_texture, 0).x), float(textureSize(u_texture, 0).y)); // gets size of single texel
    vec3 result = texture(u_texture, v_uv).rgb * weight[0] / modi; // current fragment's contribution
    
    if(u_horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(u_texture, v_uv + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i] / modi;
            result += texture(u_texture, v_uv - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i] / modi;
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(u_texture, v_uv + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i] / modi;
            result += texture(u_texture, v_uv - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i] / modi;
        }
    }

    color = vec4(result, 1.0);
}