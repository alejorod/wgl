#version 300 es

precision mediump float;

in vec3 v_pos;
in vec3 v_color;

layout(location=0) out vec4 color;
layout(location=1) out vec4 bloom;


vec3 light_dir = vec3(1.0, 1.0, 1.0);
vec3 light_color = vec3(0.8, 0.6, 0.0);

void main() {

    float ambient_strength = 0.33;
    vec3 ambient = ambient_strength * light_color;

    vec3 X = dFdx(v_pos);
    vec3 Y = dFdy(v_pos);
    vec3 normal=normalize(cross(X,Y));

    float diff = max(dot(light_dir, normal), 0.0);
    vec3 diffuse = diff * light_color;

    color = vec4((ambient + diffuse) * v_color, 1.0);
}