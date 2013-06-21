/*
 *  Copyright (c) 2012-2013 Malhar, Inc.
 *  All Rights Reserved.
 */

/**
 * Functions for drawing page view vs time chart.
 * @author Dinesh Prasad (dinesh@malhar-inc.com) 
 */


function PageViewTimeDataUrl()
{    
    var url = "PageViewTimeData.php?";
    url += "from=";
    url += Math.floor(pageViewLookback);
    if (pageViewUrl) 
    {
       url += "&url=" + pageViewUrl;   
    }
    //url += "&url=mydomain.com/services.php?serviceid=6";
    return url;  
}

function RenderPageViewTimeChart()
{
  // create/delete rows 
  if (pageViewTable.getNumberOfRows() < pageDataPoints.length)
  {    
    var numRows = pageDataPoints.length - pageViewTable.getNumberOfRows();
    pageViewTable.addRows(numRows);
  } else {
    for(var i=(pageViewTable.getNumberOfRows()-1); i >= pageDataPoints.length; i--)
    {
      pageViewTable.removeRow(i);    
    }
  }

  // Populate data table with time/cost data points. 
  for(var i=0; i < pageViewTable.getNumberOfRows(); i++)
  {
    //if(parseFloat(aggrDataPoints[i].cost) < 500) continue;
    pageViewTable.setCell(i, 0, new Date(parseInt(pageDataPoints[i].timestamp)));
    pageViewTable.setCell(i, 1, parseFloat(pageDataPoints[i].view));
  }

  // Draw line chart.
  var options = { pointSize: 0, lineWidth : 1 };
  options.title = 'Site Url Access(Per Sec) vs Time Chart';
  pageViewChart.draw(PageViewView, options); 
}

function DrawPageViewTimeChart()
{
  var url = PageViewTimeDataUrl();
  try
  {
    var connect = new XMLHttpRequest();
    connect.onreadystatechange = function() {
      if(connect.readyState==4 && connect.status==200) {
        pageViewData = connect.response;
        var pts = JSON.parse(pageViewData);
        for(var i=0; i <  pts.length; i++) 
        {
          pageDataPoints.push(pts[i]);
          delete pts[i];
        }
        delete pts;
        sortByKey(pageDataPoints, "timestamp");
	var cuttime = new Date().getTime() - 3600000 * pageViewInterval;
        var count = 0;
        for(var i=0; i < pageDataPoints.length; i++)
        {
          if(parseInt(pageDataPoints[i].timestamp)  < cuttime) count++;
          else break;
        }
        pageDataPoints.splice(0, count);
        RenderPageViewTimeChart();
        delete pageViewData;
      }
    }
    connect.open('GET',  url, true);
    connect.send(null);
  } catch(e) {
  }
  pageViewLookback = (new Date().getTime()/1000)-pageViewRefresh;
}


function HandlePageViewTimeSubmit()
{
  // get submit values 
  var page = document.getElementById('page').value;
  var index = document.getElementById('index').value;
  if (page == "home") pageViewUrl = "mydomain.com/home.php";
  if (page == "contact") pageViewUrl = "mydomain.com/contactus.php";
  if (page == "about") pageViewUrl = "mydomain.com/about.php";
  if (page == "support") pageViewUrl = "mydomain.com/support.php";
  if (page == "product")
  {
    pageViewUrl = "mydomain.com/products.php";   
    if (index && (index.length > 0)) pageViewUrl += "?productid=" + index;
  }
  if (page == "services") 
  {
    pageViewUrl = "mydomain.com/services.php";   
    if (index && (index.length > 0)) pageViewUrl += "?serviceid=" + index;
  }
  if (page == "partners") 
  {
    pageViewUrl = "mydomain.com/partners.php";   
    if (index && (index.length > 0)) pageViewUrl += "?partnerid=" + index;
  }
  pageViewRefresh = document.getElementById('pageviewrefresh').value;
  if ( !pageViewRefresh || (pageViewRefresh == "")) pageViewRefresh = 5;
  pageViewLookback = document.getElementById('pageviewlookback').value;
  if ( !pageViewLookback || (pageViewLookback == "")) {
    pageViewLookback = (new Date().getTime()/1000) - 3600;
  }  else {
    pageViewLookback = (new Date().getTime()/1000) - 3600 * pageViewLookback;
  }

  // set from values  
  document.getElementById('page').value = page;
  document.getElementById('index').value = index;
  document.getElementById('pageviewrefresh').value = pageViewRefresh;
  var lookback = document.getElementById('pageviewlookback').value;
  document.getElementById('pageviewlookback').value = lookback;
  pageViewInterval = lookback;
    
  // draw chart
  DrawPageViewTimeChart();
  setInterval(DrawPageViewTimeChart, pageViewRefresh * 1000);
}
