var mgrMemory = {
  
    deleteCreeps: function()
    {
        // Clean up dead creeps
        for(var name in Memory.creeps)
        {
            if (!Game.creeps[name])
            {
                delete Memory.creeps[name];
            }
        }
    }
    
};

module.exports = mgrMemory;