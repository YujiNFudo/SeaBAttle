var db,selectedDB,numberOfDB,right,picked;
var socket = io();
socket.on('news', function (data) {
	db = data.hello;
});

for(var i in db) {
	if (db[i].type[0]==document.querySelector('select').value) {
		selectedDB.push(db[i]);
	}
}

var textarea = document.querySelector('#textarea');

var gameFunctions = {
	start: function() {
		textarea.innerHTML = 'Вы начали игру';

		if (selectedDB==undefined) {
			document.querySelector('.selectedDB').innerHTML = 'Выберете тему вопросов перед игрой';
			return false;
		}
		
		for(var i = 0;i<10;i++) {
			comp.randomShips(squad[1].splice(0,1)[0],i);
		}
		battle.genBattlePoints();

		document.querySelector('.second').style.display = 'block';
		document.querySelector('.first').style.display = 'none';

	},
	stayRandom: function() {
		for(var i = 0;i<10;i++) {
			user.randomShips(squad[0].splice(0,1)[0],i);
			playerTurn = true;
		}
		document.querySelector('.second').style.display = 'none';
		document.querySelector('.third').style.display = 'block';
	},
	createMatrix: function() {
		var arr = [];
		for (var i = 0;i<10;i++) {
			arr.push([]);
			for (var j = 0;j<10;j++) {
				arr[i].push(0);
			}
		};

		return arr;
	},
	rand: function(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min;
	},
	compareRandom: function(a, b) {
	  return Math.random() - 0.5;
	},
	findShip: function(x,y,ent) {
		for(var i = 0; i<ent.squadron.length;i++) {
			if (ent.squadron[i]==undefined) continue;
			for(var j = 0;j<ent.squadron[i].matrix.length;j++) {
				if (y == ent.squadron[i].matrix[j][0]&& x == ent.squadron[i].matrix[j][1]) return ent.squadron[i];
			}
		}
	},
	deleteCell: function(x,y) {
		for(var i = 0;i<battle.masPoints.length;i++) {
			if (x == battle.masPoints[i][0]&&y == battle.masPoints[i][1]) {
				battle.masPoints.splice(i,1);
				return true;
			}
		}
	},
	getMouseXY: function(ent) {
		var cs = (((fSize + deckMult*9)*2+fMargin+1) - ent.x)/10;

		var posX = mouseX - ent.x;
		var posY = mouseY - ent.y;

		var x = posX/cs^0;
		var y = posY/cs^0;

		// posX-=x*deckMult;
		// posY-=y*deckMult;

		// x = posX/cellSize^0;
		// y = posY/cellSize^0;
		

		return [x,y];
	},
	openQuestWindow: function() {
		var winA = document.querySelector('#questArea');
		var winW = document.querySelector('#questWindow');

		numberOfDB = this.rand(0,selectedDB.length);

		var answs = document.querySelectorAll('.answ');

		document.querySelector('#questHeader').innerHTML = selectedDB[numberOfDB].name;

		answs[0].innerHTML = selectedDB[numberOfDB].answ1;
		answs[1].innerHTML = selectedDB[numberOfDB].answ2;
		answs[2].innerHTML = selectedDB[numberOfDB].answ3;
		answs[3].innerHTML = selectedDB[numberOfDB].answ4;

		// добавляем в-сы

		winA.style.display = 'block';
	},
	changeDB: function(text) {
		selectedDB = [];
		for(var i in db) {
			if (db[i].type[0]==text) {
				selectedDB.push(db[i]);
			}
		}
		document.querySelector('.selectedDB').innerHTML = 'Выбранная база - ' + text;
	},
	arrShoot: function(enemy,ship) {
		var ship = ship;
		var x = ship.y;
		var y = ship.x;
		var decks = ship.decks;
		var rot = ship.rot;
		var actor = (enemy==comp) ? user:comp;

		var fx,fy,tx,ty;

		fx = (x==0)?x:x-1;
		fy = (y==0)?y:y-1;

		if (rot==0) {
			tx = (x==9)?x:x+1;
			ty = (y+decks-1==9)?y+decks-1:y+decks;
		}
		if (rot==1) {
			tx = (x+decks-1==9)?x+decks-1:x+decks;
			ty = (y==9)?y:y+1;
		}

		for (var i = fx; i < tx+1; i++) {
			for (var j = fy; j < ty+1; j++) {
				if (enemy.matrix[i][j] == 0) enemy.matrix[i][j]=3;
			}
		}
	}
}



var squad = [[1,1,1,1,2,2,2,3,3,4],[1,1,1,1,2,2,2,3,3,4]];
squad[0].sort(gameFunctions.compareRandom);
squad[1].sort(gameFunctions.compareRandom);

var battle;

function Battle() {
	this.startPoints = [[[0,3],[0,7],[2,9],[6,9]],
	 					[[6,0],[2,0],[0,2],[0,6]]]; 
	this.masPoints = [];
	this.battleObj = {
		link: undefined,
		hits: 0,
		type: undefined,
		arroundMas: [],
		firstHit: [],
		lastHit: []
	};
	this.resetBattleObj = function() {
		this.battleObj = {
			link: undefined,
			hits: 0,
			type: undefined,
			arroundMas: [],
			firstHit: [],
			secondHit: [],
			thirdHit: []
		};
	};
	this.arroundMasGenPoints = function() {
		var fx,fy,sx,sy,tx,ty;

		fx = this.battleObj.firstHit[0];
		fy = this.battleObj.firstHit[1];

		if (this.battleObj.hits == 1) {
			this.battleObj.arroundMas.push([fx,fy-1]);
			this.battleObj.arroundMas.push([fx+1,fy]);
			this.battleObj.arroundMas.push([fx,fy+1]);
			this.battleObj.arroundMas.push([fx-1,fy]);
		}
		if (this.battleObj.hits == 2) {

			sx = this.battleObj.secondHit[0];
			sy = this.battleObj.secondHit[1];

			var fNum = fx + fy*10;
			var sNum = sx + sy*10;

			var res = Math.abs((sNum-fNum)%10);

			if (res==0) this.battleObj.type = 0;
			else 		this.battleObj.type = 1;

			if (this.battleObj.type == 0) {
				this.battleObj.arroundMas.push([fx,fy+1]);
				this.battleObj.arroundMas.push([fx,fy-1]);
				this.battleObj.arroundMas.push([sx,sy+1]);
				this.battleObj.arroundMas.push([sx,sy-1]);
			} 
			else if (this.battleObj.type == 1) {
				this.battleObj.arroundMas.push([fx+1,fy]);
				this.battleObj.arroundMas.push([fx-1,fy]);
				this.battleObj.arroundMas.push([sx+1,sy]);
				this.battleObj.arroundMas.push([sx-1,sy]);
			}
		}
		if (this.battleObj.hits == 3) {

			tx = this.battleObj.thirdHit[0];
			ty = this.battleObj.thirdHit[1];

			sx = this.battleObj.secondHit[0];
			sy = this.battleObj.secondHit[1];

			if (this.battleObj.type == 0) {
				this.battleObj.arroundMas.push([fx,fy+1]);
				this.battleObj.arroundMas.push([fx,fy-1]);
				this.battleObj.arroundMas.push([sx,sy+1]);
				this.battleObj.arroundMas.push([sx,sy-1]);
				this.battleObj.arroundMas.push([tx,ty+1]);
				this.battleObj.arroundMas.push([tx,ty-1]);
			} 
			else if (this.battleObj.type == 1) {
				this.battleObj.arroundMas.push([fx+1,fy]);
				this.battleObj.arroundMas.push([fx-1,fy]);
				this.battleObj.arroundMas.push([sx+1,sy]);
				this.battleObj.arroundMas.push([sx-1,sy]);
				this.battleObj.arroundMas.push([tx+1,ty]);
				this.battleObj.arroundMas.push([tx-1,ty]);
			}
		}

		this.battleObj.arroundMas.sort(gameFunctions.compareRandom);
	};
	this.genBattlePoints = function() {
		var battleMatrix = gameFunctions.createMatrix();
		for(var i = 0;i<this.startPoints.length;i++) {
			for(var j = 0;j<this.startPoints[0].length;j++) {

				if(i==0) {
					var g = 0;
					while(this.startPoints[i][j][0]+g>=0&&this.startPoints[i][j][0]+g<10&&this.startPoints[i][j][1]-g>=0&&this.startPoints[i][j][1]-g<10) {
						this.masPoints.push([this.startPoints[i][j][0]+g,this.startPoints[i][j][1]-g])
						g++;
					}
				}
				if(i==1) {
					var g = 0;
					while(this.startPoints[i][j][0]+g>=0&&this.startPoints[i][j][0]+g<10&&this.startPoints[i][j][1]+g>=0&&this.startPoints[i][j][1]+g<10) {
						this.masPoints.push([this.startPoints[i][j][0]+g,this.startPoints[i][j][1]+g])
						g++;
					}
				}
			}
		}
		for(var i = 0;i<this.masPoints.length;i++) {
			battleMatrix[this.masPoints[i][1]][this.masPoints[i][0]] = 1;
		}
		for(var i = 0;i<10;i++) {
			for(var j = 0;j<10;j++) {
				if (battleMatrix[i][j]==0) {
					this.masPoints.push([i,j]);
				}
			}
		}
		this.masPoints.sort(gameFunctions.compareRandom);
	};
	this.checkWinner = function() {
		var cc = 0;
		var cu = 0;
		for (var i = 0;i<10;i++) {
			if (comp.squadron[i]==undefined) cc++;
			if (user.squadron[i]==undefined) cu++;
		}

		if (cc==10) {
			playerTurn='end';
			textarea.innerHTML = 'Вы победили';
			document.querySelector('.n').innerHTML = 'Закончить';
		}
		if (cu==10) {
			playerTurn='end';
			textarea.innerHTML = 'Вас кинули';
			document.querySelector('.n').innerHTML = 'Закончить';
		}
	};
	this.shoot = function(x,y,actor,questable) {

		var enemy,coord;
		enemy = (actor==comp) ? user : comp;

		if (enemy==user) { // то есть стреляет ии
			if (this.battleObj.hits==0) {
				coord = this.masPoints.pop();
			} else {
				coord = this.battleObj.arroundMas.pop();
				gameFunctions.deleteCell(coord[0],coord[1]);
			}
		}
		if (!x&&!y&&x!=0&&y!=0) {
			x = coord[0];
			y = coord[1];
		}

		if (enemy.matrix[y][x] == 1) {
			var text = (actor==user) ? 'Попадание по кораблю бота':'Бот попал в ваш корабль';
			textarea.innerHTML = text;


			if (enemy==comp&&questable!=false) {

				mas = [0,1,0];
				mas.sort(gameFunctions.compareRandom);
				rk = gameFunctions.rand(0,mas.length+1);

				if (mas[rk]==1) {
					gameFunctions.openQuestWindow();
					right = {
						x: x,
						y: y
					}
					knockedOut = false;
					return false;
				}	
			}

			knockedOut = true;
			
			enemy.matrix[y][x] = 2;

			if (enemy==user) {

				this.battleObj.link = gameFunctions.findShip(x,y,enemy);
				this.battleObj.hits+=1;

				if (this.battleObj.hits == 1) {
					this.battleObj.firstHit = [x,y];
				} else if (this.battleObj.hits == 2) {
					this.battleObj.secondHit = [x,y];
				} else if (this.battleObj.hits == 3) {
					this.battleObj.thirdHit = [x,y];
				}

				this.battleObj.arroundMas = [];
				this.arroundMasGenPoints();

				var arr = [];

				for(var i = 0; i<this.battleObj.arroundMas.length;i++) {
					if (this.battleObj.arroundMas[i][0]>=0&&this.battleObj.arroundMas[i][0]<=9&&
						this.battleObj.arroundMas[i][1]>=0&&this.battleObj.arroundMas[i][1]<=9&&
						enemy.matrix[this.battleObj.arroundMas[i][1]][this.battleObj.arroundMas[i][0]]!=2&&
						enemy.matrix[this.battleObj.arroundMas[i][1]][this.battleObj.arroundMas[i][0]]!=3) {
						arr.push(this.battleObj.arroundMas[i]);
					}
				}

				this.battleObj.arroundMas = arr;

			}

		}
		else {
			var text = (actor==user) ? 'Вы промахнулись':'Бот промахнулся';
			textarea.innerHTML = text;
			enemy.matrix[y][x] = 3;
			knockedOut = false;
		}

		if (this.battleObj.hits>0&&this.battleObj.link&&this.battleObj.hits == this.battleObj.link.decks&&enemy==user) {
			textarea.innerHTML = 'Бот уничтожил ваш корабль';

			delete enemy.squadron[this.battleObj.link.id];
			gameFunctions.arrShoot(user,this.battleObj.link);

			this.resetBattleObj();
		};	

		if (enemy==comp) {
			for(var i = 0; i<enemy.squadron.length;i++) {
				if (enemy.squadron[i]==undefined) continue;

				var counter = 0;

				for(var j = 0;j<enemy.squadron[i].matrix.length;j++) {
					if (enemy.matrix[enemy.squadron[i].matrix[j][0]][enemy.squadron[i].matrix[j][1]]==2) counter++;
				}

				textarea.innerHTML = 'Вы уничтожили корабль противника';
				if (counter==enemy.squadron[i].decks) {
					gameFunctions.arrShoot(comp,enemy.squadron[i]);
					delete enemy.squadron[i];
				}
			}
		}
		this.checkWinner();

	};
};
function Field(x,y) {
	this.matrix = gameFunctions.createMatrix();
	this.squadron = [];
	this.x = x;
	this.y = y;
};
Field.prototype.randomShips = function(decks,id) {
	var x,y,rot,decks;

	rot = gameFunctions.rand(0,2);
	if (rot==0) {
		x = gameFunctions.rand(0,10);
		y = gameFunctions.rand(0,10-decks);
	} else {
		x = gameFunctions.rand(0,10-decks);
		y = gameFunctions.rand(0,10);
	}

	var bool = this.locCheck(x,y,rot,decks);

	if (!bool) return this.randomShips(decks,id);

	var arr = [];
	for (var i = 0;i<decks;i++) {
		if (rot == 0) {
			arr.push([x,y+i]);
		} else {
			arr.push([x+i,y]);
		}
	}

	this.squadron.push({
		x:y,
		y:x,
		rot:rot,
		decks:decks,
		matrix: arr,
		id:id
	});

	for (var i = 0;i<decks;i++) {
		if (rot==0) {
			this.matrix[x][y+i] = 1;
		} else {
			this.matrix[x+i][y] = 1;
		}
	}
};
Field.prototype.locCheck = function(x,y,rot,decks) {
	var fx,fy,tx,ty;

	fx = (x==0)?x:x-1;
	fy = (y==0)?y:y-1;

	if (rot==0) {
		tx = (x==9)?x:x+1;
		ty = (y+decks-1==9)?y+decks-1:y+decks;
	}
	if (rot==1) {
		tx = (x+decks-1==9)?x+decks-1:x+decks;
		ty = (y==9)?y:y+1;
	}

	for (var i = fx; i < tx+1; i++) {
		for (var j = fy; j < ty+1; j++) {
			if (this.matrix[i][j] == 1) return false;
		}
	}
	return true;


};

document.addEventListener('click', function() {
	if (playerTurn=='end') return false;
	var coord;
	var cxs = (fSize + deckMult*9)*2+fMargin+1;
	var cys = fSize + deckMult*9;
	if (mouseX>=comp.x&&mouseX<=cxs&&mouseY>=comp.y&&mouseY<=cys&&playerTurn) {
		
		coord = gameFunctions.getMouseXY(comp);

		if (comp.matrix[coord[1]][coord[0]]==2||
			comp.matrix[coord[1]][coord[0]]==3) {
				return false;
		}

		battle.shoot(coord[0],coord[1],user);
		
		if (comp.matrix[coord[1]][coord[0]]==2||
			comp.matrix[coord[1]][coord[0]]==1) {
			console.log('lol')
				return;
		}

		var int = setInterval(function() {
							battle.shoot(undefined,undefined,comp);
							if (!knockedOut) {
								playerTurn = true;
								clearInterval(int);
							}
				}, 500);

		if (!knockedOut) {
			playerTurn = false;

			knockedOut = true;
			var k = 0;
			while(knockedOut) {
				if (k==0) knockedOut = false;


				if (k==0) k++;
			}
		}
	}
});

var ships = document.querySelectorAll('.deck');

ships.forEach(function(el) {
	el.addEventListener('click', function(event) {
	  	var mb = document.querySelector('#modalBlock');

	  	mb.style.width = '40px';
	  	mb.style.height = '40px';

	  	var decks = 1;
	  	var rot = 1;


	  	mb.style.top = event.clientY + 'px';
	  	mb.style.left = event.clientX + 'px';

	  	picked = true;

	  	document.addEventListener('mousemove', function(event) {
		    var event = event;
		    mb.style.top = event.clientY - 20 + 'px';
		    mb.style.left = event.clientX - 20 + 'px';

		    var clicked = false;

	    	document.addEventListener('click', function() {
	    		
				var coord;
				if (mouseX>=user.x&&mouseX<=user.x+cellSize*10&&mouseY>=user.y&&mouseY<=user.y+cellSize*10&&picked&&clicked==false) {
					
					clicked = true;

					coord = gameFunctions.getMouseXY(user);
					var matrix = [];

					var x = coord[0];
					var y = coord[1];

					if (rot==1) {
						for(var i = x;i<x+decks;i++) {
							matrix.push([i,y]);
						}
					} else if (rot==0) {
						for(var i = y;i<y+decks;i++) {
							matrix.push([x,i]);

						}
					}

					user.squadron.push({
						x:coord[0],
						y:coord[1],
						decks: decks,
						rot: rot,
						matrix: matrix
					});

					document.removeEventListener('click');

					
					
				}
			});
	  	});
	});
});

document.querySelectorAll('.ToChange').forEach(function(el) {
	el.addEventListener('click', function() {
		gameFunctions.changeDB(el.innerHTML);
	});
});

document.querySelectorAll('.answ').forEach(function(element) {
  	element.addEventListener('click', function() {
  		if (element.innerHTML == selectedDB[numberOfDB].answr&&right) {
  			
  			var x = right.x;
  			var y = right.y;

  			var ship = gameFunctions.findShip(x,y,comp);

  			for(var i = 0;i<ship.matrix.length;i++) {
  				var sx = ship.matrix[i][1];
  				var sy = ship.matrix[i][0];

  				if (comp.matrix[sy][sx]==2) continue;

  				battle.shoot(sx,sy,user,false);


  			}

  			textarea.innerHTML = 'Ответ правильный';
  			battle.checkWinner();



			document.querySelector('#questArea').style.display = 'none';
  			return;
  		} else {
  			textarea.innerHTML = 'Ответ неверный';
  			battle.checkWinner();
  		}
		document.querySelector('#questArea').style.display = 'none';

	});
});

var fSize = 400;
var deckMult = 4;
var cellSize = 40;
var fMargin = 100;
var user = new Field(0,0);
var comp = new Field(fSize + deckMult*9+fMargin,0);
var battle = new Battle();
var singledeck = document.querySelector('.singledeck');
var gameSettings = {
	showCompShips: false,
	cross: {
		width: 5,
		height: 30
	},
	dot: {
		r: cellSize/3,
	}
};

var knockedOut = undefined;
var playerTurn = undefined;

function drawShip(y,x,rgb,xMod) {
	var mod = (xMod) ? xMod:0;
	push();
		noStroke();
		fill(rgb[0],rgb[1],rgb[2]);
		rect(x*(cellSize+deckMult) + mod,y*(cellSize+deckMult),cellSize,cellSize);
	pop();
};

function allDraw() {
	var xMod = comp.x;

	for(var i in user.matrix) {
		for(var j in user.matrix[i]) {
			if (user.matrix[i][j]==1) {
				drawShip(i,j,[90,90,90]);
			}
			if (user.matrix[i][j]==2) {
				drawing.cross(j,i,user);
			}
			if (user.matrix[i][j]==3) {
				drawing.dot(j,i,user);
			}
		}
	}
	for(var i in comp.matrix) {
		for(var j in comp.matrix[i]) {
			if (comp.matrix[i][j]==1&&gameSettings.showCompShips) {
				drawShip(i,j,[90,90,90],xMod);
			}
			if (comp.matrix[i][j]==2) {
				drawing.cross(j,i,comp);
			}
			if (comp.matrix[i][j]==3) {
				drawing.dot(j,i,comp);
			}
		}
	}
};

function drawFields() {
	for(var i = 0;i<10;i++) {
		for(var j = 0;j<10;j++) {
			push();
				noStroke();
				fill(192 ,255, 255);
				rect(comp.x + (deckMult + cellSize)*j,comp.y + (deckMult + cellSize)*i,cellSize,cellSize);
				rect(user.x + (deckMult + cellSize)*j,user.y + (deckMult + cellSize)*i,cellSize,cellSize);
			pop();
		}
	}
}


function setup() {
  createCanvas((fSize + deckMult*9)*2+fMargin+1, fSize + deckMult*9);
};

function draw() {
	angleMode(DEGREES);

	drawFields();
	
  	allDraw();
};
function keyTyped() {
  if (key === 'i') {
    gameSettings.showCompShips = true;
  } else if (key === 'o') {
  	gameFunctions.openQuestWindow();
  }
  // uncomment to prevent any default behavior
  // return false;
}

var drawing = {
	cross(x,y,ent) {
		var w = gameSettings.cross.width;
		var h = gameSettings.cross.height;
		var xPos = x*cellSize + deckMult*x + cellSize/2 + ent.x;
		var yPos = y*cellSize + deckMult*y + cellSize/2 + ent.y;

		push();
	  	rectMode(CENTER);
		  	translate(xPos, yPos);
		  	fill(255,0,90);
		  	rotate(45);
		  	noStroke();
		  	rect(0,0,w,h);
	  	pop();
	  	push();
	  	rectMode(CENTER);
		  	translate(xPos, yPos);
		  	fill(255,0,90);
		  	rotate(-45);
		  	noStroke();
		  	rect(0,0,w,h);
	  	pop();
	},
	dot(x,y,ent) {
		var r = gameSettings.dot.r;
		var xPos = x*cellSize + deckMult*x + cellSize/2 + ent.x;
		var yPos = y*cellSize + deckMult*y + cellSize/2 + ent.y;

		push();
		  	fill(50,40,255);
		  	noStroke();
		  	ellipse(xPos,yPos,r,r);
	  	pop();
	}
}
