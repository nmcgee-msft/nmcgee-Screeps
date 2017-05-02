"use strict";

var mgrStats = require("mgr.stats");
var mgrSpawn = require("mgr.spawn");

    var Strategy = function() {
        this.stage = "";
        this.room = {};
        this.DESIRED_CREEP_TYPES = {builder : 0, harvester : 0, miner : 0, mover : 0, other : 0, repairer : 0, upgrader : 0, worker : 0};
    };
    
    Strategy.prototype = {
        setStrategy: function(stage, room) {
            this.stage = stage;
            this.room = room;
        },
        
        implementStrategy: function(room) {
            console.log("Implementing strategy...");
            return this.stage.implementStrategy(room);
        }
    };
    
    var Zero = function() {
        this.DESIRED_CREEP_TYPES = {builder : 0, harvester : 0, miner : 0, mover : 0, other : 0, repairer : 0, upgrader : 0, worker : 10};
        this.implementStrategy = function(room) {
            console.log("Top of stage zero loop...");
            // set next stage trigger condition
            if (undefined === room.memory.desiredCreeps
            || room.memory.desiredCreeps === null)
            {
                console.log("desiredCreeps is null or undefined...");
                room.memory.desiredCreeps = this.DESIRED_CREEP_TYPES;
                mgrStats.distEnergyToController(room);
                room.memory.desiredCreeps.worker = room.memory.strategyStateData.distEnergyToController;
            }
            
            // test for next stage trigger
            console.log("surveying room...");
            mgrSpawn.surveyRoom(room);
            if (room.memory.creepTypeCounts.worker >= room.memory.desiredCreeps.worker){
                // stage condition hit - advance stage!
                console.log("Triggering stage one!");
                room.memory.strategyStateData.stage = "One";
                return;
            }
            
            // perform build/spawn operations and update memory with build location data
            console.log("Calling mgrSpawn");
            mgrSpawn.spawnCreep(room);
        }
    };
    
    var One = function() {
        this.implementStrategy = function(room) {
            // set next stage trigger condition
            
            // set spawn types, roles, limits
            room.memory.desiredCreeps.worker = 18;
            room.memory.desiredCreeps.upgrader = 0;
            
            mgrSpawn.surveyRoom(room);
            if (room.memory.creepTypeCounts.worker + room.memory.creepTypeCounts.upgrader < room.memory.desiredCreeps.worker){
                // perform build operations and update memory with build location data
                mgrSpawn.spawnCreep(room);
            }
            
            // test for next stage trigger
        }
    };
    
var mgrStrategy = {
    run: function(room) {
        if (undefined === room.memory.strategyStateData
            || room.memory.strategyStateData === null)
            {
                room.memory.strategyStateData = {};
                room.memory.strategyStateData.stage = "Zero";
            }
        
        var strategy = new Strategy(room);
        switch (room.memory.strategyStateData.stage)
        {
            case "Zero":
                console.log("Running Zero");
                var zero = new Zero();
                strategy.setStrategy(zero);
                strategy.implementStrategy(room);
                break;
            case "One":
                console.log("Running One");
                var one = new One();
                strategy.setStrategy(one);
                strategy.implementStrategy(room);
                break;
            default:
                break;
        }
    }
};

module.exports = mgrStrategy;



// Maintain a 'total' creeps/types needed list

// widen roads using slope formula

// creeps should add their role and remaining ticks to common memory array for consumption by spawn manager once their ticks are <=25 or so...