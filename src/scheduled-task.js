'use strict';

var tzOffset = require('tz-offset');

module.exports = (() => {

  /**
   * Creates a new scheduled task.
   *
   * @param {Task} task - task to schedule.
   * @param {*} options - task options.
   */
  function ScheduledTask(task, options) {
    var timezone = options.timezone;

    task.on('started', () => {
      this.status = 'running';
    });

    task.on('done', () => {
      this.status = 'waiting';
    });

    task.on('failed', () => {
      this.status = 'failed';
    });

    this.task =  () => {
      var date = new Date();
      if(timezone){
        date = tzOffset.timeAt(date, timezone);
      }
      this.tick = setTimeout(this.task.bind(this), 
        1000 - date.getMilliseconds());
      task.update(date);
    };

    this.tick = null;

    if (options.scheduled !== false) {
      this.start();
    }
  }

  /**
   * Starts updating the task.
   *
   * @returns {ScheduledTask} instance of this task.
   */
  ScheduledTask.prototype.start = () => {
    this.status = 'scheduled';
    if (this.task && !this.tick) {
      this.tick = setTimeout(this.task.bind(this), 1000);
    }

    return this;
  };

  /**
   * Stops updating the task.
   *
   * @returns {ScheduledTask} instance of this task.
   */
  ScheduledTask.prototype.stop = () => {
    this.status = 'stoped';
    if (this.tick) {
      clearTimeout(this.tick);
      this.tick = null;
    }

    return this;
  };


  ScheduledTask.prototype.getStatus = () => {
    return this.status;
  }

  /**
   * Destroys the scheduled task.
   */
  ScheduledTask.prototype.destroy = () => {
    this.stop();
    this.status = 'destroyed';

    this.task = null;
  };

  return ScheduledTask;
}());
