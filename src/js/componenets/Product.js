import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder(); 
  }

  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
      
    thisProduct.accordionTrigger.addEventListener('click', function(event){
      event.preventDefault;
      const activeProduct = document.querySelector('.product.active');
      if(activeProduct != null && activeProduct != thisProduct.element){
        activeProduct.classList.remove('active');
      }
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    
    let price = thisProduct.data.price;
    
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
        
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const selector = '.' + paramId + '-' + optionId; 

        if(thisProduct.imageWrapper.querySelector(selector) != null){
          thisProduct.imageWrapper.querySelector(selector).classList.remove(classNames.menuProduct.imageVisible);
          if(formData[paramId].includes(optionId)){
            thisProduct.imageWrapper.querySelector(selector).classList.add(classNames.menuProduct.imageVisible);
          }
        }
          
        if(formData[paramId] && formData[paramId].includes(optionId)){
          if(!option.hasOwnProperty('default')) {
            price = price + option.price;
          }
        } else {
          if(option.hasOwnProperty('default')){
            price = price - option.price;
          }
        }
      }
    }
    thisProduct.priceSingle = price; 
    price *= thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = price;
  }
    
  initAmountWidget(){
    const thisProduct = this; 
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle; 
    productSummary.price = thisProduct.priceSingle * productSummary.amount;
    productSummary.params = thisProduct.prepareCartProductParams();
    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;
    const cartParams = {};
    const formData = utils.serializeFormToObject(thisProduct.form);
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      cartParams[paramId] = {};
      cartParams[paramId].label = param.label;
      cartParams[paramId].options = {};
      for(let optionId in param.options){
        if(formData[paramId] && formData[paramId].includes(optionId)){
          cartParams[paramId].options[optionId] = param.options[optionId].label;
        }
      }
    }
    return cartParams;
  }
}

export default Product;