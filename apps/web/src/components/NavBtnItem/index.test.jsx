import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import NavBtnItem from ".";


describe("NavBtnItem", () => {
	afterEach(cleanup);

	it("renders a button with the correct text", () => {
		render(<NavBtnItem name={"Home"} target={"/path/to/xyz"} sub={[{name:"subHome", target: "subtarget"}]} />);
		const button = screen.getByText("Home");
		expect(button).toBeInTheDocument();
	});
});