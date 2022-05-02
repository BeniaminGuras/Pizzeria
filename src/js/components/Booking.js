import AmountWidget from './AmountWidget.js';
import {templates, select} from '../settings.js';
import {utils} from '../utils.js';
import DatePicker from './Classes_v2/DatePicker.js';
import HourPicker from './Classes_v2/HourPicker.js';

class Booking{
  constructor(element) {
    this.render(element);
    console.log(this);
    this.initWidgets();
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
  }

  initWidgets(){
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);
    this.timePicker = new HourPicker(this.dom.time);
    this.datePicker = new DatePicker(this.dom.datePicker);

    this.dom.peopleAmount.addEventListener('updated', function(){});
    this.dom.hoursAmount.addEventListener('updated', function(){});
  }
}

export default Booking;