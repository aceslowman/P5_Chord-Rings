var ring;

function setup(){
  createCanvas(window.innerWidth,window.innerHeight);

  ring = new Ring("MyName",width/2,height/2,50,100,50);
}

function draw(){
  background(255);
  ring.display();
}

function Ring(name,x,y,radius,range,def){
  this.radius = radius;
  this.theta  = 2;

  this.center = createVector(x,y);

  this.ctrl_position = createVector(
    this.radius*cos(this.theta) + this.center.x,
    this.radius*sin(this.theta) + this.center.y
  );

  this.selected = false;

  this.color = color(255,0,0);

  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);

    this.selected ? fill(0) : fill(this.color);

    line(this.center.x,this.center.y,this.ctrl_position.x,this.ctrl_position.y);

    controlShape("sine",this.ctrl_position);

    noFill();
    textAlign(CENTER);
    text(Math.floor(this.frequency)+" hz", this.ctrl_position.x, this.ctrl_position.y-15);
    text("Θ = "+this.theta.toFixed(2), this.ctrl_position.x, this.ctrl_position.y+25);
  };

  this.update  = function(){

  };
}

function controlShape(type,position){
  translate(position.x,position.y);
  fill(255);

  var s = 10;

  switch (type) {
    case "triangle":
      triangle(
        -s , s,
        s , s,
        0, -s
      )
      break;
    case "square":
      quad(-s,-s,-s,s,s,s,s,-s)
      break
    case "sine":
      ellipse(0,0,s)
      break;
  }
  noFill();
  translate(-position.x,-position.y);
}


this.display = function(){
  stroke(0);
  noFill();
  ellipse(this.center.x,this.center.y,this.radius);

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
}
