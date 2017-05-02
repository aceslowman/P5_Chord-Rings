var rings = [];

function setup(){
  //create our canvas, which will match our window width and height
  createCanvas(window.innerWidth,window.innerHeight);

  //set the ellipseMode so that we position our rings using the CENTER of the ellipse
  ellipseMode(RADIUS);

  for(var i = 0; i < 3; i++){
    rings.push(new Ring(50*(i+1)));
  }
}

function draw(){
  //clear the screen for each frame
  background(255);

  for(var i = 0; i < rings.length; i++){
    rings[i].display();
  }
}

function Ring(size){
  this.radius = size;
  this.center = createVector(width/2,height/2);
  this.theta  = -Math.PI; //-Math.PI to set to 0
  this.ctr_position = createVector();
  this.ctr_position.x = this.radius*cos(this.theta) + this.center.x;
  this.ctr_position.y = this.radius*sin(this.theta) + this.center.y;

  this.osc = new p5.Oscillator();
  this.osc.setType('sine');
  this.osc.freq(0);
  this.osc.amp(0.2);
  this.osc.start();


  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);

    ellipse(this.ctr_position.x,this.ctr_position.y,10);

    textAlign(CENTER);
    text(Math.floor(this.theta * 180 / Math.PI)+180, this.center.x, this.center.y);
    // text(this.theta, this.center.x, this.center.y);
  }

  this.update = function(){
    //get angle between mouse and center of ring...
    //(Math.toDegrees( Math.atan2(fromLeft - 360.0, 360.0 - fromTop) ) + 360.0) % 360.0
    // atan2(y - cy, x - cx)
    this.theta = Math.atan2(mouseY - this.center.y, mouseX - this.center.x);

    console.log(this.theta);

    this.ctr_position.x = this.radius*cos(this.theta) + this.center.x;
    this.ctr_position.y = this.radius*sin(this.theta) + this.center.y;

    //now lets update the oscillator
    this.osc.freq(Math.floor(this.theta * 180 / Math.PI)+180);
  }
}

function mouseDragged() {
  for(var i = 0; i < rings.length; i++){
    if(
      mouseX < rings[i].ctr_position.x + 10 && mouseX > rings[i].ctr_position.x - 10 &&
      mouseY < rings[i].ctr_position.y + 10 && mouseY > rings[i].ctr_position.y - 10
    ){
      rings[i].update();
    }
  }
}
