import React from "react";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import NavBtnItem from ".";


describe("NavBtnItem", () => {
	afterEach(cleanup);

	it("renders a button with the correct text", () => {
		render(<NavBtnItem name={"Home"} target={"/path/to/xyz"} sub={[{name:"subHome", target: "subtarget"}]} />);
		const button = screen.getByText("Home");
		expect(button).toBeInTheDocument();
	});

	// it("renders a button with a sub-menu when sub-items are present", () => {
	// 	render(<NavBtnItem name={elements.name} target={elements.target} sub={elements.sub} />);
	// 	const button = screen.getByRole("button", { name: element.name });
	// 	expect(button).toBeInTheDocument();
	// });

	// it("does not render a sub-menu when no sub-items are present", () => {
	// 	render(<NavBtnItem name={elements.name} target={elements.target} sub={elements.sub} />);
	// 	const subMenu = screen.queryByRole("menu");
	// 	expect(subMenu).not.toBeInTheDocument();
	// });

	// it("render a sub-menu when sub-items are present", () => {
	// 	render(<NavBtnItem name={elements.name} target={elements.target} sub={elements.sub} />);
	// 	const subMenuBtn = screen.getByTestId("btn-menu");
	// 	expect(subMenuBtn).toBeInTheDocument();
	// });

	// it("toggles the sub-menu visibility when the button is clicked", () => {
	// 	render(<NavBtnItem name={elements.name} target={elements.target} sub={elements.sub} />);
	// 	const subMenuBtn = screen.getByTestId("btn-menu");
	// 	fireEvent.click(subMenuBtn);
	// 	const subMenu = screen.getByRole("menu");
	// 	expect(subMenu).toBeVisible();
	// });
});