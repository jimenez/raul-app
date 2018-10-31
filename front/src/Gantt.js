/*global gantt*/
import React, { Component } from 'react';
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

export default class Gantt extends Component {
  setZoom(value){
    switch (value){
      case 'Days':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "#%W";
        gantt.config.subscales = [
          {unit: "day", step: 1, date: "%d"}
        ];
        gantt.config.scale_height = 60;
        break;
      case 'Months':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%F";
        gantt.config.scale_height = 60;
        gantt.config.subscales = [
          {unit:"week", step:1, date:"#%W"}
        ];
        break;
      case 'Years':
        gantt.config.min_column_width = 70;
        gantt.config.scale_unit = "year";
        gantt.config.date_scale = "%Y";
        gantt.config.scale_height = 60;
        gantt.config.subscales = [
          {unit:"month", step:1, date:"#%m"}
        ];
        break;
      default:
        break;
    }
  }

  shouldComponentUpdate(nextProps ){
    return this.props.zoom !== nextProps.zoom;
  }

  componentDidUpdate() {
    gantt.render();
  }

  initGanttEvents() {
    if(gantt.ganttEventsInitialized){
      return;
    }
    gantt.ganttEventsInitialized = true;

    gantt.attachEvent('onAfterTaskAdd', (id, task) => {
      if(this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, 'inserted', task);
      }
    });

    gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
      if(this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, 'updated', task);
      }
    });

    gantt.attachEvent('onAfterTaskDelete', (id) => {
      if(this.props.onTaskUpdated) {
        this.props.onTaskUpdated(id, 'deleted');
      }
    });

    gantt.attachEvent('onAfterLinkAdd', (id, link) => {
      if(this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, 'inserted', link);
      }
    });

    gantt.attachEvent('onAfterLinkUpdate', (id, link) => {
      if(this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, 'updated', link);
      }
    });

    gantt.attachEvent('onAfterLinkDelete', (id, link) => {
      if(this.props.onLinkUpdated) {
        this.props.onLinkUpdated(id, 'deleted');
      }
    });
  }
  
  componentDidMount() {
    this.initGanttEvents();
    //default columns definition
    gantt.config.columns = [
	{name:"text",       label:"Medications", align:"left", tree:false },
	{name:"start_date", label:"Start time", align:"center" },
	{name:"duration",   label:"Duration",   align:"center" }
    ];
    gantt.init(this.ganttContainer);

    function createBox(sizes, class_name) {
	var box = document.createElement('div');
	box.style.cssText = [
	    "height:" + sizes.height + "px",
	    "line-height:" + sizes.height + "px",
	    "width:" + sizes.width + "px",
	    "top:" + sizes.top + 'px',
	    "left:" + sizes.left + "px",
	    "position:absolute"
	].join(";");
	box.className = class_name;
	return box;
    }

      gantt.templates.grid_row_class = gantt.templates.task_class = function (start, end, task) {
	  var css = [];
	  if (gantt.hasChild(task.id)) {
	      css.push("task-parent");
	  }
	  if (!task.$open && gantt.hasChild(task.id)) {
	      css.push("task-collapsed");
	  }

	  return css.join(" ");
      };

      gantt.addTaskLayer(function show_hidden(task) {
	  if (!task.$open && gantt.hasChild(task.id)) {
	      var sub_height = gantt.config.row_height - 5,
		  el = document.createElement('div'),
		  sizes = gantt.getTaskPosition(task);

	      var sub_tasks = gantt.getChildren(task.id);

	      var child_el;

	      for (var i = 0; i < sub_tasks.length; i++) {
		  var child = gantt.getTask(sub_tasks[i]);
		  var child_sizes = gantt.getTaskPosition(child);

		  child_el = createBox({
		      height: sub_height,
		      top: sizes.top,
		      left: child_sizes.left,
		      width: child_sizes.width
		  }, "child_preview gantt_task_line");
		  child_el.innerHTML = child.text;
		  el.appendChild(child_el);
	      }
	      return el;
	  }
	  return false;
      });
      gantt.parse(this.props.tasks);
  }

  render() {
    this.setZoom(this.props.zoom);

    return (
        <div
            ref={(input) => { this.ganttContainer = input }}
            style={{width: '100%', height: '100%'}}
        ></div>
    );
  }
}