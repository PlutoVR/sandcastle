// adapted from http://glslsandbox.com/e#63927.0


/*
 * Original shader from: https://www.shadertoy.com/view/XljBW3
 */

// glslsandbox uniforms
uniform float time;
varying vec2 v_uv;
uniform vec2 resolution;


// --------[ Original ShaderToy begins here ]---------- //

uniform float ratio;

#define PI2 6.28318530718
#define PI 3.1416

float vorocloud(vec2 p){
	float f = 0.0;
    vec2 pp = cos(vec2(p.x * 14.0, (16.0 * p.y + cos(floor(p.x * 30.0)) + time/26. * PI2)) );
    p = cos(p * 12.1 + pp * 10.0 + 0.5 * cos(pp.x * 10.0));
    
    vec2 pts[4];
    
    pts[0] = vec2(0.5, 0.6);
    pts[1] = vec2(-0.4, 0.4);
    pts[2] = vec2(0.2, -0.7);
    pts[3] = vec2(-0.3, -0.4);
    
    float d = 5.0;
    
    for(int i = 0; i < 4; i++){
      	pts[i].x += 0.03 * cos(float(i)) + p.x;
      	pts[i].y += 0.03 * sin(float(i)) + p.y;
    	d = min(d, distance(pts[i], pp));
    }
    
    f = 2.0 * pow(1.0 - 0.3 * d, 13.0);
    
    f = min(f, 1.0);
    
	return f;
}

vec4 scene(vec2 UV){
    float x = UV.x;
    float y = UV.y;
    
    vec2 p = vec2(x, y) - vec2(0.5);
    
    vec4 col = vec4(0.0);
	col.g += 0.02;
    
    float v = vorocloud(p);
    v = 0.2 * floor(v * 5.0);
    
    col.r += 0.1 * v;
    col.g += 0.6 * v;
    col.b += 0.5 * pow(v, 5.0);
    
    
    v = vorocloud(p * 2.0);
    v = 0.2 * floor(v * 5.0);
    
    col.r += 0.1 * v;
    col.g += 0.2 * v;
    col.b += 0.01 * pow(v, 5.0);
    
    col.a = 1.0;
    
    return col;
}
void main(void)
{
	gl_FragColor = vec4(scene(v_uv));   
}
