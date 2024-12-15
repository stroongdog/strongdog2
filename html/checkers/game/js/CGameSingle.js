var CGameSingle = function(oData){

    CGameBase.call(this, oData);
    
    this._init();
    
};

CGameSingle.prototype = Object.create(CGameBase.prototype);

CGameSingle.prototype._init = function(){
    CGameBase.prototype._init();
    this._startGame();
};

CGameSingle.prototype._startGame = function(){  
    this._oInterface.configureInfoPanel(true);
    
    this._setGrid();
    this._initGrid();        

    this._activeCellClick();        

    this._oButEndTurn.addEventListener(ON_MOUSE_UP, this.changeTurn, this);

    this._oStartAnimation = new CStartAnimation(this._oDrawContainer, this._aWhitePos, this._aBlackPos, this._oAnimationContainer, true);
};

CGameSingle.prototype._setGrid = function(){
    var iLength = BOARD_LENGTH;
    var iNumCell = NUM_CELL;
    var iGridStart = -iLength/2;
    var iCellLength = CELL_LENGTH;
    var iCellStartPos = iGridStart + iCellLength/2;

    //Init Cell Position
    this._aCellPos = new Array();
    for(var i=0; i<iNumCell; i++){
        this._aCellPos[i] = new Array();
        for(var j=0; j<iNumCell; j++){                
            this._aCellPos[i][j] = {x: iCellStartPos +j*iCellLength, y: iCellStartPos +i*iCellLength};                
        }
    }
};

CGameSingle.prototype._onExitHelp = function () {
    this._oInterface.activePlayerVisible(true);
    this._bStartGame = true;
};

CGameSingle.prototype.changeTurn = function(){
    this._oButEndTurn.setVisible(false);
    
    this.countPawn();
    var bGameOver = this._checkEndGame();

    if(this._oMessage !== null){
        this._oMessage.unload();
        this._oMessage = null;
    }
    
    if(bGameOver){
        s_oInterface.activePlayerVisible(false);
        return;
    }

    if(this._iCurPlayer === PAWN_BLACK){
        this._iCurPlayer = PAWN_WHITE;
        if(s_iGameType === MODE_COMPUTER){
            this._bBlock = false;
            this._oThinking.hide();
        }    
    } else {
        this._iCurPlayer = PAWN_BLACK;
        if(s_iGameType === MODE_COMPUTER){
            this._bBlock = true;
            this._oThinking.show();
            s_oGame.moveAI();
        }            
    }

    this._oInterface.activePlayer(this._iCurPlayer);

    if(s_iGameType === MODE_HUMAN || (s_iGameType === MODE_COMPUTER && this._iCurPlayer === PAWN_WHITE)){
        this._activeCellClick();            
    }  
    
    
};

CGameSingle.prototype.cellClicked = function(iRow, iCol){

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

        this._movePawn(iRow, iCol);
    }   
};

CGameSingle.prototype._movePawn = function(iDestRow, iDestCol){
    if(!(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER)){
            if(parent.cmgGameEvent){
                parent.cmgGameEvent("start");
            }
    }
    
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

CGameSingle.prototype.onFinishMove = function(iRow, iCol, iType, aList){        
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

        if(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER){
            s_oGame._iIDTimeoutAI = setTimeout(function(){ s_oGame._movePawn(aList[0][0].row, aList[0][0].col); }, 500);
        }
   } else{
        if(this._bEat){
            var bInJumpChain = this._checkJumpToJump(iRow, iCol, iType);
        }
        
        if(!bInJumpChain || MANDATORY_JUMP_ACTIVE || !this._bEat){
            this.changeTurn();
        }  
   }
   this._bEat = false;        
};

CGameSingle.prototype._showMessage = function(){
    if(this._oMessage === null){
        this._oMessage = new CMessage(this._oAnimationContainer, this._iCurPlayer, TEXT_JUMP);
    }
};

CGameSingle.prototype.unload = function(){
    this._bStartGame = false;

    clearTimeout( this._iIDTimeoutAI );

    this._oInterface.unload();
    if(this._oEndPanel !== null){
        this._oEndPanel.unload();
    }

    createjs.Tween.removeAllTweens();
    s_oStage.removeAllChildren();
};

CGameSingle.prototype.onExit = function(){
    this.unload();
    s_oMain.gotoMenu();
};

CGameSingle.prototype.checkBoard = function(){ 
    var oClickPanel = new createjs.Shape();
    oClickPanel.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    oClickPanel.on("click", s_oGame.returnToEndPanel, s_oGame, true, oClickPanel);
    s_oStage.addChild(oClickPanel);
    
    s_oInterface.setTurnText(TEXT_CLICK_TO_RETURN);
    s_oInterface.activePlayerVisible(true);
    
    this._oEndPanel.hide();
};

CGameSingle.prototype.returnToEndPanel = function(evt, oClickPanel){ 
    s_oInterface.activePlayerVisible(false);
    
    s_oStage.removeChild(oClickPanel);
    this._oEndPanel.reShow();
};

CGameSingle.prototype.gameOver = function(iWinner){  
    this._oThinking.hide();
    
    this._bStartGame = false;

    this._oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite('msg_box'));
    this._oEndPanel.show(iWinner, this._iBlackTime, this._iWhiteTime);
    this._oEndPanel.setRestartBut(s_oGame.restartGame, s_oGame);
    this._oEndPanel.setCheckBut(s_oGame.checkBoard, s_oGame);
    this._oEndPanel.setHomeBut(s_oGame.onExit, s_oGame);
    this._oInterface.setInfoVisible(false);
};