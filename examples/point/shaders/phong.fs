#version 300 es

precision mediump float;


in vec3 v_pos;

uniform vec4 u_color;
uniform bool u_lights;

out vec4 frag;

vec3 light_dir = vec3(1.0, 1.0, 1.0);
vec3 light_color = vec3(0.6, 0.7, 0.8);
float ambient_strength = 0.1;

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

vec3 directional_light(Light light, vec3 normal) {
    vec3 ambient = ambient_strength * light.color / 2.0;
    float diff = max(dot(light.direction, normal), 0.0);
    vec3 diffuse = diff * light.color / 2.0;

    return ambient + diffuse;
}

void main() {
    vec3 X = dFdx(v_pos);
    vec3 Y = dFdy(v_pos);
    vec3 normal = normalize(cross(X,Y));

    vec3 result = vec3(0.0);

    if (u_lights) {
        for (int i = 0; i < 2; i++) {
            result += directional_light(lights[i], normal);
        }
    } else {
        result = vec3(1.0);
    }

    frag = vec4(result * u_color.rgb, u_color.a);
}