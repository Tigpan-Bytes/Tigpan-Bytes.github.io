// Birbs/Boids
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - more complicated than expected of cs30 because it deals with classes and whatnot
// - Gui for editing rules
// - decently complicated to implement all of the rules


//Vector2 code was taken from github and modifiyed https://gist.github.com/Dalimil/3daf2a0c531d7d030deb37a7bfeff454,
function Vector2(x, y) {
	this.x = x;
	this.y = y;
}

Vector2.prototype = {
	add: function(vector) {
		return new Vector2(this.x + vector.x, this.y + vector.y);
	},

	subtract: function(vector) {
		return new Vector2(this.x - vector.x, this.y - vector.y);
	},

	multiply: function(scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	},

	divide: function(scalar) {
		return new Vector2(this.x / scalar, this.y / scalar);
	},

	magnitude: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	moveTowards: function(vector, delta) {
		delta = Math.min(delta, 1);
		let diff = vector.subtract(this);
		return this.add(diff.multiply(delta));
	},

	normalize: function() {
		let mag = this.magnitude();
		this.x /= mag;
		this.y /= mag;
		return this;
	},

	rotate: function(alpha) {
		let cos = Math.cos(alpha);
		let sin = Math.sin(alpha);
		let vector = new Vector2();
		vector.x = this.x * cos - this.y * sin;
		vector.y = this.x * sin + this.y * cos;
		return vector;
	},
}
//Vector2 code was taken from github and modifiyed https://gist.github.com/Dalimil/3daf2a0c531d7d030deb37a7bfeff454.

class Birb 
{
	constructor(speed, scaredSight, sight, scale, seperationForce, alignmentForce, cohesionForce, targetForce) 
	{
	  this.position = new Vector2(random(windowWidth), random(windowHeight));
	  this.direction = new Vector2(Math.random() * 2 - 1, Math.random() * 2 - 1);

	  this.direction.normalize();
	  
	  this.scale = scale;
	  this.render();

	  this.speed = speed;

	  this.scaredSight = scaredSight;
	  this.sight = sight;

	  this.seperationForce = seperationForce;
	  this.alignmentForce = alignmentForce;
	  this.cohesionForce = cohesionForce;
	  this.targetForce = targetForce;
	}

	render()
	{
		return triangle(
			this.position.x + this.direction.rotate(-84.2).x * this.scale, this.position.y + this.direction.rotate(-84.2).y * this.scale, 
			this.position.x + this.direction.rotate(84.2).x * this.scale, this.position.y + this.direction.rotate(84.2).y * this.scale, 
			this.position.x + this.direction.x * this.scale, this.position.y + this.direction.y * this.scale
		);
	}

	renderSightOne()
	{
		return ellipse(this.position.x, this.position.y, this.sight * 2);
	}

	renderSightTwo()
	{
		return ellipse(this.position.x, this.position.y, this.scaredSight * 2);
	}

	wrap()
	{
		this.position = new Vector2((this.position.x + windowWidth) % windowWidth, (this.position.y + windowHeight) % windowHeight);
	}

	distance(a, b)
	{
		let deltaX = a.x - b.x;
		let deltaY = a.y - b.y;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}

	update(birbs) 
	{
		//Get all other birbs in sight
		let inSightBirbs = new Array();
		for (let i = 0; i < birbs.length; i++)
		{
			if (this.distance(this.position, birbs[i].position) < this.sight && birbs[i] != this)
			{
				inSightBirbs.push(birbs[i]);
			}
		}

		//Get all other birbs in scared sight
		let inScaredBirbs = new Array();
		for (let i = 0; i < inSightBirbs.length; i++)
		{
			if (this.distance(this.position, inSightBirbs[i].position) < this.scaredSight)
			{
				inScaredBirbs.push(inSightBirbs[i]);
			}
		}

		if (inSightBirbs.length > 0)
		{
			//Alignment forces
			let alignment = new Vector2(0,0);
			for (let i = 0; i < inSightBirbs.length; i++)
			{
				alignment = alignment.add(inSightBirbs[i].direction);
			}

			alignment.normalize();

			//Cohesion forces
			let cohesionAvg = new Vector2(0,0);
			
			for (let i = 0; i < inSightBirbs.length; i++)
			{
				cohesionAvg = cohesionAvg.add(inSightBirbs[i].position);
			}
			cohesionAvg = cohesionAvg.divide(inSightBirbs.length);
			let cohesion = cohesionAvg.subtract(this.position);
			cohesion.normalize();

			//Mouse targeting forces
			let target = new Vector2(0, 0);
			if (mouseIsPressed && (mouseX > 310 || mouseY > 280))
			{
				let mousePos = new Vector2(mouseX, mouseY);
				target = mousePos.subtract(this.position);

				target.normalize();
			}

			//Seperation forces
			if (inScaredBirbs.length > 0)
			{
				let seperation = new Vector2(0,0);
				let closestSep = 9000;
				for (let i = 0; i < inScaredBirbs.length; i++)
				{
					let dist = 1 - (this.distance(this.position, inScaredBirbs[i].position) / scaredSight);
					seperation = seperation.add(this.position.subtract(inScaredBirbs[i].position).multiply(dist));
					if (closestSep < dist)
					{
						closestSep = dist;
					}
				}

				seperation.normalize();
				seperation.multiply + closestSep;
				
				//Adds the direction
				this.direction = this.direction.add(alignment.multiply(this.alignmentForce)).add(cohesion.multiply(this.cohesionForce)).add(seperation.multiply(this.seperationForce)).add(target.multiply(this.targetForce));
				this.direction.normalize();
			}
			else
			{
				//Adds the direction
				this.direction = this.direction.add(alignment.multiply(this.alignmentForce)).add(cohesion.multiply(this.cohesionForce)).add(target.multiply(this.targetForce));
				this.direction.normalize();
			}	
		}
		else if (mouseIsPressed && (mouseX > 310 || mouseY > 280))
		{
			let mousePos = new Vector2(mouseX, mouseY);
			let target = new Vector2(0, 0);

			target = mousePos.subtract(this.position);

			target.normalize();

			//Adds the direction
			this.direction = this.direction.add(target.multiply(this.targetForce));
			this.direction.normalize();
		}

		//Moves the birb
		this.position = this.position.add(this.direction.multiply(this.speed));
		this.wrap();
	}
}

//preset values
let birbCount = 150;
let birbSize = 10;
let birbSpeed = 3;

let sight = 70;
let scaredSight = 40;

let seperationForce = 0.09;
let alignmentForce = 0.05;
let cohesionForce = 0.03;
let targetForce = 0.03;

let birbs;

let countSlider;
let speedSlider;
let seperationSlider;
let alignmentSlider;
let cohesionSlider;
let targetSlider;
let sightSlider;
let scaredSightSlider;
let resetButton;

function setup() 
{
	//caps frames at 60
	frameRate(60);

	reset();

	//Create gui elements
	countSlider = createSlider(10, 700, birbCount, 10);
	countSlider.position(10, 10);
	countSlider.style('width', '100px');

	speedSlider = createSlider(1, 15, birbSpeed, 0.25);
	speedSlider.position(10, 40);
	speedSlider.style('width', '100px');

	seperationSlider = createSlider(0, 1, seperationForce, 0.01);
	seperationSlider.position(10, 70);
	seperationSlider.style('width', '100px');

	alignmentSlider = createSlider(0, 1, alignmentForce, 0.01);
	alignmentSlider.position(10, 100);
	alignmentSlider.style('width', '100px');

	cohesionSlider = createSlider(0, 1, cohesionForce, 0.01);
	cohesionSlider.position(10, 130);
	cohesionSlider.style('width', '100px');

	targetSlider = createSlider(0, 1, targetForce, 0.01);
	targetSlider.position(10, 160);
	targetSlider.style('width', '100px');

	sightSlider = createSlider(0, 300, sight, 10);
	sightSlider.position(10, 190);
	sightSlider.style('width', '100px');

	scaredSightSlider = createSlider(0, 300, scaredSight, 10);
	scaredSightSlider.position(10, 220);
	scaredSightSlider.style('width', '100px');

	resetButton = createButton('Restart');
	resetButton.position(10, 250);
	resetButton.mousePressed(reset);

	defaultButton = createButton('Preset: Default');
	defaultButton.position(80, 250);
	defaultButton.mousePressed(setDefault);
}

function setDefault()
{
	sightSlider.value(70);
	scaredSightSlider.value(40);

	seperationSlider.value(0.09);
	alignmentSlider.value(0.05);
	cohesionSlider.value(0.03);
	targetSlider.value(0.03);

	speedSlider.value(3);

	sight = 70;
	scaredSight = 40;

	seperationForce = 0.09;
	alignmentForce = 0.05;
	cohesionForce = 0.03;
	targetForce = 0.03;

	birbSpeed = 3;

	reset();
}

function reset()
{
	//Basic setup of starting flight area 
	createCanvas(windowWidth, windowHeight);
	birbs = new Array(0);
	for (let i = 0; i < birbCount; i++)
	{
		//Create new instance of birb
		birbs.push(new Birb(birbSpeed, scaredSight, sight < scaredSight ? scaredSight : sight, birbSize, seperationForce, alignmentForce, cohesionForce, targetForce));
	}
}

function draw() 
{
	//draw background colour
	background(0);

	//first birb in red
	stroke(255, 0, 0);
	fill(255, 180, 180);
	birbs[0].render();
	stroke(0, 0, 0);

	//draw birbs sight
	fill('rgba(100%,100%,100%,0.1)');
	birbs[0].renderSightOne();
	fill('rgba(100%,40%,40%,0.1)');
	birbs[0].renderSightTwo();

	//update the first birb
	birbs[0].update(birbs);

	//do the rest of the birbs
	stroke(0, 160, 255);
	fill(180, 255, 230);
	for (let i = 1; i < birbs.length; i++)
	{
		birbs[i].render();
		birbs[i].update(birbs);
	}

	//draw mouse target
	stroke(255, 255, 255);
	fill('rgba(100%,100%,100%,0.1)');
	if (mouseIsPressed && (mouseX > 310 || mouseY > 280))
	{
		ellipse(mouseX, mouseY, 15);
	}

	//then renders gui stuff
	stroke(0, 0);
	fill('rgba(60%,100%,30%,0.6)');
	rect(0,0,310,280);

	birbCount = countSlider.value();
	textSize(20);
	fill(0);
	text('Birb Count: ' + birbCount, 140, 30);

	birbSpeed = speedSlider.value();
	text('Birb Speed: ' + birbSpeed, 140, 60);

	seperationForce = seperationSlider.value();
	text('Seperation: ' + seperationForce, 140, 90);

	alignmentForce = alignmentSlider.value();
	text('Alignment: ' + alignmentForce, 140, 120);

	cohesionForce = cohesionSlider.value();
	text('Cohesion: ' + cohesionForce, 140, 150);

	targetForce = targetSlider.value();
	text('Target: ' + targetForce, 140, 180);

	sight = sightSlider.value();
	text('Sight: ' + sight, 140, 210);

	scaredSight = scaredSightSlider.value();
	text('Scared Sight: ' + scaredSight, 140, 240);
}