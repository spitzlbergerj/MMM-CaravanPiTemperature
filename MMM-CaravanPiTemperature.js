/* ---------------------------------------------------------------------
 * Magic Mirror
 * Module: MMM-CaravanPiTemperature
 *
 * CaravanPi Module
 * see https://github.com/spitzlbergerj/CaravanPi for more Information 
 *     about the DIY project 
 *
 * By Josef Spitzlberger http://spitzlberger.de
 * MIT Licensed.
 */

Module.register("MMM-CaravanPiTemperature",{

defaults:{
	valueDir: "/home/pi/CaravanPi/values",
	updateInterval: 100000, // milliseconds
	tempUnit: " °C",
	tempPrecision: 2,
	showDate: true,
	sensors: [
		{
			name: "Gefrierfach",
			file: "28-01144febdbaa",
		},
	],
	localeStr: 'de-DE',
	style: "lines",
},

valueList:[],

start: function (){
	Log.log('Starting module: ' + this.name);
	
	this.valueList = new Array();
	var i = 0;
	Log.log('sensors: ', this.config.sensors.length, this.config.sensors);
	while(i<this.config.sensors.length){
		this.valueList[i] = new Object();
		this.valueList[i]["name"] = this.config.sensors[i]["name"];
		this.valueList[i]["file"] = this.config.sensors[i]["file"];
		this.valueList[i]["datetime"] = this.translate('LOADING');
		this.valueList[i]["temperature"] = "0";
		i+=1;
	}
	Log.log('valueList: ', this.valueList);
	this.sendSocketNotification(
		'CONFIG',
		{
			config: this.config,
			valueList: this.valueList,
		});
},

// Get translations
getTranslations: function() {
	return {
		en: "translations/en.json",
		de: "translations/de.json"
	}
},

// Get the Module CSS
getStyles: function() {
	return ["MMM-CaravanPiTemperature.css"];
},


getDom: function(){
	var table = document.createElement("table");
	table.border = 0;
	
	if (this.config.style == "boxes") {
		var boxRow = document.createElement("tr");
		boxRow.className = 'sensorBoxRow';
		boxRow.vAlign = 'top';
	}

	var i = 0;
	while (i<this.config.sensors.length) {
		var temperatureStr = this.prepareAttribute("TEMPERATURE", this.valueList[i]["temperature"], this.config.tempPrecision, this.config.tempUnit);

		if (this.config.style == "lines") {
			var row = document.createElement("tr");
			row.className = 'sensorContainer';
			row.vAlign = 'top';
			
			var rowSensor = document.createElement("td");
			rowSensor.className = 'sensorName';
			rowSensor.width = '120px';
			rowSensor.appendChild(document.createTextNode(this.valueList[i]["name"]));
			
			var rowTemperature = document.createElement("td");
			rowTemperature.className = 'sensorTemp';
			rowTemperature.width = '60px';
			rowTemperature.appendChild(document.createTextNode(temperatureStr));
			
			var rowDate = document.createElement("td");
			rowDate.className = 'sensorDate';
			rowDate.width = '60px';
			rowDate.appendChild(document.createTextNode(this.valueList[i]["datetime"]));
			
			// Building of the table row
			row.appendChild(rowSensor);
			row.appendChild(rowTemperature);
			
			if(this.config.showDate === true) {
				row.appendChild(rowDate);
			}
			
			table.appendChild(row);
		}
		else if (this.config.style == "boxes") {
			var boxRowElement = document.createElement("td");
			boxRowElement.style.padding = '20px';
			
			var tableInner = document.createElement("table");
			tableInner.style.border= '1px solid #ffffff';
	
			var row1 = document.createElement("tr");
			row1.className = 'sensorContainer';
			row1.align = 'center';
			row1.vAlign = 'top';
			
			var rowSensor = document.createElement("td");
			rowSensor.className = 'sensorName';
			rowSensor.style.borderBottom = '1px dotted #ffffff';
			rowSensor.appendChild(document.createTextNode(this.valueList[i]["name"]));
			
			row1.appendChild(rowSensor);
			
			var row2 = document.createElement("tr");
			row2.className = 'sensorContainer';
			row2.align = 'center';
			row2.vAlign = 'top';
			
			var rowTemperature = document.createElement("td");
			rowTemperature.className = 'sensorTemp';
			rowTemperature.appendChild(document.createTextNode(temperatureStr));
			
			row2.appendChild(rowTemperature);
			
			var row3 = document.createElement("tr");
			row3.className = 'sensorContainer';
			row3.align = 'center';
			row3.vAlign = 'top';
			
			var rowDate = document.createElement("td");
			rowDate.className = 'sensorDate';
			rowDate.appendChild(document.createTextNode(this.valueList[i]["datetime"]));
			
			row3.appendChild(rowDate);
			
			// Building of the table rows
			tableInner.appendChild(row1);
			tableInner.appendChild(row2);
			
			if(this.config.showDate === true) {
				tableInner.appendChild(row3);
			}
			boxRowElement.appendChild(tableInner)
			boxRow.appendChild(boxRowElement);
		}
		i+=1;
	}
	
	if (this.config.style == "boxes") {
		table.appendChild(boxRow);
	}

	var wrapper = document.createElement("div")
	wrapper.className = "MMM-CaravanPiTemperature";
	
	wrapper.innerHTML = table.outerHTML;
	return wrapper
},

/*
notificationReceived: function(notification, payload, sender){
	switch(notification) {
		case "DOM_OBJECTS_CREATED":
			var timer = setInterval(()=>{
				var countElm = document.getElementById("COUNT")
				this.sendSocketNotification("DO_YOUR_JOB", this.count)
				this.count++
			}, 1000)
			break
	}
},

*/

socketNotificationReceived: function(notification, payload){
	Log.log('MMM-Systemvalues: socketNotificationReceived ' + notification + payload);
	switch(notification) {
		case "VALUES":
			this.valueList = payload;
			Log.log('valueList in socketNotificationReceived: ', this.valueList);
			this.updateDom();
			break
	}
},

/**
 * Prepare the output of the given attribute. Reads the attributeName from the
 * settingsArray and do further processing on it, i.e. to display the value with the
 * unit (temperature, valve state) or anything else.
 * Can be used in the future to prepare any other attributes for output.
 */
prepareAttribute: function(attributeName, strValue, precision, unit){
	var preparedAttributeValue = "";
	switch(attributeName){
		case "TEMPERATURE":
		case "PRESSURE":
		case "HUMIDITY":
			preparedAttributeValue = Number(parseFloat(strValue)).toLocaleString(this.config.localeStr, {minimumFractionDigits: precision, maximumFractionDigits: precision}) + unit;
			break;
	}
	return preparedAttributeValue;
}, 

})