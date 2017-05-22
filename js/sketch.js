var rings = [];
var base_frequency, paused, speed;
var max_size;

var speedRing, freqRing;

function setup(){
  createCanvas(window.innerWidth,window.innerHeight);

  ellipseMode(RADIUS);

  paused = true;
  speed  = 4;
  base_frequency = 200;
  max_size = (height/2)-80;

  var number_of_rings = 6;

  for(var i = 0; i < number_of_rings; i++){
    rings.push(new Ring((max_size/number_of_rings)*(i+1)));
  }

  speedRing = new GuiRing("Speed",width-80,height-80,50,20,20);
  freqRing = new GuiRing("Freq",70,height - 80,50,500,200);
}

function draw(){
  if(midi_isRunning && base_frequency != null){
    base_frequency = midi_pitch;
  }

  background(255);
  stroke(0);

  for(var i = 0; i < rings.length; i++){
    rings[i].update();
    rings[i].display();
  }

  drawGUI();
  drawAlignmentCompass();
}

function Ring(size){
  this.selected = false;
  this.driver = 0;

  //positioning
  this.radius = size;
  this.center = createVector(width/2,height/2);
  this.ctrl_position = createVector();
  this.ctrl_position.x = this.radius*cos(this.theta) + this.center.x;
  this.ctrl_position.y = this.radius*sin(this.theta) + this.center.y;

  //circle
  this.theta  = -Math.PI/2;
  this.offset = 0;

  //sound
  this.frequency = 1;
  this.osc_type = "sine";

  this.osc = new p5.Oscillator();
  this.osc.setType(this.osc_type);
  this.osc.freq(this.frequency);
	this.osc.amp(0.1);
  this.osc.start();

	this.noise_source = new p5.Noise('pink');
	this.noise_env = new p5.Env();
	this.noise_env.setADSR(0.001,0.01,0.2,0.01);
	this.noise_env.setRange(0.3,0.0);
	this.noise_source.amp(this.noise_env);
	this.noise_source.start();

  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);
    strokeWeight(3);
    point(this.center.x,this.center.y);
    strokeWeight(1);

    if(this.selected){ fill(0) }else{ fill(255) }

    line(this.center.x,this.center.y,this.ctrl_position.x,this.ctrl_position.y);

    drawOscTypes(this.osc_type,this.ctrl_position);
    noFill();

    textAlign(CENTER);
    text(Math.floor(this.frequency)+" hz", this.ctrl_position.x, this.ctrl_position.y-15);
    text("Θ = "+this.theta.toFixed(2), this.ctrl_position.x, this.ctrl_position.y+25);
  }

  this.update = function(){
    this.center = createVector(width/2,height/2);

    if(this.selected){
      this.theta = 0;
      this.offset = Math.atan2(mouseY - this.center.y, mouseX - this.center.x);
      this.radius = getDistance(this.center.x,this.center.y,mouseX,mouseY);
    }else{
      if(!paused){ this.driver += speed; }
      this.theta = this.driver/100;
    }

    this.ctrl_position.x = this.radius * cos(this.theta + this.offset) + this.center.x;
    this.ctrl_position.y = this.radius * sin(this.theta + this.offset) + this.center.y;

    this.theta = Math.atan2(this.ctrl_position.y - this.center.y, this.ctrl_position.x - this.center.x);

    var linearRadians = Math.PI + (Math.PI + this.theta);

    if(this.theta < 0){
      this.frequency = (map(linearRadians,0,Math.PI*2,0,base_frequency) + base_frequency);
    }else{
      this.frequency = (map(linearRadians,0,Math.PI*2,0,base_frequency));
    }

    this.osc.freq(this.frequency);
    this.osc.amp(this.radius/(width/2));

		if(this.theta > 0 && this.theta < 0.1){
			console.log('trigger?');
			this.triggerPerc();
		}
  }

	this.triggerPerc = function(){
		this.noise_env.play();
	}
}

function GuiRing(name,x,y,radius,range,def){
  //positioning
  this.center = createVector(x,y);
  this.ctrl_position = createVector();
  this.ctrl_position.x = this.radius * cos(this.theta) + this.center.x;
  this.ctrl_position.y = this.radius * sin(this.theta) + this.center.y;

  //circle
  this.radius = radius;
  this.theta  = -Math.PI/2;
  this.offset = 1;

  this.value = 0;
  this.range = range;

  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);

    if(this.selected){ fill(0) }else{ fill(255) }

    stroke(color(0,0,0,30));
    line(this.center.x,this.center.y,this.ctrl_position.x,this.ctrl_position.y);
    stroke(0);

    drawOscTypes("sine",this.ctrl_position);

    textAlign(CENTER);
    text(this.value, this.ctrl_position.x, this.ctrl_position.y-15);
    text(name, this.center.x, this.center.y+3);
  }

  this.update = function(){
    if(this.selected){
      this.offset = Math.atan2(mouseY - this.center.y, mouseX - this.center.x);
    }

    this.ctrl_position.x = this.radius * cos(this.offset) + this.center.x;
    this.ctrl_position.y = this.radius * sin(this.offset) + this.center.y;

    this.theta = Math.atan2(this.ctrl_position.y - this.center.y, this.ctrl_position.x - this.center.x);

    if(this.theta < 0){
      this.value = Math.floor((map(this.theta,0,Math.PI*2,0,this.range)+this.range));
    }else{
      this.value = Math.floor((map(this.theta,0,Math.PI*2,0,this.range)));
    }
  }

  this.getValue = function(){
    return this.value;
  }
}

function mousePressed(){
  for(var i = 0; i < rings.length; i++){
    if(  mouseX < rings[i].ctrl_position.x + 10
      && mouseX > rings[i].ctrl_position.x - 10
      && mouseY < rings[i].ctrl_position.y + 10
      && mouseY > rings[i].ctrl_position.y - 10 ){
      rings[i].selected = true;
    }else{
      rings[i].selected = false;
    }
  }

  if(  mouseX < speedRing.ctrl_position.x + 10
    && mouseX > speedRing.ctrl_position.x - 10
    && mouseY < speedRing.ctrl_position.y + 10
    && mouseY > speedRing.ctrl_position.y - 10 ){
    speedRing.selected = true;
  }else{
    speedRing.selected = false;
  }

  if(  mouseX < freqRing.ctrl_position.x + 10
    && mouseX > freqRing.ctrl_position.x - 10
    && mouseY < freqRing.ctrl_position.y + 10
    && mouseY > freqRing.ctrl_position.y - 10 ){
    freqRing.selected = true;
  }else{
    freqRing.selected = false;
  }
}

function mouseReleased(){
  for(var i = 0; i < rings.length; i++){
    if(rings[i].selected){
      rings[i].driver = 0;
      rings[i].selected = false;
    }
  }

  if(speedRing.selected){
    speedRing.selected = false;
  }

  if(freqRing.selected){
    freqRing.selected = false;
  }
}

function keyPressed(){
  switch (key) {
    case " ":
      paused = !paused;
      break;
  }
}

function keyTyped(){
  switch (key) {
    case "0":
      rings.map(function(ring){
        ring.theta  = 0;
        ring.driver = 0;
      });
      break;
    case "1":
      osc_type = "triangle";
      rings.map(function(ring){
        if(ring.selected){
          ring.osc_type = osc_type;
          ring.osc.setType(ring.osc_type);
        }
      });
      break;
    case "2":
      osc_type = "sine";
      rings.map(function(ring){
        if(ring.selected){
          ring.osc_type = osc_type;
          ring.osc.setType(ring.osc_type);
        }
      });
      break;
    case "3":
      osc_type = "square";
      rings.map(function(ring){
        if(ring.selected){
          ring.osc_type = osc_type;
          ring.osc.setType(ring.osc_type);
        }
      });
      break;
    case "4":
      osc_type = "sawtooth";
      rings.map(function(ring){
        if(ring.selected){
          ring.osc_type = osc_type;
          ring.osc.setType(ring.osc_type);
        }
      });
      break;
  }
}

function drawOscTypes(osc_type,ctrl_position){
  translate(ctrl_position.x,ctrl_position.y);
  fill(255);

  var s_size = 10;

  switch (osc_type) {
    case "triangle":
      triangle(
        -s_size , s_size,
        s_size , s_size,
        0, -s_size
      )
      break;
    case "square":
      quad(-s_size,-s_size,-s_size,s_size,s_size,s_size,s_size,-s_size)
      break
    case "sine":
      ellipse(0,0,s_size)
      break;
    case "sawtooth":
      // strokeWeight(2);
      line(-s_size,-s_size,-s_size,s_size);
      line(-s_size,s_size,s_size,-s_size);
      line(s_size,-s_size,s_size,s_size);
      // strokeWeight(1);
      break;
  }
  noFill();
  translate(-ctrl_position.x,-ctrl_position.y);
}

function drawGUI(){
  textAlign(LEFT);
  textSize(52);
  fill(0);
  text("ringchord",20,60);
  textSize(12);
  text("drag nodes to adjust overtone series.",20,100);
  text("press space to sweep frequencies",20,120);
  text("hold a node and click 1, 2, 3, 4 to change oscillator type.",20,140);
  text("(1: triangle) (2: sine) (3: square) (4: sawtooth)",20,160);

  textSize(10);
  text("by Austin Slominski (aceslowman)",20,180);

  textAlign(RIGHT);
  textSize(22);
  fill(0);
  if(midi_isRunning){
    text("MIDI connected",width - 20, 60);
  }else{
    text("MIDI not connected",width - 20, 60);
    textSize(12);
    text("Press a MIDI key to connect",width - 20, 80);
  }
  textSize(12);

  speedRing.update();
  speedRing.display();
  speed = speedRing.getValue();

  freqRing.update();
  freqRing.display();
  base_frequency = freqRing.getValue();
}

function drawAlignmentCompass(){
  translate(width/2,height/2);

  stroke(0,0,0,60);
  noFill();

  text("Θ = 0", max_size+15,5);

  //Main Boundary
  ellipse(0,0,(max_size));

  //Alignment Lines
  line(0,0,0,max_size);
  line(0,0,max_size,0);
  line(0,0,0,-max_size);
  line(0,0,-max_size,0);

  rotate(Math.PI/4);
  line(0,0,0,max_size);
  line(0,0,max_size,0);
  line(0,0,0,-max_size);
  line(0,0,-max_size,0);

  rotate(Math.PI/8);
  line(0,0,0,max_size*0.75);
  line(0,0,max_size*0.75,0);
  line(0,0,0,-max_size*0.75);
  line(0,0,-max_size*0.75,0);

  rotate(Math.PI/4);
  line(0,0,0,max_size*0.75);
  line(0,0,max_size*0.75,0);
  line(0,0,0,-max_size*0.75);
  line(0,0,-max_size*0.75,0);
  stroke(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

//MATH UTILITIES

function getDistance(x1,y1,x2,y2){
  return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}
