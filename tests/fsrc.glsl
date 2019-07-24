#version 300 es
precision mediump float;

in vec3 v_pos;
in vec3 v_light;

out vec4 color;

vec3 lightPos = vec3(100.0, 100.0, 100.0);
// vec3 lightColor = vec3(1.0, 1.0, 1.0);
// vec3 objectColor = vec3(0.2, 0.9, 0.3);

void main() {
    // vec3 lightColor = v_light;
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 X = dFdx(v_pos);
    vec3 Y = dFdy(v_pos);
    vec3 normal = normalize(cross(X,Y));
    vec3 lightDir = normalize(lightPos - v_pos);

    float mcolor = 1.0 - max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0);
    // vec3 objectColor = mix(vec3(0.8, 0.4, 0.2), vec3(0.5, 0.5, 0.1), mcolor);
    vec3 objectColor = vec3(0.6, 0.6, 0.8);


    float ambientStrength = 0.4;
    vec3 ambient = ambientStrength * vec3(1.0, 1.0, 1.0);

    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    color = vec4((ambient + diffuse) * objectColor, 1.0);
    // color = vec4(v_light * objectColor, 1.0);
}