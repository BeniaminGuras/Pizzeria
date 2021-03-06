import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    
    const idFromHash = window.location.hash.replace('#/', '');
    
    let pageMatchingHash = thisApp.pages[0].id; 

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this; 
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      });
    }
  },

  initBooking: function(){
    const wrapper = document.querySelector(select.containerOf.booking);
    new Booking(wrapper);
  },

  activatePage: function(pageId){
    const thisApp = this;

    // add class 'active' to matching pages, remove from non-matching
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },

  initMenu: function(){
    const thisApp = this;
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this; 
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    console.log(url);
      
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parasedResponse){
        thisApp.data.products = parasedResponse;
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart =  new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initCarousel: function(){
    const wrapper = document.querySelector('.carousel');
    // eslint-disable-next-line no-undef
    new Flickity(wrapper, {
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
    });
  },

  initActionsForHomeLinks: function(){
    const thisApp = this;
    const dom = {};
    dom.links = document.querySelector(select.home.linksOnHomePage);
    dom.links.addEventListener('click', function(event){
      event.preventDefault();
      const clicked = event.target;
      if(clicked.offsetParent.tagName == 'A'){
        const link = clicked.closest('a');
        let clickedAttribute = link.getAttribute('href');
        clickedAttribute = clickedAttribute.replace('#', '');
        for(let page of thisApp.pages){
          if(clickedAttribute == page.id){
            thisApp.activatePage(clickedAttribute);
          }
        }
      }
    });
  },
    
  init: function(){
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initBooking();
    thisApp.initCart();
    thisApp.initCarousel();
    thisApp.initActionsForHomeLinks();
  },

};

app.init();


