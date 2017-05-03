var rings = [];
var paused;
var speed;
var osc_type = "square";

function setup(){
  createCanvas(window.innerWidth,window.innerHeight);

  ellipseMode(RADIUS);

  for(var i = 0; i < 3; i++){
    rings.push(new Ring(80*(i+1)));
  }

  paused = true;
  speed  = 4;
}

function draw(){
  background(255);

  stroke(0);
  line(width/2,height/2,width/2 + (80*rings.length),height/2);
  text("Θ = 0", width/2 + (80*rings.length) + 30, height/2 + 4);



  for(var i = 0; i < rings.length; i++){
    rings[i].update();
    rings[i].display();
  }


  drawInstructions();
  drawOscTypes();
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
  this.theta  = -Math.PI/2; //-Math.PI to set to 0
  this.rotation_speed = 10;
  this.offset = 0;

  //sound
  this.frequency = 0;

  this.osc = new p5.Oscillator();
  this.osc.setType(osc_type);
  this.osc.freq(this.frequency);
  this.osc.amp(0.2);
  this.osc.start();

  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);

    if(this.selected){
      fill(0);
    }else{
      fill(255);
    }

    line(this.center.x,this.center.y,this.ctrl_position.x,this.ctrl_position.y);

    ellipse(this.ctrl_position.x,this.ctrl_position.y,10);
    noFill();

    textAlign(CENTER);
    text(Math.floor(this.frequency)+" hz", this.ctrl_position.x, this.ctrl_position.y-15);
    text("Θ = "+this.theta.toFixed(2), this.ctrl_position.x, this.ctrl_position.y+25);
  }

  this.update = function(){
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

    this.frequency = (Math.abs(this.theta) * 200);

    this.osc.freq(this.frequency);
    this.osc.amp(this.radius/(width/2));
  }
}

function mousePressed(){
  for(var i = 0; i < rings.length; i++){
    if( mouseX < rings[i].ctrl_position.x + 10 && mouseX > rings[i].ctrl_position.x - 10 && mouseY < rings[i].ctrl_position.y + 10 && mouseY > rings[i].ctrl_position.y - 10 ){
      rings[i].selected = true;
    }else{
      rings[i].selected = false;
    }
  }
}

function mouseReleased(){
  for(var i = 0; i < rings.length; i++){
    if(rings[i].selected){
      rings[i].driver = 0;
      rings[i].selected = false;
    }
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
        ring.offset = 0;
      });
      break;
    case "1":
      osc_type = "triangle";
      rings.map(function(ring){
        ring.osc.setType(osc_type);
      });
      break;
    case "2":
      osc_type = "sine";
      rings.map(function(ring){
        ring.osc.setType(osc_type);
      });
      break;
    case "3":
      osc_type = "square";
      rings.map(function(ring){
        ring.osc.setType(osc_type);
      });
      break;
  }
}

function drawOscTypes(){
  translate(width/2,height/2);
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
  }
  noFill();
}

function drawInstructions(){
  textAlign(LEFT);
  text("Press 0 to return theta to 0",50,50);
  text("Press Spacebar to pause",50,100);
  text("Press 1,2,3 to cycle oscillators",50,150);
  text("R1 Volume: "+rings[0].osc.output.gain.value,50,300);
}

//MATH UTILITIES

function getDistance(x1,y1,x2,y2){
  return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}
