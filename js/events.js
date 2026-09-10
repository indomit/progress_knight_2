function getEventSeed(h, y, d, m) {
	return h * 100000000 + y * 100000 + d * 100 + m	
	//return 1
}

function getEventChanceSeed(d) {	
	return getEventSeed(d.getUTCHours(), d.getUTCFullYear(), d.getUTCDate(), d.getUTCMonth())
}

function getEventIdSeed(d) {	
	return 24 * getEventSeed(d.getUTCMonth(), d.getUTCFullYear(), d.getUTCHours(), d.getUTCDate())
}

function getCurrentEventId() {				
	//return getCurrentEventIdByDate(new Date())
	return 0
}

function getCurrentEventIdByDate(d) {		

	if (getRandomInt(getEventChanceSeed(d), 12) == 0)
	{
		const eventid = getRandomInt(getEventIdSeed(d), 6) + 1
		if (isEventUnlocked(eventid))
			return eventid
	}
	return 0
}

function isEventUnlocked(eventid){
	switch (eventid) {
  		case 1: return true									// Time Warping
  		case 2: return gameData.rebirthThreeCount > 0 		// Essence
  		case 3: return true									// Happiness
  		case 4: return gameData.rebirthTwoCount > 0  		// Evil
  		case 5: return true									// Money
  		case 6: return gameData.rebirthFourCount > 0  		// Dark Matter
	}  
}

function getPendingEvents(){
	const events = ["","","","","","","","","","",""]
	let i = 0
	let d = new Date()
	let eventid = getCurrentEventIdByDate(d)
	if (eventid !== 0)		
		events[0] = "Current event is <span class=\""+eventsData[eventid].style+"\">" + eventsData[eventid].name + "</span> started on " + d.toLocaleDateString() + " at " + d.getHours() + ":00"
	let lookupcount = 0
	while (i <= 10)	{
		d.addHours(1)
		lookupcount++
		if (lookupcount > 30 * 24)
			break
		eventid = getCurrentEventIdByDate(d)
		if (eventid !== 0)
		{
			i++
			events[i] = "Event <span class=\""+eventsData[eventid].style+"\">" + eventsData[eventid].name + "</span> will start on " + d.toLocaleDateString() + " at " + d.getHours() + ":00"
		}
	}

	return events
}