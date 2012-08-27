var creatures = {
	square: {"particles":[{"id":0,"posx":172.49180854394004,"posy":394.3928476254374},{"id":1,"posx":181.89586317075546,"posy":477.2158876918982},{"id":2,"posx":97.48420545814376,"posy":490.7291709583123},{"id":3,"posx":87.69062716577973,"posy":403.9973182127477},{"id":4,"posx":3.1810228855304037,"posy":457.45891762304194}],"springs":[{"aid":1,"bid":0,"keys":["2"]},{"aid":2,"bid":0,"keys":["1"]},{"aid":2,"bid":1,"keys":["1"]},{"aid":3,"bid":0,"keys":[]},{"aid":3,"bid":1,"keys":[]},{"aid":3,"bid":2,"keys":[]},{"aid":3,"bid":4,"keys":[]},{"aid":4,"bid":2,"keys":[]}]},
	triangle: {"particles":[{"id":0,"posx":119.13237903933855,"posy":399.9176556904928},{"id":1,"posx":70.47419874520004,"posy":312.5541531565988},{"id":2,"posx":19.14427628507117,"posy":398.3751246594638}],"springs":[{"aid":1,"bid":0,"keys":[]},{"aid":1,"bid":2,"keys":["1"]},{"aid":2,"bid":0,"keys":["1"]}]},
	unboundtriangle: {"particles":[{"id":0,"posx":85.53277688244985,"posy":339.4828769173316},{"id":1,"posx":141.01348654357548,"posy":422.6807796908879},{"id":2,"posx":41.221634325519126,"posy":429.12953237961665}],"springs":[{"aid":1,"bid":0,"keys":[]},{"aid":1,"bid":2,"keys":[]},{"aid":2,"bid":0,"keys":[]}]},
	dot: {"particles":[{"id":0,"posx":68.92795704053792,"posy":384.68410279663925}],"springs":[]},
	walker: {"particles":[{"id":0,"posx":51.896530634788846,"posy":411.6812268461298},{"id":1,"posx":101.8208103085872,"posy":498.3310829209092},{"id":2,"posx":151.89614960284615,"posy":411.78028285949597},{"id":3,"posx":101.80079193291014,"posy":498.3360243490881},{"id":4,"posx":101.9772804284342,"posy":325.1308195747719},{"id":5,"posx":201.8178218890848,"posy":498.42714526912914},{"id":6,"posx":201.79570741933048,"posy":498.44107090378867},{"id":7,"posx":1.8217109358508998,"posy":498.24669695233416},{"id":8,"posx":1.7957369855173382,"posy":498.2247651105463}],"springs":[{"aid":0,"bid":1,"keys":["1"]},{"aid":1,"bid":2,"keys":["2"]},{"aid":0,"bid":2,"keys":[]},{"aid":2,"bid":3,"keys":["1"]},{"aid":3,"bid":0,"keys":["2"]},{"aid":0,"bid":4,"keys":[]},{"aid":4,"bid":2,"keys":[]},{"aid":1,"bid":5,"keys":[]},{"aid":5,"bid":2,"keys":["2"]},{"aid":3,"bid":6,"keys":[]},{"aid":6,"bid":2,"keys":["1"]},{"aid":0,"bid":7,"keys":["2"]},{"aid":7,"bid":1,"keys":[]},{"aid":3,"bid":8,"keys":[]},{"aid":8,"bid":0,"keys":["1"]}]}
};

Array.prototype.remove = function(elem) {
	var i = this.indexOf(elem);
	if (i >= 0) {
		return this.splice(i,1);
	}
	return null;
};

Array.prototype.insertBefore = function(elem,before) {
	var i = this.indexOf(before);
	if (i < 0) { throw "insertBefore: before not found"; }
	this.splice(i,0,elem);
};

Array.prototype.insertAfter = function(elem,after) {
	var i = this.indexOf(before);
	if (i < 0) { throw "insertAfter: after not found"; }
	this.splice(i+1,0,elem);
};

function arrRandom(arr) {
	return arr[Math.floor(arr.length*Math.random())];
}

function rnd() {
	return (Math.random()-0.5)*2;
}

function extend(o,extension) {
	for(var i in extension) {
		if (extension.hasOwnProperty(i)) {
			o[i] = extension[i];
		}
	}
}

function slide(a,b) {
	return (b?1:0)-(a?1:0);
}

require(['domready!','game','cclass','vector','editor','mouse','collision','staticcollidable','keyboard','quake','resources'],function(document,Game,cclass,Vector,editor,mouse,collision,StaticCollidable,keyboard,quake,resources) {
	var canvas = document.getElementById('main');
	var t = new Vector(0,0);
	var t2 = new Vector(0,0);
	var g = new Game(canvas, [mouse,keyboard,resources,collision,quake]);
	var game = g;
	g.resources.preload({
		images: ['ball1','ball2','spring','grass','ground','flag','arrow'],
		audio: ['finish','start','stop','deny','add1','add2','add3','remove1','remove2','remove3']
	},startGame,function() {
		console.error('Could not load all files! Continuing anyway...');
		startGame();
	});

	function startGame() {
	var images = g.resources.images;
	var audio = g.resources.audio;

	g.objects.addIndex('particle');
	g.objects.addIndex('spring');
	g.objects.addIndex('start');
	g.objects.addIndex('finish');
	g.objects.addIndex('collisionlines');

	var screenCollidable = new StaticCollidable([
		new Vector(0,0),
		new Vector(0,600),
		new Vector(800,600),
		new Vector(800,0)
	],true);

	// Gravity.
	g.gravity = (function() {
		var me = {
			enabled: true,
			enable: enable,
			disable: disable,
			toggle: toggle
		};
		function enable() { me.enabled = true; }
		function disable() { me.enabled = false; }
		function toggle() { if (me.enabled) disable(); else enable(); }
		function update(dt,next) {
			g.objects.lists.particle.each(function(p) {
				if (me.enabled) {
					p.velocity.y += 200*dt;
				}
			});
			next(dt);
		}
		g.chains.update.push(update);
		return me;
		
	})();

	var Particle = cclass({
		particle: true,
		constructor: function(x,y) {
			this.position = new Vector(x,y);
			this.velocity = new Vector(0,0);
			this.springs = [];
			this.image = images['ball'+Math.floor(Math.random()*2+1)];
		},
		update: function(dt) {
			this.position.add(this.velocity.x*dt,this.velocity.y*dt);
			this.velocity.multiply(0.99);
		},
		direction: function(v) {
			if (this.springs.length > 0) { v.set(0,1); return; }
			var spring = this.springs[0];
			var other = (spring.p1 === this) ? spring.p2 : spring.p1;
			v.setV(other.position);
			v.substractV(this.position);
		}
	});

	var Spring = cclass({
		spring: true,
		constructor: function(p1,p2) {
			this.p1 = p1;
			this.p2 = p2;
			this.p1.springs.push(this);
			this.p2.springs.push(this);
			this.desiredLength = 100;
			this.springConstant = 50;
			this.retracted = false;
		},
		distanceTo: function(x,y) {
			t2.setV(this.p2.position);
			t2.substractV(this.p1.position);
			var len = t2.length();
			t2.normalizeOr(0,1);
			var fdot = t2.dot(x-this.p1.position.x,y-this.p1.position.y);
			if (fdot < 0) { return this.p1.position.distanceTo(x,y); }
			else if (fdot > len) { return this.p2.position.distanceTo(x,y); }
			t2.normalRight();
			var sdot = t2.dot(x-this.p1.position.x,y-this.p1.position.y);
			return Math.abs(sdot);
		},
		update: function(dt) {
			var desiredLength = this.desiredLength * (this.retracted ? 0.5 : 1.0);
			var p1 = this.p1;
			var p2 = this.p2;
			t.setV(p1.position);
			t.substractV(p2.position);
			var l = t.length();
			t.normalizeOr(0,0);

			var v1 = p1.velocity.dotV(t);
			var v2 = p2.velocity.dotV(t);

			t.multiply((desiredLength - l)*dt*this.springConstant - (v1-v2)*0.1);

			p1.velocity.addV(t);
			p2.velocity.substractV(t);
		},
		detach: function() {
			this.p1.springs.remove(this);
			this.p2.springs.remove(this);
		}
	});

	function drawSpring(g,s,highlighted) {
		var cx = (s.p1.position.x+s.p2.position.x)*0.5;
		var cy = (s.p1.position.y+s.p2.position.y)*0.5;
		var dist = s.p1.position.distanceToV(s.p2.position);
		var angle = Math.atan2(s.p2.position.y-s.p1.position.y,s.p2.position.x-s.p1.position.x);
		var sx = dist/150;
		var sy = Math.min(0.73,(1/dist*3)*10);
		if (highlighted) {
			sx += Math.cos(game.time*5)*0.1;
			sy += Math.sin(game.time*8)*0.03;
		}
		g.scalerotate(cx,cy,sx,sy,angle,function() {
			g.drawCenteredImage(images.spring,cx,cy);
		});
	}

	function drawParticle(g,p,highlighted) {
		var sx = 0.25;
		var sy = 0.25;

		if (highlighted) {
			sx += Math.cos(game.time*5)*0.03;
			sy += Math.sin(game.time*5)*0.03;
		}
		g.scale(p.position.x,p.position.y,sx,sy,function() {
			g.drawCenteredImage(p.image,p.position.x,p.position.y);
		});
	}

	var Creature = cclass({
		constructor: function(particles,springs) {
			this.particles = particles||[];
			this.springs = springs||[];
			this.highlight = null;
		},
		boundingBox: function(position,size) {
			var minx,maxx,miny,maxy;
			maxx = maxy = -Infinity;
			minx = miny = Infinity;
			this.particles.forEach(function(p) {
				maxx = Math.max(maxx,p.position.x);
				maxy = Math.max(maxy,p.position.y);
				minx = Math.min(minx,p.position.x);
				miny = Math.min(miny,p.position.y);
			});
			position.set(minx,miny);
			size.set(maxx-minx,maxy-miny);
		},
		move: function(p) {
			this.particles.forEach(function(particle) {
				particle.position.addV(p);
				particle.velocity.set(0,0);
			});
		},
		center: function(p) {
			var size = new Vector();
			this.boundingBox(p,size);
			p.add(size.x*0.5,size.y*0.5);
		},
		draw: function(g) {
			var highlight = this.highlight;
			this.springs.forEach(function(s) {
				drawSpring(g,s,s === highlight);
			});
			this.particles.forEach(function(p) {
				drawParticle(g,p,p === highlight);
			});
		}
	});
	Creature.toJson = function(creature) {
		var id = 0;
		return {
			particles: creature.particles.map(function(p) { p.id = id++; return {id:p.id,posx:p.position.x,posy:p.position.y}; }),
			springs: creature.springs.map(function(s) { return {aid:s.p1.id,bid:s.p2.id,keys:s.keys||undefined}; })
		};
	};
	Creature.fromJson = function(json) {
		var particleids = {};
		var particles = json.particles.map(function(p) {
			return particleids[p.id] = new Particle(p.posx,p.posy);
		});
		var springs = json.springs.map(function(s) {
			var ns = new Spring(particleids[s.aid],particleids[s.bid]);
			ns.keys = s.keys;
			return ns;
		});
		return new Creature(particles,springs);
	};

	var Start = cclass({
		start: true,
		constructor: function(x,y,sx,sy) {
			this.x = x; this.y = y;
			this.sx = sx; this.sy = sy;
		},
		draw: function(g) {
			g.context.strokeStyle = 'green';
			g.strokeRectangle(this.x,this.y,this.sx,this.sy);
			g.context.strokeStyle = 'black';
		}
	});

	var Finish = cclass({
		finish: true,
		constructor: function(x,y,angle) {
			this.position = new Vector(x,y);
			this.angle = angle || 0;
		},
		draw: function(g) {
			var me = this;
			g.rotate(this.position.x,this.position.y,this.angle,function() {
				g.drawCenteredImage(images.flag,me.position.x,me.position.y);
			});
		}
	});

	var StaticArrow = cclass({
		constructor: function(x,y,angle,scale) {
			this.position = new Vector(x,y);
			this.angle = angle;
			this.scale = scale || 1.0;
		},
		draw: function(g) {
			var me = this;
			g.scalerotate(this.position.x, this.position.y, this.scale, this.scale, this.angle*Math.PI/180,function() {
				g.drawCenteredImage(images.arrow, me.position.x, me.position.y);
			});
		}
	});

	var StaticText = cclass({
		constructor: function(x,y,text,font) {
			this.position = new Vector(x,y);
			this.font = font || '20px Permanent Marker';
			this.text = text;
		},
		draw: function(g) {
			g.context.fillStyle = 'white';
			g.context.font = this.font;
			g.fillCenteredText(this.text,this.position.x,this.position.y);
		}
	});

	var StaticImage = cclass({
		constructor: function(x,y,image) {
			this.position = new Vector(x,y);
			this.image = image;
		},
		draw: function(g) {
			g.drawCenteredImage(this.image,this.position.x,this.position.y);
		}
	});

	// Collision
	g.chains.update.push(function(dt,next) {
		g.objects.lists.particle.each(function(p) {
			g.objects.lists.collisionlines.each(function(cls) {
				if (cls.inverted) {
					cls.collisionlines.forEach(function(cl) {
						t.setV(p.position);
						t.substractV(cl.start);
						var d = cl.normal.dotV(t);
						if (d < 0) {
							t.setV(cl.normal);
							t.multiply(-d+0.1);
							p.position.addV(t);

							d = p.velocity.dotV(cl.normal);
							if (d < 0) {
								t.setV(cl.normal);
								t.multiply(-d*1.0);
								p.velocity.addV(t);

								t.setV(cl.normal);
								t.normalRight();
								t.multiply(t.dotV(p.velocity)*-0.5);
								p.velocity.addV(t);
							}
						}
					});
				} else {
					var isInside = true;
					var closestd;
					var closestcl;
					cls.collisionlines.forEach(function(cl) {
						t.setV(p.position);
						t.substractV(cl.start);
						var d = cl.normal.dotV(t);
						if (d > 0) {
							if (!closestcl || d < closestd) {
								closestcl = cl;
								closestd = d;
							}
						} else {
							isInside = false;
						}
					});

					if (isInside && closestcl) {
						var cl = closestcl;
						var d = closestd;

						t.setV(cl.normal);
						t.multiply(-closestd);
						p.position.addV(t);

						d = p.velocity.dotV(cl.normal);
						if (d > 0) {
							t.setV(cl.normal);
							t.multiply(-d*1.0);
							p.velocity.addV(t);

							t.setV(cl.normal);
							t.normalRight();
							t.multiply(t.dotV(p.velocity)*-0.5);
							p.velocity.addV(t);
						}
					}
				}

			});
		});
		next(dt);
	});

	// Draw background
	var backgroundGradient;
	g.chains.draw.insertBefore(function(g,next) {
		if (!backgroundGradient) {
			backgroundGradient = g.context.createRadialGradient(600,-100,0,600,-100,900);
			backgroundGradient.addColorStop(0,'#6DCEFF');
			backgroundGradient.addColorStop(1,'#00AAFF');
			//backgroundGradient.addColorStop(0,'black');
			//backgroundGradient.addColorStop(1,'white');
		}
		g.context.fillStyle = backgroundGradient;
		g.fillRectangle(0,0,800,600);
		g.context.fillStyle = 'black';
		next(g);
	},g.chains.draw.objects);

	// Draw foreground
	var foregroundCanvas = document.createElement('canvas');
	foregroundCanvas.width = 800;
	foregroundCanvas.height = 600;

	function updateLevelGraphics() {
		maskCtx = foregroundCanvas.getContext('2d');
		var groundPattern = maskCtx.createPattern(images.ground,'repeat');
		maskCtx.globalCompositeOperation = 'source-over';
		maskCtx.fillStyle = groundPattern;
		maskCtx.fillRect(0,0,800,600);
		maskCtx.globalCompositeOperation = 'xor';

		function pathCollisionLines(cls) {
			maskCtx.beginPath();
			var yoff = 0;
			maskCtx.moveTo(cls.collisionlines[0].start.x,cls.collisionlines[0].start.y);
			for(var i=0;i<cls.collisionlines.length;i++) {
				var cl = cls.collisionlines[i];
				if (cls.inverted && cl.normal.y < 0) { yoff = 17; }
				maskCtx.lineTo(cl.start.x,cl.start.y+yoff);
			}
			maskCtx.closePath();
		}
		var count = 0;
		game.objects.lists.collisionlines.each(function(cls) {
			if (cls.inverted) {
				pathCollisionLines(cls); count++;
				maskCtx.fill();
			}
		});
		if (count === 0) {
			maskCtx.clearRect(0,0,800,600);
		}

		maskCtx.globalCompositeOperation = 'source-over';
		game.objects.lists.collisionlines.each(function(cls) {
			if (!cls.inverted) {
				pathCollisionLines(cls);
				maskCtx.fill();
			}
		});
	}
	g.chains.draw.push(function(g,next) {

		g.drawImage(foregroundCanvas,0,0);

		game.objects.lists.collisionlines.each(function(cls) {
			cls.collisionlines.forEach(function(cl) {
				if (cls.inverted && cl.normal.y < 0 || !cls.inverted && cl.normal.y > 0) {
					var step = 69;
					var start;
					var offset;
					t.setV(cl.normal);
					if (cls.inverted) {
						t.normalRight();
						start = cl.start;
						offset=3;
					} else {
						t.normalLeft();
						start = cl.end;
						offset=-13;
					}
					
					var drawn = step/2;
					var angle = Math.atan2(t.y,t.x);
					g.rotate(start.x,start.y,angle,function() {
						while (drawn < cl.length) {
							g.drawCenteredImage(images.grass,start.x+drawn,start.y+offset);
							t2.addV(t);
							drawn += step;
						}
					});
				}
			});
		});
		next(g);
	});

	// Controls.
	var springKeys = {};

	// Draw keys for springs
	g.chains.draw.push(function(g,next) {
		game.objects.lists.spring.each(function(s) {
			var keysText = (s.keys||[]).join(',');
			g.context.fillStyle = 'white';
			g.context.font = '20px Permanent Marker';
			g.context.fillText(keysText,(s.p1.position.x+s.p2.position.x)/2,(s.p1.position.y + s.p2.position.y)/2);
		});
		next(g);
	});

	g.on('keydown',function(key) {
		// Use key for spring
		(springKeys[key]||[]).forEach(function(spring) {
			spring.retracted = spring.keys.some(function(key) { return g.keys[key]; });
		});
	});

	g.on('keyup',function(key) {
		// Use key for spring
		(springKeys[key]||[]).forEach(function(spring) {
			spring.retracted = spring.keys.some(function(key) { return g.keys[key]; });
		});
	});

	// State management
	g.state = null;
	g.ChangeState = function(state) {
		if (this.state) { this.state.disable(); }
		this.state = state;
		if (this.state) { this.state.enable(); }
	};

	g.level = null;
	g.ChangeLevel = function(level) {
		if (this.level) { this.level.objects.forEach(function(c) { g.objects.remove(c); }); }
		this.level = level;
		if (this.level) { this.level.objects.forEach(function(c) { g.objects.add(c); }); }
		g.objects.handlePending();
		updateLevelGraphics();
	};
	g.RestartLevel = function() {
		g.ChangeLevel(g.level.clone());
		if (g.level.creature) {
			g.ChangeCreature(g.level.creature);
		} else {
			g.ResetCreaturePosition();
		}
		g.ChangeState((g.level.controlonly ? control : editor)());
	};
	g.ResetCreaturePosition = function() {
		var start;
		g.objects.lists.start.each(function(s,BREAK) {
			start = s;
			return BREAK;
		});
		if (start) {
			var oldposition = new Vector();
			var size = new Vector();
			g.creature.boundingBox(oldposition, size);
			oldposition.add(size.x/2,size.y/2);
			var newposition = new Vector(start.x+start.sx/2,start.y+start.sy/2);
			var diff = new Vector();
			diff.setV(newposition); diff.substractV(oldposition);
			g.creature.move(diff);
		}
	};
	g.NextLevel = function(level) {
		var nextLevel = level.nextLevel();
		g.ChangeLevel(nextLevel);
	};
	g.ChangeCreature = function(json) {
		if (this.creature) {
			this.creature.particles.forEach(function(p) { g.objects.remove(p); });
			this.creature.springs.forEach(function(s) { g.objects.remove(s); });
			g.objects.remove(this.creature);
			springKeys = {};
		}

		if (json) {
			this.creature = Creature.fromJson(json);

			springKeys = {};
			this.creature.particles.forEach(function(p) { g.objects.add(p); });
			this.creature.springs.forEach(function(s) {
				g.objects.add(s);
				if (s.keys) {
					s.keys.forEach(function(k) {
						springKeys[k] = springKeys[k]||[];
						springKeys[k].push(s);
					});
				}
			});
			g.objects.add(this.creature);
		} else {
			this.creature = null;
		}
		return this.creature;
	};

	// Editing
	function editor(creature) {
		var me = {
			enabled: false,
			enable: enable,
			disable: disable,
			menuhandler: menuhandler
		};

		function menuhandler(menu) {
			menu.createSeparator();
			function textbox(buttontext,text,callback) {
				var box = document.createElement('div');
				box.className = 'sharebox';
				
				var textarea = document.createElement('textarea');
				textarea.value = text;
				box.appendChild(textarea);

				var button = document.createElement('button');
				button.textContent = buttontext;
				button.onclick = function() {
					menu.overlay.removeChild(box);
					callback(textarea.value);
				};
				box.appendChild(button);

				menu.overlay.appendChild(box);
			}

			menu.createButton('Share creature',function() {
				textbox('Close',JSON.stringify(Creature.toJson(g.creature)),function(text) {
					// ...?
				});
			});
			menu.createButton('Load creature',function() {
				textbox('Load','',function(text) {
					var json;
					try {
						json = JSON.parse(text)
					} catch(e) { }
					if (json) {
						g.ChangeCreature(json);
					}
				});
			});
		}

		var grabParticle = null;
		var startParticle = null;
		function getHoverObject() {
			function closestObject(p) {
				var closest = null;
				var range = Infinity;
				g.objects.lists.particle.each(function(particle) {
					var dist = particle.position.distanceToV(p);
					if (!closest || dist < range) { closest = particle; range = dist; }
				});
				if (range < 15) { return closest; }
				g.objects.lists.spring.each(function(spring) {
					var dist = spring.distanceTo(p.x,p.y);
					if (!closest || dist < range) { closest = spring; range = dist; }
				});
				if (range < 15) { return closest; }
				return null;
			}

			t.set(g.mouse.x,g.mouse.y);
			return closestObject(t);
		}

		function draw(g,next) {
			if (startParticle) {
				var end;
				var drawEnd = false;
				if (game.creature.highlight && game.creature.highlight.particle) {
					end = game.creature.highlight;
				} else {
					end = {position:new Vector(game.mouse.x,game.mouse.y),image:images.ball1};
					drawEnd = true;
				}
				g.context.globalAlpha = 0.5;
				drawSpring(g,{p1:startParticle,p2:end});
				if (drawEnd) { drawParticle(g,end); }
				g.context.globalAlpha = 1;
			}

			g.context.font = '40px Permanent Marker';
			g.context.fillStyle = 'white';
			g.context.fillText('Design mode',10,590);
			next(g);
		}

		function update(dt,next) {
			g.creature.highlight = getHoverObject();
			if (grabParticle) {
				t.set(g.mouse.x,g.mouse.y);
				t.substractV(grabParticle.position);
				t.multiply(dt*5);
				grabParticle.velocity.multiply(0.95);
				grabParticle.velocity.addV(t);
			}
			next(dt);
		}

		function mousedown(button) {
			var hoverObject = getHoverObject();
			if (button === 0) {
				if (hoverObject && hoverObject.particle) {
					startParticle = hoverObject;
				}
			} else if (button === 1) {
				if (hoverObject && hoverObject.particle) {
					grabParticle = hoverObject;
				}
			} else if (button === 2) {
				if (hoverObject && hoverObject.particle) {
					if (g.creature.particles.length > 1) {
						var springs = [];
						g.objects.lists.spring.each(function(s) {
							if (s.p1 === hoverObject || s.p2 === hoverObject) {
								springs.push(s);
							}
						});
						springs.forEach(function(s) { s.detach(); g.creature.springs.remove(s); g.objects.remove(s); });
						g.creature.particles.remove(hoverObject);
						g.objects.remove(hoverObject);

						arrRandom([audio.remove1,audio.remove2,audio.remove3]).play();
					}
				} else if (hoverObject && hoverObject.spring) {
					hoverObject.detach();
					g.creature.springs.remove(hoverObject);
					g.objects.remove(hoverObject);
					arrRandom([audio.remove1,audio.remove2,audio.remove3]).play();
				}
			}
		}

		function mouseup(button) {
			t.set(game.mouse.x,game.mouse.y);
			if (startParticle) {
				var endParticle;
				var hoverObject = getHoverObject();
				if (hoverObject && hoverObject.particle) {
					if (hoverObject === startParticle) { startParticle = null; return; }
					endParticle = hoverObject;
				} else {
					endParticle = new Particle(game.mouse.x,game.mouse.y);
					g.creature.particles.push(endParticle);
					g.objects.add(endParticle);
				}
				var s = new Spring(startParticle,endParticle);
				g.creature.springs.push(s);
				g.objects.add(s);
				arrRandom([audio.add1,audio.add2,audio.add3]).play();
				startParticle = null;
			}
			if (grabParticle) {
				grabParticle = null;
			}
		}

		function keydown(key) {
			if (key === 'r') {
				g.RestartLevel();
			} else if (key === 'space') {
				if (g.creature.particles.every(function(p) {
					var inStart = false;
					g.objects.lists.start.each(function(s) {
						var x = p.position.x; var y = p.position.y;
						inStart = inStart || (x >= s.x && y >= s.y && x <= s.x+s.sx && y <= s.y+s.sy);
					});
					return inStart;
				})) {
					audio.start.play();
					g.ChangeState(control());
				} else {
					audio.deny.play();
					console.log('Not in start');
				}

				return;
			}

			// Binding/unbinding key to spring
			var obj = getHoverObject();
			if (obj && obj.spring) {
				var arr = springKeys[key] = springKeys[key] || [];
				var i = arr.indexOf(obj);
				if (i < 0) {
					arr.push(obj);

					obj.keys = obj.keys || [];
					obj.keys.push(key);
				} else {
					arr.splice(i,1);

					obj.keys = obj.keys || [];
					obj.keys.remove(key);
				}
				obj.retracted = obj.keys.some(function(key) { return g.keys[key]; });
			}
		}

		function enable() {
			g.chains.draw.push(draw);
			g.chains.update.push(update);
			g.on('mouseup',mouseup);
			g.on('mousedown',mousedown);
			g.on('keydown',keydown);
			g.gravity.disable();
			me.enabled = true;
		}
		function disable() {
			g.creature.highlight = null;
			g.gravity.enable();
			g.chains.draw.remove(draw);
			g.chains.update.remove(update);
			g.removeListener('mouseup',mouseup);
			g.removeListener('mousedown',mousedown);
			g.removeListener('keydown',keydown);
			me.enabled = false;
		}

		return me;
	}


	function control() {
		var me = {
			enabled: false,
			enable: enable,
			disable: disable
		};
		var time = 0;
		function update(dt,next) {
			time += dt;
			if (g.creature.particles.some(function(p) {
				var finished = false;
				g.objects.lists.finish.each(function(f) {
					finished = finished || (p.position.x > f.position.x && p.position.x < f.position.x+50 && p.position.y > f.position.y-119 && p.position.y < f.position.y+119);
				});
				return finished;
			})) {
				audio.finish.play();
				g.ChangeState(finished(time));
			}
			next(dt);
		}
		function draw(g,next) {
			g.context.font = '40px Permanent Marker';
			g.context.fillStyle = 'white';
			g.context.fillText(time.toFixed(1),670,570);
			next(g);
		}
		function keydown(key) {
			if (key === 'r') {
				g.RestartLevel();
			} else if (key === 'space' && !g.level.controlonly) {
				audio.stop.play();
				g.ChangeState(editor());
				return;
			}
		}
		function enable() {
			var pos = new Vector();
			var size = new Vector();
			g.creature.boundingBox(pos,size);
			t.set(100,500);
			t.substractV(size);
			t.substractV(pos);
			time = 0;
			//creature.move(t);

			g.chains.update.push(update);
			g.chains.draw.push(draw);
			g.on('keydown',keydown);
		}
		function disable() {
			g.chains.update.remove(update);
			g.chains.draw.remove(draw);
			g.removeListener('keydown',keydown);
		}
		return me;
	}

	function finished(finishtime) {
		var currentlevel = null;
		var nextLevel = null;
		function update(dt,next) {
			var pos = new Vector();
			var size = new Vector();
			g.creature.boundingBox(pos,size);
			size.multiply(0.5);
			pos.addV(size);
			pos.substract(400,300);
			pos.multiply(-2);

			g.creature.particles.forEach(function(p) {
				p.velocity.multiply(0.9);
				p.velocity.addV(pos);
			});

			next(dt);
		}

		function draw(g,next) {
			g.context.save();
			g.context.font = '50px Permanent Marker';
			g.fillCenteredText('YOU FINISHED',400,150);
			g.context.font = '30px Permanent Marker';
			g.fillCenteredText('in '+finishtime.toFixed(2) + ' seconds',400,180);

			g.context.font = '30px Permanent Marker';
			g.fillCenteredText('Press SPACE to continue to the next level',400,500);
			g.fillCenteredText('Press R to retry the previous level',400,550);
			g.context.restore();
			next(g);
		}

		function keydown(key) {
			if (key === 'space') {
				g.ChangeLevel(nextLevel);
				if (g.level.creature) {
					g.ChangeCreature(g.level.creature);
				} else {
					g.ResetCreaturePosition();
				}
				g.ChangeState((nextLevel.controlonly ? control : editor)());
			} else if (key === 'r') {
				g.ChangeLevel(currentlevel.clone());
				if (g.level.creature) {
					g.ChangeCreature(g.level.creature);
				} else {
					g.ResetCreaturePosition();
				}
				g.ChangeState((nextLevel.controlonly ? control : editor)());
			}
		}

		function enable() {
			currentlevel = g.level;
			nextLevel = g.level.nextLevel();
			g.ChangeLevel(null);
			g.chains.update.push(update);
			g.chains.draw.push(draw);
			g.on('keydown',keydown);
		}
		function disable() {
			g.chains.update.remove(update);
			g.chains.draw.remove(draw);
			g.removeListener('keydown',keydown);
		}

		return {
			enable: enable,
			disable: disable
		};
	}

	function menu(callback) {
		var me;

		var overlay = document.createElement('div');
		overlay.className = 'overlay';
		overlay.style.background = 'rgba(0,0,0,0.5)';

		var logo = document.createElement('img');
		logo.src = 'logo.png';
		overlay.appendChild(logo);

		var menuDiv = document.createElement('div');
		menuDiv.className = 'menu';
		overlay.appendChild(menuDiv);

		var container = menuDiv;

		function start(level) {
			g.ChangeLevel(level);
			if (g.level.creature) {
				g.ChangeCreature(g.level.creature);
			} else {
				g.ChangeCreature(creatures.dot);
			}
			g.ChangeState((g.level.controlonly ? control : editor)());
			if (me.enabled) { disable(); }
		}

		createButton('Tutorial',function() {
			start(tutorial1());
		});
		createButton('Start Levels',function() {
			start(level1());
		});
		createButton('Sandbox',function() {
			start(sandboxlevel());
		});
		var c = document.createElement('div');
		menuDiv.appendChild(c);
		if (callback) {
			createSeparator();
			createButton('Back to game',function() {
				disable();
			});
		}
		container = c;

		function createButton(text,onclick) {
			var b = document.createElement('button');
			b.textContent = text;
			b.onclick = onclick;
			container.appendChild(b);
			return b;
		}

		function createSeparator() {
			var s = document.createElement('div');
			s.className = 'separator';
			container.appendChild(s);
			return s;
		}

		function enable() {
			me.enabled = true;
			game.canvas.parentNode.insertBefore(overlay,game.canvas);
		}
		function disable() {
			overlay.parentNode.removeChild(overlay);
			game.canvas.focus();
			me.enabled = false;
			if (callback) { callback(); }
		}
		return me = {
			enabled: false,
			enable: enable,
			disable: disable,
			overlay: overlay,
			menu: menuDiv,
			createButton: createButton,
			createSeparator: createSeparator
		};
	}

	var ingameMenu;
	g.on('keydown',function(key) {
		if (key === 'escape' && !ingameMenu) {
			ingameMenu = menu(function() {
				ingameMenu = null;
			});
			if (game.state.menuhandler) { game.state.menuhandler(ingameMenu); }
			ingameMenu.enable();
		}
	});

	function tutorial1() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new Finish(700,400),
			new StaticText(300,100,'Tutorial','60px Permanent Marker'),
			new StaticText(300,200,'This is a creature created from blobs and muscles'),
			new StaticText(450,250,'You can control muscles by pressing the key that is next to it'),
			new StaticText(400,300,'Try pressing 1 and 2 and get to the finish'),
			new StaticText(400,325,'Press R to reset'),
			new StaticArrow(80,300,80)
			],
			creature: creatures.square,
			clone: arguments.callee,
			nextLevel: tutorial2,
			controlonly: true
		};
	}

	function tutorial2() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new StaticText(300,100,'Tutorial','60px Permanent Marker'),
			new StaticText(250,180,'You can define your own key bindings'),
			new StaticText(450,250,'Hover your mouse above a muscle and press 1 (one)'),
			new StaticText(400,300,'Press SPACE when you are finished'),
			new StaticArrow(90,470,-90,0.5),
			new StaticArrow(20,385,0,0.5),
			new Finish(700,400),
			new Start(0,300,200,200)
			],
			creature: creatures.unboundtriangle,
			clone: arguments.callee,
			nextLevel: tutorial3
		};
	}

	function tutorial3() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new StaticText(300,100,'Tutorial','60px Permanent Marker'),
			new StaticText(250,180,'Create your own creature!'),
			new StaticText(450,225,'Drag left mouse: create muscles/blobs'),
			new StaticText(450,250,'Drag middle mouse: drag blobs'),
			new StaticText(450,275,'Right mouse: remove blobs/muscles'),
			new StaticText(450,325,'To start, make sure your creature is inside'),
			new StaticText(425,350,'the starting area'),
			new StaticArrow(270,370,160, 0.8),
			new Finish(700,400),
			new Start(0,300,200,200)
			],
			creature: creatures.dot,
			clone: arguments.callee,
			nextLevel: level1
		};
	}

	function level1() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,200),
				new Vector(600,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new Finish(700,400),
			new Start(0,0,225,600)
			],
			clone: arguments.callee,
			nextLevel: level2
		};
	}

	function level2() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new Finish(700,450),
			new Start(0,0,225,600)
			],
			clone: arguments.callee,
			nextLevel: level3
		};
	}

	function level3() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(200,500),
				new Vector(800,400),
				new Vector(800,0)
			],true),
			new Finish(700,350),
			new Start(0,0,225,600)
			],
			clone: arguments.callee,
			nextLevel: level4
		};
	}

	function level4() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new StaticCollidable([
				new Vector(200,200),
				new Vector(185,210),
				new Vector(185,240),
				new Vector(200,250),
				new Vector(900,250),
				new Vector(900,200)
			]),
			new Finish(700,400),
			new Start(600,0,200,200)
			],
			clone: arguments.callee,
			nextLevel: level5
		};
	}

	function level5() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new StaticCollidable([
				new Vector(-50,200),
				new Vector(-50,250),
				new Vector(430,250),
				new Vector(440,240),
				new Vector(440,210),
				new Vector(430,200)
			]),
			new StaticCollidable([
				new Vector(500,200),
				new Vector(490,210),
				new Vector(490,240),
				new Vector(500,250),
				new Vector(900,250),
				new Vector(900,200)
			]),
			new Finish(700,400),
			new Start(0,0,200,200)
			],
			clone: arguments.callee,
			nextLevel: level6
		};
	}

	function level6() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			new StaticCollidable([
				new Vector(500,220),
				new Vector(490,230),
				new Vector(490,240),
				new Vector(500,250),
				new Vector(900,250),
				new Vector(900,220)
			]),
			new Finish(650,130),
			new Start(0,0,400,600)
			],
			clone: arguments.callee,
			nextLevel: sandboxlevel
		};
	}

	function sandboxlevel() {
		return {
			objects: [new StaticCollidable([
				new Vector(0,0),
				new Vector(0,500),
				new Vector(800,500),
				new Vector(800,0)
			],true),
			//new Finish(700,350),
			new Start(0,0,800,600)
			],
			clone: arguments.callee,
			nextLevel: sandboxlevel
		};
	}

	g.ChangeState(menu());

	g.start();
	}
});
