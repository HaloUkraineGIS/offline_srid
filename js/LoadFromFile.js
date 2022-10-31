const DEFAULT_JSON_PARAMETRS = '+proj=utm +zone=37 +datum=WGS84 +units=m +no_defs';
const DEFAULT_JSON_SRTEXT = 'PROJCS[\"WGS 84 / UTM zone 37N\",GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4326\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",39],PARAMETER[\"scale_factor\",0.9996],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"32637\"]]';
const DEFAULT_JSON_ACRONYM = 'utm';
const DEFAULT_JSON_SRID = 32637;
const DEFAULT_JSON_DESCRIPTION = 'WGS 84 / UTM zone 37N EPSG:32637';


const DEFAULT_KML_PARAMETRS = '+proj=longlat +datum=WGS84 +no_defs';
const DEFAULT_KML_SRTEXT = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';
const DEFAULT_KML_ACRONYM = 'longlat';
const DEFAULT_KML_SRID = 4326;
const DEFAULT_KML_DESCRIPTION = 'WGS 84 EPSG:4326';
/**/
const FILE_TYPE_JSON = 0;
const FILE_TYPE_CSV = 1;
const FILE_TYPE_KML = 2;
/**/

$(document).ready(function() 
{
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		document.getElementById('files').addEventListener('change', handleFileSelect, false);
	} else {
		alert('The File APIs are not fully supported in this browser.');
		$("$fileLoad").hide();
	}
	
});

function handleFileSelect(evt) 
{
	var files = evt.target.files; // FileList object
	
	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
		output.push(
				'<li><strong>', f.name, '</strong> (', f.type || 'n/a', ') - ',
				f.size, ' bytes, <br>',
				new Date(f.lastModified).toLocaleString("ua"), '</li>'
		);
		
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) 
		{
			return function(e) 
			{
				if (theFile.type.match('json')) 
				{
					//console.log(JSON.parse(reader.result));
					LoadFromJSON(JSON.parse(reader.result));
				} else {
					if (theFile.name.match('csv')) {
						//console.log(JSON.parse(reader.result));
						LoadFromCSV(reader.result);
					} else {
						if (theFile.type.match('kml')) {
							//console.log(JSON.parse(reader.result));
							LoadFromKML(reader.result);
						} else {
						alert("Unknown file type. Please select correct file (JSON, geojson, csv, kml).");
						}
					}
				}
			};
		})(f);
		
		// Read in the image file as a data URL.
		reader.readAsText(f);
		
		
	}
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}



function LoadFromJSON(inputJSON)
{
	//$("#srid").val(DEFAULT_JSON_DESCRIPTION);
	var SRIDfromFile = false;
	
	if (inputJSON.crs) {
		if (inputJSON.crs.properties) {
			if (inputJSON.crs.properties.name) {
				$("#srid").val(inputJSON.crs.properties.name);
				SRIDfromFile = true;
			}
		}
	}
	
	inputJSON.features.forEach(function(feature)
	{
		if (feature.properties.SRID) {
			$("#srid").val(feature.properties.SRID);
			SRIDfromFile = true;
			return;
		} 
	});
	
	$("#tpcount").val(CountPoints(inputJSON));
	GenerateTable(true);
	
	inputJSON.features.forEach(function(feature)
	{
		if (feature.properties.name) {
			if (
				(feature.properties.name.match('TP')) ||
				(feature.properties.name.match('SP'))
				) {
				$("#" + feature.properties.name + "gps").prop("checked", true);
				GPSChange({"id" : feature.properties.name + "gps", "checked" : true});
			}
			
			$("#" + feature.properties.name + "x").val(feature.geometry.coordinates[0]);
			$("#" + feature.properties.name + "y").val(feature.geometry.coordinates[1]);
		}
	});
	
	if (SRIDfromFile) {
		GetCorrectSrid($("#srid").val());
	} else {
		RecalculateMagnetic(); 
		Calculate();
	}
	
	return false;
}

function GetCorrectSrid(SRID, fileType)
{

	$("srid").removeClass("ErrorInput");
	
	$.ajax({
		url: "GetJson.php",
		dataType: 'json',
		data: {
			"term": SRID.replace('EPSG ', 'EPSG:'),
		},
		success: function( data ) 
		{
			data.forEach(function (item)
			{
				FromProjection = item.parameters;
	
				ProjectForSHP = item.srtext;
				projection_acronym = item.projection_acronym;
				
				$("#srid").val(item.description + " " + item.auth_name + ":" + item.auth_id);
	
				$("#fsrid").val(item.srid);
				$("srid").removeClass("ErrorInput");
			})
			
			RecalculateMagnetic(); 
			Calculate();
		},
		error: function (msg) 
		{
			alert('Error: ' + msg.status + ', ' + msg.statusText + '. Use default values for projection. You can change projection manually.');
			
			FromProjection = DEFAULT_JSON_PARAMETRS;
	
			ProjectForSHP = DEFAULT_JSON_SRTEXT;
			projection_acronym = DEFAULT_JSON_ACRONYM;
				
			$("#srid").val(DEFAULT_JSON_DESCRIPTION);
			$("#fsrid").val(DEFAULT_JSON_SRID);
			
			RecalculateMagnetic(); 
			Calculate();
		}

	}); 
}

function LoadFromCSV(inputCSV)
{
	var csvJSON = csvToJSON(inputCSV);
	
	$("#tpcount").val(CountPoints(csvJSON));
	GenerateTable(true);
	
	csvJSON.features.forEach(function(feature)
	{
		if (feature.properties.name) {
			if ((feature.properties.name.match('TP')) || (feature.properties.name.match('SP'))) {
				if ((feature.geometry.coordinates[0]) && (feature.geometry.coordinates[1])) {
					$("#" + feature.properties.name + "gps").prop("checked", true);
					GPSChange({"id" : feature.properties.name + "gps", "checked" : true});
				}
			}

			$("#" + feature.properties.name + "bm").val(feature.properties.bearingmagnetic);
			$("#" + feature.properties.name + "dist").val(feature.properties.distancem);
			
			$("#" + feature.properties.name + "x").val(feature.geometry.coordinates[0]);
			$("#" + feature.properties.name + "y").val(feature.geometry.coordinates[1]);
		}
	});
	
	RecalculateMagnetic(); 
	Calculate();
	
	return true;
}

function LoadFromKML(inputKML)
{
	var kmlJSON = toGeoJSON["kml"]((new DOMParser()).parseFromString(inputKML, 'text/xml'));
	
	$("#tpcount").val(CountPoints(kmlJSON));
	GenerateTable(true);
	
	
	kmlJSON.features.forEach(function(feature)
	{
		if (feature.properties.name) {
			if (
				(feature.properties.name.match('TP')) ||
				(feature.properties.name.match('SP'))
				) {
				$("#" + feature.properties.name + "gps").prop("checked", true);
				GPSChange({"id" : feature.properties.name + "gps", "checked" : true});
			}
			
			TempPoint = 
				proj4
					(
						DEFAULT_KML_PARAMETRS,
						FromProjection,
						[parseFloat(feature.geometry.coordinates[0]), parseFloat(feature.geometry.coordinates[1])]
					);
			
			$("#" + feature.properties.name + "x").val(TempPoint[0]);
			$("#" + feature.properties.name + "y").val(TempPoint[1]);
		}
	});
	
	RecalculateMagnetic(); 
	Calculate();
	
	return true;
}

function csvToJSON(csv)
{
	var lines=csv.split("\r\n");
	
	if (1 == lines.length) {
		lines=csv.split("\n");
	}
	
	var result = [];
	
	var headers = lines[0].replace(/\s+/g, '').toLowerCase().split(",");
	
	for (var i = 1; i < lines.length; i++){
		var obj = {
					"type": "feature",
					"geometry": {
						"type": "Point",
						"coordinates": [],
					},
					"properties": {},
				};
		var currentline = lines[i].split(",");
		var spCount = 0;
		
		for (var j = 0; j < headers.length; j++) {
			
			if ("x" == headers[j]) {
				obj.geometry.coordinates[0] = parseFloat(currentline[j]);
			} else {
				if ("y" == headers[j]) {
					obj.geometry.coordinates[1] = parseFloat(currentline[j]);
				} else {
					if ("name" == headers[j]) {
						if ("SP" == currentline[j]) {
							spCount++;
							if (1 != spCount) {
								currentline[j] = "SPe";
							}
						}
						
						obj.properties[headers[j]] = currentline[j];
					} else {
						obj.properties[headers[j]] = parseFloat(currentline[j]);
					}
				}
			}
		}
		result.push(obj);
	}
	
	var returnResult = {"type":"FeatureCollection","features":[]};
	returnResult.features = result;
	
	console.log(returnResult);
	
	return returnResult; 
}

function CountPoints(inputJSON)
{
	var pointsCount = 0;
	
	inputJSON.features.forEach(function(feature)
	{
		if (feature.properties.name) {
			if (feature.properties.name.match('TP')) {
					pointsCount++;
			}
		}
	});
	return pointsCount;
}