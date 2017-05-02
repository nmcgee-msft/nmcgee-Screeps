var mgrWorld = {

    upgrader: function() {
        var spawnTime = Game.time;
        return { roleName: "upgrader", spawnTime: spawnTime, activeTask: "upgrade", activeTaskNumber: 0, parts: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], taskList: [{ task: "upgrade" }] };
    },
    
    scout: function() {
        return { activeTask: "scout", activeTaskNumber: 0, parts: [MOVE], taskList: [{ task: "scout" }], homeRoom: "W8N3", roleName: "scout" };
    },
    
    harvester: function() {
        return { activeTask: "harvest", activeTaskNumber: 0, parts: [WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,CARRY,CARRY], taskList: [{ task: "harvest" }] };
    },

    supplier: function() {
        var spawnTime = Game.time;
        return { roleName: "supplier", spawnTime: spawnTime, activeTask: "withdrawEnergy", activeTaskNumber: 0, parts: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], taskList: [{ task: "withdrawEnergy" }, { task: "deposit" }] };
    },

    energizer: function() {
        if (Object.keys(Memory.creeps).length < 3) {
            return { activeTask: "moveToHarvest", activeTaskNumber: 0, parts: [MOVE,MOVE,CARRY,CARRY,WORK], taskList: [{ task: "moveToHarvest" }, { task: "energizeRoom" }] };
        } else {
            return { activeTask: "moveToHarvest", activeTaskNumber: 0, parts: [MOVE,MOVE,CARRY,CARRY,WORK,MOVE,MOVE,CARRY,CARRY,WORK,MOVE,MOVE,CARRY,CARRY,WORK,WORK], taskList: [{ task: "moveToHarvest" }, { task: "energizeRoom" }, { task: "storeEnergy" }] };
        }
        
    },
    
    builder: function() {
        return { activeTask: "withdrawEnergy", activeTaskNumber: 0, parts: [MOVE,MOVE,CARRY,CARRY,WORK,MOVE,MOVE,CARRY,CARRY,WORK,MOVE,MOVE,CARRY,CARRY,WORK,CARRY,CARRY,CARRY,WORK,MOVE,WORK,MOVE], taskList: [{ task: "withdrawEnergy" }, { task: "build" }] };
    },
    
    evaluateCreeps: function(w) {
        // maintain energizers based on room energy level and max room energy
        // find current energizers...
        var creeps = Game.rooms[w.name].find(FIND_MY_CREEPS);
        var energizers = 0;
        var builders = 0;
        var upgraders = (0 - Game.rooms[w.name].memory.dyingUpgraders);
        // console.log("upgraders: " + upgraders);
        var harvesters = 0;
        var scouts = 0;
        var suppliers = (0 - Game.rooms[w.name].memory.dyingSuppliers);
        if (creeps) {
            for (var c in creeps) {
                for (var t in creeps[c].memory.taskList) {
                    if (creeps[c].memory.taskList[t].task == "energizeRoom") {
                        energizers++;
                    }
                    if (creeps[c].memory.taskList[t].task == "upgrade") {
                        upgraders++;
                    }
                    if (creeps[c].memory.taskList[t].task == "scout") {
                        scouts++;
                    }
                    if (creeps[c].memory.taskList[t].task == "harvest") {
                        harvesters++;
                    }
                    if (creeps[c].memory.taskList[t].task == "build") {
                        builders++;
                    }
                    if (creeps[c].memory.taskList[t].task == "deposit") {
                        suppliers++;
                    }
                }
            }
        }

        if (energizers < 4) {
            w.nextCreep = mgrWorld.energizer();
            return;
        }
        
        var upgradeCount = 1;
        
        // code was here to increase the upgrade count when surplus energy accumulates in storage
        // but I screwed it up and it wouldn't turn off when below the threshhold...

        console.log("upgrade count: " + upgradeCount);
        if (suppliers < upgradeCount) {
            w.nextCreep = mgrWorld.supplier();
            return;
        }

        if (upgraders < upgradeCount) {
            w.nextCreep = mgrWorld.upgrader();
            return;
        }

        if (Game.rooms[w.name].find(FIND_CONSTRUCTION_SITES).length > 0) {
            if (builders < 1) {
                w.nextCreep = mgrWorld.builder();
                return;
            }
            
        }
        
        // if we have all of the roles, just do nothing
        w.nextCreep = null;
    }
    
};

module.exports = mgrWorld;