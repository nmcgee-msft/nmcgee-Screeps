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
                    mySpawn.id = Game.spawns[sp].id;
                }
            }
            myRoom.mySpawns = [];
            myRoom.mySpawns.push(mySpawn);
            
            // Record the controller details
            // console.log("controller: " + Game.rooms[rm]);
            if (Game.rooms[rm].controller != undefined) {
                myController.pos = Game.rooms[rm].controller.pos;
                myRoom.myController = myController;
            }
            
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
            
            // Variables to track dying creeps and room levels
            Game.rooms[rm].memory = { dyingUpgraders: 0, dyingSuppliers: 0, dyingEnergizers: 0, stage: 0, targetCreepCount: 0, defenseLevel: 0 };
            
            // Save the room
            myWorld.push(myRoom);
        }
        
        // Save the world
        Memory.world = myWorld;
    },
    
    details: function() {
        
        // console.log(Memory.world.length);
        // console.log(Memory.world[0].mySources.length);
        
        for (var r = 0; r < Memory.world.length; r++) {
            var harvestLocations = [];
            for (var s = 0; s < Memory.world[r].mySources.length; s++) {
                // Check each source for adjacent locations that can be used for harvesting
                var harvestLocationCount = 0;
                for (var t = 0; t < initWorld.ONE_MOVE.length; t++) {
                    if (Game.map.getTerrainAt(Memory.world[r].mySources[s].pos.x + initWorld.ONE_MOVE[t].x, Memory.world[r].mySources[s].pos.y + initWorld.ONE_MOVE[t].y, Memory.world[r].name) != "wall") {
                        var harvestPosition = {};
                        harvestPosition.x = Memory.world[r].mySources[s].pos.x;
                        harvestPosition.x = harvestPosition.x + initWorld.ONE_MOVE[t].x;
                        harvestPosition.y = Memory.world[r].mySources[s].pos.y;
                        harvestPosition.y = harvestPosition.y + initWorld.ONE_MOVE[t].y;
                        harvestPosition.roomName = Memory.world[r].name;
                        harvestPosition.srcId = Memory.world[r].mySources[s].id;
                        harvestPosition.available = true;
                        // console.log("X: " + harvestPosition.x + " Y:" + harvestPosition.y + " Name: " + harvestPosition.roomName);
                        harvestLocations.push(harvestPosition);
                        harvestLocationCount++;
                    }
                }
                Memory.world[r].mySources[s].harvestLocationCount = harvestLocationCount;
            }
            Memory.world[r].harvestLocations = harvestLocations;
        
            // Set ratio of source harvesting based on available harvest locations and proximity to spawn
            var dist1 = 0, dist2 = 0;
            for (var i = 0; i < Memory.world[r].mySources.length; i++) {
                var src = Memory.world[r].mySources[i]
                var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
                x1 = src.pos.x;
                y1 = src.pos.y;
                x2 = Memory.world[r].mySpawns[0].pos.x;
                y2 = Memory.world[r].mySpawns[0].pos.y;

                // only concerned with one spawn even if there are multiple
                if (dist1 == 0) {
                    dist1 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                } else {
                    dist2 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                }
            }
            // console.log("Dist1 = " + dist1 + " Dist2 = " + dist2);
            // if dist1 is shorter, then that source should be assigned first, and vice versa
            var harvestAssignment = [];
            if (dist1 <= dist2) {
                for (var cnt = 0; cnt < Memory.world[r].mySources.length; cnt++) {
                    for (var hl = 0; hl < Memory.world[r].mySources[cnt].harvestLocationCount; hl++) {
                        harvestAssignment.push(Memory.world[r].mySources[cnt].id);
                    }
                }
            } else {
                for (var cnt = Memory.world[r].mySources.length-1; cnt >= 0; cnt--) {
                    for (var hl = 0; hl < Memory.world[r].mySources[cnt].harvestLocationCount; hl++) {
                        harvestAssignment.push(Memory.world[r].mySources[cnt].id);
                    }
                }
            }
            
            // console.log(harvestAssignment);
            Memory.world[r].harvestAssignment = harvestAssignment;
            Memory.world[r].nextHarvestAssignment = 0;
        }
    }
        
};

module.exports = initWorld;