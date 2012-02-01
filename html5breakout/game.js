
//created by Ariel Krakowski and Ariel Di Segni

var WIDTH = 394;
var HEIGHT = 300;
var x = Math.floor(WIDTH/2);
var y = HEIGHT+1;
var paddlex = WIDTH/2;
var paddledx = WIDTH/75;
var paddlewidth = WIDTH/8; 
var dx = 1;
var dy = -4;
var intervalID = 0;
var canvas, ctx;
var rightDown = false;
var leftDown = false;

var windowMinX = 0;
var windowMaxX = 0;
var NROWS = 6;  
var NCOLS = 8;

var OFFSET = 10; //moves bricks off side
var TOPOFFSET = 28;
var PADDING = 4;
var BRICKWIDTH = Math.floor(((WIDTH-(OFFSET*2))/NCOLS))-PADDING;
var BRICKHEIGHT = 15;

var bricks;

var inplay =false;


var TOPSCORE = NCOLS*(NROWS-1)*(NROWS)/2; //SETs TO MAX POSIB SCORE
var INITLIVES = 3;   
var lives = INITLIVES;
var score =0;
var totalscore =0; 
var time = 0.0;
var level = 1; 

var ballr = 5;
var rowcolors = ["#000000", "#FF0000", "#FF3F00", "#FF7F00", "#FFCF00", "#FFFF00"];
var paddlecolor = "#B0B0FF";
var ballcolor = "#C0C0C0";  //"#FFFFFF"


function init() {
    x = WIDTH/2;
    y = HEIGHT-35;
    dx = 1;
    dy = -(3+level); 
    paddlex = WIDTH/2;
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    windowMinX = $("#canvas").offset().left;
    windowMaxX = windowMinX + $("#canvas").width();
    initbricks();
    draw();
}

function initbricks() {
    bricks = new Array(NROWS);
    for (i=0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (j=0; j < NCOLS; j++) {
            bricks[i][j] = 5-i;  //4
        }
    }
}


function pause(){	
	document.getElementById('info').innerHTML ="paused";
	clearInterval(intervalID);
	
}



//different initializers

//runs regular reset, but changes constants and keep totalscore & lives
function nextlevel(){
	//add bonus
		if(time<300){
			bonustime = (325-time)/5;
		}
		else{
			bonustime=5;
		}
	bonusscore = Math.floor(lives*bonustime);
	
   totalscore=totalscore+score+bonusscore;
	level++;
	document.getElementById('info').innerHTML = "Good Job! Bonus Points: "+bonusscore;
	document.getElementById('level').innerHTML = level;
	document.getElementById('totalscore').innerHTML = totalscore;
	paddlewidth = paddlewidth -4;  	
	abort();	
}

// works to resume from pause, to resume after out, to start initial game, to start new game, to start new level. does nothing to game during play 
function startdraw() {

	//test information
	//document.getElementById('info').innerHTML = "x:"+x+" y:"+y; 

	document.getElementById('info').innerHTML = "Enjoy!";
	
	 clearInterval(intervalID);
	 
	 //sets interval to repeat draw every 20ms
    intervalID = setInterval(draw, 20);	 
	 
	 //don't reset if from pause or during gameplay
  if(y>=HEIGHT-25){
	 x = WIDTH/2;
    y = HEIGHT-35; 
	 dy= -Math.abs(dy); //send ball up	 
	 
  }
	 
	 //restart if no lives left
	 if(lives<1){	
	 lives = INITLIVES;
	 totalscore=0;
	 abort();	 
	 }	 
}

function abort() {
    clearInterval(intervalID);
    init();	 
	 
	 document.getElementById('lives').innerHTML = lives;
	 document.getElementById('level').innerHTML = level;
	 score=0;	 
	 time = 0;	 
	 updateLabels();
}

function draw() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);

    //draw ball & paddle
	 drawBall();   

    //draw bricks every time
	 drawBricks();
	    
    //update x and y
    x += dx;
    y += dy;

	 //check for all collisions
	 checkCollisions();
	 
	 //update time
	 time = time + 1;
	 if(time%50 === 0){
		//update labels each second
		updateLabels();
         }
	 
	 
}

function updateLabels(){
	document.getElementById('time').innerHTML = (time/50);
	//any other messages
	document.getElementById('score').innerHTML = score;
	document.getElementById('totalscore').innerHTML = totalscore;
}



function drawBall(){
	//draw ball
	 ctx.fillStyle = ballcolor;
    ctx.beginPath();
    ctx.arc(x,y,ballr,0,Math.PI*2,true); 
    ctx.fill();
    
    //draw paddle
	 ctx.fillStyle = paddlecolor;
    px = paddlex - paddlewidth / 2;
    ctx.fillRect(px, HEIGHT-30, paddlewidth, 7);
}

function drawBricks(){
	for (i=0; i < NROWS; i++) {		
        for (j=0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
				ctx.fillStyle = rowcolors[bricks[i][j]]; //sets color based on hits
                ctx.fillRect((j * (BRICKWIDTH + PADDING)) + PADDING +OFFSET, 
                             (i * (BRICKHEIGHT + PADDING)) + PADDING +TOPOFFSET,
                             BRICKWIDTH, 
									  BRICKHEIGHT); //x,y,width,height
            }
        }
    }

}


function brickHit(){
		  score++; //point for every hit		  
		  document.getElementById('score').innerHTML = score;
		  
		  if(score>=TOPSCORE){
		  nextlevel();
		  }

}

function checkBrickCollisions(){
	 rowheight = BRICKHEIGHT + PADDING; 
    colwidth = BRICKWIDTH + PADDING;
	 rowexact = (y-TOPOFFSET)/rowheight;
    row = Math.floor(rowexact); // ball position in brick array	
	 colexact = (x-OFFSET)/colwidth;
    col = Math.floor(colexact);
	 Yrem = rowexact-row;
	 Xrem = colexact-col;	


		// check corner point with Math.atan2(y,x) to see which side ball hit
		// or just see which side closer too (since ball only moves small amount) 
		// once this is fixed game will be OK. 
	
		if (y < TOPOFFSET + NROWS * rowheight && y>TOPOFFSET
        && row >= 0 && col >= 0
	 && bricks[row][col] > 0) { //there is a collision 			
			 
			 if( (Yrem>Xrem&&dy>0&&dx>0) || (Yrem<Xrem&&dy<0&&dx<0) ){ 
					dx=-dx;
					bricks[row][col]--;
					brickHit();
			}  		
			
			else{ //collision is on top or bottom			
							dy=-dy;
							bricks[row][col]--;
							brickHit();	

//test document.getElementById('info').innerHTML += "<br> row:"+row + " "+ Yrem+ " col:" +col +" " +Xrem + " diff:"+(Xrem-Yrem);								
			}			
		
}

}

	 
function checkCollisions(){

if( checkBrickCollisions()){
	}
    //checks for wall collision
    else if (x > WIDTH-ballr || x < 0+ballr) {
        x -= 2*dx;
        dx = -dx;
    }
	 
    //have we hit a paddle
    if (y > HEIGHT-32 && y<HEIGHT-26 && x > px && x < px + paddlewidth) {
	 
	 //two equations for bounce 
		pdlb = 8 * ((x-(px+paddlewidth/2))/paddlewidth);  //based on where hits paddle.  
		if(document.getElementById('accurate').checked){
      //combine dx and pdlB
		 dx = 0.3*dx + 0.7*pdlb;	   
      //console.log(x.toString() +"|"+ px.toString());
		}
		else{ //run 'random' bounce method
		//dx = Math.floor(Math.random()*3+dx*0.3+ pdlb*0.3);
		tmpX = (dx / dy) * (272 - y) + x;
                    //ballY = 272; ballDY = -ballDY;
                    ballX = tmpX;
                    ballRD = tmpX - paddlex;
                    //dx = 8 * Math.abs(dx) / dx; 
                    if (ballRD < -3){ dx = -3; }
                    if (ballRD > 36){ dx = 3; }
                    if (ballRD >= 14 && ballRD <= 16) { dx = -0.75; } 
                    if (ballRD >= 17 && ballRD <= 20) { dx = 0.75; } 
                    if (ballRD >= 0 && ballRD <= 4) { dx = -1.3; } 
                    if (ballRD >= 28 && ballRD <= 32) { dx = 1.3; } 
                    if (ballRD >= -4 && ballRD <= -1) { dx = -2; } 
                    if (ballRD >= 33 && ballRD <= 36) { dx = 2; } 
		}
		
      y -= 2*dy;
      dy = -dy;
    }	 
    //or the ceiling
    else if (y < 0) {
        y -= 2*dy;
        dy = -dy;
    }	 
    else if (y > HEIGHT-10) {
        lives--;
		  
		  document.getElementById('lives').innerHTML = lives;
		  
		  clearInterval(intervalID);
		  if(lives<1){   
		  totalscore = totalscore+score;
		  document.getElementById('info').innerHTML = "Game Over! " + "Your Total Score: "+ totalscore;
		  level=1; //mv
		  //restart 
		  }		  
    }

    if (leftDown)
        paddlex -= paddledx;
    else if (rightDown)
        paddlex += paddledx;
}

//useful for testing. 
function destroymostbricks(){	
	
    for (i=0; i < NROWS-2; i++) {  //leave bottom row set to NROWS-2         
        for (j=0; j < NCOLS; j++) {
            bricks[i][j] = 0; 
        }
    }
	 
	 score = TOPSCORE-2;
	 
}



//can adjust
function doKeyDown(evt) {
    //right is 39 left is 37
    if (evt.keyCode == 39) {
        rightDown = true;
    }
    else if (evt.keyCode == 37) {
        leftDown = true;
    }
}

function doKeyUp(evt) {
    if (evt.keyCode == 39) {
        rightDown = false;
    }
    else if (evt.keyCode == 37) {
        leftDown = false;
    }
}

//adjusted mouse so can go to side fully
function mousemove(evt) {
    minX = evt.pageX;
    maxX = evt.pageX;
    if (minX > windowMinX && maxX < windowMaxX) {
        paddlex = evt.pageX - windowMinX;
    }
}

function touchmove(evt) {
    if (evt.touches.length==1) {
        paddlex = evt.touches[0].pageX - windowMinX;
    }
}

window.addEventListener('keydown',doKeyDown,false);
window.addEventListener('keyup',doKeyUp,false);
window.addEventListener('mousemove',mousemove,false);
window.addEventListener('touchmove',touchmove,false);

