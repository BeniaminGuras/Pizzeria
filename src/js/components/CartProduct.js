import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.element = element; 
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element){
    const thisCartProduct = this; 
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element; 
    thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    thisCartProduct.dom.input = thisCartProduct.dom.amountWidgetElem.querySelector('input');
  }

  initAmountWidget(){
    const thisCartProduct = this; 
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
    thisCartProduct.amountWidget.value = thisCartProduct.amount;
    thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.correctValue;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove(){
    const thisCartProduct = this; 

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this; 
    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault;
    });

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault;
      thisCartProduct.remove();
    });
  }

  getData(){
    const thisCartProduct = this; 
    const productData = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params
    };
    return productData;
  }
}

export default CartProduct;