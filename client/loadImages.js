function loadImages() {
    //Spongebob
    images.spongebob = new Image()
    images.spongebob.src = 'https://gyazo.com/3b9acfb270e46946247dfcd1e766f659.png'
    //Core
    images.core = new Image()
    images.core.src = 'https://cdn.glitch.com/94bbd290-d98d-4b21-9de9-9ea587a52df3%2Fcore.png?1520517517827'
    //TurretBase
    images.turretbase = new Image()
    images.turretbase.src = 'https://gyazo.com/7f99973f668f6093144d934082470ec9.png'
    //Turret
    images.turret = new Image()
    images.turret.src = 'https://gyazo.com/2ae959689e510e4b7f536e851f1520c4.png'
    //TurretIcon
    images.turreticon = new Image()
    images.turreticon.src = 'https://gyazo.com/59b952c61fa11c9ecc4fddb85a205d0d.png'
    //landmine
    images.landmine = new Image()
    images.landmine.src = 'https://gyazo.com/61d228d16c3329ceaa94a62d1b444731.png'
    //sword
    images.sword = new Image()
    images.sword.src = 'https://gyazo.com/30f1b6dc6ea8345d799e42f31b8a5c3b.png'
    //pickaxe
    images.pickaxe = new Image()
    images.pickaxe.src = 'https://gyazo.com/bd156fc91b79873c25dc92dfa8da14ca.png'
    //walls
    images.walls = {}
    // with 0 open sides
    images.walls.sides0 = new Image()
    images.walls.sides0.src = 'https://gyazo.com/fa0d5557050c833a441e3d3e6aedecb1.png'
    // with 1 open sides
    images.walls.sides1 = new Image()
    images.walls.sides1.src = 'https://gyazo.com/a9b514051559d9248cd37828173027dd.png'
    // with 2 open sides and horizontally
    images.walls.sides2hor = new Image()
    images.walls.sides2hor.src = 'https://gyazo.com/a1ea50a830bfac00a43a7b547a73a3b0.png'
    // with 2 open sides in corner
    images.walls.sides2cor = new Image()
    images.walls.sides2cor.src = 'https://gyazo.com/0de0cf69066790cf582de766778a2b43.png'
    // with 3 open sides
    images.walls.sides3 = new Image()
    images.walls.sides3.src = 'https://gyazo.com/91793dfa84a870ad5e99b05eb25b494c.png'
    // explosion
    images.explosion = {}
    for(let i = 1; i <= 19; i++) {
      images.explosion[i] = new Image()
      if(i == 1) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F1.png?alt=media&token=ea2ee003-7040-4c9b-8b77-c4f7fa609fb7'
      if(i == 2) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F2.png?alt=media&token=4c1f5bb5-084c-4b67-bfbe-92dd3a492312'
      if(i == 3) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F3.png?alt=media&token=044f16da-65e0-4188-be48-5a937fc1c479'
      if(i == 4) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F4.png?alt=media&token=db12a950-e376-4a50-bc10-3269f0435736'
      if(i == 5) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F5.png?alt=media&token=2d7673de-081e-44d7-be34-20cc77bf5f31'
      if(i == 6) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F6.png?alt=media&token=1a672166-c552-4ea8-8ebe-ae5ad7eb019a'
      if(i == 7) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F7.png?alt=media&token=a4dc0b57-e19d-49a5-a9a2-8211feb63a53'
      if(i == 8) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F8.png?alt=media&token=6fcda393-2075-43c5-99fc-40ee46b910e0'
      if(i == 9) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F9.png?alt=media&token=e05412bb-665b-4f72-904e-70f1de0f64e2'
      if(i == 10) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F10.png?alt=media&token=25fdd81f-4745-42a0-a131-2d91d920d108'
      if(i == 11) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F11.png?alt=media&token=7f390357-042d-4f44-aa21-6c9af8a4e5b4'
      if(i == 12) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F11.png?alt=media&token=7f390357-042d-4f44-aa21-6c9af8a4e5b4'
      if(i == 13) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F13.png?alt=media&token=235a3c9d-c1c6-465d-aeee-ef2e70966aaf'
      if(i == 14) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F14.png?alt=media&token=ac3ebf90-be13-412e-a46b-45b42e7039e7'
      if(i == 15) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F15.png?alt=media&token=0ff98520-5d77-4e9c-aca1-9f7fff2155a8'
      if(i == 16) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F15.png?alt=media&token=0ff98520-5d77-4e9c-aca1-9f7fff2155a8'
      if(i == 17) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F15.png?alt=media&token=0ff98520-5d77-4e9c-aca1-9f7fff2155a8'
      if(i == 18) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F18.png?alt=media&token=d38cfc50-8605-49ea-9cc2-58b905f1507b'
      if(i == 19) images.explosion[i].src = 'https://firebasestorage.googleapis.com/v0/b/fuct-db468.appspot.com/o/buildings%2Flandmine%2Fexplosion%2F19.png?alt=media&token=af71be65-46de-43bb-8e67-3d75a23a8bb4'
    }
    //mine
    images.miner = new Image()
    images.miner.src = 'https://cdn.discordapp.com/attachments/235452993741389824/424195191700848640/miner.png'
  }