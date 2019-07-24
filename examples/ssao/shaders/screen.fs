#version 300 es
precision mediump float;

out vec4 frag;
  
in vec2 v_uv;

uniform sampler2D u_ssao;
uniform sampler2D u_color;

void main()
{
    vec3 color      = texture(u_color, v_uv).rgb;
    vec3 occlusion  = texture(u_ssao, v_uv).rgb;

    frag = vec4(vec3(occlusion * color), 1.0);
}