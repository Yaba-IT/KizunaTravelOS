import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import NavBar from ".";

jest.mock('../../assets/img/logo.png', () => 'logo.png');

const links = [
    { name: "Home", sub: null },
    { name: "Service", sub: [{ name: "cloud" }] },
    { name: "Contact us", sub: null },
];
describe('NavBar', () => {
    afterEach(cleanup);
    it('renders the NavBar with NavBtn', () => {
        render(<NavBar links={links} />);
        const appBar = screen.getByTestId('app-bar');
        expect(appBar).toBeInTheDocument();
        const button = screen.getByRole("button", { name: "Home" });
        expect(button).toBeInTheDocument();
    });
});
