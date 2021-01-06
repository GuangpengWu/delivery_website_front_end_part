
"use strict";
/* global m */

var API_SERVER = "https://staging-delivery.herokuapp.com"; 

// Simple helper so we don't have to repeat the API_SERVER everywhere
// _ prefix to indicate it's a helper function
function _api(options) {
  let modifiedOptions = { ...options };
  modifiedOptions["url"] = API_SERVER + modifiedOptions["url"];
  return m.request(modifiedOptions);
}

var Api = {
  getRecipes: function () {
    return _api({
      method: "GET",
      url: "/recipe"
    });
  },
  getRecipe: function (id) {
    return _api({
      method: "GET",
      url: "/recipe/" + id
    });
  },
  addDelivery: function (delivery) {
    return _api({
      method: "POST",
      url: "/placeOrder",
      body: delivery
    });
  }
};

var ShoppingCartApi = {
  getShoppingCarts: function () {
    return _api({
      method: "GET",
      url: "/shoppingCart"
    });
  },
  getShoppingCart: function (id) {
    return _api({
      method: "GET",
      url: "/shoppingCart/" + id
    });
  },
  addItem: function (shoppingCart_id, food_id) {
    return _api({
      method: "POST",
      url: "/shoppingCart/addItem",
      body: {
        shoppingCartId: shoppingCart_id,
        foodId: food_id

      }
    })
  },
  deleteItem: function (shoppingCart_id, food_id) {
    return _api({
      method: "POST",
      url: "/shoppingCart/deleteItem",
      body: {
        shoppingCartId: shoppingCart_id,
        foodId: food_id
      }
    })
  }
};

var CustomerApi = {
  getCustomers: function () {
    return _api({
      method: "GET",
      url: "/customer"
    });
  },
  getCustomer: function (id) {
    return _api({
      method: "GET",
      url: "/customer/" + id
    });
  },

  getCustomerByName: function (name) {
    console.log(name);
    return _api({
      method: "GET",
      url: "/customerbyname/" + name
    });
  },

  createCustomer: function (customerName, password, email, phone, address) {
    return _api({
      method: "POST",
      url: "/customer/createCustomer",
      body: {
        customerName: customerName,
        password: password,
        email: email,
        phone: phone,
        address: address
      }
    })
  },

  updateCustomer: function(customer) {
    return _api({
      method: "PUT",
      url: "/customer/updateCustomer",
      body: customer
    })
  }
};

var RestaurantApi = {
  getRestaurants: function () {
    return _api({
      method: "GET",
      url: "/restaurant"
    });
  },
  getRestaurant: function (id) {
    return _api({
      method: "GET",
      url: "/restaurant/" + id
    });
  }
};

var menu_id = 0;

// Begin ViewControllers
var DeliveriesController = {

  delivery: {},
  newDelivery: {},  // A new order placed by customers, contains Delivery information.
  addDelivery: function () {
    if (CustomerViewController.cur_customer == null) {
      alert("Please Sign In/Sign Up first.");
      m.route.set("/customer");
      
    }
    else if (ShoppingCartsViewController.foodsQuantity.size == 0) {
      alert("Your cart is empty! Get some food right now!");
      m.route.set("/restaurants");
    }
    else {
      this.newDelivery.shoppingCartId = CustomerViewController.cur_customer.shoppingCartId;
      this.newDelivery.customerId = CustomerViewController.cur_customer.id;
      // TODO: Mock restuarant id with menu.
      this.newDelivery.restaurantId = RestaurantViewController.cur_restaurant_id;
      console.log("adding order" + this.newDelivery);
      return Api.addDelivery(this.newDelivery).then(result => {
        this.delivery = result;
        console.log("delivery created: id: " + this.delivery.id);
        CustomerViewController.cur_customer.deliveries.push(this.delivery.id);
        CustomerViewController.updateCustomer();
        m.mount(document.getElementById("main"), OrderReceivedView);
  
      })
    }
  }
}

var ShoppingCartsViewController = {
  curr_shoppingCart_id: null,
  list: [],
  cart: [],
  foodsQuantity: {},
  loadShoppingCart: function (shoppingCart_id) {
    return ShoppingCartApi.getShoppingCart(shoppingCart_id).then(result => {
      console.log("Getting shopping cart details.");
      console.log("result:" + result);
      ShoppingCartsViewController.cart = result;
      console.log(ShoppingCartsViewController.cart[0].items);
      console.log(result);
      console.log("cart here " + ShoppingCartsViewController.cart[0]);
      ShoppingCartsViewController.foodsQuantity = new Map(Object.entries(ShoppingCartsViewController.cart[0].items));
    })
  },
  addItem: function (shoppingCart_id, food_id) {
    console.log("add one item right now.");
    return ShoppingCartApi.addItem(shoppingCart_id, food_id).then(result => {
      ShoppingCartsViewController.loadShoppingCart(shoppingCart_id);
      console.log("return shopping cart object without food details:" + result);
    })
  },
  deleteItem: function (shoppingCart_id, food_id) {
    console.log("delete one item right now.");
    return ShoppingCartApi.deleteItem(shoppingCart_id, food_id).then(result => {
      ShoppingCartsViewController.loadShoppingCart(shoppingCart_id);
      console.log("return shopping cart object without food details:" + result);
    })
  }
};

var CustomerViewController = {
  list: [],
  customers: {},
  cur_customer: null,
  loadCustomers: function () {
    return CustomerApi.getCustomers().then(result => {
      CustomerViewController.list = result;
    });
  },
  loadCustomer: function (customer_id) {
    return CustomerApi.getCustomer(customer_id).then(result => {
      console.log("Getting customer details.");
      console.log("result:" + result);
      CustomerViewController.cur_customer = result;
      CustomerViewController.customers[customer_id] = result;
      console.log(CustomerViewController.customers[customer_id]);
      console.log(CustomerViewController.customers);
    });
  },

  createCustomer: function(customerName, password, email, phone, address){
    return CustomerApi.createCustomer(customerName, password, email, phone, address).then(result => {
      CustomerViewController.cur_customer = result
    })
  },

  getCustomerByName: function (name) {
    return CustomerApi.getCustomerByName(name)
  }, 
  
  updateCustomer: function() {
    return CustomerApi.updateCustomer(this.cur_customer);
  }
};


var RestaurantViewController = {
  cur_restaurant_id: null,
  list: [],
  menus: [],

  loadRestaurants: function () {
    return RestaurantApi.getRestaurants().then(result => {
      RestaurantViewController.list = result;
    });
  },
  loadRestaurant: function (restaurant_id) {
    return RestaurantApi.getRestaurant(restaurant_id).then(result => {
      console.log(result);
    })
  },
  loadFoods: function (restaurant_id) {
    return RestaurantApi.getRestaurant(restaurant_id).then(result => {
      RestaurantViewController.menus = result.foods;
      this.cur_restaurant_id = result.id;
    })
  }

};


// End ViewControllers
// Begin Views

var CheckoutView = {
  title: "Checking out",
  oninit: function () {
    return "dummy"
  },
  view: function () {
    return [
      m("div", { class: "header" }, [
        m("h1", "Mockery Shopping Cart"),
        m("h2", "checkout")
      ]),
      m(
        "div",
        { class: "content" }, [
        m("h3", "ShoppingCart " + ShoppingCartsViewController.cart[0].id),
        m("h4", "Total Price " + ShoppingCartsViewController.cart[0].totalPrice / 100),
        m("form", {
          class: "pure-form pure-form-aligned",
          onsubmit: function (e) {
            e.preventDefault()
            DeliveriesController.addDelivery()
          }
        }, [
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "address"),
          m("input.input[type=text][placeholder=address]", {
            oninput: function (e) { DeliveriesController.newDelivery.address = e.target.value },
            value: DeliveriesController.newDelivery.address
          })]),
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "phone"),
          m("input.input[placeholder=phone]", {
            oninput: function (e) { DeliveriesController.newDelivery.phone = e.target.value },
            value: DeliveriesController.newDelivery.phone
          })]),
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "instruction"),
          m("input.input[placeholder=instruction]", {
            oninput: function (e) { DeliveriesController.newDelivery.instruction = e.target.value },
            value: DeliveriesController.newDelivery.instruction
          })]),
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "Card Number"),
          m("input.input[placeholder=Card Number]", {
            oninput: function (e) { DeliveriesController.newDelivery.cardNumber = e.target.value },
            value: DeliveriesController.newDelivery.cardNumber
          })]),
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "Card Holder"),
          m("input.input[placeholder=Card Holder]", {
            oninput: function (e) { DeliveriesController.newDelivery.cardHolder = e.target.value },
            value: DeliveriesController.newDelivery.cardHolder
          })]),
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "Security Digits"),
          m("input.input[placeholder=Security Digits]", {
            oninput: function (e) { DeliveriesController.newDelivery.securityDigits = e.target.value },
            value: DeliveriesController.newDelivery.securityDigits
          })]),
          m("div", {
            class: "pure-control-group"
          }, [m("label.label", "Expiration Date"),
          m("input.input[placeholder=Expiration Date]", {
            oninput: function (e) { DeliveriesController.newDelivery.expirationDate = e.target.value },
            value: DeliveriesController.newDelivery.expirationDate
          })]),
          m("div", {
            class: "pure-control-group"
          }, m("button.button[type=submit]", {class: "pure-controls pure-button button-secondary"}, "Place Order")),
          m("div", {
            class: "pure-control-group"
          }, m("button.button[type=submit]", {
            class: "pure-controls pure-button button-secondary",
            onclick: function (e) {
              m.mount(document.getElementById("main"), ShoppingCartView);
            }
          }, "Back to edit"))
        ])
      ])
    ];
  }
};

var OrderReceivedView = {
  title: "Order Recevied",
  oninit: function () {
    return "dummy"
  },
  view: function () {
    return [
      m("div", { class: "header" }, [
        m("h1", "Mockery Shopping Cart"),
        m("h2", "Your order " + DeliveriesController.delivery.id + " has been received!"),
        m("button.button[type=submit]", {
          class: "pure-controls pure-button pure-button-primary",
          onclick: function (e) {
            //m.mount(document.getElementById("main"), RestaurantView);
            m.route.set("/restaurants");
          }
        }, "Get More Food")
      ])
    ];
  }
};

var ShoppingCartView = {
  title: "ShoppingCart",
  oninit: async function () {
    if (CustomerViewController.cur_customer == null) {
      alert("Please Sign In/Sign Up first.");  
      m.route.set("/customer");   //  m.mount(document.getElementById("main"), CustomerSignInView);
    }
    return await ShoppingCartsViewController.loadShoppingCart(CustomerViewController.cur_customer.shoppingCartId)
  },
  view: function () {
    return [
      m("div", { class: "header" }, [
        m("h1", "Shopping Cart")
      ]),
      m(
        "div",
        { class: "content" },

        //m("h3", "ShoppingCart " + ShoppingCartsViewController.cart[0].id),

        _make_shoppingCartItem_rows(ShoppingCartsViewController.cart.slice(1)),
        m("h3", "Total $ " + (ShoppingCartsViewController.cart.slice(0).totalPrice / 100)),  
        m(
          "button",
          {
            class: "button-error pure-button",
            onclick: function() {
              m.mount(document.getElementById("main"), CheckoutView);
    
            }
          },
          "check out",
        )
      )
    ];
  }
};

var RestaurantView = {
  title: "Restaurant",
  oninit: function () {
    return RestaurantViewController.loadRestaurants();
  },

  view: function () {
    return [
      m(
        "div",
        { class: "restaurant-banner" },
        m("h1", { class: "restaurant-banner-head" }, "")
      ),
      m("div", { class: "container" },
        m("div", { class: "row" },
          m("div", { class: "col-md-12" },
            m("div", { class: "section-heading" }, m("h2", "Local Restaurants"))
          ),
          m(
            "div",
            { class: "content" },
            _make_restaurant_rows(RestaurantViewController.list)
          )
        )
      )]
  }
};

var FoodsView = {
  view: function (vnode) {
    RestaurantViewController.loadFoods(vnode.attrs.id);
    return [
      m(
        "div",
        { class: "restaurant-banner" },
        m("h1", { class: "restaurant-banner-head" }, "")
      ),
      m("div", { class: "container" },
        m("div", { class: "row" },
          m("div", { class: "col-md-12" },
            m("div", { class: "section-heading" }, m("h2", "  "))
          ),

          m(
            "div",
            { class: "content" },
            _make_menu_rows(RestaurantViewController.menus)
          )
        )
      )]
  }
};

var HomeView = {
  title: "Home",
  // oninit: function() {
  //   return "Test page";
  // },
  view: function () {
    return [
      m(
        "div",
        { class: "banner" },
        m("h1", { class: "banner-head" }, "We deliver the best food to you")
      ),
      m("div", { class: "container" },
        m("div", { class: "row" },
          m("div", { class: "col-md-12" },
            m("div", { class: "section-heading" }, m("h2", "Popular Restaurants"))
          ),

          m("div", { class: "col-md-4" },
            m("div", { class: "product-item" }, [
              m("a", { href: "#" }, m("img", { src: "assets/image/popular1.jpg" })),
              m("div", { class: "down-content" }, [
                m("a", { href: "#" }, m("h4", "Chipotle")),
                m("h6", "5 miles"),
                m("p", "Chipotle provides healthy food.")
              ])
            ])
          ),


          m("div", { class: "col-md-4" },
            m("div", { class: "product-item" }, [
              m("a", { href: "#" }, m("img", { src: "assets/image/popular2.jpg" })),
              m("div", { class: "down-content" }, [
                m("a", { href: "#" }, m("h4", "Panda Express")),
                m("h6", "12 miles"),
                m("p", "Panda provides healthy food.")
              ])
            ])),


          m("div", { class: "col-md-4" },
            m("div", { class: "product-item" }, [
              m("a", { href: "#" }, m("img", { src: "assets/image/popular3.jpg" })),
              m("div", { class: "down-content" }, [
                m("a", { href: "#" }, m("h4", "McDonald's")),
                m("h6", "5 miles"),
                m("p", "McDonald provides healthy food.")
              ])
            ])),
        )
      )]
  }
};

var customerName = "";
var password = "";
var email = "";
var phone = "";
var address = "";


function setCustomerName() {
  customerName = document.getElementById("name").value;
};
function setCustomerPassword() {
  password = document.getElementById("password").value;
};
function setEmail() {
  email = document.getElementById("email").value;
};
function setPhone() {
  phone = document.getElementById("phone").value;
};
function setAddress() {
  address = document.getElementById("address").value;
};


var CustomerCreationView = {
  customer: {},
  title: "Sign Up ",
  // oninit: function() {
  //     return CustomerViewController.loadCustomer(CustomerViewController.cur_customer)
  // },
  view: function () {
    return [
      m("body", { class: "templatemo-bg-image-1" },
        m("div", { class: "container" }, [

          m("div", { class: "form-horizontal templatemo-login-form-2"},
            m("div", { class: "row" },
              m("div", { class: "col-md-12" },
                m("div", { class: "col-md-12" },
                  m("h1", "Sign Up")
                )
              )
            ),

            m("div", { class: "row" },
              m("div", { class: "templatemo-one-signin col-md-6" },

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: signinCustomerName, class: "control-label" }, "UserName"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "name",
                        oninput: () => { setCustomerName() }
                      })
                    )
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: signinCustomerName, class: "control-label" }, "Password"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "password",
                        oninput: () => { setCustomerPassword() }
                      })
                    )
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: email, class: "control-label" }, "Email"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "email",
                        oninput: () => { setEmail() }
                      })
                    )
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: phone, class: "control-label" }, "Phone"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "phone",
                        oninput: () => { setPhone() }
                      })
                    )
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: address, class: "control-label" }, "Address"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "address",
                        oninput: () => { setAddress() }
                      })
                    )
                  )
                ),


                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m(
                      "button",
                      {
                        class: "btn btn-warning",
                        onclick: function () {
                            CustomerViewController.createCustomer(customerName, password, email, phone, address)
                            .then( () => {
                              if (CustomerViewController.cur_customer != null && CustomerViewController.cur_customer.id != null) // if new customer is not undefined, run
                                m.route.set("/restaurants");
                             })                            
                             .catch(() => {  
                              console.log("existing cus");            
                              alert("Duplicate username!");
                              });                     
                        }
                      },
                      "Sign Up",
                    )
                  )
                )
              )
            )
          )
        ]
        ),
      )];
  }
};

var signinCustomerName = "";
var signinPassword = "";
var customerToVerify = undefined;

function setSignInCustomerName() {
  signinCustomerName = document.getElementById("signinCustomerName").value;
};
function setSignInCustomerPassword() {
  signinPassword = document.getElementById("signinPassword").value;
};

var CustomerSignInView = {
  title: "SignIn ",
  // oninit: function() {
  //     return CustomerViewController.getCustomerByName(signinCustomerName)
  // },
  view: function () {
    return [
      m("body", { class: "templatemo-bg-image-1" },
        m("div", { class: "container" }, [

          m("div", { class: "form-horizontal templatemo-login-form-2" },
            m("div", { class: "row" },
              m("div", { class: "col-md-12" },
                m("div", { class: "col-md-12" },
                  m("h1", "Sign In")
                )
              )
            ),

            m("div", { class: "row" },
              m("div", { class: "templatemo-one-signin col-md-6" },
                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: signinCustomerName, class: "control-label" }, "UserName"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "fa fa-user" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "signinCustomerName",
                        oninput: () => { setSignInCustomerName() }
                      })
                    )
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("label", { for: signinPassword, class: "control-label" }, "Password"),
                    m("div", { class: "templatemo-input-icon-container" },
                      m("i", { class: "fa fa-lock" }),
                      m('input[type=text]', {
                        class: "form-control",
                        id: "signinPassword",
                        oninput: () => { setSignInCustomerPassword() }
                      })
                    )
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m("input[type=submit]", {
                      value: "Sign In", class: "btn btn-warning",
                      onclick: async function () {
                        customerToVerify = await CustomerViewController.getCustomerByName(signinCustomerName)
                          .catch(() => {
                            alert("catch exception: user doesn't exist!");
                          });
                        if (customerToVerify == null) {
                          console.log("user doesn't exist!");
                        } else {
                          if (customerToVerify.password == signinPassword) {
                            CustomerViewController.cur_customer = customerToVerify
                           m.route.set("/restaurants");
                          }
                          else {
                            alert("wrong password!");
                          }
                        }
                      }
                    })
                  )
                ),

                m("div", { class: "form-group" },
                  m("div", { class: "col-md-12" },
                    m(
                      "button",
                      {
                        class: "btn btn-warning",
                        onclick: function () {                         
                        m.route.set("/customer/signup");
                        }
                      },
                      "New User - Sign Up Here",
                    )
                  )
                ),
              )
            )
          )
        ]
        )
      )
    ];
  }
};

// End Views

function _make_shoppingCart_rows(cart_list) {
  return m("div", { class: "pure-g" }, cart_list.map(_show_shoppingCart_details));
}

function _make_shoppingCartItem_rows(foods) {
  return m("h4", {align: "center"}, foods.map(_show_food_details));
}

function _show_food_details(food) {
  console.log("food here");
  console.log(food);
  return [
  m(
      "table",
      { width: "850px", cellspacing:"0", cellpadding:"10", align: "center"},
      [
        m("tbody", {}, [
          m("tr", {}, [
            m("td", {width: "100"}, m("img", { src: "assets/image/" + food.img, width: '90', height: '90'}, food.name)),
            m("td", {width: "250"}, m("h4", food.name)),
            m("td", {width: "100"}, m("h4", "$" + food.price / 100)),
            m("td", {width: "100"}, m("h4", "Qty:" + ShoppingCartsViewController.foodsQuantity.get(food.id))),
            m("td", {width: "300"}, [ m("button", {
              class: "button-add pure-button ",
              display: "inline-block",
              onclick: function() {
                ShoppingCartsViewController.addItem(ShoppingCartsViewController.cart[0].id, food.id);
              }
            }, "+"), 
            m("button", {
              class: "button-add pure-button",
              display: "inline-block",
              onclick: function() {
                ShoppingCartsViewController.deleteItem(ShoppingCartsViewController.cart[0].id, food.id)
              }
            }, "-")
          ])     
          ])
        ])
      ]
    )
    
  ];
}


function _make_restaurant_rows(restaurant_list) {
  return m("div", restaurant_list.map(_show_restaurant_details))
}

function _show_restaurant_details(restaurant) {
  const newLocal = "assets/image/" + restaurant.img;
  return [
    m("div", { class: "col-md-4" },
      m("div", { class: "product-item" }, [
        m("a", { href: "#/restaurant/" + restaurant.id },
          m("img", { src: newLocal })),
        m("div", { class: "down-content" }, [
          m("a", { href: "#" }, m("h4", restaurant.name)),
          m("h6", "5 miles"),,
          m("p", "Rating: " + restaurant.rating),
        ])
      ])
    ),
  ];
}

function _make_menu_rows(food_list) {
  return m("div", food_list.map(_show_menu_details));
}

function _show_menu_details(food) {
  return [
    m("div", { class: "col-md-4" },
      m("div", { class: "product-item" }, [
        m("a", { href: "#" }, m("img", { src: "assets/image/" + food.img})),
        m("div", { class: "down-content" }, [
          m("a", { href: "#" }, m("h4", food.name)),
          m("h6", "$" + food.price / 100),
          m("p", "Description:" + food.description),
          m("button", {
            class: "button-choose pure-button",
            onclick: function (){
            console.log(CustomerViewController.cur_customer);
              ShoppingCartsViewController.addItem(CustomerViewController.cur_customer.shoppingCartId, food.id);
              alert("Your food has been added!");
            }
          }, "add")
        ])
      ])
    ),
  ];
}

// End ViewControllers
var content = document.getElementById("main");

var views = {
  "/home": HomeView,
  "/shoppingCarts": ShoppingCartView,
  "/restaurants": RestaurantView,
  "/customer": CustomerSignInView,
  "/customer/signup": CustomerCreationView,
  "/restaurant/:id": FoodsView,
};

m.route(content, "/home", views);

var menu = document.getElementById("menu"),
  menuLink = document.getElementById("menuLink");

function toggleClass(element, className) {
  var classes = element.className.split(/\s+/),
    length = classes.length,
    i = 0;

  for (; i < length; i++) {
    if (classes[i] === className) {
      classes.splice(i, 1);
      break;
    }
  }
  // The className is not found
  if (length === classes.length) {
    classes.push(className);
  }

  element.className = classes.join(" ");
}


var MenuView = {
  view: function () {
    return Object.entries(views).map(entry => {
      let route = entry[0];
      let view = entry[1];
      let title = view.title;
      let clazz = "pure-menu-item";
      if (route == m.route.get()) {
        console.log("Selected ", route);
        clazz += " pure-menu-selected";
      }
      return m(
        "li",
        { class: clazz },
        m(
          m.route.Link,
          { href: route, class: "pure-menu-link" },
          title
        )
      );
    });
  }
}

m.mount(document.getElementById("menuList"), MenuView);
