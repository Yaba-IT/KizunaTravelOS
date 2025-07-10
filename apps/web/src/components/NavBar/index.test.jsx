import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import NavBtn from ".";

describe('NavBar', () => {
    afterEach(cleanup);
    it('renders the NavBar with NavBtn', () => {
        render(<NavBtn />);
        const appBar = screen.getByTestId('app-bar');
        expect(appBar).toBeInTheDocument();
        const button = screen.getByRole("button", { name: "Home" });
        expect(button).toBeInTheDocument();
    });
});
