(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hexRgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
// Every visible pixel is rebuilt from monochrome light, never blended with the
// original yellow/pink RGB. Material classification is independent of brightness.
function prepare(data){const count=data.length/4,material=new Uint8Array(count),light=new Float32Array(count);for(let p=0;p<count;p++){let i=p*4,r=data[i],g=data[i+1],b=data[i+2];material[p]=(r>g*1.075&&g>b*1.25&&(r-b)/Math.max(r,1)>.55)?1:0;const y=.2126*r+.7152*g+.0722*b;light[p]=clamp(y/(material[p]?174:220),0,1.22);}return{material,light};}
function recolor(data,prepared,bodyHex,laceHex){const body=hexRgb(bodyHex),lace=hexRgb(laceHex),out=new Uint8ClampedArray(data.length);for(let p=0;p<prepared.light.length;p++){let i=p*4;out[i+3]=data[i+3];if(!data[i+3])continue;const color=prepared.material[p]?lace:body,light=prepared.light[p];for(let k=0;k<3;k++)out[i+k]=clamp(color[k]*light,0,255);}return out;}
// Positive bend: upper arch; negative bend: lower bowl. Tangent follows curve.
function arcPoint(x,halfWidth,bend){const h=Math.max(halfWidth,1),u=x/h;return{x,y:-bend*(1-u*u),angle:Math.atan(2*bend*x/(h*h))};}
const api={prepare,recolor,arcPoint,hexRgb};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ENLUMOSimulatorCore=api;
})(typeof window!=='undefined'?window:globalThis);
