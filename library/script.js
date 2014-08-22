var client = new Dropbox.Client({key: 'j37v18c5tdi8xu4'});

//have this happen first thing... ? 
client.authenticate();
  
  // Client is authenticated. Display UI.
  if (client.isAuthenticated()) {

    var datastoreManager = client.getDatastoreManager();
    datastoreManager.openDefaultDatastore(function (error, datastore) {
      
      if (error) {
        alert('Error opening default datastore: ' + error);
      }

      //store the entire datastore's table's tasks. 
      var taskTable = datastore.getTable('tasks');
      
      //query all active items. 
      var results = taskTable.query({completed:false});

      //query each subsection by horizon attribute. 
      var list = taskTable.query({horizon: 'listed', completed:false});
      var action = taskTable.query({horizon: 'action', completed:false});
      var project = taskTable.query({horizon: 'project', completed:false});
      var focus = taskTable.query({horizon: 'focus', completed:false});
      var goal = taskTable.query({horizon: 'goal', completed:false});
      var vision = taskTable.query({horizon: 'vision', completed:false});
      var wait = taskTable.query({horizon: 'wait', completed:false});
      var someday = taskTable.query({horizon: 'someday', completed:false});
      //var done2 = taskTable.query({horizon: 'done'});//why done and completed?

      //scrolling smoothness.
      $('#server').click(function(){
        $('html, body').animate({
          scrollTop: $(document.activeElement).offset().top - 200
        }, 2000);
      });

      //shift t to send an action item via Twilio API to my phone. 
      $("#search2").bind('keydown', function(e) {
        
        //press cmd-T 
        if (e.ctrlKey && e.keyCode == 84) {

          //store the text value of the first item in the list.
          var seek = $("#search2").next().children('li').first().text();
          
          //split and store the text only. 
          if(seek[0] === '('){ 
            var indexes = seek.indexOf(')')
            indexes = indexes + 1
            seek = seek.substring(indexes,seek.length);
          };

          //store the query for that task name. //will the split be a problem???
          var results = taskTable.query({taskname: seek});

          //set the horizon as done.
          results[0].set('horizon', 'done');

          //store the ajax request to the endpoint /sendmessage.
          var request = $.ajax({
            url: "/sendmessage",
            type: "POST",
            data: seek,
          });

          //delete the list item from the dom.
          $(document.activeElement).next().children('li').first().remove();
        
        };
      });

      //append the inbox list items to the dom.
      for (var k=0; k<list.length;k++ ) {
        $("#list").append( "<li>"+list[k].get("taskname") + "</li>");
      };

      //append the action and number to the dom. Asyc.
      function actionpop() {

        for (var k=0; k<action.length;k++ ) {

          //in function first
          var actionName = function(){
    
            actionName1 = action[k].get("taskname")
            return actionName1;
    
          }

          //in fuction second return.
          var depthName = function(callback){
    
            totalDepth = taskTable.query({taskname: callback()});
            depthName1 = totalDepth[0].get('depth');
            
            //if no number is assigned render it zero.
            if(depthName1 === null){
              depthName1 = 0;
            }
    
          }

          depthName(actionName);

          $("#actionVerb").append( "<li><span class='counter'>(" 
            + depthName1 +")</span>" 
            + actionName1 + "</li>");

        }
      
      };

      actionpop();

      //append all db items to projects div from the start.
      for (var k=0; k<project.length;k++ ) {
        $("#projects").append( "<li>"+project[k].get("taskname") + "</li>");
      };
      //append all db items to areas of focus div from the start.
      for (var k=0; k<focus.length;k++ ) {
        $("#aof").append( "<li>"+focus[k].get("taskname") + "</li>");
      };
      //append all db items to goals div from the start.
      for (var k=0; k<goal.length;k++ ) {
        $("#goals").append( "<li>"+goal[k].get("taskname") + "</li>");
      };
      //append all db items to vision div from the start.
      for (var k=0; k<vision.length;k++ ) {
        $("#vision").append( "<li>"+vision[k].get("taskname") + "</li>");
      };

      //append all db items to waiting div from the start.
      for (var k=0; k<wait.length;k++ ) {
        $("#waiting").append( "<li>"+wait[k].get("taskname") + "</li>");
      };
      //append all db items to someday div from the start.
      for (var k=0; k<someday.length;k++ ) {
        $("#someday").append( "<li>"+someday[k].get("taskname") + "</li>");
      };

      //append done items to the done list in the commented index.
      // for (var k=0; k<done.length;k++ ) {
      //   $("#done").append( "<li>"+done[k].get("projectname") + "</li>");
      //   $("#done").append( "<li>"+done[k].get("actionname") + "</li>");
      // };

      //a d3 circle:
      var svgContainer = d3.select("#progress").append("svg")
       .attr("width", 100)
       .attr("height", 100);

      var rectangle = svgContainer.append("rect")
        .attr("x", 10)
        .attr("y", 0)
        .attr("width", 50)
        .attr("height", 100);

      //new stuff.
      var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
                 { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
                 { "x": 80,  "y": 5},  { "x": 100, "y": 60}];


                 $("body").click(function(){
                  lineData.push({"x": 20, "y": 10});
                 })

      //This is the accessor function we talked about above
      var lineFunction = d3.svg.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })
                         .interpolate("linear");

      //The SVG Container
      var svgContainer = d3.select("#progress").append("svg")
                                          .attr("width", 200)
                                          .attr("height", 200);

      //The line SVG Path we draw
      var lineGraph = svgContainer.append("path")
                                  .attr("d", lineFunction(lineData))
                                  .attr("stroke", "blue")
                                  .attr("stroke-width", 2)
                              .attr("fill", "none");

      //d3 visualizatin data:
      var update = function(){
        var a = $('#list li').length;
        var b = $('#actionVerb li').length;
        var c = $('#projects li').length;
        var d = $('#aof li').length;
        var e = $('#goals li').length;
        var f = $('#vision li').length;
        var data1= [
            {"crimeType":"mip","totalCrimes":a},
            {"crimeType":"theft","totalCrimes":b},
            {"crimeType":"drugs","totalCrimes":c},
            {"crimeType":"larson","totalCrimes":d},
            {"crimeType":"homicide","totalCrimes":e},
            {"crimeType":"suicide","totalCrimes":f}
          ];
        return data1;
      };


      $("body").bind('keydown', function(e) {
         if(e.keyCode === 9){
  
             var item = $(document.activeElement).offset().top -100;
             $('body').animate({scrollTop : item},1000);

           }
        
        //d3 update
        if (e.keyCode) {
          change(update());
        }
      });

      //Doughnut Specs
      var width = 200,
          height = 200,
          radius = Math.min(width, height) / 2;
      var color = d3.scale.ordinal()
          .range(['#F3A911', '#FF6633', '#CC0055', '#31a354', '#1762ce', '#660099']);
      var arc = d3.svg.arc()
          .innerRadius(radius - 192)
          .outerRadius(radius - 200);
      var pie = d3.layout.pie()
          .sort(null)
          .value(function (d) {
            return d.totalCrimes;
          });

      var svg = d3.select("#doughnut").append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("id", "pieChart")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var path = svg.selectAll("path")
          .data(pie(update()))
          .enter()
          .append("path");

      path.transition()
          .duration(800)
          .attr("fill", function(d, i) { return color(i); })
          .attr("d", arc)
          .each(function(d) { this._current = d; }); // store the initial angles

      function change(data){
        path.data(pie(data));
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
      }

    function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }

    //toggle window panes. 
    $('body').bind('keydown', function(e) {
      if( e.keyCode == 186){
        e.preventDefault();

        $('.column').eq(2).slideToggle('slow')
        $('.column').eq(1).slideToggle('slow')

        $('.column').children()
        .not('#search2')
        .not('#actionVerb')
        .slideToggle('slow');

        document.getElementById('actionsInput').focus();
      }
    });

    //start the active element on search id.
    document.getElementById('search').focus();

    //inputID, keycode, divID
    var combined = [
      ['search',        76, '#list',       'listed'],
      ['search2',       65, '#actionVerb', 'action'],
      ['projectsInput', 80, '#projects',   'project'],
      ['aofInput',      70, '#aof',        'focus'],
      ['somedayInput',  83, '#someday',   'someday'],
      ['goalsInput',    71, '#goals',      'goal'],
      ['visionInput',   86, '#vision',     'vision'],
      ['waitingInput',  87, '#waiting',    'wait']
    ];

    //input, div coresponding
    var combinedAppend = [
      ['actionAttached', '#actionVerb', 'action'],
      ['aofAttached',    '#projects',   'project'],
      ['goalsAttached',  '#aof',        'focus'],
      ['visionAttached', '#goals',      'goal'],
      ['visionAttached', '#goals',      'goal']
    ];

    //import textarea
    $('#import').click(function() {
      var items = $('#newItems').val().split('\n');
      if(items == false){return false};
      $('#newItems').val('');
      _.each(items, function(item){
        
        //add to dp from importer
        $('#list').prepend('<li>' + item + '</li>');
        var firstTask = taskTable.insert({
          taskname: item,
          depth: 0,
          completed: false,
          horizon: 'listed',
          created: new Date()
        });
      });
    });

    //add new items into inbox
    $("#search").keyup(function (e) {
      var value = $(this).val();
      if(value == false){return false};
      if(e.keyCode == 13) {
        $(this).val('');
        $('#list').append('<li>' + value + '</li>');
        
        //add new record into dp
        var firstTask = taskTable.insert({
          taskname: value,
          depth: 0,
          completed: false,
          horizon: 'listed',
          created: new Date()
        });
        return false;
      }
    }).keyup();

    //insert each item respectively from any activeElement.
    $('body').bind('keydown', function(e) {
      var $currentInput = $(document.activeElement).attr('id');
      for(var i = 0; i < combined.length; i++) {
        if( $currentInput == combined[i][0]){

          for(var j = 0; j < combined.length; j++){
            if(e.ctrlKey && e.keyCode == combined[j][1]){

              var passed = $(combined[i][2]).children().first();
              var data = $(combined[i][2]).children().first().text();

              //****split and store the text only. 
              if(data[0] === '('){ 
                data = data.split(')')[1];
              };

              $(combined[j][2]).append(passed);
              //dp access to update horizon
              var results1 = taskTable.query({taskname: data, completed:false});
              results1[0].set('horizon', combined[j][3]);
              return false;
            }
          }
        }
      }
    });

    //verb highlighter
    function doWork() {
      repeater = setTimeout(doWork, 5000);
      $("#actionVerb li").each(function( index, elem ) {
        var string = $(this).html();
        console.log(string, elem, index, this);
        for(var i = 0; i < verb.length; i++){
          if(string.indexOf(verb[i]) != -1){
            console.log(this);
            if($("this > span").length < 1){
              console.log(this);
              $(this).html(string.replace(verb[i], '<span id="verbhighlighter">'+ verb[i] +'</span>'));
            }
          }
        }
      });
    }
    // doWork();

    //delete within each list on cmd-D.
    $("body").bind('keydown', function(e) {
      if (e.ctrlKey && e.keyCode == 68) {
        
        //store active element
        var doc = document.activeElement;

        //iterate through combined key arrays.
        for (var i = 0; i < combined.length; i++) {

          //if the active input id matches the combined key then.
          if($(doc).attr('id') == combined[i][0]){
            
            //store the first list item's text value.
            var data = $(combined[i][2]).children().first().text();
            
            //****split and store the text only. 
            if(data[0] === '('){ 
                // var indexes = data[2]
                // data = data.split(indexes)[1];
                var indexes = data.indexOf(')')
                indexes = indexes + 1
                data = data.substring(indexes,data.length);
                // data = data.split(data[indexes])[1];
                // data = data.split(')')[1];
                // data = data + ')';
            };

            //store the queried taskname stored as data.
            var results2 = taskTable.query({taskname: data});
            // console.log('deleted record', results2, data)
            results2[0].deleteRecord();
            $(combined[i][2]).children().first().remove();

            
          }
        }
        return false;
      }
    });

    //keydown observed.
    $('body').bind('keydown', function(e) {

      //store the active element.
      var activeInput = document.activeElement;
      var lengthen = 0;

      //iterate over the combined arrays.
      for (var i = 1; i < combined.length; i++) {
        
        //if the id of active input is the same as in combined then.
        if($(activeInput).attr('id') == combined[i][0]){

          //update variable to the length of that active id's list.
          lengthen = $(combined[i][2] + ' ' + 'li').length;

          //store the active input's input.
          var value = $('#' + combined[i][0]).val();
          var incrementor = 0;

          //press the return key.
          if (e.keyCode == 13) {
            
            //store the first list item's text value.
            var firstEl = $(combined[i][2]).children().first().text();
            
            //if first letter is a parens then split if off.
            if(firstEl[0] === '('){
              
              //split and store the text only. 
              firstEl = firstEl.split(')')[1];
            
            };
            


            //callback for async call to DB.
            function first (string) {

              //store the query results for first item's taskname.
              results3 = taskTable.query({taskname: firstEl});
              console.log(firstEl)//
              console.log(results3)//=> empty query
            };

            function second (callback) {
console.log(results3[0])
              //set name to the new input captured.
              results3[0].set('taskname', value);//not running... cannot read results3[0]?

              //set horizon to current list id.
              results3[0].set('horizon', combined[i][3]);

              //query and store this items depth, plus one.
              incrementor = results3[0].get('depth')+1;
              
              //set depth to this new number.
              results3[0].set('depth', incrementor);
            }

            second(first());

            //remove first list item from dom.
            $(combined[i][2]).children().first().remove();

            //grabs new input AND depth and appends it to bottom of list.
            $('<li><span class="counter">(' + incrementor + ')</span>' + 
              value + '</li>').appendTo(combined[i][2]).hide().fadeIn(1500);

            //clear form.
            $('#' + combined[i][0]).val('');
            
            //change color of last appended item to black.
            $(combined[i][2] + ' ' + 'li:eq(' + (lengthen-1) + ')').css('color', 'black');
          }

          else if (e.ctrlKey && e.keyCode == 78) { //next => n
            $('#' + combined[i][0]).val('');
            var contained = $(combined[i][2]).children().first().get();
            $(contained).appendTo(combined[i][2]).hide().fadeIn(8500);
            $(combined[i][2] + ' ' + 'li:eq(' + (lengthen-1) + ')').css('color', 'black');
            e.preventDefault();
          }
        }
      }

      //additional attached inputs
      for (var j = 0; j < combinedAppend.length; j++) {
        if($(activeInput).attr('id') == combinedAppend[j][0]){
          var connected = '#'+ combinedAppend[j][0];
          var connector = combinedAppend[j][1];
          var connectee = combinedAppend[j+1][1];
          var value2 = $(connected).val();

          //newone => enter
          if (e.keyCode == 13) {
            if(value2 == false){return false}
            $(connector).prepend('<li>' + value2 + '</li>');
            $(connector).children().first().hide().fadeIn(8500);
            $(connected).val('');
            
            e.preventDefault();

            //add new record into dp
            var firstTask = taskTable.insert({
              taskname: value2,
              completed: false,
              horizon: combinedAppend[j][2],
              created: new Date()
            })
            return false;
          }
          //delete => d
          else if (e.ctrlKey && e.keyCode == 68) {
            //removing from dp in other div
            var inputfirst = $(connectee).children().first().text();
            var inputresults = taskTable.query({taskname: inputfirst});
            inputresults[0].deleteRecord();

            $(connectee).children().first().remove();
            $(connectee).val('');
            return false;
          }
          //next => n
          else if (e.ctrlKey && e.keyCode == 78) {
            $(connectee).val('');
            var contained = $(connectee).children().first().get();
            $(connectee).append(contained);
            $(connectee).children().last().hide().fadeIn(8500);
            $(connectee).children().last().css('color', 'black');
            e.preventDefault();
            return false;
          }
        }
      }

    });
  });
};