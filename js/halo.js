var		TableLength 	= 3;
var		ArrayOfTable 	= new Array();
var		markers 		= new Array();
var		p_markers 		= new Array();
var		m_markers 		= new Array();
var		ErrorText		= 'Fill in correctly all the highlighted fields';

var		SetPointName	= "";

var		NamesTable 		= new Array();
	NamesTable[0] = "LM";
	NamesTable[1] = "BM";
	NamesTable[2] = "SP";
	
	
	
var PointIcon = L.icon(
	{
		iconUrl: 'ico/icon57.png',
//		shadowUrl: 'leaf-shadow.png',
	
		iconSize:     [32, 32], // size of the icon
//		shadowSize:   [50, 64], // size of the shadow
		iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
//		shadowAnchor: [4, 62],  // the same for the shadow
//		popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
	});	

	
var		projection_acronym = '';
var		MetricProj		= "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
var 	ToProjection 	= '+proj=longlat +datum=WGS84 +no_defs';
/******
var 	FromProjectionFromProjection	= '';//'+proj=longlat +datum=WGS84 +no_defs';
var 	ProjectForSHP	= '';
*/

var FromProjection	= ''

function selectUTM35() {
	FromProjection	= '+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs';
	let pSrid = document.getElementById('psrid')
	pSrid.innerText = 'UTM zone 35N'

	console.log(FromProjection)
}
function selectUTM36() {
	FromProjection	= '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs';
	let pSrid = document.getElementById('psrid')
	pSrid.innerText = 'UTM zone 36N'
	console.log(FromProjection)
}
function selectUTM37() {
	FromProjection	= '+proj=utm +zone=37 +datum=WGS84 +units=m +no_defs';
	let pSrid = document.getElementById('psrid')
	pSrid.innerText = 'UTM zone 37N'
	console.log(FromProjection)
}



 
/*function changeOption(){
    var selectedOption = FromProjection.options[FromProjection.selectedIndex];
    console.log(FromProjection)
}

FromProjection.addEventListener("change", changeOption);*/





// const btnsridmain = document.querySelector('#btnsridmain');
//         const sb = document.querySelector('#srid')
//         btnsridmain.onclick = (event) => {
//             event.preventDefault();
//             // show the selected index
//             alert(sb.selectedIndex);
//         };




var		projection_acronym = 'utm';

var 	ProjectForSHP	= 'PROJCS[\"WGS 84 / UTM zone 37N\",GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4326\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",39],PARAMETER[\"scale_factor\",0.9996],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AXIS[\"Easting\",EAST],AXIS[\"Northing\",NORTH],AUTHORITY[\"EPSG\",\"32637\"]]';


var 	LinePoly;


$(document).ready(
function() 
{
	$("#fPolygon").trigger('reset');
	
	$('#srid').autocomplete(
	{
		 
		/**/
		source: function (request, response) 
		{
			$.ajax(
			{
				url: "srs.json",
				dataType: 'json',
				data: request,
				success: function( data ) 
				{
					response( $.map( data, function( item ) 
					{
						var StringToSearch = item.description + " " + item.auth_name + ":" + item.auth_id;
						if (-1 != StringToSearch.search(request.term))
						{
							return {
								label: item.description + " " + item.auth_name + ":" + item.auth_id,
								value: item.description + " " + item.auth_name + ":" + item.auth_id,
								proj: item.parameters,
								projname: item.auth_name + ":" + item.auth_id,
								srid : item.srid,
								projection_acronym : item.projection_acronym,
								srtext : item.srtext,
							};
						}
					}));
				}
			}); 
		},  
		/**/
		minLength: 4,
		delay: 500,
		placeholder : "Type to seach datum/grid",
		select: function( event, ui ) 
		{
			//alert(ui.item.projname + " " + ui.item.proj);
			//proj4.defs(ui.item.projname, ui.item.proj);
			FromProjection = ui.item.proj;
			
			ProjectForSHP = ui.item.srtext;
			projection_acronym = ui.item.projection_acronym;
			
			$("#fsrid").val(ui.item.srid);
			$("srid").removeClass("ErrorInput");
			//if ($("#TP1x").length)
			Calculate();
			return true;
		},
	});
	
	$("#srid").attr("placeholder", "Type to seach datum/grid");
	GenerateTable(true);
	$("input.calculate").removeClass("ErrorInput");//css("border-color", "transparent");
	Calculate();
});



/*****************************************************************************/
/*	Изменили TaskID
/*	Прячем информацию полигонов
/*	Загружаем список полигонов
/*****************************************************************************/
function ChangeTaskID(taskid)
{
	if (0 > taskid)
	{
		//$("#divPolygonID").css('display', 'none');
		$("#PolygonID").html("<option value = '0'>New Polygon</option>");
		$("#bSave").prop("disabled", true);
		$("#export").attr("disabled", true);
		$(".onLineMode").css("display", "none");
		$(".offLineMode").css("display", "table-row");
		return false;
	}
}

/*****************************************************************************/
/*	Изменили PolygonID
/*	Загружаем информацию о полигоне или пустой если это новый полигон
/*****************************************************************************/
function ChangePolygonID(polygonid)
{
	if (0 > polygonid)
	{
		//$("#PolygonInfo").css('display', 'none');
		return true;
	}
	else if (0 == polygonid)
	{//new polygon

		Reset(true);
		$("#PolygonType").prop("disabled", false);
		$("#srid").prop("disabled", false);
	}
	else
	{//exist polygon
//		Load(polygonid);
		$("#PolygonType").prop("disabled", true);
		$("#srid").prop("disabled", true);
	}
	
}

/*****************************************************************************/
/*	Если выбрана точка для клика
/*	Сохраняем ее координаты делаем пересчет
/*****************************************************************************/
function onMapClick(e)
{
	if ("" == SetPointName)
		return false;

	var position = e.latlng;
	
	var TempPoint = 
		proj4
		(
			ToProjection,
			FromProjection,
			[position.lng, position.lat]
		);
	
	$("#p" + SetPointName ).removeClass("SetPoint");
	
	$("#" + SetPointName + "x").val(TempPoint[0]);
	$("#" + SetPointName + "y").val(TempPoint[1]);
	$("#" + SetPointName + "gps").prop("checked", true);
	
	
	
	GPSChange({"id" : SetPointName + "gps", "checked" : true});
	
	//alert(position);
	Calculate(false);
		
}

/*****************************************************************************/
/*	Сохраняем имя точки для отрисовки
/*	включаем/выключаем подсветку точки которую кликаем
/*****************************************************************************/
function SetPoint(pname)
{
	if ($("#p" + pname ).hasClass("SetPoint"))
	{
		SetPointName = ""; 
		$("#p" + pname ).removeClass("SetPoint");
	}
	else
	{
		SetPointName = pname; 
		$("div" ).removeClass("SetPoint");
		$("#p" + pname ).addClass("SetPoint");
	}
	return true;
}

/*****************************************************************************/
/*	Генерация таблицы по нажатию кнопки Go
/*****************************************************************************/
function GenerateTable(clear)
{
	if (!$.isNumeric($("#tpcount").val()))
		return false;
	
	TableLength = $("#tpcount").val();
	if (!clear)
		ChangePointsCount('save');
	
	var result = '<table>';
	var Name = '';
	var Name2 = '';
	
	result = result +'<tr class="header_row">'+
										'<th>From</th>'+
										'<th>To</th>'+
										'<th class="col2">Bearing<br>magnetic</th>'+
										'<th class="col3">Bearing<br>corrected</th>'+
										'<th class="col4">Distance,<br>m</th>'+
										'<th class="col5">GPS</th>'+
										'<th class="col6">X</th>'+
										'<th class="col7">Y</th>'+
									'</tr>';
	
	Name = "LM";
	result = result +
			'<tr class="data_row">' +
				'<td class="col1"><div id = "p' + Name + '" onClick = "SetPoint(\'' + Name + '\'); return false;" style = "cursor:pointer;"><b>' + Name + '</b></div></td><td class="col1">BM</td>' +
				'<td class="col2"><input type = "number" min = "-360" max = "360" id = "' + Name + 'bm" name = "' + Name + 'bm" class = "bm LM  nu" disabled onblur = "RecalculateMagnetic(); Calculate(); return false;"></td>' +
				'<td class="col3"><input type = "text" id = "' + Name + 'bc" name = "' + Name + 'bc" class = "bc LM  nu" disabled></td>' +
				'<td class="col4"><input type = "text" id = "' + Name + 'dist" name = "' + Name + 'dist" class = "LM" disabled onblur = "Calculate(); return false;"></td>' +
				'<td class="col5">&nbsp;</td>' +
				'<td class="col6"><input type = "text" id = "' + Name + 'x" name = "' + Name + 'x" class = "LM  nu" onblur = "Calculate(); return false;"></td>' +
				'<td class="col7"><input type = "text" id = "' + Name + 'y" name = "' + Name + 'y" class = "LM  nu" onblur = "Calculate(); return false;"></td>' +
			'</tr>';
	Name = "BM";
	result = result +
			'<tr class="data_row">' +
				'<td class="col1"><div id = "p' + Name + '" onClick = "SetPoint(\'' + Name + '\'); return false;" style = "cursor:pointer;"><b>' + Name + '</b></div></td><td class="col1">SP</td>' +
				'<td class="col2"><input type = "number" min = "-360" max = "360" id = "' + Name + 'bm" name = "' + Name + 'bm" class = "bm cBM  " onblur = "RecalculateMagnetic(); Calculate(); return false;"></td>' +
				'<td class="col3"><input type = "text" id = "' + Name + 'bc" name = "' + Name + 'bc" class = "bc cBM" disabled></td>' +
				'<td class="col4"><input type = "text" id = "' + Name + 'dist" name = "' + Name + 'dist" class = "cBM  "onblur = "Calculate(); return false;"></td>' +
				'<td class="col5"><input type = "checkbox" id = "' + Name + 'gps" name = "' + Name + 'gps" disabled checked onChange = "GPSChange(this); Calculate(); return false;"></td>' +
				'<td class="col6"><input type = "text" id = "' + Name + 'x" name = "' + Name + 'x" class = "cBM  "onblur = "Calculate(); return false;"></td>' +
				'<td class="col7"><input type = "text" id = "' + Name + 'y" name = "' + Name + 'y" class = "cBM  "onblur = "Calculate(); return false;"></td>' +
			'</tr>';
	
	for (var i = 0; i <= $("#tpcount").val(); i++)
	{
		if (i != $("#tpcount").val())
			Name2 = 'TP' + (i + 1);
		else
			Name2 = 'SP*';
		switch (i)
		{
			/**
			case -2		:
				Name = "LM";
			break;
			case -1		:
				Name = "BM";
			break;
			/**/
			case 0		:
				Name = "SP";
			break;
			default : 
					Name = "TP" + i;
					
			break;
		}
		
		result = result +
				'<tr class="data_row">' +
					'<td class="col1"><div id = "p' + Name + '" onClick = "SetPoint(\'' + Name + '\'); return false;" style = "cursor:pointer;"><b>' + Name + '</b></div></td><td class="col1">' + Name2 + '</td>' +
					'<td class="col2"><input type = "number" min = "-360" max = "360" id = "' + Name + 'bm" name = "' + Name + 'bm" class = "bm calculate" onblur = "RecalculateMagnetic(); Calculate(); return false;"></td>' +
					'<td class="col3"><input type = "text" id = "' + Name + 'bc" name = "' + Name + 'bc" class = "bc calculate" disabled></td>' +
					'<td class="col4"><input type = "text" id = "' + Name + 'dist" name = "' + Name + 'dist" class = " calculate" onblur = "Calculate(); return false;"></td>' +
					'<td class="col5"><input type = "checkbox" id = "' + Name + 'gps" name = "' + Name + 'gps" onChange = "GPSChange(this); Calculate(); return false;"></td>' +
					'<td class="col6"><input type = "text" id = "' + Name + 'x" name = "' + Name + 'x" disabled class = " calculate" onblur = "Calculate(); return false;"></td>' +
					'<td class="col7"><input type = "text" id = "' + Name + 'y" name = "' + Name + 'y" disabled class = " calculate" onblur = "Calculate(); return false;"></td>' +
				'</tr>';
		
	}
	
	Name = "SPe";
	result = result +
				'<tr>' +
					'<td class="col1">' + 'SP*' + '</td><td></td>' +
					'<td class="col2">&nbsp;</td>' +
					'<td class="col3">&nbsp;</td>' +
					'<td class="col4">&nbsp;</td>' +
					'<td class="col5">&nbsp;</td>' +
					'<td class="col6"><input type = "text" id = "' + Name + 'x" name = "' + Name + 'x" disabled></td>' +
					'<td class="col7"><input type = "text" id = "' + Name + 'y" name = "' + Name + 'y" disabled></td>' +
				'</tr>';
	
	result = result + '<tr class="footer_row">' + 
					'<td colspan = "3"><b>Closure Error</b></td>' + 
					'<td class="col3"><div id = "mcp">&nbsp;</div></td>' +
					'<td class="col4"><div id = "mcdist">&nbsp;</div></td>' +
					'<td class="col5">&nbsp;</td>' +
					'<td class="col6"><div id = "mcx">&nbsp;</div></td>' +
					'<td class="col6"><div id = "mcy">&nbsp;</div></td>' +
					'</tr>';
	
	result = result + '<tr class="footer_row">' + 
					'<td colspan = "3"><b>Area, m<sup>2</sup></b></td>' + 
					'<td class="col3"><div id = "area" name = "area">&nbsp;</div></td>' +
					'<td class="col4">&nbsp;</td>' +
					'<td>&nbsp;</td>' +
					'<td>&nbsp;</td>' +
					'<td>&nbsp;</td>' +
					'</tr>';
	
	result = result + '<tr class="footer_row">' + 
					'<td colspan = "3"><b>Perimeter, m</b></td>' + 
					'<td class="col3"><div id = "perimetr">&nbsp;</div></td>' +
					'<td class="col4">&nbsp;</td>' +
					'<td>&nbsp;</td>' +
					'<td>&nbsp;</td>' +
					'<td>&nbsp;</td>' +
					'</tr>';
	
	result = result + "</table>";
	
	
	
	$("#PointsTable").html(result);
	
	$("#BMgps").prop("checked", true);
	
	if (("undefined" != typeof(ArrayOfTable)))
		if (0 != ArrayOfTable.lenght)
			if (!clear)
				ChangePointsCount('load');
}

/*****************************************************************************/
/*	Установка галочки GPS
/*****************************************************************************/
function GPSChange(value)
{
	var Name = value.id.replace("gps", "");
	var Name2;
	/**/
	switch(Name)
	{
		case "LM" :
		break;
		
		case "BM" :
			Name2 = "LM";
		break;
		
		case "SP" :
			Name2 = "BM";
		break;
		
		case "TP1" :
			Name2 = "SP";
		break;
		
		default :
			Name2 = "TP" + (Name.replace("TP", "") - 1);
		break;
	}
	/**/
	
	if (value.checked)
	{
		$("#" + Name2 + "bm").prop('disabled', true);
		//$("#" + Name + "bc").prop('disabled', true);
		$("#" + Name2 + "dist").prop('disabled', true);
		$("#" + Name + "x").prop('disabled', false);
		$("#" + Name + "y").prop('disabled', false);
		
		if (("TP" + TableLength) == Name)
		{
			$("#" + Name + "bm").prop('disabled', true);
			$("#" + Name + "dist").prop('disabled', true);
		}
	}
	else
	{
		$("#" + Name2 + "bm").prop('disabled', false);
		//$("#" + Name + "bc").prop('disabled', false);
		$("#" + Name2 + "dist").prop('disabled', false);
		$("#" + Name + "x").prop('disabled', true);
		$("#" + Name + "y").prop('disabled', true);
		
		if (("TP" + TableLength) == Name)
		{
			$("#" + Name + "bm").prop('disabled', false);
			$("#" + Name + "dist").prop('disabled', false);
		}
	}
	return true;
}

/*****************************************************************************/
/*	Пересчет магнитной погрешности
/*****************************************************************************/
function RecalculateMagnetic()
{
	var result;
	var md = Number($("#md").val());

	$(".bm").each(
		function (index, element)
		{
			var Name = element.id.replace("bm", "");
			$("#" + Name + "bc").val("");
			if ((0 == element.value.length))
			{
				return true;
			}
			if (!$.isNumeric(element.value))
			{
				//$("#" + Name + "bm").css("border-color", "red");
				$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
				return true;
			}
			$("#" + element.id).removeClass("ErrorInput");//css("border-color", "transparent");
			result = Number(element.value) + md;
			if (360 < result)
				result = result - 360;
			else if (0 > result)
				result = result + 360;
			
			$("#" + Name + "bc").val(result);
			return true;
		}
	);
	return true;
}

/*****************************************************************************/
/*	Перенос данных при изменении количества точек
/*****************************************************************************/
function ChangePointsCount(action)
{
	var Name, i;
	if (0 == $(".bm").length)
		return true;
	switch (action)
	{
		case "save" :
			ArrayOfTable = new Array($(".bm").length);
			ArrayOfTable[0] = {"id" : "LM", "bm" : $("#LMbm").val(), "dist" : $("#LMdist").val(), "x" : $("#LMx").val(), "y" : $("#LMy").val()};
			ArrayOfTable[1] = {"id" : "BM", "bm" : $("#BMbm").val(), "dist" : $("#BMdist").val(), "x" : $("#BMx").val(), "y" : $("#BMy").val()};
			ArrayOfTable[2] = {"id" : "SP", "bm" : $("#SPbm").val(), "dist" : $("#SPdist").val(), "x" : $("#SPx").val(), "y" : $("#SPy").val(), "gps" : $("#SPgps").prop("checked")};
			
			for(i = 1; i <= $(".bm").length - 3; i++)
			{
				Name = "TP" + i;
				ArrayOfTable[2 + i] = {"id" : Name, "bm" : $("#" + Name + "bm").val(), "dist" : $("#" + Name + "dist").val(), "x" : $("#" + Name + "x").val(), "y" : $("#" + Name + "y").val(), "gps" : $("#" + Name + "gps").prop("checked")};
			}
			
		break;
		case "load" :
			for (i = 0; i < (Number(TableLength) + 3); i++)
			{
				if (i >= ArrayOfTable.length)
				{
					continue;
				}
				$("#" + ArrayOfTable[i]["id"] + "bm").val(ArrayOfTable[i]["bm"]);
				$("#" + ArrayOfTable[i]["id"] + "dist").val(ArrayOfTable[i]["dist"]);
				$("#" + ArrayOfTable[i]["id"] + "x").val(ArrayOfTable[i]["x"]);
				$("#" + ArrayOfTable[i]["id"] + "y").val(ArrayOfTable[i]["y"]);
				/**/
				if (ArrayOfTable[i]["gps"])
				{
					$("#" + ArrayOfTable[i]["id"] + "gps").prop("checked", true);
					$("#" + ArrayOfTable[i]["id"] + "x").prop('disabled', false);
					$("#" + ArrayOfTable[i]["id"] + "y").prop('disabled', false);
					$("#" + ArrayOfTable[i - 1]["id"] + "bm").prop('disabled', true);
					$("#" + ArrayOfTable[i - 1]["id"] + "dist").prop('disabled', true);
				}
				else
				{
					$("#" + ArrayOfTable[i]["id"] + "gps").prop("checked", false);
				}
				/**/
			}
			
			/**************************************************************/
			$("#LMbm").prop("disabled", true);
			$("#LMdist").prop("disabled", true);
			$("#BMgps").prop("disabled", true);
			$("#BMgps").prop("checked", true);
			/**************************************************************/
			RecalculateMagnetic();
			Calculate();
			ArrayOfTable = undefined;
		break;
	}
	return true;
}
/*****************************************************************************/
/*	Пересчет всех координат после ввода
/*****************************************************************************/
function CheckInput()
{
	var result = true;
	$("input.calculate").removeClass("ErrorInput");//css("border-color", "transparent");
	$("input.cBM").removeClass("ErrorInput");//css("border-color", "transparent");
	$("input.LM").removeClass("ErrorInput");//css("border-color", "transparent");
	
	
	$("input.calculate").each(
		function (index, element)
		{
			if (!$("#"+element.id).prop("disabled"))
			{
				
				if (!$.isNumeric(element.value))
				{
					$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
					result = false;
				}
			}
		}
	);
	
	$("input.LM").each(
		function (index, element)
		{
			if (!$("#"+element.id).prop("disabled"))
			{
				if (!$("#BMgps").prop("checked") && !$("#SPgps").prop("checked"))
				{
					if (!$.isNumeric(element.value))
					{
						$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
						result = false;
					}
				}
				else
				{
					if (!$("#SPgps").prop("checked"))
					{
						if (!$.isNumeric(element.value)&&(0 != element.value.length))
						{
							$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
							result = false;
						}
					}
				}
			}
		}
	);
	
	
	$("input.cBM").each(
		function (index, element)
		{
			if (!$("#SPgps").prop("checked"))
			{		
				if (!$("#"+element.id).prop("disabled"))
				{
					if (!$.isNumeric(element.value))// && (0 != element.value.length))
					{
						$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
						result = false;
					}
				}
			}
			else
			{
				if (!$("#"+element.id).prop("disabled"))
				{
					if ((!$.isNumeric(element.value)) && (0 != element.value.length))
					{
						$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
						result = false;
					}
					else
					{
						$("#" + element.id).removeClass("ErrorInput");//css("border-color", "red");
					}
				}
			}
		}
	);
	
	$("input.bm").each(
		function (index, element)
		{
			if (!$("#"+element.id).prop("disabled"))
			{
				if (($.isNumeric(element.value)))
				{
					if ((element.value >= -360)&&(element.value <= 360))
					{
						
					}
					else
					{
						$("#" + element.id).addClass("ErrorInput");//css("border-color", "red");
						$("#error").html("Bearing magnetic must be -360...360");
						result = false;
					}
				}
			}
		}
	);

		
	return result;
}
/*****************************************************************************/
/*	Пересчет всех координат после ввода
/*****************************************************************************/
function Calculate(PanMap = true)
{
	if ("" == FromProjection)
	{
		ShowErrorCalculate();
		CheckInput();
		$("#error").html("Please enter SRID first!");
		$("srid").addClass("ErrorInput");
		return false;
	}
	
	
	$("#bSave").prop("disabled", true);
	$("#export").attr("disabled", true);
	$("#error").html("");
	

	
	DrawPoints();
	/*
	if (!CheckInput())
	{
		ShowErrorCalculate();
		//return false;
	}
	/**/
	var ugol;
	var perimetr = 0;
	var distance = 0;
	var percent;
	var calculate = true;
	var StartPoint, NewPoint, tempX, tempY;
	
	/*********************************
	x = Math.sin(ugol) * dist + x;
	y = Math.cos(ugol) * dist + y;
	/********************************/
	
	if (!$("#BMgps").prop("checked"))
	{//BM calculate coordinates from LM
		if ($.isNumeric($('#LMbc').val()) && $.isNumeric($("#LMdist").val()) && $.isNumeric($("#LMx").val()) && $.isNumeric($("#LMy").val()))
		{
			ugol = Number($('#LMbc').val()) * Math.PI / 180;
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#LMx").val()), Number($("#LMy").val()) ]);
				tempX = (Math.round(Math.sin(ugol) * Number($("#LMdist").val()) + StartPoint[0]));
				tempY = (Math.round(Math.cos(ugol) * Number($("#LMdist").val()) + StartPoint[1]));
				NewPoint = ConvertCoord(MetricProj, FromProjection, [ tempX, tempY ]);
				$("#BMx").val(NewPoint[0].toFixed(6));
				$("#BMy").val(NewPoint[1].toFixed(6));
			}
			else
			{
				
				$("#BMx").val(Math.round(Math.sin(ugol) * Number($("#LMdist").val()) + Number($("#LMx").val())));
				$("#BMy").val(Math.round(Math.cos(ugol) * Number($("#LMdist").val()) + Number($("#LMy").val())));
			}
		}
		else
		{
			//calculate = false;
		}
	}
	else
	{//start point calculate distance and bearing from BM
		if ($.isNumeric($('#LMx').val()) && $.isNumeric($("#LMy").val()) && $.isNumeric($("#BMx").val()) && $.isNumeric($("#BMy").val()))
		{
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#LMx").val()), Number($("#LMy").val()) ]);
				NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#BMx").val()), Number($("#BMy").val()) ]);
				
				$("#BMdist").val(Math.round(Math.sqrt(Math.pow((Number(NewPoint[0]) - Number(StartPoint[0])), 2) + Math.pow((Number(NewPoint[1]) - Number(StartPoint[1])), 2))));
				$('#BMbc').val(GetAzimut(Number(StartPoint[0]), Number(StartPoint[1]), Number(NewPoint[0]), Number(NewPoint[1])));
			}
			else
			{
				$("#LMdist").val(Math.round(Math.sqrt(Math.pow((Number($("#BMx").val()) - Number($("#LMx").val())), 2) + Math.pow((Number($("#BMy").val()) - Number($("#LMy").val())), 2))));
				$('#LMbc').val(GetAzimut(Number($("#LMx").val()), Number($("#LMy").val()), Number($("#BMx").val()), Number($("#BMy").val())));
			}
			ugol = $('#LMbc').val() - $('#md').val();
			if (0 > ugol)
				ugol += 360;
			else 
				if (360 < ugol)
					ugol -= 360;
			$('#LMbm').val(ugol);
		}
		else
		{
			//calculate = false;
		}
	}
	
	
	
	
	
	
	
	
	
	if (!$("#SPgps").prop("checked"))
	{//start point calculate coordinates from BM
		if ($.isNumeric($('#BMbc').val()) && $.isNumeric($("#BMdist").val()) && $.isNumeric($("#BMx").val()) && $.isNumeric($("#BMy").val()))
		{
			ugol = Number($('#BMbc').val()) * Math.PI / 180;
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#BMx").val()), Number($("#BMy").val()) ]);
				tempX = (Math.round(Math.sin(ugol) * Number($("#BMdist").val()) + StartPoint[0]));
				tempY = (Math.round(Math.cos(ugol) * Number($("#BMdist").val()) + StartPoint[1]));
				NewPoint = ConvertCoord(MetricProj, FromProjection, [ tempX, tempY ]);
				$("#SPx").val(NewPoint[0].toFixed(6));
				$("#SPy").val(NewPoint[1].toFixed(6));
			}
			else
			{
				
				$("#SPx").val(Math.round(Math.sin(ugol) * Number($("#BMdist").val()) + Number($("#BMx").val())));
				$("#SPy").val(Math.round(Math.cos(ugol) * Number($("#BMdist").val()) + Number($("#BMy").val())));
			}
		}
		else
		{
			calculate = false;
		}
	}
	else
	{//start point calculate distance and bearing from BM
		if ($.isNumeric($('#BMx').val()) && $.isNumeric($("#BMy").val()) && $.isNumeric($("#SPx").val()) && $.isNumeric($("#SPy").val()))
		{
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#BMx").val()), Number($("#BMy").val()) ]);
				NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#SPx").val()), Number($("#SPy").val()) ]);
				
				$("#BMdist").val(Math.round(Math.sqrt(Math.pow((Number(NewPoint[0]) - Number(StartPoint[0])), 2) + Math.pow((Number(NewPoint[1]) - Number(StartPoint[1])), 2))));
				$('#BMbc').val(GetAzimut(Number(StartPoint[0]), Number(StartPoint[1]), Number(NewPoint[0]), Number(NewPoint[1])));
			}
			else
			{
				$("#BMdist").val(Math.round(Math.sqrt(Math.pow((Number($("#SPx").val()) - Number($("#BMx").val())), 2) + Math.pow((Number($("#SPy").val()) - Number($("#BMy").val())), 2))));
				$('#BMbc').val(GetAzimut(Number($("#BMx").val()), Number($("#BMy").val()), Number($("#SPx").val()), Number($("#SPy").val())));
			}
			
			ugol = $('#BMbc').val() - $('#md').val();
			if (0 > ugol)
				ugol += 360;
			else 
				if (360 < ugol)
					ugol -= 360;
			$('#BMbm').val(ugol);
		}
		else
		{
			//calculate = false;
		}
	}
	
	
	 if (!$("#TP1gps").prop("checked"))
	{
		if (calculate && $.isNumeric($('#SPbc').val()) && $.isNumeric($("#SPdist").val()) && $.isNumeric($("#SPx").val()))
		{
			ugol = Number($('#SPbc').val()) * Math.PI / 180;
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#SPx").val()), Number($("#SPy").val()) ]);
				tempX = (Math.round(Math.sin(ugol) * Number($("#SPdist").val()) + StartPoint[0]));
				tempY = (Math.round(Math.cos(ugol) * Number($("#SPdist").val()) + StartPoint[1]));
				NewPoint = ConvertCoord(MetricProj, FromProjection, [ tempX, tempY ]);
				$("#TP1x").val(NewPoint[0].toFixed(6));
				$("#TP1y").val(NewPoint[1].toFixed(6));
			}
			else
			{
				$("#TP1x").val(Math.round(Math.sin(ugol) * Number($("#SPdist").val()) + Number($("#SPx").val())));
				$("#TP1y").val(Math.round(Math.cos(ugol) * Number($("#SPdist").val()) + Number($("#SPy").val())));
			}
		}
		else
		{
			calculate = false;
		}
	}
	else
	{
		if ($.isNumeric($('#SPx').val()) && $.isNumeric($("#SPy").val()) && $.isNumeric($("#TP1x").val()) && $.isNumeric($("#TP1y").val()))
		{
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#SPx").val()), Number($("#SPy").val()) ]);
				NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP1x").val()), Number($("#TP1y").val()) ]);
				
				$("#SPdist").val(Math.round(Math.sqrt(Math.pow((Number(NewPoint[0]) - Number(StartPoint[0])), 2) + Math.pow((Number(NewPoint[1]) - Number(StartPoint[1])), 2))));
				$('#SPbc').val(GetAzimut(Number(StartPoint[0]), Number(StartPoint[1]), Number(NewPoint[0]), Number(NewPoint[1])));
			}
			else
			{
				$("#SPdist").val(Math.round(Math.sqrt(Math.pow((Number($("#SPx").val()) - Number($("#TP1x").val())), 2) + Math.pow((Number($("#SPy").val()) - Number($("#TP1y").val())), 2))));
				$('#SPbc').val(GetAzimut(Number($("#SPx").val()), Number($("#SPy").val()), Number($("#TP1x").val()), Number($("#TP1y").val())));
			}
			
			ugol = $('#SPbc').val() - $('#md').val();
			if (0 > ugol)
				ugol += 360;
			else 
				if (360 < ugol)
					ugol -= 360;
			$('#SPbm').val(ugol);
		}
		else
		{
			calculate = false;
		}
	}
	
	
	if (calculate)
	{
		if ("longlat" == projection_acronym)
		{
			StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#SPx").val()), Number($("#SPy").val()) ]);
			NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP1x").val()), Number($("#TP1y").val()) ]);
			perimetr = perimetr + Math.sqrt(Math.pow((Number(StartPoint[0]) - Number(NewPoint[0])), 2) + Math.pow((Number(StartPoint[1]) - Number(NewPoint[1])), 2));
		}
		else
		{
			perimetr = perimetr + Math.sqrt(Math.pow((Number($("#SPx").val()) - Number($("#TP1x").val())), 2) + Math.pow((Number($("#SPy").val()) - Number($("#TP1y").val())), 2));
		}
	}
	
	for (var i = 2; i <= TableLength; i++)
	{
		if (!$("#TP" + i + "gps").prop("checked"))
		{
			if (calculate && $.isNumeric($("#TP" + (i - 1) + "bc").val()) && $.isNumeric($("#TP" + (i - 1) + "dist").val()) && $.isNumeric($("#TP" + (i - 1) + "x").val()))
			{
				ugol = Number($("#TP" + (i - 1) + "bc").val()) * Math.PI / 180;
				
				if ("longlat" == projection_acronym)
				{
					StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + (i - 1) + "x").val()), Number($("#TP" + (i - 1) + "y").val()) ]);
					tempX = (Math.round(Math.sin(ugol) * Number($("#TP" + (i - 1) + "dist").val()) + StartPoint[0]));
					tempY = (Math.round(Math.cos(ugol) * Number($("#TP" + (i - 1) + "dist").val()) + StartPoint[1]));
					NewPoint = ConvertCoord(MetricProj, FromProjection, [ tempX, tempY ]);
					$("#TP" + i + "x").val(NewPoint[0].toFixed(6));
					$("#TP" + i + "y").val(NewPoint[1].toFixed(6));
				}
				else
				{
					$("#TP" + i + "x").val(Math.round(Math.sin(ugol) * Number($("#TP" + (i - 1) + "dist").val()) + Number($("#TP" + (i - 1) + "x").val())));
					$("#TP" + i + "y").val(Math.round(Math.cos(ugol) * Number($("#TP" + (i - 1) + "dist").val()) + Number($("#TP" + (i - 1) + "y").val())));
				}
			}
			else
			{
				calculate = false;
			}
		}
		else
		{
			if ($.isNumeric($("#TP" + (i - 1) + "x").val()) && $.isNumeric($("#TP" + (i - 1) + "y").val()) && $.isNumeric($("#TP" + i + "x").val()) && $.isNumeric($("#TP" + i + "y").val()))
			{
				if ("longlat" == projection_acronym)
				{
					StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + (i - 1) + "x").val()), Number($("#TP" + (i - 1) + "y").val()) ]);
					NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + i + "x").val()), Number($("#TP" + i + "y").val()) ]);
					
					$("#TP" + (i - 1) + "dist").val(Math.round(Math.sqrt(Math.pow((Number(NewPoint[0]) - Number(StartPoint[0])), 2) + Math.pow((Number(NewPoint[1]) - Number(StartPoint[1])), 2))));
					$("#TP" + (i - 1) + "bc").val(GetAzimut(Number(StartPoint[0]), Number(StartPoint[1]), Number(NewPoint[0]), Number(NewPoint[1])));
				}
				else
				{
					$("#TP" + (i - 1) + "dist").val(Math.round(Math.sqrt(Math.pow((Number($("#TP" + (i - 1) + "x").val()) - Number($("#TP" + i + "x").val())), 2) + Math.pow((Number($("#TP" + (i - 1) + "y").val()) - Number($("#TP" + i + "y").val())), 2))));
					$("#TP" + (i - 1) + "bc").val(GetAzimut(Number($("#TP" + (i - 1) + "x").val()), Number($("#TP" + (i - 1) + "y").val()), Number($("#TP" + i + "x").val()), Number($("#TP" + i + "y").val())));
				}
				//$("#TP" + (i - 1) + "bm").val($("#TP" + (i - 1) + "bc").val() - $('#md').val());
				ugol = $("#TP" + (i - 1) + "bc").val() - $('#md').val();
				if (0 > ugol)
					ugol += 360;
				else 
					if (360 < ugol)
						ugol -= 360;
				$("#TP" + (i - 1) + "bm").val(ugol);
				
			}
			else
			{
				calculate = false;
			}
		}
		
		if (calculate)
		{
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + (i - 1) + "x").val()), Number($("#TP" + (i - 1) + "y").val()) ]);
				NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + i + "x").val()), Number($("#TP" + i + "y").val()) ]);
				perimetr = perimetr + Math.sqrt(Math.pow((Number(StartPoint[0]) - Number(NewPoint[0])), 2) + Math.pow((Number(StartPoint[1]) - Number(NewPoint[1])), 2));
			}
			else
			{
				perimetr = perimetr + Math.sqrt(Math.pow((Number($("#TP" + (i - 1) + "x").val()) - Number($("#TP" + i + "x").val())), 2) + Math.pow((Number($("#TP" + (i - 1) + "y").val()) - Number($("#TP" + i + "y").val())), 2));
			}
		}
	}
	
	/*********************************************/
	/* Calcelate EndPOINT 
	/*********************************************/
	if (calculate && $.isNumeric($("#TP" + TableLength + "bc").val()) && $.isNumeric($("#TP" + TableLength + "dist").val()) && $.isNumeric($("#TP" + TableLength + "bc").val()) && (!$("#TP" + TableLength + "gps").prop("checked")))
	{
		ugol = Number($("#TP" + TableLength + "bc").val()) * Math.PI / 180;
		
		if ("longlat" == projection_acronym)
		{
			StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + TableLength + "x").val()), Number($("#TP" + TableLength + "y").val()) ]);
			tempX = (Math.round(Math.sin(ugol) * Number($("#TP" + TableLength + "dist").val()) + StartPoint[0]));
			tempY = (Math.round(Math.cos(ugol) * Number($("#TP" + TableLength + "dist").val()) + StartPoint[1]));
			NewPoint = ConvertCoord(MetricProj, FromProjection, [ tempX, tempY ]);
			$("#SPex").val(NewPoint[0].toFixed(6));
			$("#SPey").val(NewPoint[1].toFixed(6));
		}
		else
		{
			$("#SPex").val(Math.round(Math.sin(ugol) * Number($("#TP" + TableLength+ "dist").val()) + Number($("#TP" + TableLength + "x").val())));
			$("#SPey").val(Math.round(Math.cos(ugol) * Number($("#TP" + TableLength + "dist").val()) + Number($("#TP" + TableLength + "y").val())));
		}
	}
	else
	{
		if (/**calculate && /**/$.isNumeric($("#TP" + TableLength + "x").val()) && $.isNumeric($("#TP" + TableLength + "y").val()) && ($("#TP" + TableLength + "gps").prop("checked")))
		{
			$("#SPex").val($("#SPx").val());
			$("#SPey").val($("#SPy").val());
			
			if ("longlat" == projection_acronym)
			{
				StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" +TableLength + "x").val()), Number($("#TP" +TableLength + "y").val()) ]);
				NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#SPex").val()), Number($("#SPey").val()) ]);
				
				$("#TP" + TableLength + "dist").val(Math.round(Math.sqrt(Math.pow((Number(NewPoint[0]) - Number(StartPoint[0])), 2) + Math.pow((Number(NewPoint[1]) - Number(StartPoint[1])), 2))));
				$("#TP" + TableLength + "bc").val(GetAzimut(Number(StartPoint[0]), Number(StartPoint[1]), Number(NewPoint[0]), Number(NewPoint[1])));
			}
			else
			{
			
				$("#TP" + TableLength + "dist").val(Math.round(Math.sqrt(Math.pow((Number($("#TP" +TableLength + "x").val()) - Number($("#SPex").val())), 2) + Math.pow((Number($("#TP" + TableLength + "y").val()) - Number($("#SPey").val())), 2))));
				$("#TP" + TableLength + "bc").val(GetAzimut(Number($("#TP" + TableLength + "x").val()), Number($("#TP" +TableLength + "y").val()), Number($("#SPex").val()), Number($("#SPey").val())));
			}
			ugol = $("#TP" + TableLength + "bc").val() - $('#md').val();
			if (0 > ugol)
				ugol += 360;
			else 
				if (360 < ugol)
					ugol -= 360;
			$("#TP" + TableLength + "bm").val(ugol);
			//$("#TP" + TableLength + "bm").val($("#TP" + TableLength + "bc").val() - $('#md').val());
			
		}
		else
		{
			calculate = false;
		}
		/**/
	}
	if (calculate)
	{
		if ("longlat" == projection_acronym)
		{
			StartPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#SPex").val()), Number($("#SPey").val()) ]);
			NewPoint = ConvertCoord(FromProjection, MetricProj, [ Number($("#TP" + TableLength + "x").val()), Number($("#TP" + TableLength + "y").val()) ]);
			perimetr = perimetr + Math.sqrt(Math.pow((Number(StartPoint[0]) - Number(NewPoint[0])), 2) + Math.pow((Number(StartPoint[1]) - Number(NewPoint[1])), 2));
		}
		else
		{
			perimetr = perimetr + Math.sqrt(Math.pow((Number($("#SPex").val()) - Number($("#TP" + TableLength + "x").val())), 2) + Math.pow((Number($("#SPey").val()) - Number($("#TP" + TableLength + "y").val())), 2));
		}
	}
	
	$("input").each
	(
		function(index, element)
		{
			if ("NaN" == element.value)
			{
				$("#SPex").val("Error");
				$("#SPey").val("Error");
				ClearLine();
				return false;
			}
		}
	);
	
	if (calculate)
	{
		distance =  Math.sqrt(Math.pow((Number($("#SPx").val()) - Number($("#SPex").val())), 2) + Math.pow((Number($("#SPy").val()) - Number($("#SPey").val())), 2));
		$("#mcdist").html(Math.round(distance));
		$("#mcx").html((Number($("#SPx").val()) - Number($("#SPex").val())).toFixed(6));
		$("#mcy").html((Number($("#SPy").val()) - Number($("#SPey").val())).toFixed(6));
		$("#perimetr").html(Math.round(perimetr));
	
	
		percent = Math.round(distance * 1000 / perimetr) / 10;
		$("#mcp").html(percent + "%");
		
		if (1 < Number(percent))
		{
			$("#error").html("It's big Miscloshure " + percent);
			$("#bSave").prop("disabled", true);
			$("#export").attr("disabled", true);
			calculate = false;
		}
		
	}
	
	if (PanMap)
		if (($.isNumeric($("#SPy").val()))&&($.isNumeric($("#SPy").val())))
		{
			var coordarray = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#SPx").val()), parseFloat($("#SPy").val())]
					);
			map.panTo
			(
				[coordarray[1], coordarray[0]]
			);
		}
	

	if (calculate)
	{
		$("#bSave").prop("disabled", false);
		/*
		$("#export").prop("disabled", false);
		$("#export").removeProp("disabled");
		*/
		$("#export").removeAttr("disabled");
	}
	
	$("#error").html("");
	if(!CheckInput())
		ShowErrorCalculate();

	
	DrawLine();
	DrawPoints();
	
	
	return true;
}

/******************************************************************************
/*	Get Azimut
/*****************************************************************************/
function GetAzimut(spx, spy, epx, epy)
{
	var dX = epx - spx;
	var dY = epy - spy;
	var angle = Math.round(Math.atan2(dX, dY) * 180 / Math.PI);
	if (0 > angle)
		angle = angle + 360;
	if (360 < angle)
		angle = angle - 360;
	return angle;
}

function ClearCalculate()
{
	$("#mcdist").html("");
	$("#mcx").html("");
	$("#mcy").html("");
	$("#area").html("");
	$("#perimetr").html("");
	$("#mcp").html("");
}  



/*****************************************************************************/
/*	Очистка всех полей ввода
/*****************************************************************************/
function ClearTable()
{
	var i;
	for (i = 0; i < 3; i++)
	{
		$("#" + NamesTable[i] + "bm").val("");
		$("#" + NamesTable[i] + "bm").prop("disabled", false);
		
		$("#" + NamesTable[i] + "bc").val("");
		
		$("#" + NamesTable[i] + "dist").val("");
		$("#" + NamesTable[i] + "dist").prop("disabled", false);
		
		$("#" + NamesTable[i] + "gps").prop("checked", false);
		
		$("#" + NamesTable[i] + "x").val("");
		$("#" + NamesTable[i] + "y").val("");
		if ("SP" == NamesTable[i])
		{
			$("#SP").prop("disabled", true);
			$("#SP").prop("disabled", true);
		}
	}
	
	for (i = 1; i <= TableLength; i++)
	{
		$("#TP" + i + "bm").val("");
		$("#TP" + i + "bm").prop("disabled", false);
		
		$("#TP" + i + "bc").val("");
		
		$("#TP" + i + "dist").val("");
		$("#TP" + i + "dist").prop("disabled", false);
		
		$("#TP" + i + "gps").prop("checked", false);
		
		$("#TP" + i + "x").val("");
		$("#TP" + i + "x").prop("disabled", true);
		
		$("#TP" + i + "y").val("");
		$("#TP" + i + "y").prop("disabled", true);
	}
	
	$("#SPex").val("");
	$("#SPey").val("");
	
	
	/**************************************************************/
	$("#LMbm").prop("disabled", true);
	$("#LMdist").prop("disabled", true);
	$("#BMgps").prop("disabled", true);
	$("#BMgps").prop("checked", true);
	/**************************************************************/
	
	
	ClearCalculate();
	return true;
}

/*****************************************************************************/
/*	Удаление Линии
/*****************************************************************************/
function ClearLine()
{
	if ("undefined" != typeof(LinePoly))
		map.removeLayer(LinePoly);
	return true;
}

/*****************************************************************************/
/*	отрисовка Линии
/*****************************************************************************/
function DrawLine()
{
	var LineArray = new Array();
	var PoligonArray = new Array();
	var Point, TempPoint;
	var Draw = true;
	
	ClearLine();
	
	if ($.isNumeric($("#SPx").val()) && $.isNumeric($("#SPy").val()))
	{
		TempPoint = 
			proj4
				(
					FromProjection,
					ToProjection,
					[parseFloat($("#SPx").val()), parseFloat($("#SPy").val())]
				);
	
		LineArray[0] = L.latLng(TempPoint[1], TempPoint[0]);
		PoligonArray[0] = [TempPoint[0], TempPoint[1]];
	}
	else
	{
		Draw = false;
	}
	
	for (i = 1; i <= TableLength; i++)
	{
		if (Draw && $.isNumeric($("#TP" + i + "x").val()) && $.isNumeric($("#TP" + i + "y").val()))
		{
			TempPoint = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#TP" + i + "x").val()), parseFloat($("#TP" + i + "y").val())]
					);
		LineArray[PoligonArray.length] = L.latLng(TempPoint[1], TempPoint[0]);
		PoligonArray[PoligonArray.length] = [TempPoint[0], TempPoint[1]];
		}
		else
		{
			Draw = false;
		}
	}
	
	
	/***********************************************************/
	/*	End POint
	/***********************************************************/
	if (Draw && $.isNumeric($("#SPex").val()) && $.isNumeric($("#SPey").val()))
	{
		TempPoint = 
			proj4
				(
					FromProjection,
					ToProjection,
					[parseFloat($("#SPex").val()), parseFloat($("#SPey").val())]
				);
		LineArray[PoligonArray.length] = L.latLng(TempPoint[1], TempPoint[0]);
		PoligonArray[PoligonArray.length] = [PoligonArray[0][0], PoligonArray[0][1]];
	}
	else
	{
		Draw = false;
	}
	/**/
	if (2 < LineArray.length)
	{
		//LinePoly = L.polygon(LineArray).addTo(map);
		
		var PolyArray = new Array();
		for (var i = 0; i < LineArray.length - 1; i++)
			PolyArray.push(LineArray[i]);
		LinePoly = new L.Polyline(PolyArray, {color: 'green', weight: 0, opacity: 0, smoothFactor: 0}).addTo(map);
		
		if (LinePoly.intersects())
		{
			$("#error").html("Intersection");
			$("#bSave").prop("disabled", true);
			$("#export").attr("disabled", true);
		};
		ClearLine();
		LinePoly = new L.Polyline(LineArray, {color: 'red', weight: 3, opacity: 0.5, smoothFactor: 1}).addTo(map);
		
		//PoligonArray[PoligonArray.length] = PoligonArray[0];
		
		var polygons2 = {
			"type": "FeatureCollection",
			"features": [
			{
				"type": "Feature",
				"properties": {},
				"geometry": {
				"type": "Polygon",
				"coordinates": [PoligonArray]
				}
			}]
			};

		var area = turf.area(polygons2);
		
		$("#area").html(Math.round(area));
		$("#farea").val(Math.round(area));
	}
	
	return true;
}

/*****************************************************************************/
/*	показать ошибку расчета
/*****************************************************************************/
function ShowErrorCalculate()
{
	$("#mcdist").html("");
	$("#mcx").html("");
	$("#mcy").html("");
	$("#area").html("");
	$("#perimetr").html("");
	$("#mcp").html("");
	$("#error").html(ErrorText);
	ClearLine();
	return true;
}

/*****************************************************************************/
/*	отправка в базу для сохранения
/*****************************************************************************/
function Save()
{
	if (0 > $("#TaskID").val())
	{
		alert("Offline mode - not save");
		return false;
	}
	
	if (!CheckInput())
	{
		ShowErrorCalculate();
		return false;
	}
	if (0 > $("#PolygonType").val())
	{
		alert("Select Polygon Type");
		return false;
	}
	if (!$("#TP1x").length)
	{
		return false;
	}
	
	var distance = $("#mcdist").html();
	var perimetr = $("#perimetr").html();
	var percent = Math.round(distance * 1000 / perimetr) / 10;
	
	if (1 < Number(percent))
	{
		alert("It's big Miscloshure " + percent);
		return false;
	}
	
	if (0 != $("#PolygonID").val())
		if (!confirm('Are you sure you want to save changes?'))
			return false;

	
	$("input[disabled]").prop('readonly', true).prop('disabled', false);
	
	var PolygonTypedisabled = $("#PolygonType").prop("disabled");
	$("#PolygonType").prop("disabled", false);
	
	$.ajax(
	{
		url: $('#fPolygon').attr('action'),
		dataType: "json",
		type: $('#fPolygon').attr('method'),
		data: $('#fPolygon').serialize(),
		success: function(msg)
		{
			if (0 == msg.errorcode)
			{
				alert('Added!');
				if (Number(msg.polygonid) != Number($("#PolygonID").val()))
				{
					ChangeTaskID($("#TaskID").val());
					$("#PolygonID option[value='" + msg.polygonid + "']").attr('selected', 'true');
					Load(msg.polygonid);
					return true;
				}
			}
			else
			{
				alert('Errror: ' + msg.errortext + '!');
				$("#error").html(msg.errortext);
			}
		},
		error: function (msg)
		{
			alert('Error: '+msg.status+', '+msg.statusText);
		}
	});
	
	$("input[readonly]").prop('readonly', false).prop('disabled', true);
	$("#PolygonType").prop("disabled", PolygonTypedisabled);
	
	return true;
}

function RB()
{
	$("#TaskID").val(-2);
	ChangeTaskID(-2);
	
	$("#TaskIDText").val('');
	$("#PolygonTypeText").val('');
	
	$('#srid').prop('disables', false);
	$('#srid').val('');
	FromProjection = '';
	ProjectForSHP = '';
	projection_acronym = '';
	$("#fsrid").val('');
	
	
	Reset(true);
}

/*****************************************************************************************************/
/*	очистить все
/*****************************************************************************************************/
function Reset(clear)
{
	
	$("#PolygonInfo").css('display', 'block');
	$("#tpcount").val(3);
	GenerateTable(clear);
	ClearTable();
	$("input.calculate").removeClass("ErrorInput");//css("border-color", "transparent");
	Calculate();
	ClearPoints();
	return true;
}


/*****************************************************************************************************/
/*	посчитать линию в 3243
/*	param
/*		names - возвращать кроме координат имя точки
/*		firstpoint	-	возвращать вместо расчетной последней точки первую
/*		convert - convert to 3243 или оставить в системе в которой вводили
/*****************************************************************************************************/
function CalculateLine(names, firstpoint, convert)
{
	var LineArray = new Array();
	var TempPoint;
	
	if (convert)
	{
		TempPoint = 
			proj4
				(
					FromProjection,
					ToProjection,
					[parseFloat($("#SPx").val()), parseFloat($("#SPy").val())]
				);
	}
	else
	{
		TempPoint = [parseFloat($("#SPx").val()), parseFloat($("#SPy").val())];
	}
	
	if (names)
	{
		LineArray[0] = {"point":[TempPoint[0], TempPoint[1]], "name":"SP"};
	}
	else
		LineArray[0] = [TempPoint[0], TempPoint[1]];
	
	for (i = 1; i <= TableLength; i++)
	{
		if (convert)
		{
			TempPoint = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#TP" + i + "x").val()), parseFloat($("#TP" + i + "y").val())]
					);
		}
		else
		{
			TempPoint = [parseFloat($("#TP" + i + "x").val()), parseFloat($("#TP" + i + "y").val())];
		}
		
		if (names)
		{
			LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name":"TP" + i};
		}
		else
			LineArray[LineArray.length] = [TempPoint[0], TempPoint[1]];
	}
	
	
	/***********************************************************/
	/*	End POint
	/***********************************************************/
	if (convert)
	{
		TempPoint = 
			proj4
				(
					FromProjection,
					ToProjection,
					[parseFloat($("#SPex").val()), parseFloat($("#SPey").val())]
				);
	}
	else
	{
		TempPoint = [parseFloat($("#SPex").val()), parseFloat($("#SPey").val())];
	}
	/**/
	if (firstpoint)
	{
		LineArray[LineArray.length] = LineArray[0];
	}
	else
	{
		if (names)
		{
			LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name": "SP*"};
		}
		else
			LineArray[LineArray.length] = [TempPoint[0], TempPoint[1]];
	}

	return LineArray;
}

/*********************************************************************************************/
/*	Export line to KML
/*********************************************************************************************/
function toKML()
{
	var Line = CalculateLine(false, true, true);
	var Points = CalculatePoints(true);
	
	var FileName = GetNameForExport();
	
	var kml = { "type": "FeatureCollection", 
				"features": 
				[
					{ 
						"type": "Feature",
						"geometry":  
						{ 
							"type": "Polygon",
							"color": "#880000",
							"coordinates": [Line]
						},
						"properties": 
						{
							"Task ID" : FileName.TaskID, //$("#TaskID").val(),
							"Polygon ID" : $("#PolygonID").val(),
							"Polygon Type" : FileName.PolygonType, //$("#PolygonType").val(),
							"SRID" : $("#srid").val(),
							"area" : $("#area").html(),
						}
					}
					
				]
			};
			
	saveAs(new Blob([tokml(kml)], {
        type: 'application/vnd.google-earth.kml+xml'
    }), FileName.Name + '_polygons.kml'); 			
			
			
	var kml = { "type": "FeatureCollection", 
				"features": 
				[
				]
			};			
			
	for (i = 0; i < Points.length; i++)
	{
		kml.features[kml.features.length] =
			{
				"type": "Feature",
				"properties": 
				{
					"name" : Points[i].name,
				},
				"geometry": 
				{
					"type": "Point",
					"coordinates": Points[i].point,
				}
			};
	}
	
	//run(JSON.parse(i))
	//var kml = tokml(i);
	
		
	 saveAs(new Blob([tokml(kml)], {
        type: 'application/vnd.google-earth.kml+xml'
    }), FileName.Name + '_points.kml'); 
}

/*********************************************************************************************/
/*	Export line to SHP
/*********************************************************************************************/
function toSHP()
{
	var FileName = GetNameForExport();
	
	var shpwrite = require('js/shpwrite');
	var Line = CalculateLine(false, true, false);
	var Points = CalculatePoints(false);

	var kml = { "type": "FeatureCollection", 
				"features": 
				[
					{ 
						"type": "Feature",
						"geometry":  
						{ 
							"type": "Polygon",
							"color": "#880000",
							"coordinates": [Line]
						},
						"properties": 
						{
							"task_id" : FileName.TaskID, //$("#TaskID").val(),
							"plg_id" : $("#PolygonID").val(),
							"plg_type" : FileName.PolygonType, //$("#PolygonType").val(),
							"srid" : ProjectForSHP,//$("#srid").val(),
							"area" : $("#area").html(),
						}
					}
					
				]
			};
			
	for (i = 0; i < Points.length; i++)
	{
		kml.features[kml.features.length] =
			{
				"type": "Feature",
				"properties": 
				{
					"name" : Points[i].name,
				},
				"geometry": 
				{
					"type": "Point",
					"coordinates": Points[i].point,
				}
			};
	};


	// (optional) set names for feature types and zipped folder
	var options = {
	    folder: FileName.Name, //'PolygonID_' + $("#PolygonID").val(),
	    prj: ProjectForSHP, //$("#srid").val(),
	    filename: FileName.Name,//'PolygonID_' + $("#PolygonID").val(),
	    types: {
	        point: 'points',
	        polygon: 'polygon',
	        line: 'lines'
	    }
	};
	// a GeoJSON bridge for features
	shpwrite.download(kml, options);
	
}

/*********************************************************************************************/
/*	Export line to CSV
/*********************************************************************************************/
function toCSV()
{
	var FileName = GetNameForExport();
	
	var LineArray = new Array();

	LineArray[0] = "Name,Bearing magnetic, Bearing corrected, Distance m, X, Y\r\n";
	LineArray[1] = "SP," + $("#SPbm").val() + "," + $("#SPbc").val() + "," + $("#SPdist").val() + "," + $("#SPx").val() + "," + $("#SPy").val()+ "\r\n";
	
	for (i = 1; i <= TableLength; i++)
	{
		LineArray[LineArray.length] = "TP" + i + "," + $("#TP" + i + "bm").val() + "," + $("#TP" + i + "bc").val() + "," + $("#TP" + i + "dist").val() + "," + $("#TP" + i + "x").val() + "," + $("#TP" + i + "y").val()+ "\r\n";
	}

	LineArray[LineArray.length] = LineArray[1];

	
	
	saveAs(
			new Blob(LineArray, 
			{
				type : 'text/csv'
			}), 
			FileName.Name + '.csv'); 
}

/*********************************************************************************************/
/*	Export line to JSON
/*********************************************************************************************/
function toJSON()
{
	var FileName = GetNameForExport();
	
	
	var Line = CalculateLine(false, true, false);
	var Points = CalculatePoints(false);

	var kml = { "type": "FeatureCollection", 
				"features": 
				[
					{ 
						"type": "Feature",
						"geometry":  
						{ 
							"type": "Polygon",
							"color": "#880000",
							"coordinates": [Line]
						},
						"properties": 
						{
							"Task ID" : FileName.TaskID, //$("#TaskID").val(),
							"Polygon ID" : $("#PolygonID").val(),
							"Polygon Type" : FileName.PolygonType, //$("#PolygonType").val(),
							"SRID" : $("#srid").val(),
							"area" : $("#area").html(),
						}
					}
					
				]
			};
			
	for (i = 0; i < Points.length; i++)
	{
		kml.features[kml.features.length] =
			{
				"type": "Feature",
				"properties": 
				{
					"name" : Points[i].name,
				},
				"geometry": 
				{
					"type": "Point",
					"coordinates": Points[i].point,
				}
			};
	}

	 saveAs(new Blob([JSON.stringify(kml)], {
        type: 'application/json'
    }), FileName.Name + '.json'); 
	return true;
}

/*********************************************************************************************/
/*	Export line 
/*	verification date -> export to selected format
/*********************************************************************************************/
function ExportTo(format)
{
	if (!CheckInput())
	{
		ShowErrorCalculate();
		return false;
	}
	if (0 > $("#PolygonType").val())
	{
		if (0 > $("#TaskID").val())
		{
			if (0 == $("#PolygonTypeText").val().trim())
			{
				alert("Enter Polygon Type");
				return false;
			}
		}	
		else
		{
			alert("Select Polygon Type");
			return false;
		}
	}
	if (!$("#TP1x").length)
	{
		return false;
	}
	
	var distance = $("#mcdist").html();
	var perimetr = $("#perimetr").html();
	var percent = Math.round(distance * 1000 / perimetr) / 10;
	
	if (1 < Number(percent))
	{
		alert("It's big Miscloshure " + percent);
		return false;
	}
	
	switch (format)
	{
		case 'kml' :
			toKML();
		break;
		
		case 'shp' :
			toSHP();
		break;
		
		case 'csv' :
			toCSV();
		break;
		
		case 'json' :
			toJSON();
		break;
	}
	return true;
}


function ClearPoints()
{
	for (i = 0; i < m_markers.length; i++)
		if ("undefined" != typeof(m_markers[i]))
			map.removeLayer(m_markers[i]);	
		
	return true;
}
/*********************************************************************************************/
/*	Draw points
/*********************************************************************************************/
function DrawPoints()
{
	ClearPoints();
		
	var Line = CalculatePoints(true);
	for (i = 0; i < Line.length; i++)
	{
		m_markers[i] = L.marker(
			[Line[i].point[1], Line[i].point[0]], 
			{
				draggable: true,
				title: Line[i].name,
				icon: PointIcon,
			}
		)
		.bindLabel(Line[i].name, { noHide: true })
		.addTo(map);
		
		
		m_markers[i].on
		(
			'dragend', function(event)
			{
				var marker = event.target;
				var position = marker.getLatLng();
				
				var TempPoint = 
					proj4
					(
						ToProjection,
						FromProjection,
						[position.lng, position.lat]
					);
				
				
				
				$("#" + marker.options.title + "x").val(TempPoint[0]);
				$("#" + marker.options.title + "y").val(TempPoint[1]);
				$("#" + marker.options.title + "gps").prop("checked", true);
				
				GPSChange({"id" : marker.options.title + "gps", "checked" : true});
				
				//alert(position);
				Calculate(false);
			}
		);
	}
	
	return true;
}

/*****************************************************************************************************/
/*	посчитать линию Точки
/*	param
/*		convert - convert to 3243 или оставить в системе в которой вводили
/*****************************************************************************************************/
function CalculatePoints(convert)
{
	var LineArray = new Array();
	var TempPoint;
	
	if (($.isNumeric($("#LMx").val()))&&($.isNumeric($("#LMy").val())))
	{
		if (convert)
		{
			TempPoint = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#LMx").val()), parseFloat($("#LMy").val())]
					);
		}
		else
		{
			TempPoint = [parseFloat($("#LMx").val()), parseFloat($("#LMy").val())];
		}
		LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name":"LM"};
	}
	
	if (($.isNumeric($("#BMx").val()))&&($.isNumeric($("#BMy").val())))
	{
		if (convert)
		{
			TempPoint = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#BMx").val()), parseFloat($("#BMy").val())]
					);
		}
		else
		{
			TempPoint = [parseFloat($("#BMx").val()), parseFloat($("#BMy").val())];
		}
		LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name":"BM"};
	}
	
	if (($.isNumeric($("#SPx").val()))&&($.isNumeric($("#SPy").val())))
	{
		if (convert)
		{
			TempPoint = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#SPx").val()), parseFloat($("#SPy").val())]
					);
		}
		else
		{
			TempPoint = [parseFloat($("#SPx").val()), parseFloat($("#SPy").val())];
		}
		LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name":"SP"};
	}
	
	
	for (i = 1; i <= TableLength; i++)
	{
		if (($.isNumeric($("#TP" + i + "x").val()))&&($.isNumeric($("#TP" + i + "y").val())))
		{
			if (convert)
			{
				TempPoint = 
					proj4
						(
							FromProjection,
							ToProjection,
							[parseFloat($("#TP" + i + "x").val()), parseFloat($("#TP" + i + "y").val())]
						);
			}
			else
			{
				TempPoint = [parseFloat($("#TP" + i + "x").val()), parseFloat($("#TP" + i + "y").val())];
			}
			LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name":"TP" + i};
		}
	}
	
	
	/***********************************************************/
	/*	End POint
	/***********************************************************/
	if (($.isNumeric($("#SPex").val()))&&($.isNumeric($("#SPey").val())))
	{
		if (convert)
		{
			TempPoint = 
				proj4
					(
						FromProjection,
						ToProjection,
						[parseFloat($("#SPex").val()), parseFloat($("#SPey").val())]
					);
		}
		else
		{
			TempPoint = [parseFloat($("#SPex").val()), parseFloat($("#SPey").val())];
		}
		LineArray[LineArray.length] = {"point":[TempPoint[0], TempPoint[1]], "name": "SP*"};
	}

	return LineArray;
}

/******************************************************************************
/*	Point = array [x,y]
/*****************************************************************************/
function ConvertCoord(From, To, Point)
{
	var Temp = proj4
				(
					From,
					To,
					Point
				);
	Temp[0] = Number(Temp[0].toFixed(6));
	Temp[1] = Number(Temp[1].toFixed(6));
	return Temp;
}

function GetNameForExport()
{
	var Name = $("#TaskIDText").val().trim() + "_" + $("#PolygonTypeText").val().trim();
	var TaskID = $("#TaskIDText").val();
	var PolygonType = $("#PolygonTypeText").val();

	if (1 > Name.trim().length)
	{
		Name = "map";
	}
	
	return {"TaskID" : TaskID, "PolygonType" : PolygonType, "Name" : Name};
}