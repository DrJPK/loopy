/**********************************

EDGE!

**********************************/

function Edge(model, config){

	var self = this;
	self.model = model;
	self.config = config;

	// Default values...
	_configureProperties(self, config, {
		from: _makeErrorFunc("CAN'T LEAVE 'FROM' BLANK"),
		to: _makeErrorFunc("CAN'T LEAVE 'TO' BLANK"),
		arc: 100,
		rotation: 0,
		strength: 0
	});

	// Get my NODES
	self.from = model.getNode(self.from);
	self.to = model.getNode(self.to);

	// My label???
	var s = self.strength;
	var l;
	if(s>=3) l="+++";
	else if(s>=2) l="++";
	else if(s>=1) l="+";
	else if(s==0) l="?";
	else if(s>-1) l="-";
	else if(s>-2) l="- -";
	else l="- - -";
	self.label = l;

	// Update!
	self.update = function(speed){

		// Change TO with FROM x strength (x model's speed)
		self.to.nextValue += self.from.value * self.strength * speed;

	};

	// Draw
	self.draw = function(ctx){

		// Width & Color
		var color = "#000";
		ctx.lineWidth = 3*Math.abs(self.strength)+2;
		ctx.strokeStyle = color;

		// Edge case: if arc is EXACTLY zero, whatever, add 0.1 to it.
		if(self.arc==0) self.arc=0.1;

		// Mathy calculations:
		var fx=self.from.x*2,
			fy=self.from.y*2,
			tx=self.to.x*2,
			ty=self.to.y*2;	
		if(self.from==self.to){
			var r = self.rotation;
			r *= Math.TAU/360;
			tx += Math.cos(r);
			ty += Math.sin(r);
		}		
		var dx = tx-fx;
		var dy = ty-fy;
		var w = Math.sqrt(dx*dx+dy*dy);
		var a = Math.atan2(dy,dx);
		var h = Math.abs(self.arc*2);

		// From: http://www.mathopenref.com/arcradius.html
		var r = (h/2) + ((w*w)/(8*h));
		var y = r-h; // the circle's y-pos is radius - given height.
		var a2 = Math.acos((w/2)/r); // angle from x axis, arc-cosine of half-width & radius

		// Translate & Rotate!
		ctx.save();
		ctx.translate(fx, fy);
		ctx.rotate(a);

		// Arrow buffer...
		var arrowBuffer = 20; // hack!
		var arrowDistance = (self.to.radius+arrowBuffer)*2;
		var arrowAngle = arrowDistance/r; // (distance/circumference)*TAU, close enough.
		//var beginDistance = self.from.radius*2;
		//var beginAngle = beginDistance/r;

		// Arc it!
		var startAngle = a2 - Math.TAU/2;
		var endAngle = -a2;
		if(h>r){
			startAngle *= -1;
			endAngle *= -1;
		}
		ctx.beginPath();
		var y2, begin, end;
		if(self.arc>0){
			y2 = y;
			begin = startAngle; // +beginAngle;
			end = endAngle-arrowAngle;
			ctx.arc(w/2, y2, r, begin, end, false);
		}else{
			y2 = -y;
			begin = -startAngle; // -beginAngle;
			end = -endAngle+arrowAngle;
			ctx.arc(w/2, y2, r, begin, end, true);
		}

		// Arrow HEAD!
		var arrowLength = 10*2;
		var ax = w/2 + Math.cos(end)*r;
		var ay = y2 + Math.sin(end)*r;
		var aa = end + Math.TAU/4;
		ctx.save();
		ctx.translate(ax, ay);
		if(self.arc<0) ctx.scale(-1,-1);
		ctx.rotate(aa);
		ctx.moveTo(-arrowLength, -arrowLength);
		ctx.lineTo(0,0);
		ctx.lineTo(-arrowLength, arrowLength);
		ctx.restore();

		// Stroke!
		ctx.stroke();

		// LABEL!
		var labelBuffer = 20*2;
		ctx.font = "300 40px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var lx = w/2;
		var ly = (h-labelBuffer);
		if(self.arc>=0) ly*=-1;
		ctx.save();
		ctx.translate(lx, ly);
		ctx.rotate(-a);
		ctx.fillText(self.label, 0, 0);
		ctx.restore();

		// Restore
		ctx.restore();

	};

}