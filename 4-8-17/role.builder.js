var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var room = Game.rooms["W8N3"];  // BUGBUG: fix this for multiple rooms & new spawns
        var sites  = room.find(FIND_CONSTRUCTION_SITES);
		var i = sites.length;
		if (creep.memory.buildTime == undefined)
		{
		    creep.memory.buildTime = false;
		}
		if (i > 0){
		    if(!creep.memory.buildTime) {
    	        var sources = creep.room.find(FIND_SOURCES);
    	        if (creep.name.length % 2 == 0)
                {
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE && creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                    }
                }
                else
                {
                    if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE && creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[1]);
                    }
                }

                if (creep.carry.energy == creep.carryCapacity){
                    creep.memory.buildTime = true;
                }
		    }
		    else if (creep.build(sites[0] != 0)){
		        console.log(creep.build(sites[0]));
		        creep.moveTo(sites[0]);
		    }
		    if (creep.carry.energy == 0){
		        creep.memory.buildTime = false;
		    }
		}
		else
		{
		    creep.memory.role = 'harvester';
		}
    }
};

module.exports = roleBuilder;