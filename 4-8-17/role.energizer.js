var roleEnergizer = {

    var acting = false;
    
    /** @param {Creep} creep **/
    run: function(creep) {
        for (var spawn in this.room.spawns)
        {
            if(Game.spawns[spawn.name].energy < Game.spawns[spawn.name].energyCapacity) {
                if(creep.transfer(Game.spawns[spawn.name], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns[spawn.name]);
                    acting = true;
                }
            }
        }
        
        if (!acting)
        {
            for (var ext in Game.EXTENSION_HITS)
        }

    }
};

module.exports = roleEnergizer;