"use strict";

var initWorld = {
    
    ONE_MOVE: [
        {x:1, y:1},
        {x:1, y:0},
        {x:1, y:-1},
        {x:0, y:1},
        {x:0, y:-1},
        {x:-1, y:1},
        {x:-1, y:0},
        {x:-1, y:-1}
    ],
    
    init: function() {
    
        var myWorld = [];
        var myRoom = {};
        var mySpawn = {};
        var myController = {};
        var myMineral = {};
        var myExits = [];
        var myStructures = [];
        
        for (var rm in Game.rooms) {
            
            // Locate and record the room and spawn details
            myRoom.name = Game.rooms[rm].name;
            for (var sp in Game.spawns) {
                if (Game.spawns[sp].room.name == rm) {
                    mySpawn.name = Game.spawns[sp].name;
                    mySpawn.pos = Game.spawns[sp].pos;
                }
            }
            myRoom.mySpawns = [];
            myRoom.mySpawns.push(mySpawn);
            
            // Record the controller details
            myController.pos = Game.rooms[rm].controller.pos;
            myRoom.myController = myController;
            
            // Get energy sources details
            var sources = Game.rooms[rm].find(FIND_SOURCES);
            myRoom.mySources = [];
            for (var i = 0; i < sources.length; i++) {
                var mySource = {};
                mySource = sources[i];
                myRoom.mySources.push(mySource);
            }
            
            // Get minerals if present
            // TBD - skipping for now
            
            // Get exits from room
            var exits = Game.map.describeExits(rm);
            for (var e in exits) {
                myExits.push(e);
            }
            myRoom.myExits = myExits;
            
            // Save a placeholder for structures
            myRoom.myStructures = myStructures;
            
            // Set stage to zero
            myRoom.stage = 0;
            myRoom.targetCreepCount = 6;
            myRoom.defenseLevel = 1000;
            
            // Variables to track dying creeps
            Game.rooms[rm].memory = { dyingUpgraders: 0, dyingSuppliers: 0, dyingEnergizers: 0 };
            
            // Save the room
            myWorld.push(myRoom);
        }
        
        // Save the world
        Memory.world = myWorld;
    },
    
    details: function() {
        
        console.log(Memory.world.length);
        console.log(Memory.world[0].mySources.length);
        
        for (var r = 0; r < Memory.world.length; r++) {
            var harvestLocations = [];
            for (var s = 0; s < Memory.world[r].mySources.length; s++) {
                // Check each source for adjacent locations that can be used for harvesting
                for (var t = 0; t < initWorld.ONE_MOVE.length; t++) {
                    if (Game.map.getTerrainAt(Memory.world[r].mySources[s].pos.x + initWorld.ONE_MOVE[t].x, Memory.world[r].mySources[s].pos.y + initWorld.ONE_MOVE[t].y, Memory.world[r].name) != "wall") {
                        var harvestPosition = {};
                        harvestPosition.x = Memory.world[r].mySources[s].pos.x;
                        harvestPosition.x = harvestPosition.x + initWorld.ONE_MOVE[t].x;
                        harvestPosition.y = Memory.world[r].mySources[s].pos.y;
                        harvestPosition.y = harvestPosition.y + initWorld.ONE_MOVE[t].y;
                        harvestPosition.roomName = Memory.world[r].name;
                        harvestPosition.available = true;
                        console.log("X: " + harvestPosition.x + " Y:" + harvestPosition.y + " Name: " + harvestPosition.roomName);
                        harvestLocations.push(harvestPosition);
                    }
                }
            }
            Memory.world[r].harvestLocations = harvestLocations;
        }
    }
        
};

module.exports = initWorld;