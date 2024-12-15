var CGameMulti = function(oData){
    this._oMoveTimeController;
    this._iCurrentTimer;
    this._iPlayerLeft;
    this._bYouRunOutOfTime;
    
    CGameBase.call(this, oData);
    
    this._init();
    
};

CGameMulti.prototype = Object.create(CGameBase.prototype);

CGameMulti.prototype._init = function(){
    CGameBase.prototype._init();
    this._startGame();
    
    this._iPlayerLeft = null;
    this._bYouRunOutOfTime = false;
};


CGameMulti.prototype._startGame = function(){
    this._oMoveTimeController = new CMoveTimeController(CANVAS_WIDTH/2 - 400, 1610, s_oStage);
    this._oMoveTimeController.addEventListener(ON_TIMER_END, this._onTimerEnd, this);
    this._oMoveTimeController.addEventListener(ON_LAST_TIMER_END, this._onLastTimerEnd, this);
    
    this._oInterface.configureInfoPanel(s_oNetworkManager.isUserA());
    this._oThinking.setMessage(TEXT_WAITING_MOVES);
    this._oThinking.setTimerWidget();
    this._oThinking.setTransparent();
    this._iCurrentTimer = TIME_PER_MOVE;
    
    this._oButEndTurn.addEventListener(ON_MOUSE_UP, this.notifyChangeTurn, this);
    
    if(!s_oNetworkManager.isUserA()){
        this._oThinking.show();
        this._oThinking.startTimer(this._iCurrentTimer);
        
        this._oBoard.rotation = 180;
        s_oInterface.setPlayersInfo(s_oNetworkManager.getEnemyNickname(), s_oNetworkManager.getPlayerNickname());

    } else {
        s_oInterface.setPlayersInfo(s_oNetworkManager.getPlayerNickname(), s_oNetworkManager.getEnemyNickname());
    }
    
    this._setGrid();
    this._initGrid();        

    this._activeCellClick();        

    this._oStartAnimation = new CStartAnimation(this._oDrawContainer, this._aWhitePos, this._aBlackPos, this._oAnimationContainer, s_oNetworkManager.isUserA());


    s_oNetworkManager.addEventListener(ON_DISCONNECTION_FROM_MATCH, this._onConnectionCrashed);
};

CGameMulti.prototype._setGrid = function(){
    var iLength = BOARD_LENGTH;
    var iNumCell = NUM_CELL;
    var iGridStart = -iLength/2;
    var iCellLength = CELL_LENGTH;
    var iCellStartPos = iGridStart + iCellLength/2;

    //Init Cell Position
    if(s_oNetworkManager.isUserA()){    ////WHITE BOT SIDE
        this._aCellPos = new Array();
        for(var i=0; i<iNumCell; i++){
            this._aCellPos[i] = new Array();
            for(var j=0; j<iNumCell; j++){                
                this._aCellPos[i][j] = {x: iCellStartPos +j*iCellLength, y: iCellStartPos +i*iCellLength};                
            }
        }
    } else {                            ////WHITE TOP SIDE
        var iGridStart = iLength/2;
        var iCellStartPos = iGridStart - iCellLength/2;
        
        this._aCellPos = new Array();
        for(var i=0; i<iNumCell; i++){
            this._aCellPos[i] = new Array();
            for(var j=0; j<iNumCell; j++){                
                this._aCellPos[i][j] = {x: iCellStartPos -j*iCellLength, y: iCellStartPos -i*iCellLength};                
            }
        }
    }
};

CGameMulti.prototype._onExitHelp = function () {
    
    if(s_oNetworkManager.isUserA() && this._oEndPanel === null){
        this._oMoveTimeController.startTimer();
    }
    
    this._oInterface.activePlayerVisible(true);
    this._bStartGame = true;
    
};

CGameMulti.prototype.notifyChangeTurn = function(){
    s_oNetworkManager.sendMsg(MSG_PLAYER_DECLARED_END_TURN, "");
};

CGameMulti.prototype.changeTurn = function(){
    this._oButEndTurn.setVisible(false);
    
    this.countPawn();
    var bGameOver = this._checkEndGame();

    if(this._oMessage !== null){
        this._oMessage.unload();
        this._oMessage = null;
    }

    if(bGameOver){
        return;
    }

    if(this._iCurPlayer === PAWN_BLACK){
        this._iCurPlayer = PAWN_WHITE;
        if(s_iGameType === MODE_COMPUTER){
            this._bBlock = false;
        }    
        
        if(s_oNetworkManager.isUserA()){
           this._oThinking.hide();
           this._oMoveTimeController.startTimer();
        } else {
            this._oThinking.show();
            this._oThinking.startTimer(this._iCurrentTimer);

            this._oMoveTimeController.stopTimer();
        }
        
    } else {
        this._iCurPlayer = PAWN_BLACK;        
        
        if(s_oNetworkManager.isUserA()){
           this._oThinking.show();
           this._oThinking.startTimer(this._iCurrentTimer);

           this._oMoveTimeController.stopTimer();
        } else {
            this._oThinking.hide();
            this._oMoveTimeController.startTimer();
        }
    }

    this._oInterface.activePlayer(this._iCurPlayer);

    if(s_iGameType === MODE_HUMAN || (s_iGameType === MODE_COMPUTER && this._iCurPlayer === PAWN_WHITE)){
        this._activeCellClick();            
    }  
    
    if(this._oThinking.isVisible()){
        this._disableAllHighlight();
    }
    
    if(this._iPlayerLeft === this._iCurPlayer){
        var iTimeThink = MIN_AI_THINKING*2 + Math.random()*(MAX_AI_THINKING - MIN_AI_THINKING)*3;
        s_oGame.moveAI(iTimeThink);
    }
    
    
    //this.gameOver(WIN_WHITE);
};

CGameMulti.prototype.cellClicked = function(iRow, iCol){
    
    if(this._bBlock){
        return;
    }

    if (this._oActiveCell === null){
         this._activePawn(iRow,iCol);   


    }else if (this._oActiveCell.row === iRow && this._oActiveCell.col === iCol) {
        this._resetMoves();
        this._disableAllHighlight();
        this._activeCellClick();
        this._oActiveCell = null;
    } else if ( (this._oActiveCell.row !== iRow || this._oActiveCell.col !== iCol) && !this._aCell[iRow][iCol].isLegalMove() ) {
        this._resetMoves();
        this._activeCellClick();
        this._activePawn(iRow,iCol);

    } else if ( (this._oActiveCell.row !== iRow || this._oActiveCell.col !== iCol) && this._aCell[iRow][iCol].isLegalMove() ) {
        //MOVE
        this._resetMoves();
        this._disableAllHighlight();
        this._disableAllClick();

        this._oMoveTimeController.restartEndGameCounter();
        
        if(parent.cmgGameEvent){
            parent.cmgGameEvent("start");
        }
        
        this._movePawn(iRow, iCol);
    }   
};

CGameMulti.prototype._movePawn = function(iDestRow, iDestCol, bTimerEnd){
    var iCurRow = this._oActiveCell.row;
    var iCurCol = this._oActiveCell.col;
    var iCurX = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getX();
    var iCurY = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getY();
    var iCurType = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getType();

    if(iCurType < KING_WHITE){
        this._iDrawCounter = 0;
    }

    var iDistRow = (this._oActiveCell.row - iDestRow) / 2;
    var iDistCol = (this._oActiveCell.col - iDestCol) / 2;
    if(Math.abs(iDistRow) > 0.5){
        //EAT PAWN
        this._bEat = true;
        this._oEatenPawn = {row: this._oActiveCell.row - iDistRow, col: this._oActiveCell.col - iDistCol};             
    };
    this._aCell[this._oActiveCell.row][this._oActiveCell.col].setColor(PAWN_NULL);
    this._aCellSupport[this._oActiveCell.row][this._oActiveCell.col] = PAWN_NULL;
    var oCopyCell = new CMovingCell(iCurX, iCurY, iCurType, this._oGridContainer);            

    var iDestX = this._aCell[iDestRow][iDestCol].getX();
    var iDestY = this._aCell[iDestRow][iDestCol].getY();

    var aList = new Array();
    aList = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getMovesChain();        

    if(aList[0] !== undefined && aList[0].length > 1){
        oCopyCell.move(iDestX, iDestY, TIME_MOVE, iDestRow, iDestCol, aList);
    } else {
        oCopyCell.move(iDestX, iDestY, TIME_MOVE, iDestRow, iDestCol, null);
    } 

    this._oActiveCell = null;

    ////// SEND MOVES
    var oCurMoveToSend = {sourcerow: iCurRow, sourcecol: iCurCol, destrow: iDestRow, destcol: iDestCol, timerend: bTimerEnd};
    
    var oJSONData = {};
    oJSONData[MSG_MOVE] = oCurMoveToSend;

    s_oNetworkManager.sendMsg(MSG_MOVE, JSON.stringify(oJSONData));

    this._oMoveTimeController.stopTimer();
};

CGameMulti.prototype.onFinishMove = function(iRow, iCol, iType, aList){
    if(!this._oThinking.isVisible()){
        this._oMoveTimeController.startTimer();
    }

    playSound("click_cell",1,false);

    if(iType === PAWN_BLACK && iRow === NUM_CELL -1){
        playSound("king",1,false);

        this._aCell[iRow][iCol].setColor(KING_BLACK);
        this._aCellSupport[iRow][iCol] = KING_BLACK;
        this._iBlackEaten--;
        this._oInterface.refreshBlackPawnNumber(this._iBlackEaten);
    } else if(iType === PAWN_WHITE && iRow === 0){
        playSound("king",1,false);

        this._aCell[iRow][iCol].setColor(KING_WHITE);
        this._aCellSupport[iRow][iCol] = KING_WHITE;
        this._iWhiteEaten--;
        this._oInterface.refreshWhitePawnNumber(this._iWhiteEaten);
    } else {
        this._aCell[iRow][iCol].setColor(iType);
        this._aCellSupport[iRow][iCol] = iType;
    }

    if(this._bEat){    

        this._iDrawCounter = 0;


        if(this._aCell[this._oEatenPawn.row][this._oEatenPawn.col].getType() === PAWN_BLACK){
            this._iBlackEaten++;
            this._oInterface.refreshBlackPawnNumber(this._iBlackEaten);
        } else if(this._aCell[this._oEatenPawn.row][this._oEatenPawn.col].getType() === PAWN_WHITE){
            this._iWhiteEaten++;
            this._oInterface.refreshWhitePawnNumber(this._iWhiteEaten);
        } else if(this._aCell[this._oEatenPawn.row][this._oEatenPawn.col].getType() === KING_BLACK){
            this._iBlackEaten +=2;
            this._oInterface.refreshBlackPawnNumber(this._iBlackEaten);
        } else {
            this._iWhiteEaten +=2;
            this._oInterface.refreshWhitePawnNumber(this._iWhiteEaten);
        }

        this._aCell[this._oEatenPawn.row][this._oEatenPawn.col].setColor(PAWN_NULL);
        this._aCellSupport[this._oEatenPawn.row][this._oEatenPawn.col] = PAWN_NULL;

    }


    this._resetMoves();

   if(aList !== null && aList.length > 0){

        this._aCell[iRow][iCol].setMovesChain(aList);

        this._oActiveCell = {row: iRow, col: iCol};
        this._disableAllHighlight();

        if(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER){
            this._aCell[iRow][iCol].highlight(false);
        } else {
            this._aCell[iRow][iCol].highlight(true);
        }


        for(var j=0; j<aList.length; j++){
            this._aCell[aList[j][0].row][aList[j][0].col].showMoves(true, iType);
            this._aCell[aList[j][0].row][aList[j][0].col].setLegalMove(true);
            this._aCell[aList[j][0].row][aList[j][0].col].setClickableArea(true);
        }

        if(this._iPlayerLeft === this._iCurPlayer){

            setTimeout(function(){ s_oGame._movePawn(aList[0][0].row, aList[0][0].col); }, 500);
        }

   } else{
       //this.changeTurn();     
       if(this._bEat){
            var bInJumpChain = this._checkJumpToJump(iRow, iCol, iType);
        }
        
        if(!bInJumpChain || MANDATORY_JUMP_ACTIVE || !this._bEat){
            this.changeTurn();
        }  
        
        if( (s_oNetworkManager.isUserA() && this._iCurPlayer === PAWN_BLACK) || (!s_oNetworkManager.isUserA() && this._iCurPlayer === PAWN_WHITE)){
            this._oButEndTurn.setVisible(false);
        }
    }
   
    this._bEat = false;        
};

CGameMulti.prototype.remoteMovePiece = function(oRemoteMove){    
    if(oRemoteMove.timerend === true){
        this._iCurrentTimer = TIME_PER_MOVE/2;
    } else {
        this._iCurrentTimer = TIME_PER_MOVE;
    }
    
    this._oActiveCell = {row: oRemoteMove.sourcerow, col: oRemoteMove.sourcecol};
    var iDestRow = oRemoteMove.destrow;
    var iDestCol = oRemoteMove.destcol;
    
    
    var iCurX = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getX();
    var iCurY = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getY();
    var iCurType = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getType();

    if(iCurType < KING_WHITE){
        this._iDrawCounter = 0;
    }

    var iDistRow = (this._oActiveCell.row - iDestRow) / 2;
    var iDistCol = (this._oActiveCell.col - iDestCol) / 2;
    if(Math.abs(iDistRow) > 0.5){
        //EAT PAWN
        this._bEat = true;
        this._oEatenPawn = {row: this._oActiveCell.row - iDistRow, col: this._oActiveCell.col - iDistCol};             
    };
    this._aCell[this._oActiveCell.row][this._oActiveCell.col].setColor(PAWN_NULL);
    this._aCellSupport[this._oActiveCell.row][this._oActiveCell.col] = PAWN_NULL;
    var oCopyCell = new CMovingCell(iCurX, iCurY, iCurType, this._oGridContainer);            

    var iDestX = this._aCell[iDestRow][iDestCol].getX();
    var iDestY = this._aCell[iDestRow][iDestCol].getY();

    var aList = new Array();
    aList = this._aCell[this._oActiveCell.row][this._oActiveCell.col].getMovesChain();        

    if(aList[0] !== undefined && aList[0].length > 1){
        oCopyCell.move(iDestX, iDestY, TIME_MOVE, iDestRow, iDestCol, aList);
    } else {
        oCopyCell.move(iDestX, iDestY, TIME_MOVE, iDestRow, iDestCol, null);
    } 

    this._oActiveCell = null;
    
};

CGameMulti.prototype._onTimerEnd = function(){
    s_oGame._disableAllHighlight();
    
    var aCopyBoard = s_oGame._copyMatrix(s_oGame._aCellSupport);
    var aAllMoves = s_oGame._findAllMoves(aCopyBoard, s_oGame._iCurPlayer);

    var iRandomIndex = Math.floor( (Math.random()*aAllMoves.length) );
    var oRandomMove = aAllMoves[iRandomIndex];
    
    if(oRandomMove.rawpath !== null){
        ////EAT
        s_oGame._oActiveCell = {row: oRandomMove.currow, col: oRandomMove.curcol};
        var oDest = oRandomMove.rawpath[0].model;
        s_oGame._movePawn(oDest.row, oDest.col, true);
        
        if(oRandomMove.rawpath.length > 1){
            s_oGame._oMoveTimeController.startTimer();
        }
    }else {
        ////MOVE
        s_oGame._oActiveCell = {row: oRandomMove.currow, col: oRandomMove.curcol};
        s_oGame._movePawn(oRandomMove.destrow, oRandomMove.destcol, true);
    }
};

CGameMulti.prototype._onLastTimerEnd = function(){
    console.log("LAST TIMER. END THE GAME");
    
    var iWinner;
    if(s_oNetworkManager.isUserA()){
        iWinner = WIN_BLACK;
    }else {
        iWinner = WIN_WHITE;
    }
    
    this._bYouRunOutOfTime = true;
    
    s_oGame.gameOver(iWinner);
    s_oGame._oEndPanel.setExplMessage("(" +TEXT_YOU_RUN_OUT_TIME.toUpperCase()+")");
    
    s_oNetworkManager.sendMsg(MSG_LAST_TIMER_END, "");
};

CGameMulti.prototype.onRemoteLastTimerEnd = function(){
    var iWinner;
    if(s_oNetworkManager.isUserA()){
        iWinner = WIN_WHITE;
    }else {
        iWinner = WIN_BLACK;
    }
    s_oGame.gameOver(iWinner);    
    s_oGame._oEndPanel.setExplMessage("(" +TEXT_TIMER_END.toUpperCase()+")");
};

CGameMulti.prototype._showMessage = function(){
    if(this._oMessage === null && !this._oThinking.isVisible()){
        if(s_oNetworkManager.isUserA()){
            if(this._iCurPlayer === PAWN_WHITE){
                this._oMessage = new CMessage(this._oAnimationContainer, this._iCurPlayer, TEXT_JUMP);
            }
        } else {
            if(this._iCurPlayer === PAWN_BLACK){
                this._oMessage = new CMessage(this._oAnimationContainer, this._getOtherPlayer(this._iCurPlayer), TEXT_JUMP);
            }
        }
    }
};

CGameMulti.prototype.unload = function(){
    this._bStartGame = false;

    s_oGame._oMoveTimeController.unload();

    clearTimeout( this._iIDTimeoutAI );

    this._oInterface.unload();
    if(this._oEndPanel !== null){
        this._oEndPanel.unload();
    }

    createjs.Tween.removeAllTweens();
    s_oStage.removeAllChildren();
    
    s_oNetworkManager.addEventListener(ON_DISCONNECTION_FROM_MATCH, function(){});
};

CGameMulti.prototype.onExit = function(){
    s_oGame.unload();
    s_oMain.gotoMenu();

    s_oNetworkManager.disconnect();
};

CGameMulti.prototype.gameOver = function(iWinner){  
    this._oThinking.hide();
    s_oInterface.activePlayerVisible(false);
    
    this._bStartGame = false;

    var bWinnerUserA = false;
    if(iWinner === WIN_WHITE){
        if(s_oNetworkManager.isUserA()){
            bWinnerUserA = true;
        }
    } else{
        if(!s_oNetworkManager.isUserA()){
            bWinnerUserA = true;
        }
    }
    
    s_oGame._oMoveTimeController.stopTimer();
    s_oNetworkManager.sendMsg(MSG_END_MATCH, bWinnerUserA);

    this._oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
    this._oEndPanel.show(iWinner, this._iBlackTime, this._iWhiteTime);
    this._oInterface.setInfoVisible(false);

};

CGameMulti.prototype.showRematchQuestion = function(){ 
    this._oEndPanel.setRestartBut(s_oGame._onConfirmRematch, s_oGame);
    this._oEndPanel.setCheckBut(s_oGame.checkBoard, s_oGame);
    this._oEndPanel.setHomeBut(s_oGame.onExit, s_oGame);
    
    if(s_oGame._iPlayerLeft !== null){
        s_oGame.onOpponentRefuseRematch();
    }
};

CGameMulti.prototype.checkBoard = function(){ 
    
    var oClickPanel = new createjs.Shape();
    oClickPanel.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    oClickPanel.on("click", s_oGame.returnToEndPanel, s_oGame, true, oClickPanel);
    s_oStage.addChild(oClickPanel);
    
    s_oInterface.setTurnText(TEXT_CLICK_TO_RETURN);
    s_oInterface.activePlayerVisible(true);
    
    this._oEndPanel.hide();
};

CGameMulti.prototype.returnToEndPanel = function(evt, oClickPanel){ 
    s_oInterface.activePlayerVisible(false);
    
    s_oStage.removeChild(oClickPanel);
    this._oEndPanel.reShow();
};

CGameMulti.prototype._onConfirmRematch = function(){ 
    s_oGame._oEndPanel.hideMessage();
    s_oGame._oEndPanel.setWaitingMsg();
    s_oGame._oEndPanel.hideButtons();

    s_oNetworkManager.sendMsg(MSG_ACCEPT_REMATCH, "");    
};

CGameMulti.prototype.onOpponentRefuseRematch = function(){ 
    s_oGame._oEndPanel.showMessage();
    if(s_oGame._iPlayerLeft !== null){
        s_oGame._oEndPanel.setExplMessage(TEXT_OPPONENT_LEFT);

        if(this._bYouRunOutOfTime){
            s_oGame._oEndPanel.setExplMessage("(" +TEXT_YOU_RUN_OUT_TIME.toUpperCase()+")");
        }
        
    }else {
        s_oGame._oEndPanel.setExplMessage(TEXT_OPPONENT_LEFT);
    }
    s_oGame._oEndPanel.showButtons();
    s_oGame._oEndPanel.hideRestartButton();
    s_oGame._oEndPanel.centerRemainingButtons();
};

CGameMulti.prototype.notifyAcceptedRematch = function(){ 
    s_oGame._oEndPanel.setExplMessage(TEXT_OPPONENT_WANT_TO_PLAY_AGAIN);
};

CGameMulti.prototype.onOpponentAcceptRematch = function(){ 
    if(!s_oNetworkManager.isUserA()){
        this._oThinking.show();
        this._oThinking.startTimer(TIME_PER_MOVE);
    } else {
        this._oThinking.hide();
    }
    
    this._oMoveTimeController.restartEndGameCounter();
    this._iCurrentTimer = TIME_PER_MOVE;

    s_oGame.restartGame();
};

CGameMulti.prototype._onConnectionCrashed = function(){
    if(this._oEndPanel){
        this._oEndPanel.unload();
    }

    this._oThinking.hide();

    s_oGame._oMoveTimeController.stopTimer();
    
    s_oInterface.activePlayerVisible(false);

    this._oEndPanel = new CMsgBox(TEXT_DISCONNECTED_FROM_SERVER);
    this._oEndPanel.addButton(s_oSpriteLibrary.getSprite('but_yes'), ON_MOUSE_UP, s_oGame.onExit, this);
    
    s_oNetworkManager.sendMsg(MSG_DISCONNECTION, "");
};

CGameMulti.prototype.opponentLeftTheGame = function(){
    if( s_oNetworkManager.isUserA() ){
        s_oGame._iPlayerLeft = PAWN_BLACK;
    }else {
        s_oGame._iPlayerLeft = PAWN_WHITE;
    }
    
    
    if(this._iPlayerLeft === this._iCurPlayer){
        var iTimeThink = MIN_AI_THINKING*2 + Math.random()*(MAX_AI_THINKING - MIN_AI_THINKING)*3;
        s_oGame.moveAI(iTimeThink);
    }
    
};

