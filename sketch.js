let sprites = {
  player1: {
    idle: {
      img: null,
      width: 123.5,
      height: 120,
      frames: 8
    },
    walk: {
      img: null,
      width: 155,
      height: 143,
      frames: 16
    },
    jump: {
      img: null,
      width: 177,
      height: 150,
      frames: 8
    },
    attack: {
      img: null,
      width: 231.5,
      height: 131,
      frames: 8
    },
    rangedAttack: {
      img: null,
      width: 224.6,
      height: 185,
      frames: 11
    }
  },
  player2: {
    idle: {
      img: null,
      width: 109,
      height: 103,
      frames: 10
    },
    walk: {
      img: null,
      width: 101,
      height: 118,
      frames: 12
    },
    jump: {
      img: null,
      width: 117,
      height: 139,
      frames: 10
    },
    attack: {
      img: null,
      width: 146,
      height: 101,
      frames: 4
    },
    rangedAttack: {
      img: null,
      width: 201.5,
      height: 91,
      frames: 9
    }
  },
  explosion: {
    img: null,
    width: 100,
    height: 100,
    frames: 1
  },
  bullet: {
    img: null,
    width: 70,
    height: 46,
    frames: 1
  },
  bullet1: {
    img: null,
    width: 70,
    height: 46,
    frames:1
  }
};

let player1, player2;
let currentFrame1 = 0;
let currentFrame2 = 0;
let currentState1 = 'idle';
let currentState2 = 'idle';
let speed = 5;
const SCALE = 2.3;

// 改進動畫控制
let animationTimer1 = 0;
let animationTimer2 = 0;
const ANIMATION_SPEED = 0.15; // 動畫速度（數字越小越慢）

let isAttacking1 = false;
let isAttacking2 = false;
let attackTimer1 = 0;
let attackTimer2 = 0;
const ATTACK_DURATION = 30;

// 新增的遠程攻擊相關變數
let isRangedAttacking1 = false;
let isRangedAttacking2 = false;
let rangedAttackTimer1 = 0;
let rangedAttackTimer2 = 0;
const RANGED_ATTACK_DURATION = 30;

let backgroundImg;

let bullets1 = [];  // 玩家1的子彈
let bullets2 = [];  // 玩家2的子彈
const BULLET_SPEED = 10;  // 子彈速度
const BULLET_DAMAGE = 5;  // 子彈傷害

// 在全域變數區域添加爆炸效果的陣列
let explosions = [];

function preload() {
  // 載入 jpg 格式的背景圖片
  backgroundImg = loadImage('assets/background.jpg');
  
  // 載入所有精靈圖
  sprites.player1.idle.img = loadImage('assets/player1_idle.png');
  sprites.player1.walk.img = loadImage('assets/player1_walk.png');
  sprites.player1.jump.img = loadImage('assets/player1_jump.png');
  sprites.player1.attack.img = loadImage('assets/player1_attack.png');
  sprites.player1.rangedAttack.img = loadImage('assets/player1_ranged_attack.png');  // 載入專門的遠程攻擊圖片
  
  sprites.player2.idle.img = loadImage('assets/player2_idle.png');
  sprites.player2.walk.img = loadImage('assets/player2_walk.png');
  sprites.player2.jump.img = loadImage('assets/player2_jump.png');
  sprites.player2.attack.img = loadImage('assets/player2_attack.png');
  sprites.player2.rangedAttack.img = loadImage('assets/player2_ranged_attack.png');  // 載入專門的遠程攻擊圖片
  
  // 載入子彈和爆炸效果圖片
  sprites.explosion.img = loadImage('assets/explosion.png');
  sprites.bullet.img = loadImage('assets/bullet.png');
  sprites.bullet1.img = loadImage('assets/bullet1.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  player1 = {
    x: width/4,
    y: height/2,
    direction: 1,
    velocityY: 0,
    isJumping: false,
    health: 100
  };
  
  player2 = {
    x: 3*width/4,
    y: height/2,
    direction: -1,
    velocityY: 0,
    isJumping: false,
    health: 100
  };
}

function draw() {
  image(backgroundImg, 0, 0, width, height);
  
  handleAttacks();
  handlePlayer1Movement();
  handlePlayer2Movement();
  handleGravity(player1);
  handleGravity(player2);
  updateBullets();
  
  updateAnimation();
  
  drawCharacter(player1, sprites.player1[currentState1], Math.floor(currentFrame1), player1.direction < 0);
  drawCharacter(player2, sprites.player2[currentState2], Math.floor(currentFrame2), player2.direction < 0);
  drawBullets();
  
  drawHealthBar(player1.x, player1.y, player1.health, true);
  drawHealthBar(player2.x, player2.y, player2.health, false);
  
  // 在背景上方中間顯示 "TKUET"
  textSize(100);
  fill(0, 255, 255);
  textAlign(CENTER, CENTER);
  text("TKUET", width / 2, 100);
  
  // 添加控制說明
  textSize(16);
  textAlign(LEFT);
  
  // 為說明文字添加半透明黑色背景
  fill(0, 0, 0, 150);  // 黑色，alpha值為150（半透明）
  rect(15, height - 300, 200, 250);  // 角色說明的背景，寬度增加到200

  
  // 繪製白色說明文字
  fill(255);  // 白色文字
  text("角色2控制：\n↑ - 跳躍\n←,→ - 左右移動\n1 - 近戰攻擊\n2 - 遠程攻擊", 20, height - 120);
  text("角色1控制：\nW - 跳躍\nA,D - 左右移動\nJ - 近戰攻擊\nK - 遠程攻擊", 20, height - 240);
}

function updateAnimation() {
  // 角色1的動畫更新
  animationTimer1 += ANIMATION_SPEED;
  currentFrame1 = animationTimer1 % sprites.player1[currentState1].frames;
  
  // 角色2的動畫更新
  animationTimer2 += ANIMATION_SPEED;
  currentFrame2 = animationTimer2 % sprites.player2[currentState2].frames;
}

function changeState(player, newState, playerNumber) {
  // 當狀態改變時重置動畫
  if (playerNumber === 1) {
    if (currentState1 !== newState) {
      currentState1 = newState;
      currentFrame1 = 0;
      animationTimer1 = 0;
    }
  } else {
    if (currentState2 !== newState) {
      currentState2 = newState;
      currentFrame2 = 0;
      animationTimer2 = 0;
    }
  }
}

function handlePlayer1Movement() {
  if (isAttacking1 || isRangedAttacking1) return;
  
  let isMoving = false;
  if (keyIsDown(65)) { // A
    player1.x -= speed;
    player1.direction = -1;
    isMoving = true;
  }
  if (keyIsDown(68)) { // D
    player1.x += speed;
    player1.direction = 1;
    isMoving = true;
  }
  
  if (!player1.isJumping && !isAttacking1 && !isRangedAttacking1) {
    changeState(player1, isMoving ? 'walk' : 'idle', 1);
  }
}

function handlePlayer2Movement() {
  if (isAttacking2 || isRangedAttacking2) return;
  
  let isMoving = false;
  if (keyIsDown(LEFT_ARROW)) {
    player2.x -= speed;
    player2.direction = -1;
    isMoving = true;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player2.x += speed;
    player2.direction = 1;
    isMoving = true;
  }
  
  if (!player2.isJumping && !isAttacking2 && !isRangedAttacking2) {
    changeState(player2, isMoving ? 'walk' : 'idle', 2);
  }
}

function handleAttacks() {
  const ATTACK_RANGE = 150;
  const VERTICAL_RANGE = 100;
  const DAMAGE = 10;
  
  // 處理近戰攻擊
  if (isAttacking1) {
    attackTimer1++;
    if (attackTimer1 === 15) {
      let hitboxX = player1.direction > 0 ? player1.x + ATTACK_RANGE/2 : player1.x - ATTACK_RANGE/2;
      if (abs(hitboxX - player2.x) < ATTACK_RANGE && abs(player1.y - player2.y) < VERTICAL_RANGE) {
        player2.health = max(0, player2.health - DAMAGE);
      }
    }
    if (attackTimer1 >= ATTACK_DURATION) {
      isAttacking1 = false;
      attackTimer1 = 0;
      changeState(player1, 'idle', 1);
    }
  }
  
  if (isAttacking2) {
    attackTimer2++;
    if (attackTimer2 === 15) {
      let hitboxX = player2.direction > 0 ? player2.x + ATTACK_RANGE/2 : player2.x - ATTACK_RANGE/2;
      if (abs(hitboxX - player1.x) < ATTACK_RANGE && abs(player2.y - player1.y) < VERTICAL_RANGE) {
        player1.health = max(0, player1.health - DAMAGE);
      }
    }
    if (attackTimer2 >= ATTACK_DURATION) {
      isAttacking2 = false;
      attackTimer2 = 0;
      changeState(player2, 'idle', 2);
    }
  }
  
  // 處理遠程攻擊動作
  if (isRangedAttacking1) {
    rangedAttackTimer1++;
    if (rangedAttackTimer1 >= RANGED_ATTACK_DURATION) {
      isRangedAttacking1 = false;  // 重置遠程攻擊狀態
      rangedAttackTimer1 = 0;
      changeState(player1, 'idle', 1);  // 回到閒置狀態
    }
  }
  
  if (isRangedAttacking2) {
    rangedAttackTimer2++;
    if (rangedAttackTimer2 >= RANGED_ATTACK_DURATION) {
      isRangedAttacking2 = false;  // 重置遠程攻擊狀態
      rangedAttackTimer2 = 0;
      changeState(player2, 'idle', 2);  // 回到閒置狀態
    }
  }
  
  // 檢查遊戲結束
  if (player1.health <= 0 || player2.health <= 0) {
    noLoop();
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(0);
    text(player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!", width/2, height/2);
  }
}

function handleGravity(player) {
  const gravity = 0.8;
  const jumpPower = -15;
  const groundY = height - 250; // 將地平線提高，從原本的 height - 100 改為 height - 250
  
  // 應用重力
  player.velocityY += gravity;
  player.y += player.velocityY;
  
  // 檢查是否著地
  if (player.y > groundY) {
    player.y = groundY;
    player.velocityY = 0;
    player.isJumping = false;
  }
}

function keyPressed() {
  // 跳躍控制
  if (key === 'w' && !player1.isJumping) {
    player1.velocityY = -15;
    player1.isJumping = true;
    changeState(player1, 'jump', 1);
  }
  
  if (keyCode === UP_ARROW && !player2.isJumping) {
    player2.velocityY = -15;
    player2.isJumping = true;
    changeState(player2, 'jump', 2);
  }
  
  // 近戰攻擊控制
  if (key === 'j' && !isAttacking1 && !isRangedAttacking1) {
    isAttacking1 = true;
    changeState(player1, 'attack', 1);
    attackTimer1 = 0;
  }
  
  if (key === '1' && !isAttacking2 && !isRangedAttacking2) {
    isAttacking2 = true;
    changeState(player2, 'attack', 2);
    attackTimer2 = 0;
  }
  
  // 遠程攻擊控制 - 修改這部分
  if (key === 'k' && !isAttacking1 && !isRangedAttacking1) {
    isRangedAttacking1 = true;  // 設置遠程攻擊狀態
    changeState(player1, 'rangedAttack', 1);  // 切換到遠程攻擊動作
    rangedAttackTimer1 = 0;
    bullets1.push({
      x: player1.x + (player1.direction > 0 ? 50 : -50),
      y: player1.y,
      direction: player1.direction
    });
  }
  
  if (key === '2' && !isAttacking2 && !isRangedAttacking2) {
    isRangedAttacking2 = true;  // 設置遠程攻擊狀態
    changeState(player2, 'rangedAttack', 2);  // 切換到遠程攻擊動作
    rangedAttackTimer2 = 0;
    bullets2.push({
      x: player2.x + (player2.direction > 0 ? 50 : -50),
      y: player2.y,
      direction: player2.direction
    });
  }
}

function drawCharacter(player, spriteInfo, frame, flipX) {
  push();
  translate(player.x, player.y);
  if (flipX) scale(-1 * SCALE, SCALE);
  else scale(SCALE, SCALE);
  
  image(spriteInfo.img,
        -spriteInfo.width/2,
        -spriteInfo.height/2,
        spriteInfo.width,
        spriteInfo.height,
        frame * spriteInfo.width,
        0,
        spriteInfo.width,
        spriteInfo.height);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawHealthBar(x, y, health, isPlayer1) {
  const barWidth = 200;
  const barHeight = 20;
  
  // 血條固定在畫面上方
  const xPos = isPlayer1 ? 20 : width - barWidth - 20;  // 左上或右上
  const yPos = 20;  // 距離頂部的距離
  
  // 繪製血條背景
  fill(255, 0, 0);
  rect(xPos, yPos, barWidth, barHeight);
  
  // 繪製當前血量
  fill(0, 255, 0);
  rect(xPos, yPos, barWidth * (health / 100), barHeight);
  
  // 添加字標籤
  fill(0);
  textSize(16);
  textAlign(isPlayer1 ? LEFT : RIGHT);
  text(isPlayer1 ? "Player 1: " + health : "Player 2: " + health, 
       isPlayer1 ? xPos : xPos + barWidth, 
       yPos - 5);
}

function updateBullets() {
  // 更新玩家1的子彈
  for (let i = bullets1.length - 1; i >= 0; i--) {
    bullets1[i].x += bullets1[i].direction * BULLET_SPEED;
    
    // 檢查是否擊中玩家2
    if (abs(bullets1[i].x - player2.x) < 50 && abs(bullets1[i].y - player2.y) < 50) {
      player2.health = max(0, player2.health - BULLET_DAMAGE);
      // 在擊中位置創建爆炸效果
      explosions.push({
        x: bullets1[i].x,
        y: bullets1[i].y,
        frame: 0
      });
      bullets1.splice(i, 1);
      continue;
    }
    
    // 移除超出畫面的子彈
    if (bullets1[i].x < 0 || bullets1[i].x > width) {
      bullets1.splice(i, 1);
    }
  }
  
  // 更新玩家2的子彈
  for (let i = bullets2.length - 1; i >= 0; i--) {
    bullets2[i].x += bullets2[i].direction * BULLET_SPEED;
    
    // 檢查是否擊中玩家1
    if (abs(bullets2[i].x - player1.x) < 50 && abs(bullets2[i].y - player1.y) < 50) {
      player1.health = max(0, player1.health - BULLET_DAMAGE);
      // 在擊中位置��建爆炸效果
      explosions.push({
        x: bullets2[i].x,
        y: bullets2[i].y,
        frame: 0
      });
      bullets2.splice(i, 1);
      continue;
    }
    
    // 移除超出畫面的子彈
    if (bullets2[i].x < 0 || bullets2[i].x > width) {
      bullets2.splice(i, 1);
    }
  }
  
  // 更新爆炸動畫
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame += 0.5;
    if (explosions[i].frame >= sprites.explosion.frames) {
      explosions.splice(i, 1);
    }
  }
}

function drawBullets() {
  // 繪製玩家1的子彈
  for (let bullet of bullets1) {
    push();
    translate(bullet.x, bullet.y);
    if (bullet.direction < 0) scale(-1, 1);
    image(sprites.bullet1.img, -sprites.bullet1.width/2, -sprites.bullet1.height/2);
    pop();
  }
  
  // 繪製玩家2的子彈
  for (let bullet of bullets2) {
    push();
    translate(bullet.x, bullet.y);
    if (bullet.direction < 0) scale(-1, 1);
    image(sprites.bullet.img, -sprites.bullet.width/2, -sprites.bullet.height/2);
    pop();
  }
  
  // 繪製爆炸效果
  for (let explosion of explosions) {
    push();
    translate(explosion.x, explosion.y);
    
    scale(1.5);
    
    image(sprites.explosion.img,
          -sprites.explosion.width/2,
          -sprites.explosion.height/2,
          sprites.explosion.width,
          sprites.explosion.height,
          Math.floor(explosion.frame) * sprites.explosion.width,
          0,
          sprites.explosion.width,
          sprites.explosion.height);
    
    pop();
  }
}
