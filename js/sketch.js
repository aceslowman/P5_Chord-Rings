var rings = [];
var driver;

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
    rings[i].update();
    rings[i].display();
  }
}

function Ring(size){
  this.radius = size;
  this.center = createVector(width/2,height/2);
  this.theta  = -Math.PI/2; //-Math.PI to set to 0
  this.ctr_position = createVector();
  this.ctr_position.x = this.radius*cos(this.theta) + this.center.x;
  this.ctr_position.y = this.radius*sin(this.theta) + this.center.y;

  this.osc = new p5.Oscillator();
  this.osc.setType('triangle');
  this.osc.freq(0);
  this.osc.amp(0.2);
  this.osc.start();

  this.frequency = 0;
  this.rotation_speed = 10;

  this.selected = false;

  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);

    ellipse(this.ctr_position.x,this.ctr_position.y,10);

    textAlign(CENTER);
    text(Math.floor(this.frequency)+" hz", this.ctr_position.x, this.ctr_position.y-15);
    // text(Math.floor(this.theta * 180 / Math.PI)+180, this.ctr_position.x, this.ctr_position.y-15);
  }

  this.update = function(){
    if(this.selected){
      //get angle between mouse and center of ring...
      //(Math.toDegrees( Math.atan2(fromLeft - 360.0, 360.0 - fromTop) ) + 360.0) % 360.0
      // atan2(y - cy, x - cx)

      //how do I allow the ball to move over time? I can probably build the lfo...
      this.theta = Math.atan2(mouseY - this.center.y, mouseX - this.center.x);

      // this.ctr_position.x = this.radius * cos(this.theta) + this.center.x;
      // this.ctr_position.y = this.radius * sin(this.theta) + this.center.y;

      //now lets update the oscillator
      // var frequency = Math.floor(this.theta * 180 / Math.PI)+180;
      // this.frequency = ((sin(this.theta)+1)/2)*400;

      // this.osc.freq(this.frequency);
    }

    // this.theta = this.theta + sin(millis()/10);

    this.ctr_position.x = this.radius * cos(this.theta) + this.center.x;
    this.ctr_position.y = this.radius * sin(this.theta) + this.center.y;

    this.frequency = ((sin(this.theta)+1)/2)*400;
    this.osc.freq(this.frequency);
  }
}

// function mouseDragged() {
//   // for(var i = 0; i < rings.length; i++){
//   //   rings[i].update();
//   // }
// }

function mousePressed(){
  for(var i = 0; i < rings.length; i++){
    if( mouseX < rings[i].ctr_position.x + 10 && mouseX > rings[i].ctr_position.x - 10 && mouseY < rings[i].ctr_position.y + 10 && mouseY > rings[i].ctr_position.y - 10 ){
      rings[i].selected = true;
    }else{
      rings[i].selected = false;
    }
  }
}

function mouseReleased(){
  for(var i = 0; i < rings.length; i++){
    rings[i].selected = false;
  }
}
