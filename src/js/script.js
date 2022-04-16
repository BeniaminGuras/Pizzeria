/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };
  
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
      

      console.log('this product', thisProduct);
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
        console.log('activeProduct to: ', activeProduct);
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;
      console.log('initOrderForm:');
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
      });
    }

    processOrder(){
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
    
      let price = thisProduct.data.price;
    
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        console.log('paramId', paramId, param);
        
        for(let optionId in param.options) {
          const option = param.options[optionId];
          console.log(optionId, option);
          const selector = '.' + paramId + '-' + optionId; 
          console.log('selector', selector);

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
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this; 
      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments', element);
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
      console.log('klikniete');
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
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this; 
      thisCart.products = [];
      thisCart.getElements(element);
      console.log('thisCart', thisCart);
      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    initActions(){
      const thisCart = this; 
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        this.closest(select.containerOf.cart).classList.toggle(classNames.cart.wrapperActive);
      });
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data ', thisApp.data);
    
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this; 
      thisApp.data = dataSource; 
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      console.log('to jest cartElem', cartElem);
      thisApp.cart =  new Cart(cartElem);
    },
    
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}

