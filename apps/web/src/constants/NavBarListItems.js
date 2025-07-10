export const NavBarListItems = [
  {
    name: "Home",
    target: "/",
    sub: null
  },
  {
    name: "Product",
    target: "product",
    sub: [
      {
        name: "blog",
        target: "/product/blog"
      }
    ]
  },
  {
    name: "Service",
    target: "service",
    sub: [
      {
        name: "cloud",
        target: "/product/cloud"
      }
    ]
  },
  {
    name: "Contact us",
    target: "contactUs",
    sub: null
  },
]