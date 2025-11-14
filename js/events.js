function getEventSeed(h, y, d, m)
{
	return h * 100000000 + y * 100000 + d * 100 + m;
}

function getEventChanceSeed()
{
	const d = new Date();	
	return getEventSeed(d.getUTCHours(), d.getUTCFullYear(), d.getUTCDate(), d.getUTCMonth());	
}

function getEventIdSeed()
{
	const d = new Date();	
	return 24 * getEventSeed(d.getUTCMonth(), d.getUTCFullYear(), d.getUTCHours(), d.getUTCDate());	
}

function getCurrentEventId()
{		
	if (getRandomInt(getEventChanceSeed(), 24) == 0)
		return getRandomInt(getEventIdSeed(), 6) + 1;
	return 0;
}