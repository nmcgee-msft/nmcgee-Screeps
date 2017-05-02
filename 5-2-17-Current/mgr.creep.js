"use strict";

var creep = {};

creep.basicWorker = function() {
    var spawnTime = Game.time;
    return { roleName: "basicWorker", spawnTime: spawnTime, activeTask: "moveToHarvest", activeTaskNumber: 0, mySource: 0, parts: [WORK,CARRY,MOVE], taskList: [{ task: "moveToHarvest" }, { task: "energizeRoom" }, { task: "moveToUpgrade" }] };
},

creep.builder = function() {
    var spawnTime = Game.time;
    return { roleName: "builder", spawnTime: spawnTime, activeTask: "moveToHarvest", activeTaskNumber: 0, mySource: 0, parts: [WORK,CARRY,MOVE], taskList: [{ task: "moveToHarvest" }, { task: "build" }] };
},

creep.repairer = function() {
    var spawnTime = Game.time;
    return { roleName: "repairer", spawnTime: spawnTime, activeTask: "moveToHarvest", activeTaskNumber: 0, mySource: 0, parts: [WORK,CARRY,MOVE], taskList: [{ task: "moveToHarvest" }, { task: "repair" }] };
},

creep.evaluateCreeps = function(w) {
    // targetCreepList is a prioritized list of creeps.
    // So, scanning in order and finding the first missing creep
    // is enough to establish what we need to set the next creep.
    var creeps = Game.rooms[w.name].find(FIND_MY_CREEPS);
    // reset next creep to prevent spamming the wrong type
    w.nextCreep = {};
    if (creeps.length > 0) {
        for (var t in Game.rooms[w.name].memory.targetCreepList) {
            var matchCount = 0;
            for (var c in creeps) {
                if (creeps[c].memory.roleName == t) {
                    matchCount++;
                }
            }
            console.log("creepList[t] = " + Game.rooms[w.name].memory.targetCreepList[t]);
            if (matchCount < Game.rooms[w.name].memory.targetCreepList[t]) {
                w.nextCreep = creep[t].call();
                return;
            } else {
                // reassign creeps if we have a surplus of one type
                // console.log("should be reassigning here and t = " + t);
                // console.log("Assigning builder for: " + creeps[c].name);
                switch (t) {
                    case "basicWorker":
                        console.log("Assigning builder for: " + creeps[c].name);
                        creeps[c].memory.roleName = "builder";
                        creeps[c].memory.taskList = [{ task: "moveToHarvest" }, { task: "build" }];
                        break;
                    default:
                        break;
                }
            }
        }  
    } else {
        // No creeps?  Set the next type to the first type in the targetCreepList
        for (var t in Game.rooms[w.name].memory.targetCreepList) {
            w.nextCreep = creep[t].call();
            console.log("SOURCE: " + w.nextCreep.mySource);
            break;
        }
    }
}

module.exports = creep;