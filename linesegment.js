define(['cclass','vector'],function(cclass,Vector) {
	return cclass({
		constructor: function(startx, starty, endx, endy, next, previous) {
			this.start = new Vector(startx, starty);
			this.end = new Vector(endx, endy);
			this.normal = new Vector(0,0);
			this.recalculate();
			this.next = next;
			this.previous = previous;
		},
		recalculate: function() {
			var n = this.normal;
			n.setV(this.end);
			n.substractV(this.start);
			this.length = n.length();
			n.normalize();
			n.normalLeft();
		}
	});
});
