function init() {
    gapi.client.init({
        'apiKey': 'AIzaSyCye9jtUXGqBMTqSdMc9t4SpdINj29Frtg', 
        'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(function() {
    }).catch(function(error) {
        console.error("Error initializing Google Sheets API", error);
    });
}

function getSpreadsheetData(range) {
    var spreadsheetId = "1YvRF9-U536Q_PB8EiZkR2bRu211dLGm9s7VXgQKTDo8"; 

    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    }).then(function(response) {
        return response.result.values;
    }).catch(function(error) {
        console.error("Error getting spreadsheet data", error);
    });
}

async function findTimetable(code) {
    var data = await getSpreadsheetData("반시간표!A:AJ");
    var sData = await getSpreadsheetData("수강과목!A:O");
    var rData = await getSpreadsheetData("이동반!A:G");
    var pData = [1, 2];

    for (var i = 1; i < sData.length; i++) {
        if (sData[i][1] === code) {
            pData = sData[i];
            break;
        }
    }

    code = code.substr(1, 1);

    for (var i = 0; i < data.length; i++) {
        if (data[i][0] === code) {
            for (var j = 1; j < data[i].length; j++) {
                if (data[i][j] >= 1 && data[i][j] <= 11) {
                    var d = parseInt(data[i][j]) + 2;
                    data[i][j] = pData[d];
                    
                    if(d-2 >= 1 && d-2 <= 6) {
                        for(var k = 1; k < rData.length; k++) {
                            if(rData[k][d-2] === data[i][j]) {
                                data[i][j] = data[i][j] + '<font size=2><br/><b>' + rData[k][0] + '</b></font>';
                            }
                        }
                    }
                }
                else {
                    data[i][j] = data[i][j] + '<font size=2><br/>' + data[i + 1][j] + '</font>';
                }
            }
            return data[i];
        }
    }

    return null;
}

async function findCode3(code) {
    var Data = await getSpreadsheetData("수강과목!A:O");

    for (var i = 1; i < Data.length; i++) {
        if (Data[i][0] === code) {
            return Data[i][1];
        }
    }
}


async function showTimetable() {
    var loading = document.getElementById("loading");
    loading.style.display = "block";

    var code = document.getElementById("code").value;
    var code3 = document.getElementById("code3").value;

    if (code3 === '') {
        code3 = await findCode3(code);
    }

    var timetableData = await findTimetable(code3);

    if (timetableData === null) {
        alert("일치하는 시간표 데이터가 없습니다.");
        return;
    }

    var tbody = document.getElementById("timetable-body");
    tbody.innerHTML = "";

    for (var i = 0; i < 7; i++) {
        var WD = document.createElement("tr");
        var time = document.createElement("td");
        var t1 = document.createElement("td");
        var t2 = document.createElement("td");
        var t3 = document.createElement("td");
        var t4 = document.createElement("td");
        var t5 = document.createElement("td");

        time.style.textAlign = "center";
        t1.style.textAlign = "center";
        t2.style.textAlign = "center";
        t3.style.textAlign = "center";
        t4.style.textAlign = "center";
        t5.style.textAlign = "center";

        time.innerHTML = i + 1;
        t1.innerHTML = timetableData[i + 1];
        t2.innerHTML = timetableData[i + 8];
        t3.innerHTML = timetableData[i + 15];
        t4.innerHTML = timetableData[i + 22];
        t5.innerHTML = timetableData[i + 29];

        WD.appendChild(time);
        WD.appendChild(t1);
        WD.appendChild(t2);
        WD.appendChild(t3);
        WD.appendChild(t4);
        WD.appendChild(t5);

        tbody.appendChild(WD);
    }

    loading.style.display = "none";
}

gapi.load('client', init);
