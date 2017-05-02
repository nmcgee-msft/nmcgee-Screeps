"use strict";

var Harvester = function () {
    this.parts = [{0:"WORK",1:"MOVE",2:"CARRY"}, "Stationary"];
};

var Upgrader = function () {
    this.parts = [{0:"WORK",1:"MOVE",2:"CARRY"}, "Stationary"];
};

var Miner = function () {
    this.parts = [{0:"WORK",1:"MOVE",2:"CARRY"}, "Balanced"];
};

var Mover = function () {
    this.parts = [{0:"MOVE",1:"CARRY"}, "Fast"];
};

var Builder = function () {
    this.parts = [{0:"WORK",1:"MOVE",2:"CARRY"}, "Balanced"];
};

var Repairer = function () {
    this.parts = [{0:"WORK",1:"MOVE",2:"CARRY"}, "Balanced"];
};

var Worker = function () {
    this.parts = [{0:"WORK",1:"MOVE",2:"CARRY"}, "Balanced"];
};

var Sizer = function(parts, room){
    var partsCost = 0;
    var moveIncluded = false;
    var workIncluded = false;
    var carryIncluded = false;
    var newParts = [];
    
    // HACK HACK BUGBUG
    var room = Game.rooms["W8N3"];
    var availableEnergy = room.energyAvailable;
    var energyLevel = room.energyAvailable / room.energyCapacityAvailable;
    if (energyLevel < 0.67){
            // push a cooldown value into memory which will signal an energy boost into extenders/spawns
            // callers need to monitor cooldown and retry when it clears
            // *** Need to monitor for cooldown expired here as well.  If we re-enter and still don't have enough energy,
            // *** we can proceed and create with whatever size is possible.
    }
    else{
        for (var i in parts[0]){
            switch (parts[0][i])
            {
                case "WORK":
                    workIncluded = true;
                    break;
                case "CARRY":
                    carryIncluded = true;
                    break;
                case "MOVE":
                    moveIncluded = true;
                default:
                    break;
            }
        }
        
        switch (parts[1])
        {
            case "Stationary":
                if (moveIncluded){
                    parts = "MOVE, ";
                    newParts.push(MOVE);
                    partsCost += 50;
                }
                if (carryIncluded){
                    parts += "CARRY, ";
                    newParts.push(CARRY);
                    partsCost += 50;
                }
                if (workIncluded){
                    parts += "WORK";
                    newParts.push(WORK);
                    partsCost += 100;
                }
                
                var i;
                var j = 0;
                for (i = 0; i < 9; i++){
                    if (partsCost + 100 <= availableEnergy){
                        partsCost += 100;
                        j += 1;
                        continue;
                    }
                    else{
                        break;
                    }
                }
                
                if (j > 0){
                    for (i = 0; i < j; i++){
                        parts += ", WORK";
                        newParts.push(WORK);
                    }
                }
                break;
            case "Balanced":
                break;
            case "Fast":
                break;
            default:
                break;
        }
    }
return newParts;
};

var utilCreepBuilder = {

    Factory: function() {
    this.createCreep = function (type, room) {
        var newCreep;

        if (type === "harvester") {
            newCreep = new Harvester();
        } else if (type === "upgrader") {
            newCreep = new Upgrader();
        } else if (type === "miner") {
            newCreep = new Miner();
        } else if (type === "mover") {
            newCreep = new Mover();
        } else if (type === "builder") {
            newCreep = new Builder();
        } else if (type === "repairer") {
            newCreep = new Repairer();
        } else if (type === "worker") {
            newCreep = new Worker();
        }

        newCreep.type = type;

        newCreep.parts = Sizer(newCreep.parts, room);
        console.log(newCreep.parts);
        console.log(Game.spawns.Spawn1.createCreep(newCreep.parts, null));
        return newCreep;
        }
    },

    run: function(room, type) {
        var factory = new this.Factory(room);
        factory.createCreep(type, room);
    }
};

module.exports = utilCreepBuilder;
