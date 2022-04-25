import AmountWidget from './AmountWidget.js';
import {templates, select} from '../settings.js';
import {utils} from '../utils.js';

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
  }

  initWidgets(){
    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);

    this.dom.peopleAmount.addEventListener('updated', function(){});
    this.dom.hoursAmount.addEventListener('updated', function(){});
  }
}

export default Booking;