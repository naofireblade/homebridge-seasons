# homebridge-seaons

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) that displays the current season of the year. You can download it via [npm](https://www.npmjs.com/package/homebridge-seasons).

Feel free to leave any feedback [here](https://github.com/naofireblade/homebridge-seasons/issues).

## Features

- Meteorologic season
- Astronomic season
- Nothern and southern hemisphere
- Number and name representation of season

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-seasons`
3. Update your configuration file. See the samples below.

## Configuration

Add the following information to your config file.

You can choose between the *meteorologic* and *astronomic* calendar.
You can set your hemisphere between *north* and *south*.
And you can decide whether you want to see the season as a *number* (0 = Spring), a *name* or *both*. The number representation can be used in homekit rules.


```json
"platforms": [
	{
		"platform": "Seasons",
		"name": "Seasons",
		"calendar": "meteorologic",
		"hemisphere": "north",
		"display": "both"
	}
]
```