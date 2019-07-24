#version 300 es
precision mediump float;

out vec4 frag;
  
in vec2 v_uv;

uniform sampler2D u_position;
uniform sampler2D u_normal;
uniform sampler2D u_noise;
uniform sampler2D u_color;

uniform vec3 u_samples[64];
uniform mat4 u_proj;
uniform float u_width;
uniform float u_height;

const float radius = 0.10;
const float bias = 0.01;
const int kernel_size = 16;

void main()
{
    vec2 noise_scale = vec2(u_width / 4.0, u_height / 4.0);
    vec3 frag_pos   = texture(u_position, v_uv).xyz;
    vec3 normal     = texture(u_normal, v_uv).rgb;
    vec3 random_vec = texture(u_noise, v_uv * noise_scale).xyz;
    vec3 color      = texture(u_color, v_uv).rgb;

    vec3 tangent   = normalize(random_vec - normal * dot(random_vec, normal));
    vec3 bitangent = cross(normal, tangent);
    mat3 TBN       = mat3(tangent, bitangent, normal);

    float occlusion = 0.0;
    for(int i = 0; i < kernel_size; ++i)
    {
        vec3 o_sample = TBN * u_samples[i];
        o_sample = frag_pos + o_sample * radius;
        
        vec4 offset = vec4(o_sample, 1.0);
        offset      = u_proj * offset;
        offset.xyz /= offset.w;
        offset.xyz  = offset.xyz * 0.5 + vec3(0.5);

        float sample_depth = texture(u_position, offset.xy).z;

        float range_check = smoothstep(0.0, 1.0, (radius / 2.0) / abs(frag_pos.z - sample_depth));

        occlusion += (sample_depth >= o_sample.z + bias ? 1.0 : 0.0) * range_check;
    }

    occlusion = 1.0 - (occlusion / float(kernel_size));
    frag = vec4(vec3(occlusion), 1.0);
}