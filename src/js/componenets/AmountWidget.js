import {select, settings} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this; 
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.widgetActions();
  }
  getElements(element){
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
    if(newValue !== thisWidget.value && !isNaN(newValue)){
      if(newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
    }
    thisWidget.input.value = thisWidget.value;
  } 

  widgetActions(){
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function(){thisWidget.setValue(thisWidget.input.value);});
    thisWidget.linkDecrease.addEventListener('click', function(){thisWidget.setValue(thisWidget.input.value - 1);});
    thisWidget.linkIncrease.addEventListener('click', function(){thisWidget.setValue(parseInt(thisWidget.input.value)+1);});
  }

  announce(){
    const thisWidget = this; 
    const event = new Event('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;