import AmountWidget from './AmountWidget.js';
import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element) {
    this.render(element);
    this.initActions();
    this.initWidgets();
    this.getData();
  }

  getData(){
    const thisBooking = this; 
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateParam =  settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);
    const params = {
      booking: [startDateParam,
        endDateParam,
      ],
      eventsCurrent: [settings.db.notRepeatParam,
        startDateParam,
        endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };
    
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this; 

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let i = startHour; i < startHour + duration; i += 0.5){
      if(typeof thisBooking.booked[date][i] == 'undefined'){
        thisBooking.booked[date][i] = [];
      }
      thisBooking.booked[date][i].push(table);
    }
    thisBooking.updateDOM;
    thisBooking.restartSelected();
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.correctValue;
    console.log(thisBooking.booked);
    thisBooking.hour = utils.hourToNumber(thisBooking.timePicker.correctValue);
    
    let allAvailable = false; 

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      }else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    this.dom = {};
    this.dom.wrapper = element;
    const generatedHTML = templates.bookingWidget();
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    this.dom.wrapper.appendChild(generatedDOM);
    this.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    this.dom.time = document.querySelector(select.widgets.amount.hourPicker.wrapper);
    this.dom.datePicker = element.querySelector(select.widgets.amount.datePicker.wrapper);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    this.dom.tableWrapper = this.dom.wrapper.querySelector(select.booking.floorPlan);
    this.dom.starters = this.dom.wrapper.querySelectorAll(select.booking.starters);
    this.dom.phone = this.dom.wrapper.querySelector(select.booking.phone);
    this.dom.address = this.dom.wrapper.querySelector(select.booking.address);
    this.dom.confrimationButton = this.dom.wrapper.querySelector(select.booking.submit);
  }

  initWidgets(){
    const thisBooking = this;
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.timePicker = new HourPicker(this.dom.time);
    this.datePicker = new DatePicker(this.dom.datePicker);

    this.dom.peopleAmount.addEventListener('updated', function(){});
    this.dom.hoursAmount.addEventListener('updated', function(){});

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.restartSelected();
    });
    
   
  }

  selectTable(table){
    const thisBooking = this; 
    
    thisBooking.activeTable = '';
    thisBooking.activeTable = (table.getAttribute('data-table'));
    
    for(let table of this.dom.tables){
      if(thisBooking.activeTable != table.getAttribute('data-table')){
        table.classList.remove(classNames.booking.tableReadyToBeBooked);
      }
    }
    table.classList.toggle(classNames.booking.tableReadyToBeBooked);
  }
  
  restartSelected(){
    const thisBooking = this;
    for(let table of this.dom.tables){
      table.classList.remove(classNames.booking.tableReadyToBeBooked);
      thisBooking.activeTable = '';
    }
  }

  prepareReservation(){
    const thisBooking = this;
    thisBooking.summary = {};
    const listOfStarters = [];

    for(let starter of this.dom.starters){
      const element = starter.querySelector('input');
      if(element.checked){
        listOfStarters.push(element.getAttribute('value'));
      }
    }

    thisBooking.summary.date = thisBooking.datePicker.correctValue;
    thisBooking.summary.hour = thisBooking.timePicker.correctValue;
    thisBooking.summary.duration  = thisBooking.hoursAmount.correctValue;
    thisBooking.summary.people = thisBooking.peopleAmount.correctValue;
    thisBooking.summary.table = parseInt(thisBooking.activeTable);
    thisBooking.summary.phone = this.dom.phone.value;
    thisBooking.summary.address = this.dom.address.value;
    thisBooking.summary.starters = listOfStarters;
    return thisBooking.summary; 
  }

  initActions(){
    const thisBooking = this; 

    this.dom.tableWrapper.addEventListener('click', function(event){
      const clicked = event.target;
      const classOfClicked = clicked.getAttribute('class');
      if(classOfClicked.indexOf('table') != -1){
        if(classOfClicked.indexOf('booked') == -1){
          thisBooking.selectTable(clicked);
        } else {
          alert('Ten stolik jest zajety');
        }
      }
    });

    this.dom.confrimationButton.addEventListener('click', function(event){
      event.preventDefault();
      const url = settings.db.url + '/' + settings.db.booking;
      const payload = thisBooking.prepareReservation();

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options)
        .then(function(){console.log(thisBooking.summary.table);})
        .then(thisBooking.makeBooked(thisBooking.summary.date, thisBooking.summary.hour, thisBooking.summary.duration, thisBooking.summary.table))
        .then(thisBooking.updateDOM());
    });
  }
}

export default Booking;