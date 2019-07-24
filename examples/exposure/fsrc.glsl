#version 300 es

precision mediump float;

struct Light {
    vec3 position;
    vec3 color;
    float strength;
};

in vec3 v_position;
in vec3 v_normal;

uniform vec3 u_camera_position;
uniform Light lights[5];

out vec4 color;

vec3 calculate_light(Light light, vec3 normal) {
    float ambient_strength = 0.1;
    vec3 ambient = ambient_strength * light.color;

    vec3 light_dir = normalize(light.position - v_position);
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = diff * light.color;

    float distance = length(light.position - v_position);
    float attenuation = 1.0 / (1.0 + light.strength * distance);
    // float attenuation = 1.0;
    return (ambient + diffuse) * attenuation;
}

void main() {
    vec3 base_color = vec3(1.0, 1.0, 1.0);
    vec3 light_color = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < 5; i++) {
        light_color = calculate_light(lights[i], normalize(v_normal)) + light_color;
    }

    color = vec4(light_color * base_color, 1.0);

    // color = vec4(1.0);
}