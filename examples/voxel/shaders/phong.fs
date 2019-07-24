#version 300 es

precision mediump float;

in vec3 v_pos;
in vec3 v_shadow;
in vec3 v_color;

out vec4 color;

struct Light {
    vec3 direction;
    vec3 color;
};

const Light lights[2] = Light[](
    Light(
        vec3(1.0, 1.0, 1.0),
        vec3(0.6, 0.7, 0.8)
        // vec3(0.8, 0.7, 0.6)
    ),
    Light(
        vec3(-1.0, 1.0, -1.0),
        vec3(0.8, 0.7, 0.6)
    )
);

float ambient_strength = 0.5;

vec3 directional_light(Light light, vec3 normal) {
    vec3 ambient = ambient_strength * light.color / 2.0;
    float diff = max(dot(light.direction, normal), 0.0);
    vec3 diffuse = diff * light.color / 2.0;

    return ambient + diffuse * max(vec3(0.0), v_shadow);
}

void main() {
    color = vec4(1.0);
    vec3 X = dFdx(v_pos);
    vec3 Y = dFdy(v_pos);
    vec3 normal = normalize(cross(X,Y));
    
    vec3 result = vec3(0.0);

    for (int i = 0; i < 2; i++) {
        result += directional_light(lights[i], normal);
    }

    color = vec4(result * v_color, 1.0);
    // color = vec4(v_shadow * vec3(1.0), 1.0);
}