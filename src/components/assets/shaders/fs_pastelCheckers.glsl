// adapted from http://glslsandbox.com/e#63519.0
uniform float time;
varying vec2 v_uv;

void main( void ) {
    float sc = 0.1;
    vec2 position = (  v_uv.xy ) + sin(time*.002) / 5.0;
    vec2 flooredPosition = floor(position / sc) * sc;
    gl_FragColor = vec4( flooredPosition.x, flooredPosition.y, 1, 1 );
    // gl_FragColor = vec4(.2,.6,.1,1.);
}