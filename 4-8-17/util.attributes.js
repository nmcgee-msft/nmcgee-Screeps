"use strict";

var attr = {
    //Actions
    HARVEST: "harvest",
    BUILD : "build",
    REPAIR : "repair",
    TRANSFER : "transfer",
    UPGRADE_CONTROLLER : "upgradeController",
    
    //Parts
    WORK_PART: 100,
    MOVE_PART: 50,
    HOLD_PART: 50,
    HIT_PART: 10,
    
    //Point map for 1-square radius
    ONE_MOVE: [
        {x:1, y:1},
        {x:1, y:0},
        {x:1, y:-1},
        {x:0, y:1},
        {x:0, y:0},
        {x:0, y:-1},
        {x:-1, y:1},
        {x:-1, y:0},
        {x:-1, y:-1}
    ],
    
    TWO_MOVES: [
     {x :2, y:2},
     {x:2,y:1},
     {x :2, y:0},
     {x:2,y:-1},
     {x :2, y:-2},
     {x :1, y:2},
     {x:0,y:2},
     {x :-1, y:2},
     {x:-2,y:2},
     {x:-2,y:1},
     {x :-2, y:0},
     {x:-2,y:-1},
     {x :-2, y:-2},
     {x :1, y:-2},
     {x:0,y:-2},
     {x :-1, y:-2}
     ],
     
    TWO_MOVES_CONTROLLER_TEMPLATE: [
     "C_SHAPED_INV",
     "C_SHAPED_INV",
     "C_SHAPED_INV",
     "C_SHAPED_INV",
     "C_SHAPED_INV",
     "U_SHAPED",
     "U_SHAPED",
     "U_SHAPED",
     "U_SHAPED",
     "C_SHAPED",
     "C_SHAPED",
     "C_SHAPED",
     "C_SHAPED",
     "U_SHAPED_INV",
     "U_SHAPED_INV",
     "U_SHAPED_INV"
     ],
    
    //build shapes for transfer stations
    U_SHAPED_INV: [
        {x:-1, y:-2},
        {x:-1, y:-1},
        {x:-1, y:0},
        {x:0, y:-2},
        {x:1, y:0},
        {x:1, y:-1},
        {x:1, y:-2}
        ],
        
    U_SHAPED: [
        {x:-1, y:0},
        {x:-1, y:1},
        {x:-1, y:2},
        {x:0, y:2},
        {x:1, y:2},
        {x:1, y:1},
        {x:1, y:0}
        ],
        
    C_SHAPED: [
        {x:-2, y:-1},
        {x:-2, y:0},
        {x:-2, y:1},
        {x:-1, y:-1},
        {x:-1, y:1},
        {x:0, y:1},
        {x:0, y:-1}
        ],
        
    C_SHAPED_INV: [
        {x:0, y:-1},
        {x:2, y:0},
        {x:0, y:1},
        {x:1, y:-1},
        {x:1, y:1},
        {x:2, y:1},
        {x:2, y:-1}
        ],
    
    //block types
    PLAIN: "plain",
    SWAMP: "swamp",
    WALL: "wall",
    
    HARVEST_POLL_INTERVAL: 30,
    
    //Creep body types
    TRANSFER_01: [MOVE,CARRY,WORK,WORK],
    DELIVERY_01: [CARRY,CARRY,MOVE,MOVE,MOVE],
    BUILDER_01:  [MOVE,MOVE,CARRY,WORK]
    
};

module.exports = attr;