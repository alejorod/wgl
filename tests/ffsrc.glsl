#version 300 es
precision mediump float;
 //in vec3 c_pos;
out vec4 color;
void main() {
    vec3 red = vec3(0.0, 1.0, 0.0);
    // vec3 blue = vec3(0.0, 0.0, 1.0);
    // float alpha = max(1.0 - length(c_pos) / 0.7, 0.0);
    // vec3 bcolor = mix(blue, red, alpha * 3.0);
    // color = vec4(bcolor, alpha * 2.0);
    color = vec4(red, 1.0);
}