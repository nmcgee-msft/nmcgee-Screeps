"use strict";

var mgrStats = {
    
    distEnergyToController: function(room) {
        var sources = room.find(FIND_SOURCES);
        console.log("======> " + sources);
		var controller = room.controller;
		var maxDist = 0, dist = 0;
		for (var s in sources){
		    dist = sources[s].pos.getRangeTo(controller.pos);
		    console.log("distEnergyToController = " + dist);
		    if (dist > maxDist)
		        maxDist = dist;
		}
		
		if (undefined === room.memory.strategyStateData
            || room.memory.strategyStateData === null)
            {
                room.memory.strategyStateData = {};
            }
        if (maxDist < 10){
            room.memory.strategyStateData.distEnergyToController = 10;
            } else if (maxDist > 30){
                room.memory.strategyStateData.distEnergyToController = 30;
            }
            else{
                room.memory.strategyStateData.distEnergyToController = maxDist;
            }
    }
};

module.exports = mgrStats;

