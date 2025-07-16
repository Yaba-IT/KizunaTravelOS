import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import NavBtn from ".";
import NavBtnList from "../NavBtnList";
import NavBtnItem from "../NavBtnItem";

const element = [{ name: "Home", sub: null }];
describe("NavBtn", () => {
    afterEach(cleanup);

    it("renders a button with the correct text", () => {
        render(<NavBtn />);
        const button = screen.getByRole("button", { name: "Home" });
        expect(button).toBeInTheDocument();
    });

});