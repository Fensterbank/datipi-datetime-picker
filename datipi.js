/*
 The MIT License (MIT)

 Copyright (c) 2015 Frédéric Bolvin | https://github.com/Fensterbank

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
(function () {
  var datipi = function (inputField) {
    var currentDateTime,
        container, btnPreviousMonth, btnNextMonth, headline, calendar, clock, hours, minutes,
        style,
        months, weekdays;

    /**
     * Pad a given number below 10 with a preceding zero
     * @param number
     * @returns {string}
     */
    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = '0' + r;
      }
      return r;
    }

    /**
     * Reset the picker by preparing elements without recreating all new
     * Is called, when the same picker is opened more than once
     */
    function reset() {
      clock.style.display = 'none';
      container.style.display = 'block';
      calendar.classList.remove('datipi-circle-hidden');
      calendar.style.display = 'block';
      btnPreviousMonth.style.display = 'inline-block';
      btnNextMonth.style.display = 'inline-block';
      if (hours != null) {
        hours.setAttribute('style', '');
        hours.className = 'datipi-circle-selector datipi-hours';
      }
      if (minutes != null) {
        minutes.setAttribute('style', '');
        minutes.className = 'datipi-minutes datipi-circle-hidden';
      }
      initCalendar();
    }

    /**
     * Initialize the main container with its elements
     */
    function initContainer() {
      // If the container already exists, make the needed elements visible
      if (container != null) {
        reset();
        return;
      }

      container = document.createElement('div');
      container.className = 'datipi-container';

      // Header containing headline and buttons
      var head = document.createElement('div');
      head.className = 'datipi-head';

      // Button left
      btnPreviousMonth = document.createElement('div');
      btnPreviousMonth.className = 'datipi-switch';
      btnPreviousMonth.innerHTML = '◀';
      btnPreviousMonth.addEventListener('click', onPreviousMonth);

      // Headline containing text, e.g. current month
      headline = document.createElement('div');
      headline.className = 'datipi-headline';

      // Button right;
      btnNextMonth = document.createElement('div');
      btnNextMonth.className = 'datipi-switch';
      btnNextMonth.innerHTML = '▶';
      btnNextMonth.addEventListener('click', onNextMonth);

      // Calendar container for month selection
      calendar = document.createElement('div');
      calendar.className = 'datipi-calendar datipi-circle-selector';

      // Clock container for time selection
      clock = document.createElement('div');
      clock.className = 'datipi-clock';

      // Fill the calendar with the current month days
      initCalendar();

      // Append all childs to DOM
      head.appendChild(btnPreviousMonth);
      head.appendChild(headline);
      head.appendChild(btnNextMonth);

      container.appendChild(head);
      container.appendChild(calendar);
      container.appendChild(clock);

      inputField.parentElement.appendChild(container);
    }

    /**
     * Initialize the calendar with the current date, create and render all day picker elements
     * Is called on each month change
     */
    function initCalendar() {
      var firstDayOfMonth = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), 1);
      var lastDayOfMonth = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth() + 1, 0);

      // Set headline content
      headline.innerHTML = formatDate(currentDateTime, 'headline');

      // Create elements for calendar
      var table = document.createElement('table')
      var thead = document.createElement('thead');
      var headRow = document.createElement('tr');

      // Fill header row with weekdays
      weekdays.forEach(function (weekDay) {
        var cell = document.createElement('th');
        cell.innerHTML = weekDay;
        headRow.appendChild(cell);
      });

      var tbody = document.createElement('tbody');

      // Calculate the first rendered day of the current view.
      // We always begin with a sunday, which can be before first day of month
      var firstDayOfCalendar = new Date(firstDayOfMonth);
      while (firstDayOfCalendar.getDay() != 0) {
        firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - 1);
      }

      // Fill the calendar month with elements
      var currentRenderDate = new Date(firstDayOfCalendar);
      var i = 0;
      var row = document.createElement('tr');
      var current = formatDate(currentDateTime, 'date');
      var cell;

      while (currentRenderDate <= lastDayOfMonth) {
        if (i == 7) {
          i = 0;
          tbody.appendChild(row);
          row = document.createElement('tr');
        }
        var currentString = formatDate(currentRenderDate, 'date');

        cell = document.createElement('td');
        cell.innerHTML = currentRenderDate.getDate().toString();
        // This is the selected date. Mark it
        if (currentString == current) {
          cell.classList.add('selected');
        }
        // The day is not in the current month. Mark it
        if (currentRenderDate.getMonth() != lastDayOfMonth.getMonth()) {
          cell.classList.add('outerMonth');
        }
        cell.setAttribute('data-date' , currentString);
        cell.addEventListener('click', onDateSelect);

        row.appendChild(cell);

        // Prepare next step
        currentRenderDate.setDate(currentRenderDate.getDate() + 1);
        i++;
      }

      // Each row should have the same amount of cells.
      // Create empty cells if needed.
      for (i; i < 7; i++) {
        cell = document.createElement('td');
        cell.innerHTML = '&nbsp;';
        row.appendChild(cell);
      }
      tbody.appendChild(row);

      thead.appendChild(headRow);
      table.appendChild(thead);
      table.appendChild(tbody);

      // Clear calendar and add new table
      calendar.innerHTML = '';
      calendar.appendChild(table);
    }

    /**
     * Initialize the clock with the selectable tick elements
     * Must be called only once
     */
    function initClock() {
      if (clock.children.length > 0)
        return;

      // ToDo: Calculate this somehow
      var clockHours = {
        '00': { left: '87px', top: '7px' },
        '1': { left: '114px', top: '40.2346px', bigger: true },
        '2': { left: '133.765px', top: '60px', bigger: true },
        '3': { left: '141px', top: '87px', bigger: true },
        '4': { left: '133.765px', top: '114px', bigger: true },
        '5': { left: '114px', top: '133.765px', bigger: true },
        '6': { left: '87px', top: '141px', bigger: true },
        '7': { left: '60px', top: '133.765px', bigger: true },
        '8': { left: '40.2346px', top: '114px', bigger: true },
        '9': { left: '33px', top: '87px', bigger: true },
        '10': { left: '40.2346px', top: '60px', bigger: true },
        '11': { left: '60px', top: '40.2346px', bigger: true },
        '12': { left: '87px', top: '33px', bigger: true },
        '13': { left: '127px', top: '17.718px'},
        '14': { left: '156.282px', top: '47px'},
        '15': { left: '167px', top: '87px'},
        '16': { left: '156.282px', top: '127px'},
        '17': { left: '127px', top: '156.282px'},
        '18': { left: '87px', top: '167px'},
        '19': { left: '47px', top: '156.282px'},
        '20': { left: '17.718px', top: '127px'},
        '21': { left: '7px', top: '87px'},
        '22': { left: '17.718px', top: '47px'},
        '23': { left: '47px', top: '17.718px'}
      };

      // ToDo: Calculate this somehow
      var clockMinutes = {
        '00': { left: '87px', top: '7px', bigger: true },
        '05': { left: '127px', top: '17.718px', bigger: true },
        '10': { left: '156.282px', top: '47px', bigger: true },
        '15': { left: '167px', top: '87px', bigger: true },
        '20': { left: '156.282px', top: '127px', bigger: true },
        '25': { left: '127px', top: '156.282px', bigger: true },
        '30': { left: '87px', top: '167px', bigger: true },
        '35': { left: '47px', top: '156.282px', bigger: true },
        '40': { left: '17.718px', top: '127px', bigger: true },
        '45': { left: '7px', top: '87px', bigger: true },
        '50': { left: '17.718px', top: '47px', bigger: true },
        '55': { left: '47px', top: '17.718px', bigger: true }
      };


      // Create hours container
      hours = document.createElement('div');
      hours.setAttribute('style', '');
      hours.className = 'datipi-circle-selector datipi-hours';
      fillTickElements(hours, clockHours, onHourTickSelect);

      // Create minutes container
      minutes = document.createElement('div');
      minutes.setAttribute('style', '');
      minutes.className = 'datipi-minutes datipi-circle-hidden';
      fillTickElements(minutes, clockMinutes, onMinutesTickSelect);

      // Clear clock and append child elements
      clock.innerHTML = '';
      clock.appendChild(hours);
      clock.appendChild(minutes);
    }

    /**
     * Initialize all language strings in current user language (if possible)
     * ToDo: Make it support more languages!
     */
    function initLanguage() {
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    }

    /**
     * Formats the date in different formats using format keyword
     * @param dateTime
     * @param format
     * @returns {string}
     */
    function formatDate(dateTime, format) {
      switch (format) {
        case 'headline':
          return months[dateTime.getMonth()] + ' ' + dateTime.getFullYear();
        case 'date':
          return dateTime.getFullYear() + '-' + pad(dateTime.getMonth() + 1) + '-' + pad(dateTime.getDate());
        case 'full':
          return dateTime.getFullYear() + '-' + pad(dateTime.getMonth() + 1) + '-' + pad(dateTime.getDate()) + ' ' + pad(dateTime.getHours()) + ':' + pad(dateTime.getMinutes());
      }
    }

    /**
     * Fill the given container with tick elements predefined in the given dictionary and append event listener
     * @param container
     * @param dictionary
     * @param clickCallback
     */
    function fillTickElements(container, dictionary, clickCallback) {
      var num, obj, elem;
      for (num in dictionary) {
        obj = dictionary[num];
        elem = document.createElement('div');
        elem.innerHTML = num;
        elem.setAttribute('style', 'top:' + obj.top + ';left:' + obj.left);
        elem.classList.add('datipi-tick');
        if (obj.bigger) {
          elem.classList.add('datipi-bigger');
        }

        if (clickCallback != null) {
          elem.addEventListener('click', clickCallback);
        }
        container.appendChild(elem);
      }
    }

    /**
     * Set the input field value to the current selected date and time
     */
    function updateInputValue() {
      inputField.value = formatDate(currentDateTime, 'full');
    }

    /**
     * ######################################################################
     * EVENTS
     */

    /**
     * Is called, when the input field gets focus
     */
    function onInputFocus(event) {
      // Only do something, if picker isn't opened
      if (container == null || container.style.display != 'block') {
        var val = inputField.value;
        if (val == null || val == '') {
          currentDateTime = new Date();
        } else {
          // Try to parse the input field value as a predefined current datetime value
          try {
            val = val.replace(' ', 'T');
            var parts = val.split('T');
            if (parts[parts.length - 1].split(':').length == 2) {
              val += ':00';
            }
            currentDateTime = new Date(val);
          } catch (e) {
            currentDateTime = new Date();
          }
        }

        // Initialize the container with the current month
        initContainer();

        var rect = this.getBoundingClientRect();
        container.style.position = 'absolute';
        container.style.top = (rect.top + rect.height) + 'px';
        container.style.left = rect.left + 'px';
      }

      // The outside click event should not occur
      event.stopPropagation();
    }

    /**
     * Is called, when a day is selected. Next step is to select an hour value
     */
    function onDateSelect(event) {
      // Initialize the clock, if not already done
      initClock();

      var dateArray = this.getAttribute('data-date').split('-');
      currentDateTime.setFullYear(parseInt(dateArray[0]), parseInt(dateArray[1])-1, parseInt(dateArray[2]));

      btnPreviousMonth.style.display = 'none';
      btnNextMonth.style.display = 'none';
      calendar.classList.add('datipi-circle-hidden');

      window.setTimeout(function () {
        calendar.style.display = 'none';
        headline.innerHTML = 'Select Hour';
        clock.style.display = 'block';
      }, 350);

      updateInputValue();

      // The outside click event should not occur
      event.stopPropagation();
    }

    /**
     * Is called, when a hour is selected. Next step is to select a minute value.
     */
    function onHourTickSelect(event) {
      headline.innerHTML = 'Select Minutes';
      var parent = this.parentElement;
      currentDateTime.setHours(parseInt(this.innerHTML));
      updateInputValue();

      parent.classList.add('datipi-circle-hidden');

      minutes.classList.remove('datipi-circle-hidden');
      minutes.classList.add('datipi-circle-selector');
      window.setTimeout(function () {
        parent.style.display = 'none';
        minutes.style.visibility = 'visible';
      }, 350);

      // The outside click event should not occur
      event.stopPropagation();
    }

    /**
     * Is called, when a minute is selected. Last step, close the container and update the text box
     */
    function onMinutesTickSelect(event) {
      currentDateTime.setMinutes(parseInt(this.innerHTML));
      container.style.display = 'none';
      updateInputValue();

      // The outside click event should not occur
      event.stopPropagation();
    }

    /**
     * Is called, when the left button is clicked
     */
    function onPreviousMonth(event) {
      currentDateTime.setMonth(currentDateTime.getMonth() - 1);
      initCalendar();

      // The outside click event should not occur
      event.stopPropagation();
    }

    /**
     * Is called, when the right button is clicked
     */
    function onNextMonth(event) {
      currentDateTime.setMonth(currentDateTime.getMonth() + 1);
      initCalendar();

      // The outside click event should not occur
      event.stopPropagation();
    }

    function onDocumentClick(e) {
      if (container != null) {
        var target = (e && e.target) || (event && event.srcElement);
        var display = 'none';

        while (target.parentNode) {
          if (target == container || target == inputField) {
            display = 'block';
            break;
          }
          target = target.parentNode;
        }
        container.style.display = display;
      }
    }

    /**
     * ######################################################################
     * CONSTRUCTOR
     */
    initLanguage();

    if (inputField.tagName != 'INPUT')
      throw 'Error! Only input fields are allowed as date time picker.';

    // Event handlers
    document.addEventListener('click', onDocumentClick);
    inputField.addEventListener('focus', onInputFocus);
  };

  // Initiate DaTiPi input fields when DOM is ready
  if (document.readyState != 'loading'){
    initElements();
  } else {
    document.addEventListener('DOMContentLoaded', initElements);
  }

  function initElements() {
    var elements = document.querySelectorAll('input.datipi');
    for (var i = 0; i < elements.length; i++) {
      new DATIPI(elements[i]);
    }
  }

  window.DATIPI = datipi;
})();