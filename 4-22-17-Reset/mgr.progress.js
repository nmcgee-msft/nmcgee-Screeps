"use strict";

var mgrProgress = {
    
    CONTROLLER_PROFILER_TICKS: 10,
    CONTROLLER_PROFILER_RATE: 10,
    CONTROLLER_PROGRESS: { Delta_E : [], Efficiency : 0 },
    
    initializeEnergyCollectionProfiling: function(room)
    {
        if (undefined === room.memory.energyStats
        || room.memory.energyStats === null)
        {
            room.memory.energyStats = this.CONTROLLER_PROGRESS;
            return true;
        }
        else{
            return false;
        }
    },
    
    profileEnergyCollectionEfficiency: function(room)
    {
        var energyMined = 0;
        var timeElapsed = 0;
        var energyAvailable = 0;
        var sourceLimit = 1500;
        if (room.controller.my){
            sourceLimit = 3000;
        }
        
        var sources = room.find(FIND_SOURCES);
        for (var s in sources){
            energyMined += (sourceLimit - sources[s].energy);
            timeElapsed += (ENERGY_REGEN_TIME - sources[s].ticksToRegeneration);
            energyAvailable = energyAvailable + sources[s].energyCapacity;
            // console.log (energyMined + "  " + timeElapsed + "  " + energyAvailable);
        }
        
        if(!mgrProgress.initializeEnergyCollectionProfiling(room)){
            if (Game.time % 10 == 0){
                room.memory.energyStats.Efficiency = (energyMined / ((timeElapsed / ENERGY_REGEN_TIME) * energyAvailable)) * 100;
            }
        }
    },
    
    initializeUpgradeProfiling: function(room)
    {
        if (undefined === room.memory.controllerStats
        || room.memory.controllerStats === null)
        {
            room.memory.controllerStats = this.CONTROLLER_PROGRESS;
            return true;
        }
        else{
            return false;
        }
    },
    
    profileUpgradeEfficiency: function(room)
    {
        var energyAvailable = 0;
        
        var sources = room.find(FIND_SOURCES);
        for (var s in sources){
            energyAvailable = energyAvailable + sources[s].energyCapacity;
        }
        
        if(!mgrProgress.initializeUpgradeProfiling(room)){
            if (Game.time % 10 == 0){
                if (room.memory.controllerStats.Delta_E.length <= this.CONTROLLER_PROFILER_TICKS){
                    room.memory.controllerStats.Delta_E.push(room.controller.progress);
                }
                
                if (room.memory.controllerStats.Delta_E.length > this.CONTROLLER_PROFILER_TICKS){
                    room.memory.controllerStats.Delta_E.shift();
                    room.memory.controllerStats.Efficiency = ((room.memory.controllerStats.Delta_E[this.CONTROLLER_PROFILER_TICKS-1]-room.memory.controllerStats.Delta_E[0])/(energyAvailable * ((this.CONTROLLER_PROFILER_RATE * this.CONTROLLER_PROFILER_TICKS) / 300)) * 100);
                    for (var c in Game.creeps){
                        if (Game.creeps[c].memory.homeRoom == undefined) {
                            Game.creeps[c].say(Math.round(room.memory.energyStats.Efficiency) + " : " + Math.round(room.memory.controllerStats.Efficiency), true);
                            break;
                        }
                    }
                }
            }
        }
    }
};
module.exports = mgrProgress;