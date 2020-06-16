//adapted from http://glslsandbox.com/e#63997.0

uniform float time;
varying vec2 v_uv;

// Readability
#define globalTime time * 0.005
 
mat2 Rotate2D(float angle) {
  return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
}

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
   	
	p = floor(48.0*p)/48.0;
    
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}
 
float TextureCoordinate(vec2 position) {
  
    float zoomingFactor = 280.0;
   
    float levelOfDetail = 0.0;
   
    return noise(position);
}
 
float FBM(vec2 uv) {
    // Represents the number of levels sub-textures present in each texture (fractal power)
    #define fractalDimension 5
   
    float innerPower = 1.7;
    
    float noiseValue = 0.0;     // Final noise to return at this pixel
    float brightness = 1.0;      // Starting brightness of the first fractal power. 
                                 // Subsequent powers will have lower brightness contributions.
    float dampeningFactor = 1.5; // How much of an impact subsequent fractal powers have on the result
     
    float offset = 0.5;
     
    float difference = 3.0;
 
	for (int i = 0; i < fractalDimension; ++i) {
      
		noiseValue += abs((TextureCoordinate(uv) - offset) * difference) / brightness;
       
		brightness *= dampeningFactor;
         
		uv *= innerPower;
	}
    
	return noiseValue;
}
 
float Turbulence(vec2 uv,float sp) {
    float activityLevel = 1.0; // How fast the tendrils of electricity move around
  
	vec2 noiseBasisDiag = vec2(FBM(uv - 2.0*globalTime * activityLevel), FBM(uv + globalTime * activityLevel));
     
    	uv += noiseBasisDiag;
 
	float rotationSpeed = sp;
    return FBM(uv * Rotate2D(time/100. * rotationSpeed));
}
 
float Ring(vec2 uv) {
	float circleRadius = sqrt(length(uv));
   
    float range = 2.3;
    float functionSlope = 1.0; 
    float offset = 0.5;
    
	return abs(mod(circleRadius, range) - range / 2.) * functionSlope + offset;
}
 
void main() {
 
    vec2 uv =  v_uv.xy-0.5;
    // uv.x *= v_uv.x/v_uv.y;
    
    float distanceFromCenter = length(uv); // Distance away from the center the normalized uv coordinate is 
    float radius = 0.9;					   // Maximum radius of the effect
    float alpha = 1.0;					   // Alpha starting value (full brightness)
    float alphaFalloffSpeed = 0.5;		   // How quickly alpha values fade to 0.0
 
    if(distanceFromCenter > radius) {
        alpha = max(0.0, 1.0 - (distanceFromCenter - radius) / alphaFalloffSpeed);
    }
 
  
    float zoom = 4.0;
	vec2 uvZoomed = uv * zoom*0.7;
  
	float fc1 = Turbulence(uvZoomed*5.0,0.001);
	float fc2 = Turbulence(uvZoomed*2.0,-0.001);
     
	//fractalColor *= Ring(uvZoomed*0.5);
 
	vec3 col = vec3(0.0,0.0,0.8) / fc1 + vec3(0.6,0.0,0.0) / fc2;
    col *= alpha;

    gl_FragColor = vec4(col,1.);
}

