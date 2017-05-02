"use strict";

var mgrStrategy = require('mgr.strategy');
var mgrMemory = require('mgr.memory');

var roles = {};
    
roles.worker = function(room) {
    var target = this.pos.findClosestByRange(FIND_DROPPED_ENERGY);
    if (target && this.pos.getRangeTo(target) < 5){
        if (this.carry.energy < this.carryCapacity - 30 && target.energy > 10) {
            if(this.pickup(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }
        }
    } else
    {
        var source = this.pos.findClosestByPath(FIND_SOURCES);
        if (source) {
            if (this.harvest(source) == OK || this.moveTo(source) == OK) {
                if (this.carry.energy == this.carryCapacity) {
                    console.log("New Role: Energizer");
                    this.memory.role = "energizer";
                }
            }
        }
    }
}

roles.energizer = function() {
    console.log(Game.spawns['Spawn1'].energy + "    " + Game.spawns['Spawn1'].energyCapacity);
    if (Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity && this.carry.energy != 0){
        var base = Game.spawns.Spawn1;
        if(this.transfer(base, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(base);
        }
    } 
    else if (this.carry.energy == 0) {
        this.memory.role = "worker";
    }
    else {
        this.memory.role = "upgrader";
    }
}
                
roles.upgrader = function() {
    if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller);
    }
    if (this.carry.energy == 0){
        this.memory.role = "worker";
    }
}

module.exports.loop = function () {
                
        for (var rm in Game.rooms){
            var room = Game.rooms[rm];
        
            // remove dead creeps
            mgrMemory.deleteCreeps();
            // execute strategy
            mgrStrategy.run(room);
            
            // run creep code
            Object.keys(Game.creeps).forEach((creepId) => {
            var creep = Game.creeps[creepId];
            if (creep.memory.role == undefined)
                creep.memory.role = "worker";
            roles[creep.memory.role].call(creep);
            });
        }
    }