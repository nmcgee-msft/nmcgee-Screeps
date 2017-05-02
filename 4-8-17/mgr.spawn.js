"use strict";

var utilcreepbuilder = require("util.creepbuilder");

var sizeCreep = function(room, partCounts){
    var partList = [];
    var availableEnergy = room.energyAvailable;
    var energyLevel = room.energyAvailable / room.energyCapacityAvailable;
    if (energyLevel < 0.67){
        // console.log ("Energy Level: " + energyLevel);
        room.memory.lowEnergy = true;
        return partList;
    }
    else
    {
        // console.log ("Energy Level: " + energyLevel);
        room.memory.lowEnergy = false;
        var parts = 0;
        var partCost = 100;
        // no more than 50 parts...
        while (parts < 50 && availableEnergy >= 50){
            Object.keys(partCounts).forEach((name) => {
                switch (name){
                    case WORK:
                        console.log("Name = " + name);
                        partCost = 100;
                        break;
                    default:
                        console.log("Name = " + name);
                        partCost = 50;  // BUG BUG - Need to update this later for other part prices
                }
                //for (var i = 0; i < partCounts.name[0]; i++){
                    availableEnergy -= partCost;
                    partList.push(name);
                    if (availableEnergy > 0){
                        partCost = partCost;
                    }
                    else{
                        partList.shift();
                        console.log("Part List: " + partList);
                        return partList;
                    }
                // }
            });
        }
    }
    console.log("Part List: " + partList);
    return partList;
}

var mgrSpawn = {

    surveyRoom: function(room){
        var CREEP_TYPES_ALIVE = {builder : 0, energizer : 0, harvester : 0, miner : 0, mover : 0, other : 0, repairer : 0, upgrader : 0, worker : 0};        
        var creeps = room.find(FIND_CREEPS);
        if (creeps === null || creeps === undefined){
            console.log("surveying has zero creeps...");
            room.memory.creepTypeCounts = this.CREEP_TYPES_ALIVE;
        }
        var _harvester = 0;
        var _upgrader = 0;
        var _mover = 0;
        var _builder = 0;
        var _repairer = 0;
        var _worker = 0;
        var _miner= 0;
        var _energizer = 0;
        var _otherRoles = 0;
    
        for (var creep in creeps)
        {
            if (creeps[creep].memory !== undefined)
            {
                switch (creeps[creep].memory.role) {    // Only considering primary roles...
                    case"harvester":
                        _harvester++; break;
                    case "upgrader":
                        _upgrader++; break;
                    case "mover":
                        _mover++; break;
                    case "miner":
                        _miner++; break;
                    case "builder":
                        _builder++; break;
                    case "repairer":
                        _repairer++; break;
                    case "worker":
                        _worker++; break;
                    case "energizer":
                        _energizer++; break;
                    default:
                        _otherRoles++;
                }
            }
        }
        
        if (undefined === room.memory.creepTypeCounts
        || room.memory.creepTypeCounts === null)
        {
            room.memory.creepTypeCounts = this.CREEP_TYPES_ALIVE;
        }
        
        room.memory.creepTypeCounts.harvester = _harvester;
        room.memory.creepTypeCounts.upgrader = _upgrader;
        room.memory.creepTypeCounts.builder = _builder;
        room.memory.creepTypeCounts.repairer = _repairer;
        room.memory.creepTypeCounts.worker = _worker;
        room.memory.creepTypeCounts.miner = _miner;
        room.memory.creepTypeCounts.mover = _mover;
        room.memory.creepTypeCounts.energizer = _energizer;
        room.memory.creepTypeCounts.other = _otherRoles;
    },
    
    spawnCreep: function(room){
        var spawns = room.find(FIND_MY_SPAWNS);
        for (var s in spawns){
            // Get creep types needed
            var creepType = {};
            if (room.memory.creepTypeCounts.worker < room.memory.desiredCreeps.worker){
                creepType = { role: "worker" };
            } else if (room.memory.creepTypeCounts.upgrader < room.memory.desiredCreeps.upgrader){
                creepType = { role: "upgrader" };
            }
            // Set parts
            var parts = [];
            switch (creepType.role)
            {
                case 'worker':
                    parts = sizeCreep(room, {WORK : 1, MOVE : 2, CARRY : 1});
                    break;
                 case 'upgrader':
                    parts = sizeCreep(room, {WORK : -1, MOVE : 1, CARRY : 1});
                    break;
                default:
                    parts = sizeCreep(room, {WORK : 1, MOVE : 1, CARRY : 1});
            }
            
            if (!room.memory.lowEnergy) {
                if (room.memory.creepTypeCounts.worker < room.memory.desiredCreeps.worker){
                    var result = spawns[s].createCreep([WORK, MOVE, MOVE, CARRY, CARRY], null, creepType);
                    console.log("createCreep result = " + result + "    Parts: " + parts + "    creepType: " + creepType);
                    if (_.isString(result))
                        break;
                }
            }
        }
    }
};

module.exports = mgrSpawn;