export const NavBarListItems = [
  {
    name: "Home",
    target: "/",
    sub: null
  },
  {
    name: "Product",
    target: "/products",
    sub: [
      {
        name: "blog",
        target: "/products/blog"
      }
    ]
  },
  {
    name: "Service",
    target: "http://service.com",
    sub: [
      {
        name: "cloud",
        target: "/service/cloud"
      }
    ]
  },
  {
    name: "Contact us",
    target: "/contact",
    sub: null
  },
]