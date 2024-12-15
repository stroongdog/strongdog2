function CAIController(){
    
    this._init = function(){
        
    };
    
    this._calculateMin = function(iA, iB){
        if(iA < iB){
            return iA;
        } else {
            return iB;
        }
    };

    this._calculateMax = function(iA, iB){
        if(iA > iB){
            return iA;
        } else {
            return iB;
        }
    };

    this._minimax = function(oNode, iDepth){
        if(!oNode.hasChildren() || iDepth === 0){
            return oNode.model.rating;
        }

        var iAlpha;
        if(iDepth%2 === 0){
            if(SEARCH_DEPTH%2 === 0){
                iAlpha = -9999;
                for(var i=0; i<oNode.children.length; i++){
                    iAlpha = this._calculateMax(iAlpha, this._minimax(oNode.children[i], iDepth-1));
                }
            } else {
                iAlpha = +9999;
                for(var i=0; i<oNode.children.length; i++){
                    iAlpha = this._calculateMin(iAlpha, this._minimax(oNode.children[i], iDepth-1));
                }
            }

        } else if(iDepth%2 === 1) {
            if(SEARCH_DEPTH%2 === 0){
                iAlpha = 9999;
                for(var i=0; i<oNode.children.length; i++){
                    iAlpha = this._calculateMin(iAlpha, this._minimax(oNode.children[i], iDepth-1));
                }
            } else {
                iAlpha = -9999;
                for(var i=0; i<oNode.children.length; i++){
                    iAlpha = this._calculateMax(iAlpha, this._minimax(oNode.children[i], iDepth-1));
                }
            }
        }

        oNode.model.rating = iAlpha;

        return iAlpha;        
    };  
    

    this.getMoves = function(iCurPlayer){
        
        var oMoves = this._buildDecisionTree(iCurPlayer);

        var iMoveIndex;
        if(oMoves.length > 1){
            iMoveIndex = Math.floor(Math.random()*oMoves.length);

        } else {
            iMoveIndex = 0;
        }

        var oActiveCell = {row: oMoves[iMoveIndex].model.moves.currow, col: oMoves[iMoveIndex].model.moves.curcol}; 
        s_oGame.setActiveCell(oActiveCell.row, oActiveCell.col);

        var iDestRow = oMoves[iMoveIndex].model.moves.destrow;
        var iDestCol = oMoves[iMoveIndex].model.moves.destcol;

        var aList = new Array();
        if(oMoves[iMoveIndex].model.moves.rawpath === null || oMoves[iMoveIndex].model.moves.rawpath.length === 1){
            aList[0] = [{row: iDestRow, col: iDestCol}];
        }else {

            aList[0] = new Array();
            for(var i=0; i<oMoves[iMoveIndex].model.moves.rawpath.length; i++){                    
                iDestRow = oMoves[iMoveIndex].model.moves.rawpath[i].model.row;
                iDestCol = oMoves[iMoveIndex].model.moves.rawpath[i].model.col;
                aList[0].push({row: iDestRow, col: iDestCol});
            }
        }

        var oStartCell = s_oGame.getCells()[oActiveCell.row][oActiveCell.col];
        oStartCell.setMovesChain(aList);

        return aList;

    };

    
    this._buildDecisionTree = function(iCurPlayer){
        var iStartingDepth = 0;
        this._oDecisionTree = new CTreeDecision({rating: 0, moves: [], depth:iStartingDepth});

        var aCopyBoard = s_oGame._copyMatrix(s_oGame.getSupportCells());
        this._buildDecisionRecursive(aCopyBoard, iStartingDepth, 0, iCurPlayer);

        var iValue = this._minimax(this._oDecisionTree.getRoot(),SEARCH_DEPTH);
        var iChildOfRoot = 1;

        var oAIMoves = this._oDecisionTree.getNode(iValue, iChildOfRoot);

        return oAIMoves;
    };
    
    this._buildDecisionRecursive = function(aCurBoard, iParentDepth, iParentNumMove, iCurPlayer){

        if(iParentDepth === SEARCH_DEPTH){
            return;
        }

        var aAllMoves = s_oGame._findAllMoves(aCurBoard, (iParentDepth+s_oGame.getCurrentPlayer())%2);
        var aNewBoard = new Array();
        for(var i=0; i<aAllMoves.length; i++){
            aNewBoard[i] = this._buildNewBoard(aCurBoard,aAllMoves[i]);

            var obj = this._evalBoard(aNewBoard[i], iCurPlayer);
            this._oDecisionTree.addNode(iParentDepth, iParentNumMove, iParentDepth+1, i, obj.rate, aAllMoves[i], obj.blackmatrix, obj.whitematrix);

            if(i === aAllMoves.length-1){  
                for(var j=0; j<aAllMoves.length; j++){
                    this._buildDecisionRecursive(aNewBoard[j], iParentDepth+1, j, iCurPlayer);
                }                
            }

        }     
    };
    
    this._evaluatePathForAI = function(aMovesList){      
        ////////CHECK RULE 1////////////
        var iMax = 0;
        for(var i=0; i<aMovesList.length; i++){
            if(iMax < aMovesList[i].rawpath.length){
                iMax = aMovesList[i].rawpath.length;
            } 
        }

        ////////CHECK RULE 2/////////////////
        var bKingExist = false;
        for(var i=0; i<aMovesList.length; i++){            
            if(iMax === aMovesList[i].rawpath.length){
                if(aMovesList[i].pawntype > PAWN_BLACK){
                    bKingExist = true;
                }   
            }                             
        }

        var aNewList = new Array();
        for(var i=0; i<aMovesList.length; i++){
            if(bKingExist){
                if(iMax === aMovesList[i].rawpath.length && aMovesList[i].pawntype > PAWN_BLACK){
                    aNewList.push(aMovesList[i]);
                }       
            } else{
                if(iMax === aMovesList[i].rawpath.length){
                    aNewList.push(aMovesList[i]);
                }  
            }            
        }


        return aNewList;      

    };
    
    
    
    this._buildNewBoard = function(aCurBoard, aCurMoves){

        var aRefactoredMatrix = s_oGame._copyMatrix(aCurBoard);

        aRefactoredMatrix[aCurMoves.currow][aCurMoves.curcol] = PAWN_NULL;
        aRefactoredMatrix[aCurMoves.destrow][aCurMoves.destcol] = aCurMoves.pawntype;

        if(aCurMoves.rawpath !== null){
            for(var i=0; i<aCurMoves.rawpath.length; i++){
                aRefactoredMatrix[aCurMoves.rawpath[i].model.eatenrow][aCurMoves.rawpath[i].model.eatencol] = PAWN_NULL;
            }
        }
        return aRefactoredMatrix;
    };

    this._evalBoard = function(aCurBoard, iCurPlayer){  


        var aKingBlackWeightMatrix = new Array();
        aKingBlackWeightMatrix = this._buildDistanceMatrix(aCurBoard, PAWN_BLACK);

        var aKingWhiteWeightMatrix = new Array();
        aKingWhiteWeightMatrix = this._buildDistanceMatrix(aCurBoard, PAWN_WHITE);

        var iNumWhite = 0;
        var iNumKingWhite = 0;
        var iNumBlack = 0;
        var iNumKingBlack = 0;

        for(var i=0; i<NUM_CELL; i++){
            for(var j=0; j<NUM_CELL; j++){
                if(aCurBoard[i][j] === PAWN_BLACK){
                    iNumBlack++;
                } else if(aCurBoard[i][j] === PAWN_WHITE){
                    iNumWhite++;
                } else if(aCurBoard[i][j] === KING_BLACK){
                    iNumKingBlack += aKingBlackWeightMatrix[i][j];
                } else if(aCurBoard[i][j] === KING_WHITE){
                    iNumKingWhite += aKingBlackWeightMatrix[i][j];
                }                
            }
        }

        var iKingWeight = 1.4;
        var iRate = iNumBlack - iNumWhite + iKingWeight*(iNumKingBlack - iNumKingWhite); 

        if(iCurPlayer === PAWN_WHITE){
            iRate = iNumWhite - iNumBlack + iKingWeight*(iNumKingWhite - iNumKingBlack); 
        }

        return {rate: iRate, blackmatrix: aKingBlackWeightMatrix, whitematrix: aKingWhiteWeightMatrix};        
    };

    this._buildDistanceMatrix = function(aCurBoard, iCurPlayer){
        var aPawnList = new Array();
        var bOnlyKing = true;
        for(var i=0; i<NUM_CELL; i++){
            for(var j=0; j<NUM_CELL; j++){
                if(aCurBoard[i][j] < KING_WHITE && aCurBoard[i][j] !== -1){
                    bOnlyKing = false;
                }
                if(aCurBoard[i][j]%2 !== iCurPlayer && aCurBoard[i][j] > -1){
                    aPawnList.push({row: i, col:j});
                }
            }
        }

        var aKingWeightMatrix = new Array();
        if((!bOnlyKing || aPawnList.length === 0)){            

            aKingWeightMatrix = [
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1]
            ];

        } else if(bOnlyKing){
            var iRowPos;
            var iColPos;
            var aPartialMatrix = new Array();
            for(var i=0; i<aPawnList.length; i++){
                iRowPos = aPawnList[i].row;
                iColPos = aPawnList[i].col;

                aPartialMatrix[i] = new Array();
                var iRowNumber;
                var iColNumber;
                for(var n=0; n<NUM_CELL; n++){
                    aPartialMatrix[i][n] = new Array();                    
                    for(var k=0; k<NUM_CELL; k++){
                        iRowNumber = NUM_CELL - (Math.abs(iRowPos - n));
                        iColNumber = NUM_CELL - (Math.abs(iColPos - k));
                        aPartialMatrix[i][n][k] = this._calculateMin(iRowNumber, iColNumber);
                    }    
                }                
            }

            var aTemp = new Array();
            aTemp = aPartialMatrix[0];
            for(var i=0; i<aPawnList.length; i++){
                for(var n=0; n<NUM_CELL; n++){
                    for(var k=0; k<NUM_CELL; k++){
                        if(aTemp[n][k] < aPartialMatrix[i][n][k]){
                            aTemp[n][k] = aPartialMatrix[i][n][k];
                        }
                    }                    
                }
            }
            aKingWeightMatrix = aTemp;

        }
        return aKingWeightMatrix;
    };
    
    this._init();
}


