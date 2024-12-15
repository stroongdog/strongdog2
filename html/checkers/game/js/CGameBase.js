var CGameBase = function(oData){

    this._bTouchActive;
    this._bStartGame;
    this._bValidMoves;
    this._bEat;
    this._bConstrainedMoves;
    this._bBlock = false;
    
    this._iCurPlayer;
    this._iTurnStallCount;
    this._iWhiteEaten;
    this._iBlackEaten;
    this._iBlackTime;
    this._iWhiteTime;
    this._iContJump;
    this._iNumBlack;
    this._iNumWhite;
    this._iDrawCounter = 0;
    this._iIDTimeoutAI;

    this._aCellPos;
    this._aCell;
    this._aCellSupport;
    this._aWhitePos;
    this._aBlackPos;
    this._aCellConstrained;
    this._aMovesAvailable;

    this._oInterface;
    this._oEndPanel = null;
    this._oParent;
    this._oAnimationContainer;
    this._oGridContainer;
    this._oDrawContainer;
    this._oThinking;
    this._oBoard;
    this._oActiveCell = null;
    this._oEatenPawn;
    this._oMoveTree;
    this._oDecisionTree;
    this._oMessage = null;
    this._oStartAnimation;
    this._oAI;
};

CGameBase.prototype._init = function(){

    this._reset();

    var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
    s_oStage.addChild(oBg); //Draws on canvas

    var iOffset = -66;
    var iScale = 1.1;

    this._oDrawContainer = new createjs.Container();
    this._oDrawContainer.x = CANVAS_WIDTH/2;
    this._oDrawContainer.y = CANVAS_HEIGHT/2 + iOffset;
    this._oDrawContainer.scaleX = this._oDrawContainer.scaleY = iScale;
    s_oStage.addChild(this._oDrawContainer);

    this._oGridContainer = new createjs.Container();
    this._oGridContainer.x = CANVAS_WIDTH/2;
    this._oGridContainer.y = CANVAS_HEIGHT/2 + iOffset;
    this._oGridContainer.scaleX = this._oGridContainer.scaleY = iScale;
    s_oStage.addChild(this._oGridContainer);

    this._oAnimationContainer = new createjs.Container();
    this._oAnimationContainer.x = CANVAS_WIDTH/2;
    this._oAnimationContainer.y = CANVAS_HEIGHT/2 + iOffset;
    this._oAnimationContainer.scaleX = this._oAnimationContainer.scaleY = iScale;
    s_oStage.addChild(this._oAnimationContainer);

    var oSprite = s_oSpriteLibrary.getSprite('board8');

    this._oBoard = new createBitmap(oSprite);
    this._oBoard.regX = oSprite.width/2;
    this._oBoard.regY = oSprite.height/2;
    this._oGridContainer.addChild(this._oBoard);
    
    var oSprite = s_oSpriteLibrary.getSprite('but_end_turn');
    this._oButEndTurn = new CGfxButton(CANVAS_WIDTH/2 + 400 , 1610, oSprite,s_oStage);
    this._oButEndTurn.setVisible(false);
    
    this._oThinking = new CThinking();
    this._oThinking.hide();
    
    this._oInterface = new CInterface(this._oAnimationContainer);  
    
    this._oAI = new CAIController();
    
};

CGameBase.prototype._reset = function(){
    this._bTouchActive=false;
    this._bStartGame=false;
    this._bValidMoves = false;
    this._bEat = false;
    this._bConstrainedMoves = false;

    this._iCurPlayer = PAWN_WHITE;
    this._iTurnStallCount = 0;
    this._iBlackEaten = 0;
    this._iWhiteEaten = 0;
    this._iBlackTime = 0;
    this._iWhiteTime = 0;
    this._iContJump = 0;

    this._aCellConstrained = new Array();
};

CGameBase.prototype._initGrid = function(){
    this._aCell = new Array();
    this._aCellSupport = new Array();
    var iBgColor = BG_WHITE;
    for(var i=0; i<NUM_CELL; i++){
        this._aCell[i] = new Array();
        this._aCellSupport[i] = new Array();
        for(var j=0; j<NUM_CELL; j++){
            var iType = -1;
            this._aCell[i][j] = new CCell(this._aCellPos[i][j].x, this._aCellPos[i][j].y, iType, i,j, iBgColor,this._oGridContainer);
            this._aCell[i][j].setVisible(false);
            this._aCellSupport[i][j] = iType;
            if(iBgColor === BG_BLACK){
                iBgColor = BG_WHITE;
            } else {
                iBgColor = BG_BLACK;
            }
        }
        if(i%2 === 1){
            iBgColor = BG_WHITE;
        } else {
            iBgColor = BG_BLACK;
        }
    }

    this._initPieces();

    this._oInterface.activePlayer(PAWN_WHITE);

};

CGameBase.prototype._initPieces = function(){
    
    this._aBlackPos = new Array();
    for(var i=0; i<3; i++){
        for(var j=0; j<NUM_CELL; j++){
            if( this._aCell[i][j].getBgColor()===BG_BLACK ){
                this._aCell[i][j].setColor(PAWN_BLACK);
                this._aCellSupport[i][j] = PAWN_BLACK;
                this._aBlackPos.push({x: this._aCell[i][j].getGlobalX(), y: this._aCell[i][j].getGlobalY()});

            }                
        }
    }

    this._aWhitePos = new Array();
    for(var i=NUM_CELL - 3; i<NUM_CELL; i++){
        for(var j=0; j<NUM_CELL; j++){
            if( this._aCell[i][j].getBgColor()===BG_BLACK ){
                this._aCell[i][j].setColor(PAWN_WHITE);
                this._aCellSupport[i][j] = PAWN_WHITE;
                this._aWhitePos.push({x: this._aCell[i][j].getGlobalX(), y: this._aCell[i][j].getGlobalY()});
            }                
        }
    }
};


CGameBase.prototype._checkEndGame = function(){
    
    if(this._iNumBlack === 0){
        this.gameOver(WIN_WHITE);
        return true;
    }
    if(this._iNumWhite === 0){
        this.gameOver(WIN_BLACK);
        return true;
    }


    this._iDrawCounter++;
    if(this._iDrawCounter === DRAW_COUNTER){
        this.gameOver(DRAW);
        return true;
    }   

    if(this._iCurPlayer === PAWN_WHITE){
        var bMovesAvailable = this._checkCanMove(PAWN_BLACK);
        if(!bMovesAvailable){
            this.gameOver(WIN_WHITE_BLACK_NOMOVES);
            return true;
        }
    } else {            
        var bMovesAvailable = this._checkCanMove(PAWN_WHITE);
        if(!bMovesAvailable){
            this.gameOver(WIN_BLACK_WHITE_NOMOVES);
            return true;
        }            
    }
    
    return false;
};

CGameBase.prototype._disableAllClick = function(){
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            this._aCell[i][j].setClickableArea(false);
        }
    }        
};



CGameBase.prototype._activePawn = function(iRow, iCol){
    this._oActiveCell = {row: iRow, col: iCol};

    this._disableAllHighlight();

    if(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER){
        this._aCell[iRow][iCol].highlight(false, false);
    } else {
        this._aCell[iRow][iCol].highlight(true);

    }
    var iType = this._aCell[iRow][iCol].getType();

    if(MANDATORY_JUMP_ACTIVE){
        this._checkLegalMoves(iRow, iCol, iType, this._aCellSupport, this._iCurPlayer);
    }else {
        this._aMovesAvailable = new Array();
        var oList = this._getAvailableMovesPerCell(iRow, iCol, iType, this._aCellSupport, this._iCurPlayer);
        this._aMovesAvailable = oList.aListMovesAvailable;
    }

    this._enableMoves(iType);
};

CGameBase.prototype._getAvailableMovesPerCell = function(iRow, iCol, iType, aMatrix, iCurPlayer){
    var bEat = false;
    var aMovesTemp = new Array();
    
    if(iType > PAWN_BLACK){

        //Check Left down
        if(iCol > 0 && iRow < NUM_CELL-1 && aMatrix[iRow+1][iCol-1] === PAWN_NULL){

            aMovesTemp.push({row: iRow+1, col: iCol-1, move: PAWN_MOVE, eatentype: aMatrix[iRow+1][iCol-1], eatenrow: iRow+1, eatencol:iCol-1});

        } else if(iCol > 1 && iRow < NUM_CELL-2 && aMatrix[iRow+1][iCol-1]%2 !== iCurPlayer && aMatrix[iRow+2][iCol-2] === PAWN_NULL){

            aMovesTemp.push({row: iRow+2, col: iCol-2, move: PAWN_EAT, eatentype: aMatrix[iRow+1][iCol-1], eatenrow: iRow+1, eatencol:iCol-1});
            bEat = true;
        }
        //Check Right down
        if(iCol < NUM_CELL-1 && iRow < NUM_CELL-1 && aMatrix[iRow+1][iCol+1] === PAWN_NULL){

            aMovesTemp.push({row: iRow+1, col: iCol+1, move: PAWN_MOVE, eatentype: aMatrix[iRow+1][iCol+1], eatenrow: iRow+1, eatencol:iCol+1});

        } else if(iCol < NUM_CELL-2 && iRow < NUM_CELL-2 && aMatrix[iRow+1][iCol+1]%2 !== iCurPlayer && aMatrix[iRow+2][iCol+2] === PAWN_NULL){

            aMovesTemp.push({row: iRow+2, col: iCol+2, move: PAWN_EAT, eatentype: aMatrix[iRow+1][iCol+1], eatenrow: iRow+1, eatencol:iCol+1});               
            bEat = true;
        }
        //Check Left up
        if(iCol > 0 && iRow > 0 && aMatrix[iRow-1][iCol-1] === PAWN_NULL){

            aMovesTemp.push({row: iRow-1, col: iCol-1, move: PAWN_MOVE, eatentype: aMatrix[iRow-1][iCol-1], eatenrow: iRow-1, eatencol:iCol-1});

        } else if(iCol > 1 && iRow > 1 && aMatrix[iRow-1][iCol-1]%2 !== iCurPlayer && aMatrix[iRow-2][iCol-2] === PAWN_NULL){
            aMovesTemp.push({row: iRow-2, col: iCol-2, move: PAWN_EAT, eatentype: aMatrix[iRow-1][iCol-1], eatenrow: iRow-1, eatencol:iCol-1});
            bEat = true;
        }
        //Check Right up
        if(iCol < NUM_CELL-1 && iRow > 0 && aMatrix[iRow-1][iCol+1] === PAWN_NULL){

            aMovesTemp.push({row: iRow-1, col: iCol+1, move: PAWN_MOVE, eatentype: aMatrix[iRow-1][iCol+1], eatenrow: iRow-1, eatencol:iCol+1});

        } else if(iCol < NUM_CELL-2 && iRow > 1 && aMatrix[iRow-1][iCol+1]%2 !== iCurPlayer && aMatrix[iRow-2][iCol+2] === PAWN_NULL){

            aMovesTemp.push({row: iRow-2, col: iCol+2, move: PAWN_EAT, eatentype: aMatrix[iRow-1][iCol+1], eatenrow: iRow-1, eatencol:iCol+1});
            bEat = true;
        }
    }

    if(iType === PAWN_WHITE){
        //Check Left
        if(iCol > 0 && iRow > 0 && aMatrix[iRow-1][iCol-1] === PAWN_NULL){

            aMovesTemp.push({row: iRow-1, col: iCol-1, move: PAWN_MOVE, eatentype: aMatrix[iRow-1][iCol-1], eatenrow: iRow-1, eatencol:iCol-1});

        } else if(iCol > 1 && iRow > 1 && aMatrix[iRow-1][iCol-1]%2 !== iCurPlayer && aMatrix[iRow-2][iCol-2] === PAWN_NULL){

            aMovesTemp.push({row: iRow-2, col: iCol-2, move: PAWN_EAT, eatentype: aMatrix[iRow-1][iCol-1], eatenrow: iRow-1, eatencol:iCol-1});
            bEat = true;
        }
        //Check Right
        if(iCol < NUM_CELL-1 && iRow > 0 && aMatrix[iRow-1][iCol+1] === PAWN_NULL){

            aMovesTemp.push({row: iRow-1, col: iCol+1, move: PAWN_MOVE, eatentype: aMatrix[iRow-1][iCol+1], eatenrow: iRow-1, eatencol:iCol+1});

        } else if(iCol < NUM_CELL-2 && iRow > 1 && aMatrix[iRow-1][iCol+1]%2 !== iCurPlayer && aMatrix[iRow-2][iCol+2] === PAWN_NULL){

            aMovesTemp.push({row: iRow-2, col: iCol+2, move: PAWN_EAT, eatentype: aMatrix[iRow-1][iCol+1], eatenrow: iRow-1, eatencol:iCol+1});
            bEat = true;
        }

    } else if(iType === PAWN_BLACK){
        //Check Left
        if(iCol > 0 && iRow < NUM_CELL-1 && aMatrix[iRow+1][iCol-1] === PAWN_NULL){

            aMovesTemp.push({row: iRow+1, col: iCol-1, move: PAWN_MOVE, eatentype: aMatrix[iRow+1][iCol-1], eatenrow: iRow+1, eatencol:iCol-1});

        } else if(iCol > 1 && iRow < NUM_CELL-2 && aMatrix[iRow+1][iCol-1]%2 !== iCurPlayer && aMatrix[iRow+2][iCol-2] === PAWN_NULL){

            aMovesTemp.push({row: iRow+2, col: iCol-2, move: PAWN_EAT, eatentype: aMatrix[iRow+1][iCol-1], eatenrow: iRow+1, eatencol:iCol-1});
            bEat = true;
        }
        //Check Right
        if(iCol < NUM_CELL-1 && iRow < NUM_CELL-1 && aMatrix[iRow+1][iCol+1] === PAWN_NULL){

            aMovesTemp.push({row: iRow+1, col: iCol+1, move: PAWN_MOVE, eatentype: aMatrix[iRow+1][iCol+1], eatenrow: iRow+1, eatencol:iCol+1});

        } else if(iCol < NUM_CELL-2 && iRow < NUM_CELL-2 && aMatrix[iRow+1][iCol+1]%2 !== iCurPlayer && aMatrix[iRow+2][iCol+2] === PAWN_NULL){

            aMovesTemp.push({row: iRow+2, col: iCol+2, move: PAWN_EAT, eatentype: aMatrix[iRow+1][iCol+1], eatenrow: iRow+1, eatencol:iCol+1});               
            bEat = true;
        }
    }
    
    return {jumpavailable: bEat, aListMovesAvailable: aMovesTemp};
};

CGameBase.prototype._checkLegalMoves = function(iRow, iCol, iType, aMatrix, iCurPlayer){
    this._aMovesAvailable = new Array();

    var oMoves = this._getAvailableMovesPerCell(iRow, iCol, iType, aMatrix, iCurPlayer);
    var bEat = oMoves.jumpavailable;
    var aMovesTemp = oMoves.aListMovesAvailable;
    

    if(bEat){
        for (var i=0; i<aMovesTemp.length; i++){
            if(aMovesTemp[i].move === PAWN_EAT){
                this._aMovesAvailable.push(aMovesTemp[i]); 
            }
        }
        return {move: PAWN_EAT, listmove: this._aMovesAvailable};
    } else {
        for (var i=0; i<aMovesTemp.length; i++){
            if(aMovesTemp[i].move === PAWN_MOVE){
                this._aMovesAvailable.push(aMovesTemp[i]); 
            }
        }
        return {move: PAWN_MOVE, listmove: this._aMovesAvailable};
    }
};

CGameBase.prototype._checkJumpToJump = function(iRow, iCol, iType){
    ///// I REMOVED EVERY CONSTRAINED MOVE IF NO MANDATORY JUMP. THEN RE-EVALUATE AT EVERY JUMP IF EXIST
    ///EVERY PATH POSSIBLE. WITH EVALUATE PATH I SET A CONSTRAINT IN ONE SPECIFIC
    this._oButEndTurn.setVisible(false);
    this._aMovesAvailable = new Array();
    var oList = this._getAvailableMovesPerCell(iRow, iCol, iType, this._aCellSupport, this._iCurPlayer);

    ///I NEED TO CHECK IF THERE ARE ONLY JUMP, AND THEN RETURN
    var aJumpList = new Array();
    for(var i=0; i<oList.aListMovesAvailable.length; i++){
        var oMove = oList.aListMovesAvailable[i];
        if(oMove.move === PAWN_EAT){
            aJumpList.push(oMove);
        }
    }

    if(aJumpList.length>0){
        this._oButEndTurn.setVisible(true);
        
        this._aMovesAvailable = aJumpList;

        this._oActiveCell = {row: iRow, col: iCol};
        this._disableAllHighlight();

        if(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER){
            this._aCell[iRow][iCol].highlight(false);
        } else {
            this._aCell[iRow][iCol].highlight(true);
        }

        for(var j=0; j<aJumpList.length; j++){
            this._aCell[aJumpList[j].row][aJumpList[j].col].showMoves(true, iType);
            this._aCell[aJumpList[j].row][aJumpList[j].col].setLegalMove(true);
            this._aCell[aJumpList[j].row][aJumpList[j].col].setClickableArea(true);
        }
        return true;
    }else {
        return false;
    }

};

CGameBase.prototype._enableMoves = function(iType){

    var iDestRow;
    var iDestCol;
    for (var i=0; i<this._aMovesAvailable.length; i++){
        iDestRow = this._aMovesAvailable[i].row;
        iDestCol = this._aMovesAvailable[i].col;

        this._aCell[iDestRow][iDestCol].showMoves(true, iType);
        this._aCell[iDestRow][iDestCol].setLegalMove(true);
        this._aCell[iDestRow][iDestCol].setClickableArea(true);            
    }
};

CGameBase.prototype.moveAI = function(iCustomTime){
    var aList = s_oGame._oAI.getMoves(s_oGame._iCurPlayer);
    var iTimeThink = MIN_AI_THINKING + Math.random()*(MAX_AI_THINKING - MIN_AI_THINKING);
    if(iCustomTime){
        iTimeThink = iCustomTime;
    } 

    s_oGame._iIDTimeoutAI = setTimeout(function(){
        s_oGame._movePawn(aList[0][0].row, aList[0][0].col); 
    }, iTimeThink);
};

CGameBase.prototype.restartGame = function () {
    s_oGame._oEndPanel.unload();
    s_oGame._oEndPanel = null;
    
    this._oActiveCell = null;
    s_oGame._disableAllHighlight();
    
    this._reset();
    
    for(var i=0; i<NUM_CELL; i++){
        for(var j=0; j<NUM_CELL; j++){    
            this._aCell[i][j].setColor(-1);
            this._aCellSupport[i][j] = -1;
        }   
    }
    
    this._initPieces();
    s_oGame.setAllVisible(true);
    
    s_oGame._oInterface.resetInfo();
    s_oGame._oInterface.refreshWhitePawnNumber(0);
    s_oGame._oInterface.refreshBlackPawnNumber(0);
    //s_oGame._oInterface.setInfoVisible(true);
    
    s_oGame._oInterface.activePlayer(this._iCurPlayer);
    s_oGame._activeCellClick();
    
    if(this._oMessage){
        this._oMessage.unload();
    }
    
    this._bStartGame = true;
    this._bBlock = false;
    
    s_oGame._onExitHelp();
};        

CGameBase.prototype.pauseGame = function(bVal){
    this._bStartGame = !bVal;
};

CGameBase.prototype.update = function(){
    if(this._bStartGame){
        //if(this._oThinking !== null){
            this._oThinking.update();
        //}

        if(this._iCurPlayer === PAWN_WHITE){
            this._iWhiteTime += s_iTimeElaps;
            //this._oInterface.refreshWhiteTime(this._iWhiteTime);
        } else {
            this._iBlackTime += s_iTimeElaps;
            //this._oInterface.refreshBlackTime(this._iBlackTime);
        }                     
    }
};

CGameBase.prototype._disableAllHighlight = function(){
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            this._aCell[i][j].highlight(false);
            this._aCell[i][j].showMoves(false, false);
        }
    }            
};

CGameBase.prototype.setAllVisible = function(bVal){
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            this._aCell[i][j].setVisible(bVal);   
        }
    }      
};

CGameBase.prototype._checkMatrix = function(aMatrixToCheck){
    var iRowToSee = "";
    for(var i = 0; i < NUM_CELL; i++) {            
        for(var j = 0; j < NUM_CELL; j++) {
            if(aMatrixToCheck[i][j] >= 0){
                iRowToSee += " " +aMatrixToCheck[i][j] + " | ";
            } else {
                iRowToSee += aMatrixToCheck[i][j] + " | ";
            }  
        }
        iRowToSee += "|| "+i+"\n"

    }  
    trace(iRowToSee);
};

CGameBase.prototype._copyMatrix = function(aMatrixToCopy){

    var oMatrix = new Array();
    for(var i = 0; i < NUM_CELL; i++) {
        oMatrix[i] = new Array(); 
        for(var j = 0; j < NUM_CELL; j++) {
            oMatrix[i][j] = aMatrixToCopy[i][j];   
        }
    }

    return oMatrix;
};

CGameBase.prototype._resetMoves = function(){
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            this._aCell[i][j].setLegalMove(false);   
        }
    }      
};

CGameBase.prototype._checkRecursivePawn = function(iRow, iCol, iType, iCurPlayer, aCurBoard){    
    var oCheckMove = this._checkLegalMoves(iRow,iCol,iType, aCurBoard, iCurPlayer); 

    if(oCheckMove.move === PAWN_EAT){
        this._bConstrainedMoves = true;

        for(var i=0; i<oCheckMove.listmove.length; i++){  
            this._oMoveTree.addNode(iRow, iCol, 0, oCheckMove.listmove[i].row, oCheckMove.listmove[i].col, 0, oCheckMove.listmove[i].eatenrow, oCheckMove.listmove[i].eatencol);
            this._checkRecursivePawn(oCheckMove.listmove[i].row,oCheckMove.listmove[i].col, iType, iCurPlayer, aCurBoard);
        } 
    }
};

CGameBase.prototype._checkRecursiveKing = function(iRow, iCol, iType, aCurMatrix, iDepth, iCurPlayer){


    var oCheckMove = this._checkLegalMoves(iRow,iCol,iType, aCurMatrix, iCurPlayer);   

    if(oCheckMove.move === PAWN_EAT){ 
        this._bConstrainedMoves = true;

        for(var i=0; i<oCheckMove.listmove.length; i++){  

            this._oMoveTree.addNode(iRow, iCol, iDepth, oCheckMove.listmove[i].row, oCheckMove.listmove[i].col, iDepth+1, oCheckMove.listmove[i].eatenrow, oCheckMove.listmove[i].eatencol);


            if(i === oCheckMove.listmove.length-1){
                for(var j=0; j<oCheckMove.listmove.length; j++){
                    var aNewMatrix = this._copyMatrix(aCurMatrix);
                    aNewMatrix[oCheckMove.listmove[j].eatenrow][oCheckMove.listmove[j].eatencol] = PAWN_NULL;
                    this._checkRecursiveKing(oCheckMove.listmove[j].row,oCheckMove.listmove[j].col, iType, aNewMatrix, iDepth+1, iCurPlayer);
                }
            }    
        }             
    }

};

CGameBase.prototype._checkConstrainedMoves = function(){  
    this._aCellConstrained = new Array();
    this._bConstrainedMoves = false;
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            if(this._aCell[i][j].getType() === this._iCurPlayer){
                this._oMoveTree = new CTree({row:i, col:j});
                this._checkRecursivePawn(i,j, this._aCell[i][j].getType(), this._iCurPlayer, this._aCellSupport);

                var oTerminalNodes = this._oMoveTree.getTerminalNodes();

                var aPath = new Array();
                for(var n=0; n<oTerminalNodes.length; n++){
                    aPath[n] = this._oMoveTree.getPath(oTerminalNodes[n]);
                }

                this._aCell[i][j].setMovesChain(aPath);

            } else if((this._aCell[i][j].getType() === KING_BLACK || this._aCell[i][j].getType() === KING_WHITE) && this._aCell[i][j].getType()%2 === this._iCurPlayer){
                this._oMoveTree = new CTree({row:i, col:j});
                var aCurMatrix = this._copyMatrix(this._aCellSupport);
                aCurMatrix[i][j] = PAWN_NULL; //COUSE KING CAN GO BACK, WE NEED TO FREE STARTING CELL WHEN COMPUTE
                this._checkRecursiveKing(i,j, this._aCell[i][j].getType(), aCurMatrix, 0, this._iCurPlayer);       
                _bTerminal =false;

                var oTerminalNodes = this._oMoveTree.getTerminalNodes();

                var aPath = new Array();
                for(var n=0; n<oTerminalNodes.length; n++){
                    aPath[n] = this._oMoveTree.getPath(oTerminalNodes[n]);
                }

                this._aCell[i][j].setMovesChain(aPath);

            }
        }
    }
};

CGameBase.prototype._activeCellClick = function(){
    this._checkConstrainedMoves();

    this._resetMoves();
    this._disableAllHighlight();
    this._disableAllClick();

    
    if(this._bConstrainedMoves && MANDATORY_JUMP_ACTIVE){     
        this._evaluatePath();

        for(var i = 0; i < this._aCellConstrained.length; i++){
            var iRow = this._aCellConstrained[i].row;
            var iCol = this._aCellConstrained[i].col;

            if(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER){

            } else {
                this._aCell[iRow][iCol].setClickableArea(true);
                this._aCell[iRow][iCol].highlight(true);
            }                
        }

        this._showMessage();

    } else {
        
        if(MANDATORY_JUMP_ACTIVE){
            this._evaluatePath();
        }

        for(var i = 0; i < NUM_CELL; i++) {
            for(var j = 0; j < NUM_CELL; j++) {
                this._aCell[i][j].setClickableArea(false);
                if(this._aCell[i][j].getType()%2 === this._iCurPlayer){                    
                    if(this._iCurPlayer === PAWN_BLACK && s_iGameType === MODE_COMPUTER){

                    } else {
                        this._aCell[i][j].setClickableArea(true);                       
                    }
                }
            }
        }
    }        
};

CGameBase.prototype._evaluatePath = function(){       
    ////////CHECK RULE 1////////////
    var iMax = 0;
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            if(this._aCell[i][j].getType()%2 === this._iCurPlayer){
                for(var n=0; n<this._aCell[i][j].getMovesChain().length; n++){
                    if(iMax < this._aCell[i][j].getMovesChain()[n].length){
                        iMax = this._aCell[i][j].getMovesChain()[n].length;
                    }                            
                }                        
            }
        }
    }
    
    ////////CHECK RULE 2/////////////////
    var bKingExist = false;
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            if(this._aCell[i][j].getType()%2 === this._iCurPlayer){
                for(var n=0; n<this._aCell[i][j].getMovesChain().length; n++){
                    if(iMax === this._aCell[i][j].getMovesChain()[n].length){
                        if(this._aCell[i][j].getType() > PAWN_BLACK){
                            bKingExist = true;
                        }
                    }                            
                }                        
            }
        }
    }       

    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            if(this._aCell[i][j].getType()%2 === this._iCurPlayer){
                /////FOR ALL THE PAWN OF THE CURRENT PLAYER:
                var aNewPath = new Array();
                var bPathFound = false;
                for(var n=0; n<this._aCell[i][j].getMovesChain().length; n++){
                    ///// CHECK EVERY PATH FOR A SINGLE PAWN AND EVALUATE THE RULES
                    aNewPath[n] = new Array();
                    if(bKingExist){
                        if(iMax === this._aCell[i][j].getMovesChain()[n].length && this._aCell[i][j].getType() > PAWN_BLACK){
                            for(var k=0; k<iMax; k++){
                                aNewPath[n].push({row:this._aCell[i][j].getMovesChain()[n][k].model.row, col:this._aCell[i][j].getMovesChain()[n][k].model.col});
                            }

                            bPathFound = true;
                        }       
                    } else {
                        if(iMax === this._aCell[i][j].getMovesChain()[n].length){
                            for(var k=0; k<iMax; k++){
                                aNewPath[n].push({row:this._aCell[i][j].getMovesChain()[n][k].model.row, col:this._aCell[i][j].getMovesChain()[n][k].model.col});
                            }

                            bPathFound = true;
                        }                            
                    }                                             
                }

                for(var n=aNewPath.length-1; n>=0; n--){
                    if(aNewPath[n].length === 0){
                        aNewPath.splice(n,1);
                    } else {
                        aNewPath[n].splice(0,1);
                    }
                }

                this._aCell[i][j].setMovesChain(aNewPath);
                if(bPathFound){
                    this._aCellConstrained.push({row:i, col:j});
                }
            }
        }
    }
};

CGameBase.prototype._checkBoard = function(){
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++){
            trace(this._aCell[i][j].isLegalMove());
        }
    }
};

CGameBase.prototype._findAllMoves = function(aCurBoard, iCurPlayer){
    var oMove;
    var bEat = false;
    var aMovesList = new Array();
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++){
            if(aCurBoard[i][j]%2 === iCurPlayer){

                oMove = this._checkLegalMoves(i,j,aCurBoard[i][j], aCurBoard, iCurPlayer);
                if(oMove.move === PAWN_MOVE && oMove.listmove.length !== 0){
                    for(var n=0; n<oMove.listmove.length; n++){
                        aMovesList.push({currow:i, curcol:j, pawntype: aCurBoard[i][j], movetype: PAWN_MOVE, destrow:oMove.listmove[n].row, destcol:oMove.listmove[n].col, rawpath:null});
                    }                      
                } else if(oMove.move === PAWN_EAT){
                    bEat = true;
                    this._oMoveTree = new CTree({row:i, col:j});

                    if(aCurBoard[i][j] === iCurPlayer){                            
                        this._checkRecursivePawn(i,j, aCurBoard[i][j], iCurPlayer, aCurBoard);  

                        var oTerminalNodes = this._oMoveTree.getTerminalNodes();
                        var aPath = new Array();
                        for(var n=0; n<oTerminalNodes.length; n++){

                            aPath[n] = this._oMoveTree.getPath(oTerminalNodes[n]);
                            aPath[n].splice(0,1);
                            aMovesList.push({currow:i, curcol:j, pawntype: aCurBoard[i][j], movetype: PAWN_EAT, 
                                                destrow:aPath[n][aPath[n].length-1].model.row, destcol:aPath[n][aPath[n].length-1].model.col, 
                                                    rawpath:aPath[n]});
                        }                   
                    } else if((aCurBoard[i][j] === KING_BLACK || aCurBoard[i][j] === KING_WHITE) && aCurBoard[i][j]%2 === iCurPlayer){
                        var aCurMatrix = this._copyMatrix(aCurBoard);
                        aCurMatrix[i][j] = PAWN_NULL; //COUSE KING CAN GO BACK, WE NEED TO FREE STARTING CELL WHEN COMPUTE
                        this._checkRecursiveKing(i,j, aCurBoard[i][j], aCurMatrix, 0, iCurPlayer);       
                        _bTerminal =false;

                        var oTerminalNodes = this._oMoveTree.getTerminalNodes();

                        var aPath = new Array();
                        for(var n=0; n<oTerminalNodes.length; n++){
                            aPath[n] = this._oMoveTree.getPath(oTerminalNodes[n]);
                            aPath[n].splice(0,1);
                            aMovesList.push({currow:i, curcol:j, pawntype: aCurBoard[i][j], movetype: PAWN_EAT, 
                                                destrow:aPath[n][aPath[n].length-1].model.row, destcol:aPath[n][aPath[n].length-1].model.col, 
                                                    rawpath:aPath[n]});
                        }
                    }
                }
            }
        }
    }

    if(bEat){            
        bEat = false;
        for(var i=aMovesList.length-1; i>=0; i--){
            if(aMovesList[i].movetype === PAWN_MOVE){
                aMovesList.splice(i,1);
            }
        }
        aMovesList = this._oAI._evaluatePathForAI(aMovesList);
    }                


    return aMovesList;

};

CGameBase.prototype.countPawn = function(){
    var iType;
    this._iNumBlack = 0;
    this._iNumWhite = 0;
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            iType = this._aCell[i][j].getType()%2;
            if(iType === PAWN_BLACK){
                this._iNumBlack++;
            } else if(iType === PAWN_WHITE) {
                this._iNumWhite++;
            }
        }
    }
};

CGameBase.prototype._checkCanMove = function(iCurPlayer){
    var oMoves;
    for(var i = 0; i < NUM_CELL; i++) {
        for(var j = 0; j < NUM_CELL; j++) {
            if(this._aCellSupport[i][j]%2 === iCurPlayer){
                oMoves = this._checkLegalMoves(i,j,this._aCellSupport[i][j], this._aCellSupport, iCurPlayer);
                if(oMoves.listmove.length > 0){
                    return true;
                }
            }

        }
    }

    return false;
};

CGameBase.prototype.setActiveCell = function(iRow, iCol){
    this._oActiveCell = {row: iRow, col: iCol};
};

CGameBase.prototype.getCells = function(){
    return this._aCell;
};

CGameBase.prototype.getSupportCells = function(){
    return this._aCellSupport;
};

CGameBase.prototype.getCurrentPlayer = function(){
    return this._iCurPlayer;
};

CGameBase.prototype._getOtherPlayer = function(iPlayer){
    if(iPlayer === PAWN_WHITE){
        return PAWN_BLACK;
    }else {
        return PAWN_WHITE;
    }
};

CGameBase.prototype.nullMessage = function(){
    this._oMessage = null;
};