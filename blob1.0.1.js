var coordinates = [0,0];
		var areaBlob = {};
		var blobJsCanvasCounter = 0;
		
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
			var parameter = blobObject.parameter || function(){return 1;};
			var parameterTime = blobObject.parameterTime || function(){return 1;};
			//globals
			
			//append the canvas element
			var createdElement = document.createElement("canvas");
			createdElement.setAttribute("id",ID);
			createdElement.setAttribute("width",width);
			createdElement.setAttribute("height",height);
			if (blobObject.parent) {
				document.getElementById(blobObject.parent).appendChild(createdElement);
			} else {
				document.body.appendChild(createdElement);
			}
			document.getElementById(ID).style.position = "absolute";
			document.getElementById(ID).style.zIndex = areaBlob.zIndex - 1;
			document.getElementById(ID).style.top = areaBlob.top;
			document.getElementById(ID).style.left = areaBlob.left;
			var canvas = document.getElementById(ID);
			var context = canvas.getContext("2d");
			//append the canvas element
			
			function animate(timestamp) {
				var thetaMouse = Math.atan((origin[1]-coordinates[1])/(origin[0]-coordinates[0]));
				context.clearRect(0,0,width,height);
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
				for (i=0;i<nodeCount;i++) {
					var theta = thetas[i];
					var sign = Math.sign(origin[0]-coordinates[0])*Math.sign(origin[0]-circlePositions[i][0]);
					if (i === 0 || i === nodeCount/2) {
						sign = -Math.sign(origin[0]-coordinates[0]);
					}
					var distance = Math.min(Math.sqrt(Math.pow(coordinates[0]-origin[0],2)+Math.pow(coordinates[1]-origin[1],2)),blobRadius)/blobRadius;
					var thetaDiff = thetaMouse-theta;
					circlePositions[i]=[origin[0]+parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.sin(i*Math.PI*2/nodeCount),origin[1]-parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.cos(i*Math.PI*2/nodeCount)];
					orCirclePositions[i]=[origin[0]+parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.sin(i*Math.PI*2/nodeCount),origin[1]-parameterTime(i,nodeCount,currentTime)*(blobRadii[i]+attraction*blobRadii[i]*bounceCoeff*sign*distance*Math.cos(thetaDiff))*Math.cos(i*Math.PI*2/nodeCount)];
					circleHarmonicLimits[i] = calculateMotionSpan(i);
				}
				for (i=0;i<nodeCount;i++){
					var w = 2*Math.PI/circlePeriods[i];
					var theta = thetas[i];
					var sign = sync === 1? Math.sign(nodeCount/2-i) || 1 : 1;
					var x = orCirclePositions[i][0]+1*(harmonicRadius*Math.sin(w*currentTime)*Math.cos(theta)*sign);
					var y = orCirclePositions[i][1]+1*(harmonicRadius*Math.sin(w*currentTime)*Math.sin(theta)*sign);
					circlePositions[i] = [x,y];
					circleHarmonicLimits[i] = calculateMotionSpan(i);
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
					context.beginPath();
					context.moveTo(origin[0],origin[1]);
					context.lineTo(circlePositions[i][0],circlePositions[i][1]);
					context.lineWidth = 1;
					context.strokeStyle = "Black";
					context.stroke();
				}
				function generateTick(order){
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
				window.requestAnimationFrame(animate);
				
				if (bounce !== 0 && (Math.round(bounceStrength*1000)/1000 === 0)) {
					bounce = bounce-1;
					bounceStrength = Math.PI*4;
				} else if (bounce === 0 && (Math.round(bounceStrength*1000)/1000 === 0)){
					bounceStrength = Math.PI*4;
				}
			
				var distance = Math.sqrt(Math.pow(coordinates[0]-origin[0],2)+Math.pow(coordinates[1]-origin[1],2));
				var thresholdRadius = (Math.max.apply(null,blobRadii)+Math.min.apply(null,blobRadii))/2;
				if (Math.round((thresholdRadius+attraction*thresholdRadius+lineWidth/2)/distance*10)/10 === 1 && bounceOn === 1) {
					bounce = 1;
					bounceStrength = Math.PI*4;
				}
			}
			window.requestAnimationFrame(animate);
		};