import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import NavBtnList from ".";

const lists = [
  { name: "Home", sub: null },
  { name: "Service", sub: [{ name: "cloud" }] },
  { name: "Contact us", sub: null },
];

describe("NavBtnList", () => {
  afterEach(cleanup);
  it("renders a list with the correct items", () => {
    render(<NavBtnList lists={lists} />);
    const listItems = screen.getAllByTestId("list-item");
    expect(listItems).toHaveLength(lists.length);
    lists.forEach((list, index) => {
      const listItem = screen.getByText(list.name);
      expect(listItem).toBeInTheDocument();
    });
  });

});