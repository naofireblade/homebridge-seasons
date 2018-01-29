"use strict";

var inherits = require("util").inherits;
var	debug = require("debug")("homebridge-seasons"),
	seasonCalculator = require("date-season");

var	Service,
	Characteristic,

	CustomUUID = {
		SeasonService: "ca741310-c62e-454b-a63b-3a1db3ca2c3a",
		SeasonCharacteristic: "9382ccde-6cab-42e7-877a-2df98b8d0b66",
		SeasonNameCharacteristic: "02e4c0e3-44f9-44b8-8667-98f54b376ce4",
	},
	SeasonService,
	SeasonCharacteristic,
	SeasonNameCharacteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerPlatform("homebridge-seasons", "Seasons", SeasonsPlatform);

	SeasonService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.SeasonService, subtype);
	};
	inherits(SeasonService, Service);

	SeasonCharacteristic = function() {
		Characteristic.call(this, "Season", CustomUUID.SeasonCharacteristic);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 3,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(SeasonCharacteristic, Characteristic);

	SeasonNameCharacteristic = function() {
		Characteristic.call(this, "Season Name", CustomUUID.SeasonNameCharacteristic);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	};
	inherits(SeasonNameCharacteristic, Characteristic);
}

function SeasonsPlatform(log, config) {
	this.log = log;
	this.config = config;
}

SeasonsPlatform.prototype = {
	accessories: function(callback) {

		this.accessories = [];
		this.accessories.push(new SeasonsAccessory(this));
		
		callback(this.accessories);
	}
}

function SeasonsAccessory(platform) {
	this.log = platform.log;
	this.config = platform.config;
	this.name = "Season";

	this.informationService = new Service.AccessoryInformation();
	this.informationService.setCharacteristic(Characteristic.Manufacturer, "Homebridge Seasons");
	this.informationService.setCharacteristic(Characteristic.Model, "github.com/naofireblade/homebridge-seasons");

	// Get calendar type from config
	this.calendar = ("calendar" in this.config ? this.config["calendar"] : "meteorologic");

	// Get hemisphere from config
	this.hemisphere = ("hemisphere" in this.config ? this.config["hemisphere"] : "north");

	// Create service and add characteristics depending on config
	this.seasonService = new SeasonService(this.name);
	if (this.config["display"] === "both" || this.config["display"] === "number") {
		this.seasonService.addCharacteristic(SeasonCharacteristic);
		this.seasonService.getCharacteristic(SeasonCharacteristic).on("get", this.getCurrentSeason.bind(this));
	}
	if (this.config["display"] === "both" || this.config["display"] === "name") {
		this.seasonService.addCharacteristic(SeasonNameCharacteristic);
		this.seasonService.getCharacteristic(SeasonNameCharacteristic).on("get", this.getCurrentSeasonName.bind(this));
	}
}

SeasonsAccessory.prototype = {
	identify: function (callback) {
		debug("Identify requested");
		callback();
	},

	getServices: function () {
		return [this.informationService, this.seasonService];
	},

	getCurrentSeason: function(callback) {
		let that = this;
		this.getCurrentSeasonName(function (error, result) {
			let season;
			if (result === "Spring") {
				season = 0;
			}
			else if (result === "Summer") {
				season = 1;
			}
			else if (result === "Autumn") {
				season = 2;
			}
			else if (result === "Winter") {
				season = 3;
			}
			else {
				that.log.error("Unkown season " + result);
			}
			callback(false, season);
		});
	},

	getCurrentSeasonName: function(callback) {
		let seasonName;
		if (this.calendar === "meteorologic") {
			debug("Using meteorologic calendar to get current season");
			let month = (new Date()).getMonth() + 1;
			switch (month) {
				case 1:
				case 2:
				case 12:
					seasonName = "Winter";
					break;
				case 3:
				case 4:
				case 5:
					seasonName = "Spring";
					break;
				case 6:
				case 7:
				case 8:
					seasonName = "Summer";
					break;
				case 9:
				case 10:
				case 11:
					seasonName = "Autumn";
					break;
			}
		}
		else {
			debug("Using astronomic calendar to get current season");

			let northernHemisphere = this.hemisphere === "north";
			if (northernHemisphere) {
				debug("Hemisphere is north");
			}
			else {
				debug("Hemisphere is south");
			}

			let astronomicCalendar = seasonCalculator({ north: northernHemisphere, autumn: true });
			seasonName = astronomicCalendar(new Date());
		}
		debug("Current season is " + seasonName);
		callback(false, seasonName);
	}
}
