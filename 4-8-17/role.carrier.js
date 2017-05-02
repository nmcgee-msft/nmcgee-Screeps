var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            if(Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity) {
                if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Spawn1']);
                }
            }
            else
            {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};

module.exports = roleCarrier;