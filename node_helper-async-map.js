/* ---------------------------------------------------------------------
 * Magic Mirror
 * Module: MMM-CaravanPiClimate
 *
 * CaravanPi Module
 * see https://github.com/spitzlbergerj/CaravanPi for more Information 
 *		 about the DIY project 
 *
 * By Josef Spitzlberger	http://spitzlberger.de
 * MIT Licensed.
 */

const NodeHelper = require("node_helper")
var async = require('async');
var exec = require('child_process').exec;
var valueListNH = [];

module.exports = NodeHelper.create({
	start: function() {
		//console.error('Starting node helper: ' + this.name);
	},
	
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		console.error('node_helper: ' + notification);
		
		switch(notification) {
			case "CONFIG":
				this.config = payload.config;
				console.error('node_helper - config: ' + this.config.valueDir);
				
				this.valueListNH = payload.valueList;
				
				// first call
				self.getValues(payload.valueList);
				// interval call
				setInterval(function() {
					self.getValues(payload.valueList);
				}, this.config.updateInterval);
				break
		}
	},
	
	getValues: function(valueList) {
		var self = this;

		console.error('node_helper - getValues - valueList', valueList[0], valueList[1]);

		async.map(valueList, tailValueFile, fillValueList);

		console.error('node_helper - getValues - valueList after', this.valueListNH[0], this.valueListNH[1]);
		self.sendSocketNotification('VALUES', this.valueListNH);
	},
	
	tailValueFile: function(sensor, callback) {
		var self = this;
		var cmd = "tail -1 " + self.config.valueDir + "/" + sensor["file"];
		console.error('node_helper - cmd', cmd);
		
		return exec(cmd, (error, stdout, stderr) => {
			if (error) {
				console.error('exec error: ${error}');
				callback(1, null);
				return;
			}
			console.error('stdout: ${stdout}');
			console.error('stderr: ${stderr}');
			return stdout;
			});
	},
	
	fillValueList: function (err, res) {
		console.error('node_helper - getValues - Results', res);
		var resSplit = res[0].split(' ');
		console.error('node_helper - getValues - Results', resSplit);
		this.valueListNH[i]["datetime"] = resSplit[0].substring(6,8)+"."+resSplit[0].substring(4,6)+"."+resSplit[0].substring(0,4)+" "+resSplit[0].substring(8,10)+":"+resSplit[0].substring(10,13);
		this.valueListNH[i]["temperature"] = resSplit[1];
		this.valueListNH[i]["pressure"] = resSplit[2];
		this.valueListNH[i]["humidity"] = resSplit[3];
	},

})