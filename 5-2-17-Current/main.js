var world = require('init.world');
var stage = require('mgr.stage');
var roles = require('mgr.role');
var mgrCreep = require('mgr.creep');
var mgrMemory = require('mgr.memory');


module.exports.loop = function() {
   
    // Initialize the world if not already done
    if (Memory.world == undefined || !Memory.world || Memory.world.length == 0) {
        world.init();
        world.details();
    }
       
    // Remove dead creeps
    mgrMemory.deleteCreeps();
    
    // wrap in a try block to detect respawn condition
    try {
        // Execute current stage in each room and handle creep spawning
        for (var w in Memory.world) {
            switch (Memory.rooms[Memory.world[w].name].stage) {
                case 0:
                    Memory.rooms[Memory.world[w].name].stage = stage.zero(Memory.world[w].name);
                    break;
                case 1:
                    Memory.rooms[Memory.world[w].name].stage = stage.one(Memory.world[w].name);
                    break;
                default:
                    Memory.rooms[Memory.world[w].name].stage = 0;
                    break;
            }
        
            if (Game.rooms[Memory.world[w].name].find(FIND_MY_CREEPS).length < Game.rooms[Memory.world[w].name].memory.targetCreepCount) {
                // Spawn the next creep
                mgrCreep.evaluateCreeps(Memory.world[w]);
                if (Memory.world[w].nextCreep != null) {
                    var ret = Game.spawns[Memory.world[w].mySpawns[0].name].createCreep( Memory.world[w].nextCreep.parts, null, Memory.world[w].nextCreep );
                    console.log("createCreep returned: " + ret);
                }
            }
            
        }
    }
    catch (err) {
        // An exception above is most likely due to the world variable so reset the world here
        console.log("***RESETTING WORLD DUE TO EXCEPTION*** err = " + err);
        delete Memory.world;
        // delete Memory.creeps;
        delete Memory.rooms;
        return;
    }
    
    // Run creep code
    Object.keys(Game.creeps).forEach((creepId) => {
    var creep = Game.creeps[creepId];
    roles[creep.memory.activeTask].call(creep);
    });

}