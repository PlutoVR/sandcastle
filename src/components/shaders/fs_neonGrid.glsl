// adapted from http://glslsandbox.com/e#64274.1
uniform float time;
varying vec2 v_uv;

void main( void ) {

	vec2 position = (v_uv.xy) -1.5;
	float y = .2*position.y * sin(90.0*position.y - time/10.);
	float x = 0.2*position.x * sin(90.0*position.x - time/10.);
	y = 1.0 / (300. * abs(x - y));	
	float saule = 1./(35.*length(position - vec2(1, 0.8)));
	vec4 vsaule = vec4(saule, saule, saule*5., 1.0);
	vec4 vstari = vec4(position.y*0.5 - y, y, y*5.7, 2.7);
	gl_FragColor = mix(vsaule, vstari, 1.78);
}