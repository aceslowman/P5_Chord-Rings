var rings = [];
var driver;
var paused;
var osc_type = "square";

function setup(){
  //create our canvas, which will match our window width and height
  createCanvas(window.innerWidth,window.innerHeight);

  //set the ellipseMode so that we position our rings using the CENTER of the ellipse
  ellipseMode(RADIUS);

  for(var i = 0; i < 5; i++){
    rings.push(new Ring(80*(i+1)));
  }

  paused = true;
}

function draw(){
  //clear the screen for each frame
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
  this.radius = size;
  this.center = createVector(width/2,height/2);
  this.theta  = -Math.PI/2; //-Math.PI to set to 0
  this.ctr_position = createVector();
  this.ctr_position.x = this.radius*cos(this.theta) + this.center.x;
  this.ctr_position.y = this.radius*sin(this.theta) + this.center.y;

  this.osc = new p5.Oscillator();
  this.osc.setType(osc_type);
  this.osc.freq(0);
  this.osc.amp(0.2);
  this.osc.start();

  this.frequency = 0;
  this.rotation_speed = 10;

  this.selected = false;
  this.driver = 0;
  this.offset = 0;

  this.display = function(){
    stroke(0);
    noFill();
    ellipse(this.center.x,this.center.y,this.radius);

    if(this.selected){
      fill(0);
    }else{
      fill(255);
    }

    ellipse(this.ctr_position.x,this.ctr_position.y,10);
    noFill();

    textAlign(CENTER);
    text(Math.floor(this.frequency)+" hz", this.ctr_position.x, this.ctr_position.y-15);
    text("Θ = "+this.theta.toFixed(2), this.ctr_position.x, this.ctr_position.y+25);
    // text(Math.floor(this.theta * 180 / Math.PI)+180, this.ctr_position.x, this.ctr_position.y-15);
  }

  this.update = function(){
    if(this.selected){
      //set the control point based on
      // this.theta = Math.atan2(mouseY - this.center.y, mouseX - this.center.x);
      this.theta = 0;
      this.offset = Math.atan2(mouseY - this.center.y, mouseX - this.center.x);
    }else{
      //the existing theta
      if(!paused){
        this.driver++;
      }
              this.theta = this.driver/100;
    }

    this.ctr_position.x = this.radius * cos(this.theta + this.offset) + this.center.x;
    this.ctr_position.y = this.radius * sin(this.theta + this.offset) + this.center.y;

    this.theta = Math.atan2(this.ctr_position.y - this.center.y, this.ctr_position.x - this.center.x);

    // convert theta to frequency
    // this.frequency = (((sin(this.theta)+1)/2)*100)+200;
    this.frequency = (Math.abs(this.theta) * 200);
    this.osc.freq(this.frequency);
  }
}

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
    if(rings[i].selected){
      rings[i].driver = 0;
      rings[i].selected = false;
    }
  }
}

function keyPressed(){
  if(key == " "){
    paused = !paused;
  }
}

function keyTyped(){
  if(key == 1){
    osc_type = "triangle";
  }else if(key == 2){
    osc_type = "sine";
  }else if(key == 3){
    osc_type = "square";
  }

  if(key == "0"){
    for(var i = 0; i < rings.length; i++){
      rings[i].theta = 0;
      rings[i].driver = 0;
      rings[i].offset = 0;
    }
  }

  for(var i = 0; i < rings.length; i++){
    rings[i].osc.setType(osc_type);
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
  textAlign(CENTER);
}
