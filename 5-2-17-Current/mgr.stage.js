"use strict";

var stage = {};
    
stage.zero = function(room) {
    // Test for stage upgrade condition
    if (Game.rooms[room].controller.level >= 2) {
        console.log("Advancing stage");
        return 1;
    }
    
    // Stage zero: Create basic creeps to get controller to level 2
    if (Game.rooms[room].memory.targetCreepCount == 0) {
        // Determine a good number of creeps to spawn
        var pathLength = 0;
        for (var w in Memory.world) {
            if (Memory.world[w].name == room) {
                for (var s = 0; s < Memory.world[w].mySources.length; s++) {
                    pathLength += Game.rooms[room].controller.pos.findPathTo(Game.getObjectById(Memory.world[w].mySources[s].id)).length;
                    // console.log(Math.sqrt(pathLength * Memory.world[w].harvestLocations.length));
                }
                Game.rooms[room].memory.targetCreepCount = Math.ceil(Math.sqrt(pathLength * Memory.world[w].harvestLocations.length));
            }
        }
        
        // Set targetCreepList to all basic workers for this stage
        Game.rooms[room].memory.targetCreepList = { basicWorker: Game.rooms[room].memory.targetCreepCount };
        console.log("targetCreepList = " + Game.rooms[room].memory.targetCreepList);
    }
    
    // console.log("Still in stage 0");
    return 0;
}

stage.one = function(room) {
    // console.log("In stage 1");
    // in case things get reset due to an error, establish the creep count again
    if (Game.rooms[room].memory.targetCreepCount == 0) {
        // Determine a good number of creeps to spawn
        var pathLength = 0;
        for (var w in Memory.world) {
            if (Memory.world[w].name == room) {
                for (var s = 0; s < Memory.world[w].mySources.length; s++) {
                    pathLength += Game.rooms[room].controller.pos.findPathTo(Game.getObjectById(Memory.world[w].mySources[s].id)).length;
                    // console.log(Math.sqrt(pathLength * Memory.world[w].harvestLocations.length));
                }
                Game.rooms[room].memory.targetCreepCount = Math.ceil(Math.sqrt(pathLength * Memory.world[w].harvestLocations.length));
            }
        }
        
        // Set targetCreepList to  basic workers and builders here
        if (Game.rooms[room].memory.needBuilders == true && Game.rooms[room].memory.construction.roads.length > 0) {
            Game.rooms[room].memory.targetCreepList = { basicWorker: Math.ceil(Game.rooms[room].memory.targetCreepCount / 3), builder: Math.floor(Game.rooms[room].memory.targetCreepCount / 3 * 2) - 1, repairer: 1 };
            console.log("stage 1 targetCreepList = " + Game.rooms[room].memory.targetCreepList);
        } else {
            Game.rooms[room].memory.targetCreepList = { basicWorker: Game.rooms[room].memory.targetCreepCount - 1, repairer: 1 };
            console.log("stage 1 targetCreepList = " + Game.rooms[room].memory.targetCreepList);
        }
    }
    
    // Stage one: Continue upgrading, build roads, and room extensions
    if (Game.rooms[room].memory.construction == undefined) {
        Game.rooms[room].memory.construction = { roads: [] };
        
        // Build roads from the spawn to the harvest locations, and controller to harvest locations - roads should all be two lanes
        for (var w in Memory.world) {
            console.log("Stage 1 - Room: " + room);
            if (Memory.world[w].name == room) {
                for (var sp in Memory.world[w].mySpawns) {
                    for (var src in Memory.world[w].harvestLocations) {
                        var spawn = Game.getObjectById(Memory.world[w].mySpawns[sp].id);
                        var cont = Game.rooms[room].controller;
                        var roadPath = spawn.pos.findPathTo(Memory.world[w].harvestLocations[src].x, Memory.world[w].harvestLocations[src].y, {ignoreCreeps: true});
                        var roadPath2 = cont.pos.findPathTo(Memory.world[w].harvestLocations[src].x, Memory.world[w].harvestLocations[src].y, {ignoreCreeps: true});
                        
                        var xOffset = 0, yOffset = 0, xOffset2 = 0, yOffset2 = 0;
                        if (roadPath.length != 0) {
                            if (roadPath.length == 1) {
                                // just a single position, no slope, no need to do anything other than build the one point
                            } else {
                                // check path slope to add second lane
                                if (roadPath[roadPath.length-1].y - roadPath[0].y == 0) { // line is horizontal so adjust Y by one for second lane
                                    yOffset = 1;
                                }
                                if (roadPath[roadPath.length-1].x - roadPath[0].x == 0) { // line is vertical so adjust X by one for second lane
                                    xOffset = 1;
                                }
                                if (xOffset == 0 && yOffset == 0) { // line is not straight so calculate slope to apply offset
                                    var slope = (roadPath[roadPath.length-1].y - roadPath[0].y) / (roadPath[roadPath.length-1].x - roadPath[0].x);
                                    console.log("Slope: " + slope);
                                    if (Math.abs(slope) >= 1) { // line is diagonal to vertical, adding x offset for second lane
                                        xOffset = 1;
                                    } else { // line is more horizontal than vertical, adding y offset for second lane
                                        yOffset = 1;
                                    }
                                }
                                
                                if (xOffset == 1 && yOffset == 1) { // shouldn't happen unless path contains multiple instances of the same point
                                    console.log("BAD PATH!!! ABORTING ROAD CONSTRUCTION");
                                    continue;
                                }
                                
                                // check for least blocked points for second lane since primary path will (should) always be passable
                                var posBlockedCount = 0;
                                var negBlockedCount = 0;
                                for (var step in roadPath) {
                                    var terrainPos = Game.map.getTerrainAt(step.x + xOffset, step.y + yOffset, room);
                                    // console.log("terrainPos: " + terrainPos);
                                    if (terrainPos == "plain") {
                                        // optimal, continue
                                        // should probably also check for other structures here... but since these are our first
                                        // structures other than the spawn, it should be safe
                                    } else {
                                        // not technically blocked, but if there's swamp on one side but not the other, this will help avoid it
                                        posBlockedCount++;
                                    }
                                    var terrainNeg = Game.map.getTerrainAt(step.x - xOffset, step.y - yOffset, room);
                                    // console.log("terrainNeg: " + terrainNeg);
                                    if (terrainNeg == "plain") {
                                        // optimal, continue
                                        // should probably also check for other structures here... but since these are our first
                                        // structures other than the spawn, it should be safe
                                    } else {
                                        negBlockedCount++;
                                    }
                                }
                                
                                // ok, now we have all the information we need to create the road... hopefully
                                if (negBlockedCount > posBlockedCount) { // apply offset based on less blocked second lane
                                    xOffset *= -1;
                                    yOffset *= -1;
                                }
                                
                                // console.log("xOffset: " + xOffset + ", yOffset: " + yOffset);
                                
                                var length = roadPath.length;
                                for (var i = 0; i < length; i++) {
                                    // add second lane
                                    roadPath.push( { x: roadPath[i].x + xOffset, y: roadPath[i].y + yOffset, roomName: room } );
                                }
                                
                                // place construction sites
                                for (var road in roadPath) {
                                    if (roadPath[road].x == spawn.pos.x && roadPath[road].y == spawn.pos.y) { // skip spawn position
                                        continue;
                                    }
                                    // skip locations that already have a construction site
                                    // var roadHere = Game.rooms[room].lookForAt(LOOK_CONSTRUCTION_SITES, roadPath[road].x, roadPath[road].y);
                                    // if (roadHere == undefined || roadHere == null || roadHere.length == 0) {
                                        // var result = Game.rooms[room].createConstructionSite(roadPath[road].x, roadPath[road].y, STRUCTURE_ROAD);
                                        // if (result == 0) {
                                            // save road positions for integrity checks later (attacks destroy them, maintenance fails, etc.)
                                            var pos = { x: roadPath[road].x, y: roadPath[road].y, roomName: room };
                                            var skipPos = false;
                                            console.log("construction roads length: " + Game.rooms[room].memory.construction.roads.length);
                                            if (Game.rooms[room].memory.construction.roads.length > 1) {
                                                for (var p in Game.rooms[room].memory.construction.roads) {
                                                    if (Game.rooms[room].memory.construction.roads[p].x == pos.x && Game.rooms[room].memory.construction.roads[p].y == pos.y) {
                                                        skipPos = true;
                                                        break;
                                                    }
                                                }
                                                if (skipPos == false) {
                                                    Game.rooms[room].memory.construction.roads.push(pos);
                                                }
                                            } else {
                                                console.log("Should only be here once...");
                                                Game.rooms[room].memory.construction.roads.push(pos);
                                            }
                                            
                                            
                                        //} else {
                                        //    console.log ("Attempt to build road at: " + roadPath[road].x + ", " + roadPath[road].y + " failed with result: " + result);
                                        //}
                                    }
                                }
                        } else {
                            // no path, nothing to do
                        }
                        if (roadPath2.length != 0) {
                            if (roadPath2.length == 1) {
                                // just a single position, no slope, no need to do anything other than build the one point
                            } else {
                                // check path slope to add second lane
                                if (roadPath2[roadPath2.length-1].y - roadPath2[0].y == 0) { // line is horizontal so adjust Y by one for second lane
                                    yOffset2 = 1;
                                }
                                if (roadPath2[roadPath2.length-1].x - roadPath2[0].x == 0) { // line is vertical so adjust X by one for second lane
                                    xOffset2 = 1;
                                }
                                if (xOffset2 == 0 && yOffset2 == 0) { // line is not straight so calculate slope to apply offset
                                    var slope2 = (roadPath2[roadPath2.length-1].y - roadPath2[0].y) / (roadPath2[roadPath2.length-1].x - roadPath2[0].x);
                                    console.log("Slope2: " + slope2);
                                    if (Math.abs(slope2) >= 1) { // line is diagonal to vertical, adding x offset for second lane
                                        xOffset2 = 1;
                                    } else { // line is more horizontal than vertical, adding y offset for second lane
                                        yOffset2 = 1;
                                    }
                                }
                                
                                if (xOffset2 == 1 && yOffset2 == 1) { // shouldn't happen unless path contains multiple instances of the same point
                                    console.log("BAD PATH!!! ABORTING ROAD CONSTRUCTION");
                                    continue;
                                }
                                
                                // check for least blocked points for second lane since primary path will (should) always be passable
                                var posBlockedCount = 0;
                                var negBlockedCount = 0;
                                for (var step in roadPath2) {
                                    var terrainPos = Game.map.getTerrainAt(step.x + xOffset2, step.y + yOffset2, room);
                                    // console.log("terrainPos: " + terrainPos);
                                    if (terrainPos == "plain") {
                                        // optimal, continue
                                        // should probably also check for other structures here... but since these are our first
                                        // structures other than the spawn, it should be safe
                                    } else {
                                        // not technically blocked, but if there's swamp on one side but not the other, this will help avoid it
                                        posBlockedCount++;
                                    }
                                    var terrainNeg = Game.map.getTerrainAt(step.x - xOffset2, step.y - yOffset2, room);
                                    // console.log("terrainNeg: " + terrainNeg);
                                    if (terrainNeg == "plain") {
                                        // optimal, continue
                                        // should probably also check for other structures here... but since these are our first
                                        // structures other than the spawn, it should be safe
                                    } else {
                                        negBlockedCount++;
                                    }
                                }
                                
                                // ok, now we have all the information we need to create the road... hopefully
                                if (negBlockedCount > posBlockedCount) { // apply offset based on less blocked second lane
                                    xOffset2 *= -1;
                                    yOffset2 *= -1;
                                }
                                
                                // console.log("xOffset2: " + xOffset2 + ", yOffset2: " + yOffset2);
                                
                                var length = roadPath2.length;
                                for (var i = 0; i < length; i++) {
                                    // add second lane
                                    roadPath2.push( { x: roadPath2[i].x + xOffset2, y: roadPath2[i].y + yOffset2, roomName: room } );
                                }
                                
                                // place construction sites
                                for (var road2 in roadPath2) {
                                    // skip locations that already have a construction site
                                    // console.log("in path 2 here: " + roadPath2[road2]);
                                    //var roadHere2 = Game.rooms[room].lookForAt(LOOK_CONSTRUCTION_SITES, roadPath2[road2].x, roadPath2[road2].y);
                                    // console.log("Road here already?: " + roadHere2.length);
                                    // if (roadHere2 == undefined || roadHere2 == null || roadHere2.length == 0) {
                                        // var result2 = Game.rooms[room].createConstructionSite(roadPath2[road2].x, roadPath2[road2].y, STRUCTURE_ROAD);
                                        // if (result2 == 0) {
                                            // save road positions for integrity checks later (attacks destroy them, maintenance fails, etc.)
                                            
                                    // remove locations within 3 distance of the controller
                                    console.log("controller to location distance = " + Game.rooms[room].controller.pos.getRangeTo(Memory.world[w].harvestLocations[src].x, Memory.world[w].harvestLocations[src].y));
                                    if (Game.rooms[room].controller.pos.getRangeTo(Memory.world[w].harvestLocations[src].x, Memory.world[w].harvestLocations[src].y) > 2) {
                                        var pos2 = { x: roadPath2[road2].x, y: roadPath2[road2].y, roomName: room };
                                        Game.rooms[room].memory.construction.roads.push(pos2);
                                    }
                                    
                                    var pos2 = { x: roadPath2[road2].x, y: roadPath2[road2].y, roomName: room };
                                    var skipPos2 = false;
                                    console.log("construction roads length 2nd pass: " + Game.rooms[room].memory.construction.roads.length);
                                    if (Game.rooms[room].memory.construction.roads.length > 1) {
                                        for (var p in Game.rooms[room].memory.construction.roads) {
                                            if (Game.rooms[room].memory.construction.roads[p].x == pos2.x && Game.rooms[room].memory.construction.roads[p].y == pos2.y) {
                                                skipPos2 = true;
                                                break;
                                            }
                                        }
                                        if (skipPos2 == false) {
                                            Game.rooms[room].memory.construction.roads.push(pos2);
                                        }
                                    } else {
                                        console.log("Should only be here once...");
                                        Game.rooms[room].memory.construction.roads.push(pos2);
                                    }
                                       

                                        // } else {
                                        //     console.log ("Attempt to build road 2 at: " + roadPath2[road2].x + ", " + roadPath2[road2].y + " failed with result2: " + result2);
                                        // }
                                }
                            }
                        } else {
                            // no path, nothing to do
                        }
                    }
                }
            }
        }
    } else { // we have a list of desired construction sites so let's build some roads
        if (Game.rooms[room].find(FIND_CONSTRUCTION_SITES).length == 0) {
            for (var site in Game.rooms[room].memory.construction.roads) {
                var here = Game.rooms[room].lookAt(Game.rooms[room].memory.construction.roads[site].x, Game.rooms[room].memory.construction.roads[site].y);
                var skip = false;
                for (var types in here) {
                    // console.log("here[types].type = " + here[types].type);
                    if (here[types].type == "structure") {
                        // something is here already, skip
                        skip = true;
                    } else {
                        var roadPos = { x: Game.rooms[room].memory.construction.roads[site].x, y: Game.rooms[room].memory.construction.roads[site].y };
                    }
                }
                if (!skip) {
                    var result2 = Game.rooms[room].createConstructionSite(Game.rooms[room].memory.construction.roads[site].x, Game.rooms[room].memory.construction.roads[site].y, STRUCTURE_ROAD);
                    console.log("called create construction site and it returned: " + result2);
                    if (result2 == 0) {
                        return 1;
                    }
                }
            }
            if (Game.rooms[room].memory.construction.roads.length == 0) {
                console.log("Setting builders to 1");
                Game.rooms[room].memory.targetCreepList = { basicWorker: Game.rooms[room].memory.targetCreepCount - 1, repairer: 1 };
            }
        } else {
            // we have a site pending, just build the one before starting another one... unless the whole list is empty
            if (Game.rooms[room].memory.construction.roads.length == 0) {
                // we are done with roads for now, just keep one maintenance worker around until we get towers.
                Game.rooms[room].memory.targetCreepList = { basicWorker: Game.rooms[room].memory.targetCreepCount - 1, repairer: 1 };
            } else {
                // ensure we have builders
                if (Game.rooms[room].memory.needBuilders == undefined || Game.rooms[room].memory.needBuilders == false) {
                    console.log("We need builders...");
                    Game.rooms[room].memory.needBuilders = true;
                    // hack for now just to test...
                    console.log("setting builders to 1/3");
                    Game.rooms[room].memory.targetCreepList = { basicWorker: Math.ceil(Game.rooms[room].memory.targetCreepCount / 3), builder: Math.floor(Game.rooms[room].memory.targetCreepCount * 2 / 3) - 1, repairer: 1 };
                }
            }
        }
    }
    
    return 1;
    
    // Test for stage upgrade condition at end here to facilitate single piece building
    // is the room at level 3?
    /*if (Game.rooms[room].controller.level >= 3) {
        var cs = Game.rooms[room].find(FIND_CONSTRUCTION_SITES);
        // is all construction done?
        if (cs.length == 0 || cs == undefined) {
            for (var w in Memory.world) {
                if (Memory.world[w].name == room) {
                    // Reset target creep count for next stage
                    Game.rooms[room].memory.targetCreepCount = 0;
                    Game.rooms[room].memory.targetCreepList = {};
                }
            }
            // room is 3 and construction is done, advance stage
            console.log("Advancing stage");
            return 2;
        }
    }*/
}

module.exports = stage;