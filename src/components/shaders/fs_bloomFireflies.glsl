precision highp float;
varying vec2 v_uv;
uniform float time;

void main(){
	vec2 r = v_uv-vec2(.5);
	float t = time*.005;
	gl_FragColor=vec4(.1);
	vec3 d=vec3((2.*v_uv.xy-r)/r.y,1.);
	for(float i=0.;i<200.;i++){
		vec3 p=(
			abs(
				fract(fract(99.*sin((vec3(1,5,9)+i*9.)))+t*.02)*2.-1.
			)*2.-1.
		)*8.;
		gl_FragColor+=vec4(
			mix(vec3(1),(cos((vec3(0,2,-2)/3.+i*.01)*6.283)*.5+.5),.8)
			*exp(-3.*length(cross(p,d))),
			1
		);
	}
}