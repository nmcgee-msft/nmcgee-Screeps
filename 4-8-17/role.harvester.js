var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
	        
	        var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
	        var sources = creep.room.find(FIND_SOURCES);

            if(target && (creep.pos.getRangeTo(target) < 5)) {
                    if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
            }
            else
            {
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
            }
	    }
	}
};

module.exports = roleHarvester;