"use strict";

var roles = {};

roles.scout = function() {
    // Scout test command: Game.spawns[Memory.world[0].mySpawns[0].name].createCreep( [MOVE], null, { homeRoom: "W8N3", roleName: "scout", activeTask: "scout", activeTaskNumber: 0, taskList: [{ task: "scout" }] });
    if (Game.time % 9 == 0) {
        this.say("Don't be", true);
    }
    if (Game.time % 9 == 2) {
        this.say("alarmed...", true);
    }
    if (Game.time % 9 == 4) {
        this.say("I come in", true);
    }
    if (Game.time % 9 == 6) {
        this.say("peace.", true);
    }

    var dest = new RoomPosition(45,48,"W7N2");
    
    if (this.room.name == "W7N2" && this.pos.x == 45 && this.pos.y == 48) {
        var exit = this.pos.findClosestByRange(5);
        this.moveTo(exit);
        return;
    }
    if (this.room.name == "W7N1") {
        // this.moveTo(this.room.controller);
        var exit = this.pos.findClosestByRange(3);
        this.moveTo(exit);
        return;
    }
    if (this.room.name == "W6N1") {
        // We're here... move to controller
        this.moveTo(this.room.controller);
        return;
    }
    
    this.moveTo(dest);

/*
    if (this.room.name == "W7N1") {
        // this.moveTo(this.room.controller);
        // var exit = this.pos.findClosestByRange(3);
        this.moveTo(exit);
    } else {
    var route = Game.map.findRoute(this.room, "W6N1");
    if(route.length > 0) {
        console.log('Now heading to room '+route[0].room);
        var exit = this.pos.findClosestByRange(route[0].exit);
        this.moveTo(exit);
    }
    }


    console.log("Exit description: " + Game.map.describeExits(this.room.name));
    var exits = Game.map.describeExits(this.room.name);
    for (var e in exits) {
        console.log(e);
    }
    */
    /*
    // Setup breadcrumb array to find our way back... once it's something we want to do
    if (this.memory.breadCrumbs == undefined) {
        this.memory.breadCrumbs = [];
        this.memory.breadCrumbs.push(this.room.name);
    }
    
    // For now, just find the way to Ryan and then talk shit
    if (this.room.name == this.memory.homeRoom) {
        var exit = this.pos.findClosestByRange(5);
        this.moveTo(exit);
        //this.moveTo(this.room.controller);
    } else {
        if (this.room.name == "W6N1") {
            // We're here... move to controller
            this.moveTo(this.room.controller);
        } else {
            // Save current room for backtracking and knowing which exit not to choose from the next room
            if (this.memory.breadCrumbs[this.memory.breadCrumbs.length-1] != this.room.name) {
                console.log("Would push here...");
                this.memory.breadCrumbs.push(this.room.name);
            }
            
            // Now, find the next exit - only 2 exits from all rooms on the way to Ryan so this is simpler than it would be otherwise...
            var exits = Game.map.describeExits(this.room.name);
            console.log("Exits: " + exits);
            for (var e in exits) {
                console.log("e: " + exits[e] + "breadCrumbs[length - 1]: " + this.memory.breadCrumbs[this.memory.breadCrumbs.length - 2]);
                if (exits[e] != this.memory.breadCrumbs[this.memory.breadCrumbs.length - 2]) {
                    // this is the exit we want
                    var exit = this.pos.findClosestByPath(parseInt(e));
                    console.log("exit: " + exit);
                   // this.moveTo(exit);
                     this.moveTo(this.room.controller);
                }
            }
        }
    }*/
}

roles.moveToHarvest = function() {
    if (roles.opportunist(this)) {
        return;
    }
    
    if (this.carry.energy != this.carryCapacity) {
        // console.log("need to harvest");
        var source = this.pos.findClosestByPath(FIND_SOURCES, { filter: (obj) => obj.energy != 0 } );
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

roles.harvest = function() {
    if (roles.opportunist(this)) {
        return;
    }
    
    if (this.carry.energy != this.carryCapacity) {
        // console.log("need to harvest");
        var source = this.pos.findClosestByPath(FIND_SOURCES, { filter: (obj) => obj.energy != 0 } );
        if (this.moveTo(source) == 0) {
            // console.log(this.harvest(source));
            this.harvest(source);
        }
    } else {
        var storageLoc = this.pos.findClosestByRange(FIND_STRUCTURES, { filter: (obj) => obj.structureType == STRUCTURE_STORAGE || obj.structureType == STRUCTURE_CONTAINER });
        if (storageLoc.structureType == STRUCTURE_STORAGE) {
            if (this.room.storage.store[RESOURCE_ENERGY] < this.room.storage.storeCapacity) {
                if (this.transfer(this.room.storage, RESOURCE_ENERGY, this.carry.energy) != 0) {
                    this.moveTo(this.room.storage);
                }
            }
        }
    }
}

roles.upgrade = function() {

    if (this.carry.energy == 0) {
        var con = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER } );
        if (con != undefined) {
            if (con[0].transfer(this, RESOURCE_ENERGY) != 0) {
                    //console.log("found container... " + con[0].store);
                    if (this.moveTo(con[0]) == 0) {
                        // arrived
                        con[0].transfer(this, RESOURCE_ENERGY);
                    }
                }
        }
    } else {
        // upgrade controller
        if (this.carry.energy != 0) {
            if (this.memory.arrivalTime == undefined) {
                this.memory.arrivalTime = Game.time;
            }
            if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller);
            }
        }
    }
    
    if (this.memory.arrivalTime != undefined) {
        // console.log("arrival: " + this.memory.arrivalTime);
        // console.log("time to upgrader replacement ticker: " + (this.ticksToLive - (this.memory.arrivalTime - this.memory.spawnTime)));
        if ((this.ticksToLive - (this.memory.arrivalTime - this.memory.spawnTime)) == 0) {
            // time for a replacement (this should only run once per upgrader creep)
            this.room.memory.dyingUpgraders = 1;
            console.log("dyingUpgraders: " + this.room.memory.dyingUpgraders);
        }
    }
}

roles.deposit = function() {
    if (this.memory.arrivalTime != undefined) {
        // console.log("arrival: " + this.memory.arrivalTime);
        // console.log("time to supplier replacement ticker: " + (this.ticksToLive - (this.memory.arrivalTime - this.memory.spawnTime)));
        if ((this.ticksToLive - (this.memory.arrivalTime - this.memory.spawnTime)) == 0) {
            // time for a replacement (this should only run once per upgrader creep)
            this.room.memory.dyingSuppliers = 1;
            console.log("dyingSuppliers: " + this.room.memory.dyingSuppliers);
        }
    }
    
    if (roles.opportunist(this)) {
        return;
    }
    
    var con = this.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER } );
    if (con != undefined) {
        if (this.transfer(con[0], RESOURCE_ENERGY) != 0) {
            this.moveTo(con[0]);
            return;
        }
    }
    
    roles.nextTask(this);
}

roles.withdrawEnergy = function() {
    if (this.memory.arrivalTime != undefined) {
        // console.log("arrival: " + this.memory.arrivalTime);
        // console.log("time to supplier replacement ticker: " + (this.ticksToLive - (this.memory.arrivalTime - this.memory.spawnTime)));
        if ((this.ticksToLive - (this.memory.arrivalTime - this.memory.spawnTime)) == 0) {
            // time for a replacement (this should only run once per upgrader creep)
            this.room.memory.dyingSuppliers = 1;
            console.log("dyingSuppliers: " + this.room.memory.dyingSuppliers);
        }
    }
    
    if (roles.rangedOpportunist(this)) {
        return;
    }
    
    if (this.carry.energy < this.carryCapacity) {
        if (this.room.storage.store[RESOURCE_ENERGY] > 0) {
            // console.log("Energy available in storage");
            // console.log(this.withdraw(this.room.storage, RESOURCE_ENERGY, this.carryCapacity - this.carry.energy != 0));
            if (this.withdraw(this.room.storage, RESOURCE_ENERGY, this.carryCapacity - this.carry.energy) != 0) {
                this.moveTo(this.room.storage);
            }
        }
    } else {
        // Arrived at pickup location - set timer
        if (this.memory.arrivalTime == undefined) {
            this.memory.arrivalTime = Game.time;
        }
        roles.nextTask(this);
        roles[this.memory.activeTask].call(this);
        return;
    }
}

roles.storeEnergy = function() {
    if (roles.opportunist(this)) {
        return;
    }
    
    if (this.carry.energy == 0) {
        roles.nextTask(this);
        roles[this.memory.activeTask].call(this);
        return;
    }
    
    var source = this.pos.findClosestByPath(FIND_SOURCES);
    if (source !== undefined) {
        // console.log("In store Energy...");
        var storageLoc = source.pos.findClosestByRange(FIND_STRUCTURES, { filter: (obj) => obj.structureType == STRUCTURE_STORAGE || obj.structureType == STRUCTURE_CONTAINER });
        if (storageLoc.structureType == STRUCTURE_STORAGE) {
            if (this.room.storage.store[RESOURCE_ENERGY] < this.room.storage.storeCapacity) {
                if (this.transfer(this.room.storage, RESOURCE_ENERGY, this.carry.energy) != 0) {
                    this.moveTo(this.room.storage);
                }
            }
        }
        // handle containers...
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

roles.build = function() {
    if (this.carry.energy == 0) {
        roles.nextTask(this);
        roles[this.memory.activeTask].call(this);
        return;
    }
    
    var site = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (site != undefined) {
        if (this.build(site) != 0) {
            this.moveTo(site);
        }
    } else {
        var towers = this.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (obj) => (obj.structureType == STRUCTURE_TOWER && obj.energy < obj.energyCapacity - 100)});
        if (towers) {
            if (this.transfer(towers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(towers);
                return;
            }
        }
    }
}

roles.nextTask = function(creep) {
    // console.log("Time to change...");
    // console.log("Creep: " + creep.memory.activeTaskNumber);
    if (creep.memory.activeTaskNumber == creep.memory.taskList.length - 1) {
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