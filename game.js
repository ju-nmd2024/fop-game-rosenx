let crocodile;
let gravity = 0.1;
let maxSafeSpeed = 5; // Safe speed threshold
let upwardThrust = -2;
let horizontalSpeed = 2;
let gameFailed = false;
let gameSuccess = false;
let score = 0; // Initialize score
let waterY;
let waterHeight = 150;
let splashParticles = [];
let splashTriggered = false;
let stars = []; // Storing the positions of stars
let meteors = []; // Store the position and velocity of the meteor
let coins = []; // Where to store coins
let fireworks = []; // Storing Fireworks Effects
let gameState = 'start'; // Set the game state: 'start', 'play', 'end'
let fullCoinsCollected = false;

// Function to draw shooting stars
function drawMeteors() {
    stroke(255, 255, 255, 150); // Translucent white
    strokeWeight(2);
    for (let meteor of meteors) {
        // Draw each meteor as a line
        line(meteor.x, meteor.y, meteor.x - meteor.length, meteor.y + meteor.length);

        // Update meteor's position
        meteor.y += meteor.speed;
        meteor.x -= meteor.speed * 0.5;

        // Reset meteor position when it moves off screen
        if (meteor.y > height || meteor.x < 0) {
            meteor.y = random(-500, -50);
            meteor.x = random(width, width + 100);
            meteor.speed = random(2, 5);
        }
    }
}

// Function to generate gold coins
function generateCoins(numCoins) {
    coins = [];
    for (let i = 0; i < numCoins; i++) {
        let validPosition = false;
        let newCoin;

        while (!validPosition) {
            newCoin = {
                x: random(100, width - 100),
                y: random(150, waterY - 200),
                collected: false
            };

            validPosition = true;
            for (let c of coins) {
                if (dist(c.x, c.y, newCoin.x, newCoin.y) < 80) {
                    validPosition = false;
                    break;
                }
            }
        }

        coins.push(newCoin);
    }
}

// Reset Alligator State
function resetCrocodile() {
    crocodile = {
        x: 200,
        y: 50,
        velocityY: 0,
        velocityX: 0
    };
    gameFailed = false;
    gameSuccess = false;
    score = 0; // Reset score
    splashParticles = [];
    splashTriggered = false;
    coins = [];
    fullCoinsCollected = false;
    generateCoins(3); // Reset score
    fireworks = []; // Reset Fireworks Effect
}

function setup() {
    createCanvas(800, 800);
    waterY = height - 150;
    resetCrocodile();
    generateStars(8); // Generate Stars
    generateMeteors(10); // Generate Meteor
}

function draw() {
    background(10, 10, 30); // Dark space background

    // Draw a shooting star effect
    drawMeteors();

    // Display different screens based on gameState
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'play') {
        playGame();
        displaySpeed(); // Display the crocodile's descent speed
        displayScore(); // Show score
    } else if (gameState === 'end') {
        drawEndScreen();
    }
}

function displaySpeed() {
    fill(255); // White text
    textSize(16);
    textAlign(RIGHT, TOP);
    text("Descent speed: " + nf(abs(crocodile.velocityY), 0, 2), width - 20, 20);
}

function displayScore() {
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text("Fraction: " + score, 20, 20);
}

function drawStartScreen() {
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text("Welcome to crocodile games!", width / 2, height / 2 - 20);
    textSize(20);
    text("Press the spacebar to start the game", width / 2, height / 2 + 20);
}

function playGame() {
    if (crocodile.y === undefined || crocodile.x === undefined) {
        resetCrocodile();
    }

    // Painting the water surface
    drawWater();

    // Apply Gravity
    crocodile.velocityY += gravity;

    // Update the position of the alligator
    crocodile.y += crocodile.velocityY;
    crocodile.x += crocodile.velocityX;

    // Limit the horizontal movement range of the alligator
    crocodile.x = constrain(crocodile.x, 0, width);

    // Drawing the Alligator
    drawCrocodile();

    // Drawing stars and detecting collisions
    drawStars();
    checkStarCollision();

    // Drawing coins and detecting collisions
    drawCoins();
    checkCoinCollision();

    // Check if the alligator is touching the water
    checkWaterContact();

    // Draw water splash effect
    drawSplashParticles();

    if (gameFailed || gameSuccess) {
        gameState = 'end';
    }
}

function drawEndScreen() {
    textSize(24);
    textAlign(CENTER);
    if (gameFailed) {
        fill(255, 0, 0);
        text("Game lost! Press R to restart", width / 2, height / 2);
    } else if (gameSuccess) {
        if (fullCoinsCollected) {
            fill(0, 255, 0);
            text("Congratulations! You collected all the coins!", width / 2, height / 2 - 40);
            drawFireworks(); // Display fireworks effect
        } else {
            fill(255, 255, 0);
            text("Landed safely but didn't collect all the coins", width / 2, height / 2);
        }
        text("Press R to restart", width / 2, height / 2 + 40);
    }
}

function generateStars(numStars) {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: random(100, width - 100),
            y: random(150, waterY - 150),
            size: random(20, 30)
        });
    }
}

function generateMeteors(numMeteors) {
    meteors = [];
    for (let i = 0; i < numMeteors; i++) {
        meteors.push({
            x: random(width),
            y: random(-500, -50),
            speed: random(2, 5),
            length: random(10, 20)
        });
    }
}

function drawCoins() {
    for (let coin of coins) {
        if (!coin.collected) {
            push();
            translate(coin.x, coin.y);
            fill(255, 223, 0);
            stroke(255, 200, 0);
            strokeWeight(2);
            ellipse(0, 0, 30, 30);
            fill(255);
            textSize(12);
            textAlign(CENTER, CENTER);
            text("￥", 0, 0);
            pop();
        }
    }
}

function checkCoinCollision() {
    for (let coin of coins) {
        if (!coin.collected && dist(crocodile.x, crocodile.y, coin.x, coin.y) < 25) {
            coin.collected = true;
            score += 10;
        }
    }
}
function drawCrocodile() {
    push();
    translate(crocodile.x, crocodile.y);

    // Body
    fill(107, 142, 35); // Green color
    noStroke();
    rect(0, 0, 80, 30, 10); // Body rectangle

    // Tail
    arc(40, 5, 40, 30, -PI / 2, PI / 2); // Tail curve

    // Head
    ellipse(-35, 0, 40, 25); // Head shape

    // Eyes
    fill(255);
    ellipse(-45, -10, 10, 10); // Left eye
    ellipse(-25, -10, 10, 10); // Right eye
    fill(0);
    ellipse(-45, -10, 5, 5); // Left pupil
    ellipse(-25, -10, 5, 5); // Right pupil

    // Mouth
    stroke(0);
    strokeWeight(2);
    noFill();
    arc(-35, 8, 25, 10, 0, PI / 2); // Smiling mouth

    // Scales or spikes on the back
    fill(0, 100, 0); // Darker green for scales
    triangle(0, -10, 10, -10, 5, -20);
    triangle(15, -10, 25, -10, 20, -20);
    triangle(30, -10, 40, -10, 35, -20);

    pop();
}

function drawWater() {
    fill(0, 191, 255, 200); // Semi-transparent blue
    rectMode(CENTER);
    rect(width / 2, waterY + waterHeight / 2, width, waterHeight);

    // Draw waves on the water
    stroke(255, 255, 255, 150); // Light blue waves
    strokeWeight(2);
    for (let i = 0; i < width; i += 20) {
        line(i, waterY, i + 10, waterY - 5); // Small wave segments
        line(i + 10, waterY - 5, i + 20, waterY); // downward wave segments
    }
}
function checkWaterContact() {
    if (crocodile.y + 10 >= waterY) {
        if (Math.abs(crocodile.velocityY) > maxSafeSpeed) {
            gameFailed = true;
        } else if (!splashTriggered) {
            gameSuccess = true;
            fullCoinsCollected = coins.every(c => c.collected);
            createSplash(crocodile.x, waterY);
            splashTriggered = true;
        }
        crocodile.velocityY *= 0.5;
        crocodile.y = constrain(crocodile.y, 0, waterY - 10);
    }
}
function drawStars() {
    fill(255, 223, 0); // Yellow stars
    noStroke();
    for (let star of stars) {
        drawStar(star.x, star.y, star.size * 0.4, star.size, 5); // Draw a five-pointed star
    }
}

function drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}
function checkStarCollision() {
    for (let star of stars) {
        let distance = dist(crocodile.x, crocodile.y, star.x, star.y);
        if (distance < star.size / 2 + 20) { // Adjust collision radius for crocodile and star
            gameFailed = true; // Set gameFailed to true if a collision is detected
            break;
        }
    }
}

function keyPressed() {
    if (gameState === 'start' && (key === ' ' || key === 'Space')) {
        gameState = 'play'; // Press the space bar to enter the game
        resetCrocodile(); // Make sure to reset the crocodile every time the game starts
    } else if (gameState === 'end' && (key === 'r' || key === 'R')) {
        resetCrocodile();
        gameState = 'start'; // Restart the game and return to the start screen
    } else if (gameState === 'play') {
        if (key === 'ArrowUp') {
            crocodile.velocityY = upwardThrust; // Apply upward thrust
            createSplash(crocodile.x, crocodile.y + 20); // Small splash under the crocodile
        } else if (key === 'ArrowLeft') {
            crocodile.velocityX = -horizontalSpeed; // Move left
        } else if (key === 'ArrowRight') {
            crocodile.velocityX = horizontalSpeed; // Move right
        }
    }
}
function keyReleased() {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        crocodile.velocityX = 0; // Stop horizontal movement when arrow key is released
    }
}

function createSplash(x, y) {
    for (let i = 0; i < 10; i++) {
        splashParticles.push({
            x: x,
            y: y,
            size: random(5, 10),
            speedX: random(-1, 1),
            speedY: random(-2, 0),
            lifetime: 30
        });
    }
}

function drawSplashParticles() {
    for (let i = splashParticles.length - 1; i >= 0; i--) {
        let particle = splashParticles[i];
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.lifetime--;

        noStroke();
        fill(173, 216, 230, map(particle.lifetime, 0, 30, 0, 255)); // Fading effect
        ellipse(particle.x, particle.y, particle.size);

        if (particle.lifetime <= 0) {
            splashParticles.splice(i, 1);
        }
    }
}

function createFirework(x, y) {
    for (let i = 0; i < 100; i++) {
        fireworks.push({
            x: x,
            y: y,
            speedX: random(-2, 2),
            speedY: random(-2, 2),
            lifetime: 50
        });
    }
}

function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        let firework = fireworks[i];
        firework.x += firework.speedX;
        firework.y += firework.speedY;
        firework.lifetime--;

        noStroke();
        fill(255, random(100, 255), random(100, 255), map(firework.lifetime, 0, 50, 0, 255));
        ellipse(firework.x, firework.y, 5);

        if (firework.lifetime <= 0) {
            fireworks.splice(i, 1);
        }
    }
    if (fireworks.length === 0) {
        createFirework(random(width), random(height));
    }
}
