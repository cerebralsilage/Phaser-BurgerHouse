const gameState = {
  score: 0,
  starRating: 5,
  currentWaveCount: 1,
  customerIsReady: false,
  cam: {},
  gameSpeed: 1,
  serviceCountdown: {},
  currentMusic: {},
  totalWaveCount: 5,
  countdownTimer: 5000,
  readyForNextOrder: true,
  customersServedCount: 0
}

// Gameplay scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  };

  preload() {
    // Preload images
    const baseURL = 'https://content.codecademy.com/courses/learn-phaser/fastfoodie/';
    this.load.image('Chef', `${baseURL}art/Chef.png`);
    this.load.image('Customer-1', `${baseURL}art/Customer-1.png`);
    this.load.image('Customer-2', `${baseURL}art/Customer-2.png`);
    this.load.image('Customer-3', `${baseURL}art/Customer-3.png`);
    this.load.image('Customer-4', `${baseURL}art/Customer-4.png`);
    this.load.image('Customer-5', `${baseURL}art/Customer-5.png`);
    this.load.image('Floor-Server', `${baseURL}art/Floor-Server.png`);
    this.load.image('Floor-Customer', `${baseURL}art/Floor-Customer.png`);
    this.load.image('Tray', `${baseURL}art/Tray.png`);
    this.load.image('Barrier', `${baseURL}art/Barrier.png`);
    this.load.image('Star-full', `${baseURL}art/Star-full.png`);
    this.load.image('Star-half', `${baseURL}art/Star-half.png`);
    this.load.image('Star-empty', `${baseURL}art/Star-empty.png`);

    // Preload song
    this.load.audio('gameplayTheme', [
      `${baseURL}audio/music/2-gameplayTheme.ogg`,
      `${baseURL}audio/music/2-gameplayTheme.mp3`
    ]); // Credit: "Pixel Song #18" by hmmm101: https://freesound.org/people/hmmm101

    // Preload SFX
    this.load.audio('placeFoodSFX', [
      `${baseURL}audio/sfx/placeFood.ogg`,
      `${baseURL}audio/sfx/placeFood.mp3`
    ]); // Credit: "action_02.wav" by dermotte: https://freesound.org/people/dermotte

    this.load.audio('servingCorrectSFX', [
      `${baseURL}audio/sfx/servingCorrect.ogg`,
      `${baseURL}audio/sfx/servingCorrect.mp3`
    ]); // Credit: "Video Game SFX Positive Action Long Tail" by rhodesmas: https://freesound.org/people/djlprojects

    this.load.audio('servingIncorrectSFX', [
      `${baseURL}audio/sfx/servingIncorrect.ogg`,
      `${baseURL}audio/sfx/servingIncorrect.mp3`
    ]); // Credit: "Incorrect 01" by rhodesmas: https://freesound.org/people/rhodesmas

    this.load.audio('servingEmptySFX', [
      `${baseURL}audio/sfx/servingEmpty.ogg`,
      `${baseURL}audio/sfx/servingEmpty.mp3`
    ]); // Credit: "Computer Error Noise [variants of KevinVG207's Freesound#331912].wav" by Timbre: https://freesound.org/people/Timbre

    this.load.audio('fiveStarsSFX', [
      `${baseURL}audio/sfx/fiveStars.ogg`,
      `${baseURL}audio/sfx/fiveStars.mp3`
    ]); // Credit: "Success 01" by rhodesmas: https://freesound.org/people/rhodesmas

    this.load.audio('nextWaveSFX', [
      `${baseURL}audio/sfx/nextWave.ogg`,
      `${baseURL}audio/sfx/nextWave.mp3`
    ]); // Credit: "old fashion radio jingle 2.wav" by rhodesmas: https://freesound.org/people/chimerical
  }

  create() {
    //Refresh the game
    this.restartGame();

    // Stop, reassign, and play the new music
    gameState.currentMusic.stop();
    gameState.currentMusic = this.sound.add('gameplayTheme');
    gameState.currentMusic.play({ loop: true });

    // Assign SFX
    gameState.sfx = {};
    gameState.sfx.placeFood = this.sound.add('placeFoodSFX');
    gameState.sfx.servingCorrect = this.sound.add('servingCorrectSFX');
    gameState.sfx.servingIncorrect = this.sound.add('servingIncorrectSFX');
    gameState.sfx.servingEmpty = this.sound.add('servingEmptySFX');
    gameState.sfx.fiveStars = this.sound.add('fiveStarsSFX');
    gameState.sfx.nextWave = this.sound.add('nextWaveSFX');

    // Create environment sprites
    gameState.floorServer = this.add.sprite(gameState.cam.midPoint.x, 0, 'Floor-Server').setScale(0.5).setOrigin(0.5, 0);
    gameState.floorCustomer = this.add.sprite(gameState.cam.midPoint.x, gameState.cam.worldView.bottom, 'Floor-Customer').setScale(0.5).setOrigin(0.5, 1);
    gameState.table = this.add.sprite(gameState.cam.midPoint.x, gameState.cam.midPoint.y, 'Barrier').setScale(0.5);

    // Create player and tray sprites
    gameState.tray = this.add.sprite(gameState.cam.midPoint.x, gameState.cam.midPoint.y, 'Tray').setScale(0.5);
    gameState.player = this.add.sprite(gameState.cam.midPoint.x, 200, 'Chef').setScale(0.5);

    // Display the score
    gameState.scoreTitleText = this.add.text(gameState.cam.midPoint.x, 30, 'Score', { fontSize: '30px', fill: '#666666' }).setOrigin(0.5);
    gameState.scoreText = this.add.text(gameState.cam.midPoint.x, gameState.scoreTitleText.y + gameState.scoreTitleText.height + 20, gameState.score, { fontSize: '30px', fill: '#000000' }).setOrigin(0.5);

    // Display the wave count
    gameState.waveTitleText = this.add.text(gameState.cam.worldView.right - 20, 30, 'Wave', { fontSize: '64px', fill: '#666666' }).setOrigin(1, 1).setScale(0.25);
    gameState.waveCountText = this.add.text(gameState.cam.worldView.right - 20, 30, gameState.currentWaveCount + '/' + gameState.totalWaveCount, { fontSize: '120px', fill: '#000000' }).setOrigin(1, 0).setScale(0.25);

    // Display number of customers left
    gameState.customerCountText = this.add.text(gameState.cam.worldView.right - 20, 80, `Customers left: ${gameState.customersLeftCount}`, { fontSize: '15px', fill: '#000000' }).setOrigin(1);

    // Generate wave group
    gameState.customers = this.add.group();
    this.generateWave();

    // Making customers hungry
    gameState.currentMeal = this.add.group();
    gameState.currentMeal.fullnessValue = 0;

    // Creating Star ratings
    gameState.starGroup = this.add.group();
    this.drawStars();

    // Creating a timer
      gameState.timer = this.time.addEvent({
        delay: gameState.countdownTimer,
        loop: false,
        paused: true
      });

    // Creating Food Keys
    gameState.keys.Enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    gameState.keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    gameState.keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    gameState.keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update() {

    // Prep for next wave/order/etc.
    if (gameState.readyForNextOrder) {
      gameState.readyForNextOrder = false;
      gameState.customerIsReady = false;

      // Removed old customer, push them to the left and all other customers up in line.
      for (let i = 0; i < gameState.customersServedCount; i++) {
        this.tweens.add({
          targets: gameState.currentCustomer,
          x: -300,
          angle: 0,
          duration: 750,
          onStart: () => {
            gameState.customers.children.entries[i].meterContainer.visible = false;
          }
        });
      }

      // Assign new customer, push them to the chef
      gameState.currentCustomer = gameState.customers.children.entries[gameState.customersServedCount];
      gameState.nextCustomer = gameState.customers.children.entries[gameState.customersServedCount + 1];

      if(gameState.nextCustomer) {
        for (let j = gameState.customersServedCount + 1; j < gameState.customersServedCount + gameState.customersLeftCount; j++) {
          this.tweens.add({
            targets: gameState.customers.children.entries[j],
            x: '-=200',
            duration: 1500,
            delay: 200
          });
        }
      };

      if(gameState.customersLeftCount != 0) {
        this.tweens.add({
          targets: gameState.currentCustomer,
          x: gameState.player.x,
          ease: 'Power2',
          duration: 1000,
          delay: 100,
          angle: 90,
          onComplete: () => {
            gameState.customerIsReady = true;
            gameState.currentCustomer.meterContainer.visible = true;
          }
        });
      }
    };

    // Creating the meter timer
    if(gameState.customerIsReady) {
      // Start the timer.
      gameState.timer.paused = false;
      // Manipulating timer graphic
      gameState.currentCustomer.timerMeterBody.width = gameState.currentCustomer.meterBase.width - ((gameState.timer.getProgress() * gameState.currentCustomer.meterBase.width) * gameState.gameSpeed);
      // Change colors based on bar fullness/time elaspsed
      if (gameState.timer.getProgress() > .75) {
        gameState.currentCustomer.timerMeterBody.setFillStyle(0xDB533A);
      } else if (gameState.timer.getProgress() > .25) {
        gameState.currentCustomer.timerMeterBody.setFillStyle(0xFF9D00);
      }
      // Customer bails if you take too long
      if (gameState.currentCustomer.timerMeterBody.width <= 0) {
        // Check on timer meter to ensure it goes to 0 or less before trigger
        // console.log(`Timer Meter Body Length: ${gameState.currentCustomer.timerMeterBody.width}`);
        this.moveCustomerLine();
      }
    }

    // Keyboard inputs
    if (Phaser.Input.Keyboard.JustDown(gameState.keys.A)) {
      this.placeFood('Burger', 5);
    } else if (Phaser.Input.Keyboard.JustDown(gameState.keys.S)) {
      this.placeFood('Fries', 3);
    } else if (Phaser.Input.Keyboard.JustDown(gameState.keys.D)) {
      this.placeFood('Shake', 1);
    } else if (Phaser.Input.Keyboard.JustDown(gameState.keys.Enter)) {
      if(!gameState.readyForNextOrder && gameState.customerIsReady) {
        this.moveCustomerLine();
        this.updateCustomerCountText();
      }
    }
  }

  /* WAVES */
  // Generate wave
  generateWave() {
    // Add the total number of customers per wave here:
    gameState.totalCustomerCount = Math.ceil(Math.random() * 10);
    gameState.customersServedCount = 0;
    this.updateCustomerCountText();

    for (let i = 0; i < gameState.totalCustomerCount; i++) {
      // Create your container below and add your customers to it below:
      let customerContainer = this.add.container(gameState.cam.worldView.right + (200 * i), gameState.cam.worldView.bottom - 140);
      gameState.customers.add(customerContainer);

      // Customer sprite randomizer
      let customerImageKey = Math.ceil(Math.random() * 5);

      // Draw customers here!
      let customer = this.add.sprite(0, 0, `Customer-${customerImageKey}`).setScale(0.5);
      customerContainer.add(customer);

      // Fullness meter container
      customerContainer.fullnessMeter = this.add.group();

      // Define capacity
      customerContainer.fullnessCapacity = Math.ceil(Math.random() * 5 * gameState.totalWaveCount);

      // If capacity is an impossible number, reshuffle it until it isn't
      while (customerContainer.fullnessCapacity === 12 || customerContainer.fullnessCapacity === 14 || customerContainer.fullnessCapacity > 15) {
        customerContainer.fullnessCapacity = Math.ceil(Math.random() * 5) * gameState.totalWaveCount;
      }

      // Edit the meterWidth
      let meterWidth = customerContainer.fullnessCapacity * 10;
      customerContainer.meterContainer = this.add.container(0, customer.y + (meterWidth / 2));

      // Add the customerContainer.meterContainer to customerContainer
      customerContainer.add(customerContainer.meterContainer);

      // Add meter base
      customerContainer.meterBase = this.add.rectangle(-130, customer.y, meterWidth, 33, 0x707070).setOrigin(0);
      customerContainer.meterBase.setStrokeStyle(6, 0x707070);
      customerContainer.meterBase.angle = -90;
      customerContainer.meterContainer.add(customerContainer.meterBase);

      // Add timer countdown meter body
      customerContainer.timerMeterBody = this.add.rectangle(customerContainer.meterBase.x + 22, customer.y + 1, meterWidth + 4, 12, 0x3ADB40).setOrigin(0);
      customerContainer.timerMeterBody.angle = -90;
      customerContainer.meterContainer.add(customerContainer.timerMeterBody);


      // Create container for individual fullness blocks
      customerContainer.fullnessMeterBlocks = [];

      // Create fullness meter blocks
      for (let j = 0; j < customerContainer.fullnessCapacity; j++) {
        customerContainer.fullnessMeterBlocks[j] = this.add.rectangle(customerContainer.meterBase.x, customer.y - (10 * j), 10, 20, 0xDBD53A).setOrigin(0);
        customerContainer.fullnessMeterBlocks[j].setStrokeStyle(2, 0xB9B42E);
        customerContainer.fullnessMeterBlocks[j].angle = -90;
        customerContainer.fullnessMeter.add(customerContainer.fullnessMeterBlocks[j]);
        customerContainer.meterContainer.add(customerContainer.fullnessMeterBlocks[j]);
      }

      // Hide meters
      customerContainer.meterContainer.visible = false;
    }
  }


  /* Helper Functions */
  // Updating customer count text visual
  updateCustomerCountText() {
     gameState.customersLeftCount = gameState.totalCustomerCount - gameState.customersServedCount;
     gameState.customerCountText.setText(`Customers Left: ${gameState.customersLeftCount}`);
     gameState.waveCountText.setText(`${gameState.currentWaveCount}/${gameState.totalWaveCount}`);
  };

  // Method for placing food on a plate, adjusting the fullness meter, and reporting fullness to the player.
  placeFood(food, fullnessValue) {
    if (gameState.currentMeal.children.entries.length < 3 && gameState.customerIsReady === true) {
      let xPosition = gameState.tray.x;
      switch (gameState.currentMeal.children.entries.length) {
        case 0:
          xPosition -= 90;
          break;
        case 2:
          xPosition += 90;
          break;
        }
      gameState.currentMeal.create(xPosition, gameState.tray.y, food).setScale(0.5);
      gameState.currentMeal.fullnessValue += fullnessValue;
      gameState.sfx.placeFood.play();

      // Meter: Color-change loop
      for (let i = 0; i < gameState.currentMeal.fullnessValue; i++) {
        if (gameState.currentMeal.fullnessValue < gameState.currentCustomer.fullnessCapacity) {
          gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(0xFFFA81);
        };
        if (gameState.currentMeal.fullnessValue === gameState.currentCustomer.fullnessCapacity) {
          gameState.currentCustomer.fullnessMeterBlocks[i].setFillStyle(0x3ADB40);
          gameState.currentCustomer.fullnessMeterBlocks[i].setStrokeStyle(2, 0x2EB94E);
        };

       if (gameState.currentMeal.fullnessValue > gameState.currentCustomer.fullnessCapacity) {
         for (let j = 0; j < gameState.currentCustomer.fullnessMeterBlocks.length; j++) {
          gameState.currentCustomer.fullnessMeterBlocks[j].setFillStyle(0xDB533A);
          gameState.currentCustomer.fullnessMeterBlocks[j].setStrokeStyle(2, 0xB92E2E);
         }
       }
      }
    }
  };

  // Simple method to execute updateStars method, clear meal values, reset fullness for neext customer, and prep the chef for next order.
  moveCustomerLine() {
    //Update each time customers depart
    this.updateStars(gameState.currentMeal.fullnessValue, gameState.currentCustomer.fullnessCapacity);
    gameState.currentMeal.clear(true);
    gameState.currentMeal.fullnessValue = 0;
    gameState.customersServedCount++;
    gameState.readyForNextOrder = true;
    gameState.timer.remove(gameState.timer);
    gameState.timer.paused = true;
    gameState.timer = this.time.addEvent(gameState.timer);

    //Create a new wave when customers in previous wave = 0
    if (gameState.customersServedCount === gameState.totalCustomerCount) {
      gameState.currentWaveCount++;
      gameState.gameSpeed++;
      this.destroyWave();
      //End game if all waves complete
      if (gameState.currentWaveCount > gameState.totalWaveCount) {
        gameState.currentMusic.stop();
        this.scene.stop('GameScene');
        this.scene.start('WinScene');
      }
    }
  }

  // Helper function to clear current star rating, create new rating display based on performance.
  drawStars() {
    gameState.starGroup.clear(true);
    for (let i = 0; i < gameState.starRating; i++) {
      let spacer = i * 50;
      gameState.starGroup.create(30 + spacer, 30, 'Star-full').setScale(0.6);
    }
  }

  // Helper function reports happiness of customer, updates stars and plays music. Leverages drawStars.
  updateStars(fullnessValue, fullnessCapacity) {
    if (fullnessValue === fullnessCapacity) {
      gameState.currentCustomer.list[0].setTint(0x3ADB40);
      gameState.sfx.servingCorrect.play();
      gameState.score += 100;
      gameState.scoreText.setText(`${gameState.score}`);
      if (gameState.starRating < 5) {
        gameState.starRating++;
      }
      if (gameState.starRating === 5) {
        gameState.sfx.fiveStars.play();
      }
    } else if (fullnessValue < fullnessCapacity) {
      gameState.currentCustomer.list[0].setTint(0xDB533A);
      gameState.sfx.servingIncorrect.play();
      gameState.starRating -= 2;
    } else if (fullnessValue > fullnessCapacity) {
      gameState.currentCustomer.list[0].setTint(0xDB9B3A);
      gameState.sfx.servingEmpty.play();
      gameState.starRating--;
    }
    if (gameState.starRating < 1) {
      gameState.currentMusic.stop();
      this.scene.stop('GameScene');
      this.scene.start('LoseScene');
    }
    this.drawStars();
  }

  destroyWave() {
    gameState.sfx.nextWave.play();
    for (let i = 0; i < gameState.customersServedCount; i++){
      this.tweens.add({
        targets: gameState.customers.children.entries[i],
        x: '-=300',
        duration: 750,
        angle: 0,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: gameState.customers.children.entries[i],
            x: '-=900',
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
              gameState.customers.clear(true);
              console.log(`Customers cleared.`);
              this.generateWave();
              gameState.readyForNextOrder = true;
            }
          });
        }
      });
    }
  }

  // Method to reset all game values
  restartGame() {
    gameState.score = 0,
    gameState.starRating = 5,
    gameState.gameSpeed = 1,
    gameState.currentWaveCount = 1,
    gameState.countdownTimer = 5000,
    gameState.readyForNextOrder = true,
    gameState.customersServedCount = 0
  }
}