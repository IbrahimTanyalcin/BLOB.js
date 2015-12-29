var coordinates = [0,0];
		var areaBlob = {};
		var blobJsCanvasCounter = 0;
		var blobTools ={
			vBelt:function vBelt(r,R,d,i,nodeCount) {
				var sum = r+R+d;
				var theta = Math.asin((R-r)/(R+r+d));
				var A = Math.sqrt(Math.pow(R+r+d,2)-Math.pow(R-r,2));
				var beta = Math.atan(A/r);
				var y = Math.abs(Math.PI-i/nodeCount*Math.PI*2);
				var x = Math.abs(Math.asin(sum*Math.sin(y)/R)) || 0;
				var z = Math.PI-x-y;
				var U = Math.sqrt(Math.pow(sum,2)+Math.pow(R,2)-2*sum*R*Math.cos(z));
				var delta = (Math.PI-2*theta)/2/Math.PI/2;
				var betaCurrent = i/nodeCount <= 0.5 ? Math.PI*2*(i/nodeCount-delta) :  Math.PI*2*(1-i/nodeCount-delta);
				
				return blobTools.retrieveInterval(-0.5,delta,i,nodeCount)*r+blobTools.retrieveInterval(delta,delta+beta/Math.PI/2,i,nodeCount)*r/Math.cos(betaCurrent)+blobTools.retrieveInterval(delta+beta/Math.PI/2,1-delta-beta/Math.PI/2,i,nodeCount)*U+blobTools.retrieveInterval(1-delta-beta/Math.PI/2,(3/2*Math.PI+theta)/Math.PI/2,i,nodeCount)*r/Math.cos(betaCurrent)+blobTools.retrieveInterval((3/2*Math.PI+theta)/Math.PI/2,1,i,nodeCount)*r;
			},
			
			retrieveInterval:function retrieveInterval (a,b,i,nodeCount){
					var mid = (a+b)/2;
					var distance = Math.abs(a-mid);
					return Math.round(0.5+distance-Math.abs(mid-i/nodeCount));
			},
			
			wiggle:function wiggle(R,Rx,teethCount,i,nodeCount){
			var teethWidth = nodeCount/teethCount;
			var teethSegment = Math.floor((i%teethWidth)/(teethWidth/3)); 
			return (Math.floor(i/teethWidth)%2)*(Math.abs(Math.sign(teethSegment*(teethSegment-2)))*(Rx-R)/R+Math.abs(Math.sign((teethSegment-1)*(teethSegment-2)))*((Rx-R)/R*(i%(teethWidth/3))/teethWidth*3)+Math.abs(Math.sign(teethSegment*(teethSegment-1)))*((Rx-R)/R-(Rx-R)/R*(i%(teethWidth/3))/teethWidth*3))
			},
			
			ellipse:function ellipse (a,i,nodeCount,b){
				b = b === undefined ? 1 : b;
				var tanTheta = Math.abs(Math.tan(i/nodeCount*Math.PI*2));
				var x = Math.sqrt(Math.pow(a,2)*Math.pow(tanTheta,2)*Math.pow(b,2)/(Math.pow(a,2)+Math.pow(tanTheta,2)*Math.pow(b,2)));
				var y = tanTheta === 0 ? b : x/tanTheta;
				/*x^2/a^2+(x/tanTheta)^2=1
				x^2*tanTheta^2+x^2*a^2 = a^2*tanTheta^2;
				x^2(tanTheta^2+a^2) = a^2*tanTheta^2;*/
				return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
			},
			
			droplet:function droplet (roundness,i,nodeCount) {
				var coefficient = 1/(1-roundness) === Infinity ? 0 : 1/(1-roundness);
				return roundness+(coefficient*Math.pow((i-nodeCount*(1-roundness))/nodeCount,2))*blobTools.retrieveInterval(-0.5,1-roundness,i,nodeCount)+blobTools.retrieveInterval(roundness,1,i,nodeCount)*(coefficient*Math.pow((i-nodeCount*roundness)/nodeCount,2));
			},
			star:function star (vertexLength,vertexCount,sharpness,i,nodeCount) {
				return 1-vertexLength+vertexLength*Math.abs(Math.pow(Math.sin(vertexCount*Math.PI*i/nodeCount-Math.PI/2),10*sharpness))
			},
			heart:function heart(a,b,i,nodeCount) {
				var r = 1/(1+Math.pow(b,-5));
				return blobTools.retrieveInterval(-0.5,0.25,i,nodeCount)*1/(1+Math.pow(b,-1*(i/nodeCount*40-5)))+blobTools.retrieveInterval(0.75,1,i,nodeCount)*1/(1+Math.pow(b,-1*(10-(i/nodeCount-0.75)*40-5)))+blobTools.retrieveInterval(0.25,0.75,i,nodeCount)*blobTools.ellipse(a,i+nodeCount/4,nodeCount,r);
			},
			polygonAngular:function polygonAngular(a,i,nodeCount){
				var length = a.length;
				var residualAngle = Math.PI*2;
				for (var j=0;j<a.length;j+=2){
					residualAngle -= a[j]/360*Math.PI*2;
				}
				var distanceRlastR1=Math.sqrt(Math.pow(a[a.length-1],2)+Math.pow(a[1],2)-2*a[a.length-1]*a[1]*Math.cos(residualAngle+a[0]/360*Math.PI*2));
				var zeta = Math.asin(a[a.length-1]*Math.sin(residualAngle+a[0]/360*Math.PI*2)/distanceRlastR1);
				var r0 = Math.round(residualAngle*1000000)/1000000!==0?Math.sin(zeta)*a[1]/Math.sin(Math.PI-zeta-a[0]/360*Math.PI*2):a[a.length-1];
				var angle = i/nodeCount*360;
				for (var j = 0,sum =0;(i/nodeCount*360>a[j]+sum && j<a.length);j+=2){
					sum += a[j];
					angle = i/nodeCount*360-sum;
				}
				j += 1;
				angle = angle/360*Math.PI*2;
				a[-1] = r0;
				a[length] = residualAngle/Math.PI/2*360;
				a[length+1] = r0;
				var distanceRlastR0 = Math.sqrt(Math.pow(a[length-1],2)+Math.pow(r0,2)-2*a[length-1]*r0*Math.cos(residualAngle));
				var distanceRjRjmin2 = Math.sqrt(Math.pow(a[j],2)+Math.pow(a[j-2],2)-2*a[j]*a[j-2]*Math.cos(a[j-1]/360*Math.PI*2));
				var r;
				if (j>length) {
					if (Math.pow(r0,2)>= Math.pow(a[j-2],2)+Math.pow(distanceRlastR0,2)) {
						r = Math.abs(a[j-2]*r0*Math.sin(residualAngle)/distanceRlastR0/Math.sin(-angle+Math.asin(r0*Math.sin(residualAngle)/distanceRlastR0)));
					} else {
						r = Math.abs(a[j-2]*r0*Math.sin(residualAngle)/distanceRlastR0/Math.sin(Math.PI-angle-Math.asin(r0*Math.sin(residualAngle)/distanceRlastR0)));
					}
				} else {
					if (Math.pow(a[j],2)>=Math.pow(a[j-2],2)+Math.pow(distanceRjRjmin2,2)) {
						r = Math.abs(a[j-2]*a[j]*Math.sin(a[j-1]/360*Math.PI*2)/distanceRjRjmin2/Math.sin(-angle+Math.asin(a[j]/distanceRjRjmin2*Math.sin(a[j-1]/360*Math.PI*2))));
					} else {
						r = Math.abs(a[j-2]*a[j]*Math.sin(a[j-1]/360*Math.PI*2)/distanceRjRjmin2/Math.sin(Math.PI-angle-Math.asin(a[j]/distanceRjRjmin2*Math.sin(a[j-1]/360*Math.PI*2))));
					}
				}
				return r;
			}
		}
		
		function initiateBlobArea (areaObject) {
		//{id:"drawHere",width:1000,height:1000,top:0,left:0}
			var top = areaObject.top+"px" || "0px";
			var left = areaObject.left+"px" || "0px";
			var zIndex = areaObject.zIndex || 1;
			var width = areaObject.width+"px" || "1000px";
			var height = areaObject.height+"px" || "1000px";
			var background = areaObject.background || null;
			
			var createdElement = document.createElement("div");
			createdElement.setAttribute("id",areaObject.id);
			if (areaObject.parent) {
				document.getElementById(areaObject.parent).appendChild(createdElement);
			} else {
				document.body.appendChild(createdElement);
			}
			
			document.getElementById(areaObject.id).style.position = "absolute";
			document.getElementById(areaObject.id).style.top = top;
			document.getElementById(areaObject.id).style.left = left;
			document.getElementById(areaObject.id).style.zIndex = zIndex;
			document.getElementById(areaObject.id).style.width = width;
			document.getElementById(areaObject.id).style.height = height;
			document.getElementById(areaObject.id).style.background = background;
			document.getElementById(areaObject.id).addEventListener("mousemove",listener);
			areaBlob.width = parseFloat(width);
			areaBlob.height = parseFloat(height);
			areaBlob.top = top;
			areaBlob.left = left;
			areaBlob.zIndex = zIndex;

			function listener(event){
				var area = document.getElementById(areaObject.id).getBoundingClientRect();
				coordinates = [event.clientX - area.left+0.001,event.clientY-area.top+0.001];
				//console.log(coordinates);
			}
		}
		
		function blob(blobObject) {
		//{id:"someID",width:600,height:600,nodeCount:50,origin:[300,300],maxPeriod:5,minPeriod:2,blobRadius:100,tickRadius:3,harmonicRadius:25,sync:1,randomness:0,lineWidth:100,lineOpacity:0.5,fillOpacity:0.5,attraction:0.5,bounce:1,xray:0.9}
			
			//globals
			var ID;
			if (document.getElementById(blobObject.id)) {
				ID = blobObject.id + blobJsCanvasCounter;
			} else {
				ID = blobObject.id || ("myCanvas"+blobJsCanvasCounter);
			}
			blobJsCanvasCounter++;
			var width = areaBlob.width;
			var height = areaBlob.height;
			var nodeCount = blobObject.nodeCount || 10;
			var origin = blobObject.origin || [(areaBlob.width)/2,(areaBlob.height)/2];
			var circlePositions = [];
			var orCirclePositions = [];
			var circleHarmonicLimits = [];
			var circlePeriods = [];
			var maxPeriod = blobObject.maxPeriod || 5;
			var minPeriod = blobObject.minPeriod || 2;
			var blobRadius = blobObject.blobRadius || 100;
			var tickRadius = blobObject.tickRadius || 3;
			var harmonicRadius = blobObject.harmonicRadius || 0.25*blobRadius;
			var startTime;
			var frameRate = blobObject.frameRate===undefined?1000:blobObject.frameRate;
			var frameCount = 0;
			var sync = blobObject.sync || 1;
			var randomness = blobObject.randomness || 0;
			var blobRadii = [];
			var thetas = [];
			var bounce = 0;
			var bounceStrength = Math.PI*4;
			var bounceSpeed = blobObject.bounceSpeed || 0.975;
			var lineWidth = blobObject.lineWidth || 100;
			var lineOpacity = blobObject.lineOpacity || 0.5;
			var fillOpacity = blobObject.fillOpacity || 0.5;
			var strokeStyle = blobObject.strokeStyle || "Orange";
			var fillStyle = blobObject.fillStyle || "Orange";
			var attraction = blobObject.attraction || 0.5;
			var bounceOn = blobObject.bounce || 1;
			var xray = blobObject.xray || 0;
			var parentTop = blobObject.top === undefined ? "0px" : blobObject.top+"px";
			var parentLeft = blobObject.left === undefined ? "0px" : blobObject.left+"px";
			var parameter = blobObject.parameter || function(){return 1;};
			var parameterTime = blobObject.parameterTime || function(){return 1;};
			var offset = blobObject.offset===undefined? [0,0] : blobObject.offset;
			var isStatic = blobObject.isStatic ? blobObject.isStatic : 0;
			var phase = blobObject.phase ? blobObject.phase : 0;
			var tick = blobObject.tick===undefined ? 1 : blobObject.tick; 
			var tickLine = blobObject.tickLine===undefined ? 1 : blobObject.tickLine; 
			//globals
			
			//append the canvas element
			var createdElement = document.createElement("canvas");
			createdElement.setAttribute("id",ID);
			createdElement.setAttribute("width",width);
			createdElement.setAttribute("height",height);
			if (blobObject.parent) {
				document.getElementById(blobObject.parent).appendChild(createdElement);
				document.getElementById(ID).style.position = "absolute";
				document.getElementById(ID).style.top = parentTop;
				document.getElementById(ID).style.left = parentLeft;
			} else {
				document.body.appendChild(createdElement);
				document.getElementById(ID).style.position = "absolute";
				document.getElementById(ID).style.top = areaBlob.top;
				document.getElementById(ID).style.left = areaBlob.left;
			}
			
			document.getElementById(ID).style.zIndex = areaBlob.zIndex - 1;
			
			var canvas = document.getElementById(ID);
			var context = canvas.getContext("2d");
			//append the canvas element
			
			function animate(timestamp) {
				var thetaMouse = Math.atan((origin[1]+offset[1]-coordinates[1])/(origin[0]+offset[0]-coordinates[0]));
				context.globalAlpha = xray;
				var bounceCoeff = 1;
				if (bounce !== 0 && !(Math.round(bounceStrength*1000)/1000 === 0)) {
					bounceCoeff = 1+0.35*Math.sin(bounceStrength);
					bounceStrength = bounceStrength*bounceSpeed;
				}
				if (!startTime){
					startTime = timestamp;
					for (i=0;i<nodeCount;i++) {
						var randomCoef = (1-randomness+randomness*Math.random());
						circlePositions[i]=[origin[0]+(blobRadius*randomCoef)*Math.sin(i*Math.PI*2/nodeCount),origin[1]-(blobRadius*randomCoef)*Math.cos(i*Math.PI*2/nodeCount)];
						orCirclePositions[i]=[origin[0]+(blobRadius*randomCoef)*Math.sin(i*Math.PI*2/nodeCount),origin[1]-(blobRadius*randomCoef)*Math.cos(i*Math.PI*2/nodeCount)];
						circlePeriods[i] = minPeriod+(maxPeriod-minPeriod)*Math.random();
						circleHarmonicLimits[i] = calculateMotionSpan(i);
						blobRadii[i]= blobRadius*randomCoef*parameter(i,nodeCount);
						thetas[i]=Math.atan((circleHarmonicLimits[i][1][1]-circleHarmonicLimits[i][0][1])/(circleHarmonicLimits[i][1][0]-circleHarmonicLimits[i][0][0]));
					}
				}
				var currentTime = (timestamp-startTime)/1000;
			
				if(currentTime*frameRate-frameCount>1 || currentTime===0){	
					context.clearRect(0,0,width,height);
					for (i=0;i<nodeCount;i++) {
						var theta = thetas[i];
						var sign = Math.sign(origin[0]+offset[0]-coordinates[0])*Math.sign(origin[0]-circlePositions[i][0]);
						if (i === 0 || i === nodeCount/2) {
							sign = -Math.sign(origin[0]+offset[0]-coordinates[0]);
						}
						var distance = Math.min(Math.sqrt(Math.pow(coordinates[0]-origin[0]-offset[0],2)+Math.pow(coordinates[1]-origin[1]-offset[1],2)),blobRadius)/blobRadius;
						var thetaDiff = thetaMouse-theta;
						circlePositions[i]=[origin[0]+parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.sin(i*Math.PI*2/nodeCount),origin[1]-parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.cos(i*Math.PI*2/nodeCount)];
						orCirclePositions[i]=[origin[0]+parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.sin(i*Math.PI*2/nodeCount),origin[1]-parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.cos(i*Math.PI*2/nodeCount)];
						circleHarmonicLimits[i] = calculateMotionSpan(i);
					}
					for (i=0;i<nodeCount;i++){
						var w = 2*Math.PI/circlePeriods[i];
						var theta = thetas[i];
						var sign = sync === 1? Math.sign(nodeCount/2-i) || 1 : 1;
						var x = orCirclePositions[i][0]+1*(harmonicRadius*Math.sin(w*currentTime+phase)*Math.cos(theta)*sign);
						var y = orCirclePositions[i][1]+1*(harmonicRadius*Math.sin(w*currentTime+phase)*Math.sin(theta)*sign);
						circlePositions[i] = [x,y];
						circleHarmonicLimits[i] = calculateMotionSpan(i);
						context.globalAlpha = xray;
						context.beginPath();
						context.arc(x,y,1,0,2*Math.PI,false);
						context.lineWidth = 2;
						context.strokeStyle = "Black";
						context.stroke();
						context.fillStyle = "Black";
						context.fill();
						generateTick(i);
					}
					for (i=0;i<nodeCount;i++){
						context.globalAlpha = tickLine;
						context.beginPath();
						context.moveTo(origin[0],origin[1]);
						context.lineTo(circlePositions[i][0],circlePositions[i][1]);
						context.lineWidth = 1;
						context.strokeStyle = "Black";
						context.stroke();
					}
					context.beginPath();
					context.moveTo(circlePositions[0][0],circlePositions[0][1]);
					context.lineJoin="round";
					context.lineWidth = lineWidth;
					context.strokeStyle = strokeStyle;
					context.fillStyle = fillStyle;
					context.globalAlpha = lineOpacity;
					for (i=1;i<nodeCount;i++){
						context.lineTo(circlePositions[i][0],circlePositions[i][1]);
					}
					context.closePath();
					context.stroke();
					context.globalAlpha = fillOpacity;
					context.fill();
					
					//next frame
					frameCount++;
				}
				if (bounce !== 0 && (Math.round(bounceStrength*1000)/1000 === 0)) {
					bounce = bounce-1;
					bounceStrength = Math.PI*4;
				} else if (bounce === 0 && (Math.round(bounceStrength*1000)/1000 === 0)){
					bounceStrength = Math.PI*4;
				}
				var distance = Math.sqrt(Math.pow(coordinates[0]-origin[0]-offset[0],2)+Math.pow(coordinates[1]-origin[1]-offset[1],2));
				var thresholdRadius = (Math.max.apply(null,blobRadii)+Math.min.apply(null,blobRadii))/2;
				if (Math.round((thresholdRadius+attraction*thresholdRadius+lineWidth/2)/distance*10)/10 === 1 && bounceOn === 1) {
					bounce = 1;
					bounceStrength = Math.PI*4;
				}
				
				function generateTick(order){
					context.globalAlpha = tick;
					context.beginPath();
					context.moveTo(orCirclePositions[order][0]+harmonicRadius*Math.sin(order*Math.PI*2/nodeCount)-tickRadius*Math.cos(order*Math.PI*2/nodeCount),orCirclePositions[order][1]-harmonicRadius*Math.cos(order*Math.PI*2/nodeCount)-tickRadius*Math.sin(order*Math.PI*2/nodeCount));
					context.lineTo(orCirclePositions[order][0]+harmonicRadius*Math.sin(order*Math.PI*2/nodeCount)+tickRadius*Math.cos(order*Math.PI*2/nodeCount),orCirclePositions[order][1]-harmonicRadius*Math.cos(order*Math.PI*2/nodeCount)+tickRadius*Math.sin(order*Math.PI*2/nodeCount));
					context.lineWidth = 2;
					context.strokeStyle = "Black";
					context.stroke();
					
					context.beginPath();
					context.moveTo(orCirclePositions[order][0]-harmonicRadius*Math.sin(order*Math.PI*2/nodeCount)-tickRadius*Math.cos(order*Math.PI*2/nodeCount),orCirclePositions[order][1]+harmonicRadius*Math.cos(order*Math.PI*2/nodeCount)-tickRadius*Math.sin(order*Math.PI*2/nodeCount));
					context.lineTo(orCirclePositions[order][0]-harmonicRadius*Math.sin(order*Math.PI*2/nodeCount)+tickRadius*Math.cos(order*Math.PI*2/nodeCount),orCirclePositions[order][1]+harmonicRadius*Math.cos(order*Math.PI*2/nodeCount)+tickRadius*Math.sin(order*Math.PI*2/nodeCount));
					context.lineWidth = 2;
					context.strokeStyle = "Black";
					context.stroke();
				}
				function calculateMotionSpan(order) {
					var x1 = circlePositions[order][0]+harmonicRadius*Math.sin(order*Math.PI*2/nodeCount);
					var x2 = circlePositions[order][0]-harmonicRadius*Math.sin(order*Math.PI*2/nodeCount);
					var y1 = circlePositions[order][1]-harmonicRadius*Math.cos(order*Math.PI*2/nodeCount);
					var y2 = circlePositions[order][1]+harmonicRadius*Math.cos(order*Math.PI*2/nodeCount);
					return [[x2,y2],[x1,y1]];
				}
				((function (){var x = {0:function(){window.requestAnimationFrame(animate)},1:function(){}}; return x[isStatic]})())();
			}
			window.requestAnimationFrame(animate);
		};