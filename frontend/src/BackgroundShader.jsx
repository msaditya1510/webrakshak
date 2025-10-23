// GLSL Fragment Shader
const frag = `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);} 
float noise(vec2 p){
  vec2 i=floor(p);
  vec2 f=fract(p);
  float a=hash(i);
  float b=hash(i+vec2(1.0,0.0));
  float c=hash(i+vec2(0.0,1.0));
  float d=hash(i+vec2(1.0,1.0));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

void main(){
  vec2 uv=vUv;
  vec2 p=uv*4.0;
  float t=uTime*0.3;
  float n=noise(p + vec2(t));
  
  vec3 col1=vec3(0.1,0.5,0.9);
  vec3 col2=vec3(0.6,0.2,0.85);
  vec3 col3=vec3(0.0,0.8,0.5);
  
  vec3 color = mix(col1,col2,0.5+0.5*sin(uTime*0.7));
  color = mix(color,col3,0.3*n);
  
  float grid = abs(fract(p.x*4.0-0.5)-0.5) * abs(fract(p.y*4.0-0.5)-0.5);
  grid = smoothstep(0.48,0.5,grid);
  
  vec3 final = color*(0.6+0.6*n) + vec3(grid)*0.15;
  gl_FragColor = vec4(final,1.0);
}
`;
