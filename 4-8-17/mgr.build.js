"use strict";

var attr = require("util.attributes");

var mgrBuild = {
    locateSite: function(siteType) {
        var totalDistance = 0;
        var minDistance = 10000;
        var sitePos;
        var room = Game.rooms["W8N3"];  // BUGBUG: fix this for multiple rooms & new spawns
        var sources = room.find(FIND_SOURCES);
		var controller = room.controller;
		var spawns = room.find(FIND_MY_SPAWNS);
		var sites = room.find(FIND_CONSTRUCTION_SITES);
		var structures = room.find(FIND_MY_STRUCTURES);
		var siteLoc = [];
        
        switch (siteType)
        {
            case "CONTROLLER_CONTAINER_TEMPLATE":
                for (var i = 0; i < attr.TWO_MOVES.length; i++) {
                    // Get lowest total distance to both energy nodes and spawns
                    var sitePos = new RoomPosition(controller.pos.x+attr.TWO_MOVES[i].x, controller.pos.y+attr.TWO_MOVES[i].y, room.name);
                    // console.log("First instance: " + sitePos);
                    if (Game.map.getTerrainAt(sitePos.pos) == "wall")
                        continue;   // Cannot build here
                    
                    // Validate all template positions can have a building
                    // var wallHit = false;
                    // WTF?  Was I asleep?
                    /*for (var l = 0; l < 9; l++){
                        if (Game.map.getTerrainAt(sitePos) == "wall"){
                            wallHit = true;
                            break;
                        }
                    }
                    if (wallHit)
                        continue;
                    */
                    var siteHit = false;                    
                    for (var l = 0; l < 9; l++){
                        for (var s in sites){
                            //console.log(sites[s].pos.x);
                            //console.log(sitePos.pos);
                            if (sites[s].pos.x == controller.pos.x+attr.TWO_MOVES[i].x && sites[s].pos.y == controller.pos.y+attr.TWO_MOVES[i].y){
                                siteHit = true;
                                break;
                            }
                        }
                        if (siteHit)
                            break;
                    }
                    if (siteHit)
                        continue;   //Cannot build here
                    
                    // Validate all template positions don't already have a building
                    /*var structureHit = false;
                    for (var m = 0; m < 9; m++){
                        for (var s in structures){
                            console.log(s[s]);
                            if (struct != 0){
                                if (struct.pos.x == siteLoc[0]+ONE_MOVE[m].x && struct.pos.y == siteLoc[1]+ONE_MOVE[m].y){
                                    structureHit = true;
                                }
                                if (structureHit)
                                    break;
                            }
                        }
                        if (structureHit)
                            continue;
                    }*/
                    
                    for (var j = 0; j < spawns.length; j++){
                        totalDistance  = spawns[j].pos.findPathTo(sitePos).length;
                        for (var k = 0; k < sources.length; k++){
                            totalDistance += sources[k].pos.findPathTo(sitePos).length;
                            totalDistance += sources[k].pos.findPathTo(sitePos).length;                            
                        }
                        if (totalDistance < minDistance){
                            siteLoc[0] = controller.pos.x+attr.TWO_MOVES[i].x;
                            siteLoc[1] = controller.pos.y+attr.TWO_MOVES[i].y;
                            siteLoc[2] = i;
                        }
                    }
                }
                break;
            case "ENERGY_CONTAINERS":
                var locInc = 0;
                // console.log("Entering energy container build...");
                if (sources.length > 1){
                    var separation = sources[0].pos.getRangeTo(sources[1].pos);
                    if (separation <= 4){
                        // These are close enough to share one container...
                        // Pick a center location based on the source positions
                        var center = {};
                        center.x = Math.floor((sources[0].pos.x + sources[1].pos.x ) / 2);
                        center.y = Math.floor((sources[0].pos.y + sources[1].pos.y ) / 2);
                        // console.log(center.x + ", " + center.y);
                        // Is center location buildable?
                        if (Game.map.getTerrainAt(center.x, center.y, room) != "wall"){
                            // Is there at least one available adjacent location for each source from this point?
                            var s0a = 0, s1a = 0, maxAdjacents = 0, posIndex = 0, wtf = 0;
                            for (var t = 0; t < attr.ONE_MOVE.length; t++){
                                for (var u = 0; u < attr.ONE_MOVE.length; u++){
                                    if (Game.map.getTerrainAt(center.x+attr.ONE_MOVE[t].x+attr.ONE_MOVE[u].x, center.y+attr.ONE_MOVE[t].y+attr.ONE_MOVE[u].y, room.name) != "wall"){
                                        // console.log("Testing position: " +center.x+attr.ONE_MOVE[t].x + ", " + center.y+attr.ONE_MOVE[t].y);
                                        if (sources[0].pos.getRangeTo(center.x+attr.ONE_MOVE[t].x+attr.ONE_MOVE[u].x, center.y+attr.ONE_MOVE[t].y+attr.ONE_MOVE[u].y) <= 1)
                                        s0a += 1;
                                        if (sources[1].pos.getRangeTo(center.x+attr.ONE_MOVE[t].x+attr.ONE_MOVE[u].x, center.y+attr.ONE_MOVE[t].y+attr.ONE_MOVE[u].y) <= 1)
                                        s1a += 1;
                                    }
                                    else{
                                        continue;
                                    }
                                }
                                if (s0a > 0 && s1a > 0){
                                    // console.log("posIndex with 2 adjacents: " + t);
                                    if (s0a + s1a > maxAdjacents){
                                        maxAdjacents = s0a+s1a;
                                        posIndex = t;
                                        // console.log("new maxAdjacents: " + maxAdjacents + " posIndex: " + posIndex);
                                    }
                                }
                                s0a = 0, s1a = 0;
                            }
                            siteLoc[0] = center.x+attr.ONE_MOVE[posIndex].x;
                            siteLoc[1] = center.y+attr.ONE_MOVE[posIndex].y;
                            //console.log("maxAdjacents: " + maxAdjacents);
                            //console.log(siteLoc);
                            //console.log("IDEAL SPOT? " + siteLoc[0] + ", " + siteLoc[1]);
                            return siteLoc;
                        }
                    }
                    // console.log("Separation = " + separation);
                }
                
                // Need to add adjacency checking as in the previous section to ensure
                // the build locations are accessible by the max # of creeps
                for (var k = 0; k < sources.length; k++){
                    // console.log("Sources Loop...");
                    for (var i = 0; i < attr.TWO_MOVES.length; i++) {
                        // console.log("TWO_MOVES loop...");
                        var sitePos = new RoomPosition(sources[k].pos.x+attr.TWO_MOVES[i].x, sources[k].pos.y+attr.TWO_MOVES[i].y, room.name);
                        // console.log("SitePos: " + sitePos);
                        if (Game.map.getTerrainAt(sitePos) == "wall")
                            continue;   // Cannot build here
                        
                        var structureHit = false;
                        for (var s in structures){
                            // console.log(structures[s].pos.x);
                            if (structures[s].pos.x == sources[k].pos.x+attr.TWO_MOVES[i].x && structures[s].pos.y == sources[k].pos.y+attr.TWO_MOVES[i].y){
                                structureHit = true;
                            }
                            if (structureHit)
                                break;
                        }
                        // console.log("Structure hit?: " + structureHit);
                        if (structureHit)
                            continue;   // Cannot build here
                        
                        for (var j = 0; j < spawns.length; j++){
                            var incLoc = false;
                            // BUGBUG - will explode with more than one spawn
                            totalDistance  -= sitePos.getRangeTo(spawns[j].pos);
                            totalDistance  += sitePos.getRangeTo(sources[j].pos);
                            totalDistance  += sitePos.getRangeTo(sources[j+1].pos);
                            // totalDistance += sitePos.getRangeTo(controller.pos);
                            // console.log("Total Distance: " + totalDistance);  // spawns[j].pos.findPathTo(sitePos).length;
                            if (totalDistance < minDistance){
                                siteLoc[locInc] = (sources[k].pos.x)+(attr.TWO_MOVES[i].x);
                                siteLoc[locInc+1] = (sources[k].pos.y)+(attr.TWO_MOVES[i].y);
                                siteLoc[locInc+2] = i;
                                incLoc = true;
                                minDistance = totalDistance;
                                // console.log("Total Distance: " + totalDistance + " " + siteLoc);
                            }
                            // console.log(locInc + " " + spawns.length);
                        }
                    }
                    if (incLoc){
                        // console.log("incrementing locInc");
                        locInc += 3;
                    }
                    minDistance = 10000;
                }
                break;
            default:
                break;
        }
        // console.log("siteLoc: " + siteLoc + " and length: " + siteLoc.length);
        return siteLoc;
    },
    
    removeSites: function (room) {
		var sites  = room.find(FIND_CONSTRUCTION_SITES);
		var i = sites.length;
		while(i--) {
			sites[i].remove();
		}
    },
    
    buildSite: function(siteLoc, siteType) {
        var i;
        var buildPattern;
        var room = Game.rooms["W8N3"];  // BUGBUG: fix this for multiple rooms & new spawns
        
        switch (siteType)
        {
            case "CONTROLLER_CONTAINER_TEMPLATE":
                if (attr.TWO_MOVES_CONTROLLER_TEMPLATE[siteLoc[2]] == "C_SHAPED_INV"){
                    buildPattern = attr.C_SHAPED_INV;
                }
                else if (attr.TWO_MOVES_CONTROLLER_TEMPLATE[siteLoc[2]] == "C_SHAPED"){
                    buildPattern = attr.C_SHAPED;
                }
                else if (attr.TWO_MOVES_CONTROLLER_TEMPLATE[siteLoc[2]] == "U_SHAPED_INV"){
                    buildPattern = attr.U_SHAPED_INV;
                }
                else if (attr.TWO_MOVES_CONTROLLER_TEMPLATE[siteLoc[2]] == "U_SHAPED"){
                    buildPattern = attr.U_SHAPED;
                }
                // console.log(buildPattern[2]);
                for (var i = 0; i < 7; i++){
                    if (i != 3){
                      room.createConstructionSite(siteLoc[0]+buildPattern[i].x, siteLoc[1]+buildPattern[i].y, STRUCTURE_EXTENSION);
                    }
                    else{
                        room.createConstructionSite(siteLoc[0]+buildPattern[i].x, siteLoc[1]+buildPattern[i].y, STRUCTURE_CONTAINER);
                    }
                }
                // console.log("Building: " + siteLoc[2] );
                
                break;
            case "ENERGY_CONTAINERS":
                for (var j = 0; j < siteLoc.length; j+=3){
                    // console.log("Trying to build with: " + siteLoc);
                    room.createConstructionSite(siteLoc[0+j], siteLoc[1+j], STRUCTURE_CONTAINER);
                }
                break;
            default:
                break;
        }
    },
    
    assessBuildNeeds: function() {
        var room = Game.rooms["W8N3"];  // BUGBUG: fix this for multiple rooms & new spawns
        var spawns = room.find(FIND_MY_SPAWNS);
        var sites = room.find(FIND_CONSTRUCTION_SITES);

        if (Memory.buildControllerContainer == true)
        { 
            /*var siteLoc = mgrBuild.locateSite("CONTROLLER_CONTAINER_TEMPLATE");
            mgrBuild.buildSite(siteLoc, "CONTROLLER_CONTAINER_TEMPLATE");
            
            var siteLoc2 = mgrBuild.locateSite("ENERGY_CONTAINERS");
            mgrBuild.buildSite(siteLoc2, "ENERGY_CONTAINERS");
            
            for (var sp in spawns){
                var sitePos = new RoomPosition(siteLoc[0], siteLoc[1], room.name);
                var path = sitePos.findPathTo(spawns[sp].pos, {ignoreCreeps: true, ignoreRoads: true});
                for (var step in path){
                    room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
                }
                
                var sitePos2 = new RoomPosition(siteLoc2[0], siteLoc2[1], room.name);
                var path2 = sitePos2.findPathTo(spawns[sp].pos, {ignoreCreeps: true, ignoreRoads: true});
                for (var step2 in path2){
                    room.createConstructionSite(path2[step2].x, path2[step2].y, STRUCTURE_ROAD);
                }
            }
            
            // Ring road around the spawns
            for (var sp in spawns){
                for (var c = 0; c < attr.ONE_MOVE.length; c++){
                    room.createConstructionSite(spawns[sp].pos.x+attr.ONE_MOVE[c].x, spawns[sp].pos.y+attr.ONE_MOVE[c].y, STRUCTURE_ROAD);
                }
            }
            
            // Rings around the other structures
		    var sites  = room.find(FIND_CONSTRUCTION_SITES);
	    	var i = sites.length;
		    while(--i >= 0) {
			    if(sites[i].structureType != "road"){
			        for (var c = 0; c < attr.ONE_MOVE.length; c++){
                        room.createConstructionSite(sites[i].pos.x+attr.ONE_MOVE[c].x, sites[i].pos.y+attr.ONE_MOVE[c].y, STRUCTURE_ROAD);
                    }  
			    }
		    }
		    */
            
            Memory.controllerContainerCount = 1;
            Memory.buildControllerContainer = false;
        }
        else
        {
           if (Memory.controllerContainerCount == 1)
           {
                // mgrBuild.removeSites(room);
                Memory.buildControllerContainer = false;
           }
           else
           {
               Memory.buildControllerContainer = true;
           }
        }
        
        //var sites = room.find(FIND_CONSTRUCTION_SITES);
        // console.log("construction sites: " + sites);
        //if (var sites = room.find(FIND_CONSTRUCTION_SITES) !== undefined){
            
        //}
        
                    // TESTING ROADS
            // wrap all construction sites in roads
            /*var sites = room.find(FIND_CONSTRUCTION_SITES);
            var i = sites.length;
		    while(i--) {
    			for (var s in sites){
                    for (var z = 0; z < attr.ONE_MOVE.length; z++){
                        if (z == 4) 
                            continue;
                        room.createConstructionSite(sites[s].pos.x+attr.ONE_MOVE[z].x, sites[s].pos.y+attr.ONE_MOVE[z].y, STRUCTURE_ROAD);
                    }
                }
    		}*/
    }
};

module.exports = mgrBuild;