"use strict";

var roles = require('mgr.role');
var world = require('init.world');
var mgrWorld = require('mgr.world');
var mgrMemory = require('mgr.memory');
var mgrProgress = require('mgr.progress');

module.exports.loop = function() {
    // Initialize the world if not already done
    if (Memory.world == undefined || !Memory.world || Memory.world.length == 0) {
        world.init();
        world.details();
    }
   
    // remove dead creeps
    mgrMemory.deleteCreeps();
   
    // Check stage and proceed accordingly
    for (var w in Memory.world) {
        switch (Memory.world[w].stage) {
           case 0:
               // console.log("Evaluating creeps...");
               mgrWorld.evaluateCreeps(Memory.world[w]);
               break;
            default:
               break;
        }
        
        // console.log(Game.rooms[Memory.world[w].name].find(FIND_MY_CREEPS).length);

        if (Game.rooms[Memory.world[w].name].find(FIND_MY_CREEPS).length <= (Memory.world[w].targetCreepCount + Game.rooms[Memory.world[w].name].memory.dyingSuppliers + Game.rooms[Memory.world[w].name].memory.dyingUpgraders)) {
        // if (Object.keys(Memory.creeps).length <= (Memory.world[w].targetCreepCount + Game.rooms[Memory.world[w].name].memory.dyingSuppliers + Game.rooms[Memory.world[w].name].memory.dyingUpgraders)) {
            // console.log(Game.spawns[Memory.world[w].mySpawns[0].name].createCreep( Memory.world[w].nextCreep.parts, null, Memory.world[w].nextCreep ));
            var ret;
            if (Memory.world[w].nextCreep != null) {
                ret = Game.spawns[Memory.world[w].mySpawns[0].name].createCreep( Memory.world[w].nextCreep.parts, null, Memory.world[w].nextCreep );
                console.log("createCreep returned: " + ret);
            }
            if(_.isString(ret)) {
                console.log("Spawning a new creep of type: " + Memory.world[w].nextCreep.roleName);
                switch (Memory.world[w].nextCreep.roleName) {
                    case "supplier":
                        Game.rooms[Memory.world[w].name].memory.dyingSuppliers = 0;
                        console.log("dyingSuppliers now: " + Game.rooms[Memory.world[w].name].memory.dyingSuppliers);
                        break;
                    case "upgrader":
                        Game.rooms[Memory.world[w].name].memory.dyingUpgraders = 0;
                        console.log("dyingUpgraders now: " + Game.rooms[Memory.world[w].name].memory.dyingUpgraders);
                        break;
                    default:
                        break;
                }
            }
        }
        
        // show efficiency
        mgrProgress.profileEnergyCollectionEfficiency(Game.rooms[Memory.world[w].name]);
        mgrProgress.profileUpgradeEfficiency(Game.rooms[Memory.world[w].name]);
    }
    
    // run creep code
    Object.keys(Game.creeps).forEach((creepId) => {
    var creep = Game.creeps[creepId];
    roles[creep.memory.activeTask].call(creep);
    });
    
    // run tower code if tower is present
    var tower = Game.rooms[Memory.world[w].name].find(FIND_MY_STRUCTURES, { filter: (obj) => obj.structureType == STRUCTURE_TOWER && obj.energy >= 10 });
    // console.log("Target object: " + tower);
    
    
    if (tower !== undefined){
        for (var t in tower){
            var enemy = tower[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (enemy !== null) {
                // enemy present, attack!
                tower[t].attack(enemy);
                // For larger groups, this code should scan creep body parts and prioritize targets with the most heal parts first.
            }
            else {
                var target = Game.rooms[Memory.world[w].name].find(FIND_MY_STRUCTURES, { filter: (obj) => (obj.hits < obj.hitsMax) && (obj.hitsMax - obj.hits > REPAIR_POWER) && (obj.structureType != STRUCTURE_RAMPART) });
                if (target != undefined && target && target.length > 0) {
                    // save energy to defend attacks
                    if (tower[t].energy > 700) {
                        tower[t].repair(target[0]);
                    }
                } else { // repair other structures
                    var altTarget = Game.rooms[Memory.world[w].name].find(FIND_STRUCTURES, {filter: (obj) => (obj.hits < obj.hitsMax) && (obj.structureType == STRUCTURE_CONTAINER || obj.structureType == STRUCTURE_ROAD) });
                }   if (altTarget != undefined && altTarget && altTarget.length > 0) {
                        if (tower[t].energy > 600) {
                            tower[t].repair(altTarget[0]);
                        }
                } else {
                    // The (obj.hits < #) value here should be ramped up over time based on favorable conditions detected in code rather than
                    // having a hard-coded value.
                    var defensiveTargets = Game.rooms[Memory.world[w].name].find(FIND_STRUCTURES, {filter: (obj) => (obj.hits < 27500) && (obj.structureType == STRUCTURE_RAMPART || obj.structureType == STRUCTURE_WALL) });
                }   if (defensiveTargets != undefined && defensiveTargets && defensiveTargets.length > 0) {
                        if (tower[t].energy > 500) {
                            tower[t].repair(defensiveTargets[0]);
                        }
                }
            }
        }
    }
}