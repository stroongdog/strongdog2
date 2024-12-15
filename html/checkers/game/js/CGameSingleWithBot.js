var CGameSingleWithBot = function(oData){

    CGameSingle.call(this, oData);

};

CGameSingleWithBot.prototype = Object.create(CGameSingle.prototype);

CGameSingleWithBot.prototype._startGame = function(){  
    this._oInterface.configureInfoPanel(true);
    this._oThinking.setMessage(TEXT_WAITING_MOVES);
    
    this._setGrid();
    this._initGrid();        

    this._activeCellClick();        

    this._oStartAnimation = new CStartAnimation(this._oDrawContainer, this._aWhitePos, this._aBlackPos, this._oAnimationContainer, true);
    
    s_oInterface.setPlayersInfo(s_oNetworkManager.getPlayerNickname(), s_oNetworkManager.getBotName());
    
};

CGameSingleWithBot.prototype.gameOver = function(iWinner){  
    this._bStartGame = false;

    this._oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
    this._oEndPanel.show(iWinner, this._iBlackTime, this._iWhiteTime);
    this._oEndPanel.setRestartBut(s_oGame._onConfirmRematch, s_oGame);
    this._oEndPanel.setCheckBut(s_oGame.checkBoard, s_oGame);
    this._oEndPanel.setHomeBut(s_oGame.onExit, s_oGame);
    this._oInterface.setInfoVisible(false);
};

CGameSingleWithBot.prototype._onConfirmRematch = function(){   
    this._oEndPanel.unload();
    
    this._oEndPanel = new CMsgBox(TEXT_WAIT_OPPONENT);

    var iTime = randomFloatBetween(200, 2000);
    
    //////DECIDE IF BOT WANT REMATCH GAME. IT SETS THAT ACCEPT MORE FREQUENTLY THEN REFUSE
    var bRematchAcceptedFromBot = Math.random() > 0.33 ? true : false;
    
    //////SIMULATE THINKING
    if(bRematchAcceptedFromBot){
        if(Math.random()> 0.4){
            setTimeout(function(){
                s_oGame._rematch();
            }, iTime);
        } else {
            s_oGame._rematch();
        }
    }else {
        if(Math.random()> 0.4){
            setTimeout(function(){
                s_oGame.onBotRefuseRematch();
            }, iTime);
        } else {
            s_oGame.onBotRefuseRematch();
        }
    }
};

CGameSingleWithBot.prototype.onBotRefuseRematch = function(){ 
    this._oEndPanel.unload();
    
    this._oEndPanel = new CMsgBox(TEXT_OPPONENT_LEFT);
    this._oEndPanel.addButton(s_oSpriteLibrary.getSprite('but_yes'), ON_MOUSE_UP, this.onExit, this);
};

CGameSingleWithBot.prototype._rematch = function(){ 
    s_oGame.restartGame();
};