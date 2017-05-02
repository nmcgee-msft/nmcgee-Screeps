"use strict";

var roles = {};

roles.build = function() {
    if (roles.opportunist(this)) {
        return;
    }

    var sites = this.room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length > 0) {
        if (this.carry.energy == 0) {
            roles.nextTask(this);
            // roles[this.memory.activeTask].call(this);
            return;
        } else {
            if (this.build(sites[0]) != 0) {
                this.moveTo(sites[0]);
            }
        }
    } else {
        roles.nextTask(this);
        // roles[this.memory.activeTask].call(this);
        return;
    }
}

roles.repair = function() {
    if (roles.opportunist(this)) {
        return;
    }
    
    var damagedSites  = this.room.find(FIND_STRUCTURES, { filter: (obj) => (obj.hits < obj.hitsMax) && (obj.structureType == STRUCTURE_ROAD) });
    // console.log("damaged sites: " + damagedSites);
    if (damagedSites.length > 0) {
        if (this.carry.energy == 0) {
            roles.nextTask(this);
            roles[this.memory.activeTask].call(this);
            return;
        } else {
            damagedSites.sort((a, b) => a.hits - b.hits);
            if (this.repair(damagedSites[0]) != 0) {
                this.moveTo(damagedSites[0]);
            }
        }
    }// else {
     //   roles.nextTask(this);
     //   roles[this.memory.activeTask].call(this);
     //   return;
     // }
}

roles.moveToHarvest = function() {
    if (roles.opportunist(this)) {
        return;
    }
    
    if (this.carry.energy != this.carryCapacity) {
        // Load balance the sources in the room
        if (this.memory.mySource == 0) {
            for (var w in Memory.world) {
                if (Memory.world[w].name == this.room.name) {
                    if (Memory.world[w].nextHarvestAssignment >= Memory.world[w].harvestAssignment.length) {
                        Memory.world[w].nextHarvestAssignment = 0;
                    }
                    this.memory.mySource = Memory.world[w].harvestAssignment[Memory.world[w].nextHarvestAssignment];
                    Memory.world[w].nextHarvestAssignment++;
                    // console.log("nextHarvestAssignment = " + Memory.world[w].nextHarvestAssignment);
                }
            }
        }
        
        // console.log(this.name + " is getting object by id: " + this.memory.mySource);
        // var source = this.pos.findClosestByPath(FIND_SOURCES, { filter: (obj) => obj.energy != 0 } );
        var source = Game.getObjectById(this.memory.mySource);
        if (this.moveTo(source) == 0) {
            // console.log(this.harvest(source));
            this.harvest(source);
        }
    } else {
        roles.nextTask(this);
        roles[this.memory.activeTask].call(this);
        return;
    }
}

roles.moveToUpgrade = function() {
    if (roles.opportunist(this)) {
        // console.log("moveToUpgrade, opp this: " + this);
        return;
    }
    
    if (this.carry.energy != 0) {
        if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller);
        }
    }
    else {
        roles.nextTask(this);
        roles[this.memory.activeTask].call(this);
        return;
    }
}

roles.energizeRoom = function() {
    if (roles.opportunist(this)) {
        return;
    }
    
    if (this.carry.energy == 0) {
        roles.nextTask(this);
        roles[this.memory.activeTask].call(this);
        return;
    }
    else {
        var target = this.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (obj) => (obj.structureType == STRUCTURE_EXTENSION || obj.structureType == STRUCTURE_SPAWN) && obj.energy < obj.energyCapacity });
        if (target) {
            if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
                return;
            }
        } else {
            var towers = this.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (obj) => (obj.structureType == STRUCTURE_TOWER && obj.energy < obj.energyCapacity - 100)});
            if (towers) {
                if (this.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(towers);
                    return;
                }
            } else {
                // just move to spawn if everything is full
                /*var spawn = this.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (obj) => obj.structureType == STRUCTURE_SPAWN });
                if (spawn) {
                    this.moveTo(spawn);
                }*/
                
                roles.nextTask(this);
                roles[this.memory.activeTask].call(this);
                return;
            }
        }
    }
}

roles.nextTask = function(creep) {
    // console.log("Time to change...");
    // console.log("Creep: " + creep.memory.activeTaskNumber);
    if (creep.memory.activeTaskNumber >= creep.memory.taskList.length - 1) {
        // end of list, reset
        creep.memory.activeTaskNumber = 0;
        creep.memory.activeTask = creep.memory.taskList[0].task;
    } else {
        creep.memory.activeTaskNumber++;
        creep.memory.activeTask = creep.memory.taskList[creep.memory.activeTaskNumber].task;
    }
}

roles.opportunist = function(creep) {
    // console.log("In opportunist...");
    var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
    if (target && creep.pos.getRangeTo(target) < 5 && creep.carry.energy < creep.carryCapacity - 15) {
        if (target.energy > 15) {
            if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        return true;
    }
}

roles.rangedOpportunist = function(creep) {
    // console.log("In opportunist...");
    var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
    if (target && creep.carry.energy < creep.carryCapacity - 15) {
        if (target.energy > 15) {
            if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        return true;
    }
}

module.exports = roles;